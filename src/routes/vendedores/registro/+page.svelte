<script lang="ts">
	import { enhance } from '$app/forms';
	import AuthCard from '$lib/vendors/components/AuthCard.svelte';
	import Field from '$lib/shared/components/form/Field.svelte';
	import TextInput from '$lib/shared/components/form/TextInput.svelte';
	import Button from '$lib/shared/components/form/Button.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
	let password = $state('');
	const hasMinLength = $derived(password.length >= 8);
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

		<Field label="Dirección de tu revista" name="slug" error={form?.errors?.slug}>
			{#snippet children({ id, describedBy })}
				<TextInput
					{id}
					name="slug"
					value={form?.values?.slug ?? ''}
					placeholder="tu-tienda"
					prefix="coco.com/v/"
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
					bind:value={password}
					error={form?.errors?.password}
					{describedBy}
				/>
				<p
					class="mt-2 flex items-center gap-1.5 font-body text-xs transition-colors {hasMinLength
						? 'text-success'
						: 'text-muted-soft'}"
				>
					<span
						class="flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border transition-colors {hasMinLength
							? 'border-success bg-success text-white'
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

		<Button type="submit" loading={submitting} class="w-full">Crear mi tienda</Button>
	</form>
</AuthCard>
