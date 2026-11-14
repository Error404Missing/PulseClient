/**
 * PulseClient — "Meet the bots" 3D Interactive Showcase
 * Reverse-Engineered from Corz.gg using Exact 4x4 Matrix Mathematics (Module 87782),
 * 3D Pedestal Canvas Projection (Module 85801), and Minecraft Skin Mesh (Module 9565).
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. 4x4 MATRIX MATH LIBRARY (Corz.gg Module 87782)
  // =========================================================================
  const DEG2RAD = Math.PI / 180;

  function matIdentity() {
    const m = new Float64Array(16);
    m[0] = m[5] = m[10] = m[15] = 1;
    return m;
  }

  function matMul(a, b) {
    const out = new Float64Array(16);
    for (let col = 0; col < 4; col++) {
      for (let row = 0; row < 4; row++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          sum += a[4 * k + row] * b[4 * col + k];
        }
        out[4 * col + row] = sum;
      }
    }
    return out;
  }

  function matCompose(...mats) {
    let res = matIdentity();
    for (const m of mats) res = matMul(res, m);
    return res;
  }

  function matTranslate(x, y, z) {
    const m = matIdentity();
    m[12] = x; m[13] = y; m[14] = z;
    return m;
  }

  function matScale(x, y = x, z = x) {
    const m = matIdentity();
    m[0] = x; m[5] = y; m[10] = z;
    return m;
  }

  function matRotateX(rad) {
    const m = matIdentity(), c = Math.cos(rad), s = Math.sin(rad);
    m[5] = c; m[6] = s; m[9] = -s; m[10] = c;
    return m;
  }

  function matRotateY(rad) {
    const m = matIdentity(), c = Math.cos(rad), s = Math.sin(rad);
    m[0] = c; m[2] = -s; m[8] = s; m[10] = c;
    return m;
  }

  function matRotateZ(rad) {
    const m = matIdentity(), c = Math.cos(rad), s = Math.sin(rad);
    m[0] = c; m[1] = s; m[4] = -s; m[5] = c;
    return m;
  }

  function matEuler(roll, yaw, pitch) {
    return matMul(matMul(matRotateZ(roll), matRotateY(yaw)), matRotateX(pitch));
  }

  function matEulerXYZ(rx, ry, rz) {
    return matMul(matMul(matRotateX(rx), matRotateY(ry)), matRotateZ(rz));
  }

  function matRotateAxis(angle, x, y, z) {
    const len = Math.hypot(x, y, z) || 1;
    x /= len; y /= len; z /= len;
    const c = Math.cos(angle), s = Math.sin(angle), omc = 1 - c;
    const m = matIdentity();
    m[0] = omc * x * x + c;     m[1] = omc * x * y + s * z; m[2] = omc * x * z - s * y;
    m[4] = omc * x * y - s * z; m[5] = omc * y * y + c;     m[6] = omc * y * z + s * x;
    m[8] = omc * x * z + s * y; m[9] = omc * y * z - s * x; m[10] = omc * z * z + c;
    return m;
  }

  function matTranspose3x3(m) {
    const t = matIdentity();
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        t[4 * c + r] = m[4 * r + c];
      }
    }
    return t;
  }

  function matPoint(m, x, y, z) {
    return [
      m[0] * x + m[4] * y + m[8] * z + m[12],
      m[1] * x + m[5] * y + m[9] * z + m[13],
      m[2] * x + m[6] * y + m[10] * z + m[14]
    ];
  }

  function matToCss(m) {
    let s = 'matrix3d(';
    for (let i = 0; i < 16; i++) {
      s += (i ? ',' : '') + (Math.abs(m[i]) < 1e-9 ? 0 : +m[i].toFixed(6));
    }
    return s + ')';
  }

  // =========================================================================
  // 2. CAMERA CALCULATION & CANVAS PEDESTAL (Corz.gg Module 85801)
  // =========================================================================
  const PEDESTAL_Y_OFFSET = 0.94;

  function calcCamera(w, h) {
    const safeW = Math.max(10, w);
    const safeH = Math.max(10, h);
    const a = Math.tan(24 * Math.PI / 360);
    const distance = Math.max(1.1 / a, 0.8 / (a * Math.max(0.001, safeW / safeH))) / 0.92;
    const focal = (safeH / 2) / a;
    const U = focal / distance;
    return { distance, focal, U };
  }

  function project3DTo2D(cam, w, h, pitchDeg, x, y, z) {
    const r = pitchDeg * DEG2RAD;
    const s = y - PEDESTAL_Y_OFFSET;
    const u = s * Math.cos(r) - z * Math.sin(r);
    const d = s * Math.sin(r) + z * Math.cos(r) - cam.distance;
    const m = -(cam.focal / d);
    return [w / 2 + x * m, h / 2 - u * m];
  }

  function renderPedestal(ctx, cam, w, h, pitchDeg, hexColor, power, hover, progress, dpr) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const prog = Math.max(0, Math.min(1, progress));
    if (prog <= 0) return;

    const rCol = (hexColor >> 16) & 255;
    const gCol = (hexColor >> 8) & 255;
    const bCol = hexColor & 255;
    const rgbStr = `${rCol},${gCol},${bCol}`;
    const pow = Math.max(0, Math.min(1, power));
    const hov = Math.max(0, Math.min(1, hover));

    // Radial floor glow
    const drawRadialGlow = (radius, colorStr, alpha) => {
      if (alpha <= 0.002) return;
      const [oX, oY] = project3DTo2D(cam, w, h, pitchDeg, 0, 0, radius);
      const [, iY] = project3DTo2D(cam, w, h, pitchDeg, 0, 0, -radius);
      const [rX] = project3DTo2D(cam, w, h, pitchDeg, radius, 0, 0);
      const [sX, sY] = project3DTo2D(cam, w, h, pitchDeg, 0, 0, 0);
      const dX = rX - sX;
      const mY = (oY - iY) / 2;
      const pY = (oY + iY) / 2;
      if (dX <= 0.01 || Math.abs(mY) <= 0.01) return;

      ctx.save();
      ctx.translate(sX, pY);
      ctx.scale(1, mY / dX);
      const grad = ctx.createRadialGradient(0, (dX / mY) * (sY - pY), 0, 0, 0, dX);
      grad.addColorStop(0, `rgba(${colorStr},${alpha})`);
      grad.addColorStop(1, `rgba(${colorStr},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, dX, 0, 2 * Math.PI);
      ctx.fill();
      ctx.restore();
    };

    drawRadialGlow(0.58, rgbStr, (0.05 + 0.09 * pow) * prog);
    drawRadialGlow(0.42, "0,0,0", 0.4 * prog);

    // Glowing 3D projected ring arcs
    const drawRingArc = (radius, thickness, alpha) => {
      if (alpha <= 0.002) return;
      const maxAngle = prog * Math.PI;
      const angles = [];
      const steps = 96;
      for (let i = 0; i <= steps; i++) {
        const ang = -Math.PI + (i * 2 * Math.PI) / steps;
        if (prog < 1 && (ang < -maxAngle || ang > maxAngle)) continue;
        angles.push(ang);
      }
      if (angles.length < 2) return;

      for (let step = 0; step < 4; step++) {
        const iRad = (thickness * step) / 4;
        const oRad = (thickness * (step + 1)) / 4;
        const aStep = Math.min(1, 1.1 * alpha * (1 - (step + 0.5) / 4));
        ctx.fillStyle = `rgba(${rgbStr},${aStep.toFixed(4)})`;
        ctx.beginPath();
        angles.forEach((ang, idx) => {
          const pt = project3DTo2D(cam, w, h, pitchDeg, Math.sin(ang) * radius, iRad, Math.cos(ang) * radius);
          if (idx === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        });
        for (let idx = angles.length - 1; idx >= 0; idx--) {
          const pt = project3DTo2D(cam, w, h, pitchDeg, Math.sin(angles[idx]) * radius, oRad, Math.cos(angles[idx]) * radius);
          ctx.lineTo(pt[0], pt[1]);
        }
        ctx.closePath();
        ctx.fill();
      }
    };

    const calcAlpha = (base, max) => Math.min(1, base + (max - base) * pow + 0.1 * hov);
    drawRingArc(0.58, 0.01, calcAlpha(0.4, 0.75));
    drawRingArc(0.72, 0.007, calcAlpha(0.25, 0.55));
  }

  // =========================================================================
  // 3. MINECRAFT SKIN GEOMETRY & SHADING (Corz.gg Module 9565)
  // =========================================================================
  const MODEL_PARTS = {
    head: [
      { x: -4, y: -8, z: -4, w: 8, h: 8, d: 8, u: 0, v: 0, opaque: true },
      { x: -4, y: -8, z: -4, w: 8, h: 8, d: 8, u: 32, v: 0, g: 0.5 }
    ],
    body: [
      { x: -4, y: 0, z: -2, w: 8, h: 12, d: 4, u: 16, v: 16, opaque: true },
      { x: -4, y: 0, z: -2, w: 8, h: 12, d: 4, u: 16, v: 32, g: 0.25 }
    ],
    rarm: [
      { x: -3, y: -2, z: -2, w: 4, h: 12, d: 4, u: 40, v: 16, opaque: true },
      { x: -3, y: -2, z: -2, w: 4, h: 12, d: 4, u: 40, v: 32, g: 0.25 }
    ],
    larm: [
      { x: -1, y: -2, z: -2, w: 4, h: 12, d: 4, u: 32, v: 48, opaque: true },
      { x: -1, y: -2, z: -2, w: 4, h: 12, d: 4, u: 48, v: 48, g: 0.25 }
    ],
    rleg: [
      { x: -2, y: 0, z: -2, w: 4, h: 12, d: 4, u: 0, v: 16, opaque: true },
      { x: -2, y: 0, z: -2, w: 4, h: 12, d: 4, u: 0, v: 32, g: 0.25 }
    ],
    lleg: [
      { x: -2, y: 0, z: -2, w: 4, h: 12, d: 4, u: 16, v: 48, opaque: true },
      { x: -2, y: 0, z: -2, w: 4, h: 12, d: 4, u: 0, v: 48, g: 0.25 }
    ]
  };

  const LIMB_PIVOTS = {
    head: [0, 0, 0],
    body: [0, 0, 0],
    rarm: [-5, 2, 0],
    larm: [5, 2, 0],
    rleg: [-1.9, 12, 0],
    lleg: [1.9, 12, 0]
  };

  const FACES = ["front", "back", "right", "left", "top", "bottom"];

  function getFaceDefinition(box, face) {
    const g = box.g || 0;
    const { u, v, w, h, d } = box;
    const x0 = box.x - g;
    const y0 = box.y - g;
    const z0 = -(box.z + d) - g;
    const cw = w + 2 * g;
    const ch = h + 2 * g;
    const cd = d + 2 * g;
    const x1 = x0 + cw;
    const y1 = y0 + ch;
    const z1 = z0 + cd;

    let rectMap = {
      front:  [u + d, v + d, w, h],
      back:   [u + 2 * d + w, v + d, w, h],
      right:  [u, v + d, d, h],
      left:   [u + d + w, v + d, d, h],
      top:    [u + d, v, w, d],
      bottom: [u + d + w, v, w, d]
    };

    if (box.mirror) {
      rectMap = { ...rectMap, right: rectMap.left, left: rectMap.right };
    }

    switch (face) {
      case "front":
        return { rect: rectMap.front, w: cw, h: ch, place: matTranslate(x0, y0, z1) };
      case "back":
        return { rect: rectMap.back, w: cw, h: ch, place: matCompose(matTranslate(x1, y0, z0), matRotateY(Math.PI)) };
      case "right":
        return { rect: rectMap.right, w: cd, h: ch, place: matCompose(matTranslate(x0, y0, z0), matRotateY(-Math.PI / 2)) };
      case "left":
        return { rect: rectMap.left, w: cd, h: ch, place: matCompose(matTranslate(x1, y0, z1), matRotateY(Math.PI / 2)) };
      case "top":
        return { rect: rectMap.top, w: cw, h: cd, place: matCompose(matTranslate(x0, y0, z0), matRotateX(Math.PI / 2)) };
      case "bottom":
        return { rect: rectMap.bottom, w: cw, h: cd, place: matCompose(matTranslate(x0, y1, z1), matRotateX(-Math.PI / 2)) };
    }
  }

  // Texture slicing and caching
  const textureSliceCache = new Map();
  function sliceSkinTexture(img, rect, isOpaque) {
    const [u, v, w, h] = rect;
    const key = `${img.src}|${u},${v},${w},${h}|${isOpaque ? '1' : '0'}`;
    if (textureSliceCache.has(key)) return textureSliceCache.get(key);

    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, w);
    canvas.height = Math.max(1, h);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, u, v, w, h, 0, 0, w, h);

    if (isOpaque) {
      const imgData = ctx.getImageData(0, 0, w, h);
      for (let i = 3; i < imgData.data.length; i += 4) {
        imgData.data[i] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    const dataUrl = canvas.toDataURL("image/png");
    textureSliceCache.set(key, dataUrl);
    return dataUrl;
  }

  // Directional lighting
  function calcLighting(faceMatrix, yawDeg, pitchDeg) {
    const p0 = matPoint(faceMatrix, 0, 0, 0);
    const p1 = matPoint(faceMatrix, 0, 0, 1);
    const nx0 = p1[0] - p0[0], ny0 = p1[1] - p0[1], nz0 = p1[2] - p0[2];

    const rotMat = matCompose(matRotateX(pitchDeg * DEG2RAD), matRotateY(yawDeg * DEG2RAD));
    const [nx, ny, nz] = matPoint(rotMat, nx0, ny0, nz0);

    const len = Math.hypot(nx, ny, nz) || 1;
    let a = nx / len, n = ny / len, o = nz / len;
    if (o < 0) { a = -a; n = -n; o = -o; }

    const dot1 = Math.max(0, -0.42 * a - 0.78 * n + 0.62 * o);
    const dot2 = Math.max(0, 0.52 * a - 0.08 * n + 0.3 * o);
    return Math.min(1, 0.4 + 0.6 * (dot1 + dot2));
  }

  // Held item poses (Corz.gg Module 9565)
  const ITEM_POSES = {
    ground: matMul(matTranslate(0, 2, 0), matScale(0.5)),
    generatedRight: matMul(matTranslate(0, 3, 1), matScale(0.55)),
    generatedLeft: matMul(matTranslate(0, 3, 1), matScale(0.55)),
    handheldRight: matCompose(matTranslate(0, 4, 0.5), matEulerXYZ(0, -90 * DEG2RAD, 55 * DEG2RAD), matScale(0.85)),
    handheldLeft: matCompose(matTranslate(0, 4, 0.5), matEulerXYZ(0, 90 * DEG2RAD, -55 * DEG2RAD), matScale(0.85)),
    blockRight: matCompose(matTranslate(0, 2.5, 0), matEulerXYZ(75 * DEG2RAD, 45 * DEG2RAD, 0), matScale(0.375)),
    blockLeft: matCompose(matTranslate(0, 2.5, 0), matEulerXYZ(75 * DEG2RAD, 45 * DEG2RAD, 0), matScale(0.375)),
    bowRight: matCompose(matTranslate(-1, -2, 2.5), matEulerXYZ(-80 * DEG2RAD, 260 * DEG2RAD, -40 * DEG2RAD), matScale(0.9)),
    bowLeft: matCompose(matTranslate(1, -2, 2.5), matEulerXYZ(-80 * DEG2RAD, 280 * DEG2RAD, -40 * DEG2RAD), matScale(0.9))
  };

  function crystalBounce(time) {
    const s = Math.sin(0.2 * time) / 2 + 0.5;
    return (s * s + s) * 0.4 - 1.4;
  }

  // =========================================================================
  // 4. BOT CATALOG & HELD ITEMS DATA
  // =========================================================================
  const BOTS = [
    {
      code: "CPX-01", name: "Crystal PvP", kind: "PvP",
      tagline: "Crystal fights, start to finish.",
      skin: "cpx01", eyeRow: 3,
      holds: [
        { name: "End Crystal", icon: "/corz-gui/bots/end_crystal.png", model: "crystal" },
        { name: "Totem of Undying", icon: "/corz-gui/bots/totem_of_undying.png", model: "sprite" }
      ]
    },
    {
      code: "SBX-02", name: "Sword PvP", kind: "PvP",
      tagline: "Perfect W-taps and strafes.",
      skin: "sbx02", eyeRow: 4,
      holds: [
        { name: "Diamond Sword", icon: "/corz-gui/bots/diamond_sword.png", model: "handheld" }
      ]
    },
    {
      code: "MCX-03", name: "Mace PvP", kind: "PvP",
      tagline: "Mace fights for SMP servers.",
      skin: "mcx03", eyeRow: 4, eyeLayer: "hat",
      holds: [
        { name: "Mace", icon: "/corz-gui/bots/mace.png", model: "handheld" },
        { name: "Totem of Undying", icon: "/corz-gui/bots/totem_of_undying.png", model: "sprite" }
      ]
    },
    {
      code: "DNQ-06", name: "DonutQUE", kind: "PvP",
      tagline: "Queues /rtpq, banks the loot.",
      skin: "dnq06", eyeRow: 4, isNew: true,
      holds: [
        { name: "End Crystal", icon: "/corz-gui/bots/end_crystal.png", model: "crystal" },
        { name: "Totem of Undying", icon: "/corz-gui/bots/totem_of_undying.png", model: "sprite" }
      ]
    },
    {
      code: "UHC-07", name: "UHC PvP", kind: "PvP",
      tagline: "Traps, healing and bows.",
      skin: "uhc07", eyeRow: 3, isNew: true,
      holds: [
        { name: "Bow", icon: "/corz-gui/bots/bow.png", model: "bow" },
        { name: "Golden Apple", icon: "/corz-gui/bots/golden_apple.png", model: "sprite" }
      ]
    },
    {
      code: "SMP-05", name: "SMP PvP", kind: "PvP",
      tagline: "DiaSMP PvP, full utility kit.",
      skin: "smp05", eyeRow: 4, eyeLayer: "hat", isNew: true,
      holds: [
        { name: "Diamond Sword", icon: "/corz-gui/bots/diamond_sword.png", model: "handheld" },
        { name: "Totem of Undying", icon: "/corz-gui/bots/totem_of_undying.png", model: "sprite" }
      ]
    },
    {
      code: "BLD-01", name: "Auto Builder", kind: "Utility",
      tagline: "Builds schematics block by block.",
      skin: "bld01", eyeRow: 4,
      holds: [
        { name: "Scaffolding", icon: "/corz-gui/bots/scaffolding_icon.png", model: "block" }
      ]
    },
    {
      code: "MIN-02", name: "Area Miner", kind: "Utility",
      tagline: "Mines out the area you pick.",
      skin: "min02", eyeRow: 4,
      holds: [
        { name: "Netherite Pickaxe", icon: "/corz-gui/bots/netherite_pickaxe.png", model: "handheld" }
      ]
    },
    {
      code: "ORE-11", name: "Auto Ore Miner", kind: "Utility",
      tagline: "Mines your ores on safe routes.",
      skin: "ore11", eyeRow: 4, isNew: true,
      holds: [
        { name: "Diamond Pickaxe", icon: "/corz-gui/bots/diamond_pickaxe.png", model: "handheld" }
      ]
    },
    {
      code: "TFM-12", name: "Tree Farmer", kind: "Utility",
      tagline: "Plants, chops and sells the wood.",
      skin: "tfm12", eyeRow: 4, isNew: true,
      holds: [
        { name: "Netherite Axe", icon: "/corz-gui/bots/netherite_axe.png", model: "handheld" }
      ]
    },
    {
      code: "PLT-09", name: "Elytra Pilot", kind: "Utility",
      tagline: "Flies you to your coords.",
      skin: "plt09", eyeRow: 4,
      holds: [
        { name: "Firework Rocket", icon: "/corz-gui/bots/firework_rocket.png", model: "sprite" }
      ]
    },
    {
      code: "RTP-07", name: "Base Alert", kind: "Utility",
      tagline: "Scouts and alerts you to bases.",
      skin: "rtp07", eyeRow: 4,
      holds: [
        { name: "Recovery Compass", icon: "/corz-gui/bots/recovery_compass.png", model: "sprite" }
      ]
    },
    {
      code: "ANC-10", name: "Anchor Hunter", kind: "Utility",
      tagline: "RTPs and mines respawn anchors.",
      skin: "anc10", eyeRow: 4,
      holds: [
        { name: "Diamond Pickaxe", icon: "/corz-gui/bots/diamond_pickaxe.png", model: "handheld" }
      ]
    },
    {
      code: "TPA-08", name: "Auto TPA", kind: "Utility",
      tagline: "Sends /tpahere from your trap.",
      skin: "tpa08", eyeRow: 3,
      holds: [
        { name: "Ender Pearl", icon: "/corz-gui/bots/ender_pearl.png", model: "sprite" }
      ]
    }
  ];

  // =========================================================================
  // 5. MAIN SHOWCASE CONTROLLER
  // =========================================================================
  class CorzBotsShowcase {
    constructor() {
      this.currentIndex = 0;
      this.stageContainer = document.getElementById("bots-stage-container") || document.querySelector(".bots-stage");
      if (!this.stageContainer) return;

      this.yaw = -16;
      this.yawTarget = -16;
      this.pitch = 10;
      this.pitchTarget = 10;
      this.headYaw = 0;
      this.headPitch = 0;
      this.time = 0;
      this.vel = 0;
      this.isDragging = false;
      this.lastPointerX = 0;
      this.lastPointerY = 0;
      this.manualPaused = false;

      this.setupDOM();
      this.buildLists();
      this.setupInteraction();
      this.setupAutoCycle();

      this.handleResize();
      window.addEventListener("resize", () => this.handleResize());

      // Pause the scene when it is off-screen or the tab is hidden.
      this.visible = false;
      this.lastFrame = 0;
      this.lastLight = 0;
      this.lastPadPitch = null;
      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
          this.visible = entries[0].isIntersecting;
          if (this.visible) this.lastFrame = 0;
        }, { rootMargin: "140px" });
        io.observe(this.stageContainer);
      } else {
        this.visible = true;
      }
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) this.lastFrame = 0;
      });

      this.switchBot(0);
      this.animate();
    }

    setupDOM() {
      this.stageContainer.innerHTML = `
        <div class="bots-stage-effects">
          <div class="bots-stage-effects-inner">
            <div class="bots-grid-bg"></div>
            <div class="bots-floor"></div>
            <div class="bots-beam"><div></div></div>
          </div>
        </div>
        <canvas class="bots-pad-canvas" id="bot-pad-canvas"></canvas>
        <div class="bots-viewport" id="bot-viewport">
          <div class="bots-camera-rotator" id="bot-camera-rotator">
            <div class="bots-model-yaw" id="bot-model-yaw"></div>
          </div>
        </div>
        <div class="bots-laser-wipe" id="bot-laser-wipe"></div>
        <div class="bots-drag-overlay" id="bot-drag-overlay"></div>
      `;

      this.viewport = document.getElementById("bot-viewport");
      this.cameraRotator = document.getElementById("bot-camera-rotator");
      this.modelYaw = document.getElementById("bot-model-yaw");
      this.padCanvas = document.getElementById("bot-pad-canvas");
      this.padCtx = this.padCanvas.getContext("2d");
      this.laserWipe = document.getElementById("bot-laser-wipe");
      this.dragOverlay = document.getElementById("bot-drag-overlay");
      this.heldItemsEl = document.getElementById("bot-held-items");
    }

    handleResize() {
      if (!this.stageContainer) return;
      const w = Math.max(300, Math.round(this.stageContainer.clientWidth || 400));
      const h = Math.max(300, Math.round(this.stageContainer.clientHeight || 480));
      this.width = w;
      this.height = h;

      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      this.padCanvas.width = Math.round(w * dpr);
      this.padCanvas.height = Math.round(h * dpr);
      this.dpr = dpr;

      this.cam = calcCamera(w, h);

      this.viewport.style.perspective = `${this.cam.focal.toFixed(3)}px`;
      this.viewport.style.perspectiveOrigin = `${(w / 2).toFixed(2)}px ${(h / 2).toFixed(2)}px`;

      this.cameraRotator.style.left = `${(w / 2).toFixed(2)}px`;
      this.cameraRotator.style.top = `${(h / 2).toFixed(2)}px`;

      this.k = 16;
      this.rootScale = 0.9375 * this.cam.U / 16;
    }

    buildLists() {
      const pvpList = document.getElementById("bots-pvp-list");
      const utilList = document.getElementById("bots-util-list");
      if (!pvpList || !utilList) return;

      pvpList.innerHTML = "";
      utilList.innerHTML = "";

      BOTS.forEach((bot, index) => {
        const isPvP = bot.kind === "PvP";
        const container = isPvP ? pvpList : utilList;

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bots-row";
        btn.setAttribute("aria-pressed", index === 0 ? "true" : "false");
        btn.onclick = () => {
          this.manualPaused = true;
          this.switchBot(index);
        };

        const iconBox = document.createElement("span");
        iconBox.className = "bots-row-icon";
        const head = document.createElement("span");
        head.className = "bots-head-icon";
        head.innerHTML = `
          <span style="position:absolute;inset:0;background-image:url('/images/bots/${bot.skin}.png');background-size:800% 800%;background-position:14.2857% 14.2857%;background-repeat:no-repeat;image-rendering:pixelated"></span>
          <span style="position:absolute;inset:0;background-image:url('/images/bots/${bot.skin}.png');background-size:800% 800%;background-position:71.4286% 14.2857%;background-repeat:no-repeat;image-rendering:pixelated"></span>
        `;
        iconBox.appendChild(head);
        btn.appendChild(iconBox);

        const info = document.createElement("span");
        info.className = "bots-row-info";
        const header = document.createElement("span");
        header.className = "bots-row-header";

        const name = document.createElement("span");
        name.className = "bots-row-name";
        name.textContent = bot.name;
        header.appendChild(name);

        if (bot.isNew) {
          const badge = document.createElement("span");
          badge.className = "bots-badge-new";
          badge.textContent = "New";
          header.appendChild(badge);
        }
        info.appendChild(header);

        const tagline = document.createElement("span");
        tagline.className = "bots-row-tagline";
        tagline.textContent = bot.tagline;
        info.appendChild(tagline);

        btn.appendChild(info);

        if (index === 0) {
          const prog = document.createElement("span");
          prog.className = "bots-progress-bar";
          btn.appendChild(prog);
        }

        container.appendChild(btn);
      });
    }

    setupInteraction() {
      const overlay = this.dragOverlay;
      if (!overlay) return;

      overlay.addEventListener("pointerdown", (e) => {
        this.isDragging = true;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        this.vel = 0;
        try { overlay.setPointerCapture(e.pointerId); } catch (_) {}
        this.manualPaused = true;
      });

      overlay.addEventListener("pointermove", (e) => {
        if (this.isDragging) {
          const dx = e.clientX - this.lastPointerX;
          const dy = e.clientY - this.lastPointerY;
          this.yawTarget -= dx * 0.5;
          this.vel = -dx * 0.5;
          this.pitchTarget = Math.max(-14, Math.min(14, this.pitchTarget + dy * 0.2));
          this.lastPointerX = e.clientX;
          this.lastPointerY = e.clientY;
        } else {
          const rect = this.stageContainer.getBoundingClientRect();
          const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
          this.headYaw = Math.max(-20, Math.min(20, nx * 24));
          this.headPitch = Math.max(-12, Math.min(12, ny * 15));
        }
      });

      const endDrag = (e) => {
        if (this.isDragging) {
          this.isDragging = false;
          try { overlay.releasePointerCapture(e.pointerId); } catch (_) {}
        }
      };
      overlay.addEventListener("pointerup", endDrag);
      overlay.addEventListener("pointercancel", endDrag);

      overlay.addEventListener("pointerleave", () => {
        this.headYaw = 0;
        this.headPitch = 0;
      });
    }

    setupAutoCycle() {
      this.autoTimer = setInterval(() => {
        if (!this.visible) return;
        if (!this.isDragging && !this.manualPaused) {
          const next = (this.currentIndex + 1) % BOTS.length;
          this.switchBot(next);
        }
      }, 7000);
    }

    switchBot(index) {
      this.currentIndex = index;
      const bot = BOTS[index];

      document.querySelectorAll(".bots-row").forEach((btn, i) => {
        const isCur = i === index;
        btn.setAttribute("aria-pressed", isCur ? "true" : "false");
        const oldBar = btn.querySelector(".bots-progress-bar");
        if (oldBar) oldBar.remove();
        if (isCur && !this.manualPaused) {
          const bar = document.createElement("span");
          bar.className = "bots-progress-bar";
          btn.appendChild(bar);
        }
      });

      if (this.heldItemsEl) {
        this.heldItemsEl.innerHTML = bot.holds.map(h => `
          <span class="bots-held-item">
            <img src="${h.icon}" alt="" style="image-rendering:pixelated">
            <span>${h.name}</span>
          </span>
        `).join('<span class="bots-dot">·</span>');
      }

      this.triggerLaserWipe();

      const skinImg = new Image();
      skinImg.crossOrigin = "anonymous";
      skinImg.onload = () => {
        this.renderBotModel(skinImg, bot);
      };
      skinImg.src = `/images/bots/${bot.skin}.png`;
    }

    triggerLaserWipe() {
      const laser = this.laserWipe;
      if (!laser) return;
      laser.style.display = "block";
      const startTime = performance.now();
      const duration = 360;

      const animateWipe = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        const y = progress * (this.height || 480);
        laser.style.transform = `translateY(${y}px)`;
        laser.style.opacity = progress < 0.8 ? "1" : String((1 - progress) / 0.2);

        if (progress < 1) {
          requestAnimationFrame(animateWipe);
        } else {
          laser.style.display = "none";
        }
      };
      requestAnimationFrame(animateWipe);
    }

    renderBotModel(skinImg, bot) {
      if (!this.modelYaw) return;
      this.modelYaw.innerHTML = "";

      const k = this.k || 16;
      this.faceRegistry = [];

      // Create cube face divs directly under modelYaw
      Object.entries(MODEL_PARTS).forEach(([partKey, boxes]) => {
        boxes.forEach((box) => {
          FACES.forEach((face) => {
            const faceDef = getFaceDefinition(box, face);
            if (faceDef.w <= 0 || faceDef.h <= 0) return;

            const sliceUrl = sliceSkinTexture(skinImg, faceDef.rect, !!box.opaque);

            const div = document.createElement("div");
            div.className = "bots-cube-face";
            div.style.position = "absolute";
            div.style.left = "0";
            div.style.top = "0";
            div.style.transformOrigin = "0 0";
            div.style.width = `${(faceDef.w * k).toFixed(2)}px`;
            div.style.height = `${(faceDef.h * k).toFixed(2)}px`;
            div.style.backgroundImage = `url("${sliceUrl}")`;
            div.style.backgroundSize = "100% 100%";
            div.style.backgroundRepeat = "no-repeat";
            div.style.imageRendering = "pixelated";
            div.style.backfaceVisibility = "hidden";
            div.style.webkitBackfaceVisibility = "hidden";

            this.faceRegistry.push({
              el: div,
              part: partKey,
              box: box,
              face: face,
              place: faceDef.place
            });

            this.modelYaw.appendChild(div);
          });
        });
      });

      // Add Glowing Eyes
      this.eyeRegistry = [];
      if (bot.eyeRow) {
        const eyeY = 8 + bot.eyeRow;
        [9, 13].forEach((eyeX) => {
          const eyeDiv = document.createElement("div");
          eyeDiv.className = "bots-glow-eye";
          eyeDiv.style.position = "absolute";
          eyeDiv.style.left = "0";
          eyeDiv.style.top = "0";
          eyeDiv.style.width = `${(2 * k).toFixed(2)}px`;
          eyeDiv.style.height = `${(1 * k).toFixed(2)}px`;
          eyeDiv.style.borderRadius = `${(k / 2).toFixed(2)}px`;
          eyeDiv.style.transformOrigin = "0 0";
          eyeDiv.style.backgroundColor = "#ff2a2a";
          eyeDiv.style.boxShadow = "0 0 12px #ff0033, 0 0 24px #ff0033";
          eyeDiv.style.backfaceVisibility = "hidden";
          eyeDiv.style.pointerEvents = "none";

          const eyePlace = matTranslate(-4 + (eyeX - 8), -8 + (eyeY - 8), 4.02);

          this.eyeRegistry.push({
            el: eyeDiv,
            place: eyePlace
          });

          this.modelYaw.appendChild(eyeDiv);
        });
      }

      // Add Held Items
      this.heldItemRegistry = [];
      if (bot.holds && bot.holds[0]) {
        this.addHeldItem(bot.holds[0], "right", k);
      }
      if (bot.holds && bot.holds[1]) {
        this.addHeldItem(bot.holds[1], "left", k);
      }
    }

    addHeldItem(itemDef, hand, k) {
      const isRight = hand === "right";
      const partKey = isRight ? "rarm" : "larm";

      if (itemDef.model === "crystal") {
        const crystalImg = new Image();
        crystalImg.crossOrigin = "anonymous";
        crystalImg.onload = () => {
          const crystalBoxes = [
            { x: -4, y: -4, z: -4, w: 8, h: 8, d: 8, u: 0, v: 0 },
            { x: -4, y: -4, z: -4, w: 8, h: 8, d: 8, u: 0, v: 0 },
            { x: -4, y: -4, z: -4, w: 8, h: 8, d: 8, u: 32, v: 0 }
          ];
          const crystalFaces = [];
          crystalBoxes.forEach((cBox, bIdx) => {
            FACES.forEach((face) => {
              const fDef = getFaceDefinition(cBox, face);
              const slice = sliceSkinTexture(crystalImg, [fDef.rect[0] * 2, fDef.rect[1] * 2, fDef.rect[2] * 2, fDef.rect[3] * 2], false);

              const div = document.createElement("div");
              div.style.position = "absolute";
              div.style.left = "0";
              div.style.top = "0";
              div.style.transformOrigin = "0 0";
              div.style.width = `${(fDef.w * k).toFixed(2)}px`;
              div.style.height = `${(fDef.h * k).toFixed(2)}px`;
              div.style.backgroundImage = `url("${slice}")`;
              div.style.backgroundSize = "100% 100%";
              div.style.imageRendering = "pixelated";
              div.style.backfaceVisibility = "visible";

              crystalFaces.push({ el: div, boxIdx: bIdx, box: cBox, face: face, place: fDef.place });
              this.modelYaw.appendChild(div);
            });
          });
          this.heldItemRegistry.push({ type: "crystal", faces: crystalFaces, part: partKey, hand });
        };
        crystalImg.src = "/corz-gui/bots/end_crystal_entity.png";
      } else {
        const count = itemDef.model === "handheld" || itemDef.model === "bow" ? 5 : 1;
        const slices = [];
        for (let i = 0; i < count; i++) {
          const div = document.createElement("div");
          div.style.position = "absolute";
          div.style.left = "0";
          div.style.top = "0";
          div.style.transformOrigin = "0 0";
          div.style.width = `${(16 * k).toFixed(2)}px`;
          div.style.height = `${(16 * k).toFixed(2)}px`;
          div.style.backgroundImage = `url("${itemDef.icon}")`;
          div.style.backgroundSize = "100% 100%";
          div.style.imageRendering = "pixelated";
          div.style.backfaceVisibility = "visible";

          slices.push({ el: div, sliceIdx: i, total: count });
          this.modelYaw.appendChild(div);
        }
        this.heldItemRegistry.push({ type: "item", model: itemDef.model, slices, part: partKey, hand });
      }
    }

    animate(now) {
      requestAnimationFrame((t) => this.animate(t || performance.now()));

      if (!this.visible || document.hidden) return;
      if (!now) now = performance.now();
      if (this.lastFrame && now - this.lastFrame < 33) return; // ~30 fps
      const dt = this.lastFrame ? Math.min(0.05, (now - this.lastFrame) / 1000) : 0.016;
      this.lastFrame = now;
      this.time += dt;

      // Yaw inertia & smooth damping
      if (!this.isDragging) {
        if (Math.abs(this.vel) > 0.01) {
          this.yawTarget += this.vel;
          this.vel *= Math.exp(-4.5 * dt);
        }
      }

      this.yaw += (this.yawTarget - this.yaw) * (1 - Math.exp(-18 * dt));
      this.pitch += (this.pitchTarget - this.pitch) * (1 - Math.exp(-18 * dt));

      const sway = Math.sin(0.42 * this.time * 2) * 8;
      const currentYaw = this.yaw + sway;

      // 1. Camera Rotator Transform
      if (this.cameraRotator && this.cam) {
        const translateY = PEDESTAL_Y_OFFSET * this.cam.U;
        this.cameraRotator.style.transform = `rotateX(${-this.pitch.toFixed(3)}deg) translateY(${translateY.toFixed(2)}px)`;
      }

      // 2. Model Yaw Transform
      if (this.modelYaw) {
        this.modelYaw.style.transform = `rotateY(${-currentYaw.toFixed(3)}deg)`;
      }

      // 3. Animated Limb Poses
      const aTime = 20 * this.time;
      const breath = 0.05 * Math.cos(0.09 * aTime) + 0.05;
      const rBreath = 0.05 * Math.sin(0.067 * aTime);

      const limbPoses = {
        head: [this.headPitch * DEG2RAD, this.headYaw * DEG2RAD, 0],
        body: [0, 0, 0],
        rarm: [-Math.PI / 10 + rBreath - 0.32, 0, 0.22 + breath],
        larm: [-Math.PI / 10 - rBreath + 0.06, 0, -breath],
        rleg: [0, 0.07, 0],
        lleg: [0, -0.07, 0]
      };

      // Limb 4x4 Matrices
      const limbMatrices = {};
      Object.keys(LIMB_PIVOTS).forEach((partKey) => {
        const pivot = LIMB_PIVOTS[partKey];
        const rot = limbPoses[partKey];
        limbMatrices[partKey] = matCompose(
          matTranslate(pivot[0], pivot[1], pivot[2]),
          matEuler(rot[2], rot[1], rot[0])
        );
      });

      // Shading repaints a face, so update it ~7 fps and quantise the value.
      const updateLighting = !this.lastLight || now - this.lastLight >= 140;
      if (updateLighting) this.lastLight = now;

      // 4. Update Cube Faces via Matrix Math (Module 9565)
      const p = this.rootScale || (0.9375 * (this.cam ? this.cam.U : 200) / 16);
      const rootTransform = matMul(matScale(p, p, -p), matTranslate(0, -24, 0));
      const invertZ = matScale(1, 1, -1);
      const scale1_16 = matScale(1 / (this.k || 16));

      if (this.faceRegistry) {
        this.faceRegistry.forEach((item) => {
          const limbMat = limbMatrices[item.part];
          const fullMatrix = matCompose(
            rootTransform,
            limbMat,
            invertZ,
            item.place,
            scale1_16
          );

          item.el.style.transform = matToCss(fullMatrix);

          if (updateLighting) {
            const brightness = Math.round(calcLighting(fullMatrix, -currentYaw, -this.pitch) * 20) / 20;
            item.el.style.filter = brightness < 0.999 ? `brightness(${brightness.toFixed(2)})` : "";
          }
        });
      }

      // 5. Update Glowing Eyes
      if (this.eyeRegistry) {
        const headMat = limbMatrices["head"];
        this.eyeRegistry.forEach((eye) => {
          const eyeMatrix = matCompose(
            rootTransform,
            headMat,
            invertZ,
            eye.place,
            scale1_16
          );
          eye.el.style.transform = matToCss(eyeMatrix);
        });
      }

      // 6. Update Held Items with Corz.gg Exact Math
      const sqrtHalf = Math.SQRT1_2;
      const crystalAxisRot = matRotateAxis(Math.PI / 3, sqrtHalf, 0, sqrtHalf);
      const crystalAnimTime = 20 * this.time * 0.5;
      const crystalBounceY = crystalBounce(crystalAnimTime);
      const crystalAngle = 3 * crystalAnimTime * DEG2RAD;

      const crystalBoxRotations = [
        matCompose(matTranslate(0, 24 + 16 * crystalBounceY / 2, 0), matMul(matRotateY(crystalAngle), crystalAxisRot)),
        matCompose(matTranslate(0, 24 + 16 * crystalBounceY / 2, 0), matMul(matRotateY(crystalAngle), crystalAxisRot), matMul(crystalAxisRot, matRotateY(crystalAngle)), matScale(0.875)),
        matCompose(matTranslate(0, 24 + 16 * crystalBounceY / 2, 0), matMul(matRotateY(crystalAngle), crystalAxisRot), matMul(crystalAxisRot, matRotateY(crystalAngle)), matScale(0.875), matMul(crystalAxisRot, matRotateY(crystalAngle)), matScale(0.765625))
      ];

      const itemCenterFlipped = matCompose(matTranslate(-8, 8, 0), matScale(1, -1, 1));

      if (this.heldItemRegistry) {
        this.heldItemRegistry.forEach((held) => {
          const limbMat = limbMatrices[held.part];
          const isRight = held.hand === "right";
          const handSign = isRight ? -1 : 1;
          const rotAngles = limbPoses[held.part];

          if (held.type === "crystal") {
            const handBase = matCompose(
              limbMat,
              matTranslate(handSign, 9, 0),
              matTranspose3x3(matEuler(rotAngles[2], rotAngles[1], rotAngles[0])),
              matTranslate(isRight ? 2 : -2, isRight ? -0.5 : -1.5, -2.5),
              matRotateX(Math.PI),
              matScale(0.95),
              matTranslate(0, 4.5, 0),
              matScale(0.52),
              matTranslate(0, (-1.5 - 0.5 * crystalBounceY + (0.5 * crystalBounceY - -0.525) * 0.35) * 16, 0)
            );

            held.faces.forEach((cf) => {
              const fullMat = matCompose(
                rootTransform,
                handBase,
                crystalBoxRotations[cf.boxIdx],
                invertZ,
                cf.place,
                scale1_16
              );
              cf.el.style.transform = matToCss(fullMat);
              if (updateLighting) {
                const b = Math.round(calcLighting(fullMat, -currentYaw, -this.pitch) * 20) / 20;
                cf.el.style.filter = b < 0.999 ? `brightness(${b.toFixed(2)})` : "";
              }
            });
          } else {
            // Handheld item, bow, block, or sprite
            let itemPose;
            if (held.model === "handheld") {
              itemPose = isRight ? ITEM_POSES.handheldRight : ITEM_POSES.handheldLeft;
            } else if (held.model === "block") {
              itemPose = isRight ? ITEM_POSES.blockRight : ITEM_POSES.blockLeft;
            } else if (held.model === "bow") {
              itemPose = isRight ? ITEM_POSES.bowRight : ITEM_POSES.bowLeft;
            } else {
              itemPose = ITEM_POSES.ground;
            }

            let handBase;
            if (held.model === "handheld" || held.model === "bow" || held.model === "block") {
              handBase = matCompose(
                limbMat,
                matRotateX(-90 * DEG2RAD),
                matRotateY(180 * DEG2RAD),
                matTranslate(isRight ? 1 : -1, 2, -10),
                itemPose
              );
            } else {
              // Sprite (totem, pearl, apple)
              handBase = matCompose(
                limbMat,
                matTranslate(handSign, 9, 0),
                matTranspose3x3(matEuler(rotAngles[2], rotAngles[1], rotAngles[0])),
                matTranslate(isRight ? 2 : -2, isRight ? -0.5 : -1.5, -2.5),
                matRotateX(Math.PI),
                matScale(0.95),
                itemPose
              );
            }

            held.slices.forEach((sl) => {
              const zOffset = sl.total === 1 ? 0 : -0.5 + sl.sliceIdx / (sl.total - 1);
              const fullMat = matCompose(
                rootTransform,
                handBase,
                matTranslate(0, 0, zOffset),
                itemCenterFlipped,
                scale1_16
              );
              sl.el.style.transform = matToCss(fullMat);
              if (updateLighting) {
                const b = Math.round(calcLighting(fullMat, -currentYaw, -this.pitch) * 20) / 20;
                sl.el.style.filter = b < 0.999 ? `brightness(${b.toFixed(2)})` : "";
              }
            });
          }
        });
      }

      // 7. Render Canvas Pedestal — only when the camera pitch changes.
      if (this.padCtx && this.cam && (this.lastPadPitch === null || Math.abs(this.pitch - this.lastPadPitch) > 0.15)) {
        this.lastPadPitch = this.pitch;
        renderPedestal(
          this.padCtx,
          this.cam,
          this.width,
          this.height,
          this.pitch,
          0x7e2ed6, // #7e2ed6 Corz Purple
          1.0,
          0.0,
          1.0,
          this.dpr || 1
        );
      }
    }
  }

  // Initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new CorzBotsShowcase());
  } else {
    new CorzBotsShowcase();
  }
})();
