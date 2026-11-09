/**
 * PulseClient - 3D Team Minecraft Skin Viewer
 * Powered by skinview3d with fallback to high-res 3D PNG renders.
 */

(function () {
    // Skin texture paths (relative and data URI fallback)
    const SKINS = {
        error404: {
            skin: 'assets/skins/Error404Missing.png',
            fallbackImg: 'assets/skins/Error404Missing_3d.png',
            model: 'slim',
            canvasId: 'canvas-error404',
            imgId: 'img-error404',
            camera: { x: -8, y: 5, z: 42 },
            pose: {
                leftArm: { x: -0.15, y: 0.05, z: -0.05 },
                rightArm: { x: 0.15, y: -0.05, z: 0.05 },
                head: { y: -0.08, x: 0.02 }
            }
        },
        odika: {
            skin: 'assets/skins/ItzRealOdika.png',
            fallbackImg: 'assets/skins/ItzRealOdika_3d.png',
            model: 'slim',
            canvasId: 'canvas-odika',
            imgId: 'img-odika',
            camera: { x: -16, y: 4, z: 44 },
            pose: {
                leftArm: { x: 0.1, y: 0, z: -0.15 },
                rightArm: { x: -0.25, y: 0, z: 0.35 },
                head: { y: 0.18, x: -0.02 }
            }
        },
        dataaa: {
            skin: 'assets/skins/dataaa.png',
            fallbackImg: 'assets/skins/dataaa_3d.png',
            model: 'default',
            canvasId: 'canvas-dataaa',
            imgId: 'img-dataaa',
            camera: { x: 16, y: 5, z: 44 },
            pose: {
                // Waving right arm pose matching Corz reference!
                rightArm: { x: 0.25, y: -0.2, z: 2.35 },
                leftArm: { x: -0.1, y: 0, z: -0.1 },
                head: { y: -0.18, x: -0.04 }
            }
        }
    };

    function isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    function showFallbacks() {
        Object.values(SKINS).forEach(cfg => {
            const canvas = document.getElementById(cfg.canvasId);
            const img = document.getElementById(cfg.imgId);
            if (canvas) canvas.style.display = 'none';
            if (img) img.classList.add('fallback-visible');
        });
    }

    function initTeamViewers() {
        if (!isWebGLAvailable() || typeof skinview3d === 'undefined') {
            console.warn('[Pulse Team] WebGL or skinview3d not available, using high-res 3D PNG renders.');
            showFallbacks();
            return;
        }

        const viewers = {};

        Object.entries(SKINS).forEach(([key, cfg]) => {
            const canvas = document.getElementById(cfg.canvasId);
            const img = document.getElementById(cfg.imgId);
            if (!canvas) return;

            try {
                const width = canvas.clientWidth || canvas.width || 250;
                const height = canvas.clientHeight || canvas.height || 380;

                const viewer = new skinview3d.SkinViewer({
                    canvas: canvas,
                    width: width,
                    height: height,
                    skin: cfg.skin,
                    model: cfg.model
                });

                // Camera position
                viewer.camera.position.set(cfg.camera.x, cfg.camera.y, cfg.camera.z);
                viewer.camera.lookAt(0, 0, 0);

                // Enable orbit controls for interactive mouse rotating
                if (skinview3d.createOrbitControls) {
                    const control = skinview3d.createOrbitControls(viewer);
                    control.enableRotate = true;
                    control.enableZoom = false;
                    control.enablePan = false;
                    control.maxPolarAngle = Math.PI / 1.7;
                    control.minPolarAngle = Math.PI / 3;
                }

                // Initial pose adjustments
                if (viewer.playerObject && viewer.playerObject.skin) {
                    const s = viewer.playerObject.skin;
                    if (cfg.pose.leftArm && s.leftArm) {
                        if (cfg.pose.leftArm.x !== undefined) s.leftArm.rotation.x = cfg.pose.leftArm.x;
                        if (cfg.pose.leftArm.y !== undefined) s.leftArm.rotation.y = cfg.pose.leftArm.y;
                        if (cfg.pose.leftArm.z !== undefined) s.leftArm.rotation.z = cfg.pose.leftArm.z;
                    }
                    if (cfg.pose.rightArm && s.rightArm) {
                        if (cfg.pose.rightArm.x !== undefined) s.rightArm.rotation.x = cfg.pose.rightArm.x;
                        if (cfg.pose.rightArm.y !== undefined) s.rightArm.rotation.y = cfg.pose.rightArm.y;
                        if (cfg.pose.rightArm.z !== undefined) s.rightArm.rotation.z = cfg.pose.rightArm.z;
                    }
                    if (cfg.pose.head && s.head) {
                        if (cfg.pose.head.x !== undefined) s.head.rotation.x = cfg.pose.head.x;
                        if (cfg.pose.head.y !== undefined) s.head.rotation.y = cfg.pose.head.y;
                    }
                }

                // Smooth idle animation
                if (skinview3d.IdleAnimation) {
                    viewer.animation = new skinview3d.IdleAnimation();
                    viewer.animation.speed = key === 'error404' ? 0.75 : 0.65;
                }

                viewers[key] = viewer;

                // Handle window resize smoothly
                window.addEventListener('resize', () => {
                    const w = canvas.clientWidth || 250;
                    const h = canvas.clientHeight || 380;
                    viewer.setSize(w, h);
                });

            } catch (err) {
                console.error(`[Pulse Team] Failed to init 3D viewer for ${key}:`, err);
                if (canvas) canvas.style.display = 'none';
                if (img) img.classList.add('fallback-visible');
            }
        });

        // Hover linkages between team cards and character figures
        setupCardHoverEffects();
    }

    function setupCardHoverEffects() {
        const linkMap = [
            { card: '.card-founder', figure: '.figure-founder' },
            { card: '.card-odika', figure: '.figure-odika' },
            { card: '.card-dataaa', figure: '.figure-dataaa' }
        ];

        linkMap.forEach(({ card, figure }) => {
            const cardEl = document.querySelector(card);
            const figureEl = document.querySelector(figure);
            if (!cardEl || !figureEl) return;

            cardEl.addEventListener('mouseenter', () => {
                figureEl.style.transform = figure.includes('founder') 
                    ? 'translateY(-14px) scale(1.14)' 
                    : 'translateY(-10px) scale(1.08)';
                figureEl.style.filter = 'drop-shadow(0 15px 35px rgba(255, 47, 87, 0.45))';
            });

            cardEl.addEventListener('mouseleave', () => {
                figureEl.style.transform = '';
                figureEl.style.filter = '';
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTeamViewers);
    } else {
        initTeamViewers();
    }
})();
