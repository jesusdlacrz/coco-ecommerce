import { randomBytes, createHash } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db/client';
import { passwordResetTokens } from '$lib/server/db/schema';

// Corto a propósito — es un link que viaja por correo, no una sesión.
const RESET_TTL_MS = 60 * 60 * 1000; // 1 hora

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

// Igual que sessions.ts: solo se guarda el hash, el token real nunca toca la
// base de datos. Cualquier token anterior del vendedor se invalida — pedir
// un segundo link deja inservible al primero.
export async function createPasswordResetToken(
	vendorId: string
): Promise<{ token: string; expiresAt: Date }> {
	const token = randomBytes(32).toString('base64url');
	const expiresAt = new Date(Date.now() + RESET_TTL_MS);
	await db.delete(passwordResetTokens).where(eq(passwordResetTokens.vendorId, vendorId));
	await db.insert(passwordResetTokens).values({ id: hashToken(token), vendorId, expiresAt });
	return { token, expiresAt };
}

// Solo mira si el token es válido — no lo consume. Se usa para decidir si
// mostrar el formulario de nueva contraseña o un mensaje de "link inválido".
export async function getVendorIdForResetToken(token: string): Promise<string | null> {
	const rows = await db
		.select()
		.from(passwordResetTokens)
		.where(eq(passwordResetTokens.id, hashToken(token)))
		.limit(1);
	const row = rows[0];
	if (!row) return null;
	if (Date.now() >= row.expiresAt.getTime()) return null;
	return row.vendorId;
}

// Se borra al final del flujo (contraseña ya actualizada) para que el mismo
// link no pueda reutilizarse una segunda vez.
export async function deletePasswordResetToken(token: string): Promise<void> {
	await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, hashToken(token)));
}
