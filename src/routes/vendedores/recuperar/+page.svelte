<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthCard from '$lib/vendors/components/AuthCard.svelte';
	import Field from '$lib/shared/components/form/Field.svelte';
	import TextInput from '$lib/shared/components/form/TextInput.svelte';
	import Button from '$lib/shared/components/form/Button.svelte';
	import FormAlert from '$lib/shared/components/form/FormAlert.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Recuperar contraseña - Coco's</title>
</svelte:head>

<AuthCard
	title="Recupera tu contraseña"
	footer={{
		text: '¿Ya la recordaste?',
		href: '/vendedores/ingresar',
		linkText: 'Inicia sesión'
	}}
>
	{#if form?.mensaje}
		<div class="mb-4"><FormAlert variant={form.success ? 'success' : 'error'}>{form.mensaje}</FormAlert></div>
	{/if}

	{#if !form?.success}
		<p class="mb-4 font-['Jost',sans-serif] text-sm text-[#767676]">
			Escribe el correo con el que creaste tu tienda — te enviamos un link para elegir una
			contraseña nueva.
		</p>

		<form
			method="POST"
			class="space-y-4"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					submitting = false;
					await update({ reset: false });
				};
			}}
		>
			<Field label="Correo" name="email" error={form?.errors?.email}>
				{#snippet children({ id, describedBy })}
					<TextInput
						{id}
						type="email"
						name="email"
						value={form?.values?.email ?? ''}
						autocomplete="email"
						required
						error={form?.errors?.email}
						{describedBy}
					/>
				{/snippet}
			</Field>

			<Button type="submit" loading={submitting} class="w-full">Enviar link</Button>
		</form>
	{/if}
</AuthCard>
