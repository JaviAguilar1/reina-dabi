// Vista previa del ramo en 3D (three.js local). El dibujo 2D queda solo de respaldo mientras carga o si el 3D falla.
const ENVOLTORIOS = {
  "A elección de Reina Dabi": ["#f6dfe7", "#e9c7d3"], "Blanco": ["#f7f4f1", "#e3ddd7"], "Negro": ["#2b2b2b", "#151515"],
  "Rosa": ["#f7bfd0", "#ec9fb7"], "Lila": ["#d3c2ec", "#b9a3de"], "Celeste": ["#c3e6f6", "#9fd4ee"],
  "Dorado": ["#e2c47a", "#c9a24a"], "Papel diario": ["#ece6d8", "#d6cdb9"]
};
const DEFAULT_ROSA = ["#e34d6f", "#f48fb1"];
let estado = null, t3 = null;

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

// Pétalo: plano curvado (cóncavo hacia el centro, con la punta doblada hacia afuera)
function petaloGeo(T, w, h, cup, curl) {
  const g = new T.PlaneGeometry(w, h, 6, 8); g.translate(0, h / 2, 0);
  const p = g.attributes.position, v = [];
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) / (w / 2), t = p.getY(i) / h;
    const f = 0.3 + 0.7 * Math.sin(Math.PI * Math.min(1, t * 0.8 + 0.12));
    p.setXYZ(i, u * (w / 2) * f, (t - u * u * 0.1 * t) * h, -cup * u * u * w * 0.5 + curl * t * t * h);
    v.push(t);
  }
  g.computeVertexNormals(); return [g, v];
}
// Une varias geometrías en una (menos llamadas de dibujo = más fluido en celulares)
function unir(T, partes) {
  let nv = 0, ni = 0;
  partes.forEach(({ g }) => { nv += g.attributes.position.count; ni += g.index.count; });
  const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), col = new Float32Array(nv * 3), idx = new Uint32Array(ni);
  let ov = 0, oi = 0;
  partes.forEach(({ g, c, v }) => {
    const n = g.attributes.position.count;
    pos.set(g.attributes.position.array, ov * 3); nor.set(g.attributes.normal.array, ov * 3);
    for (let i = 0; i < n; i++) { const k = c * (0.62 + 0.38 * v[i]); col.fill(k, (ov + i) * 3, (ov + i) * 3 + 3); }
    g.index.array.forEach((x, j) => { idx[oi + j] = x + ov; });
    ov += n; oi += g.index.count;
  });
  const out = new T.BufferGeometry();
  out.setAttribute("position", new T.BufferAttribute(pos, 3));
  out.setAttribute("normal", new T.BufferAttribute(nor, 3));
  out.setAttribute("color", new T.BufferAttribute(col, 3));
  out.setIndex(new T.BufferAttribute(idx, 1));
  return out;
}
let geoRosaCache = null;
function geoRosa(T) {
  if (geoRosaCache) return geoRosaCache;
  // [pétalos, radio, ancho, alto, apertura, copa, curva punta, brillo]
  const anillos = [[3, 0.03, 0.4, 0.6, 0.06, 0.6, 0, 0.62], [4, 0.09, 0.55, 0.7, 0.28, 0.48, 0.04, 0.76],
    [5, 0.16, 0.7, 0.78, 0.55, 0.4, 0.1, 0.88], [5, 0.24, 0.82, 0.8, 0.88, 0.32, 0.18, 0.98], [6, 0.3, 0.9, 0.76, 1.2, 0.26, 0.24, 1.05]];
  const partes = [];
  anillos.forEach(([n, r, w, h, tilt, cup, curl, c], ai) => {
    const [base, v] = petaloGeo(T, w, h, cup, curl);
    for (let k = 0; k < n; k++) {
      const m = new T.Matrix4().makeRotationY((k / n) * Math.PI * 2 + ai * 0.7)
        .multiply(new T.Matrix4().makeTranslation(0, 0, r)).multiply(new T.Matrix4().makeRotationX(tilt));
      partes.push({ g: base.clone().applyMatrix4(m), c, v });
    }
  });
  return (geoRosaCache = unir(T, partes));
}
// Papel: cono con pliegues ondulados
const radioPapel = (R, y) => { const t = Math.max(0, Math.min(1, (y + 3.2) / 3.7)); return 0.2 + (R * 1.35 - 0.2) * Math.pow(t, 1.3); };
function papelGeo(T, R, fase, esc) {
  const pts = [];
  for (let k = 0; k <= 14; k++) { const y = -3.2 + (k / 14) * 3.7; pts.push(new T.Vector2(radioPapel(R, y) * esc, y)); }
  const g = new T.LatheGeometry(pts, 80), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(x, z), t = (y + 3.2) / 3.7;
    const k = 1 + 0.09 * t * Math.sin(a * 9 + fase) + 0.035 * t * t * Math.sin(a * 22 + fase * 2);
    p.setXYZ(i, x * k, y + t * t * 0.28 * Math.sin(a * 9 + fase), z * k);
  }
  g.computeVertexNormals(); return g;
}
function texturaBrillo(T) {
  const c = document.createElement("canvas"); c.width = c.height = 64;
  const x = c.getContext("2d"), g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,.8)");
  g.addColorStop(0.6, "rgba(255,255,255,.15)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new T.CanvasTexture(c);
}
function texturaCinta(T, texto) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = 128;
  const x = c.getContext("2d");
  x.fillStyle = "#fffaf3"; x.fillRect(0, 0, 1024, 128);
  x.fillStyle = "#c9a24a"; x.fillRect(0, 10, 1024, 4); x.fillRect(0, 114, 1024, 4);
  x.fillStyle = "#6b1f3a"; x.textAlign = "center"; x.textBaseline = "middle";
  let tam = 78; x.font = `${tam}px "Great Vibes", cursive`;
  while (x.measureText(texto).width > 900 && tam > 30) { tam -= 4; x.font = `${tam}px "Great Vibes", cursive`; }
  x.fillText(texto, 512, 66);
  const t = new T.CanvasTexture(c); t.anisotropy = 4; return t;
}
const INFO = {
  Bombones: ["Bombones", "Extra", "Bombones en el centro del ramo, para endulzar el regalo."],
  Corona: ["Corona", "Extra", "Un detalle dorado para quien es la reina del día."],
  Mariposas: ["Mariposas", "Extra", "Mariposas decorativas que acompañan a las rosas."],
  Perlas: ["Perlas", "Extra", "Detalles nacarados entre los pétalos."],
  Luces: ["Luces", "Extra", "Guirnalda de luces cálidas para que brille de noche."]
};

async function iniciar3D(caja) {
  const T = await cargarThree();
  const ren = new T.WebGLRenderer({ antialias: true, alpha: true });
  ren.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  ren.toneMapping = T.ACESFilmicToneMapping; ren.toneMappingExposure = 1.25;
  const lienzo = ren.domElement;
  caja.replaceChildren(lienzo);
  const esc = new T.Scene(), cam = new T.PerspectiveCamera(36, 1, 0.1, 200);
  esc.add(new T.HemisphereLight(0xfff4ec, 0x6b3a48, 0.75));
  const key = new T.DirectionalLight(0xfff1e6, 1.1); key.position.set(3, 7, 5); esc.add(key);
  const rim = new T.DirectionalLight(0xffb0c8, 0.7); rim.position.set(-4, 3, -6); esc.add(rim);
  const raiz = new T.Group(); esc.add(raiz);
  const brillo = texturaBrillo(T);

  // Ambiente del modo grande: halo detrás y polvo dorado flotando
  const ambiente = new T.Group(); ambiente.visible = false; esc.add(ambiente);
  const halo = new T.Sprite(new T.SpriteMaterial({ map: brillo, color: 0xff8fb0, transparent: true, opacity: 0.35, blending: T.AdditiveBlending, depthWrite: false }));
  halo.scale.set(16, 16, 1); halo.position.set(0, 0, -3); ambiente.add(halo);
  const NP = 380, pp = new Float32Array(NP * 3);
  for (let i = 0; i < NP; i++) { pp[i * 3] = (Math.random() - 0.5) * 18; pp[i * 3 + 1] = (Math.random() - 0.5) * 12; pp[i * 3 + 2] = (Math.random() - 0.5) * 18; }
  const pg = new T.BufferGeometry(); pg.setAttribute("position", new T.BufferAttribute(pp, 3));
  const polvo = new T.Points(pg, new T.PointsMaterial({ map: brillo, color: 0xffd98a, size: 0.16, transparent: true, opacity: 0.8, blending: T.AdditiveBlending, depthWrite: false }));
  ambiente.add(polvo);

  // ---- Cámara orbital con inercia, zoom (rueda / pellizco) y toque
  const ctl = { th: 0.5, ph: 1.0, dist: 11, distBase: 11, vth: 0, vph: 0, auto: true, grande: false };
  const punteros = new Map();
  let pinch = 0, toque = null, ultimoToque = 0;
  lienzo.style.touchAction = "pan-y"; lienzo.style.cursor = "grab";
  lienzo.addEventListener("pointerdown", (ev) => {
    punteros.set(ev.pointerId, [ev.clientX, ev.clientY]);
    toque = { x: ev.clientX, y: ev.clientY, t: performance.now(), movio: false };
    if (punteros.size === 2) { const [a, b] = [...punteros.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); }
    ctl.auto = false; lienzo.style.cursor = "grabbing";
  });
  lienzo.addEventListener("pointermove", (ev) => {
    const prev = punteros.get(ev.pointerId); if (!prev) return;
    const dx = ev.clientX - prev[0], dy = ev.clientY - prev[1];
    punteros.set(ev.pointerId, [ev.clientX, ev.clientY]);
    if (toque && Math.abs(ev.clientX - toque.x) + Math.abs(ev.clientY - toque.y) > 6) toque.movio = true;
    if (punteros.size === 2) {
      const [a, b] = [...punteros.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (pinch) ctl.dist = Math.max(ctl.distBase * 0.45, Math.min(ctl.distBase * 1.8, ctl.dist * (pinch / d)));
      pinch = d; return;
    }
    ctl.vth = -dx * 0.006; ctl.vph = -dy * 0.004;
  });
  const soltar = (ev) => {
    punteros.delete(ev.pointerId); pinch = 0; lienzo.style.cursor = "grab";
    if (ev.type !== "pointerup" || !toque || toque.movio || performance.now() - toque.t > 350) return;
    const ahora = performance.now();
    if (ctl.grande && ahora - ultimoToque < 320) { recentrar(); ultimoToque = 0; return; }
    ultimoToque = ahora;
    if (!ctl.grande) { api.alTocarChico && api.alTocarChico(); return; }
    elegir(ev);
  };
  lienzo.addEventListener("pointerup", soltar);
  lienzo.addEventListener("pointercancel", soltar);
  lienzo.addEventListener("wheel", (ev) => {
    if (!ctl.grande) return;
    ev.preventDefault();
    ctl.dist = Math.max(ctl.distBase * 0.45, Math.min(ctl.distBase * 1.8, ctl.dist * (ev.deltaY > 0 ? 1.1 : 0.9)));
  }, { passive: false });
  function recentrar() { ctl.th = 0.5; ctl.ph = 1.0; ctl.dist = ctl.distBase; ctl.vth = ctl.vph = 0; }

  // ---- Tocar un elemento: muestra su info
  const rc = new T.Raycaster(), mouse = new T.Vector2();
  let marcado = null;
  function elegir(ev) {
    const r = lienzo.getBoundingClientRect();
    mouse.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    rc.setFromCamera(mouse, cam);
    const hit = rc.intersectObjects(raiz.children, true)[0];
    let o = hit && hit.object;
    while (o && !o.userData.info) o = o.parent;
    if (marcado) marcado.scale.multiplyScalar(1 / 1.12);
    marcado = o || null;
    if (marcado) marcado.scale.multiplyScalar(1.12);
    api.alElegir && api.alElegir(o ? o.userData.info : null);
  }

  // ---- Animación
  let vivo = true, visible = true, reloj = 0, ultimo = performance.now();
  const anim = { mariposas: [], focos: [] };
  function loop() {
    if (!vivo) return;
    requestAnimationFrame(loop);
    const ahora = performance.now(), dt = Math.min(0.05, (ahora - ultimo) / 1000); ultimo = ahora;
    if (!visible && !ctl.grande) return;
    reloj += dt;
    if (ctl.auto) ctl.th += dt * 0.25;
    ctl.th += ctl.vth; ctl.ph = Math.max(0.25, Math.min(1.45, ctl.ph + ctl.vph));
    ctl.vth *= 0.92; ctl.vph *= 0.92;
    const d = ctl.dist;
    cam.position.set(Math.sin(ctl.th) * Math.sin(ctl.ph) * d, Math.cos(ctl.ph) * d + 0.2, Math.cos(ctl.th) * Math.sin(ctl.ph) * d);
    cam.lookAt(0, -0.2, 0);
    anim.mariposas.forEach((m, i) => {
      const a = 0.35 + 0.55 * Math.sin(reloj * 7 + i * 2);
      m.userData.alas[0].rotation.y = a; m.userData.alas[1].rotation.y = -a;
      m.position.y = m.userData.y0 + Math.sin(reloj * 1.3 + i) * 0.12;
    });
    anim.focos.forEach((f, i) => { f.material.opacity = 0.55 + 0.45 * Math.sin(reloj * 2.2 + i * 1.7); });
    if (ambiente.visible) {
      const a = polvo.geometry.attributes.position;
      for (let i = 0; i < NP; i++) { let y = a.getY(i) + dt * 0.18; if (y > 6) y = -6; a.setY(i, y); }
      a.needsUpdate = true; polvo.rotation.y += dt * 0.02;
    }
    ren.render(esc, cam);
  }
  loop();

  const api = {
    T, raiz, esc, brillo, anim, lienzo,
    setDist(dd) { ctl.distBase = dd; ctl.dist = dd; },
    setVisible(v) { visible = v; },
    setAuto(v) { ctl.auto = v; }, getAuto: () => ctl.auto,
    zoom(k) { ctl.dist = Math.max(ctl.distBase * 0.45, Math.min(ctl.distBase * 1.8, ctl.dist * k)); },
    recentrar,
    modoGrande(on, destino) {
      ctl.grande = on; ambiente.visible = on;
      lienzo.style.touchAction = on ? "none" : "pan-y";
      destino.replaceChildren(lienzo); api.redimensionar(destino);
      if (!on && marcado) { marcado.scale.multiplyScalar(1 / 1.12); marcado = null; }
    },
    redimensionar(cont) {
      const w = cont.clientWidth || 300, h = ctl.grande ? (cont.clientHeight || w) : w;
      ren.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix();
    },
    limpiarMarca() { if (marcado) { marcado.scale.multiplyScalar(1 / 1.12); marcado = null; } },
    destruir() { vivo = false; ren.dispose(); }
  };
  return api;
}

const matCache = new Map();
function matRosa(T, col) {
  if (!matCache.has(col)) matCache.set(col, new T.MeshStandardMaterial({ color: col, vertexColors: true, side: T.DoubleSide, roughness: 0.6, metalness: 0 }));
  return matCache.get(col);
}
function conInfo(o, info) { o.userData.info = info; return o; }

function armar3D(ctx, e) {
  const { T, raiz, esc, brillo, anim } = ctx;
  raiz.children.slice().forEach((c) => { raiz.remove(c); c.traverse((o) => { if (o.geometry && o.geometry !== geoRosaCache) o.geometry.dispose(); }); });
  esc.children.filter((c) => c.userData.luzExtra).forEach((c) => esc.remove(c));
  anim.mariposas = []; anim.focos = [];
  const env = ENVOLTORIOS[e.envoltorio] || ENVOLTORIOS["A elección de Reina Dabi"];
  const n = e.cantidad, ex = (x) => e.extras.includes(x), bomb = ex("Bombones");
  const R = 1.3 + Math.sqrt(n) * 0.4;
  ctx.setDist(R * 3.3 + 3);

  // Papel: dos capas con pliegues
  const infoPapel = ["Envoltorio", e.envoltorio, "Papel en capas, armado a mano para cada ramo."];
  const papel = conInfo(new T.Group(), infoPapel);
  [[env[1], 0, 1.04], [env[0], 1.3, 0.96]].forEach(([col, fase, k]) => {
    papel.add(new T.Mesh(papelGeo(T, R, fase, k), new T.MeshStandardMaterial({ color: col, side: T.DoubleSide, roughness: 0.82 })));
  });
  raiz.add(papel);

  // Rosas (y bombones al centro)
  const total = n + (bomb ? Math.max(3, Math.round(n * 0.3)) : 0), nb = total - n;
  const pos = posiciones(total), tam = Math.max(0.6, Math.min(1.35, (R * 1.75) / Math.sqrt(total)));
  const nombres = e.nombres && e.nombres.length ? e.nombres : null;
  const bombones = conInfo(new T.Group(), INFO.Bombones), perlas = conInfo(new T.Group(), INFO.Perlas);
  const geoB = new T.SphereGeometry(tam * 0.42, 20, 14), matB = new T.MeshStandardMaterial({ color: 0xd9a93c, metalness: 0.55, roughness: 0.28, emissive: 0x2a1a00 });
  const geoP = new T.SphereGeometry(tam * 0.08, 12, 8), matP = new T.MeshStandardMaterial({ color: 0xfffaf0, roughness: 0.18, metalness: 0.15, emissive: 0x222018 });
  pos.forEach(([x, y, r], i) => {
    const px = x * (R - tam * 0.45), pz = y * (R - tam * 0.45), py = 0.25 - r * r * 0.75;
    if (i < nb) {
      const b = new T.Mesh(geoB, matB); b.position.set(px, py + 0.32, pz); b.scale.y = 0.85; bombones.add(b); return;
    }
    const k = i - nb, nombre = nombres ? nombres[k % nombres.length] : "a elección";
    const ro = conInfo(new T.Mesh(geoRosa(T), matRosa(T, colorDe(e, k))),
      [`Rosa ${nombre.toLowerCase()}`, "Rosa eterna", "Rosa natural preservada: dura años, sin agua ni cuidados."]);
    ro.scale.setScalar(tam); ro.position.set(px, py, pz);
    ro.rotation.set(-y * 0.6 * r, i * 2.4, x * 0.6 * r);
    raiz.add(ro);
    if (ex("Perlas") && k % 2 === 0) for (let j = 0; j < 3; j++) {
      const a = i + j * 2.1, p = new T.Mesh(geoP, matP);
      p.position.set(px + Math.cos(a) * tam * 0.48, py + tam * 0.62, pz + Math.sin(a) * tam * 0.48); perlas.add(p);
    }
  });
  if (bomb) raiz.add(bombones);
  if (ex("Perlas")) raiz.add(perlas);

  const oro = new T.MeshStandardMaterial({ color: 0xe6bd55, metalness: 0.5, roughness: 0.25, emissive: 0x3a2600 });
  if (ex("Corona")) {
    const c = conInfo(new T.Group(), INFO.Corona);
    const aro = new T.Mesh(new T.TorusGeometry(0.55, 0.07, 10, 32), oro); aro.rotation.x = Math.PI / 2; c.add(aro);
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2, pico = new T.Mesh(new T.ConeGeometry(0.11, 0.48, 8), oro);
      pico.position.set(Math.cos(a) * 0.55, 0.24, Math.sin(a) * 0.55); c.add(pico);
      const gema = new T.Mesh(new T.SphereGeometry(0.06, 10, 8), matP); gema.position.set(Math.cos(a) * 0.55, 0.5, Math.sin(a) * 0.55); c.add(gema);
    }
    c.position.set(0, 1.25, 0); c.rotation.z = 0.12; raiz.add(c);
  }
  if (ex("Mariposas")) {
    const forma = new T.Shape();
    forma.moveTo(0, 0); forma.bezierCurveTo(0.15, 0.55, 0.75, 0.6, 0.62, 0.15); forma.bezierCurveTo(0.7, -0.15, 0.4, -0.45, 0, -0.08);
    const geoAla = new T.ShapeGeometry(forma, 12);
    [[R * 0.75, 1.5, -R * 0.35, 0xe8c650], [-R * 0.8, 1.2, R * 0.35, 0xdfe6f5]].forEach(([x, y, z, col]) => {
      const m = conInfo(new T.Group(), INFO.Mariposas);
      const mat = new T.MeshStandardMaterial({ color: col, side: T.DoubleSide, metalness: 0.35, roughness: 0.3, emissive: col, emissiveIntensity: 0.12 });
      const a1 = new T.Group(), a2 = new T.Group();
      a1.add(new T.Mesh(geoAla, mat)); const w2 = new T.Mesh(geoAla, mat); w2.scale.x = -1; a2.add(w2);
      const cuerpo = new T.Mesh(new T.CylinderGeometry(0.035, 0.025, 0.55, 6), new T.MeshStandardMaterial({ color: 0x3b2a10 }));
      m.add(a1, a2, cuerpo); m.userData.alas = [a1, a2]; m.userData.y0 = y;
      m.position.set(x, y, z); m.rotation.set(-1.1, x > 0 ? -0.6 : 0.6, 0); raiz.add(m); anim.mariposas.push(m);
    });
  }
  if (e.cinta) {
    const y = -1.15, alto = 0.55, largo = 2.3;
    const g = new T.CylinderGeometry(radioPapel(R, y + alto / 2) * 1.12, radioPapel(R, y - alto / 2) * 1.12, alto, 64, 1, true, -largo / 2, largo);
    const c = conInfo(new T.Mesh(g, new T.MeshStandardMaterial({ map: texturaCinta(T, e.cinta), side: T.DoubleSide, roughness: 0.55 })),
      ["Cinta con mensaje", "Personalizada", `“${e.cinta}”`]);
    c.position.y = y; raiz.add(c);
  }
  if (ex("Luces")) {
    const luces = conInfo(new T.Group(), INFO.Luces);
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 4.2, rr = R * (0.35 + (k / 16) * 0.65);
      const p = new T.Vector3(Math.cos(a) * rr, 0.65 - (k / 16) * 0.75, Math.sin(a) * rr);
      const foco = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), new T.MeshBasicMaterial({ color: 0xfff1b0 })); foco.position.copy(p); luces.add(foco);
      const s = new T.Sprite(new T.SpriteMaterial({ map: brillo, color: 0xffd36b, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
      s.scale.set(0.55, 0.55, 1); s.position.copy(p); luces.add(s); anim.focos.push(s);
    }
    raiz.add(luces);
    [0, Math.PI].forEach((a) => { const l = new T.PointLight(0xffd88a, 0.7, R * 3); l.position.set(Math.cos(a) * R * 0.5, 1.2, Math.sin(a) * R * 0.5); l.userData.luzExtra = true; esc.add(l); });
  }
}

// ---------------------------------------------------------------- Visor a pantalla completa
function crearVisor() {
  const v = document.createElement("div");
  v.className = "v3d"; v.hidden = true; v.setAttribute("role", "dialog"); v.setAttribute("aria-label", "Tu ramo en 3D");
  v.innerHTML = `<div class="v3d-lienzo"></div>
    <div class="v3d-top"><div><div class="v3d-tit">Tu ramo</div><div class="v3d-sub"></div></div>
      <button type="button" class="v3d-x" aria-label="Cerrar">✕</button></div>
    <div class="v3d-info" hidden><button type="button" class="v3d-info-x" aria-label="Cerrar detalle">×</button>
      <h3></h3><span class="v3d-chip"></span><p></p></div>
    <div class="v3d-abajo">
      <div class="v3d-barra">
        <button type="button" data-a="giro" aria-label="Pausar giro">❚❚</button>
        <button type="button" data-a="menos" aria-label="Alejar">−</button>
        <button type="button" data-a="mas" aria-label="Acercar">+</button>
        <button type="button" data-a="centrar" aria-label="Recentrar">↺</button>
      </div>
      <button type="button" class="btn btn-wa v3d-pedir">Pedir este ramo por WhatsApp</button>
      <div class="v3d-ayuda">Arrastrá para girar · pellizcá para zoom · tocá una rosa o un detalle · vista ilustrativa</div>
    </div>`;
  document.body.append(v);
  return v;
}

// ---------------------------------------------------------------- API
export function iniciarVistaPrevia() {
  const caja = document.getElementById("vista");
  const aviso = document.getElementById("vista-aviso");
  const grande = document.getElementById("vista-grande");
  let visor = null, cargando = false;

  async function arrancar() {
    if (t3 || cargando) return;
    cargando = true;
    try {
      await document.fonts.load('40px "Great Vibes"').catch(() => {});
      t3 = await iniciar3D(caja);
      t3.redimensionar(caja);
      t3.alTocarChico = abrir;
      aviso.textContent = "Arrastrá para girarlo · tocalo para verlo en grande · vista ilustrativa, el ramo final es artesanal";
      grande.hidden = false;
      if (estado) armar3D(t3, estado);
      new IntersectionObserver(([en]) => t3.setVisible(en.isIntersecting)).observe(caja);
    } catch {
      aviso.textContent = "Vista ilustrativa · el ramo final es artesanal";
    }
  }
  // El 3D se carga recién cuando el armador está por aparecer en pantalla
  const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { io.disconnect(); arrancar(); } }, { rootMargin: "300px" });
  io.observe(caja);

  function abrir() {
    if (!t3) return;
    if (!visor) {
      visor = crearVisor();
      visor.querySelector(".v3d-x").addEventListener("click", () => history.state && history.state.v3d ? history.back() : cerrar());
      visor.querySelector(".v3d-info-x").addEventListener("click", () => { visor.querySelector(".v3d-info").hidden = true; t3.limpiarMarca(); });
      visor.querySelector(".v3d-barra").addEventListener("click", (ev) => {
        const a = ev.target.closest("button") && ev.target.closest("button").dataset.a;
        if (a === "giro") { t3.setAuto(!t3.getAuto()); ev.target.textContent = t3.getAuto() ? "❚❚" : "▶"; }
        if (a === "menos") t3.zoom(1.15);
        if (a === "mas") t3.zoom(0.87);
        if (a === "centrar") t3.recentrar();
      });
      visor.querySelector(".v3d-pedir").addEventListener("click", () => { cerrar(); document.getElementById("enviar-ramo").click(); });
      document.addEventListener("keydown", (ev) => { if (ev.key === "Escape" && !visor.hidden) visor.querySelector(".v3d-x").click(); });
    }
    const e = estado || { cantidad: 12, colores: [], extras: [] };
    visor.querySelector(".v3d-sub").textContent = `${e.cantidad} rosas` + (e.nombres && e.nombres.length ? " · " + e.nombres.join(", ") : "");
    visor.querySelector(".v3d-info").hidden = true;
    visor.querySelector('[data-a="giro"]').textContent = "❚❚";
    t3.alElegir = (info) => {
      const box = visor.querySelector(".v3d-info");
      if (!info) { box.hidden = true; return; }
      box.querySelector("h3").textContent = info[0]; box.querySelector(".v3d-chip").textContent = info[1];
      box.querySelector("p").textContent = info[2]; box.hidden = false;
    };
    visor.hidden = false; document.documentElement.classList.add("v3d-abierto");
    t3.modoGrande(true, visor.querySelector(".v3d-lienzo"));
    t3.setAuto(true); t3.recentrar();
    history.pushState({ v3d: 1 }, "");
  }
  function cerrar() {
    if (!visor || visor.hidden) return;
    visor.hidden = true; document.documentElement.classList.remove("v3d-abierto");
    t3.modoGrande(false, caja);
  }
  window.addEventListener("popstate", cerrar);
  grande.addEventListener("click", abrir);
  window.addEventListener("resize", () => { if (!t3) return; t3.redimensionar(visor && !visor.hidden ? visor.querySelector(".v3d-lienzo") : caja); });
}
export function actualizarVistaPrevia(e) {
  estado = e;
  if (t3) armar3D(t3, e); else dibujar2D(document.getElementById("vista"), e);
}
