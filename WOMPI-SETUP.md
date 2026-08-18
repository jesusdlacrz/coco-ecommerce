# Wompi — Configuración de la pasarela de pagos

Guía paso a paso para dejar Wompi funcionando. El código ya está listo y
espera solo 4 variables de entorno — nada de esto requiere tocar WordPress
más allá de un solo permiso de API (ver Parte 3).

---

## Parte 1: Crear la cuenta y obtener las llaves de prueba (Sandbox)

No hace falta esperar a la dueña del local para esto — las llaves de
**Sandbox** (pruebas) se obtienen de inmediato con solo un correo. La
verificación legal de la empresa solo se pide cuando se quiera pasar a
producción (cobros reales).

1. Entra a **https://comercios.wompi.co** y crea una cuenta (puede ser con tu
   propio correo como placeholder; luego se reemplaza por el de la dueña
   cuando toque pasar a producción — es solo cambiar variables de entorno,
   cero cambios de código).
2. Una vez dentro, ve a **Desarrolladores** en el menú lateral.
3. Ahí vas a ver 4 valores bajo la sección de **Sandbox / Pruebas**:
   - **Llave pública** (empieza con `pub_test_...`)
   - **Llave privada** (empieza con `prv_test_...`)
   - **Secreto de integridad** (a veces llamado "Integrity secret")
   - **Secreto de eventos** (a veces llamado "Events secret")
4. Copia los 4 valores al archivo `.env` del proyecto:
   ```
   WOMPI_PUBLIC_KEY="pub_test_..."
   WOMPI_PRIVATE_KEY="prv_test_..."
   WOMPI_INTEGRITY_SECRET="..."
   WOMPI_EVENTS_SECRET="..."
   ```
5. Reinicia `npm run dev` para que tome las nuevas variables.

Con esto ya se puede abrir `/carrito`, completar el formulario y hacer clic en
"Pagar ahora" — se navega a la página de pago de Wompi en modo sandbox.

**Nota sobre `localhost`:** Wompi rechaza (403) cualquier intento cuya URL de
retorno (`redirect-url`) apunte a `localhost` — protección anti-phishing. El
código ya lo detecta y simplemente no manda esa URL cuando corres en local: el
pago se puede probar igual, solo que Wompi muestra su propia pantalla de
confirmación en vez de devolverte a `/carrito/confirmacion`. Para probar el
regreso automático y el webhook completo, hace falta un dominio real (túnel o
producción) — ver Parte 4.

---

## Parte 2: Tarjetas de prueba

Wompi documenta tarjetas de prueba para simular resultados sin cobrar de
verdad. Búscalas en su documentación oficial bajo "Tarjetas de prueba" /
"Test cards" — ahí vienen números específicos para simular pagos **aprobados**
y **rechazados**, que es justo lo que hay que probar:
- Con una tarjeta de prueba "aprobada": el pedido debe aparecer en WooCommerce
  (Pedidos → Todos los pedidos) con el pago marcado como completado.
- Con una tarjeta de prueba "rechazada": **no** debe crearse ningún pedido en
  WooCommerce, y el carrito debe seguir intacto.

---

## Parte 3: El único paso real en WordPress

El pedido se crea directo contra la API REST de WooCommerce (headless), así
que **no hace falta instalar ningún plugin de pasarela en WordPress**. Solo
hay que confirmar un permiso:

1. WooCommerce → Ajustes → Avanzado → API REST.
2. Abre la llave que ya se está usando (la de `WOO_CONSUMER_KEY` /
   `WOO_CONSUMER_SECRET` en `.env`).
3. Confirma que el permiso sea **"Lectura/Escritura"**. Si dice "Solo
   lectura" (lo más probable, porque hasta ahora solo se traían productos),
   cámbialo, guarda, y si WordPress genera una llave nueva, actualiza el
   `.env` con los valores nuevos.

Nada más — no se necesita CPT, ACF, ni Code Snippets para esto.

---

## Parte 4: Webhook (para que el pedido se cree automáticamente)

El pedido en WooCommerce se crea SOLO cuando Wompi confirma el pago por este
mecanismo — es la parte más importante de todo el flujo.

1. En **Desarrolladores** (mismo lugar que las llaves), busca la sección de
   **"Eventos"** / **"Webhooks"**.
2. Registra esta URL: `https://<tu-dominio>/api/wompi/webhook`.
3. **En local (`localhost`) Wompi no puede llamar a esa URL directamente** —
   necesitas exponerla con un túnel mientras pruebas:
   ```bash
   npx cloudflared tunnel --url http://localhost:5173
   ```
   (o `ngrok http 5173` si prefieres esa herramienta). Copia la URL pública
   que te da (algo como `https://algo-random.trycloudflare.com`) y regístrala
   en Wompi como `https://algo-random.trycloudflare.com/api/wompi/webhook`.
4. Cuando el sitio esté desplegado de verdad (dominio real), se reemplaza por
   la URL final y ya no hace falta el túnel.

Sin este paso, el widget de pago sigue funcionando, pero el pedido no se
creará hasta que el webhook logre llegar — así que es indispensable para
probar el flujo de punta a punta.

---

## Parte 5: Pasar a producción (más adelante, con la dueña)

Cuando la dueña haga la verificación de su negocio en Wompi:
1. Repetir la Parte 1 pero copiando las llaves de **Producción**
   (`pub_prod_...` / `prv_prod_...`) en vez de las de Sandbox — el código
   detecta automáticamente cuál es cuál por el prefijo de la llave pública.
2. Repetir la Parte 4 con la URL del webhook apuntando al dominio real.
3. Nada más cambia — mismo código, mismo flujo.
