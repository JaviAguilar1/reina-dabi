// Vista previa 3D del ramo: rosas de raso con pétalos, envoltorio y extras elegidos en el armador.
// three.js r128 (vendor/) se carga recién cuando el armador entra en pantalla.
function crearMotor(T, cont) {
  const LOGO = "img/logo.jpg";
  // ================= Datos
  const COLORES = { Rojo:"#c4161c", "Bordó":"#6e1426", Rosa:"#f2a7bf", "Rosa viejo":"#c9787f", Blanco:"#f4f1ec", Crema:"#efe2c4", Lila:"#9c8bd8", Amarillo:"#f5b21b", Naranja:"#ef7d12", Celeste:"#8fd0cf", Azul:"#1546b8", Dorado:"#c9952e", Verde:"#7fae3a", "Marrón":"#4a3a2c" };
  const FEM = { Rojo:"roja", Blanco:"blanca", Amarillo:"amarilla", Negro:"negra", Dorado:"dorada", Plateado:"plateada" };
  const PAPELES = {
    "Blanco y dorado": { fondo:"#f7f5f1", borde:"filete", linea:"#c9a24a", interior:"#f3dfe6", cono:"#f4f1ec" },
    "Blanco y negro":  { fondo:"#f7f5f1", borde:"banda", linea:"#1c1b1d", interior:"#f7f5f1", cono:"#f4f1ec" },
    "Negro":           { fondo:"#1f1e20", borde:"filete", linea:"#c9a24a", interior:"#f7f5f1", cono:"#1f1e20" },
    "Rosa":            { fondo:"#f2a3bd", borde:"filete", linea:"#ffffff", interior:"#f7f5f1", cono:"#f2a3bd" },
    "Lila":            { fondo:"#b49ce6", borde:"filete", linea:"#c9a24a", interior:"#f7f5f1", cono:"#b49ce6" },
    "Papel diario":    { fondo:"#ece8df", borde:"diario", linea:"#55524c", interior:"#f3dfe6", cono:"#ece8df" },
    "Blanco":          { fondo:"#f7f5f1", borde:"filete", linea:"#d8d2c9", interior:"#f7f5f1", cono:"#f4f1ec" },
    "Celeste":         { fondo:"#8fc6ea", borde:"filete", linea:"#ffffff", interior:"#f7f5f1", cono:"#8fc6ea" },
    "Dorado":          { fondo:"#d6b35c", borde:"filete", linea:"#fff3cf", interior:"#f7f5f1", cono:"#d6b35c" }
  };
  const MONOS = { Dorado:"#d4a432", Amarillo:"#f6c21c", Rosa:"#f2a7bf", Blanco:"#f7f4ee", Rojo:"#c4161c" };
  const INFO = {
    Bombones:["Bombones","Extra","Bombones dorados en el centro del ramo."],
    Corona:["Corona","Extra","Tiara plateada con brillos, para la reina del día."],
    Mariposas:["Mariposas","Extra","Mariposas decorativas apoyadas entre las rosas."],
    Perlas:["Perlas","Extra","Una perla en el centro de cada rosa."],
    Luces:["Luces","Extra","Luces cálidas entre las rosas."],
    "Moño":["Moño","Extra","Moño de raso en la base del ramo."]
  };
  const lin = (hex) => new T.Color(hex).convertSRGBToLinear();

  // ================= Renderer y escena
  const ren = new T.WebGLRenderer({ antialias:true, alpha:true });
  ren.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  ren.outputEncoding = T.sRGBEncoding; ren.toneMapping = T.ACESFilmicToneMapping;
  ren.shadowMap.enabled = true; ren.shadowMap.type = T.PCFSoftShadowMap;
  cont.append(ren.domElement);
  const esc = new T.Scene();
  const cam = new T.PerspectiveCamera(32, 1, 0.1, 300);
  const hemi = new T.HemisphereLight(0xfff6ee, 0xd9c2b4, 0.35); esc.add(hemi);
  const key = new T.DirectionalLight(0xfff1e4, 1.9); key.position.set(5, 12, 8); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 5; key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left:-16, right:16, top:16, bottom:-16, near:1, far:60 }); esc.add(key); esc.add(key.target);
  const fill = new T.DirectionalLight(0xffffff, 0.4); fill.position.set(-6, 4, 5); esc.add(fill);
  const rim = new T.DirectionalLight(0xffd2de, 0.6); rim.position.set(-3, 5, -7); esc.add(rim);
  const mundo = new T.Group(); esc.add(mundo);
  (() => {
    const e = new T.Scene(), g = new T.SphereGeometry(20, 32, 16), col = [], p = g.attributes.position;
    for (let i = 0; i < p.count; i++) { const t = (p.getY(i) / 20 + 1) / 2, c = 0.25 + 0.65 * t; col.push(c, c * 0.97, c * 0.95); }
    g.setAttribute("color", new T.Float32BufferAttribute(col, 3));
    e.add(new T.Mesh(g, new T.MeshBasicMaterial({ side: T.BackSide, vertexColors: true })));
    const caja = (x, y, z, w, h, k) => { const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(k, k, k), side: T.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); e.add(m); };
    caja(6, 12, 8, 10, 6, 3); caja(-10, 6, 4, 6, 8, 1.6); caja(0, 4, -12, 12, 4, 1.2);
    esc.environment = new T.PMREMGenerator(ren).fromScene(e, 0.04).texture;
  })();

  // ================= Texturas
  function lienzoTex(w, h, dib, srgb = true) { const c = document.createElement("canvas"); c.width = w; c.height = h; dib(c.getContext("2d"), w, h); const t = new T.CanvasTexture(c); if (srgb) t.encoding = T.sRGBEncoding; t.anisotropy = 8; return t; }
  let semilla = 11; const azar = () => ((semilla = (semilla * 9301 + 49297) % 233280) / 233280);
  function corazon(x, cx, cy, s) { x.beginPath(); x.moveTo(cx, cy + s * 0.35); x.bezierCurveTo(cx - s, cy - s * 0.35, cx - s * 0.45, cy - s, cx, cy - s * 0.45); x.bezierCurveTo(cx + s * 0.45, cy - s, cx + s, cy - s * 0.35, cx, cy + s * 0.35); x.fill(); }
  const texBrillo = lienzoTex(64, 64, (x) => { const g = x.createRadialGradient(32,32,0,32,32,32); g.addColorStop(0,"rgba(255,255,255,1)"); g.addColorStop(.3,"rgba(255,255,255,.7)"); g.addColorStop(1,"rgba(255,255,255,0)"); x.fillStyle = g; x.fillRect(0,0,64,64); }, false);
  const texMarmol = lienzoTex(512, 512, (x, w, h) => {
    x.fillStyle = "#f7f3ef"; x.fillRect(0, 0, w, h);
    for (let k = 0; k < 14; k++) { x.strokeStyle = `rgba(150,135,128,${0.08 + azar() * 0.18})`; x.lineWidth = 0.6 + azar() * 2.2; x.beginPath(); let px = azar() * w, py = 0; x.moveTo(px, py); while (py < h) { px += (azar() - 0.5) * 60; py += 20 + azar() * 30; x.lineTo(px, py); } x.stroke(); }
  });
  const texPapel = {};
  function papelTex(nombre, interior) {
    const k = nombre + (interior ? "-i" : ""); if (texPapel[k]) return texPapel[k];
    const P = PAPELES[nombre];
    return (texPapel[k] = lienzoTex(512, 512, (x, w) => {
      x.fillStyle = interior ? P.interior : P.fondo; x.fillRect(0, 0, w, w);
      for (let i = 0; i < 1400; i++) { x.fillStyle = `rgba(0,0,0,${azar() * 0.025})`; x.fillRect(azar() * w, azar() * w, 2, 2); }
      if (interior) { x.strokeStyle = "#c9a24a"; x.lineWidth = 5; x.strokeRect(14, 14, w - 28, w - 28); return; }
      if (P.borde === "filete") { x.strokeStyle = P.linea; x.lineWidth = 7; x.strokeRect(18, 18, w - 36, w - 36); x.lineWidth = 2.5; x.strokeRect(34, 34, w - 68, w - 68); }
      if (P.borde === "banda") { x.strokeStyle = P.linea; x.lineWidth = 34; x.strokeRect(0, 0, w, w); }
      if (P.borde === "diario") { x.fillStyle = P.linea; x.font = "bold 46px Georgia, serif"; x.fillText("PRIMAVERA", 30, 70); for (let y = 100; y < w - 20; y += 13) for (let c = 0; c < 3; c++) x.fillRect(24 + c * 162, y, 140 - azar() * 40, 4); }
    }));
  }
  function texCintaCruda(texto, fondo) {
    return lienzoTex(1536, 192, (x, w, h) => {
      x.fillStyle = fondo; x.fillRect(0, 0, w, h);
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "rgba(255,255,255,.35)"); g.addColorStop(.5, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,0,.08)"); x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = "#1e1416"; x.textAlign = "center"; x.textBaseline = "middle";
      let s = 120; x.font = `${s}px "Great Vibes", cursive`;
      while (x.measureText(texto).width > w * 0.66 && s > 40) { s -= 4; x.font = `${s}px "Great Vibes", cursive`; }
      const tw = x.measureText(texto).width; x.fillText(texto, w / 2 - 28, h / 2 + 8); corazon(x, w / 2 + tw / 2 + 22, h / 2 + 4, s * 0.32);
    });
  }
  const texMarip = {};
  function texMariposa(tipo) {
    if (texMarip[tipo]) return texMarip[tipo];
    return (texMarip[tipo] = lienzoTex(512, 512, (x) => {
      const ala = (sx) => { x.save(); x.translate(256, 256); x.scale(sx, 1);
        x.beginPath(); x.moveTo(6, -10); x.bezierCurveTo(40, -200, 250, -230, 236, -90); x.bezierCurveTo(228, -20, 120, 10, 8, 4); x.closePath(); x.fill();
        x.beginPath(); x.moveTo(6, 6); x.bezierCurveTo(150, 20, 210, 120, 160, 190); x.bezierCurveTo(110, 240, 30, 150, 6, 30); x.closePath(); x.fill(); x.restore(); };
      if (tipo === "tornasol") { const g = x.createLinearGradient(40, 40, 470, 470); ["#ff9ad5","#ffd36e","#8ef0c4","#7fb8ff","#c79bff","#ff9ad5"].forEach((c, i) => g.addColorStop(i / 5, c)); x.fillStyle = g; } else x.fillStyle = "#ffffff";
      ala(1); ala(-1);
      if (tipo !== "tornasol") { x.globalCompositeOperation = "destination-out";
        [1, -1].forEach((sx) => { for (let i = 0; i < 26; i++) { const a = -1.9 + i * 0.12, r = 70 + (i % 3) * 45; x.beginPath(); x.ellipse(256 + sx * (40 + Math.cos(a + 1.6) * r * 0.9 + 60), 256 + Math.sin(a + 1.6) * r * 0.75 - 40, 9 - (i % 3) * 2, 15 - (i % 3) * 3, a, 0, Math.PI * 2); x.fill(); } for (let i = 0; i < 9; i++) { x.beginPath(); x.arc(256 + sx * (60 + i * 9), 300 + i * 12, 6, 0, Math.PI * 2); x.fill(); } });
        x.globalCompositeOperation = "source-over"; }
      x.fillStyle = tipo === "tornasol" ? "#2a2030" : (tipo === "oro" ? "#8a6a1c" : "#7d7f86");
      x.beginPath(); x.ellipse(256, 270, 9, 110, 0, 0, Math.PI * 2); x.fill();
    }));
  }
  const texTiara = lienzoTex(1024, 256, (x, w, h) => {
    x.fillStyle = "#fff"; x.fillRect(0, h - 60, w, 60);
    for (let i = 0; i < 7; i++) { const cx = 73 + i * 146, alto = i === 3 ? 230 : 150 + (3 - Math.abs(3 - i)) * 22; x.beginPath(); x.moveTo(cx - 73, h - 50); x.quadraticCurveTo(cx - 40, h - alto * 0.5, cx, h - alto); x.quadraticCurveTo(cx + 40, h - alto * 0.5, cx + 73, h - 50); x.closePath(); x.fill(); }
    x.globalCompositeOperation = "destination-out";
    for (let i = 0; i < 7; i++) { const cx = 73 + i * 146; x.beginPath(); x.ellipse(cx, h - 95, 26, 34, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(cx - 52, h - 30, 10, 0, Math.PI * 2); x.fill(); }
  }, false);
  const texLogo = (() => { const img = new Image(); const t = new T.Texture(img); t.encoding = T.sRGBEncoding; img.onload = () => {
    const c = document.createElement("canvas"); c.width = c.height = 256; const x = c.getContext("2d");
    x.fillStyle = "#fff"; x.beginPath(); x.arc(128, 128, 128, 0, Math.PI * 2); x.fill();
    x.save(); x.beginPath(); x.arc(128, 128, 122, 0, Math.PI * 2); x.clip(); x.drawImage(img, 20, 22, 216, 216); x.restore();
    x.strokeStyle = "#e7b7c6"; x.lineWidth = 6; x.beginPath(); x.arc(128, 128, 124, 0, Math.PI * 2); x.stroke();
    t.image = c; t.needsUpdate = true; }; img.src = LOGO; return t; })();
  function textoSprite(txt, color = "#3b1a26", tam = 1) {
    const t = lienzoTex(512, 128, (x, w, h) => { x.fillStyle = color; x.font = "700 64px Nunito, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(txt, w / 2, h / 2); });
    const s = new T.Sprite(new T.SpriteMaterial({ map: t, transparent: true, depthWrite: false })); s.scale.set(2.4 * tam, 0.6 * tam, 1); return s;
  }

  const cacheCinta = {}; const texCinta = (t, f) => cacheCinta[t + "|" + f] || (cacheCinta[t + "|" + f] = texCintaCruda(t, f));

  // ================= Geometrías
  // Rosa de raso: capullo en espiral + 4 anillos de pétalos curvos, con el borde de afuera enrollado
  const geoRosa = (() => {
    const pos = [], col = [], idx = [];
    const add = (fn, NU, NV, sh) => {
      const b = pos.length / 3;
      for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) { const [x, y, z, c] = fn(i / NU, j / NV, j); pos.push(x, y, z); const k = c * sh; col.push(k, k, k); }
      for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) { const a = b + j * (NU + 1) + i, d = a + NU + 1; idx.push(a, d, a + 1, d, d + 1, a + 1); }
    };
    const tmax = 2.6 * Math.PI * 2;
    add((u, v) => { const th = u * tmax, r = 0.016 + 0.095 * u, h = (0.27 - 0.05 * u) * v, rr = r + h * Math.sin(0.12 + 0.45 * u * u) * 0.55; return [Math.cos(th) * rr, 0.035 + h, Math.sin(th) * rr, 0.5 + 0.5 * v]; }, 140, 5, 0.8);
    [[4, 0.07, 0.27, 0.2, 0.14, 0.0, 0.84], [5, 0.11, 0.28, 0.45, 0.18, 0.15, 0.9], [7, 0.155, 0.27, 0.72, 0.21, 0.35, 0.96], [8, 0.2, 0.25, 0.98, 0.235, 0.55, 1.0]].forEach(([n, rb, H, a, W, curl, sh], ri) => {
      for (let p = 0; p < n; p++) {
        const t0 = (p / n) * Math.PI * 2 + ri * 0.55 + (p % 2) * 0.1, NV = 12, prof = [[rb, 0.025]];
        for (let j = 1; j <= NV; j++) { const v = j / NV, phi = a * Math.pow(v, 1.25) + curl * Math.pow(Math.max(0, v - 0.65) / 0.35, 2) * 0.8, [pr, py] = prof[j - 1]; prof.push([pr + Math.sin(phi) * H / NV, py + Math.cos(phi) * H / NV]); }
        const en = (f) => { const q = Math.min(NV, f * NV), k = Math.min(NV - 1, Math.floor(q)), t = q - k; return [prof[k][0] + (prof[k + 1][0] - prof[k][0]) * t, prof[k][1] + (prof[k + 1][1] - prof[k][1]) * t]; };
        add((u, v) => {
          const x = u * 2 - 1, vv = v * (1 - 0.32 * Math.pow(Math.abs(x), 2.2)), [rr, yy] = en(vv), hw = W * (0.55 + 0.45 * Math.sin(Math.PI * Math.min(1, 0.2 + vv * 0.7)));
          const cup = 0.55 * (1 - 0.5 * vv) - curl * 0.45 * Math.max(0, vv - 0.6), rad = rr - cup * x * x * hw, th = t0 + (x * hw) / Math.max(0.08, rr);
          return [Math.cos(th) * rad, yy + 0.008 * Math.sin(x * 3 + p), Math.sin(th) * rad, (0.46 + 0.54 * vv) * (1 - 0.14 * x * x)];
        }, 14, NV, sh);
      }
    });
    const c0 = pos.length / 3; pos.push(0, 0.02, 0); col.push(0.3, 0.3, 0.3);
    for (let k = 0; k <= 32; k++) { const ang = (k / 32) * Math.PI * 2; pos.push(Math.cos(ang) * 0.34, 0.03, Math.sin(ang) * 0.34); col.push(0.34, 0.34, 0.34); }
    for (let k = 0; k < 32; k++) idx.push(c0, c0 + 2 + k, c0 + 1 + k);
    const g = new T.BufferGeometry(); g.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new T.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.scale(1.5, 1.25, 1.5); g.computeVertexNormals(); return g;
  })();
  const D = 1.0;
  function acomodar(n, minD, hueco) {
    const ang = Math.PI * (3 - Math.sqrt(5)), c = minD / 1.75, ps = [], k0 = hueco ? Math.ceil(((hueco + minD * 0.5) / c) ** 2) : 0;
    for (let i = 0; i < n; i++) { const r = c * Math.sqrt(i + k0 + 0.5); ps.push([r * Math.cos((i + k0) * ang), r * Math.sin((i + k0) * ang)]); }
    for (let it = 0; it < 80; it++) {
      for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) { const dx = ps[b][0] - ps[a][0], dz = ps[b][1] - ps[a][1], d = Math.hypot(dx, dz) || 1e-4; if (d < minD) { const m = (minD - d) / 2 / d; ps[a][0] -= dx * m; ps[a][1] -= dz * m; ps[b][0] += dx * m; ps[b][1] += dz * m; } }
      ps.forEach((p) => { const d = Math.hypot(p[0], p[1]) || 1e-4; if (hueco && d < hueco + minD * 0.5) { const k = (hueco + minD * 0.5) / d; p[0] *= k; p[1] *= k; } else { p[0] *= 0.995; p[1] *= 0.995; } });
    }
    return ps;
  }
  const domo = (r) => -0.085 * r * r;
  const matRaso = new Map();
  const raso = (hex) => { if (!matRaso.has(hex)) matRaso.set(hex, new T.MeshPhysicalMaterial({ color: lin(hex), vertexColors: true, side: T.DoubleSide, roughness: 0.4, metalness: 0.02, clearcoat: 0.3, clearcoatRoughness: 0.3, envMapIntensity: 0.65, sheen: lin(hex).multiplyScalar(0.35) })); return matRaso.get(hex); };
  const info = (o, i) => { o.userData.info = i; return o; };
  const sombra = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
  const matPerla = new T.MeshPhysicalMaterial({ color: lin("#fbf7ee"), roughness: 0.12, clearcoat: 1 });
  const matOro = new T.MeshStandardMaterial({ color: lin("#d9ad48"), metalness: 1, roughness: 0.28 });
  function hoja(S, tex, tilt, ang, radio, y) {
    const g = new T.PlaneGeometry(S, S, 12, 12); g.rotateZ(Math.PI / 4); g.translate(0, S * 0.7071, 0);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), yy = p.getY(i), t = yy / (S * 1.414); p.setZ(i, -0.07 * (x * x) / S - 0.1 * Math.abs(x) * (0.3 + 0.7 * t) - 0.03 * yy + 0.025 * S * Math.sin(x * 9 / S + yy * 5 / S) * t); } g.computeVertexNormals();
    const m = new T.Mesh(g, new T.MeshStandardMaterial({ map: tex, color: 0xc4c4c4, side: T.DoubleSide, roughness: 0.9, envMapIntensity: 0.25 }));
    const piv = new T.Group(); piv.rotation.y = ang; m.position.set(0, y, radio); m.rotation.x = tilt; piv.add(m); return piv;
  }

  // Rosas de raso sobre una cúpula; devuelve las posiciones
  function ponerRosas(grupo, n, colores, hueco) {
    const pts = acomodar(n, D, hueco || 0), rosas = [];
    pts.forEach(([x, z], i) => {
      const r = Math.hypot(x, z), nombre = colores[i % colores.length];
      const ro = info(new T.Mesh(geoRosa, raso(COLORES[nombre])), [`Rosa ${FEM[nombre] || nombre.toLowerCase()}`, "Rosa de raso", "Hecha a mano con cinta de raso: no se marchita y dura años."]);
      const s = D * (1.1 + ((i * 37) % 7) / 100) / 0.86; ro.scale.setScalar(s); ro.position.set(x, domo(r), z);
      const inc = Math.atan(0.17 * r) * 1.15, dir = Math.atan2(z, x);
      ro.rotateOnWorldAxis(new T.Vector3(0, 1, 0), i * 2.39); ro.rotateOnWorldAxis(new T.Vector3(-Math.sin(dir), 0, Math.cos(dir)), -inc);
      ro.castShadow = true; ro.receiveShadow = true; grupo.add(ro); rosas.push({ x, z, y: domo(r), s });
    });
    return { rosas, Rb: Math.max(...pts.map((p) => Math.hypot(p[0], p[1]))) + D * 0.5 };
  }
  const altoRosa = (r) => domo(r) + 0.42 * (D / 0.86);

  function extrasEncima(g, cfg, rosas, Rb, focos) {
    const ex = (x) => cfg.extras.includes(x);
    if (ex("Perlas")) { const gp = info(new T.Group(), INFO.Perlas), geo = new T.SphereGeometry(0.06, 16, 12); rosas.forEach((p) => { const m = new T.Mesh(geo, matPerla); m.position.set(p.x, p.y + 0.37 * p.s, p.z); gp.add(m); }); g.add(sombra(gp)); }
    if (ex("Cinta") && cfg.cinta) {
      const L = Rb * 0.98, ancho = 0.5, segs = 80, dirA = -0.32, zOff = 0.35, dx = Math.cos(dirA), dz = Math.sin(dirA), sx = -dz, sz = dx, pos = [], uv = [], idx = [];
      for (let i = 0; i <= segs; i++) { const u = i / segs, t = u * 2 - 1, cx = dx * t * L + sx * (zOff + 0.18 * Math.sin(t * Math.PI)), cz = dz * t * L + sz * (zOff + 0.18 * Math.sin(t * Math.PI)), cae = Math.max(0, Math.abs(t) - 0.82) * 2.2;
        for (let j = 0; j <= 1; j++) { const w = (j - 0.5) * ancho * (1 - Math.max(0, Math.abs(t) - 0.9) * 2), x = cx + sx * w, z = cz + sz * w; pos.push(x, altoRosa(Math.hypot(x, z)) + 0.04 - cae, z); uv.push(u, 1 - j); } }
      for (let i = 0; i < segs; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
      const geo = new T.BufferGeometry(); geo.setAttribute("position", new T.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
      g.add(sombra(info(new T.Mesh(geo, new T.MeshPhysicalMaterial({ map: texCinta(cfg.cinta, cfg.cintaColor === "Rosa" ? "#f3a9b8" : "#fbf8f3"), side: T.DoubleSide, roughness: 0.3, clearcoat: 0.6 })), ["Cinta con mensaje", "Personalizada", `“${cfg.cinta}”`])));
    }
    if (ex("Corona")) {
      const c = info(new T.Group(), INFO.Corona);
      c.add(new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 0.42, 64, 1, true, -1.7, 3.4), new T.MeshStandardMaterial({ color: lin("#ececf2"), metalness: 1, roughness: 0.15, alphaMap: texTiara, alphaTest: 0.5, side: T.DoubleSide })));
      const gm = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0, clearcoat: 1, envMapIntensity: 2.5 });
      for (let k = 0; k < 7; k++) { const a = -1.7 + (k + 0.5) * (3.4 / 7), al = k === 3 ? 0.2 : 0.06 + (3 - Math.abs(3 - k)) * 0.03, m = new T.Mesh(new T.OctahedronGeometry(k === 3 ? 0.06 : 0.04), gm); m.position.set(Math.sin(a) * 0.51, al - 0.03, Math.cos(a) * 0.51); c.add(m); }
      const rr = Math.min(Rb * 0.45, 1.0); c.position.set(Math.cos(0.9) * rr, altoRosa(rr) + 0.15, Math.sin(0.9) * rr * 0.4); c.rotation.set(-0.35, -0.5, 0.25); g.add(sombra(c));
    }
    if (ex("Mariposas")) {
      const tipo = cfg.mariposa || "tornasol", mat = new T.MeshStandardMaterial({ map: texMariposa(tipo), alphaTest: 0.5, side: T.DoubleSide, color: tipo === "oro" ? lin("#e2b84c") : tipo === "plata" ? lin("#e6e8ee") : 0xffffff, metalness: tipo === "tornasol" ? 0.6 : 0.9, roughness: tipo === "tornasol" ? 0.25 : 0.3 });
      [[0.62, 1.7, 0.88], [-0.78, 1.35, 0.72]].forEach(([ang, s, k]) => {
        const m = info(new T.Group(), INFO.Mariposas);
        [-1, 1].forEach((lado) => { const geo = new T.PlaneGeometry(0.5 * s, 1 * s); geo.translate(lado * 0.25 * s, 0, 0); const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, lado < 0 ? uv.getX(i) * 0.5 : 0.5 + uv.getX(i) * 0.5); const w = new T.Mesh(geo, mat); w.rotation.y = lado * 0.45; m.add(w); });
        const rr = Rb * k; m.position.set(Math.cos(ang) * rr, altoRosa(rr) + 0.45 * s, -Math.sin(ang) * rr); m.rotation.set(-0.5, ang > 0 ? -0.9 : 0.8, ang > 0 ? 0.25 : -0.2); g.add(sombra(m));
      });
    }
    if (ex("Luces")) {
      const gl = info(new T.Group(), INFO.Luces), foco = new T.SphereGeometry(0.045, 10, 8), fm = new T.MeshBasicMaterial({ color: 0xfff0b8 }); let cuenta = 0;
      for (let a = 0; a < rosas.length && cuenta < 16; a++) for (let b = a + 1; b < rosas.length && cuenta < 16; b++) { const A = rosas[a], B = rosas[b]; if (Math.hypot(A.x - B.x, A.z - B.z) > D * 1.25 || (a + b) % 3) continue; const x = (A.x + B.x) / 2, z = (A.z + B.z) / 2, y = altoRosa(Math.hypot(x, z)) - 0.06; const m = new T.Mesh(foco, fm); m.position.set(x, y, z); gl.add(m); const s = new T.Sprite(new T.SpriteMaterial({ map: texBrillo, color: 0xffcf6b, transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: 0.8 })); s.scale.set(0.42, 0.42, 1); s.position.set(x, y, z); gl.add(s); focos.push(s); cuenta++; }
      g.add(gl);
    }
  }

  // Ramo completo con envoltorio; base del mango en y = 0
  function construirRamo(cfg) {
    const g = new T.Group(), arriba = new T.Group(), focos = [];
    const ex = (x) => cfg.extras.includes(x), bomb = ex("Bombones"), nb = bomb ? (cfg.n >= 12 ? 7 : 4) : 0, rB = bomb ? (nb === 7 ? 0.62 : 0.42) : 0;
    const { rosas, Rb } = ponerRosas(arriba, cfg.n, cfg.colores, rB);
    const yRim = domo(Rb), P = PAPELES[cfg.papel];
    const env = info(new T.Group(), ["Envoltorio", cfg.papel, "Hojas de papel en capas, armadas a mano alrededor de las rosas."]);
    const S1 = Rb * 0.78, S2 = Rb * 0.66;
    for (let k = 0; k < 8; k++) env.add(hoja(S1, papelTex(cfg.papel), 1.28, (k / 8) * Math.PI * 2, Rb * 0.62, yRim - 0.5));
    for (let k = 0; k < 8; k++) env.add(hoja(S2, papelTex(cfg.papel), 1.12, (k / 8) * Math.PI * 2 + Math.PI / 8, Rb * 0.66, yRim - 0.38));
    const aro = new T.Mesh(new T.CylinderGeometry(Rb * 1.04, Rb * 0.97, 0.26, 72, 1, true), new T.MeshStandardMaterial({ color: lin("#fbf8f4"), side: T.DoubleSide, roughness: 0.9 })); aro.position.y = yRim - 0.02; env.add(aro);
    const perfil = []; for (let i = 0; i <= 14; i++) { const t = i / 14; perfil.push(new T.Vector2(0.42 + (Rb * 0.8 - 0.42) * Math.pow(t, 1.3), -2.55 + t * (yRim - 0.45 + 2.55))); }
    env.add(new T.Mesh(new T.LatheGeometry(perfil, 64), new T.MeshStandardMaterial({ color: lin(P.cono), side: T.DoubleSide, roughness: 0.85 })));
    const mango = new T.Mesh(new T.CylinderGeometry(0.42, 0.38, 1.0, 24), new T.MeshStandardMaterial({ color: lin(P.cono), roughness: 0.85 })); mango.position.y = -3.05; env.add(mango);
    arriba.add(sombra(env));
    const relleno = new T.Mesh(new T.SphereGeometry(Rb * 0.74, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshStandardMaterial({ color: lin(COLORES[cfg.colores[0]]).multiplyScalar(0.05), roughness: 0.95, envMapIntensity: 0.1 })); relleno.scale.y = 0.18; relleno.position.y = yRim - 0.12; arriba.add(relleno);
    const radioEn = (y) => 0.42 + (Rb * 0.8 - 0.42) * Math.pow((y + 2.55) / (yRim - 0.45 + 2.55), 1.3);
    const yS = -1.45, rS = radioEn(yS); const st = info(new T.Mesh(new T.CircleGeometry(0.3, 40), new T.MeshStandardMaterial({ map: texLogo, roughness: 0.5 })), ["Reina Dabi", "Sello", "Cada ramo lleva nuestro sello."]); st.position.set(0, yS, rS + 0.02); st.lookAt(0, yS - 0.6, rS * 3); arriba.add(st);
    if (bomb) {
      const gb = info(new T.Group(), INFO.Bombones), geo = new T.IcosahedronGeometry(0.22, 3), pp = geo.attributes.position;
      for (let i = 0; i < pp.count; i++) { const v = new T.Vector3().fromBufferAttribute(pp, i), k = 1 + 0.07 * Math.sin(v.x * 40) * Math.sin(v.y * 37) * Math.sin(v.z * 43); pp.setXYZ(i, v.x * k, v.y * k * 0.92, v.z * k); } geo.computeVertexNormals();
      const mat = new T.MeshStandardMaterial({ color: lin("#c8962c"), metalness: 1, roughness: 0.32 }), capa = new T.MeshStandardMaterial({ color: lin("#4a2c16"), roughness: 0.8, side: T.DoubleSide });
      const lug = nb === 7 ? [[0, 0], ...[0, 1, 2, 3, 4, 5].map((k) => [Math.cos(k * 1.047) * 0.46, Math.sin(k * 1.047) * 0.46])] : [[0.22, 0.22], [-0.22, 0.22], [0.22, -0.22], [-0.22, -0.22]];
      lug.forEach(([x, z]) => { const b = new T.Mesh(geo, mat); b.position.set(x, 0.16, z); b.rotation.set(x * 3, z * 5, 0); gb.add(b); const cap = new T.Mesh(new T.CylinderGeometry(0.25, 0.18, 0.14, 20, 1, true), capa); cap.position.set(x, 0.04, z); gb.add(cap); });
      arriba.add(sombra(gb));
    }
    extrasEncima(arriba, cfg, rosas, Rb, focos);
    if (ex("Moño")) {
      const c = info(new T.Group(), INFO["Moño"]), mat = new T.MeshPhysicalMaterial({ color: lin(MONOS[cfg.mono || "Dorado"]), roughness: 0.3, clearcoat: 0.6, side: T.DoubleSide });
      const yM = -2.2, rM = radioEn(yM); const lazo = new T.Mesh(new T.TorusGeometry(rM * 1.02, 0.06, 8, 48), mat); lazo.rotation.x = Math.PI / 2; lazo.scale.z = 2.2; lazo.position.y = yM; c.add(lazo);
      const nudo = new T.Group(); nudo.position.set(0, yM, rM + 0.06); c.add(nudo);
      [-1, 1].forEach((l) => { const o = new T.Mesh(new T.TorusGeometry(0.28, 0.07, 10, 32), mat); o.scale.set(1.1, 0.62, 0.45); o.position.set(l * 0.3, 0.04, 0); o.rotation.z = l * 0.25; nudo.add(o); const cola = new T.Mesh(new T.BoxGeometry(0.14, 0.55, 0.02), mat); cola.position.set(l * 0.12, -0.32, 0.02); cola.rotation.z = l * 0.35; nudo.add(cola); });
      nudo.add(new T.Mesh(new T.SphereGeometry(0.09, 16, 12), mat)); arriba.add(sombra(c));
    }
    arriba.position.y = 3.55; g.add(arriba);
    return { g, Rb, focos, alto: 3.55 + 0.6, ancho: Rb * 1.5 };
  }

  // ================= Luz, fondos y base
  const FONDOS = {
    noche: { base: ["#3a0f1d", "#22070f"], luz: [[0xffffff, 0x2a1a20, 0.4], [0xfff6ee, 2.1], [0xffd6e2, 0.6], 1.05, 0.8] },
    neutro: { base: ["#f4f4f4", "#d4d4d4"], luz: [[0xffffff, 0xcfcfcf, 0.42], [0xffffff, 1.85], [0xffffff, 0.45], 1.0, 1.0] },
    rosa: { base: ["#fbe4ea", "#efc3cf"], luz: [[0xffffff, 0xd9c7cc, 0.4], [0xfff8f4, 1.8], [0xffe8ee, 0.5], 1.0, 1.0] }
  };
  let fondo = "noche";
  function luz() {
    const [h, k, r, exp, env] = FONDOS[fondo].luz;
    hemi.color.setHex(h[0]); hemi.groundColor.setHex(h[1]); hemi.intensity = h[2]; key.color.setHex(k[0]); key.intensity = k[1]; rim.color.setHex(r[0]); rim.intensity = r[1]; ren.toneMappingExposure = exp;
    esc.traverse((o) => [].concat(o.material || []).forEach((m) => { if ("envMapIntensity" in m) { if (m.userData.envBase === undefined) m.userData.envBase = m.envMapIntensity; m.envMapIntensity = m.userData.envBase * env; } }));
  }
  function base(rad) {
    const [top, lado] = FONDOS[fondo].base, mTop = new T.MeshStandardMaterial({ color: lin(top), roughness: 0.35 }), mLado = new T.MeshStandardMaterial({ color: lin(lado), roughness: 0.45 });
    const c = new T.Mesh(new T.CylinderGeometry(rad, rad * 1.02, 0.5, 96), [mLado, mTop, mLado]); c.position.y = -0.25; c.receiveShadow = true; return c;
  }

  // ================= Cámara y controles (arrastrar en horizontal gira; la página sigue scrolleando en vertical)
  const ctl = { th: 0.35, ph: 0.92, dist: 14, base: 14, vth: 0, objetivo: new T.Vector3(), quieto: 0 };
  const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function medir() { const w = cont.clientWidth || 300, h = cont.clientHeight || 300; ren.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  function encuadrar() {
    const esf = new T.Box3().setFromObject(mundo).getBoundingSphere(new T.Sphere()), w = cont.clientWidth || 300, h = cont.clientHeight || 300;
    const fv = (cam.fov * Math.PI) / 180, fh = 2 * Math.atan(Math.tan(fv / 2) * (w / h));
    ctl.base = (esf.radius / Math.sin(Math.min(fv, fh) / 2)) * 0.9; ctl.dist = ctl.base; ctl.objetivo.copy(esf.center);
  }
  const lz = ren.domElement; lz.style.touchAction = "pan-y"; lz.style.cursor = "grab";
  let toque = null;
  lz.addEventListener("pointerdown", (e) => { toque = { x: e.clientX, y: e.clientY, px: e.clientX, py: e.clientY, t: performance.now(), movio: false }; ctl.quieto = 4; });
  lz.addEventListener("pointermove", (e) => {
    if (!toque) return; const dx = e.clientX - toque.px, dy = e.clientY - toque.py; toque.px = e.clientX; toque.py = e.clientY;
    if (Math.abs(e.clientX - toque.x) + Math.abs(e.clientY - toque.y) > 6) toque.movio = true;
    ctl.vth = -dx * 0.007; if (e.pointerType === "mouse") ctl.ph = Math.max(0.35, Math.min(1.4, ctl.ph - dy * 0.004)); ctl.quieto = 4;
  });
  const soltar = (e) => { if (toque && !toque.movio && performance.now() - toque.t < 350 && e.type === "pointerup") elegir(e); toque = null; };
  lz.addEventListener("pointerup", soltar); lz.addEventListener("pointercancel", soltar); lz.addEventListener("pointerleave", () => { toque = null; });
  const rc = new T.Raycaster(), mouse = new T.Vector2();
  const tarjeta = document.createElement("div"); tarjeta.className = "vista-info"; tarjeta.hidden = true;
  tarjeta.innerHTML = '<button type="button" aria-label="Cerrar detalle">×</button><b></b><span></span><p></p>'; cont.append(tarjeta);
  tarjeta.querySelector("button").addEventListener("click", () => { tarjeta.hidden = true; });
  function elegir(e) {
    const r = lz.getBoundingClientRect(); mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); rc.setFromCamera(mouse, cam);
    const hit = rc.intersectObjects(mundo.children, true).find((h) => h.object.isMesh); let o = hit && hit.object; while (o && !o.userData.info) o = o.parent;
    if (!o) { tarjeta.hidden = true; return; }
    const [t, c, d] = o.userData.info; tarjeta.querySelector("b").textContent = t; tarjeta.querySelector("span").textContent = c; tarjeta.querySelector("p").textContent = d; tarjeta.hidden = false;
  }
  const zoom = document.createElement("div"); zoom.className = "vista-ctrl";
  [["−", "Alejar", 1.15], ["+", "Acercar", 0.87], ["↺", "Volver a centrar", 0]].forEach(([s, a, k]) => {
    const b = document.createElement("button"); b.type = "button"; b.textContent = s; b.setAttribute("aria-label", a);
    b.addEventListener("click", () => { if (k) ctl.dist = Math.max(ctl.base * 0.4, Math.min(ctl.base * 1.6, ctl.dist * k)); else { ctl.dist = ctl.base; ctl.th = 0.35; ctl.ph = 0.92; } ctl.quieto = 4; });
    zoom.append(b);
  });
  cont.append(zoom);

  // ================= Armar el ramo con lo elegido en el formulario
  const EXTRAS_3D = ["Mariposas", "Perlas", "Corona", "Bombones", "Luces"];
  let focos = [], nAnterior = 0;
  function limpiar() { mundo.children.slice().forEach((c) => { mundo.remove(c); c.traverse((o) => { if (o.geometry && o.geometry !== geoRosa) o.geometry.dispose(); }); }); tarjeta.hidden = true; }
  function armar(e) {
    const nombres = e.nombres && e.nombres.length ? e.nombres : ["Rosa"], hexes = e.nombres && e.nombres.length ? e.colores : ["#f48fb1"];
    nombres.forEach((n, i) => { COLORES[n] = hexes[i] || COLORES[n] || "#f48fb1"; });
    const extras = (e.extras || []).map((x) => x.replace(/^[^A-Za-zÁÉÍÓÚÑáéíóúñ]+/, "").trim()).filter((x) => EXTRAS_3D.includes(x));
    if (e.cinta) extras.push("Cinta");
    const cfg = { n: Math.max(3, Math.min(30, +e.cantidad || 12)), colores: nombres, papel: PAPELES[e.envoltorio] ? e.envoltorio : "Blanco y dorado", extras, cinta: e.cinta || "", cintaColor: "Blanca", mariposa: "tornasol", mono: "Dorado" };
    limpiar(); const r = construirRamo(cfg); mundo.add(r.g, base(Math.max(2, r.Rb * 0.95))); focos = r.focos; luz();
    if (cfg.n !== nAnterior) { encuadrar(); nAnterior = cfg.n; }
  }

  // ================= Animación (solo mientras se ve)
  let activo = false, reloj = 0, prev = performance.now();
  function loop() {
    if (!activo) return; requestAnimationFrame(loop);
    const ahora = performance.now(), dt = Math.min(0.05, (ahora - prev) / 1000); prev = ahora; reloj += dt;
    ctl.quieto = Math.max(0, ctl.quieto - dt); if (!sinMovimiento && !ctl.quieto && !toque) ctl.th += dt * 0.25;
    ctl.th += ctl.vth; ctl.vth *= 0.9;
    const d = ctl.dist, o = ctl.objetivo; cam.position.set(o.x + Math.sin(ctl.th) * Math.sin(ctl.ph) * d, o.y + Math.cos(ctl.ph) * d, o.z + Math.cos(ctl.th) * Math.sin(ctl.ph) * d); cam.lookAt(o);
    if (!sinMovimiento) focos.forEach((f, i) => { f.material.opacity = 0.55 + 0.35 * Math.sin(reloj * 2 + i * 1.7); });
    ren.render(esc, cam);
  }
  medir();
  return {
    armar,
    fondo(f) { if (!FONDOS[f]) return; fondo = f; if (estado) armar(estado); },
    redimensionar() { medir(); encuadrar(); },
    activar(v) { if (v === activo) return; activo = v; if (v) { prev = performance.now(); loop(); } }
  };
}

// ---------------------------------------------------------------- API
function cargarThree() {
  return new Promise((ok, mal) => {
    if (window.THREE) return ok(window.THREE);
    const s = document.createElement("script"); s.src = "vendor/three.min.js"; // three.js r128 (MIT), servido desde el mismo sitio
    s.onload = () => (window.THREE ? ok(window.THREE) : mal(new Error("sin THREE"))); s.onerror = mal; document.head.append(s);
  });
}
let estado = null, motor = null, iniciando = false, fondoElegido = "noche", tArmar = 0;
async function prender(cont) {
  if (motor || iniciando) return; iniciando = true;
  cont.querySelector(".vista-cargando") || cont.insertAdjacentHTML("afterbegin", '<p class="vista-cargando">Cargando 3D…</p>');
  try { const T = await cargarThree(); motor = crearMotor(T, cont); motor.fondo(fondoElegido); if (estado) motor.armar(estado); motor.activar(true); }
  catch (err) { const a = document.getElementById("vista-aviso"); if (a) a.textContent = "Tu dispositivo no pudo mostrar el 3D. Igual podés armar tu ramo y pedirlo."; }
  const c = cont.querySelector(".vista-cargando"); if (c) c.remove(); iniciando = false;
}
export function iniciarVistaPrevia() {
  const cont = document.getElementById("vista"); if (!cont) return;
  cont.dataset.fondo = fondoElegido;
  document.querySelectorAll("[data-fondo]").forEach((b) => b.addEventListener("click", () => {
    fondoElegido = b.dataset.fondo; cont.dataset.fondo = fondoElegido;
    document.querySelectorAll("[data-fondo]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    if (motor) motor.fondo(fondoElegido);
  }));
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) prender(cont); if (motor) motor.activar(en.isIntersecting && !document.hidden); }), { rootMargin: "200px" }).observe(cont);
  else prender(cont);
  document.addEventListener("visibilitychange", () => { if (motor) motor.activar(!document.hidden); });
  let tRes = 0; window.addEventListener("resize", () => { clearTimeout(tRes); tRes = setTimeout(() => motor && motor.redimensionar(), 200); });
}
export function actualizarVistaPrevia(e) {
  estado = e; clearTimeout(tArmar); tArmar = setTimeout(() => motor && motor.armar(estado), 120);
}
