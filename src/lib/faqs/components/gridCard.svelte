 <script lang="ts">
    import type{ FAQ } from "../const/faqs.const";

    const { faq } : { faq: FAQ } = $props();
 </script>


 <div class="bg-white p-8 rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
    <div class="flex gap-1">
        <h4 class=" text-xl font-semibold text-graybrand-dark mb-2">{faq.question}</h4>
    </div>
    <hr class="border-graybrand border-1 w-[120%] -mx-4"/>
    <p class="text-graybrand-light">{faq.answer}</p>
</div>