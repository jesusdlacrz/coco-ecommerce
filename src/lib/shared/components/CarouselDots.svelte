<script lang="ts">
	interface Props {
		count: number;
		active: number;
		onSelect: (index: number) => void;
		label?: string;
	}

	let { count, active, onSelect, label = 'Ir a la diapositiva' }: Props = $props();
</script>

<!-- El punto mide 12px, pero el botón que lo contiene mide 32×32: un objetivo
     de 12px es imposible de acertar con el dedo. El indicador activo se alarga
     en vez de cambiar de color solo, para que se lea también sin distinguir
     bien los tonos. -->
<div class="flex items-center justify-center" role="tablist" aria-label="Diapositivas">
	{#each Array.from({ length: count }, (_, i) => i) as i (i)}
		<button
			type="button"
			role="tab"
			aria-selected={i === active}
			aria-label="{label} {i + 1}"
			onclick={() => onSelect(i)}
			class="flex h-8 w-8 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
		>
			<span
				class="h-2.5 rounded-full transition-all duration-300 {i === active
					? 'w-6 bg-ink'
					: 'w-2.5 bg-line'}"
			></span>
		</button>
	{/each}
</div>
