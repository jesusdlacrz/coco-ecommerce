export function goBack() {
	if (document.startViewTransition) {
		document.startViewTransition(() => {
			history.back();
		});
	} else {
		history.back();
	}
}
