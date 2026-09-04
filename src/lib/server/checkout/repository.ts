import { eq, and } from 'drizzle-orm';
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
// UPDATE condicionado a status='pending' es la única fuente de verdad sobre
// quién "gana" el reintento: solo una llamada concurrente puede pasar de
// pending a processing (rowsAffected === 1 para ella, 0 para las demás), así
// que solo una crea el pedido en WooCommerce.
export async function claimPendingCheckout(reference: string): Promise<boolean> {
	const result = await db
		.update(pendingCheckouts)
		.set({ status: 'processing', updatedAt: new Date() })
		.where(and(eq(pendingCheckouts.reference, reference), eq(pendingCheckouts.status, 'pending')));
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
