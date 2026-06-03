import { writable } from 'svelte/store';
import { browser } from '$app/environment';

class TransitionStore {
	isTransitioning = writable(false);

	async navigateWithTransition(url: unknown, callback: () => void) {
		if (!browser || !document.startViewTransition) {
			// Fallback for browsers that don't support View Transitions
			if (callback) callback();
			return;
		}

		this.isTransitioning.set(true);

		const transition = document.startViewTransition(() => {
			if (callback) callback();
		});

		try {
			await transition.finished;
		} finally {
			this.isTransitioning.set(false);
		}
	}

	async navigateWithoutSharedElements(url: unknown, callback: () => void) {
		if (!browser || !document.startViewTransition) {
			if (callback) callback();
			return;
		}

		// Temporarily remove view-transition-name from all named elements
		// so the browser does a clean crossfade without hero animations
		const namedEls = document.querySelectorAll<HTMLElement>('[style*="view-transition-name"]');
		const saved = Array.from(namedEls).map((el) => {
			const name = el.style.viewTransitionName;
			el.style.viewTransitionName = '';
			return { el, name };
		});

		this.isTransitioning.set(true);

		const transition = document.startViewTransition(() => {
			// Restore before the new page renders so they work on the destination
			saved.forEach(({ el, name }) => (el.style.viewTransitionName = name));
			if (callback) callback();
		});

		try {
			await transition.finished;
		} finally {
			this.isTransitioning.set(false);
		}
	}

	async transitionElement(callback: ViewTransitionUpdateCallback | undefined) {
		if (!browser || !document.startViewTransition) {
			if (callback) callback();
			return;
		}

		const transition = document.startViewTransition(callback);
		return transition.finished;
	}
}

export const transitions = new TransitionStore();
