<script>
    import GridCard from "./gridCard.svelte";
    import { faqs } from "../const/faqs.const";
</script>

<section class=" bg-graybrand shadow-2xl min-w-3xl min-h-96 rounded-2xl px-8 py-8">
    <h3 class=" text-graybrand-light font-light">Preguntas de ayuda</h3>
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {#each faqs as faq}
            <GridCard
                faq={faq}
            />
        {/each}

    </div>
</section>