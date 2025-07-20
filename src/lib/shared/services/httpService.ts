// src/lib/services/HttpService.ts
import { writable, type Writable } from 'svelte/store';
import type { RequestState } from '../model/requestState.model';

export class HttpService {
	protected baseUrl: string;

	constructor(baseUrl: string = import.meta.env.BASE_URL) {
		this.baseUrl = baseUrl;
	}

	protected createState<T>(): Writable<RequestState<T>> {
		return writable({
			loading: false,
			success: false,
			error: null,
			data: null
		});
	}

	protected async request<T>(url: string, options: RequestInit, state: Writable<RequestState<T>>) {
		state.set({
			loading: true,
			success: false,
			error: null,
			data: null
		});

		try {
			const res = await fetch(`${this.baseUrl}${url}`, {
				headers: {
					'Content-Type': 'application/json',
					...options.headers
				},
				...options
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(errorText);
			}

			const json = await res.json();

			state.set({
				loading: false,
				success: true,
				error: null,
				data: json
			});
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : 'Error desconocido';
			state.set({
				loading: false,
				success: false,
				error: message || 'Error desconocido',
				data: null
			});
		}
	}

	get<T>(url: string): [Writable<RequestState<T>>, () => Promise<void>] {
		const state = this.createState<T>();
		const execute = () => this.request<T>(url, { method: 'GET' }, state);
		return [state, execute];
	}

	post<T, B = unknown>(url: string, body: B): [Writable<RequestState<T>>, () => Promise<void>] {
		const state = this.createState<T>();
		const execute = () =>
			this.request<T>(
				url,
				{
					method: 'POST',
					body: JSON.stringify(body)
				},
				state
			);
		return [state, execute];
	}
}
