<script lang="ts">
  export let sizes: string[] = [];
  export let selectedSizes: string[] = [];
  export let toggleSize: (s: string) => void;
  export let currentStyle: any;
</script>

<div class="grid grid-cols-4 gap-2">
  {#each sizes as size (size)}
    <button
      onclick={() => toggleSize(size)}
      style="font-family:'Poppins',sans-serif"
  class="rounded-md border px-2 py-2 text-sm transition-all {selectedSizes.includes(size) ? `${currentStyle.accent}` : `${currentStyle.borderColor} text-[#8A8A8A] ${currentStyle.accentHover} ${currentStyle.hoverBorderColor}`}">
      {size}
    </button>
  {/each}
</div>
