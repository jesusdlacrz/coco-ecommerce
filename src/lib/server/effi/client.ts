// Cliente de lectura de la API de Effi ERP (Integraciones → Documentación API
// dentro de Effi). Solo servidor: la API key da acceso a TODO el ERP de la
// clienta, incluida su contabilidad, así que nunca sale de aquí.
import { env } from '$env/dynamic/private';

const BASE_URL = 'https://effi.com.co/api';
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 3;

/** Campos de `GET api/articulo` que usa la tienda (la respuesta trae muchos más). */
export interface EffiArticle {
	id: string;
	url_foto: string | null;
	descripcion: string;
	referencia: string | null;
	tipo_articulo: string;
	nombre_categoria: string | null;
	ventas: string;
	precios_venta: string | null;
	gestion_stock: string;
	stock_empresa: string | null;
	vigente: string;
}

interface EffiListResponse<T> {
	ok: boolean;
	data: T[];
	paginacion: { pagina: number; por_pagina: number; total: number; total_paginas: number };
	mensaje?: string;
}

export class EffiNotConfiguredError extends Error {}

function apiKey(): string {
	const key = env.EFFI_API_KEY;
	if (!key) throw new EffiNotConfiguredError('EFFI_API_KEY no está configurada');
	return key;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function effiGet<T>(path: string, fetchFn: typeof fetch): Promise<EffiListResponse<T>> {
	for (let attempt = 0; ; attempt++) {
		const res = await fetchFn(`${BASE_URL}/${path}`, {
			headers: { Authorization: `Bearer ${apiKey()}` },
			signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
		});
		// 120 peticiones/minuto por API key: si se pasa, Effi dice cuánto esperar.
		if (res.status === 429 && attempt < MAX_RETRIES) {
			const wait = Number(res.headers.get('Retry-After')) || 5;
			await sleep(wait * 1000);
			continue;
		}
		const body = (await res.json().catch(() => null)) as EffiListResponse<T> | null;
		if (!res.ok || !body?.ok) {
			// 401 casi siempre es la API key vencida: dura 360 días y se renueva en
			// Effi → Administración → Usuarios → Ver más detalles → Renovar API Key.
			throw new Error(`Effi ${res.status}: ${body?.mensaje ?? 'respuesta inválida'}`);
		}
		return body;
	}
}

/** Todos los artículos vigentes de la empresa (Effi pagina de a 100). */
export async function fetchAllArticles(fetchFn: typeof fetch = fetch): Promise<EffiArticle[]> {
	const articles: EffiArticle[] = [];
	for (let page = 1; ; page++) {
		const res = await effiGet<EffiArticle>(`articulo?pagina=${page}&por_pagina=100`, fetchFn);
		articles.push(...res.data);
		if (page >= res.paginacion.total_paginas) return articles;
	}
}
