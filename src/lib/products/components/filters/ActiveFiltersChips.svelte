<script lang="ts">
  // Local type (no export so Svelte doesn't treat it as a prop)
  type ActiveFilterChip = { label: string; remove: () => void };
  export let chips: ActiveFilterChip[] = [];
  export let currentStyle: any;
</script>

{#if chips.length > 0}
  <div class="border-t border-[#16167F] pt-4">
    <h4 class="mb-2 text-sm font-medium text-gray-900" style="font-family:'Poppins',sans-serif">Filtros activos</h4>
    <div class="flex flex-wrap gap-2">
      {#each chips as chip (chip.label)}
        <span style="font-family:'Poppins',sans-serif" class="inline-flex items-center rounded-full px-2 py-1 text-xs {currentStyle.accent}">
          {chip.label}
          <button aria-label="Quitar filtro" onclick={chip.remove} class="ml-1 hover:text-gray-300">×</button>
        </span>
      {/each}
    </div>
  </div>
{/if}
