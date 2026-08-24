<script lang="ts">
	type Props = {
		images: string[];
		productName: string;
		initialIndex: number;
		onClose: () => void;
	};

	let { images, productName, initialIndex, onClose }: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();

	// Los navegadores registran touchstart/touchmove como "passive" por
	// defecto (a veces también por delegación de eventos del framework) —
	// preventDefault() ahí no hace nada y el pellizco terminaría haciendo
	// scroll de la página en vez de zoom. Esta action fuerza listeners
	// activos (passive: false) directo sobre el elemento.
	function nonPassiveTouch(
		node: HTMLElement,
		handlers: {
			onTouchStart: (e: TouchEvent) => void;
			onTouchMove: (e: TouchEvent) => void;
			onTouchEnd: (e: TouchEvent) => void;
		}
	) {
		node.addEventListener('touchstart', handlers.onTouchStart, { passive: false });
		node.addEventListener('touchmove', handlers.onTouchMove, { passive: false });
		node.addEventListener('touchend', handlers.onTouchEnd, { passive: false });
		node.addEventListener('touchcancel', handlers.onTouchEnd, { passive: false });
		return {
			destroy() {
				node.removeEventListener('touchstart', handlers.onTouchStart);
				node.removeEventListener('touchmove', handlers.onTouchMove);
				node.removeEventListener('touchend', handlers.onTouchEnd);
				node.removeEventListener('touchcancel', handlers.onTouchEnd);
			}
		};
	}

	let activeIndex = $state(initialIndex);
	let scale = $state(1);
	let translateX = $state(0);
	let translateY = $state(0);

	const MAX_SCALE = 4;
	const ZOOM_STEP = 2.5;
	const DOUBLE_TAP_MS = 300;

	function clamp(value: number, min: number, max: number): number {
		return Math.min(Math.max(value, min), max);
	}

	function resetZoom() {
		scale = 1;
		translateX = 0;
		translateY = 0;
	}

	function goTo(index: number) {
		activeIndex = (index + images.length) % images.length;
		resetZoom();
	}

	// Evita que, al hacer zoom, la imagen se pueda arrastrar completamente
	// fuera de vista — el margen permitido crece con el nivel de zoom.
	function clampPan() {
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const maxX = (rect.width * (scale - 1)) / 2;
		const maxY = (rect.height * (scale - 1)) / 2;
		translateX = clamp(translateX, -maxX, maxX);
		translateY = clamp(translateY, -maxY, maxY);
	}

	function toggleZoomAt(clientX: number, clientY: number) {
		if (scale > 1) {
			resetZoom();
			return;
		}
		if (!containerEl) return;
		const rect = containerEl.getBoundingClientRect();
		const offsetX = clientX - rect.left - rect.width / 2;
		const offsetY = clientY - rect.top - rect.height / 2;
		scale = ZOOM_STEP;
		translateX = -offsetX * (ZOOM_STEP - 1);
		translateY = -offsetY * (ZOOM_STEP - 1);
		clampPan();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onClose();
		else if (e.key === 'ArrowRight') goTo(activeIndex + 1);
		else if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
	}

	// ------------------------------------------------------- Escritorio (mouse)
	function handleImageClick(e: MouseEvent) {
		toggleZoomAt(e.clientX, e.clientY);
	}

	let isMouseDragging = $state(false);
	let dragStart = { x: 0, y: 0 };
	let translateStart = { x: 0, y: 0 };

	function handleMouseDown(e: MouseEvent) {
		if (scale <= 1) return;
		e.preventDefault();
		isMouseDragging = true;
		dragStart = { x: e.clientX, y: e.clientY };
		translateStart = { x: translateX, y: translateY };
	}

	function handleWindowMouseMove(e: MouseEvent) {
		if (!isMouseDragging) return;
		translateX = translateStart.x + (e.clientX - dragStart.x);
		translateY = translateStart.y + (e.clientY - dragStart.y);
		clampPan();
	}

	function handleWindowMouseUp() {
		isMouseDragging = false;
	}

	// ------------------------------------------------------------ Móvil (touch)
	// Un solo manejador de gestos: pellizco con dos dedos para zoom, un dedo
	// para arrastrar cuando ya está ampliada, y doble tap para alternar el
	// zoom. Todo se resuelve en touchend con preventDefault() para que el
	// navegador nunca dispare además un click sintético que duplique la acción.
	let lastTouchDistance = 0;
	let lastTapTime = 0;
	let lastTapPoint = { x: 0, y: 0 };
	let isTouchDragging = $state(false);
	let wasGesture = false;

	function touchDistance(touches: TouchList): number {
		const dx = touches[0].clientX - touches[1].clientX;
		const dy = touches[0].clientY - touches[1].clientY;
		return Math.hypot(dx, dy);
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 2) {
			wasGesture = true;
			lastTouchDistance = touchDistance(e.touches);
		} else if (e.touches.length === 1) {
			lastTapPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
			if (scale > 1) {
				wasGesture = true;
				isTouchDragging = true;
				dragStart = lastTapPoint;
				translateStart = { x: translateX, y: translateY };
			}
		}
	}

	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length === 2) {
			e.preventDefault();
			const distance = touchDistance(e.touches);
			if (lastTouchDistance > 0) {
				scale = clamp(scale * (distance / lastTouchDistance), 1, MAX_SCALE);
			}
			lastTouchDistance = distance;
			if (scale <= 1) {
				translateX = 0;
				translateY = 0;
			} else {
				clampPan();
			}
		} else if (e.touches.length === 1 && isTouchDragging) {
			e.preventDefault();
			translateX = translateStart.x + (e.touches[0].clientX - dragStart.x);
			translateY = translateStart.y + (e.touches[0].clientY - dragStart.y);
			clampPan();
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		if (e.touches.length > 0) return;

		isTouchDragging = false;
		lastTouchDistance = 0;
		if (scale <= 1) resetZoom();

		if (wasGesture) {
			e.preventDefault();
			wasGesture = false;
			return;
		}

		// Tap simple o doble tap — se resuelve aquí, no como click sintético.
		e.preventDefault();
		const now = Date.now();
		const isDoubleTap = now - lastTapTime < DOUBLE_TAP_MS;
		lastTapTime = isDoubleTap ? 0 : now;
		if (isDoubleTap) {
			toggleZoomAt(lastTapPoint.x, lastTapPoint.y);
		}
	}

	$effect(() => {
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	});
</script>

<svelte:window onkeydown={handleKeydown} onmousemove={handleWindowMouseMove} onmouseup={handleWindowMouseUp} />

<div class="fixed inset-0 z-50 bg-black/90" role="dialog" aria-modal="true" aria-label="Imagen ampliada de {productName}">
	<button
		onclick={onClose}
		aria-label="Cerrar"
		class="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
	>
		<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
		</svg>
	</button>

	{#if images.length > 1}
		<button
			onclick={() => goTo(activeIndex - 1)}
			aria-label="Imagen anterior"
			class="absolute top-1/2 left-2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
		>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
			</svg>
		</button>
		<button
			onclick={() => goTo(activeIndex + 1)}
			aria-label="Imagen siguiente"
			class="absolute top-1/2 right-2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
		>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
			</svg>
		</button>
	{/if}

	<!-- Fondo: un tap/clic aquí (fuera de la imagen) cierra el lightbox. -->
	<div
		bind:this={containerEl}
		class="relative h-full w-full overflow-hidden"
		style="touch-action: none;"
		onclick={onClose}
		use:nonPassiveTouch={{
			onTouchStart: handleTouchStart,
			onTouchMove: handleTouchMove,
			onTouchEnd: handleTouchEnd
		}}
		role="presentation"
	>
		<!-- Zoom centrado en el punto de clic/tap y arrastre: son interacciones
			 inherentemente de puntero, no tienen equivalente de teclado con
			 sentido. La navegación por teclado (Escape, flechas) ya la maneja
			 la ventana completa arriba. -->
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
		<img
			src={images[activeIndex]}
			alt="{productName} — vista {activeIndex + 1}"
			draggable="false"
			onclick={(e) => {
				e.stopPropagation();
				handleImageClick(e);
			}}
			onmousedown={handleMouseDown}
			class="pointer-events-auto h-full w-full touch-none object-contain select-none {scale === 1
				? 'cursor-zoom-in'
				: 'cursor-zoom-out'} {isMouseDragging || isTouchDragging ? '' : 'transition-transform duration-200 ease-out'}"
			style="transform: translate({translateX}px, {translateY}px) scale({scale});"
		/>
	</div>

	{#if images.length > 1}
		<div
			class="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white"
		>
			{activeIndex + 1} / {images.length}
		</div>
	{/if}
</div>
