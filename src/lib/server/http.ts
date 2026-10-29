/**
 * Caché en la red de Vercel para las páginas públicas de la tienda (catálogo,
 * fichas, inicio, FAQ). Armarlas exige consultar WordPress, que en el hosting
 * compartido tarda segundos; con esto el visitante recibe la copia de la red al
 * instante:
 * - `s-maxage=60`: durante 1 minuto se sirve sin tocar el servidor.
 * - `stale-while-revalidate=600`: hasta 10 min después se sigue sirviendo la
 *   copia mientras Vercel la renueva por detrás — nadie espera la renovación.
 *
 * Solo para páginas que NO dependen de quién visita (no usan sesión ni
 * cookies). El stock y el precio que se cobran se validan siempre en vivo en
 * el checkout, así que un minuto de desfase en lo que se muestra no vende de más.
 */
export const PUBLIC_PAGE_CACHE = { 'cache-control': 'public, s-maxage=60, stale-while-revalidate=600' };
