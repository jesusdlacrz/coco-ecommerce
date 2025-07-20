import type { Config } from 'tailwindcss';

export default {
	theme: {
		extend: {
			fontFamily: {
				'sans': ['Poppins', 'Instrument Sans', 'system-ui', '-apple-system', 'sans-serif'],
				'poppins': ['Poppins', 'sans-serif'],
				'instrument': ['Instrument Sans', 'sans-serif'],
				'volkhov': ['Volkhov', 'serif'],
			},
			colors: {
				'cream': '#fffcec',
			},
		},
	},
} satisfies Config;
