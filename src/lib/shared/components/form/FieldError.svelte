<script lang="ts">
	interface Props {
		id?: string;
		message?: string;
	}

	let { id, message }: Props = $props();
</script>

{#if message}
	<p {id} role="alert" class="font-body text-sm text-red-600">{message}</p>
{/if}
