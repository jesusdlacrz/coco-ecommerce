<script lang="ts">
  export let categories: string[] = [];
  export let selected: string[] = [];
  export let counts: Record<string, number> = {};
  export let toggleCategory: (c: string) => void;
  export let currentStyle: any;
</script>

<div class="flex flex-col gap-1">
  {#each categories as category (category)}
    <button
      onclick={() => toggleCategory(category)}
      style="font-family:'Poppins',sans-serif"
  class="rounded py-1 text-left text-sm transition {selected[0] === category ? `${currentStyle.textAccent} font-semibold` : `${currentStyle.textSecondary}`}">
  {category} <span style="font-family:'Poppins',sans-serif">({counts[category] ?? 0})</span>
    </button>
  {/each}
</div>
