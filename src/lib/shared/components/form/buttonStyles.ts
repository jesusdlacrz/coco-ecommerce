export type ButtonVariant = 'primary' | 'secondary' | 'whatsapp' | 'text';
export type ButtonSize = 'sm' | 'md';

const VARIANT: Record<ButtonVariant, string> = {
	primary: 'bg-accent text-ink hover:bg-accent-hover disabled:hover:bg-accent',
	secondary: 'bg-ink text-white hover:bg-ink-hover disabled:hover:bg-ink',
	whatsapp: 'bg-whatsapp text-white hover:bg-whatsapp-hover disabled:hover:bg-whatsapp',
	text: 'bg-transparent text-ink hover:underline disabled:hover:no-underline'
};

const SIZE: Record<ButtonSize, string> = {
	sm: 'px-4 py-2 text-sm',
	md: 'px-6 py-3'
};

// rounded-xl es el radio de los CTA principales de producto y checkout. Antes
// convivían tres tipografías distintas para el mismo botón primario (font-display
// title case, text-sm uppercase con tracking, y text-sm font-medium); aquí queda
// una sola. Se expone como función —y no solo dentro de Button.svelte— para que
// los enlaces que necesitan otro componente (TransitionLink, que conserva la
// view transition) puedan usar exactamente el mismo aspecto sin duplicar clases.
const BASE =
	'inline-flex items-center justify-center gap-2 rounded-xl font-display font-semibold transition-colors active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100';

export function buttonClass(
	variant: ButtonVariant = 'primary',
	size: ButtonSize = 'md',
	extra = ''
): string {
	return `${BASE} ${SIZE[size]} ${VARIANT[variant]} ${extra}`.trim();
}
