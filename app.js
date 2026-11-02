(() => {
  const CLAVE = "requerimientos.v1";
  const { generarMarkdown, nombreArchivo } = window.Generar;

  const $ = (id) => document.getElementById(id);
  const contTipos = $("tipos");
  const formulario = $("formulario");
  const salida = $("markdown");
  const botonCopiar = $("copiar");

  let cfg;
  // Los valores se comparten entre tipos por id de campo: cambiar de tipo no borra lo escrito
  let borrador = { tipo: "feature", valores: {}, ...leerBorrador() };

  function leerBorrador() {
    try {
      return JSON.parse(localStorage.getItem(CLAVE)) || {};
    } catch {
      return {};
    }
  }

  function guardarBorrador() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(borrador));
    } catch {
      /* sin almacenamiento: solo no se recuerda el borrador */
    }
  }

  const tipoActual = () => cfg.tipos.find((t) => t.id === borrador.tipo) || cfg.tipos[0];

  // ---------- Formulario ----------

  function crearControl(id, campo) {
    let el;
    if (campo.tipo === "texto" || campo.tipo === "fecha") {
      el = document.createElement("input");
      el.type = campo.tipo === "fecha" ? "date" : "text";
    } else if (campo.tipo === "opciones") {
      el = document.createElement("select");
      el.append(new Option("—", ""), ...campo.opciones.map((o) => new Option(o, o)));
    } else {
      el = document.createElement("textarea");
      el.rows = campo.tipo === "codigo" ? 6 : 3;
      if (campo.tipo === "codigo") el.classList.add("mono");
    }
    el.id = "campo-" + id;
    el.name = id;
    if (campo.ayuda && el.tagName !== "SELECT") el.placeholder = campo.ayuda;
    el.value = borrador.valores[id] || "";
    return el;
  }

  function ajustarAlto(el) {
    if (el.tagName !== "TEXTAREA") return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + 2 + "px";
  }

  function pintarFormulario() {
    const tipo = tipoActual();
    for (const b of contTipos.children) b.setAttribute("aria-selected", String(b.dataset.tipo === tipo.id));
    formulario.replaceChildren(
      ...tipo.campos.map((id) => {
        const campo = cfg.campos[id];
        const etiqueta = document.createElement("label");
        etiqueta.className = "campo";
        etiqueta.htmlFor = "campo-" + id;
        const nombre = document.createElement("span");
        nombre.textContent = campo.etiqueta;
        etiqueta.append(nombre);
        const fila = document.createElement("div");
        fila.className = "fila";
        fila.append(etiqueta, crearControl(id, campo));
        return fila;
      })
    );
    formulario.querySelectorAll("textarea").forEach(ajustarAlto);
    pintarVista();
  }

  function pintarVista() {
    const md = generarMarkdown(cfg, tipoActual(), borrador.valores);
    salida.textContent = md || "Pega el texto crudo para armar el prompt.";
    salida.classList.toggle("vacia", !md);
    botonCopiar.disabled = $("descargar").disabled = !md;
  }

  formulario.addEventListener("input", (e) => {
    borrador.valores[e.target.name] = e.target.value;
    ajustarAlto(e.target);
    guardarBorrador();
    pintarVista();
  });

  contTipos.addEventListener("click", (e) => {
    const b = e.target.closest("[data-tipo]");
    if (!b) return;
    borrador.tipo = b.dataset.tipo;
    guardarBorrador();
    pintarFormulario();
  });

  $("limpiar").addEventListener("click", () => {
    if (!confirm(`¿Borrar los campos de "${tipoActual().nombre}"?`)) return;
    for (const id of tipoActual().campos) delete borrador.valores[id];
    guardarBorrador();
    pintarFormulario();
  });

  // ---------- Copiar y descargar ----------

  async function copiar(texto) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
    // Respaldo para http: textarea temporal + execCommand
    const area = document.createElement("textarea");
    area.value = texto;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    area.setSelectionRange(0, texto.length);
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }

  botonCopiar.addEventListener("click", async () => {
    let ok = false;
    try {
      ok = await copiar(salida.textContent);
    } catch {
      ok = false;
    }
    botonCopiar.textContent = ok ? "Copiado ✓" : "No se pudo copiar";
    botonCopiar.classList.toggle("copiado", ok);
    setTimeout(() => {
      botonCopiar.textContent = "Copiar";
      botonCopiar.classList.remove("copiado");
    }, 1600);
  });

  $("descargar").addEventListener("click", () => {
    const tipo = tipoActual();
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(new Blob([salida.textContent], { type: "text/markdown;charset=utf-8" }));
    enlace.download = nombreArchivo(new Date(), borrador.valores.titulo || tipo.nombre);
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
  });

  // ---------- Inicio ----------

  fetch("plantillas.json", { cache: "no-cache" })
    .then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then((datos) => {
      cfg = datos;
      contTipos.replaceChildren(
        ...cfg.tipos.map((t) => {
          const b = document.createElement("button");
          b.type = "button";
          b.setAttribute("role", "tab");
          b.dataset.tipo = t.id;
          b.textContent = t.nombre;
          return b;
        })
      );
      pintarFormulario();
    })
    .catch(() => {
      salida.textContent = "No se pudo leer plantillas.json. Revisa que exista y que sea JSON válido.";
      salida.classList.add("vacia");
    });
})();
