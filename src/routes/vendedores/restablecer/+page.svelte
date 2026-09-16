<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthCard from '$lib/vendors/components/AuthCard.svelte';
	import Field from '$lib/shared/components/form/Field.svelte';
	import TextInput from '$lib/shared/components/form/TextInput.svelte';
	import Button from '$lib/shared/components/form/Button.svelte';
	import FormAlert from '$lib/shared/components/form/FormAlert.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	let submitting = $state(false);
	let password = $state('');
	const hasMinLength = $derived(password.length >= 8);
</script>

<svelte:head>
	<title>Restablecer contraseña - Coco's</title>
</svelte:head>

<AuthCard title="Elige una contraseña nueva">
	{#if !data.validToken}
		<FormAlert>Este link ya no es válido o venció.</FormAlert>
		<a
			href="/vendedores/recuperar"
			class="mt-4 block text-center font-body text-sm font-semibold text-[#262635] hover:underline"
		>
			Pedir un link nuevo
		</a>
	{:else}
		{#if form?.mensaje}
			<div class="mb-4"><FormAlert>{form.mensaje}</FormAlert></div>
		{/if}

		<form
			method="POST"
			class="space-y-4"
			use:enhance={({ cancel }) => {
				if (submitting) {
					cancel();
					return;
				}
				submitting = true;
				return async ({ update }) => {
					submitting = false;
					await update({ reset: false });
				};
			}}
		>
			<Field label="Contraseña nueva" name="password" error={form?.errors?.password}>
				{#snippet children({ id, describedBy })}
					<TextInput
						{id}
						type="password"
						name="password"
						autocomplete="new-password"
						required
						bind:value={password}
						error={form?.errors?.password}
						{describedBy}
					/>
					<p
						class="mt-2 flex items-center gap-1.5 font-body text-xs transition-colors {hasMinLength
							? 'text-[#1f8a55]'
							: 'text-[#767676]'}"
					>
						<span
							class="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border transition-colors {hasMinLength
								? 'border-[#1f8a55] bg-[#1f8a55] text-white'
								: 'border-black/20'}"
						>
							{#if hasMinLength}
								<svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
									<path d="M20 6 9 17l-5-5" />
								</svg>
							{/if}
						</span>
						Mínimo 8 caracteres
					</p>
				{/snippet}
			</Field>

			<Field label="Confirma la contraseña" name="confirmPassword" error={form?.errors?.confirmPassword}>
				{#snippet children({ id, describedBy })}
					<TextInput
						{id}
						type="password"
						name="confirmPassword"
						autocomplete="new-password"
						required
						error={form?.errors?.confirmPassword}
						{describedBy}
					/>
				{/snippet}
			</Field>

			<Button type="submit" loading={submitting} class="w-full">Guardar contraseña</Button>
		</form>
	{/if}
</AuthCard>
