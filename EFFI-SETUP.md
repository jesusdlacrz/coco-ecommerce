# Effi ERP → Tienda — Sincronización de inventario

La tienda toma de **Effi** el stock y el precio de cada referencia. WooCommerce
sigue siendo de donde lee la página (y donde se crean los pedidos), así que el
checkout, Wompi y el panel de WordPress funcionan igual que antes.

```
Effi ──(API + webhooks)──▶ /api/effi/* ──▶ WooCommerce ──▶ Tienda
```

## Quién manda en qué

| Dato | Lo define | Notas |
| --- | --- | --- |
| Stock | **Effi** | Se descuentan los pedidos web aún sin despachar (ver "Ventas web") |
| Precio | **Effi** — Tarifa normal | La "Tarifa Distribuidor" está en $0 en muchas referencias, no se usa |
| Publicado / oculto | **Reglas automáticas** | Ver abajo |
| Fotos | Effi, **hasta** que se suban fotos en WordPress | Las subidas a mano nunca se reemplazan |
| Nombre, descripción, categorías | **WordPress** | Se ponen al crear el producto; después no se tocan |

### Cuándo se publica un producto

Se publica solo si cumple **las tres**:
1. Effi lo permite en ventas y tiene precio.
2. Tiene foto (en Effi o subida en WordPress).
3. Tiene al menos el mínimo de unidades por prenda (`MIN_UNITS_PER_PRODUCT`, hoy 4).

Si deja de cumplir alguna, se **oculta** (borrador) — nunca se borra. Cuando
vuelve a cumplirla (repuso stock, se le subió foto), se publica sola en la
siguiente sincronización.

## Cómo se arma el catálogo desde Effi

Effi no tiene tallas ni colores: cada combinación es un artículo. La clienta
las agrupa con el **mismo nombre** y una **referencia con patrón**:

```
JOGGER COCOS   JOG-NEG-32  JOG-NEG-34  JOG-GRI-32 …   → 1 producto, variaciones Color × Talla
BODY HELENA    HEL-LIL-U   HEL-UVA-U   HEL-NEG-U …   → 1 producto, variaciones por Color
BLUSA TY190    TY190                                 → producto simple
```

- Solo entran artículos **"Producto terminado"** con control de stock (los
  "en proceso" no se venden).
- El significado de cada código (NEG = Negro, U = Única…) está en
  `src/lib/server/effi/mapping.ts`. **Un código nuevo se agrega ahí.**
- Género y tipo de prenda salen del nombre (BLUSA, JOGGER, MANTA…) y, si no,
  de la categoría de Effi. También en `mapping.ts`.
- La lógica está en `src/lib/server/effi/catalog.ts` (agrupar) y `sync.ts`
  (aplicar en WooCommerce).

## Variables de entorno

| Variable | Para qué |
| --- | --- |
| `EFFI_API_KEY` | API key del usuario de Effi (Administración → Usuarios → Ver más detalles). **Vence a los 360 días**: renovarla en la misma pantalla y actualizarla aquí y en Vercel |
| `CRON_SECRET` | Protege `/api/effi/sync`. Vercel lo envía solo en la tarea diaria |
| `EFFI_WEBHOOK_SECRET` | Protege `/api/effi/webhook`. Va en la cabecera del webhook en Effi |

Las tres van en `.env` (local) y en Vercel → Settings → Environment Variables
(Production).

## Cuándo se sincroniza

1. **Todos los días a las 5:00 a.m.** (tarea de Vercel, `vercel.json`):
   sincronización completa — crea productos nuevos, actualiza todo.
2. **En tiempo real con webhooks de Effi**: actualiza stock y precio de lo que
   ya está en la tienda (no crea productos, para no duplicarlos si llegan
   varios avisos a la vez).
3. **A mano**, cuando se quiera:

```bash
# Simulación: muestra qué haría, sin escribir nada
curl -H "Authorization: Bearer $CRON_SECRET" "https://<dominio>/api/effi/sync?dry=1"

# Sincronización real
curl -H "Authorization: Bearer $CRON_SECRET" "https://<dominio>/api/effi/sync"
```

### Configurar los webhooks en Effi

Effi → Integraciones → Webhooks → **Crear**, uno por cada evento:

- Creación de Factura de venta · Anulación de Factura de venta
- Creación de Remisión de venta · Anulación de Remisión de venta
- Creación de Ajuste de inventario · Anulación de Ajuste de inventario
- Creación de Traslado de inventario
- Creación de Devolución de venta
- Creación de Factura de compra · Creación de Remisión de compra
- Modificación de Artículo · Creación de Artículo

En cada uno:
- **URL:** `https://<dominio>/api/effi/webhook`
- **Cabeceras:** `{"Authorization": "Bearer <EFFI_WEBHOOK_SECRET>"}`

## Ventas web → Effi (pendiente, fase 2)

Hoy una venta en la web **no se registra sola en Effi**. Mientras tanto:

1. La clienta registra en Effi cada pedido web (como cualquier venta).
2. Después marca el pedido como **Completado** en WooCommerce.

Mientras el pedido está en "Procesando", sus unidades se **restan** del stock
de Effi en la tienda, para no venderlas dos veces. Al marcarlo "Completado"
dejan de restarse (para entonces ya están descontadas en Effi).

La API de Effi sí permite crear órdenes de venta (`POST api/orden_v`), pero
exige definiciones contables de la clienta antes de automatizarlo:
- cliente (crear cada comprador como tercero, o un cliente genérico "Tienda web"),
- centro de costos, forma de pago (¿"Wompi"?) e impuestos por línea
  (los precios van sin IVA),
- y no hay ambiente de pruebas: cada intento escribe en su contabilidad real.

## Pendientes para la clienta

- [ ] Confirmar los colores marcados "por confirmar" en `mapping.ts`
      (AZC, AZT, AZP, AZG, VERM, VERO, VERMZ, VAM, ACEI).
- [ ] Confirmar el género de "ROPA DEPORTIVA" (hoy se publica como dama).
- [ ] Confirmar la regla del pedido mínimo: ¿4 unidades **por prenda** o 4
      **en total**? Si es en total, las referencias con 1–3 unidades también
      se podrían publicar (se cambia solo `MIN_UNITS_PER_PRODUCT`).
- [ ] **Fotos**: solo ~10 % de las referencias con stock tienen foto en Effi.
      Cada foto que suba (en Effi o en WordPress) publica ese producto.
      Las fotos de Effi llegan a 500×500 px; para mejor calidad, subirlas en
      WordPress.
- [ ] **Tallas**: las referencias sin patrón (ej. "BLUSA TY190") no tienen
      talla ni color en Effi; se venden como un solo producto. Para separar
      tallas, crearlas en Effi con el patrón BASE-COLOR-TALLA.
- [ ] Decidir la fase 2 (ventas web → Effi) con las definiciones contables de arriba.
- [ ] Recomendado: crear en Effi un **usuario solo para la tienda** con un
      perfil limitado (consultar artículos; crear órdenes de venta en fase 2)
      y usar su API key en vez de la del usuario principal.
- [ ] Renovar la API key antes de que venza (360 días).
