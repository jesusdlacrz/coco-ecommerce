/**
 * Desenrolla la cadena de `cause` de un error (p. ej. "fetch failed" de Node
 * oculta el motivo real ahí) para poder loguear el problema de verdad.
 */
export function describeError(err: unknown): string {
	if (!(err instanceof Error)) return String(err);
	const parts: string[] = [err.message];
	let cause: unknown = (err as { cause?: unknown }).cause;
	while (cause instanceof Error) {
		const code = (cause as { code?: string }).code;
		parts.push(code ? `${cause.message} [${code}]` : cause.message);
		cause = (cause as { cause?: unknown }).cause;
	}
	return parts.join(' → ');
}
