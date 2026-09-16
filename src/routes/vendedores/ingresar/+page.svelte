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
	<title>Ingresar - Coco's</title>
</svelte:head>

<AuthCard
	title="Ingresa a tu panel"
	footer={{
		text: '¿Todavía no tienes tienda?',
		href: '/vendedores/registro',
		linkText: 'Créala aquí'
	}}
>
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

		<Field label="Contraseña" name="password" error={form?.errors?.password}>
			{#snippet children({ id, describedBy })}
				<TextInput
					{id}
					type="password"
					name="password"
					autocomplete="current-password"
					required
					error={form?.errors?.password}
					{describedBy}
				/>
			{/snippet}
		</Field>

		<a
			href="/vendedores/recuperar"
			class="block text-right font-body text-sm text-muted-soft hover:text-ink hover:underline"
		>
			¿Olvidaste tu contraseña?
		</a>

		<Button type="submit" loading={submitting} class="w-full">Entrar</Button>
	</form>
</AuthCard>
