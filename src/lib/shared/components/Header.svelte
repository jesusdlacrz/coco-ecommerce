<script lang="ts">
	import { ShoppingCart, User } from '@lucide/svelte';

	interface Props {
		cartItemCount: number;
		onCartClick: () => void;
		onAccountClick?: () => void;
	}

	let { cartItemCount, onCartClick, onAccountClick }: Props = $props();
	
	const navigationButtons = [
		{ 
			label: 'Home', 
			href: '/',
			action: () => { window.location.href = '/'; }
		},
		{ 
			label: 'Productos', 
			href: '/productos',
			action: () => { window.location.href = '/productos'; }
		},
		{ 
			label: 'Catalogo', 
			href: '/productos',
			action: () => { window.location.href = '/productos'; }
		}
	]; 
</script>

<header>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-20 items-center justify-between text-[#484848]">
			<div class="flex items-center space-x-4">
				<button 
					onclick={() => window.location.href = '/'}
					class="text-2xl cursor-pointer hover:text-gray-600 transition-colors" 
					style="font-family: 'Volkhov', serif;"
				>
					Coco's 
				</button>
			</div>
			<div class="flex items-center space-x-12">
				{#each navigationButtons as button}
				<button 
					onclick={button.action}
					class="text-sm cursor-pointer hover:text-gray-600 transition-colors"
				>
					<span>{button.label}</span>
				</button>
				{/each}

				<button
					onclick={onCartClick}
					class="relative flex items-center space-x-2 rounded-lg bg-black p-3 cursor-pointer hover:bg-gray-800 transition-colors"
				>
					<ShoppingCart class="h-5 w-5 text-white" />
				</button>
			</div>
		</div>
	</div>
</header>
