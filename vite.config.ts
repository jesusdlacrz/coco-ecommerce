import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	// Sin basicSsl(): `npm run dev` vuelve a servir en http://localhost.
	//
	// El https local existía solo para que el widget embebido de Wompi pudiera
	// guardar sus cookies de sesión. Ese widget ya no se usa —el checkout hace
	// una redirección de página completa a checkout.wompi.co, y en localhost ni
	// siquiera manda `redirect-url` porque Wompi lo rechaza— así que el
	// certificado autofirmado no aportaba nada y sí traía problemas: cada vez
	// que se regenera (por ejemplo al limpiar node_modules/.vite) el navegador
	// deja de reconocerlo y la página puede quedar servida sin hidratar, es
	// decir visible pero sin responder a ningún clic.
	//
	// Si alguna vez hace falta una URL pública (probar el webhook de Wompi de
	// verdad), se usa un túnel —cloudflared/ngrok, ya permitidos en
	// `allowedHosts`— que además da un certificado válido.
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	// Estas dependencias no se alcanzan desde el punto de entrada, así que Vite
	// las descubría a mitad de sesión, las re-optimizaba y forzaba un reload
	// ("optimized dependencies changed. reloading"). Ese reload deja la página
	// pintada pero SIN hidratar —los módulos del cliente quedan apuntando a la
	// URL vieja y dan 404—, y se siente como si el sitio se hubiera congelado:
	// nada responde y la terminal no muestra ningún error, porque la falla es
	// del lado del navegador. Declararlas aquí las pre-empaqueta al arrancar.
	// Solo afecta a `npm run dev`; en producción esta fase no existe.
	optimizeDeps: {
		include: ['svelte-5-french-toast', 'devalue']
	},
	server: {
		// Permite probar además a través de un túnel (cloudflared/ngrok) cuando
		// haga falta el webhook de Wompi, que sí necesita una URL pública real.
		allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok.io']
	}
});
