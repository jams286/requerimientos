// Arma el Markdown (o el prompt del modo Libre) a partir de plantillas.json y los valores del formulario.
// Sin DOM: lo usa app.js en el navegador y prueba.js en node.
(() => {
  const EN_LINEA = new Set(["texto", "fecha", "opciones"]);

  // Una línea por elemento; quita viñetas, números o casillas que vengan pegados
  const elementos = (x) =>
    x.split("\n").map((l) => l.trim().replace(/^([-*•]\s+(\[[ xX]\]\s+)?|\d+[.)]\s+)/, "")).filter(Boolean);

  // Cerca más larga que cualquier racha de ``` dentro del texto, para que no se rompa el bloque
  function bloqueCodigo(x) {
    const racha = Math.max(2, ...(x.match(/`+/g) || []).map((r) => r.length));
    const cerca = "`".repeat(racha + 1);
    return `${cerca}\n${x}\n${cerca}`;
  }

  function cuerpo(tipo, x) {
    switch (tipo) {
      case "lista": return elementos(x).map((l) => `- ${l}`).join("\n");
      case "pasos": return elementos(x).map((l, i) => `${i + 1}. ${l}`).join("\n");
      case "checklist": return elementos(x).map((l) => `- [ ] ${l}`).join("\n");
      case "codigo": return bloqueCodigo(x);
      case "cita": return x.split("\n").map((l) => (l.trim() ? `> ${l}` : ">")).join("\n");
      default: return x;
    }
  }

  const limpio = (valores, id) => String(valores[id] ?? "").trim();
  const titulo = (tipo, valores) => `# ${tipo.nombre}${limpio(valores, "titulo") ? ": " + limpio(valores, "titulo") : ""}`;

  function generarMarkdown(cfg, tipo, valores) {
    if (tipo.prompt) return generarPrompt(cfg, tipo, valores);
    const datos = [];
    const secciones = [];
    for (const id of tipo.campos) {
      const campo = cfg.campos[id];
      const x = limpio(valores, id);
      if (id === "titulo" || !x) continue;
      if (EN_LINEA.has(campo.tipo)) datos.push(`- **${campo.etiqueta}:** ${x}`);
      else secciones.push(`## ${campo.etiqueta}\n\n${cuerpo(campo.tipo, x)}`);
    }
    return [titulo(tipo, valores), datos.join("\n"), ...secciones].filter(Boolean).join("\n\n") + "\n";
  }

  function generarPrompt(cfg, tipo, valores) {
    const crudos = tipo.campos.filter((id) => !EN_LINEA.has(cfg.campos[id].tipo));
    if (crudos.every((id) => !limpio(valores, id))) return "";

    const destino =
      cfg.tipos.find((t) => !t.prompt && t.nombre === limpio(valores, "tipo_sugerido")) ||
      cfg.tipos.find((t) => t.id === "feature");
    // Mismo orden que generarMarkdown: título, datos en línea y luego secciones
    const resto = destino.campos.filter((id) => id !== "titulo");
    const especiales = {
      plantilla_nombre: destino.nombre,
      plantilla: [
        titulo(destino, valores),
        ...resto.filter((id) => EN_LINEA.has(cfg.campos[id].tipo)).map((id) => `- **${cfg.campos[id].etiqueta}:** …`),
        ...resto.filter((id) => !EN_LINEA.has(cfg.campos[id].tipo)).map((id) => `## ${cfg.campos[id].etiqueta}`),
      ].join("\n"),
      datos: tipo.campos
        .filter((id) => !["titulo", "tipo_sugerido"].includes(id) && EN_LINEA.has(cfg.campos[id].tipo) && limpio(valores, id))
        .map((id) => `- **${cfg.campos[id].etiqueta}:** ${limpio(valores, id)}`)
        .join("\n"),
    };
    return tipo.prompt
      .join("\n")
      .replace(/\{\{(\w+)\}\}/g, (_, k) =>
        k in especiales ? especiales[k] : cfg.campos[k] && limpio(valores, k) ? cuerpo(cfg.campos[k].tipo, limpio(valores, k)) : "")
      .replace(/\n{3,}/g, "\n\n")
      .trim() + "\n";
  }

  function nombreArchivo(fecha, texto) {
    const dia = [fecha.getFullYear(), fecha.getMonth() + 1, fecha.getDate()].map((n) => String(n).padStart(2, "0")).join("-");
    const slug = texto
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/, "");
    return `${dia}-${slug || "requerimiento"}.md`;
  }

  const api = { generarMarkdown, nombreArchivo };
  if (typeof module !== "undefined") module.exports = api;
  else window.Generar = api;
})();
