/* ============================================================
   NEURAL VOID — interaction engine v2
   GLSL living core · spiral galaxy · plasma cursor · glitch
   scramble text · magnetic buttons · 3D tilt cards · reveals
   ============================================================ */

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  // ?audit — skip entrance animations (handy for screenshots / PDF export)
  const auditMode = new URLSearchParams(location.search).has("audit");
  if (auditMode) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll("[data-count]").forEach((el) => (el.textContent = el.dataset.count));
    document.documentElement.style.scrollBehavior = "auto";
  }

  /* ============ BOOT LOADER ============ */
  const loader = document.getElementById("loader");
  const loaderBar = document.getElementById("loaderBar");
  const loaderStatus = document.getElementById("loaderStatus");
  const bootLines = [
    "INITIALIZING NEURAL CORE…",
    "LOADING INTELLIGENCE MODULES…",
    "CALIBRATING CREATIVITY ENGINE…",
    "SYNCING WITH THE VOID…",
    "WELCOME, VISITOR.",
  ];

  function runLoader() {
    if (reducedMotion) { loader.classList.add("done"); return; }
    let step = 0;
    const total = bootLines.length;
    const tick = () => {
      loaderStatus.textContent = bootLines[step];
      loaderBar.style.width = `${((step + 1) / total) * 100}%`;
      step++;
      if (step < total) {
        setTimeout(tick, 220);
      } else {
        setTimeout(() => loader.classList.add("done"), 420);
      }
    };
    tick();
    // Failsafe: never trap the user behind the loader
    setTimeout(() => loader.classList.add("done"), 4000);
  }
  runLoader();

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

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
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
      new THREE.IcosahedronGeometry(3.6, 48),
      new THREE.ShaderMaterial({
        uniforms, vertexShader, fragmentShader,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    coreGroup.add(blob);

    const shell = new THREE.Mesh(
      new THREE.IcosahedronGeometry(3.78, 20),
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

    // ---- spiral galaxy ----
    const STARS = 6000, ARMS = 4;
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
    scene.add(galaxy, coreGroup);

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
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;

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

      renderer.render(scene, camera);
    }
    animate();
  }
  initLivingCore();

  /* ============ PLASMA CURSOR — comet trail + sparks ============ */
  function initPlasmaCursor() {
    const canvas = document.getElementById("cursor-canvas");
    if (!canvas || !finePointer || reducedMotion) {
      if (canvas) canvas.remove();
      return;
    }
    document.documentElement.classList.add("no-cursor");
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(devicePixelRatio, 2);
    function size() {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    addEventListener("resize", size);

    const ACID = "198, 255, 0";
    let x = -100, y = -100, hover = false, ringR = 0, tick = 0;
    const trail = [];
    const sparks = [];

    addEventListener("pointermove", (e) => {
      const speed = Math.hypot(e.clientX - x, e.clientY - y);
      x = e.clientX; y = e.clientY;
      trail.push({ x, y });
      if (trail.length > 26) trail.shift();
      // fast moves shed sparks
      if (speed > 18) {
        for (let i = 0; i < 2; i++) {
          sparks.push({
            x, y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 1,
          });
        }
      }
    }, { passive: true });

    document.querySelectorAll("[data-hover]").forEach((el) => {
      el.addEventListener("pointerenter", () => (hover = true));
      el.addEventListener("pointerleave", () => (hover = false));
    });

    function draw() {
      requestAnimationFrame(draw);
      tick++;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalCompositeOperation = "lighter";

      // comet trail
      for (let i = 1; i < trail.length; i++) {
        const p = i / trail.length;
        ctx.strokeStyle = `rgba(${ACID}, ${p * 0.55})`;
        ctx.lineWidth = p * 5;
        ctx.lineCap = "round";
        ctx.shadowColor = `rgba(${ACID}, 0.9)`;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
        ctx.lineTo(trail[i].x, trail[i].y);
        ctx.stroke();
      }
      // trail decays even when idle
      if (tick % 2 === 0 && trail.length) trail.shift();

      // sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy; s.life -= 0.04;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(${ACID}, ${s.life * 0.8})`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.life * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // core glow
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 22);
      grad.addColorStop(0, `rgba(${ACID}, 0.85)`);
      grad.addColorStop(1, `rgba(${ACID}, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      // hot center
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(242, 240, 234, 0.95)";
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // targeting ring expands on interactive elements
      ringR += ((hover ? 24 : 10) - ringR) * 0.18;
      const rot = tick * 0.03;
      ctx.strokeStyle = `rgba(${ACID}, ${hover ? 0.95 : 0.45})`;
      ctx.lineWidth = 1.4;
      // four arc segments — rotating reticle
      for (let q = 0; q < 4; q++) {
        const a = rot + (q * Math.PI) / 2;
        ctx.beginPath();
        ctx.arc(x, y, ringR, a, a + Math.PI / 3.2);
        ctx.stroke();
      }
      if (hover) {
        // corner ticks lock on
        ctx.fillStyle = `rgba(${ACID}, 0.95)`;
        for (let q = 0; q < 4; q++) {
          const a = -rot * 1.5 + (q * Math.PI) / 2 + Math.PI / 4;
          ctx.beginPath();
          ctx.arc(x + Math.cos(a) * (ringR + 7), y + Math.sin(a) * (ringR + 7), 1.6, 0, Math.PI * 2);
          ctx.fill();
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
  document.querySelectorAll(".skill-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

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
  addEventListener("scroll", () => {
    const y = scrollY;
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", y > lastY && y > 500);
    lastY = y;
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

  /* ============ LIVE CLOCK + YEAR ============ */
  const timeEl = document.getElementById("localTime");
  function tickClock() {
    if (timeEl) {
      timeEl.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
    }
  }
  tickClock();
  setInterval(tickClock, 1000);

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
