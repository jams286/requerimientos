# requerimientos (casa)

Tracker: requerimientos

Generador de requerimientos en Markdown para pasarle a Claude (PC y celular, vía el hub `infra/home`).

## Qué hace

- Cinco tipos: Idea suelta, Feature, Bug, Requerimiento de cliente y Libre. Campos y orden por tipo en `plantillas.json` (ver README).
- Vista previa en vivo del Markdown, en texto plano (lo mismo que se copia). Los campos vacíos no salen.
- Copiar y Descargar `.md` (`AAAA-MM-DD-<titulo>.md`, slug sin tildes; sin título usa el nombre del tipo).
- Libre: arma un prompt para que Claude estructure el texto crudo con la plantilla del tipo sugerido, sin inventar alcance y terminando con preguntas abiertas. Sin texto crudo no genera nada.
- Botón Limpiar: borra solo los campos del tipo actual (con confirmación).

## Cómo está hecho

Sitio estático, sin frameworks ni paso de build:

- `generar.js`: lógica pura (sin DOM) que arma el Markdown y el nombre de archivo. La usan `app.js` (como `window.Generar`) y `prueba.js` (node, asserts).
- `app.js` (IIFE): lee `plantillas.json` con `fetch` (`no-cache`), arma pestañas y formulario, y repinta la vista en cada `input`.
- Borrador en `localStorage` (clave `requerimientos.v1`): `{ tipo, valores }`, con los valores por id de campo **compartidos entre tipos**, así cambiar de tipo no borra lo escrito.
- Listas: una línea por elemento; se quitan viñetas, números o casillas pegados. Bloques de código con una cerca más larga que cualquier racha de backticks del texto.
- Copiar: `navigator.clipboard` y, si no hay o falla, el respaldo `<textarea>` + `execCommand("copy")` (mismo patrón que `contrasenas`).
- Móvil: Copiar y Descargar fijos abajo; desde 900 px, dos columnas con la vista previa fija a la derecha. Inputs a 16 px para que iOS no haga zoom.
- Paleta y fuente (Atkinson Hyperlegible) iguales a `contrasenas`. Ícono propio (documento verde azulado): `favicon.svg`; `favicon.ico` y `apple-touch-icon.png` se dibujaron con Pillow imitando el SVG (el servidor no tiene renderizador SVG). En el hub es `iconos/requerimientos.svg`, copia del favicon.

## Dónde se publica

- URL: https://192.168.1.4/requerimientos/
- Carpeta: `/var/www/requerimientos/` (de jams, sin sudo). Comando de publicación en el README.

## Decisiones (2 nov 2026)

- Nombre `requerimientos`. Sin servicio ni respaldo: no guarda nada en el servidor.
- Config en JSON y no en YAML: el navegador lo lee sin librerías.
- Campos acordados con Jams; se agregaron Título, Contexto, Referencias, "Cómo quiero que trabaje Claude" y campos propios por tipo (severidad, frecuencia, pedido original, tipo sugerido, etc.).
