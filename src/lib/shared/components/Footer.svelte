<script lang="ts">
	interface Props {
		backgroundColor?: string;
	}

	let { backgroundColor = '' }: Props = $props();
</script>

<footer class="border-t border-[#D5D5D5] {backgroundColor} transition-colors duration-700">
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="text-center text-gray-600">
			<p class="text-sm">Copyright © 2025. All Rights Reseved.</p>
		</div>
	</div>
</footer>
