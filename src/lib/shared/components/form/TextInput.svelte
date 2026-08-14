<script lang="ts">
	interface Props {
		type?: string;
		name: string;
		id?: string;
		value?: string;
		placeholder?: string;
		autocomplete?: HTMLInputElement['autocomplete'];
		required?: boolean;
		error?: string;
		describedBy?: string;
	}

	let {
		type = 'text',
		name,
		id = name,
		value = $bindable(''),
		placeholder = '',
		autocomplete,
		required = false,
		error,
		describedBy
	}: Props = $props();
</script>

<input
	{type}
	{name}
	{id}
	{placeholder}
	{autocomplete}
	{required}
	bind:value
	aria-invalid={error ? 'true' : undefined}
	aria-describedby={describedBy}
	class="w-full rounded-lg border px-4 py-3 font-['Jost',sans-serif] text-[#262635] transition-colors outline-none focus:ring-2 focus:ring-[#FCA120]/30
		{error ? 'border-red-400 focus:border-red-400' : 'border-black/15 focus:border-[#FCA120]'}"
/>
