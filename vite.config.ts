import devtoolsJson from 'vite-plugin-devtools-json';
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';


export default defineConfig({
	// basicSsl() sirve `npm run dev` en https://localhost — necesario para que
	// el widget de Wompi pueda guardar sus cookies de sesión (falla en
	// http://localhost) sin depender de un túnel externo. El navegador muestra
	// una advertencia de certificado autofirmado la primera vez: "Avanzado" →
	// "Continuar" (una sola vez por máquina).
	plugins: [tailwindcss(), sveltekit(), devtoolsJson(), basicSsl()],
	server: {
		// Permite probar además a través de un túnel (cloudflared/ngrok) cuando
		// haga falta el webhook de Wompi, que sí necesita una URL pública real.
		allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.ngrok.io']
	}
});
