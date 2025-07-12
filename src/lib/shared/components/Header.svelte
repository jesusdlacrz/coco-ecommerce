<script lang="ts">
	import { ShoppingCart, User } from '@lucide/svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		cartItemCount: number;
		onCartClick: () => void;
		onAccountClick?: () => void;
	}

	let { cartItemCount, onCartClick, onAccountClick }: Props = $props();
</script>

<header class="border-b bg-white shadow-sm">
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<div class="flex items-center space-x-4">
				<h1 class="text-2xl font-bold text-gray-900">
					Coco's <span class="text-blue-600">Store</span>
				</h1>
				<span
					class="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800"
				>
					Mayorista
				</span>
			</div>

			<div class="flex items-center space-x-4">
				<button
					onclick={onAccountClick}
					class="flex items-center space-x-2 px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
				>
					<User class="h-4 w-4" />
					<span>Mi Cuenta</span>
				</button>

				<button
					onclick={onCartClick}
					class="relative flex items-center space-x-2 rounded border border-gray-300 px-3 py-1 hover:bg-gray-50"
				>
					<ShoppingCart class="h-4 w-4" />
					<span>Carrito</span>
					{#if cartItemCount > 0}
						<span
							class="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
						>
							{cartItemCount}
						</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
</header>