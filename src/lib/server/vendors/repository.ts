import { randomUUID } from 'node:crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { vendors, vendorProducts } from '$lib/server/db/schema';
import type { SafeVendor } from '$lib/vendors/model/vendor';

function toSafeVendor(vendor: typeof vendors.$inferSelect): SafeVendor {
	return {
		id: vendor.id,
		email: vendor.email,
		slug: vendor.slug,
		storeName: vendor.storeName,
		whatsapp: vendor.whatsapp,
		bio: vendor.bio,
		coverImageUrl: vendor.coverImageUrl,
		commissionPercent: vendor.commissionPercent,
		status: vendor.status
	};
}

export interface RegisterVendorInput {
	email: string;
	passwordHash: string;
	slug: string;
	storeName: string;
}

export async function createVendor(input: RegisterVendorInput): Promise<SafeVendor> {
	const vendor = {
		id: randomUUID(),
		email: input.email,
		passwordHash: input.passwordHash,
		slug: input.slug,
		storeName: input.storeName
	};
	await db.insert(vendors).values(vendor);
	const created = await getVendorById(vendor.id);
	if (!created) throw new Error('No se pudo crear el vendedor');
	return created;
}

// Incluye el hash — solo para uso interno del flujo de login.
export async function findVendorForLogin(
	email: string
): Promise<typeof vendors.$inferSelect | null> {
	const rows = await db.select().from(vendors).where(eq(vendors.email, email)).limit(1);
	return rows[0] ?? null;
}

export async function getVendorById(id: string): Promise<SafeVendor | null> {
	const rows = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
	return rows[0] ? toSafeVendor(rows[0]) : null;
}

export async function getVendorBySlug(slug: string): Promise<SafeVendor | null> {
	const rows = await db.select().from(vendors).where(eq(vendors.slug, slug)).limit(1);
	return rows[0] ? toSafeVendor(rows[0]) : null;
}

export async function getApprovedVendorBySlug(slug: string): Promise<SafeVendor | null> {
	const vendor = await getVendorBySlug(slug);
	return vendor && vendor.status === 'approved' ? vendor : null;
}

export interface VendorSettingsInput {
	storeName?: string;
	slug?: string;
	whatsapp?: string | null;
	bio?: string | null;
	coverImageUrl?: string | null;
	commissionPercent?: number;
}

export async function updateVendorSettings(
	vendorId: string,
	input: VendorSettingsInput
): Promise<void> {
	await db
		.update(vendors)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(vendors.id, vendorId));
}

export async function updateVendorPassword(vendorId: string, passwordHash: string): Promise<void> {
	await db.update(vendors).set({ passwordHash, updatedAt: new Date() }).where(eq(vendors.id, vendorId));
}

export async function setVendorStatus(
	vendorId: string,
	status: 'approved' | 'suspended'
): Promise<void> {
	await db.update(vendors).set({ status, updatedAt: new Date() }).where(eq(vendors.id, vendorId));
}

// --------------------------------------------------- comisiones por prenda

export interface ProductCommissionRow {
	productId: string;
	commissionPercent: number | null;
	hidden: boolean;
}

export async function getVendorProductOverrides(vendorId: string): Promise<ProductCommissionRow[]> {
	const rows = await db
		.select({
			productId: vendorProducts.productId,
			commissionPercent: vendorProducts.commissionPercent,
			hidden: vendorProducts.hidden
		})
		.from(vendorProducts)
		.where(eq(vendorProducts.vendorId, vendorId));
	return rows;
}

export async function upsertVendorProduct(
	vendorId: string,
	productId: string,
	values: { commissionPercent: number | null; hidden: boolean }
): Promise<void> {
	const existing = await db
		.select({ vendorId: vendorProducts.vendorId })
		.from(vendorProducts)
		.where(and(eq(vendorProducts.vendorId, vendorId), eq(vendorProducts.productId, productId)))
		.limit(1);

	if (existing.length) {
		await db
			.update(vendorProducts)
			.set({ ...values, updatedAt: new Date() })
			.where(and(eq(vendorProducts.vendorId, vendorId), eq(vendorProducts.productId, productId)));
	} else {
		await db.insert(vendorProducts).values({ vendorId, productId, ...values });
	}
}

export async function deleteVendorProduct(vendorId: string, productId: string): Promise<void> {
	await db
		.delete(vendorProducts)
		.where(and(eq(vendorProducts.vendorId, vendorId), eq(vendorProducts.productId, productId)));
}

// -------------------------------------------------------------- utilidades

const RESERVED_SLUGS = new Set([
	'admin',
	'panel',
	'api',
	'v',
	'productos',
	'carrito',
	'contacto',
	'faqs',
	'vendedores',
	'acerca-de-mi'
]);

export function isReservedSlug(slug: string): boolean {
	return RESERVED_SLUGS.has(slug);
}

// El mensaje real "UNIQUE constraint failed: vendors.email" no está en el
// error de más afuera — Drizzle envuelve el error del driver en
// `DrizzleQueryError`, y libsql envuelve el suyo en `LibsqlError` →
// `ResponseError`, cada uno con su propio `.message` genérico y el texto real
// solo visible varios niveles abajo en la cadena de `.cause`. Se recorre esa
// cadena en vez de mirar solo el mensaje del error recibido.
export function parseUniqueViolation(err: unknown): 'email' | 'slug' | null {
	let current: unknown = err;
	while (current) {
		const message = current instanceof Error ? current.message : String(current);
		if (message.includes('UNIQUE constraint failed')) {
			if (message.includes('vendors.email')) return 'email';
			if (message.includes('vendors.slug')) return 'slug';
			return null;
		}
		current = current instanceof Error ? current.cause : undefined;
	}
	return null;
}
