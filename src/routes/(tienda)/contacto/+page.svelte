<script lang="ts">
	import toast from 'svelte-5-french-toast';

	let name = $state('');
	let email = $state('');
	let topic = $state('');
	let message = $state('');
	let isSubmitting = $state(false);

	function hasValidInput(): boolean {
		return Boolean(name.trim() && email.trim() && topic.trim() && message.trim());
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!hasValidInput()) {
			toast.error('Completa todos los campos.');
			return;
		}

		isSubmitting = true;
		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, topic, message })
			});
			if (!res.ok) {
				const detail = await res.json().catch(() => null);
				toast.error(detail?.message ?? 'No se pudo enviar tu mensaje.');
				return;
			}
			toast.success('¡Mensaje enviado! Te responderemos pronto.');
			name = '';
			email = '';
			topic = '';
			message = '';
		} catch {
			toast.error('No se pudo enviar tu mensaje. Intenta de nuevo.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Contacto - Coco's</title>
</svelte:head>

<div class="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
	<h1 class="font-display text-3xl font-bold text-[#262635] sm:text-4xl">Contacto</h1>
	<p class="mt-2 font-body text-[#767676]">
		¿Tienes preguntas sobre algún producto o tu pedido? Escríbenos y te respondemos pronto.
	</p>

	<form onsubmit={handleSubmit} class="mt-10 grid gap-10 rounded-2xl bg-[#E0E0E0] p-8 sm:p-14 lg:grid-cols-2">
		<div class="space-y-5">
			<label class="block">
				<span class="mb-2 block text-sm font-medium font-display text-[#262635]">Nombre</span>
				<input
					bind:value={name}
					required
					class="w-full rounded-lg border border-[#d1d1d1] bg-white px-4 py-3 text-base text-[#262635] outline-none transition-all placeholder:text-[#a0a0a0] focus:border-[#262635]"
					placeholder="Tu nombre"
				/>
			</label>

			<label class="block">
				<span class="mb-2 block text-sm font-medium font-display text-[#262635]">Correo</span>
				<input
					bind:value={email}
					type="email"
					required
					class="w-full rounded-lg border border-[#d1d1d1] bg-white px-4 py-3 text-base text-[#262635] outline-none transition-all placeholder:text-[#a0a0a0] focus:border-[#262635]"
					placeholder="tu@correo.com"
				/>
			</label>

			<label class="block">
				<span class="mb-2 block text-sm font-medium font-display text-[#262635]">Tema</span>
				<input
					bind:value={topic}
					required
					class="w-full rounded-lg border border-[#d1d1d1] bg-white px-4 py-3 text-base text-[#262635] outline-none transition-all placeholder:text-[#a0a0a0] focus:border-[#262635]"
					placeholder="Ej: Estado de mi pedido"
				/>
			</label>
		</div>

		<div class="flex flex-col">
			<label class="flex flex-1 flex-col">
				<span class="mb-2 block text-sm font-medium font-display text-[#262635]">Mensaje</span>
				<textarea
					bind:value={message}
					required
					class="min-h-[180px] w-full flex-1 resize-none rounded-lg border border-[#d1d1d1] bg-white px-4 py-3 text-base text-[#262635] outline-none transition-all placeholder:text-[#a0a0a0] focus:border-[#262635]"
					placeholder="Cuéntanos en qué te podemos ayudar..."
				></textarea>
			</label>

			<button
				type="submit"
				disabled={isSubmitting}
				class="mt-5 w-full rounded-xl bg-[#FCA120] px-6 py-3 font-display font-semibold text-[#262635] transition-colors hover:bg-[#e8931a] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-50"
			>
				{isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
			</button>
		</div>
	</form>
</div>
