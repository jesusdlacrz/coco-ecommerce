export type RequestState<T> = {
	loading: boolean;
	success: boolean;
	error: string | null;
	data: T | null;
};
