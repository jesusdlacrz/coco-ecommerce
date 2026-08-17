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

---

## Parte 2 — Contenido editable: Testimonios e Instagram

Esto es aparte de los productos. Controla las secciones **"Opiniones"** y
**"Síguenos en Instagram"** del home desde WordPress, sin tocar código.

> ⚠️ Nota: el campo **Repetidor** de ACF es de pago (ACF PRO). Para no
> depender de eso, cada testimonio y cada foto de Instagram se maneja como una
> **entrada propia** en el menú de WordPress — igual que crear un producto o
> una entrada de blog, con imagen destacada incluida. 100% gratis.

### Paso 1 — Registrar los dos tipos de contenido (código, una sola vez)

Ve a **Apariencia → Editor de archivos de tema** (o instala el plugin gratuito
**"Code Snippets"** si prefieres no tocar el tema directamente) y añade esto al
`functions.php` de tu tema activo:

```php
// --- Tipos de contenido para el sitio: Testimonios y Fotos de Instagram ---
add_action('init', function () {
	register_post_type('testimonio', [
		'label'        => 'Testimonios',
		'labels'       => [
			'name'          => 'Testimonios',
			'singular_name' => 'Testimonio',
			'add_new_item'  => 'Añadir testimonio',
			'edit_item'     => 'Editar testimonio',
		],
		'public'       => false,
		'show_ui'      => true,
		'show_in_menu' => true,
		'menu_icon'    => 'dashicons-testimonial',
		'supports'     => ['title', 'thumbnail'],
	]);

	register_post_type('foto_instagram', [
		'label'        => 'Fotos Instagram',
		'labels'       => [
			'name'          => 'Fotos Instagram',
			'singular_name' => 'Foto de Instagram',
			'add_new_item'  => 'Añadir foto',
			'edit_item'     => 'Editar foto',
		],
		'public'       => false,
		'show_ui'      => true,
		'show_in_menu' => true,
		'menu_icon'    => 'dashicons-camera',
		'supports'     => ['title', 'thumbnail'],
	]);
});
```

Guarda. Deberían aparecer dos ítems nuevos en el menú lateral: **"Testimonios"**
y **"Fotos Instagram"**.

### Paso 2 — Crear los campos extra de Testimonios (ACF → Grupos de campos)

El **título** de cada entrada es el nombre de la persona, y la **imagen
destacada** es su foto — eso ya lo da WordPress, sin ACF. Solo faltan 3 campos:

1. **ACF → Grupos de campos → Añadir nuevo**. Nombre: "Datos del testimonio".
2. Añade estos campos (nombres de campo **exactos**, todos de tipo gratuito):

   | Etiqueta   | Nombre del campo | Tipo          |
   | ---------- | ---------------- | ------------- |
   | Rol        | `rol`            | Texto         |
   | Testimonio | `texto`          | Área de texto |
   | Estrellas  | `estrellas`      | Número (1 a 5, valor por defecto 5) |

3. **Reglas de ubicación**: "Tipo de contenido" → **es igual a** → "Testimonio".
4. Publicar.

Las "Fotos Instagram" no necesitan campos ACF: el **título** es el texto
alternativo (accesibilidad) y la **imagen destacada** es la foto.

### Paso 3 — Cargar contenido

- **Testimonios → Añadir testimonio**: título = nombre (ej. "Ana María G."),
  imagen destacada = su foto, y completa Rol/Testimonio/Estrellas. Repite para
  cada uno (recomendado: 4).
- **Fotos Instagram → Añadir foto**: título = descripción corta de la foto,
  imagen destacada = la foto. Repite hasta 7.

### Paso 4 — Exponer este contenido en una API propia

Añade este segundo bloque al mismo `functions.php` (debajo del anterior):

```php
// --- Endpoint propio: contenido editable del sitio (solo lectura, público) ---
add_action('rest_api_init', function () {
	register_rest_route('coco/v1', '/site-content', [
		'methods'             => 'GET',
		'callback'            => 'coco_get_site_content',
		'permission_callback' => '__return_true', // contenido de marketing, no sensible
	]);
});

function coco_get_site_content() {
	$testimonial_posts = get_posts([
		'post_type'      => 'testimonio',
		'posts_per_page' => -1,
		'orderby'        => 'date',
		'order'          => 'ASC',
	]);

	$testimonials = array_map(function ($post) {
		return [
			'name'  => get_the_title($post),
			'role'  => function_exists('get_field') ? (get_field('rol', $post->ID) ?: '') : '',
			'quote' => function_exists('get_field') ? (get_field('texto', $post->ID) ?: '') : '',
			'stars' => function_exists('get_field') ? ((int) get_field('estrellas', $post->ID) ?: 5) : 5,
			'photo' => get_the_post_thumbnail_url($post, 'medium') ?: null,
		];
	}, $testimonial_posts);

	$instagram_posts = get_posts([
		'post_type'      => 'foto_instagram',
		'posts_per_page' => -1,
		'orderby'        => 'date',
		'order'          => 'ASC',
	]);

	$instagram = array_map(function ($post) {
		$thumb_id = get_post_thumbnail_id($post);
		$alt = $thumb_id ? get_post_meta($thumb_id, '_wp_attachment_image_alt', true) : '';
		return [
			'src' => get_the_post_thumbnail_url($post, 'medium') ?: null,
			'alt' => $alt ?: get_the_title($post),
		];
	}, $instagram_posts);

	return [
		'testimonials' => $testimonials,
		'instagram'    => $instagram,
	];
}
```

> Es un endpoint de **solo lectura** y público (`permission_callback` =>
> `__return_true`): no requiere las API keys de WooCommerce porque no expone
> nada sensible, solo contenido de marketing.
>
> ⚠️ Este es el snippet inicial. Más abajo, en la **Parte 3 → Paso 6**, lo
> reemplazamos por una versión ampliada que agrega `about`, `copy` y
> `heroImages` — usa siempre la versión más reciente que tengas activa.

### Paso 5 — Probar

Abre esta URL en el navegador (reemplaza con tu dominio):

```
https://beige-newt-613576.hostingersite.com/wp-json/coco/v1/site-content
```

Deberías ver un JSON con `testimonials` e `instagram`. El frontend lo consume
automáticamente vía `src/lib/shared/services/siteContent.server.ts`: si el
endpoint no existe o falla, cada sección cae a su contenido de respaldo (el
mismo que había antes), así que el sitio nunca se rompe mientras configuras esto.

### Cómo lo lee el frontend (referencia técnica)

| Campo del front (`SiteTestimonial`) | De dónde sale (post tipo `testimonio`) |
| ------------------------------------ | ---------------------------------------- |
| `name`                                | Título de la entrada                      |
| `role`                                | Campo ACF `rol`                           |
| `quote`                               | Campo ACF `texto`                         |
| `stars`                               | Campo ACF `estrellas`                     |
| `photo`                               | Imagen destacada                          |

| Campo del front (`SiteInstagramImage`) | De dónde sale (post tipo `foto_instagram`) |
| ---------------------------------------- | ------------------------------------------------ |
| `src`                                     | Imagen destacada                                  |
| `alt`                                     | Texto alternativo de la imagen (o el título)      |

Toda la lógica está en `src/lib/shared/services/siteContent.server.ts`.

---

## Parte 3 — Contenido editable: "Nosotros" y los textos de "Lo Más Nuevo" / "Gran Oferta"

Dos cosas distintas, con dos mecanismos distintos:

- **"Nosotros"** es una **lista** (3 slides: Misión, Historia, Valores) → mismo
  patrón de Custom Post Type que Testimonios/Instagram.
- **Los textos de "Lo Más Nuevo" y "Gran Oferta"** son textos **únicos y fijos**
  (no una lista) → usamos una **Página normal de WordPress** con campos ACF,
  en vez de un Options Page (para no depender de si tu ACF free lo soporta).

### Paso 1 — Registrar el Custom Post Type "Nosotros"

En **Snippets → Añadir nuevo** (nuevo snippet, título: "CPT Nosotros"), pega:

```php
add_action('init', function () {
	register_post_type('nosotros_slide', [
		'label'        => 'Nosotros',
		'labels'       => [
			'name'          => 'Nosotros',
			'singular_name' => 'Slide de Nosotros',
			'add_new_item'  => 'Añadir slide',
			'edit_item'     => 'Editar slide',
		],
		'public'       => false,
		'show_ui'      => true,
		'show_in_menu' => true,
		'menu_icon'    => 'dashicons-groups',
		'supports'     => ['title', 'thumbnail'],
	]);
});
```

**Run everywhere** → **Save and Activate**.

### Paso 2 — Campo ACF para el cuerpo del texto

1. **ACF → Grupos de campos → Añadir nuevo**. Nombre: "Datos de Nosotros".
2. Añade un campo:

   | Etiqueta | Nombre del campo | Tipo          |
   | -------- | ---------------- | ------------- |
   | Cuerpo   | `cuerpo`         | Área de texto |

   En este campo escribirás los 1 o 2 párrafos del slide, **separados por una
   línea completamente en blanco** (como cuando escribes párrafos normales) —
   el sistema los separa automáticamente en párrafos distintos en la página.

3. **Reglas de ubicación**: "Tipo de contenido" → **es igual a** → "Slide de Nosotros".
4. Publicar.

### Paso 3 — Cargar los 3 slides

**Nosotros → Añadir slide** (uno por cada uno):

1. **Título**: `Nuestra Misión` — **Cuerpo**: los 2 párrafos (separados por
   línea en blanco) — **Imagen destacada**: opcional.
2. **Título**: `Nuestra Historia` — mismo patrón.
3. **Título**: `Nuestros Valores` — mismo patrón.

Publica los 3, en ese orden (el orden de publicación es el orden en que aparecen).

### Paso 4 — Crear la página "Textos del Sitio"

Esta es una página normal de WordPress que **nunca se muestra al público** —
solo la usamos como contenedor de esos 5 textos.

1. **Páginas → Añadir nueva**
2. **Título**: `Textos del Sitio`
3. Publícala (no importa el contenido del cuerpo, puede quedar vacío).
4. Verifica su **slug**: en "Publicar" → "Enlace permanente", debe decir
   `textos-del-sitio`. Si WordPress le puso otro (por ejemplo si ya existía una
   página con ese nombre), ajusta el slug manualmente a `textos-del-sitio`, o
   avísame para ajustar el código PHP con el slug real.

### Paso 5 — Campos ACF para esos textos

1. **ACF → Grupos de campos → Añadir nuevo**. Nombre: "Copys del sitio".
2. Añade estos 5 campos (todos de tipo Texto, salvo el indicado):

   | Etiqueta                | Nombre del campo      | Tipo          | Valor por defecto  |
   | ----------------------- | ---------------------- | ------------- | ------------------ |
   | Título "Lo Más Nuevo"   | `lo_mas_nuevo_titulo`  | Texto         | Lo Más Nuevo        |
   | Texto "Lo Más Nuevo"    | `lo_mas_nuevo_texto`   | Área de texto |                     |
   | Línea 1 "Gran Oferta"   | `oferta_linea1`        | Texto         | GRAN                |
   | Línea 2 "Gran Oferta"   | `oferta_linea2`        | Texto         | OFERTA              |
   | Subtítulo "Gran Oferta" | `oferta_subtitulo`     | Texto         | NUEVA COLECCIÓN     |

   Además, añade estos 3 campos de **imagen** (opcionales — si los dejas
   vacíos, esa posición sigue mostrando automáticamente uno de tus productos
   más recientes, como hasta ahora):

   | Etiqueta                    | Nombre del campo   | Tipo   |
   | ---------------------------- | ------------------- | ------ |
   | Gran Oferta — Imagen izquierda | `imagen_izquierda` | Imagen |
   | Gran Oferta — Imagen centro    | `imagen_central`   | Imagen |
   | Gran Oferta — Imagen derecha   | `imagen_derecha`   | Imagen |

   > En cada uno de estos 3 campos de imagen, en "Ajustes avanzados → Formato
   > de retorno", cambia el valor a **"URL de la imagen"** (en vez de "Array
   > de imagen"). Esto simplifica el código del endpoint.

3. **Reglas de ubicación**: "Página" → **es igual a** → **"Textos del Sitio"**
   (la página específica que creaste, no "todas las páginas").
4. Publicar.

5. Ve a **Páginas → Textos del Sitio → Editar** y rellena los campos:
   - Los 5 textos.
   - Si alguna de las 3 fotos de "Gran Oferta" no se ve bien (por ejemplo un
     recorte raro de un producto), sube ahí una imagen propia para esa
     posición — reemplaza solo esa, las demás pueden seguir siendo automáticas.

### Paso 6 — Actualizar el endpoint

Edita el snippet **"Endpoint contenido del sitio"** (el que ya tienes activo)
y **reemplázalo completo** por esta versión ampliada (agrega `about` y `copy`):

```php
add_action('rest_api_init', function () {
	register_rest_route('coco/v1', '/site-content', [
		'methods'             => 'GET',
		'callback'            => 'coco_get_site_content',
		'permission_callback' => '__return_true',
	]);
});

function coco_get_site_content() {
	$testimonial_posts = get_posts([
		'post_type'      => 'testimonio',
		'posts_per_page' => -1,
		'orderby'        => 'date',
		'order'          => 'ASC',
	]);

	$testimonials = array_map(function ($post) {
		return [
			'name'  => get_the_title($post),
			'role'  => function_exists('get_field') ? (get_field('rol', $post->ID) ?: '') : '',
			'quote' => function_exists('get_field') ? (get_field('texto', $post->ID) ?: '') : '',
			'stars' => function_exists('get_field') ? ((int) get_field('estrellas', $post->ID) ?: 5) : 5,
			'photo' => get_the_post_thumbnail_url($post, 'medium') ?: null,
		];
	}, $testimonial_posts);

	$instagram_posts = get_posts([
		'post_type'      => 'foto_instagram',
		'posts_per_page' => -1,
		'orderby'        => 'date',
		'order'          => 'ASC',
	]);

	$instagram = array_map(function ($post) {
		$thumb_id = get_post_thumbnail_id($post);
		$alt = $thumb_id ? get_post_meta($thumb_id, '_wp_attachment_image_alt', true) : '';
		return [
			'src' => get_the_post_thumbnail_url($post, 'medium') ?: null,
			'alt' => $alt ?: get_the_title($post),
		];
	}, $instagram_posts);

	$about_posts = get_posts([
		'post_type'      => 'nosotros_slide',
		'posts_per_page' => -1,
		'orderby'        => 'date',
		'order'          => 'ASC',
	]);

	$about = array_map(function ($post) {
		$cuerpo = function_exists('get_field') ? (get_field('cuerpo', $post->ID) ?: '') : '';
		$paragraphs = array_values(array_filter(array_map('trim', preg_split('/\n\s*\n/', $cuerpo))));
		return [
			'heading' => get_the_title($post),
			'body'    => $paragraphs,
			'image'   => get_the_post_thumbnail_url($post, 'large') ?: null,
		];
	}, $about_posts);

	$copy_page = get_page_by_path('textos-del-sitio');
	$copy = null;
	$hero_images = null;
	if ($copy_page && function_exists('get_field')) {
		$copy = [
			'newArrivalsTitle' => get_field('lo_mas_nuevo_titulo', $copy_page->ID) ?: '',
			'newArrivalsText'  => get_field('lo_mas_nuevo_texto', $copy_page->ID) ?: '',
			'offerLine1'       => get_field('oferta_linea1', $copy_page->ID) ?: '',
			'offerLine2'       => get_field('oferta_linea2', $copy_page->ID) ?: '',
			'offerSubtitle'    => get_field('oferta_subtitulo', $copy_page->ID) ?: '',
		];
		$hero_images = [
			'left'   => get_field('imagen_izquierda', $copy_page->ID) ?: null,
			'center' => get_field('imagen_central', $copy_page->ID) ?: null,
			'right'  => get_field('imagen_derecha', $copy_page->ID) ?: null,
		];
	}

	return [
		'testimonials' => $testimonials,
		'instagram'    => $instagram,
		'about'        => $about,
		'copy'         => $copy,
		'heroImages'   => $hero_images,
	];
}
```

Guarda el snippet actualizado.

### Paso 7 — Probar

Abre de nuevo la URL del endpoint y confirma que ahora el JSON incluye `about`
(con tus 3 slides), `copy` (con tus 5 textos) y `heroImages` (con las 3
posiciones, `null` en las que no hayas subido una imagen propia). Recarga el
sitio localmente — "Nosotros", "Lo Más Nuevo" y "Gran Oferta" deberían mostrar
tu contenido real.

Si algún campo de `copy` queda vacío en WordPress, el frontend usa
automáticamente el texto original de respaldo para **ese campo específico**
(no todo el bloque), así que puedes rellenar los 5 textos de a poco sin que se
rompa nada mientras tanto.

### Cómo lo lee el frontend (referencia técnica)

| Campo del front (`SiteAboutSlide`) | De dónde sale (post tipo `nosotros_slide`)          |
| ------------------------------------ | ------------------------------------------------------ |
| `heading`                             | Título de la entrada                                    |
| `body`                                | Campo ACF `cuerpo`, separado en párrafos por línea en blanco |
| `image`                               | Imagen destacada                                         |

| Campo del front (`SiteCopy`)  | De dónde sale (página "Textos del Sitio") |
| ------------------------------ | -------------------------------------------- |
| `newArrivalsTitle`              | Campo ACF `lo_mas_nuevo_titulo`               |
| `newArrivalsText`               | Campo ACF `lo_mas_nuevo_texto`                |
| `offerLine1`                    | Campo ACF `oferta_linea1`                     |
| `offerLine2`                    | Campo ACF `oferta_linea2`                     |
| `offerSubtitle`                 | Campo ACF `oferta_subtitulo`                  |

| Campo del front (`SiteHeroImages`) | De dónde sale (página "Textos del Sitio") |
| ------------------------------------ | -------------------------------------------- |
| `left`                                | Campo ACF `imagen_izquierda` (o `null` si vacío → usa el producto más reciente) |
| `center`                              | Campo ACF `imagen_central` (o `null` → producto) |
| `right`                               | Campo ACF `imagen_derecha` (o `null` → producto) |

---

## Parte 4 — Colores reales (sin adivinar desde el nombre)

Hoy el frontend **adivina** el color de un swatch a partir del nombre que
escribe el vendedor ("Celeste", "Rosado"...). Funciona para la mayoría de
casos, pero nunca es 100% exacto. Esta parte lo reemplaza por el **hex real**,
elegido con un selector de color en WordPress — sin adivinar nada.

> Requiere que **Color** sea un atributo **global** de WooCommerce (no uno
> escrito a mano por producto). Si seguiste la Parte 1 de esta guía, ya lo es:
> se creó en **Productos → Atributos**, que siempre genera un atributo global
> con términos reales (cada color es una "entrada" propia, reutilizable en
> todos los productos).

### Paso 1 — Campo ACF para el hex de cada color

1. **ACF → Grupos de campos → Añadir nuevo**. Nombre: "Color real".
2. Añade un campo:

   | Etiqueta   | Nombre del campo | Tipo               |
   | ---------- | ---------------- | ------------------ |
   | Color real | `color_hex`      | Selector de color   |

3. **Reglas de ubicación**: "Taxonomía" → **es igual a** → **"Color"** (el
   atributo `pa_color`). Si no aparece "Taxonomía" como opción, busca
   "Término de taxonomía" — el nombre exacto varía un poco según la versión
   de ACF, pero la idea es la misma: se aplica a los **términos** del
   atributo Color, no a los productos.
4. Publicar.

### Paso 2 — Elegir el color real de cada término

1. Ve a **Productos → Atributos → Color → Configurar términos**.
2. Para cada color que ya tengas (Celeste, Rosado, Negro, etc.), haz clic para
   **editarlo** — debería aparecer el campo "Color real" con la paleta de
   selección.
3. Elige el tono exacto que corresponde y **Actualizar**.
4. Repite para todos los colores. Los que no configures aquí seguirán
   usando el diccionario de respaldo del frontend (no se rompe nada mientras
   vas actualizando de a poco).

### Paso 3 — Endpoint que expone los colores reales

Nuevo snippet en **Code Snippets** (título: "Endpoint colores reales"):

```php
add_action('rest_api_init', function () {
	register_rest_route('coco/v1', '/color-swatches', [
		'methods'             => 'GET',
		'callback'            => 'coco_get_color_swatches',
		'permission_callback' => '__return_true', // no es información sensible
	]);
});

function coco_get_color_swatches() {
	$terms = get_terms([
		'taxonomy'   => 'pa_color',
		'hide_empty' => false,
	]);

	if (is_wp_error($terms)) {
		return [];
	}

	return array_map(function ($term) {
		return [
			'name' => $term->name,
			'hex'  => function_exists('get_field') ? (get_field('color_hex', $term) ?: null) : null,
		];
	}, $terms);
}
```

**Run everywhere** → **Save and Activate**.

### Paso 4 — Probar

Abre en el navegador:

```
https://beige-newt-613576.hostingersite.com/wp-json/coco/v1/color-swatches
```

Deberías ver un JSON tipo `[{"name":"Celeste","hex":"#7dd3fc"}, ...]`. Los
colores que aún no configuraste en el Paso 2 saldrán con `"hex":null` — el
frontend los detecta y usa el diccionario de respaldo automáticamente para
esos, sin romper nada.

### Cómo lo lee el frontend (referencia técnica)

El endpoint se consume en `fetchColorSwatches()` dentro de
`src/lib/shared/services/woocommerce.server.ts`, junto con cada carga de
productos. Por cada color de un producto:

1. Busca el nombre en el mapa de `color-swatches` (el hex real de WordPress).
2. Si no está ahí, cae al diccionario/búsqueda difusa de nombres en español.
3. Si tampoco encuentra nada, usa un gris neutro (`#CCCCCC`).

Así el sitio nunca se rompe mientras vas configurando los colores reales de a
poco, pero cada uno que configures deja de depender de adivinar.
