<script lang="ts">
  interface DynamicPreset { id: string; label: string; min: number; max: number }
  export let presets: readonly DynamicPreset[] = [];
  export let counts: Record<string, number> = {};
  export let activePreset: string | null = null;
  export let selectPreset: (id: string) => void;
  export let currentStyle: any;
</script>

<div class="flex flex-col gap-2 text-sm" style="font-family:'Poppins',sans-serif">
  {#each presets as preset (preset.id)}
    <button
      style="font-family:'Poppins',sans-serif"
  class="w-full rounded py-1 text-left {activePreset === preset.id ? `${currentStyle.textAccent} font-semibold` : `${currentStyle.textSecondary}` }"
      onclick={() => selectPreset(preset.id)}
      aria-pressed={activePreset === preset.id}
    >
      <span style="font-family:'Poppins',sans-serif">
        {preset.label}
        <span class="ml-1 opacity-70" style="font-family:'Poppins',sans-serif">({counts[preset.id] ?? 0})</span>
      </span>
    </button>
  {/each}
</div>
