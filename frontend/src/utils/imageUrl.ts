/**
 * Construye la URL completa para una imagen de producto.
 *
 * El backend devuelve solo el nombre del archivo (ej. "a1b2c3d4.jpg").
 * Este helper construye la URL accesible según VITE_API_URL.
 *
 * Ejemplo:
 *   VITE_API_URL = "http://localhost:8080"
 *   getImageUrl("abc.jpg") → "http://localhost:8080/uploads/productos/abc.jpg"
 */
export function getImageUrl(img?: string | null): string | undefined {
  if (!img) return undefined;

  // Si ya es URL completa, devolver tal cual
  if (img.startsWith('http://') || img.startsWith('https://')) {
    return img;
  }

  const base = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080';
  const cleanBase = base.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  return `${cleanBase}/uploads/productos/${img}`;
}
