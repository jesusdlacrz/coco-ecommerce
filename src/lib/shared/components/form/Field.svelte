<script lang="ts">
	import type { Snippet } from 'svelte';
	import FieldError from './FieldError.svelte';

	interface Props {
		label: string;
		name: string;
		error?: string;
		children: Snippet<[{ id: string; describedBy: string | undefined }]>;
	}

	let { label, name, error, children }: Props = $props();

	const inputId = `field-${name}`;
	const errorId = `${inputId}-error`;
</script>

<div class="space-y-1.5">
	<label for={inputId} class="block font-poppins text-sm text-muted">
		{label}
	</label>
	{@render children({ id: inputId, describedBy: error ? errorId : undefined })}
	<FieldError id={errorId} message={error} />
</div>
