# requerimientos

Convierte ideas, features, bugs y pedidos de clientes (o texto crudo de un chat, correo o reunión) en un requerimiento en Markdown para pasárselo a Claude: se copia o se descarga como `.md`. Todo pasa en el navegador; nada se guarda en el servidor.

Publicado en https://192.168.1.4/requerimientos/ (también desde el hub Home).

## Tipos

- **Idea suelta**, **Feature**, **Bug** y **Requerimiento de cliente**: formulario con los campos de cada tipo; los vacíos no salen en el resultado.
- **Libre**: pegas el texto crudo y sale un prompt que le pide a Claude estructurarlo con la plantilla del tipo sugerido (Feature si no eliges), sin inventar alcance y con las preguntas que falten.

## Cambiar los campos

Todo está en `plantillas.json`, sin tocar código:

- `campos`: cada campo con su `etiqueta`, `tipo` y `ayuda` (texto de ejemplo dentro del campo).
- `tipos`: cada tipo lista los ids de sus campos en el orden en que salen.
- Tipos de campo: `texto`, `fecha` y `opciones` (con `opciones: [...]`) van como `- **Etiqueta:** valor` bajo el título; `area` es un párrafo, `lista` viñetas, `pasos` lista numerada, `checklist` casillas `- [ ]`, `codigo` bloque de código y `cita` texto citado.
- El prompt del modo Libre está en `tipos[libre].prompt` (una línea por elemento). Placeholders: `{{plantilla_nombre}}`, `{{plantilla}}`, `{{datos}}` y `{{<id de campo>}}`.

Después de editar, correr la prueba y publicar.

## Probar

```
node prueba.js
```

## Publicar

```
rsync -a --delete --exclude .git --exclude README.md --exclude CLAUDE.md --exclude prueba.js ~/proyectos/casa/requerimientos/ /var/www/requerimientos/
```
