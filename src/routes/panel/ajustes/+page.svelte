<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import toast from 'svelte-5-french-toast';
	import Field from '$lib/shared/components/form/Field.svelte';
	import TextInput from '$lib/shared/components/form/TextInput.svelte';
	import Button from '$lib/shared/components/form/Button.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const vendor = $derived(page.data.vendor);
	let submitting = $state(false);

	function value(field: string, fallback: string): string {
		return form?.values?.[field as keyof typeof form.values] ?? fallback;
	}
</script>

<svelte:head>
	<title>Ajustes - Coco's</title>
</svelte:head>

<h1 class="mb-6 font-display text-2xl font-bold text-ink">Ajustes de tu tienda</h1>

<div class="max-w-xl rounded-2xl border border-line-soft bg-white p-6 shadow-sm">
	<form
		method="POST"
		action="?/guardar"
		class="space-y-4"
		use:enhance={() => {
			submitting = true;
			return async ({ result, update }) => {
				submitting = false;
				if (result.type === 'success') toast.success('Ajustes guardados');
				await update({ reset: false });
			};
		}}
	>
		<Field label="Nombre de tu tienda" name="storeName" error={form?.errors?.storeName}>
			{#snippet children({ id, describedBy })}
				<TextInput
					{id}
					name="storeName"
					value={value('storeName', vendor?.storeName ?? '')}
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
					value={value('slug', vendor?.slug ?? '')}
					prefix="coco.com/v/"
					required
					error={form?.errors?.slug}
					{describedBy}
				/>
			{/snippet}
		</Field>
		<p class="-mt-2 font-body text-xs text-muted-faint">
			Si cambias esto, los links que ya compartiste dejarán de funcionar.
		</p>

		<Field
			label="WhatsApp (con código de país, ej. 573001234567)"
			name="whatsapp"
			error={form?.errors?.whatsapp}
		>
			{#snippet children({ id, describedBy })}
				<TextInput
					{id}
					name="whatsapp"
					value={value('whatsapp', vendor?.whatsapp ?? '')}
					error={form?.errors?.whatsapp}
					{describedBy}
				/>
			{/snippet}
		</Field>

		<Field label="Bio de tu revista" name="bio" error={form?.errors?.bio}>
			{#snippet children({ id, describedBy })}
				<TextInput
					{id}
					name="bio"
					value={value('bio', vendor?.bio ?? '')}
					error={form?.errors?.bio}
					{describedBy}
				/>
			{/snippet}
		</Field>

		<Field label="URL de portada" name="coverImageUrl" error={form?.errors?.coverImageUrl}>
			{#snippet children({ id, describedBy })}
				<TextInput
					{id}
					name="coverImageUrl"
					value={value('coverImageUrl', vendor?.coverImageUrl ?? '')}
					error={form?.errors?.coverImageUrl}
					{describedBy}
				/>
			{/snippet}
		</Field>

		<Field
			label="Comisión global (%)"
			name="commissionPercent"
			error={form?.errors?.commissionPercent}
		>
			{#snippet children({ id, describedBy })}
				<TextInput
					{id}
					type="number"
					name="commissionPercent"
					value={value('commissionPercent', String(vendor?.commissionPercent ?? ''))}
					error={form?.errors?.commissionPercent}
					{describedBy}
				/>
			{/snippet}
		</Field>

		<Button type="submit" loading={submitting}>Guardar ajustes</Button>
	</form>
</div>
