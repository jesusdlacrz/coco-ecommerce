export type VendorStatus = 'approved' | 'suspended';

// Vendedor sin el hash de contraseña — lo único que puede viajar a $app/state
// o serializarse en `event.locals`.
export interface SafeVendor {
	id: string;
	email: string;
	slug: string;
	storeName: string;
	whatsapp: string | null;
	bio: string | null;
	coverImageUrl: string | null;
	commissionPercent: number;
	status: VendorStatus;
}
