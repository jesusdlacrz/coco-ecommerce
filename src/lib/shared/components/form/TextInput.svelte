<script lang="ts">
	interface Props {
		type?: string;
		name: string;
		id?: string;
		value?: string;
		placeholder?: string;
		autocomplete?: HTMLInputElement['autocomplete'];
		required?: boolean;
		error?: string;
		describedBy?: string;
		// Texto fijo mostrado antes del valor (ej. "coco.com/v/") para campos
		// tipo slug: el usuario nunca lo escribe, solo ve dónde termina el
		// dominio y empieza lo que sí puede editar.
		prefix?: string;
	}

	let {
		type = 'text',
		name,
		id = name,
		value = $bindable(''),
		placeholder = '',
		autocomplete,
		required = false,
		error,
		describedBy,
		prefix
	}: Props = $props();

	const borderClass = error ? 'border-red-400 focus-within:border-red-400' : 'border-black/15 focus-within:border-[#FCA120]';
</script>

{#if prefix}
	<div
		class="flex w-full items-stretch rounded-lg border font-['Jost',sans-serif] text-[#262635] transition-colors focus-within:ring-2 focus-within:ring-[#FCA120]/30 {borderClass}"
	>
		<span class="flex items-center border-r border-black/10 bg-black/5 pl-4 pr-2 text-[#767676] select-none">
			{prefix}
		</span>
		<input
			{type}
			{name}
			{id}
			{placeholder}
			{autocomplete}
			{required}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			class="w-full rounded-r-lg py-3 pr-4 pl-1 outline-none"
		/>
	</div>
{:else}
	<input
		{type}
		{name}
		{id}
		{placeholder}
		{autocomplete}
		{required}
		bind:value
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={describedBy}
		class="w-full rounded-lg border px-4 py-3 font-['Jost',sans-serif] text-[#262635] transition-colors outline-none focus:ring-2 focus:ring-[#FCA120]/30
			{error ? 'border-red-400 focus:border-red-400' : 'border-black/15 focus:border-[#FCA120]'}"
	/>
{/if}
