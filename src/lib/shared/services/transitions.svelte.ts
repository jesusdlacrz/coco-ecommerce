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
