/* ============================================================
   NEURAL VOID — interaction engine v2
   GLSL living core · spiral galaxy · plasma cursor · glitch
   scramble text · magnetic buttons · 3D tilt cards · reveals
   ============================================================ */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const isMobile = window.matchMedia("(max-width: 960px), (pointer: coarse)").matches;
  if (isMobile) document.documentElement.classList.add("mobile-lite");
  document.addEventListener("visibilitychange", () => {
    document.documentElement.classList.toggle("is-paused", document.hidden);
  });
  // ?audit — skip entrance animations (handy for screenshots / PDF export)
  const auditMode = new URLSearchParams(location.search).has("audit");
  if (auditMode) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
    document.documentElement.style.scrollBehavior = "auto";
  }

  /* ============ THEME ENGINE — dark void / paper lab ============ */
  const THEME_KEY = "cjay-theme";
  const themeHooks = [];
  const isLight = () => document.documentElement.dataset.theme === "light";
  const themeRGB = () => ({
    acid: isLight() ? "92, 124, 10" : "198, 255, 0",
    ink: isLight() ? "19, 19, 16" : "242, 240, 234",
  });
  function refreshToggles() {
    document.querySelectorAll(".theme-toggle").forEach((b) => {
      b.querySelector(".theme-toggle__icon").textContent = isLight() ? "☾" : "☀";
      b.querySelector(".theme-toggle__label").textContent = isLight() ? "DARK" : "LIGHT";
    });
  }
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", t === "light" ? "#f4f2ea" : "#050507");
    refreshToggles();
    themeHooks.forEach((fn) => fn(t === "light"));
  }
  document.querySelectorAll(".theme-toggle").forEach((b) =>
    b.addEventListener("click", () => {
      setTheme(isLight() ? "dark" : "light");
      b.classList.remove("flipping");
      void b.offsetWidth; // restart the spin animation
      b.classList.add("flipping");
    })
  );
  refreshToggles();
  // ?theme=light|dark — force a theme (handy for sharing/screenshots)
  const forcedTheme = new URLSearchParams(location.search).get("theme");
  if (forcedTheme === "light" || forcedTheme === "dark") setTheme(forcedTheme);

  /* ============ CINEMATIC INTRO — PARTICLE GENESIS ============
     thousands of particles assemble into the name, breathe,
     then detonate as the site warps in from hyperspace        */
  const intro = document.getElementById("intro");

  async function runIntro() {
    if (!intro) return;
    const mainEl = document.querySelector("main");
    const navEl = document.getElementById("nav");
    if (reducedMotion || auditMode) {
      intro.classList.add("reveal", "gone");
      return;
    }

    const canvas = document.getElementById("intro-canvas");
    const sub = document.getElementById("introSub");
    const percentEl = document.getElementById("introPercent");
    const flash = document.getElementById("introFlash");
    const skipBtn = document.getElementById("introSkip");
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio, isMobile ? 1 : 1.25);
    const W = innerWidth, H = innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const LIGHTMODE = isLight();
    const { acid: AC, ink: IK } = themeRGB();

    document.body.style.overflow = "hidden";
    mainEl.classList.add("warp");
    navEl.classList.add("warp");

    // wait briefly for the display font so the particles form real letterforms
    try {
      await Promise.race([
        document.fonts.load("700 120px 'Clash Display'"),
        new Promise((r) => setTimeout(r, 200)),
      ]);
    } catch (e) { /* fallback font is fine */ }

    // ---- sample the name into particle targets ----
    const TEXT = "CJAY_CYBER";
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const octx = off.getContext("2d");
    let fontSize = Math.min(W / 6.4, 168);
    const setFont = () => { octx.font = `700 ${fontSize}px 'Clash Display', 'Arial Black', sans-serif`; };
    setFont();
    // shrink until the name actually fits the viewport (any font fallback)
    const maxWidth = W * 0.9;
    if (octx.measureText(TEXT).width > maxWidth) {
      fontSize *= maxWidth / octx.measureText(TEXT).width;
      setFont();
    }
    octx.textAlign = "center";
    octx.textBaseline = "middle";
    octx.fillStyle = "#fff";
    octx.fillText(TEXT, W / 2, H / 2);
    const img = octx.getImageData(0, 0, W, H).data;

    const gap = isMobile ? 6 : fontSize > 90 ? 5 : 4;
    const targets = [];
    for (let y = 0; y < H; y += gap) {
      for (let x = 0; x < W; x += gap) {
        if (img[(y * W + x) * 4 + 3] > 128) targets.push({ x, y });
      }
    }
    // shuffle so assembly looks organic, cap hard for buttery 60fps
    for (let i = targets.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [targets[i], targets[j]] = [targets[j], targets[i]];
    }
    targets.length = Math.min(targets.length, isMobile ? 650 : W < 700 ? 1000 : 2400);

    const cx = W / 2, cy = H / 2;
    const parts = targets.map((t) => {
      // born on a ring far outside the screen — they fly IN
      const a = Math.random() * Math.PI * 2;
      const r = Math.max(W, H) * (0.6 + Math.random() * 0.5);
      return {
        tx: t.x, ty: t.y,
        sx: cx + Math.cos(a) * r,
        sy: cy + Math.sin(a) * r,
        x: 0, y: 0, px: 0, py: 0,
        delay: Math.random() * 0.9,
        hot: Math.random() < 0.12,
        size: 1.4 + Math.random() * 1.8,
        jp: Math.random() * Math.PI * 2,
        vx: 0, vy: 0,
        a: 1,
      };
    });

    // ---- timeline (seconds) ----
    const T_ASSEMBLE = 2.6;   // particles arriving
    const T_EXPLODE = 4.6;    // detonation (long hold so the name lands)
    const T_REVEAL = 4.95;    // site warps in
    const T_END = 6.6;
    const easeOut = (p) => 1 - Math.pow(1 - p, 4);

    let exploded = false, revealed = false, finished = false, raf = 0;
    const rings = [];
    const t0 = performance.now();

    function finish() {
      if (finished) return;
      finished = true;
      cancelAnimationFrame(raf);
      // Add 'reveal' first so the CSS opacity/background transition plays,
      // then add 'gone' (display:none) only after the fade completes.
      intro.classList.add("reveal");
      mainEl.classList.remove("warp");
      navEl.classList.remove("warp");
      document.body.style.overflow = "";
      removeEventListener("keydown", finish);
      setTimeout(() => intro.classList.add("gone"), 680);
      // Defer THREE.js init until after the intro fade so it never
      // competes with an active CSS transition on the main thread.
      setTimeout(startLivingCore, 700);
    }
    skipBtn.addEventListener("click", finish);
    addEventListener("keydown", finish);
    setTimeout(finish, 9000); // failsafe — never trap the visitor

    function explode() {
      exploded = true;
      flash.classList.add("zap");
      rings.push({ r: 0, w: 3, c: AC }, { r: -40, w: 1.5, c: IK });
      for (const p of parts) {
        const dx = p.x - cx, dy = p.y - cy;
        const d = Math.hypot(dx, dy) || 1;
        const speed = 6 + Math.random() * 18;
        p.vx = (dx / d) * speed + (Math.random() - 0.5) * 4;
        p.vy = (dy / d) * speed + (Math.random() - 0.5) * 4;
      }
    }

    function frame(now) {
      if (finished) return;
      raf = requestAnimationFrame(frame);
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      // additive glow washes out on paper — use normal compositing in light mode
      ctx.globalCompositeOperation = LIGHTMODE ? "source-over" : "lighter";

      if (!exploded) {
        // ---- assembly: fly in from the void ----
        // batched: one shared streak path + two fill passes = few state changes
        const sinT = Math.sin(t * 7);
        ctx.strokeStyle = `rgba(${AC}, 0.1)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const lp = Math.min(Math.max((t - p.delay) / T_ASSEMBLE, 0), 1);
          const e = easeOut(lp);
          const j = lp === 1 ? Math.sin(sinT + p.jp) * 0.7 : 0;
          p.x = p.sx + (p.tx - p.sx) * e + j;
          p.y = p.sy + (p.ty - p.sy) * e - j;
          if (i % 3 === 0 && lp > 0 && lp < 0.88) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + (p.sx - p.tx) * 0.02, p.y + (p.sy - p.ty) * 0.02);
          }
        }
        ctx.stroke();
        ctx.fillStyle = `rgba(${AC}, 0.85)`;
        for (const p of parts) if (!p.hot) ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.fillStyle = `rgba(${IK}, 0.9)`;
        for (const p of parts) if (p.hot) ctx.fillRect(p.x, p.y, p.size, p.size);
        if (t > 2.6) sub.classList.add("on");
        const pct = Math.min(Math.floor(easeOut(Math.min(t / T_EXPLODE, 1)) * 100), 99);
        percentEl.textContent = `SYNTHESIZING — ${String(pct).padStart(3, "0")}%`;
        if (t >= T_EXPLODE) { percentEl.textContent = "SYNTHESIZING — 100%"; explode(); }
      } else {
        // ---- detonation: radial blast, batched into two stroke passes ----
        let fade = 1;
        for (const p of parts) {
          p.px = p.x; p.py = p.y;
          p.x += p.vx; p.y += p.vy;
          p.vx *= 1.04; p.vy *= 1.04;
          p.a *= 0.965;
          fade = p.a;
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(${AC}, ${Math.max(fade * 0.85, 0)})`;
        ctx.beginPath();
        for (const p of parts) {
          if (p.hot || p.a < 0.02) continue;
          ctx.moveTo(p.px - p.vx * 1.6, p.py - p.vy * 1.6);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        ctx.strokeStyle = `rgba(${IK}, ${Math.max(fade, 0)})`;
        ctx.beginPath();
        for (const p of parts) {
          if (!p.hot || p.a < 0.02) continue;
          ctx.moveTo(p.px - p.vx * 1.6, p.py - p.vy * 1.6);
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        // shockwave rings
        for (const ring of rings) {
          ring.r += Math.max(W, H) * 0.045;
          if (ring.r > 0) {
            const ra = Math.max(1 - ring.r / (Math.max(W, H) * 0.9), 0);
            ctx.strokeStyle = `rgba(${ring.c}, ${ra * 0.8})`;
            ctx.lineWidth = ring.w * ra * 3;
            ctx.beginPath();
            ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        if (!revealed && t >= T_REVEAL) {
          revealed = true;
          intro.classList.add("reveal");
          mainEl.classList.remove("warp");
          navEl.classList.remove("warp");
          document.body.style.overflow = "";
          // Defer 3D core until the 1 s warp transition finishes so WebGL
          // compilation never races the compositor and drops frames.
          setTimeout(startLivingCore, 1050);
        }
        if (t >= T_END) finish();
      }
    }
    raf = requestAnimationFrame(frame);
  }
  runIntro();

  /* ============ LIVING CORE — GLSL energy organism ============ */
  async function initLivingCore() {
    const canvas = document.getElementById("neural-canvas");
    if (!canvas || reducedMotion) return;

    let THREE;
    try {
      THREE = await import("https://unpkg.com/three@0.160.0/build/three.module.js");
    } catch (e) {
      canvas.style.display = "none"; // offline / CDN blocked — site still works
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 200);
    camera.position.z = 14;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile ? 1.25 : 1.5));
    renderer.setSize(innerWidth, innerHeight);

    // ---- 3D simplex noise (Ashima / IQ) shared by both shaders ----
    const NOISE_GLSL = `
      vec3 mod289(vec3 x){return x - floor(x * (1.0/289.0)) * 289.0;}
      vec4 mod289(vec4 x){return x - floor(x * (1.0/289.0)) * 289.0;}
      vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
      vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
      float snoise(vec3 v){
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i);
        vec4 p = permute(permute(permute(
                 i.z + vec4(0.0, i1.z, i2.z, 1.0))
               + i.y + vec4(0.0, i1.y, i2.y, 1.0))
               + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857;
        vec3 ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);
        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);
        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);
        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));
        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
        p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
      }`;

    const uniforms = {
      uTime: { value: 0 },
      uAmp: { value: 0.55 },
      uPulse: { value: 0 },
      uColorA: { value: new THREE.Color(0xc6ff00) },
      uColorB: { value: new THREE.Color(0xf2f0ea) },
    };

    const vertexShader = `
      uniform float uTime;
      uniform float uAmp;
      uniform float uPulse;
      varying float vNoise;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      ${NOISE_GLSL}
      void main() {
        float n  = snoise(normal * 1.4 + vec3(uTime * 0.22));
        float n2 = snoise(normal * 3.8 - vec3(uTime * 0.45));
        float ripple = uPulse * 0.5 * sin(length(position) * 4.0 - uTime * 9.0);
        float disp = n * uAmp + n2 * uAmp * 0.3 + ripple;
        vec3 newPos = position + normal * disp;
        vNoise = n;
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(newPos, 1.0);
        vViewPos = mv.xyz;
        gl_Position = projectionMatrix * mv;
      }`;

    const fragmentShader = `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vNoise;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vec3 viewDir = normalize(-vViewPos);
        float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 2.4);
        vec3 col = mix(uColorB * 0.06, uColorA, clamp(fresnel + vNoise * 0.3, 0.0, 1.0));
        float alpha = 0.22 + fresnel * 0.9;
        gl_FragColor = vec4(col, alpha);
      }`;

    const coreGroup = new THREE.Group();

    const blob = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.6, isMobile ? 24 : 48),
      new THREE.ShaderMaterial({
        uniforms, vertexShader, fragmentShader,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    coreGroup.add(blob);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.78, isMobile ? 12 : 20),
      new THREE.ShaderMaterial({
        uniforms, vertexShader, fragmentShader,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
        wireframe: true, opacity: 0.5,
      })
    );
    coreGroup.add(shell);

    // ---- orbital rings ----
    const rings = [];
    [[5.2, 0.5, 0.0], [6.1, -0.4, 0.7], [7.0, 1.1, -0.4]].forEach(([r, rx, rz], i) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(r, 0.008, 6, 220),
        new THREE.MeshBasicMaterial({
          color: 0xc6ff00, transparent: true, opacity: 0.22 - i * 0.05,
          blending: THREE.AdditiveBlending, depthWrite: false,
        })
      );
      ring.rotation.set(rx, 0, rz);
      rings.push(ring);
      coreGroup.add(ring);
    });

    // ---- spiral galaxy + deep starfield ----
    const STARS = isMobile ? 4200 : 9500, ARMS = 4;
    const gPos = new Float32Array(STARS * 3);
    const gCol = new Float32Array(STARS * 3);
    const cIn = new THREE.Color(0xc6ff00), cOut = new THREE.Color(0xf2f0ea);
    for (let i = 0; i < STARS; i++) {
      const r = 4 + Math.pow(Math.random(), 1.7) * 22;
      const angle = ((i % ARMS) / ARMS) * Math.PI * 2 + r * 0.28 + (Math.random() - 0.5) * 0.5;
      gPos[i * 3] = Math.cos(angle) * r + (Math.random() - 0.5) * 1.2;
      gPos[i * 3 + 1] = (Math.random() - 0.5) * (2.6 - r * 0.08);
      gPos[i * 3 + 2] = Math.sin(angle) * r + (Math.random() - 0.5) * 1.2;
      const c = cIn.clone().lerp(cOut, Math.min(r / 24, 1));
      gCol[i * 3] = c.r; gCol[i * 3 + 1] = c.g; gCol[i * 3 + 2] = c.b;
    }
    const galaxyGeo = new THREE.BufferGeometry();
    galaxyGeo.setAttribute("position", new THREE.BufferAttribute(gPos, 3));
    galaxyGeo.setAttribute("color", new THREE.BufferAttribute(gCol, 3));
    const galaxy = new THREE.Points(galaxyGeo, new THREE.PointsMaterial({
      size: 0.05, vertexColors: true, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }));
    galaxy.rotation.x = -0.45;

    const FIELD_STARS = isMobile ? 2800 : 6200;
    const fPos = new Float32Array(FIELD_STARS * 3);
    const fCol = new Float32Array(FIELD_STARS * 3);
    for (let i = 0; i < FIELD_STARS; i++) {
      fPos[i * 3] = (Math.random() - 0.5) * 88;
      fPos[i * 3 + 1] = (Math.random() - 0.5) * 52;
      fPos[i * 3 + 2] = (Math.random() - 0.5) * 70 - 8;
      const twinkle = 0.25 + Math.random() * 0.75;
      const pick = Math.random() > 0.72 ? cIn : cOut;
      fCol[i * 3] = pick.r * twinkle;
      fCol[i * 3 + 1] = pick.g * twinkle;
      fCol[i * 3 + 2] = pick.b * twinkle;
    }
    const fieldGeo = new THREE.BufferGeometry();
    fieldGeo.setAttribute("position", new THREE.BufferAttribute(fPos, 3));
    fieldGeo.setAttribute("color", new THREE.BufferAttribute(fCol, 3));
    const starField = new THREE.Points(fieldGeo, new THREE.PointsMaterial({
      size: 0.06, vertexColors: true, transparent: true, opacity: 0.72,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
    }));
    scene.add(starField, galaxy, coreGroup);

    // ---- shooting stars — luminous trails only, no floating dots ----
    const comets = [];
    const cometBlend = () => (isLight() ? THREE.NormalBlending : THREE.AdditiveBlending);
    let nextCometAt = 1.8;

    function randomUnitVector() {
      const u = Math.random(), v = Math.random();
      const theta = Math.PI * 2 * u;
      const phi = Math.acos(2 * v - 1);
      return {
        x: Math.sin(phi) * Math.cos(theta),
        y: Math.sin(phi) * Math.sin(theta),
        z: Math.cos(phi),
      };
    }

    function buildCometColors(TRAIL, light, strength = 1) {
      const colors = new Float32Array(TRAIL * 3);
      const acid = new THREE.Color(light ? 0x5c7c0a : 0xc6ff00);
      const bone = new THREE.Color(light ? 0x131310 : 0xf2f0ea);
      const white = new THREE.Color(1, 1, 1);
      for (let i = 0; i < TRAIL; i++) {
        const t = i / Math.max(TRAIL - 1, 1);
        const c = i < 3
          ? white.clone().lerp(acid, t * 3)
          : acid.clone().lerp(bone, Math.pow(t, 0.35));
        const fade = Math.pow(1 - t, 2.6) * strength;
        colors[i * 3] = c.r * fade;
        colors[i * 3 + 1] = c.g * fade;
        colors[i * 3 + 2] = c.b * fade;
      }
      return colors;
    }

    function spawnComet() {
      const dir = randomUnitVector();
      const speed = 24 + Math.random() * 26;
      const spawnR = 36 + Math.random() * 14;
      const x = -dir.x * spawnR + (Math.random() - 0.5) * 2.5;
      const y = -dir.y * spawnR + (Math.random() - 0.5) * 2.5;
      const z = -dir.z * spawnR + (Math.random() - 0.5) * 2.5;
      const vx = dir.x * speed;
      const vy = dir.y * speed;
      const vz = dir.z * speed;

      const TRAIL = isMobile ? 42 : 68;
      const pos = new Float32Array(TRAIL * 3);
      const colors = buildCometColors(TRAIL, isLight(), 1);
      const haloColors = buildCometColors(TRAIL, isLight(), 0.42);
      for (let i = 0; i < TRAIL; i++) {
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
      }
      const geo = new THREE.BufferGeometry();
      const posAttr = new THREE.BufferAttribute(pos, 3);
      geo.setAttribute("position", posAttr);
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const blend = cometBlend();

      const haloGeo = new THREE.BufferGeometry();
      haloGeo.setAttribute("position", posAttr);
      haloGeo.setAttribute("color", new THREE.BufferAttribute(haloColors, 3));

      const halo = new THREE.Line(
        haloGeo,
        new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: isLight() ? 0.35 : 0.55,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );

      const tail = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: isLight() ? 0.92 : 1,
          blending: blend,
          depthWrite: false,
        })
      );
      scene.add(halo, tail);
      comets.push({
        halo, tail, pos, colors, haloColors,
        x, y, z, vx, vy, vz, TRAIL,
        traveled: 0, maxTravel: 82 + Math.random() * 28,
      });
    }

    function disposeComet(c) {
      scene.remove(c.halo, c.tail);
      c.halo.geometry.dispose();
      c.halo.material.dispose();
      c.tail.geometry.dispose();
      c.tail.material.dispose();
    }

    function updateComets(dt) {
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        c.z += c.vz * dt;
        c.traveled += Math.hypot(c.vx, c.vy, c.vz) * dt;
        for (let j = c.TRAIL - 1; j > 0; j--) {
          c.pos[j * 3] = c.pos[(j - 1) * 3];
          c.pos[j * 3 + 1] = c.pos[(j - 1) * 3 + 1];
          c.pos[j * 3 + 2] = c.pos[(j - 1) * 3 + 2];
        }
        c.pos[0] = c.x;
        c.pos[1] = c.y;
        c.pos[2] = c.z;
        c.tail.geometry.attributes.position.needsUpdate = true;
        c.halo.geometry.attributes.position.needsUpdate = true;
        if (c.traveled > c.maxTravel || Math.abs(c.x) > 48 || Math.abs(c.y) > 48 || Math.abs(c.z) > 48) {
          disposeComet(c);
          comets.splice(i, 1);
        }
      }
    }

    function applyCometTheme(light) {
      const blend = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      comets.forEach((c) => {
        const next = buildCometColors(c.TRAIL, light, 1);
        const haloNext = buildCometColors(c.TRAIL, light, 0.42);
        c.colors.set(next);
        c.haloColors.set(haloNext);
        c.tail.geometry.attributes.color.needsUpdate = true;
        c.halo.geometry.attributes.color.needsUpdate = true;
        c.tail.material.blending = blend;
        c.tail.material.opacity = light ? 0.92 : 1;
        c.halo.material.opacity = light ? 0.35 : 0.55;
      });
    }

    // ---- live re-theme: additive neon in the void, olive ink on paper ----
    function applyCoreTheme(light) {
      const acid = light ? 0x4a6b00 : 0xc6ff00;
      uniforms.uColorA.value.set(acid);
      uniforms.uColorB.value.set(light ? 0x131310 : 0xf2f0ea);
      const blend = light ? THREE.NormalBlending : THREE.AdditiveBlending;
      [blob.material, shell.material, galaxy.material, starField.material].forEach((m) => {
        m.blending = blend;
        m.needsUpdate = true;
      });
      galaxy.material.opacity = light ? 0.5 : 0.8;
      starField.material.opacity = light ? 0.42 : 0.72;
      const gIn = new THREE.Color(acid);
      const gOut = new THREE.Color(light ? 0x6b6a5e : 0xf2f0ea);
      const fColAttr = fieldGeo.getAttribute("color");
      for (let i = 0; i < FIELD_STARS; i++) {
        const twinkle = 0.25 + (i % 97) / 97 * 0.75;
        const pick = i % 5 === 0 ? gIn : gOut;
        fColAttr.array[i * 3] = pick.r * twinkle;
        fColAttr.array[i * 3 + 1] = pick.g * twinkle;
        fColAttr.array[i * 3 + 2] = pick.b * twinkle;
      }
      fColAttr.needsUpdate = true;
      rings.forEach((ring) => {
        ring.material.color.set(acid);
        ring.material.blending = blend;
        ring.material.needsUpdate = true;
      });
      const colAttr = galaxyGeo.getAttribute("color");
      for (let i = 0; i < STARS; i++) {
        const r = Math.hypot(gPos[i * 3], gPos[i * 3 + 2]);
        const c = gIn.clone().lerp(gOut, Math.min(r / 24, 1));
        colAttr.array[i * 3] = c.r;
        colAttr.array[i * 3 + 1] = c.g;
        colAttr.array[i * 3 + 2] = c.b;
      }
      colAttr.needsUpdate = true;
      applyCometTheme(light);
    }
    themeHooks.push(applyCoreTheme);
    if (isLight()) applyCoreTheme(true);

    // ---- layout: core sits right of the headline on wide screens ----
    function layout() {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
      if (innerWidth > 960) {
        coreGroup.position.set(4.8, 0.2, 0);
        coreGroup.scale.setScalar(1);
      } else {
        coreGroup.position.set(0, 1.2, -2);
        coreGroup.scale.setScalar(0.72);
      }
    }
    layout();
    addEventListener("resize", layout);

    // ---- interaction: speed feeds the organism, click detonates ----
    let mx = 0, my = 0, lastX = 0, lastY = 0, vel = 0, targetAmp = 0.55;
    addEventListener("pointermove", (e) => {
      mx = (e.clientX / innerWidth) * 2 - 1;
      my = (e.clientY / innerHeight) * 2 - 1;
      vel = Math.min(Math.hypot(e.clientX - lastX, e.clientY - lastY), 60);
      lastX = e.clientX; lastY = e.clientY;
    }, { passive: true });
    addEventListener("pointerdown", () => { uniforms.uPulse.value = 1.0; });

    let heroVisible = true;
    new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; })
      .observe(document.querySelector(".hero"));

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      if (!heroVisible) return;
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;

      if (t >= nextCometAt) {
        nextCometAt = t + 4 + Math.random() * 2.5;
        spawnComet();
        if (Math.random() < 0.4) spawnComet();
      }
      updateComets(dt);

      // organism breathes harder the faster you move
      targetAmp = 0.55 + (vel / 60) * 0.85;
      vel *= 0.92;
      uniforms.uAmp.value += (targetAmp - uniforms.uAmp.value) * 0.06;
      uniforms.uPulse.value *= 0.945;

      coreGroup.rotation.y = t * 0.12 + mx * 0.45;
      coreGroup.rotation.x = my * 0.3 + Math.sin(t * 0.2) * 0.08;
      rings[0].rotation.z += 0.0035;
      rings[1].rotation.x += 0.0028;
      rings[2].rotation.y += 0.0022;

      galaxy.rotation.y = t * 0.02 + mx * 0.06;
      starField.rotation.y = t * 0.008;
      starField.rotation.x = Math.sin(t * 0.05) * 0.03;

      renderer.render(scene, camera);
    }
    animate();
  }
  // the intro starts the core when it finishes; without an intro, start now
  let coreStarted = false;
  function startLivingCore() {
    if (coreStarted) return;
    coreStarted = true;
    initLivingCore();
  }
  if (reducedMotion || auditMode) startLivingCore();

  /* ============ PLASMA CURSOR — comet trail + sparks ============ */
  function initPlasmaCursor() {
    const canvas = document.getElementById("cursor-canvas");
    if (!canvas || !finePointer || reducedMotion) {
      if (canvas) canvas.remove();
      return;
    }
    document.documentElement.classList.add("no-cursor");
    const ctx = canvas.getContext("2d");
    // dpr capped low + zero shadowBlur = no GPU stalls
    const dpr = Math.min(devicePixelRatio, 1.5);
    function size() {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    addEventListener("resize", size);

    let ACID = themeRGB().acid;
    let DOT = themeRGB().ink;
    let lightCursor = isLight();
    themeHooks.push(() => {
      ACID = themeRGB().acid;
      DOT = themeRGB().ink;
      lightCursor = isLight();
    });
    let x = -100, y = -100, hover = false, ringR = 10, tick = 0;
    const trail = [];
    const sparks = [];
    const MAX_TRAIL = 18, MAX_SPARKS = 40;

    addEventListener("pointermove", (e) => {
      const speed = Math.hypot(e.clientX - x, e.clientY - y);
      x = e.clientX; y = e.clientY;
      trail.push({ x, y });
      if (trail.length > MAX_TRAIL) trail.shift();
      if (speed > 22 && sparks.length < MAX_SPARKS) {
        sparks.push({
          x, y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          life: 1,
        });
      }
    }, { passive: true });

    // event delegation — one listener instead of hundreds
    document.addEventListener("pointerover", (e) => {
      hover = !!e.target.closest("[data-hover], a, button");
    }, { passive: true });

    function strokeTrail(width, alpha) {
      ctx.strokeStyle = `rgba(${ACID}, ${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }

    function draw() {
      requestAnimationFrame(draw);
      tick++;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalCompositeOperation = lightCursor ? "source-over" : "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // comet trail — two cheap strokes fake the glow (no shadowBlur)
      if (trail.length > 1) {
        strokeTrail(7, 0.12);
        strokeTrail(2.5, 0.5);
      }
      if (tick % 2 === 0 && trail.length) trail.shift();

      // sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy; s.life -= 0.045;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(${ACID}, ${s.life * 0.7})`;
        ctx.fillRect(s.x, s.y, s.life * 3, s.life * 3);
      }

      // core glow (single gradient — cheap)
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 20);
      grad.addColorStop(0, `rgba(${ACID}, 0.8)`);
      grad.addColorStop(1, `rgba(${ACID}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(x - 20, y - 20, 40, 40);

      // hot center
      ctx.fillStyle = `rgba(${DOT}, 0.95)`;
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // rotating reticle — expands & locks on interactive elements
      ringR += ((hover ? 23 : 10) - ringR) * 0.18;
      const rot = tick * 0.03;
      ctx.strokeStyle = `rgba(${ACID}, ${hover ? 0.95 : 0.45})`;
      ctx.lineWidth = 1.4;
      for (let q = 0; q < 4; q++) {
        const a = rot + (q * Math.PI) / 2;
        ctx.beginPath();
        ctx.arc(x, y, ringR, a, a + Math.PI / 3.2);
        ctx.stroke();
      }
      if (hover) {
        ctx.fillStyle = `rgba(${ACID}, 0.95)`;
        for (let q = 0; q < 4; q++) {
          const a = -rot * 1.5 + (q * Math.PI) / 2 + Math.PI / 4;
          ctx.fillRect(x + Math.cos(a) * (ringR + 7) - 1.5, y + Math.sin(a) * (ringR + 7) - 1.5, 3, 3);
        }
      }
    }
    draw();
  }
  initPlasmaCursor();

  /* ============ SCRAMBLE TEXT ============ */
  const scrambleEl = document.getElementById("scramble");
  const roles = [
    "AI NATIVE ENGINEER",
    "MACHINE LEARNING ENGINEER",
    "AGENT SWARM ARCHITECT",
    "FRONTEND ENGINEER",
    "BACKEND ENGINEER",
  ];
  const GLYPHS = "!<>-_\\/[]{}—=+*^?#@01";

  function scrambleTo(el, text) {
    const from = el.textContent;
    const length = Math.max(from.length, text.length);
    const queue = [];
    for (let i = 0; i < length; i++) {
      const start = Math.floor(Math.random() * 24);
      const end = start + Math.floor(Math.random() * 24);
      queue.push({ from: from[i] || "", to: text[i] || "", start, end });
    }
    let frame = 0;
    function update() {
      let out = "";
      let done = 0;
      for (const q of queue) {
        if (frame >= q.end) { done++; out += q.to; }
        else if (frame >= q.start) out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        else out += q.from;
      }
      el.textContent = out;
      if (done < queue.length) { frame++; requestAnimationFrame(update); }
    }
    update();
  }

  if (scrambleEl && !reducedMotion) {
    let roleIdx = 0;
    setInterval(() => {
      roleIdx = (roleIdx + 1) % roles.length;
      scrambleTo(scrambleEl, roles[roleIdx]);
    }, 3400);
  }

  /* ============ MAGNETIC BUTTONS ============ */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const strength = 0.35;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.transform = "translate(0, 0)";
        setTimeout(() => (el.style.transition = ""), 450);
      });
    });
  }

  /* ============ 3D TILT — project cards ============ */
  if (finePointer && !reducedMotion) {
    document.querySelectorAll(".project").forEach((card) => {
      const link = card.querySelector(".project__link");
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        link.style.transform = `rotateY(${px * 9}deg) rotateX(${-py * 7}deg) translateZ(14px)`;
      });
      card.addEventListener("pointerleave", () => { link.style.transform = ""; });
    });
  }

  /* ============ SKILL CARD GLOW FOLLOWS MOUSE ============ */
  if (finePointer) {
    document.querySelectorAll(".skill-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ============ SCROLL REVEALS ============ */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

  /* ============ STAT COUNTERS ============ */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const dur = 1600;
        const start = performance.now();
        (function step(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(target * eased);
          if (p < 1) requestAnimationFrame(step);
        })(start);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  document.querySelectorAll("[data-count]").forEach((el) => counterObserver.observe(el));

  /* ============ NAV: hide on scroll down, glass on scroll ============ */
  const nav = document.getElementById("nav");
  let lastY = 0;
  let scrollTicking = false;
  addEventListener("scroll", () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      nav.classList.toggle("is-scrolled", y > 40);
      nav.classList.toggle("is-hidden", y > lastY && y > 500);
      lastY = y;
      scrollTicking = false;
    });
  }, { passive: true });

  /* ============ MOBILE MENU ============ */
  const burger = document.getElementById("burger");
  const mobileMenu = document.getElementById("mobileMenu");
  burger.addEventListener("click", () => {
    burger.classList.toggle("is-open");
    mobileMenu.classList.toggle("is-open");
    document.body.style.overflow = mobileMenu.classList.contains("is-open") ? "hidden" : "";
  });
  mobileMenu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      burger.classList.remove("is-open");
      mobileMenu.classList.remove("is-open");
      document.body.style.overflow = "";
    })
  );

  /* ============ PORTFOLIO UPTIME — counts up from launch ============ */
  const PORTFOLIO_EPOCH = new Date("2026-06-12T13:56:31Z").getTime();
  const timeEl = document.getElementById("localTime");
  const pad2 = (n) => String(n).padStart(2, "0");
  function tickUptime() {
    if (!timeEl) return;
    const elapsed = Math.max(0, Date.now() - PORTFOLIO_EPOCH);
    const totalSec = Math.floor(elapsed / 1000);
    const days = Math.floor(totalSec / 86400);
    const hrs = Math.floor((totalSec % 86400) / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    timeEl.textContent = `${String(days).padStart(3, "0")}D ${pad2(hrs)}:${pad2(mins)}:${pad2(secs)}`;
  }
  tickUptime();
  setInterval(tickUptime, 1000);
  const mobileUptime = document.getElementById("mobileUptime");
  if (mobileUptime) {
    const syncMobileUptime = () => {
      if (timeEl) mobileUptime.textContent = `UPTIME ${timeEl.textContent}`;
    };
    syncMobileUptime();
    setInterval(syncMobileUptime, 1000);
  }

  const year = new Date().getFullYear();
  const footerYear = document.getElementById("footerYear");
  const heroYear = document.getElementById("heroYear");
  if (footerYear) footerYear.textContent = year;
  if (heroYear) heroYear.textContent = `SYS.TIME ${year}`;

  /* ============ CONSOLE EASTER EGG ============ */
  console.log(
    "%c CJAY_CYBER %c NEURAL VOID v2.0 — you found the console. Let's talk: chijiokejoseph2022@gmail.com ",
    "background:#c6ff00;color:#050507;font-weight:bold;padding:4px 8px;",
    "background:#0a0a10;color:#c6ff00;padding:4px 8px;"
  );
})();
