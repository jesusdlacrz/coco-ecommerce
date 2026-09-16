<script lang="ts">
	import Eye from '$lib/shared/icons/Eye.svelte';
	import EyeOff from '$lib/shared/icons/EyeOff.svelte';

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

	const borderClass = error ? 'border-red-400 focus-within:border-red-400' : 'border-black/15 focus-within:border-accent';

	// Un campo de contraseña sin forma de ver lo que se escribió es la causa
	// número uno de "no puedo entrar" en soporte — se puede alternar a texto
	// plano sin cambiar el tipo real del campo hacia el resto del formulario.
	const isPassword = type === 'password';
	let revealed = $state(false);
	const effectiveType = $derived(isPassword ? (revealed ? 'text' : 'password') : type);
</script>

{#if prefix}
	<div
		class="flex w-full items-stretch rounded-lg border font-body text-ink transition-colors focus-within:ring-2 focus-within:ring-accent/30 {borderClass}"
	>
		<span class="flex items-center border-r border-black/10 bg-black/5 pl-4 pr-2 text-muted-soft select-none">
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
{:else if isPassword}
	<div class="relative">
		<input
			type={effectiveType}
			{name}
			{id}
			{placeholder}
			{autocomplete}
			{required}
			bind:value
			aria-invalid={error ? 'true' : undefined}
			aria-describedby={describedBy}
			class="w-full rounded-lg border px-4 py-3 pr-11 font-body text-ink transition-colors outline-none focus:ring-2 focus:ring-accent/30
				{error ? 'border-red-400 focus:border-red-400' : 'border-black/15 focus:border-accent'}"
		/>
		<button
			type="button"
			onclick={() => (revealed = !revealed)}
			aria-label={revealed ? 'Ocultar contraseña' : 'Mostrar contraseña'}
			class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-soft transition-colors hover:text-ink"
		>
			{#if revealed}
				<EyeOff size={19} />
			{:else}
				<Eye size={19} />
			{/if}
		</button>
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
		class="w-full rounded-lg border px-4 py-3 font-body text-ink transition-colors outline-none focus:ring-2 focus:ring-accent/30
			{error ? 'border-red-400 focus:border-red-400' : 'border-black/15 focus:border-accent'}"
	/>
{/if}
