// Cliente del contenido editable del sitio (testimonios, galería de Instagram)
// gestionado desde una página de opciones de ACF en WordPress. Solo servidor.
// Ver WORDPRESS-SETUP.md para cómo crear esos campos.
import { env } from '$env/dynamic/private';
import { describeError } from '$lib/shared/utils/describeError';

export interface SiteTestimonial {
	name: string;
	role: string;
	quote: string;
	stars: number;
	photo: string | null;
}

export interface SiteInstagramImage {
	src: string | null;
	alt: string;
}

export interface SiteAboutSlide {
	heading: string;
	body: string[];
	image: string | null;
}

export interface SiteCopy {
	newArrivalsTitle: string;
	newArrivalsText: string;
	offerLine1: string;
	offerLine2: string;
	offerSubtitle: string;
}

export interface SiteHeroImages {
	left: string | null;
	center: string | null;
	right: string | null;
}

export interface SiteContent {
	testimonials: SiteTestimonial[];
	instagram: SiteInstagramImage[];
	about: SiteAboutSlide[];
	copy: SiteCopy | null;
	heroImages: SiteHeroImages | null;
}

interface RawTestimonial {
	name?: string;
	role?: string;
	quote?: string;
	stars?: number;
	photo?: string | null;
}

interface RawInstagramImage {
	src?: string | null;
	alt?: string;
}

interface RawAboutSlide {
	heading?: string;
	body?: string[];
	image?: string | null;
}

interface RawCopy {
	newArrivalsTitle?: string;
	newArrivalsText?: string;
	offerLine1?: string;
	offerLine2?: string;
	offerSubtitle?: string;
}

interface RawHeroImages {
	left?: string | null;
	center?: string | null;
	right?: string | null;
}

interface RawSiteContent {
	testimonials?: RawTestimonial[];
	instagram?: RawInstagramImage[];
	about?: RawAboutSlide[];
	copy?: RawCopy;
	heroImages?: RawHeroImages;
}

const REQUEST_TIMEOUT_MS = 30000;

function getBaseUrl(): string | null {
	const { WOO_API_URL } = env;
	return WOO_API_URL ? WOO_API_URL.replace(/\/$/, '') : null;
}

function toTestimonial(raw: RawTestimonial): SiteTestimonial {
	return {
		name: raw.name ?? '',
		role: raw.role ?? '',
		quote: raw.quote ?? '',
		stars: Number(raw.stars) || 5,
		photo: raw.photo ?? null
	};
}

function toInstagramImage(raw: RawInstagramImage): SiteInstagramImage {
	return { src: raw.src ?? null, alt: raw.alt ?? '' };
}

function toAboutSlide(raw: RawAboutSlide): SiteAboutSlide {
	return {
		heading: raw.heading ?? '',
		body: Array.isArray(raw.body) ? raw.body : [],
		image: raw.image ?? null
	};
}

function toCopy(raw: RawCopy | undefined): SiteCopy | null {
	if (!raw) return null;
	return {
		newArrivalsTitle: raw.newArrivalsTitle ?? '',
		newArrivalsText: raw.newArrivalsText ?? '',
		offerLine1: raw.offerLine1 ?? '',
		offerLine2: raw.offerLine2 ?? '',
		offerSubtitle: raw.offerSubtitle ?? ''
	};
}

function toHeroImages(raw: RawHeroImages | undefined): SiteHeroImages | null {
	if (!raw) return null;
	return {
		left: raw.left ?? null,
		center: raw.center ?? null,
		right: raw.right ?? null
	};
}

/**
 * Trae testimonios e imágenes de Instagram gestionados en WordPress. Si no está
 * configurado o la API falla, devuelve `null` para que cada componente use su
 * propio contenido de respaldo.
 */
export async function getSiteContent(fetchFn: typeof fetch = fetch): Promise<SiteContent | null> {
	const baseUrl = getBaseUrl();
	if (!baseUrl) return null;

	try {
		const res = await fetchFn(`${baseUrl}/wp-json/coco/v1/site-content`, {
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
		});
		if (!res.ok) {
			throw new Error(`site-content ${res.status}: ${await res.text()}`);
		}
		const raw = (await res.json()) as RawSiteContent;
		return {
			testimonials: (raw.testimonials ?? []).map(toTestimonial),
			instagram: (raw.instagram ?? []).map(toInstagramImage),
			about: (raw.about ?? []).map(toAboutSlide),
			copy: toCopy(raw.copy),
			heroImages: toHeroImages(raw.heroImages)
		};
	} catch (err) {
		console.error(`[site-content] Error al traer contenido del sitio (${describeError(err)}).`);
		return null;
	}
}
