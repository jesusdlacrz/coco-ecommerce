<script lang="ts">
	import TransitionLink from '$lib/shared/components/TransitionLink.svelte';

	type Breadcrumb = {
		label: string;
		href: string;
	};

	type Props = {
		breadcrumbs: Breadcrumb[];
	};

	let { breadcrumbs }: Props = $props();
</script>

<nav class="mb-6">
	<ol class="flex items-center space-x-2 text-sm text-gray-500">
		{#each breadcrumbs as breadcrumb, index}
			{#if index > 0}
				<li>
					<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
						<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
					</svg>
				</li>
			{/if}
			<li>
				{#if index === breadcrumbs.length - 1}
					<span class="font-medium text-gray-900">{breadcrumb.label}</span>
				{:else}
					<TransitionLink 
						href={breadcrumb.href}
						class="hover:text-gray-700 transition-colors"
					>
						{breadcrumb.label}
					</TransitionLink>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
