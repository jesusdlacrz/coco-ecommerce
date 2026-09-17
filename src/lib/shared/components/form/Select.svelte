<script lang="ts">
	import ChevronDown from '$lib/shared/icons/ChevronDown.svelte';

	export type SelectOption = { value: string; label: string };

	interface Props {
		value: string;
		options: SelectOption[];
		placeholder?: string;
		id?: string;
		class?: string;
	}

	let {
		value = $bindable(''),
		options,
		placeholder = 'Selecciona una opción',
		id,
		class: className = ''
	}: Props = $props();

	// La lista de un <select> nativo la dibuja el sistema operativo y no acepta
	// una sola línea de CSS: por eso desentona con el resto del formulario.
	// Este componente la reemplaza por una lista propia, cuidando lo que un
	// select nativo da gratis y suele perderse al reimplementarlo: teclado
	// completo, anuncio correcto a lectores de pantalla y cierre al salir.
	let open = $state(false);
	let active = $state(-1);
	let button = $state<HTMLButtonElement | null>(null);
	let list = $state<HTMLUListElement | null>(null);

	const selectedIndex = $derived(options.findIndex((o) => o.value === value));
	const label = $derived(selectedIndex >= 0 ? options[selectedIndex].label : placeholder);
	const listId = $derived(id ? `${id}-listbox` : undefined);

	function openList() {
		open = true;
		active = selectedIndex >= 0 ? selectedIndex : 0;
	}

	function close(focusButton = true) {
		open = false;
		active = -1;
		if (focusButton) button?.focus();
	}

	function choose(index: number) {
		const option = options[index];
		if (!option) return;
		value = option.value;
		close();
	}

	// Mantiene a la vista la opción marcada cuando se recorre con el teclado —
	// con 33 departamentos, sin esto se navega a ciegas.
	$effect(() => {
		if (!open || active < 0 || !list) return;
		list.children[active]?.scrollIntoView({ block: 'nearest' });
	});

	// Escribir letras salta a la primera coincidencia, como en un select nativo.
	let typed = '';
	let typedAt = 0;
	function typeahead(key: string) {
		const now = Date.now();
		typed = now - typedAt > 700 ? key : typed + key;
		typedAt = now;
		const found = options.findIndex((o) => o.label.toLowerCase().startsWith(typed));
		if (found >= 0) active = found;
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open) {
			if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
				e.preventDefault();
				openList();
			}
			return;
		}

		switch (e.key) {
			case 'Escape':
				e.preventDefault();
				close();
				break;
			case 'Tab':
				close(false);
				break;
			case 'Enter':
			case ' ':
				e.preventDefault();
				choose(active);
				break;
			case 'ArrowDown':
				e.preventDefault();
				active = (active + 1) % options.length;
				break;
			case 'ArrowUp':
				e.preventDefault();
				active = (active - 1 + options.length) % options.length;
				break;
			case 'Home':
				e.preventDefault();
				active = 0;
				break;
			case 'End':
				e.preventDefault();
				active = options.length - 1;
				break;
			default:
				if (e.key.length === 1 && !e.metaKey && !e.ctrlKey) typeahead(e.key.toLowerCase());
		}
	}
</script>

<svelte:window
	onpointerdown={(e) => {
		if (!open) return;
		const target = e.target as Node;
		if (!button?.contains(target) && !list?.contains(target)) close(false);
	}}
/>

<div class="relative">
	<button
		bind:this={button}
		{id}
		type="button"
		role="combobox"
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-controls={listId}
		aria-activedescendant={open && active >= 0 ? `${id}-opt-${active}` : undefined}
		onclick={() => (open ? close() : openList())}
		onkeydown={onKeydown}
		class="flex w-full items-center justify-between gap-2 text-left {className}"
	>
		<span class="truncate {selectedIndex >= 0 ? 'text-ink' : 'text-muted-soft'}">{label}</span>
		<ChevronDown
			class="h-4 w-4 shrink-0 text-muted-soft transition-transform {open ? 'rotate-180' : ''}"
		/>
	</button>

	{#if open}
		<ul
			bind:this={list}
			id={listId}
			role="listbox"
			tabindex="-1"
			class="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-white py-1 shadow-float"
		>
			{#each options as option, i (option.value)}
				{@const isSelected = option.value === value}
				<li
					id="{id}-opt-{i}"
					role="option"
					aria-selected={isSelected}
					class="cursor-pointer px-4 py-2.5 text-base transition-colors
						{i === active ? 'bg-graybrand/50' : ''}
						{isSelected ? 'font-semibold text-ink' : 'text-muted'}"
					onpointerdown={(e) => {
						e.preventDefault(); // evita que el botón pierda el foco antes del clic
						choose(i);
					}}
					onpointerenter={() => (active = i)}
				>
					{option.label}
				</li>
			{/each}
		</ul>
	{/if}
</div>
