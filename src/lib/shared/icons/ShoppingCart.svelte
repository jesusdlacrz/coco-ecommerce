<script lang="ts">
	interface Props {
		size?: number;
		class?: string;
	}

	let { size = 24, class: className = '' }: Props = $props();
</script>

<svg
	width="24"
	height="23"
	viewBox="0 0 24 23"
	fill="none"
	xmlns="http://www.w3.org/2000/svg 	class={className}"
>
	<path
		d="M20.5555 17.3333H7.33331L3.44442 1H1.11108M4.2222 4.11111H22.8889L20.5555 14.2222H6.55553L4.2222 4.11111Z"
		stroke="white"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M19 22C19.8591 22 20.5556 21.3036 20.5556 20.4444C20.5556 19.5853 19.8591 18.8889 19 18.8889C18.1409 18.8889 17.4445 19.5853 17.4445 20.4444C17.4445 21.3036 18.1409 22 19 22Z"
		stroke="white"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M8.88881 22C9.74792 22 10.4444 21.3036 10.4444 20.4444C10.4444 19.5853 9.74792 18.8889 8.88881 18.8889C8.0297 18.8889 7.33325 19.5853 7.33325 20.4444C7.33325 21.3036 8.0297 22 8.88881 22Z"
		stroke="white"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
