// Vista previa ilustrativa del ramo: 2D (SVG) y 3D (three.js, se carga solo si se abre)
const ENVOLTORIOS = {
  "A elección de Reina Dabi": ["#f6dfe7", "#e9c7d3"], "Blanco": ["#f7f4f1", "#e3ddd7"], "Negro": ["#2b2b2b", "#151515"],
  "Rosa": ["#f7bfd0", "#ec9fb7"], "Lila": ["#d3c2ec", "#b9a3de"], "Celeste": ["#c3e6f6", "#9fd4ee"],
  "Dorado": ["#e2c47a", "#c9a24a"], "Papel diario": ["#ece6d8", "#d6cdb9"]
};
const DEFAULT_ROSA = ["#e34d6f", "#f48fb1"];
let estado = null, modo = "2d", t3 = null;

// Posiciones en espiral (filotaxis): reparte n rosas en un círculo de radio 1
function posiciones(n) {
  const out = [], ang = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const r = n === 1 ? 0 : Math.sqrt((i + 0.5) / n);
    out.push([r * Math.cos(i * ang), r * Math.sin(i * ang), r]);
  }
  return out;
}
const colorDe = (e, i) => (e.colores.length ? e.colores : DEFAULT_ROSA)[i % (e.colores.length || DEFAULT_ROSA.length)];
const oscurecer = (hex, k = 0.7) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, "0");
  return "#" + f(n >> 16) + f((n >> 8) & 255) + f(n & 255);
};

// ---------------------------------------------------------------- 2D
function rosaSVG(cx, cy, r, col) {
  const os = oscurecer(col, 0.72), cl = oscurecer(col, 1.12);
  let s = `<g><circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}" stroke="${os}" stroke-width="${r * 0.06}"/>`;
  for (let k = 0; k < 5; k++) {
    const a = (k / 5) * Math.PI * 2, rr = r * 0.62;
    s += `<path d="M${cx} ${cy} Q${cx + Math.cos(a) * rr * 1.5} ${cy + Math.sin(a) * rr * 1.5} ${cx + Math.cos(a + 1.1) * rr} ${cy + Math.sin(a + 1.1) * rr}" fill="none" stroke="${os}" stroke-width="${r * 0.07}" stroke-linecap="round" opacity=".55"/>`;
  }
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 0.38}" fill="${cl}" stroke="${os}" stroke-width="${r * 0.06}"/>`;
  s += `<path d="M${cx - r * 0.18} ${cy} a${r * 0.18} ${r * 0.18} 0 1 1 ${r * 0.18} ${r * 0.18}" fill="none" stroke="${os}" stroke-width="${r * 0.06}"/></g>`;
  return s;
}
function mariposaSVG(x, y, s, col) {
  return `<g transform="translate(${x} ${y}) rotate(-20) scale(${s})" opacity=".95">
    <path d="M0 0 C-14 -18 -30 -10 -24 4 C-20 14 -6 10 0 2Z" fill="${col}" stroke="#8a6d1f" stroke-width="1"/>
    <path d="M0 0 C14 -18 30 -10 24 4 C20 14 6 10 0 2Z" fill="${col}" stroke="#8a6d1f" stroke-width="1"/>
    <path d="M0 2 C-10 8 -16 20 -6 20 C-2 18 0 10 0 4Z M0 2 C10 8 16 20 6 20 C2 18 0 10 0 4Z" fill="${col}" opacity=".8"/>
    <rect x="-1.2" y="-6" width="2.4" height="24" rx="1.2" fill="#5b4614"/></g>`;
}
function dibujar2D(el, e) {
  const W = 300, C = 150, R = 118;
  const env = ENVOLTORIOS[e.envoltorio] || ENVOLTORIOS["A elección de Reina Dabi"];
  const n = e.cantidad, bomb = e.extras.includes("Bombones");
  // papel: estrella de puntas
  let papel = "";
  for (const [rad, col, off] of [[R + 26, env[1], 0], [R + 14, env[0], Math.PI / 12]]) {
    let d = "";
    for (let i = 0; i < 24; i++) {
      const a = off + (i / 24) * Math.PI * 2, rr = i % 2 ? rad * 0.86 : rad;
      d += (i ? "L" : "M") + (C + Math.cos(a) * rr).toFixed(1) + " " + (C + Math.sin(a) * rr).toFixed(1);
    }
    papel += `<path d="${d}Z" fill="${col}" stroke="${oscurecer(col, 0.85)}" stroke-width="1"/>`;
  }
  const area = R * 0.9, rRosa = Math.max(14, Math.min(46, area * 0.95 / Math.sqrt(n + (bomb ? 4 : 0))));
  const pos = posiciones(n + (bomb ? Math.max(3, Math.round(n * 0.3)) : 0));
  const nb = bomb ? pos.length - n : 0;
  let rosas = "", bombones = "", perlas = "";
  pos.forEach(([x, y], i) => {
    const px = C + x * (area - rRosa * 0.6), py = C + y * (area - rRosa * 0.6);
    if (i < nb) {
      bombones += `<circle cx="${px}" cy="${py}" r="${rRosa * 0.62}" fill="url(#oro)" stroke="#8a6d1f" stroke-width="1.2"/>`;
    } else {
      rosas += rosaSVG(px, py, rRosa, colorDe(e, i - nb));
      if (e.extras.includes("Perlas") && (i % 2 === 0)) perlas += `<circle cx="${px}" cy="${py}" r="${rRosa * 0.13}" fill="#fffdf5" stroke="#d8cfbf" stroke-width=".8"/>`;
    }
  });
  let extras = "";
  if (e.extras.includes("Mariposas")) extras += mariposaSVG(C + 70, C - 62, 1.1, "#e2c047") + mariposaSVG(C - 78, C + 40, 0.85, "#cfd6e6");
  if (e.extras.includes("Corona")) extras += `<g transform="translate(${C} ${C - 30})"><path d="M-30 12 L-34 -14 L-17 0 L0 -22 L17 0 L34 -14 L30 12Z" fill="url(#oro)" stroke="#8a6d1f" stroke-width="1.5"/>
      <circle cx="0" cy="-22" r="3.5" fill="#fff"/><circle cx="-34" cy="-14" r="3" fill="#fff"/><circle cx="34" cy="-14" r="3" fill="#fff"/></g>`;
  if (e.cinta) extras += `<g><path id="arcoCinta" d="M${C - 115} ${C + 20} Q${C} ${C - 30} ${C + 115} ${C + 20}" fill="none"/>
      <path d="M${C - 115} ${C + 20} Q${C} ${C - 30} ${C + 115} ${C + 20}" fill="none" stroke="#fffaf5" stroke-width="26" stroke-linecap="butt" opacity=".96"/>
      <text font-family="Great Vibes, cursive" font-size="21" fill="#3b2630"><textPath href="#arcoCinta" startOffset="50%" text-anchor="middle" dominant-baseline="middle">${e.cinta.replace(/[<&>]/g, "")}</textPath></text></g>`;
  const glow = e.extras.includes("Luces") ? `<circle cx="${C}" cy="${C}" r="${R + 30}" fill="url(#luz)"/>` : "";
  el.innerHTML = `<svg viewBox="0 0 ${W} ${W}" role="img" aria-label="Vista ilustrativa del ramo de ${n} rosas">
    <defs><radialGradient id="oro" cx=".35" cy=".35"><stop offset="0" stop-color="#fff2b8"/><stop offset=".55" stop-color="#d9b44a"/><stop offset="1" stop-color="#8a6d1f"/></radialGradient>
    <radialGradient id="luz"><stop offset=".5" stop-color="#fff6c8" stop-opacity=".0"/><stop offset=".8" stop-color="#ffe98a" stop-opacity=".45"/><stop offset="1" stop-color="#ffe98a" stop-opacity="0"/></radialGradient></defs>
    ${glow}${papel}${bombones}${rosas}${perlas}${extras}</svg>`;
}

// ---------------------------------------------------------------- 3D
async function cargarThree() {
  if (window.THREE) return window.THREE;
  await new Promise((ok, mal) => {
    const s = document.createElement("script");
    s.src = "vendor/three.min.js"; // three.js r128 (MIT), servido desde el mismo sitio
    s.onload = ok; s.onerror = mal; document.head.append(s);
  });
  return window.THREE;
}
function rosa3D(T, col) {
  const g = new T.Group();
  const mat = new T.MeshStandardMaterial({ color: col, roughness: 0.38, metalness: 0.08, side: T.DoubleSide });
  // capas de pétalos: copas (lathe) cada vez más cerradas
  const capas = [[0.95, 0.55, 5], [0.75, 0.68, 5], [0.55, 0.8, 4], [0.34, 0.9, 3]];
  capas.forEach(([rad, alto, pet], ci) => {
    for (let p = 0; p < pet; p++) {
      const pts = [];
      for (let k = 0; k <= 8; k++) { const t = k / 8; pts.push(new T.Vector2(rad * (0.25 + 0.75 * Math.sin(t * Math.PI * 0.5)), t * alto)); }
      const geo = new T.LatheGeometry(pts, 10, 0, (Math.PI * 2) / pet * 1.25);
      const m = new T.Mesh(geo, mat);
      m.rotation.y = (p / pet) * Math.PI * 2 + ci * 0.6;
      g.add(m);
    }
  });
  const centro = new T.Mesh(new T.SphereGeometry(0.2, 12, 10), new T.MeshStandardMaterial({ color: oscurecer(col, 0.8), roughness: 0.5 }));
  centro.position.y = 0.7; centro.scale.set(1, 1.4, 1); g.add(centro);
  return g;
}
async function iniciar3D(el) {
  const T = await cargarThree();
  const ancho = el.clientWidth || 300;
  const ren = new T.WebGLRenderer({ antialias: true, alpha: true });
  ren.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  ren.setSize(ancho, ancho);
  el.replaceChildren(ren.domElement);
  const esc = new T.Scene();
  const cam = new T.PerspectiveCamera(38, 1, 0.1, 100);
  esc.add(new T.HemisphereLight(0xffffff, 0xd9c2c9, 0.85));
  const sol = new T.DirectionalLight(0xffffff, 0.85); sol.position.set(3, 6, 4); esc.add(sol);
  const raiz = new T.Group(); esc.add(raiz);
  let rotY = 0.6, rotX = 0.62, arrastre = null, auto = true, dist = 11;
  const lienzo = ren.domElement; lienzo.style.touchAction = "none"; lienzo.style.cursor = "grab";
  lienzo.addEventListener("pointerdown", (ev) => { arrastre = [ev.clientX, ev.clientY]; auto = false; lienzo.setPointerCapture(ev.pointerId); });
  lienzo.addEventListener("pointermove", (ev) => {
    if (!arrastre) return;
    rotY += (ev.clientX - arrastre[0]) * 0.01; rotX = Math.max(0.15, Math.min(1.35, rotX + (ev.clientY - arrastre[1]) * 0.006));
    arrastre = [ev.clientX, ev.clientY];
  });
  lienzo.addEventListener("pointerup", () => { arrastre = null; });
  let vivo = true;
  function loop() {
    if (!vivo) return;
    if (auto) rotY += 0.004;
    cam.position.set(Math.sin(rotY) * Math.cos(rotX) * dist, Math.sin(rotX) * dist + 0.3, Math.cos(rotY) * Math.cos(rotX) * dist);
    cam.lookAt(0, 0.3, 0);
    ren.render(esc, cam);
    requestAnimationFrame(loop);
  }
  loop();
  return {
    T, raiz, esc, setDist(d) { dist = d; },
    destruir() { vivo = false; ren.dispose(); },
    redimensionar() { const a = el.clientWidth || 300; ren.setSize(a, a); }
  };
}
function armar3D(ctx, e) {
  const { T, raiz, esc } = ctx;
  raiz.clear();
  esc.children.filter((c) => c.userData.luzExtra).forEach((c) => esc.remove(c));
  const env = ENVOLTORIOS[e.envoltorio] || ENVOLTORIOS["A elección de Reina Dabi"];
  const n = e.cantidad, bomb = e.extras.includes("Bombones");
  const R = 1.4 + Math.sqrt(n) * 0.42;
  ctx.setDist(R * 3.1 + 2.5);
  // papel: dos conos abiertos con pliegues
  [[R * 1.32, env[1], 0], [R * 1.18, env[0], Math.PI / 8]].forEach(([rad, col, rot], k) => {
    const cono = new T.Mesh(new T.ConeGeometry(rad, 3.2, 8, 1, true),
      new T.MeshStandardMaterial({ color: col, side: T.DoubleSide, roughness: 0.85, flatShading: true }));
    cono.rotation.x = Math.PI; cono.rotation.y = rot; cono.position.y = -1.0 - k * 0.05; raiz.add(cono);
  });
  const total = n + (bomb ? Math.max(3, Math.round(n * 0.3)) : 0), nb = total - n;
  const pos = posiciones(total), tam = Math.max(0.55, Math.min(1.25, (R * 1.7) / Math.sqrt(total)));
  pos.forEach(([x, y, r], i) => {
    const px = x * (R - tam * 0.5), pz = y * (R - tam * 0.5), py = 0.65 - r * r * 0.9;
    if (i < nb) {
      const b = new T.Mesh(new T.IcosahedronGeometry(tam * 0.45, 1), new T.MeshStandardMaterial({ color: 0xe0b84a, metalness: 0.35, roughness: 0.35, flatShading: true }));
      b.position.set(px, py + 0.25, pz); raiz.add(b);
      return;
    }
    const ro = rosa3D(T, colorDe(e, i - nb));
    ro.scale.setScalar(tam); ro.position.set(px, py, pz);
    ro.rotation.set(-x * 0.55, 0, y * 0.55);
    raiz.add(ro);
    if (e.extras.includes("Perlas") && i % 2 === 0) {
      const p = new T.Mesh(new T.SphereGeometry(tam * 0.12, 10, 8), new T.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.15, metalness: 0.1 }));
      p.position.set(px, py + tam * 0.75, pz); raiz.add(p);
    }
  });
  const oro = new T.MeshStandardMaterial({ color: 0xe0b84a, metalness: 0.4, roughness: 0.3 });
  if (e.extras.includes("Corona")) {
    const c = new T.Group();
    const aro = new T.Mesh(new T.TorusGeometry(0.5, 0.07, 8, 24), oro); aro.rotation.x = Math.PI / 2; c.add(aro);
    for (let k = 0; k < 5; k++) {
      const pico = new T.Mesh(new T.ConeGeometry(0.1, 0.42, 6), oro);
      const a = (k / 5) * Math.PI * 2; pico.position.set(Math.cos(a) * 0.5, 0.2, Math.sin(a) * 0.5); c.add(pico);
    }
    c.position.set(0, 1.45, 0); c.rotation.z = 0.15; raiz.add(c);
  }
  if (e.extras.includes("Mariposas")) {
    [[R * 0.7, 1.4, -R * 0.4, 0xe2c047], [-R * 0.75, 1.2, R * 0.3, 0xcfd6e6]].forEach(([x, y, z, col]) => {
      const m = new T.Group(), mat = new T.MeshStandardMaterial({ color: col, side: T.DoubleSide, metalness: 0.5, roughness: 0.35 });
      const ala = new T.CircleGeometry(0.42, 16);
      const a1 = new T.Mesh(ala, mat); a1.position.x = -0.32; a1.rotation.y = 0.5; a1.scale.set(1, 1.3, 1);
      const a2 = new T.Mesh(ala, mat); a2.position.x = 0.32; a2.rotation.y = -0.5; a2.scale.set(1, 1.3, 1);
      m.add(a1, a2); m.position.set(x, y, z); m.rotation.x = -0.6; raiz.add(m);
    });
  }
  if (e.cinta) {
    const c = new T.Mesh(new T.TorusGeometry(R * 0.95, 0.2, 6, 40, Math.PI * 0.9),
      new T.MeshStandardMaterial({ color: 0xfffaf3, roughness: 0.6 }));
    c.rotation.set(-0.35, 0, Math.PI * 0.05); c.position.set(0, 0.2, 0); c.scale.set(1, 0.55, 1); raiz.add(c);
  }
  if (e.extras.includes("Luces")) {
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2, l = new T.PointLight(0xffe08a, 0.6, R * 2.4);
      l.position.set(Math.cos(a) * R * 0.6, 1.1, Math.sin(a) * R * 0.6); l.userData.luzExtra = true; esc.add(l);
      const foco = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), new T.MeshBasicMaterial({ color: 0xfff1b0 }));
      foco.position.copy(l.position); raiz.add(foco);
    }
  }
}

// ---------------------------------------------------------------- API
export function iniciarVistaPrevia() {
  const cont = document.getElementById("vista");
  const tabs = document.querySelectorAll("[data-vista]");
  const aviso = document.getElementById("vista-aviso");
  tabs.forEach((b) => b.addEventListener("click", async () => {
    if (b.dataset.vista === modo) return;
    modo = b.dataset.vista;
    tabs.forEach((x) => x.setAttribute("aria-pressed", x === b));
    if (t3) { t3.destruir(); t3 = null; }
    if (modo === "3d") {
      cont.innerHTML = `<p class="vista-cargando">Cargando 3D…</p>`;
      try { t3 = await iniciar3D(cont); aviso.textContent = "Arrastrá para girarlo · Vista ilustrativa, el ramo final es artesanal"; }
      catch { modo = "2d"; tabs.forEach((x) => x.setAttribute("aria-pressed", x.dataset.vista === "2d")); aviso.textContent = "Tu dispositivo no pudo cargar el 3D"; }
    } else aviso.textContent = "Vista ilustrativa · el ramo final es artesanal";
    if (estado) actualizarVistaPrevia(estado);
  }));
  window.addEventListener("resize", () => t3 && t3.redimensionar());
}
export function actualizarVistaPrevia(e) {
  estado = e;
  const cont = document.getElementById("vista");
  if (modo === "3d" && t3) armar3D(t3, e); else if (modo === "2d") dibujar2D(cont, e);
}
