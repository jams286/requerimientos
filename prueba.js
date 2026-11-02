// Self-check del generador: node prueba.js
const assert = require("node:assert/strict");
const cfg = require("./plantillas.json");
const { generarMarkdown, nombreArchivo } = require("./generar.js");

const tipo = (id) => cfg.tipos.find((t) => t.id === id);

// Todos los campos que usa cada tipo existen en el config
for (const t of cfg.tipos) for (const id of t.campos) assert.ok(cfg.campos[id], `${t.id}: falta el campo ${id}`);

// Vacío: solo el título del tipo
assert.equal(generarMarkdown(cfg, tipo("feature"), {}), "# Feature\n");

// Datos en línea, listas normalizadas, checklist y vacíos omitidos
assert.equal(
  generarMarkdown(cfg, tipo("feature"), { titulo: " CSV ", proyecto: "casa/x", alcance: "- uno\n\n2. dos", criterios: "* [ ] a\nb", ui: "   " }),
  "# Feature: CSV\n\n- **Proyecto / repo:** casa/x\n\n## Alcance\n\n- uno\n- dos\n\n## Criterios de aceptación\n\n- [ ] a\n- [ ] b\n"
);

// Pasos numerados, cita y bloque de código que no se rompe con ``` adentro
const bug = generarMarkdown(cfg, tipo("bug"), { pasos: "abrir\ncerrar", logs: "x ```y``` z" });
assert.match(bug, /## Pasos para reproducir\n\n1\. abrir\n2\. cerrar/);
assert.match(bug, /````\nx ```y``` z\n````/);
assert.match(generarMarkdown(cfg, tipo("cliente"), { pedido_original: "hola\n\nchao" }), /> hola\n>\n> chao/);

// Libre: sin texto no hay prompt; con texto usa la plantilla sugerida (o Feature)
assert.equal(generarMarkdown(cfg, tipo("libre"), { titulo: "t" }), "");
const libre = generarMarkdown(cfg, tipo("libre"), { texto_crudo: "arreglen el login", origen: "WhatsApp", tipo_sugerido: "Bug" });
assert.match(libre, /plantilla «Bug»/);
assert.match(libre, /- \*\*Origen:\*\* WhatsApp/);
assert.match(libre, /- \*\*Severidad:\*\* …/);
assert.match(libre, /## Pasos para reproducir/);
assert.match(libre, /```\narreglen el login\n```\n$/);
assert.doesNotMatch(libre, /\{\{|\n{3}/);
assert.match(generarMarkdown(cfg, tipo("libre"), { texto_crudo: "x" }), /plantilla «Feature»/);

// Nombre de archivo: fecha local + slug sin tildes
assert.equal(nombreArchivo(new Date(2026, 10, 2), "Exportar a CSV: ¡ya!"), "2026-11-02-exportar-a-csv-ya.md");
assert.equal(nombreArchivo(new Date(2026, 0, 5), "¿?"), "2026-01-05-requerimiento.md");

console.log("ok");
