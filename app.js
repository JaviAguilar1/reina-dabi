import { firebaseConfig, firebaseListo, negocio } from "./firebase-config.js";

const FB = "https://www.gstatic.com/firebasejs/10.12.2/";
let db = null, dbApi = null;

async function iniciarFirebase() {
  if (!firebaseListo) return;
  try {
    const { initializeApp } = await import(FB + "firebase-app.js");
    dbApi = await import(FB + "firebase-database.js");
    db = dbApi.getDatabase(initializeApp(firebaseConfig));
  } catch (e) { console.warn("Firebase no disponible", e); db = null; }
}

const linkWA = (texto) => `https://wa.me/${negocio.whatsapp}?text=${encodeURIComponent(texto)}`;
const hoy = () => new Date().toLocaleDateString("en-CA"); // AAAA-MM-DD en hora local

// ---------- Contador de clics (invisible) ----------
function contar(boton) {
  if (!db) return;
  const r = dbApi.ref(db, `web/stats/clics/${hoy()}/${boton}`);
  dbApi.set(r, dbApi.increment(1)).catch((e) => console.warn("No se pudo contar", e));
}

// ---------- Botones de WhatsApp generales ----------
const MSJ_GENERAL = "¡Hola! Vi su página y quiero consultar por un ramo 🌹";
document.querySelectorAll("[data-wa]").forEach((a) => {
  a.href = linkWA(MSJ_GENERAL);
  a.addEventListener("click", () => contar(a.dataset.wa));
});

// ---------- Galería (desde la base, con respaldo fijo) ----------
async function cargarGaleria() {
  if (!db) return;
  const snap = await dbApi.get(dbApi.ref(db, "web/galeria")).catch(() => null);
  if (!snap || !snap.exists()) return; // queda la galería fija del HTML
  const fotos = Object.values(snap.val()).sort((a, b) => a.orden - b.orden);
  const cont = document.getElementById("galeria");
  cont.replaceChildren(...fotos.map((f) => {
    const fig = document.createElement("figure");
    const img = document.createElement("img");
    img.src = f.src; img.alt = f.texto || "Ramo de rosas eternas"; img.loading = "lazy";
    fig.append(img);
    if (f.texto) { const c = document.createElement("figcaption"); c.textContent = f.texto; fig.append(c); }
    return fig;
  }));
}

// ---------- Armador de ramo ----------
const COLORES = [
  ["Rojo", "#d32f2f"], ["Bordó", "#7b1f3a"], ["Rosa", "#f48fb1"], ["Rosa viejo", "#c48793"],
  ["Fucsia", "#d81b78"], ["Blanco", "#ffffff"], ["Marfil", "#f3ead2"], ["Amarillo", "#fbc02d"],
  ["Naranja", "#fb8c00"], ["Lila", "#b39ddb"], ["Violeta", "#7e57c2"], ["Celeste", "#81d4fa"],
  ["Azul", "#1e4fb3"], ["Verde", "#43a047"], ["Verde agua", "#7fd6c2"], ["Dorado", "#c9a24a"],
  ["Plateado", "#c0c0c0"], ["Negro", "#222222"]
];
const EXTRAS = ["🦋 Mariposas", "🤍 Perlas", "👑 Corona", "🍫 Bombones", "💡 Luces", "🌸 Perfumadas", "💌 Tarjeta"];
const MAX_COLORES = 3;

const $ = (id) => document.getElementById(id);
const elegidos = [];

const selCant = $("cantidad");
for (let n = 3; n <= 25; n++) selCant.add(new Option(`${n} rosas`, n, false, n === 12));

const contColores = $("colores");
COLORES.forEach(([nombre, hex]) => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "color"; b.setAttribute("aria-pressed", "false");
  b.innerHTML = `<i style="background:${hex}"></i>${nombre}`;
  b.addEventListener("click", () => {
    const i = elegidos.indexOf(nombre);
    if (i >= 0) elegidos.splice(i, 1); else if (elegidos.length < MAX_COLORES) elegidos.push(nombre);
    actualizar();
  });
  b.dataset.color = nombre;
  contColores.append(b);
});

const contExtras = $("extras");
EXTRAS.forEach((e) => {
  const l = document.createElement("label"); l.className = "opcion";
  l.innerHTML = `<input type="checkbox" value="${e.slice(e.indexOf(" ") + 1)}"><span>${e}</span>`;
  contExtras.append(l);
});

const fecha = $("fecha");
const hoyStr = new Date().toLocaleDateString("en-CA");
const lim48 = new Date(); lim48.setDate(lim48.getDate() + 2);
const lim48Str = lim48.toLocaleDateString("en-CA");
fecha.min = hoyStr; // se puede elegir cualquier fecha desde hoy

$("con-cinta").addEventListener("change", (e) => { $("cinta-box").hidden = !e.target.checked; actualizar(); });
$("cinta").addEventListener("input", (e) => { $("cinta-n").textContent = e.target.value.length; });
$("form-ramo").addEventListener("input", actualizar);
$("form-ramo").addEventListener("change", actualizar);

function datos() {
  const extras = [...contExtras.querySelectorAll("input:checked")].map((i) => i.value);
  const f = fecha.value ? new Date(fecha.value + "T12:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" }) : "";
  return {
    ocasion: $("ocasion").value,
    cantidad: selCant.value,
    colores: elegidos.length ? elegidos.join(", ") : "A elección",
    envoltorio: $("envoltorio").value,
    cinta: $("con-cinta").checked ? ($("cinta").value.trim() || "(a definir)") : "",
    extras: extras.join(", "),
    fecha: f,
    entrega: document.querySelector("input[name=entrega]:checked").value,
    nombre: $("nombre").value.trim(),
    comentarios: $("comentarios").value.trim()
  };
}

function actualizar() {
  contColores.querySelectorAll(".color").forEach((b) => {
    const on = elegidos.includes(b.dataset.color);
    b.setAttribute("aria-pressed", on);
    b.disabled = !on && elegidos.length >= MAX_COLORES;
  });
  const d = datos();
  const filas = [
    ["Ocasión", d.ocasion], ["Rosas", d.cantidad], ["Colores", d.colores], ["Envoltorio", d.envoltorio],
    ["Cinta", d.cinta ? `"${d.cinta}"` : "Sin cinta"], ["Extras", d.extras || "Ninguno"],
    ["Fecha", d.fecha || "A definir"], ["Entrega", d.entrega]
  ];
  $("resumen").replaceChildren(...filas.map(([k, v]) => {
    const li = document.createElement("li");
    const b = document.createElement("b"); b.textContent = k;
    const s = document.createElement("span"); s.textContent = v;
    li.append(b, s); return li;
  }));
  $("nota-fecha").hidden = !(fecha.value && fecha.value < lim48Str);
  $("error-ramo").textContent = "";
}

function mensaje(d) {
  const l = [`¡Hola Reina Dabi! 🌹 Quiero pedir un ramo${d.nombre ? `, soy ${d.nombre}` : ""}:`, "",
    `• Ocasión: ${d.ocasion}`, `• Cantidad: ${d.cantidad} rosas`, `• Colores: ${d.colores}`, `• Envoltorio: ${d.envoltorio}`];
  if (d.cinta) l.push(`• Cinta con mensaje: "${d.cinta}"`);
  if (d.extras) l.push(`• Extras: ${d.extras}`);
  l.push(`• Para: ${d.fecha || "a coordinar"}`, `• Entrega: ${d.entrega}`);
  if (d.comentarios) l.push(`• Comentarios: ${d.comentarios}`);
  l.push("", "¿Me pasan el presupuesto? ¡Gracias!");
  return l.join("\n");
}

$("enviar-ramo").addEventListener("click", (ev) => {
  if (fecha.value && fecha.value < hoyStr) {
    ev.preventDefault();
    $("error-ramo").textContent = "Esa fecha ya pasó. Elegí otra.";
    return;
  }
  ev.currentTarget.href = linkWA(mensaje(datos()));
  contar("armador");
});

// ---------- Tamaños sugeridos ----------
document.querySelectorAll(".tamano").forEach((b) => b.addEventListener("click", () => {
  selCant.value = b.dataset.rosas; actualizar();
  document.getElementById("armador").scrollIntoView({ behavior: "smooth" });
}));

// ---------- Testimonios (simulación: solo con ?demo en la URL) ----------
if (new URLSearchParams(location.search).has("demo")) document.getElementById("testimonios").hidden = false;

// ---------- Banner de fecha especial (se maneja desde el panel) ----------
async function cargarBanner() {
  if (!db) return;
  const s = await dbApi.get(dbApi.ref(db, "web/config/banner")).catch(() => null);
  const b = s && s.val();
  if (!b || !b.activo || !b.texto) return;
  const el = document.getElementById("banner");
  el.textContent = b.texto + " ";
  const a = document.createElement("a"); a.href = "#armador"; a.textContent = "Armá tu ramo →";
  el.append(a); el.hidden = false;
}

actualizar();
await iniciarFirebase();
cargarGaleria();
cargarBanner();
