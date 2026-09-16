<script lang="ts">
	const brands = ['CHANEL', 'LOUIS VUITTON', 'PRADA', 'Calvin Klein', 'DENIM'];
</script>

<div class="border-y border-[#e8e8e8] bg-white py-8">
	<div class="mx-auto max-w-7xl px-8">
		<div class="flex items-center justify-between gap-8">
			{#each brands as brand (brand)}
				<span
					class="font-poppins text-lg font-semibold tracking-widest text-[#262635] opacity-70 transition-opacity hover:opacity-100"
				>
					{brand}
				</span>
			{/each}
		</div>
	</div>
</div>
