import { sqliteTable, text, real, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

const now = sql`(unixepoch() * 1000)`;

export const vendors = sqliteTable(
	'vendors',
	{
		id: text('id').primaryKey(), // crypto.randomUUID()
		email: text('email').notNull().unique(), // siempre normalizado a minúsculas antes de insertar/buscar
		passwordHash: text('password_hash').notNull(),
		slug: text('slug').notNull().unique(), // /v/<slug>
		storeName: text('store_name').notNull(),
		whatsapp: text('whatsapp'),
		bio: text('bio'), // presentación de la portada
		coverImageUrl: text('cover_image_url'),
		commissionPercent: real('commission_percent').notNull().default(20),
		status: text('status', { enum: ['approved', 'suspended'] })
			.notNull()
			.default('approved'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(now)
	},
	(t) => [index('idx_vendors_status').on(t.status)]
);

export const sessions = sqliteTable(
	'sessions',
	{
		id: text('id').primaryKey(), // sha256(token) en hex — el token nunca toca la BD
		vendorId: text('vendor_id')
			.notNull()
			.references(() => vendors.id, { onDelete: 'cascade' }),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now)
	},
	(t) => [
		index('idx_sessions_vendor').on(t.vendorId),
		index('idx_sessions_expires').on(t.expiresAt)
	]
);

// Token de "olvidé mi contraseña" — igual que `sessions`, solo se guarda el
// hash (nunca el token real) y expira rápido (1 hora, ver passwordReset.ts).
export const passwordResetTokens = sqliteTable(
	'password_reset_tokens',
	{
		id: text('id').primaryKey(), // sha256(token) en hex
		vendorId: text('vendor_id')
			.notNull()
			.references(() => vendors.id, { onDelete: 'cascade' }),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now)
	},
	(t) => [index('idx_password_reset_tokens_vendor').on(t.vendorId)]
);

// Puente entre el widget de Wompi (que solo recibe reference + monto) y el
// carrito real: el webhook necesita reconstruir la orden de WooCommerce sin
// depender de nada que viva únicamente en localStorage del cliente.
export const pendingCheckouts = sqliteTable(
	'pending_checkouts',
	{
		reference: text('reference').primaryKey(),
		vendorSlug: text('vendor_slug'),
		cartJson: text('cart_json').notNull(),
		customerJson: text('customer_json').notNull(),
		amountInCents: integer('amount_in_cents').notNull(),
		// 'processing' = un webhook ya reclamó esta fila y está creando la orden
		// en WooCommerce — evita que un reintento concurrente de Wompi cree un
		// segundo pedido para el mismo pago (ver claimPendingCheckout()).
		status: text('status', { enum: ['pending', 'processing', 'approved', 'declined'] })
			.notNull()
			.default('pending'),
		wooOrderId: integer('woo_order_id'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(now),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(now)
	},
	(t) => [index('idx_pending_checkouts_status').on(t.status)]
);

// Solo se guardan las prendas con personalización; el resto usa vendors.commissionPercent.
export const vendorProducts = sqliteTable(
	'vendor_products',
	{
		vendorId: text('vendor_id')
			.notNull()
			.references(() => vendors.id, { onDelete: 'cascade' }),
		productId: text('product_id').notNull(), // = Product.id = slug de WooCommerce
		commissionPercent: real('commission_percent'), // null = usa el % global del vendedor
		hidden: integer('hidden', { mode: 'boolean' }).notNull().default(false),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' }).notNull().default(now)
	},
	(t) => [primaryKey({ columns: [t.vendorId, t.productId] })]
);
