import { eq } from 'drizzle-orm';
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

export interface PendingCheckout {
	reference: string;
	vendorSlug: string | null;
	items: CartItem[];
	customer: CheckoutCustomer;
	amountInCents: number;
	status: 'pending' | 'approved' | 'declined';
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

// El webhook de Wompi puede reintentar el mismo evento — marcar el estado
// junto con el id del pedido evita crear un segundo pedido en WooCommerce.
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
