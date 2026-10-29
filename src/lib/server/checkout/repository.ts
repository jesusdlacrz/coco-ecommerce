import { eq, and, or, gt, gte, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { pendingCheckouts } from '$lib/server/db/schema';
import type { CartItem } from '$lib/shared/model/products';

export interface CheckoutCustomer {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	addressComplement: string;
	dwellingType: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
}

export interface CreatePendingCheckoutInput {
	reference: string;
	vendorSlug: string | null;
	items: CartItem[];
	customer: CheckoutCustomer;
	amountInCents: number;
}

export async function createPendingCheckout(input: CreatePendingCheckoutInput): Promise<void> {
	await db.insert(pendingCheckouts).values({
		reference: input.reference,
		vendorSlug: input.vendorSlug,
		cartJson: JSON.stringify(input.items),
		customerJson: JSON.stringify(input.customer),
		amountInCents: input.amountInCents
	});
}

/**
 * Cuánto tiempo quedan apartadas las unidades de un pago iniciado y sin
 * resolver. Cubre de sobra el tiempo normal de pagar en Wompi; si el cliente
 * abandona, se liberan solas al vencer (no hay que limpiar nada).
 */
export const RESERVATION_MS = 30 * 60_000;

/** Clave de una talla/color concreta de un producto, para sumar reservas. */
export const stockKey = (productId: string, size: string | null, color: string | null) =>
	`${productId}|${size ?? ''}|${color ?? ''}`;

/**
 * Unidades apartadas por pagos en curso: iniciados hace menos de
 * RESERVATION_MS y todavía sin resolver ('pending', o 'processing' mientras se
 * crea el pedido). Los aprobados ya descontaron el stock en WooCommerce, así
 * que no se cuentan dos veces.
 */
export async function getReservedQuantities({
	excludeEmail,
	approvedSince
}: {
	excludeEmail?: string;
	/**
	 * Cuenta también los pagos APROBADOS desde este instante: su pedido puede
	 * no estar reflejado todavía en el stock que se leyó de WordPress justo
	 * antes (ver checkout/start), y sin esto esas unidades se ofrecerían dos veces.
	 */
	approvedSince?: number;
} = {}): Promise<Map<string, number>> {
	// Los pagos en curso del MISMO comprador no le cuentan: si abandonó un
	// intento y vuelve a pagar, sus propias unidades apartadas no lo bloquean.
	const ownEmail = excludeEmail?.trim().toLowerCase();
	const inProgress = and(
		inArray(pendingCheckouts.status, ['pending', 'processing']),
		gt(pendingCheckouts.createdAt, new Date(Date.now() - RESERVATION_MS))
	);
	const rows = await db
		.select({ cartJson: pendingCheckouts.cartJson, customerJson: pendingCheckouts.customerJson })
		.from(pendingCheckouts)
		.where(
			approvedSince === undefined
				? inProgress
				: or(
						inProgress,
						and(
							eq(pendingCheckouts.status, 'approved'),
							gte(pendingCheckouts.updatedAt, new Date(approvedSince))
						)
					)
		);
	const reserved = new Map<string, number>();
	for (const row of rows) {
		if (ownEmail) {
			const email = (JSON.parse(row.customerJson) as CheckoutCustomer).email?.trim().toLowerCase();
			if (email === ownEmail) continue;
		}
		for (const item of JSON.parse(row.cartJson) as CartItem[]) {
			const key = stockKey(item.productId, item.size, item.color);
			reserved.set(key, (reserved.get(key) ?? 0) + item.quantity);
		}
	}
	return reserved;
}

export type CheckoutStatus = 'pending' | 'processing' | 'approved' | 'declined';

export interface PendingCheckout {
	reference: string;
	vendorSlug: string | null;
	items: CartItem[];
	customer: CheckoutCustomer;
	amountInCents: number;
	status: CheckoutStatus;
	wooOrderId: number | null;
}

export async function getPendingCheckout(reference: string): Promise<PendingCheckout | null> {
	const rows = await db
		.select()
		.from(pendingCheckouts)
		.where(eq(pendingCheckouts.reference, reference))
		.limit(1);
	const row = rows[0];
	if (!row) return null;
	return {
		reference: row.reference,
		vendorSlug: row.vendorSlug,
		items: JSON.parse(row.cartJson) as CartItem[],
		customer: JSON.parse(row.customerJson) as CheckoutCustomer,
		amountInCents: row.amountInCents,
		status: row.status,
		wooOrderId: row.wooOrderId
	};
}

// El webhook de Wompi puede reintentar el mismo evento en paralelo — este
// UPDATE condicionado al estado es la única fuente de verdad sobre quién
// "gana": solo una llamada concurrente puede pasar a processing
// (rowsAffected === 1 para ella, 0 para las demás), así que solo una crea el
// pedido en WooCommerce.
//
// 'declined' también se puede reclamar: Wompi deja reintentar el pago con
// otro medio durante unos minutos usando la MISMA referencia, así que a un
// intento rechazado le puede seguir uno aprobado que sí debe crear el pedido.
export async function claimPendingCheckout(reference: string): Promise<boolean> {
	const result = await db
		.update(pendingCheckouts)
		.set({ status: 'processing', updatedAt: new Date() })
		.where(
			and(
				eq(pendingCheckouts.reference, reference),
				inArray(pendingCheckouts.status, ['pending', 'declined'])
			)
		);
	return result.rowsAffected === 1;
}

// Si crear el pedido en WooCommerce falla, se libera la fila de vuelta a
// "pending" para que el próximo reintento de Wompi pueda reclamarla otra vez.
export async function releasePendingCheckout(reference: string): Promise<void> {
	await db
		.update(pendingCheckouts)
		.set({ status: 'pending', updatedAt: new Date() })
		.where(eq(pendingCheckouts.reference, reference));
}

export async function markCheckoutResolved(
	reference: string,
	status: 'approved' | 'declined',
	wooOrderId: number | null
): Promise<void> {
	await db
		.update(pendingCheckouts)
		.set({ status, wooOrderId, updatedAt: new Date() })
		.where(eq(pendingCheckouts.reference, reference));
}
