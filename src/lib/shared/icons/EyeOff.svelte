<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
	}

	let { size = 24, class: className = '' }: Props = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	class={className}
>
	<path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a17 17 0 0 1-2.16 3.19"></path>
	<path d="M6.6 6.6C3.9 8.3 2 12 2 12s3.5 7 10 7a9.3 9.3 0 0 0 5.4-1.6"></path>
	<path d="M9.9 9.9a3 3 0 0 0 4.24 4.24"></path>
	<path d="M2 2l20 20"></path>
</svg>
