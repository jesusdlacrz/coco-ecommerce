# Conectar Coco's (SvelteKit) con WordPress + WooCommerce

Esta guía es para la **primera vez**. El frontend ya está preparado: en cuanto
rellenes el archivo `.env` con las API keys, dejará de usar los productos de
ejemplo y traerá los reales desde WooCommerce.

**Modelo de datos acordado:**

- **Género** (hombre / mujer / niño / niña) → **categoría de producto** de WooCommerce.
- **Tipo** (Camisas, Vestidos, etc.) → **categoría de producto** también.
- **Talla** y **Color** → **atributos** de producto.
- **Precio mayorista** y **Cantidad mínima de pedido** → **campos ACF** (plugin gratuito).

---

## Paso 1 — Terminar la configuración de WooCommerce

1. En el panel: **WooCommerce → Ajustes → General**.
2. Ubicación de la tienda: **Colombia**.
3. Moneda: **Peso colombiano (COP)**. Posición del símbolo: a la izquierda.
4. Guardar cambios.

> Deja "Store coming soon" activo si aún no quieres publicar; la API REST sigue funcionando.

---

## Paso 2 — Crear las categorías (género + tipo)

**Productos → Categorías.** Crea primero las de **género** con estos *slugs exactos*
(el frontend los reconoce):

| Nombre  | Slug     |
| ------- | -------- |
| Hombre  | `hombre` |
| Mujer   | `mujer`  |
| Niño    | `nino`   |
| Niña    | `nina`   |

Luego crea las de **tipo** según tu catálogo (el slug aquí es libre):
`Camisas`, `Pantalones`, `Polos`, `Chaquetas`, `Blusas`, `Vestidos`, `Faldas`,
`Cardigans`, `Zapatos`, etc.

> Cada producto irá en **2 categorías**: una de género y una de tipo. El frontend
> usa la de género para las pestañas y la de tipo como etiqueta visible.

---

## Paso 3 — Crear los atributos Talla y Color

**Productos → Atributos.**

1. Crea un atributo llamado **`Talla`** (nombre exacto). Slug: `talla`.
2. Entra en "Configurar términos" y añade los valores: `S`, `M`, `L`, `XL`, `XXL`,
   `30`, `32`, `34`, `36`, `38`, `40`… (los que uses).
3. Crea otro atributo llamado **`Color`** (nombre exacto). Slug: `color`.
4. Añade los términos de color: `Negro`, `Blanco`, `Azul Marino`, `Rojo`, etc.

> El frontend conoce el hex de los colores comunes en español (negro, blanco, azul
> marino, rojo, verde, rosa, morado, marrón, beige, gris…). Si usas un color raro,
> se mostrará en gris; luego podemos ampliar el mapa en `woocommerce.server.ts`.

---

## Paso 4 — Instalar ACF y crear los campos de mayorista

1. **Plugins → Añadir nuevo** → busca **"Advanced Custom Fields"** (de WP Engine) →
   Instalar → Activar. (La versión gratuita basta.)
2. **ACF → Grupos de campos → Añadir nuevo**. Nómbralo "Datos mayorista".
3. Añade dos campos con estos **nombres de campo exactos** (columna "Nombre del campo"):

   | Etiqueta               | Nombre del campo     | Tipo   |
   | ---------------------- | -------------------- | ------ |
   | Precio mayorista       | `wholesale_price`    | Número |
   | Cantidad mínima pedido | `min_order_quantity` | Número |

4. En "Reglas de ubicación": **Tipo de post** → **es igual a** → **Producto**.
5. Publicar el grupo de campos.

> ⚠️ Importante: para que ACF exponga estos campos en la API REST de WooCommerce
> como `meta_data`, en cada campo, dentro de "Ajustes avanzados", deja el nombre
> tal cual (`wholesale_price`). ACF los guarda como post meta y WooCommerce los
> devuelve en el array `meta_data` de cada producto, que es justo lo que lee el
> frontend.

---

## Paso 5 — Crear un producto de prueba

**Productos → Añadir nuevo:**

1. **Nombre**: p. ej. "Camisa Formal Azul Marino".
2. **Descripción**: el texto largo del producto.
3. **Datos del producto → General**: pon el **Precio normal** (ej. `180000`).
4. **Datos del producto → Inventario**: activa "Gestionar inventario", pon el
   **SKU** (ej. `MEN-SH-001`) y la cantidad de stock.
5. **Datos del producto → Atributos**: añade `Talla` y `Color`, selecciona los
   valores de este producto y marca "Visible en la página del producto".
6. **Categorías** (columna derecha): marca la de **género** (ej. Hombre) y la de
   **tipo** (ej. Camisas).
7. **Imagen del producto** y galería.
8. Sección **"Datos mayorista"** (los campos ACF): rellena **Precio mayorista**
   (ej. `128000`) y **Cantidad mínima pedido** (ej. `5`).
9. **Publicar**.

Repite para tus productos reales.

---

## Paso 6 — Generar las API keys (Consumer Key / Secret)

1. **WooCommerce → Ajustes → Avanzado → API REST**.
2. Clic en **"Añadir clave"**.
3. Descripción: `Frontend Coco's`. Usuario: tu usuario admin.
4. **Permisos: Lectura** (el frontend solo lee productos; no necesita escribir).
5. Clic en **"Generar clave de API"**.
6. Copia la **Consumer key** (`ck_...`) y la **Consumer secret** (`cs_...`).
   ⚠️ El secret solo se muestra **una vez**; guárdalo ya.

---

## Paso 7 — Configurar el frontend (.env)

1. En la carpeta del proyecto, copia `.env.example` a `.env`:

   ```bash
   cp .env.example .env
   ```

2. Abre `.env` y rellena:

   ```
   WOO_API_URL="https://beige-newt-613576.hostingersite.com"
   WOO_CONSUMER_KEY="ck_...(lo que copiaste)"
   WOO_CONSUMER_SECRET="cs_...(lo que copiaste)"
   ```

3. Reinicia el servidor de desarrollo (`npm run dev`).

Listo. Al recargar, el sitio traerá los productos reales de WooCommerce. Si el
`.env` está mal o falta, verás en la consola `[woocommerce] Sin configurar` y
seguirá usando los productos de ejemplo (nunca se rompe).

---

## Cómo lo lee el frontend (referencia técnica)

| Campo del frontend (`Product`) | De dónde sale en WooCommerce                          |
| ------------------------------ | ----------------------------------------------------- |
| `id`                           | `slug` del producto                                   |
| `name`                         | Nombre                                                |
| `price`                        | Precio normal (`regular_price`)                       |
| `wholesalePrice`               | Campo ACF `wholesale_price` (en `meta_data`)          |
| `minOrderQuantity`             | Campo ACF `min_order_quantity` (default 1)            |
| `images`                       | Imagen destacada + galería                            |
| `gender`                       | Categoría de género (`hombre`/`mujer`/`nino`/`nina`)  |
| `category`                     | Categoría de tipo (la que no es de género)            |
| `sizes`                        | Atributo `Talla`                                      |
| `colors`                       | Atributo `Color` (hex resuelto en el front)           |
| `sku`                          | SKU                                                   |
| `inStock` / `stockQuantity`    | Estado y cantidad de inventario                       |

Toda la lógica está en `src/lib/shared/services/woocommerce.server.ts`.
