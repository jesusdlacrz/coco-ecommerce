<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthCard from '$lib/vendors/components/AuthCard.svelte';
	import Field from '$lib/shared/components/form/Field.svelte';
	import TextInput from '$lib/shared/components/form/TextInput.svelte';
	import Button from '$lib/shared/components/form/Button.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Crea tu tienda - Coco's</title>
</svelte:head>

<AuthCard
	title="Crea tu tienda de vendedor"
	footer={{
		text: '¿Ya tienes una cuenta?',
		href: '/vendedores/ingresar',
		linkText: 'Inicia sesión'
	}}
>
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
		<Field label="Nombre de tu tienda" name="storeName" error={form?.errors?.storeName}>
			{#snippet children({ id, describedBy })}
				<TextInput
					{id}
					name="storeName"
					value={form?.values?.storeName ?? ''}
					required
					error={form?.errors?.storeName}
					{describedBy}
				/>
			{/snippet}
		</Field>

		<Field
			label="Dirección de tu revista (coco.com/v/tu-tienda)"
			name="slug"
			error={form?.errors?.slug}
		>
			{#snippet children({ id, describedBy })}
				<TextInput
					{id}
					name="slug"
					value={form?.values?.slug ?? ''}
					required
					error={form?.errors?.slug}
					{describedBy}
				/>
			{/snippet}
		</Field>

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
					autocomplete="new-password"
					required
					error={form?.errors?.password}
					{describedBy}
				/>
			{/snippet}
		</Field>

		<Button type="submit" loading={submitting} class="w-full">Crear mi tienda</Button>
	</form>
</AuthCard>
