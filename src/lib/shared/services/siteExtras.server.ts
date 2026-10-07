// Contenido editable "extra" del sitio: textos de la franja de beneficios, el
// perfil de Instagram y las preguntas frecuentes. Sale de un endpoint aparte
// (`coco/v1/site-extras`) para no tener que tocar el de `site-content`, que ya
// estaba en producción. Solo servidor. Ver WORDPRESS-SETUP.md, Parte 5.
import { env } from '$env/dynamic/private';
import { describeError } from '$lib/shared/utils/describeError';

export interface SiteFeatureCopy {
	title: string;
	text: string;
}

export interface SiteInstagramProfile {
	handle: string;
	url: string;
	text: string;
}

export interface SiteFaq {
	question: string;
	answer: string;
}

export interface SiteExtras {
	/** Siempre 4, en el orden de la franja. Un campo vacío = usar el texto original. */
	features: SiteFeatureCopy[];
	instagram: SiteInstagramProfile;
	/** Vacío = usar las preguntas originales. */
	faqs: SiteFaq[];
}

interface RawSiteExtras {
	features?: Partial<SiteFeatureCopy>[];
	instagram?: Partial<SiteInstagramProfile>;
	faqs?: Partial<SiteFaq>[];
}

const REQUEST_TIMEOUT_MS = 30000;

/**
 * Trae el contenido extra gestionado en WordPress. Si no está configurado o
 * la API falla, devuelve `null` para que cada sección use su texto original.
 */
export async function getSiteExtras(fetchFn: typeof fetch = fetch): Promise<SiteExtras | null> {
	const { WOO_API_URL } = env;
	if (!WOO_API_URL) return null;

	try {
		const res = await fetchFn(`${WOO_API_URL.replace(/\/$/, '')}/wp-json/coco/v1/site-extras`, {
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
		});
		if (!res.ok) {
			throw new Error(`site-extras ${res.status}: ${await res.text()}`);
		}
		const raw = (await res.json()) as RawSiteExtras;
		return {
			features: (raw.features ?? []).map((f) => ({ title: f.title ?? '', text: f.text ?? '' })),
			instagram: {
				handle: raw.instagram?.handle ?? '',
				url: raw.instagram?.url ?? '',
				text: raw.instagram?.text ?? ''
			},
			faqs: (raw.faqs ?? [])
				.map((f) => ({ question: f.question ?? '', answer: f.answer ?? '' }))
				.filter((f) => f.question && f.answer)
		};
	} catch (err) {
		console.error(`[site-extras] Error al traer el contenido extra (${describeError(err)}).`);
		return null;
	}
}
