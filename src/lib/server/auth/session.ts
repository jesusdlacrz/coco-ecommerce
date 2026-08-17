import { randomBytes, createHash } from 'node:crypto';
import { eq, lt } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { sessions, vendors } from '$lib/server/db/schema';
import type { SafeVendor } from '$lib/vendors/model/vendor';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días
const RENEW_WHEN_UNDER_MS = 15 * 24 * 60 * 60 * 1000; // renovar si queda menos de 15 días

export function generateSessionToken(): string {
	return randomBytes(32).toString('base64url');
}

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

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

export async function createSession(vendorId: string): Promise<{ token: string; expiresAt: Date }> {
	const token = generateSessionToken();
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
	await db.insert(sessions).values({ id: hashToken(token), vendorId, expiresAt });

	// Limpieza oportunista de sesiones vencidas — sin cron aparte.
	if (Math.random() < 0.001) {
		await purgeExpiredSessions();
	}

	return { token, expiresAt };
}

export async function validateSessionToken(
	token: string
): Promise<{ vendor: SafeVendor; expiresAt: Date; renewed: boolean } | null> {
	const id = hashToken(token);
	// Dos consultas de una sola tabla en vez de un JOIN: node:sqlite/bun:sqlite
	// devuelven filas como objetos por nombre de columna, y "id"/"created_at"
	// existen en ambas tablas — un JOIN colisionaría esas claves y corrompería
	// el mapeo posicional que espera drizzle.
	const sessionRows = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1);
	const session = sessionRows[0];
	if (!session) return null;

	if (Date.now() >= session.expiresAt.getTime()) {
		await db.delete(sessions).where(eq(sessions.id, id));
		return null;
	}

	const vendorRows = await db
		.select()
		.from(vendors)
		.where(eq(vendors.id, session.vendorId))
		.limit(1);
	const vendor = vendorRows[0];
	if (!vendor) return null;

	let expiresAt = session.expiresAt;
	let renewed = false;
	if (expiresAt.getTime() - Date.now() < RENEW_WHEN_UNDER_MS) {
		expiresAt = new Date(Date.now() + SESSION_TTL_MS);
		await db.update(sessions).set({ expiresAt }).where(eq(sessions.id, id));
		renewed = true;
	}

	return { vendor: toSafeVendor(vendor), expiresAt, renewed };
}

export async function invalidateSession(token: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
}

export async function invalidateVendorSessions(vendorId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.vendorId, vendorId));
}

export async function purgeExpiredSessions(): Promise<void> {
	await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
