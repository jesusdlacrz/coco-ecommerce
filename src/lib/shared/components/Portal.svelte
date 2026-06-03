<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  export let target: HTMLElement | null = null;
  let container: HTMLDivElement;
  let mounted = false;

  onMount(() => {
    if (typeof document === 'undefined') return; // SSR guard
    if (!target) target = document.body;
    target.appendChild(container);
    mounted = true;
  });

  onDestroy(() => {
    if (mounted && container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
</script>

<div bind:this={container} style="contents">
  <slot />
</div>

<style>
/* Portal container intentionally minimal */
</style>
