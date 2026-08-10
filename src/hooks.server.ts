import { setDefaultResultOrder } from 'node:dns';

// El dominio de WordPress (Hostinger) resuelve primero a direcciones IPv6, pero
// muchas redes no tienen ruta IPv6 hacia el hosting: Node intenta IPv6 y falla
// con "fetch failed". Los navegadores lo evitan probando IPv4 e IPv6 en paralelo
// (Happy Eyeballs); Node no lo hace por defecto. Forzar IPv4 primero hace que
// las peticiones a WooCommerce usen la ruta que sí funciona.
setDefaultResultOrder('ipv4first');
