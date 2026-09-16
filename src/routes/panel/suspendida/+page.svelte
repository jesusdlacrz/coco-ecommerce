<svelte:head>
	<title>Cuenta suspendida - Coco's</title>
</svelte:head>

<div
	class="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAFAFA] px-4 text-center"
>
	<p class="font-display text-2xl font-bold text-[#262635]">Tu tienda está suspendida</p>
	<p class="max-w-sm font-body text-[#767676]">
		Contacta al equipo de Coco's para más información sobre tu cuenta.
	</p>
	<form method="POST" action="/vendedores/salir">
		<button
			type="submit"
			class="font-body text-sm font-semibold text-[#262635] hover:underline"
		>
			Salir
		</button>
	</form>
</div>
