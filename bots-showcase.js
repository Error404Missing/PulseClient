/**
 * PulseClient — "Meet the bots" 3D Interactive Showcase
 * Replicated exactly from Corz.gg using CSS 3D Transforms & Canvas Pedestal
 */

(function () {
  'use strict';

  // BOT CATALOG (14 BOTS)
  const BOTS = [
    { code: "CPX-01", name: "Crystal PvP", kind: "PvP", tagline: "Crystal fights, start to finish.", skin: "cpx01", eyeRow: 3, holds: [{name:"End Crystal", icon:"/corz-gui/bots/end_crystal.png"}, {name:"Totem of Undying", icon:"/corz-gui/bots/totem_of_undying.png"}] },
    { code: "SBX-02", name: "Sword PvP", kind: "PvP", tagline: "Perfect W-taps and strafes.", skin: "sbx02", eyeRow: 4, holds: [{name:"Diamond Sword", icon:"/corz-gui/bots/diamond_sword.png"}] },
    { code: "MCX-03", name: "Mace PvP", kind: "PvP", tagline: "Mace fights for SMP servers.", skin: "mcx03", eyeRow: 4, eyeLayer: "hat", holds: [{name:"Mace", icon:"/corz-gui/bots/mace.png"}, {name:"Totem of Undying", icon:"/corz-gui/bots/totem_of_undying.png"}] },
    { code: "DNQ-06", name: "DonutQUE", kind: "PvP", tagline: "Queues /rtpq, banks the loot.", skin: "dnq06", eyeRow: 4, isNew: true, holds: [{name:"End Crystal", icon:"/corz-gui/bots/end_crystal.png"}, {name:"Totem of Undying", icon:"/corz-gui/bots/totem_of_undying.png"}] },
    { code: "UHC-07", name: "UHC PvP", kind: "PvP", tagline: "Traps, healing and bows.", skin: "uhc07", eyeRow: 3, isNew: true, holds: [{name:"Bow", icon:"/corz-gui/bots/bow.png"}, {name:"Golden Apple", icon:"/corz-gui/bots/golden_apple.png"}] },
    { code: "SMP-05", name: "SMP PvP", kind: "PvP", tagline: "DiaSMP PvP, full utility kit.", skin: "smp05", eyeRow: 4, eyeLayer: "hat", isNew: true, holds: [{name:"Diamond Sword", icon:"/corz-gui/bots/diamond_sword.png"}, {name:"Totem of Undying", icon:"/corz-gui/bots/totem_of_undying.png"}] },
    { code: "BLD-01", name: "Auto Builder", kind: "Utility", tagline: "Builds schematics block by block.", skin: "bld01", eyeRow: 4, holds: [{name:"Scaffolding", icon:"/corz-gui/bots/scaffolding_icon.png"}] },
    { code: "MIN-02", name: "Area Miner", kind: "Utility", tagline: "Mines out the area you pick.", skin: "min02", eyeRow: 4, holds: [{name:"Netherite Pickaxe", icon:"/corz-gui/bots/netherite_pickaxe.png"}] },
    { code: "ORE-11", name: "Auto Ore Miner", kind: "Utility", tagline: "Mines your ores on safe routes.", skin: "ore11", eyeRow: 4, isNew: true, holds: [{name:"Diamond Pickaxe", icon:"/corz-gui/bots/diamond_pickaxe.png"}] },
    { code: "TFM-12", name: "Tree Farmer", kind: "Utility", tagline: "Plants, chops and sells the wood.", skin: "tfm12", eyeRow: 4, isNew: true, holds: [{name:"Netherite Axe", icon:"/corz-gui/bots/netherite_axe.png"}] },
    { code: "PLT-09", name: "Elytra Pilot", kind: "Utility", tagline: "Flies you to your coords.", skin: "plt09", eyeRow: 4, holds: [{name:"Firework Rocket", icon:"/corz-gui/bots/firework_rocket.png"}] },
    { code: "RTP-07", name: "Base Alert", kind: "Utility", tagline: "Scouts and alerts you to bases.", skin: "rtp07", eyeRow: 4, holds: [{name:"Recovery Compass", icon:"/corz-gui/bots/recovery_compass.png"}] },
    { code: "ANC-10", name: "Anchor Hunter", kind: "Utility", tagline: "RTPs and mines respawn anchors.", skin: "anc10", eyeRow: 4, holds: [{name:"Diamond Pickaxe", icon:"/corz-gui/bots/diamond_pickaxe.png"}] },
    { code: "TPA-08", name: "Auto TPA", kind: "Utility", tagline: "Sends /tpahere from your trap.", skin: "tpa08", eyeRow: 3, holds: [{name:"Ender Pearl", icon:"/corz-gui/bots/ender_pearl.png"}] }
  ];

  // GEOMETRY HELPERS
  function createBoxDef(x, y, z, w, h, d, u, v, g, base) {
    return { x, y, z, w, h, d, u, v, g: g || 0, base: base !== false };
  }

  function getModelParts(isSlim) {
    let t = isSlim ? 3 : 4;
    let armY = isSlim ? -23.5 : -24;
    return [
      {
        key: "rleg",
        boxes: [
          createBoxDef(-4, -12, -2, 4, 12, 4, 0, 16, 0, true),
          createBoxDef(-4, -12, -2, 4, 12, 4, 0, 32, 0.25, false)
        ]
      },
      {
        key: "lleg",
        boxes: [
          createBoxDef(0, -12, -2, 4, 12, 4, 16, 48, 0, true),
          createBoxDef(0, -12, -2, 4, 12, 4, 0, 48, 0.25, false)
        ]
      },
      {
        key: "body",
        boxes: [
          createBoxDef(-4, -24, -2, 8, 12, 4, 16, 16, 0, true),
          createBoxDef(-4, -24, -2, 8, 12, 4, 16, 32, 0.25, false)
        ]
      },
      {
        key: "rarm",
        boxes: [
          createBoxDef(-4 - t, armY, -2, t, 12, 4, 40, 16, 0, true),
          createBoxDef(-4 - t, armY, -2, t, 12, 4, 40, 32, 0.25, false)
        ]
      },
      {
        key: "larm",
        boxes: [
          createBoxDef(4, armY, -2, t, 12, 4, 32, 48, 0, true),
          createBoxDef(4, armY, -2, t, 12, 4, 48, 48, 0.25, false)
        ]
      },
      {
        key: "head",
        boxes: [
          createBoxDef(-4, -32, -4, 8, 8, 8, 0, 0, 0, true),
          createBoxDef(-4, -32, -4, 8, 8, 8, 32, 0, 0.5, false)
        ]
      }
    ];
  }

  function getFaceRect(box, face) {
    let { u, v, w, h, d } = box;
    switch (face) {
      case "front":  return [u + d, v + d, w, h];
      case "back":   return [u + 2 * d + w, v + d, w, h];
      case "right":  return [u, v + d, d, h];
      case "left":   return [u + d + w, v + d, d, h];
      case "top":    return [u + d, v, w, d];
      case "bottom": return [u + d + w, v, w, d];
    }
  }

  function getFaceTransform(box, face, k) {
    let s = (box.x - box.g) * k;
    let n = (box.y - box.g) * k;
    let r = (box.z - box.g) * k;
    let w = (box.w + 2 * box.g) * k;
    let h = (box.h + 2 * box.g) * k;
    let d = (box.d + 2 * box.g) * k;
    let d_w = s + w;
    let d_h = n + h;
    let d_d = r + d;
    switch (face) {
      case "front":  return { w, h, transform: `translate3d(${s.toFixed(2)}px, ${n.toFixed(2)}px, ${d_d.toFixed(2)}px)` };
      case "back":   return { w, h, transform: `translate3d(${d_w.toFixed(2)}px, ${n.toFixed(2)}px, ${r.toFixed(2)}px) rotateY(180deg)` };
      case "right":  return { w: d, h, transform: `translate3d(${s.toFixed(2)}px, ${n.toFixed(2)}px, ${r.toFixed(2)}px) rotateY(-90deg)` };
      case "left":   return { w: d, h, transform: `translate3d(${d_w.toFixed(2)}px, ${n.toFixed(2)}px, ${d_d.toFixed(2)}px) rotateY(90deg)` };
      case "top":    return { w, h: d, transform: `translate3d(${s.toFixed(2)}px, ${n.toFixed(2)}px, ${r.toFixed(2)}px) rotateX(90deg)` };
      case "bottom": return { w, h: d, transform: `translate3d(${s.toFixed(2)}px, ${d_h.toFixed(2)}px, ${d_d.toFixed(2)}px) rotateX(-90deg)` };
    }
  }

  // TEXTURE SLICING CACHE
  const textureCache = new Map();

  function sliceTexture(img, rect, isOpaque) {
    let [u, v, w, h] = rect;
    let key = `${img.src}|${u},${v},${w},${h}|${isOpaque ? 'o' : 't'}`;
    if (textureCache.has(key)) return textureCache.get(key);

    let canvas = document.createElement("canvas");
    canvas.width = Math.max(1, w);
    canvas.height = Math.max(1, h);
    let ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, u, v, w, h, 0, 0, w, h);

    if (isOpaque) {
      let id = ctx.getImageData(0, 0, w, h);
      for (let i = 3; i < id.data.length; i += 4) {
        id.data[i] = 255;
      }
      ctx.putImageData(id, 0, 0);
    }

    let dataUrl = canvas.toDataURL("image/png");
    textureCache.set(key, dataUrl);
    return dataUrl;
  }

  // SHADING LIGHT CALCULATION
  const faceNormals = {
    front:  [0, 0, 1],
    back:   [0, 0, -1],
    right:  [-1, 0, 0],
    left:   [1, 0, 0],
    top:    [0, -1, 0],
    bottom: [0, 1, 0]
  };

  function normalizeVec([x, y, z]) {
    let len = Math.hypot(x, y, z) || 1;
    return [x / len, y / len, z / len];
  }

  const light1 = normalizeVec([0.2, -1, 1]);
  const light2 = normalizeVec([-0.2, -1, 0]);

  function calcBrightness(face, yawDeg, pitchDeg) {
    let [nx, ny, nz] = faceNormals[face];
    let yawRad = yawDeg * Math.PI / 180;
    let lx = nx * Math.cos(yawRad) + nz * Math.sin(yawRad);
    let lz = -nx * Math.sin(yawRad) + nz * Math.cos(yawRad);
    let pitchRad = pitchDeg * Math.PI / 180;
    let ly = ny * Math.cos(pitchRad) - lz * Math.sin(pitchRad);
    let lz2 = ny * Math.sin(pitchRad) + lz * Math.cos(pitchRad);

    let dot1 = Math.max(0, lx * light1[0] + ly * light1[1] + lz2 * light1[2]);
    let dot2 = Math.max(0, lx * light2[0] + ly * light2[1] + lz2 * light2[2]);
    return Math.min(1, 0.4 + 0.6 * (dot1 + dot2));
  }

  // MAIN CONTROLLER
  class CorzBotsShowcase {
    constructor() {
      this.currentIndex = 0;
      this.stage = document.getElementById("bots-stage-container") || document.querySelector(".bots-col-stage") || document.querySelector(".bots-stage");
      if (!this.stage) return;

      this.setupStageDOM();

      this.yaw = -16;
      this.yawTarget = -16;
      this.pitch = 10;
      this.pitchTarget = 10;
      this.headYaw = 0;
      this.headPitch = 0;
      this.vel = 0;
      this.time = 0;
      this.isDragging = false;
      this.lastPointerX = 0;
      this.lastPointerY = 0;

      this.buildBotLists();
      this.setupInteraction();
      this.setupAutoCycle();

      this.handleResize();
      window.addEventListener("resize", () => this.handleResize());

      this.switchBot(0);
      this.animate();
    }

    setupStageDOM() {
      let stageCol = this.stage;
      stageCol.innerHTML = `
        <div class="bots-stage" id="bot-stage-inner">
          <div class="bots-stage-effects">
            <div class="bots-grid-bg"></div>
            <div class="bots-floor"></div>
            <div class="bots-beam"><div></div></div>
          </div>
          <canvas class="bots-pad-canvas" id="bot-pad-canvas"></canvas>
          <div class="bots-viewport" id="bot-viewport">
            <div class="bots-camera-rotator" id="bot-camera-rotator">
              <div class="bots-model-yaw" id="bot-model-yaw"></div>
            </div>
          </div>
          <div class="bots-laser-wipe" id="bot-laser-wipe"></div>
          <div class="bots-drag-overlay" id="bot-drag-overlay"></div>
        </div>
        <div class="bots-detail">
          <div class="bots-held-list" id="bot-held-items"></div>
        </div>
      `;

      this.innerStage = document.getElementById("bot-stage-inner");
      this.viewport = document.getElementById("bot-viewport");
      this.cameraRotator = document.getElementById("bot-camera-rotator");
      this.modelYaw = document.getElementById("bot-model-yaw");
      this.padCanvas = document.getElementById("bot-pad-canvas");
      this.padCtx = this.padCanvas.getContext("2d");
      this.laserWipe = document.getElementById("bot-laser-wipe");
      this.heldItemsEl = document.getElementById("bot-held-items");
      this.dragOverlay = document.getElementById("bot-drag-overlay");
    }

    handleResize() {
      if (!this.innerStage) return;
      let w = this.innerStage.clientWidth;
      let h = this.innerStage.clientHeight;
      this.width = w;
      this.height = h;

      let dpr = Math.min(2, window.devicePixelRatio || 1);
      this.padCanvas.width = Math.round(w * dpr);
      this.padCanvas.height = Math.round(h * dpr);
      this.dpr = dpr;

      let a = Math.tan(24 * Math.PI / 360);
      let n = Math.max(1.1 / a, 0.8 / (a * Math.max(0.001, w / h))) / 0.92;
      let o = (h / 2) / a;
      this.cam = { distance: n, focal: o, U: o / n };

      this.viewport.style.perspective = `${o.toFixed(2)}px`;
      this.viewport.style.perspectiveOrigin = `${(w / 2).toFixed(2)}px ${(h / 2).toFixed(2)}px`;

      this.modelScale = 8.8;
    }

    buildBotLists() {
      let pvpList = document.getElementById("bots-pvp-list");
      let utilList = document.getElementById("bots-util-list");
      if (!pvpList || !utilList) return;

      pvpList.innerHTML = "";
      utilList.innerHTML = "";

      BOTS.forEach((bot, index) => {
        let isPvP = bot.kind === "PvP";
        let container = isPvP ? pvpList : utilList;

        let btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bots-row";
        btn.setAttribute("aria-pressed", index === 0 ? "true" : "false");
        btn.onclick = () => this.switchBot(index);

        let iconBox = document.createElement("span");
        iconBox.className = "bots-row-icon";
        let head = document.createElement("span");
        head.className = "bots-head-icon";
        head.innerHTML = `
          <span style="position:absolute;inset:0;background-image:url('/images/bots/${bot.skin}.png');background-size:800% 800%;background-position:14.2857% 14.2857%;background-repeat:no-repeat;image-rendering:pixelated"></span>
          <span style="position:absolute;inset:0;background-image:url('/images/bots/${bot.skin}.png');background-size:800% 800%;background-position:71.4286% 14.2857%;background-repeat:no-repeat;image-rendering:pixelated"></span>
        `;
        iconBox.appendChild(head);
        btn.appendChild(iconBox);

        let info = document.createElement("span");
        info.className = "bots-row-info";
        let header = document.createElement("span");
        header.className = "bots-row-header";

        let name = document.createElement("span");
        name.className = "bots-row-name";
        name.textContent = bot.name;
        header.appendChild(name);

        if (bot.isNew) {
          let badge = document.createElement("span");
          badge.className = "bots-badge-new";
          badge.textContent = "New";
          header.appendChild(badge);
        }
        info.appendChild(header);

        let tagline = document.createElement("span");
        tagline.className = "bots-row-tagline";
        tagline.textContent = bot.tagline;
        info.appendChild(tagline);

        btn.appendChild(info);

        if (index === 0) {
          let prog = document.createElement("span");
          prog.className = "bots-progress-bar";
          btn.appendChild(prog);
        }

        container.appendChild(btn);
      });
    }

    setupInteraction() {
      let overlay = this.dragOverlay;
      if (!overlay) return;

      overlay.addEventListener("pointerdown", (e) => {
        this.isDragging = true;
        this.lastPointerX = e.clientX;
        this.lastPointerY = e.clientY;
        this.vel = 0;
        try { overlay.setPointerCapture(e.pointerId); } catch (_) {}
        this.stopAutoCycle();
      });

      overlay.addEventListener("pointermove", (e) => {
        if (this.isDragging) {
          let dx = e.clientX - this.lastPointerX;
          let dy = e.clientY - this.lastPointerY;
          this.yawTarget -= dx * 0.5;
          this.vel = -dx * 0.5;
          this.pitchTarget = Math.max(-14, Math.min(14, this.pitchTarget + dy * 0.2));
          this.lastPointerX = e.clientX;
          this.lastPointerY = e.clientY;
        } else {
          let rect = this.innerStage.getBoundingClientRect();
          let nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          let ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
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
        if (!this.isDragging && !this.manualPaused) {
          let next = (this.currentIndex + 1) % BOTS.length;
          this.switchBot(next);
        }
      }, 7000);
    }

    stopAutoCycle() {
      this.manualPaused = true;
    }

    switchBot(index) {
      this.currentIndex = index;
      let bot = BOTS[index];

      document.querySelectorAll(".bots-row").forEach((btn, i) => {
        let isCur = i === index;
        btn.setAttribute("aria-pressed", isCur ? "true" : "false");
        let oldBar = btn.querySelector(".bots-progress-bar");
        if (oldBar) oldBar.remove();
        if (isCur && !this.manualPaused) {
          let bar = document.createElement("span");
          bar.className = "bots-progress-bar";
          btn.appendChild(bar);
        }
      });

      if (this.heldItemsEl) {
        this.heldItemsEl.innerHTML = bot.holds.map(h => `
          <span class="bots-held-item">
            <img src="${h.icon}" alt="">
            <span>${h.name}</span>
          </span>
        `).join('<span class="bots-dot">·</span>');
      }

      this.triggerLaserWipe();

      let skinImg = new Image();
      skinImg.crossOrigin = "anonymous";
      skinImg.onload = () => {
        this.currentSkinImg = skinImg;
        this.renderModel(skinImg, bot);
      };
      skinImg.src = `/images/bots/${bot.skin}.png`;
    }

    triggerLaserWipe() {
      let laser = this.laserWipe;
      if (!laser) return;
      laser.style.display = "block";
      let startTime = performance.now();
      let duration = 360;

      let animateWipe = (now) => {
        let elapsed = now - startTime;
        let progress = Math.min(1, elapsed / duration);
        let y = progress * (this.height || 480);
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

    renderModel(skinImg, bot) {
      if (!this.modelYaw) return;
      this.modelYaw.innerHTML = "";
      let isSlim = false;
      let parts = getModelParts(isSlim);
      let k = this.modelScale;

      this.limbElements = {};
      this.faceElements = [];

      parts.forEach(part => {
        let limbDiv = document.createElement("div");
        limbDiv.className = "bots-limb";
        limbDiv.setAttribute("data-limb", part.key);

        part.boxes.forEach(box => {
          const faces = ["front", "back", "right", "left", "top", "bottom"];
          faces.forEach(face => {
            let rect = getFaceRect(box, face);
            let faceTrans = getFaceTransform(box, face, k);

            let faceDiv = document.createElement("div");
            faceDiv.className = "bots-cube-face";
            faceDiv.style.width = `${faceTrans.w.toFixed(1)}px`;
            faceDiv.style.height = `${faceTrans.h.toFixed(1)}px`;
            faceDiv.style.transform = faceTrans.transform;
            faceDiv.style.backgroundImage = `url("${sliceTexture(skinImg, rect, box.base)}")`;

            this.faceElements.push({
              el: faceDiv,
              face: face,
              part: part.key
            });

            limbDiv.appendChild(faceDiv);
          });
        });

        this.limbElements[part.key] = limbDiv;
        this.modelYaw.appendChild(limbDiv);
      });

      if (bot.eyeRow) {
        this.addGlowingEyes(bot);
      }

      this.addHeldItems(bot);
    }

    addGlowingEyes(bot) {
      let head = this.limbElements["head"];
      if (!head) return;

      let k = this.modelScale;
      let eyeRowY = (-32 + bot.eyeRow) * k;
      let zFront = (4 + 0.52) * k;

      [-3, 1].forEach(xOffset => {
        let eye = document.createElement("div");
        eye.style.position = "absolute";
        eye.style.left = "0";
        eye.style.top = "0";
        eye.style.width = `${2 * k}px`;
        eye.style.height = `${1 * k}px`;
        eye.style.borderRadius = `${k / 2}px`;
        eye.style.transformOrigin = "0 0";
        eye.style.transform = `translate3d(${(xOffset * k).toFixed(1)}px, ${eyeRowY.toFixed(1)}px, ${zFront.toFixed(1)}px)`;
        eye.style.backgroundColor = "#ff2a2a";
        eye.style.boxShadow = "0 0 10px #ff0033, 0 0 20px #ff0033";
        head.appendChild(eye);
      });
    }

    addHeldItems(bot) {
      let k = this.modelScale;
      let rarm = this.limbElements["rarm"];
      let larm = this.limbElements["larm"];

      if (bot.holds && bot.holds[0] && rarm) {
        let item = document.createElement("div");
        item.style.position = "absolute";
        item.style.width = `44px`;
        item.style.height = `44px`;
        item.style.backgroundImage = `url("${bot.holds[0].icon}")`;
        item.style.backgroundSize = "contain";
        item.style.backgroundRepeat = "no-repeat";
        item.style.backgroundPosition = "center";
        item.style.imageRendering = "pixelated";
        item.style.backfaceVisibility = "visible";
        item.style.transform = `translate3d(${-6 * k}px, ${-10 * k}px, ${2 * k}px) rotateY(-10deg) rotateX(-20deg)`;
        rarm.appendChild(item);
      }

      if (bot.holds && bot.holds[1] && larm) {
        let item = document.createElement("div");
        item.style.position = "absolute";
        item.style.width = `38px`;
        item.style.height = `38px`;
        item.style.backgroundImage = `url("${bot.holds[1].icon}")`;
        item.style.backgroundSize = "contain";
        item.style.backgroundRepeat = "no-repeat";
        item.style.backgroundPosition = "center";
        item.style.imageRendering = "pixelated";
        item.style.backfaceVisibility = "visible";
        item.style.transform = `translate3d(${5.5 * k}px, ${-12 * k}px, ${3 * k}px) rotateY(20deg) rotateZ(-10deg)`;
        larm.appendChild(item);
      }
    }

    drawPedestal() {
      let ctx = this.padCtx;
      if (!ctx) return;
      let w = this.width;
      let h = this.height;
      let dpr = this.dpr || 1;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      let centerX = w / 2;
      let centerY = h * 0.88;

      let grad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 180);
      grad.addColorStop(0, "rgba(126, 46, 214, 0.45)");
      grad.addColorStop(0.5, "rgba(126, 46, 214, 0.15)");
      grad.addColorStop(1, "rgba(126, 46, 214, 0)");

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(1, 0.32);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 180, 0, 2 * Math.PI);
      ctx.fill();

      [130, 95].forEach((radius, idx) => {
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = idx === 0 ? "rgba(158, 98, 224, 0.6)" : "rgba(196, 170, 255, 0.85)";
        ctx.lineWidth = idx === 0 ? 2 : 2.5;
        ctx.stroke();
      });

      ctx.restore();
    }

    animate() {
      requestAnimationFrame(() => this.animate());

      this.time += 0.016;
      let dt = 0.016;

      if (!this.isDragging) {
        if (Math.abs(this.vel) > 0.01) {
          this.yawTarget += this.vel;
          this.vel *= Math.exp(-4.5 * dt);
        }
      }

      this.yaw += (this.yawTarget - this.yaw) * (1 - Math.exp(-18 * dt));
      this.pitch += (this.pitchTarget - this.pitch) * (1 - Math.exp(-18 * dt));

      let sway = Math.sin(0.42 * this.time * 2) * 8;
      let currentYaw = this.yaw + sway;

      if (this.cameraRotator) {
        let translateY = this.cam ? 0.94 * this.cam.U : 140;
        this.cameraRotator.style.transform = `rotateX(${-this.pitch.toFixed(3)}deg) translateY(${translateY.toFixed(1)}px)`;
      }

      if (this.modelYaw) {
        this.modelYaw.style.transform = `rotateY(${-currentYaw.toFixed(3)}deg)`;
      }

      let breath = Math.sin(this.time * 2) * 0.03;
      let rarm = this.limbElements?.["rarm"];
      let larm = this.limbElements?.["larm"];
      let head = this.limbElements?.["head"];
      let k = this.modelScale;
      let rarmY = -24 * k;

      if (rarm) {
        rarm.style.transformOrigin = `center ${rarmY}px 0px`;
        rarm.style.transform = `rotateX(${(36 + breath * 15).toFixed(2)}deg) rotateY(-16deg) rotateZ(8deg)`;
      }
      if (larm) {
        larm.style.transformOrigin = `center ${rarmY}px 0px`;
        larm.style.transform = `rotateX(${(24 - breath * 15).toFixed(2)}deg) rotateY(16deg) rotateZ(-8deg)`;
      }
      if (head) {
        head.style.transformOrigin = `center ${-24 * k}px 0px`;
        head.style.transform = `rotateY(${this.headYaw.toFixed(2)}deg) rotateX(${this.headPitch.toFixed(2)}deg)`;
      }

      if (this.faceElements) {
        this.faceElements.forEach(f => {
          let b = calcBrightness(f.face, -currentYaw, -this.pitch);
          f.el.style.filter = b < 0.99 ? `brightness(${b.toFixed(3)})` : "";
        });
      }

      this.drawPedestal();
    }
  }

  // Auto initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => new CorzBotsShowcase());
  } else {
    new CorzBotsShowcase();
  }
})();
