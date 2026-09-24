// Dot sphere: a slowly turning globe of points that ripples when it has something to say.
// Shared by the portfolio's assistant launcher and the chat page's voice orb.

(() => {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const GOLDEN = Math.PI * (3 - Math.sqrt(5));

    // Motion per state: turn speed, wave strength, wave speed.
    const STATES = {
        idle: { spin: 0.25, amp: 0.02, speed: 1.2 },
        listening: { spin: 0.35, amp: 0.07, speed: 2.4 },
        thinking: { spin: 1.4, amp: 0.035, speed: 4.5 },
        speaking: { spin: 0.5, amp: 0.13, speed: 7 }
    };

    // Colour per state (near dots, far dots): blue listens, violet thinks, teal speaks.
    const COLORS = {
        idle: [[0, 113, 227], [127, 124, 255]],
        listening: [[0, 113, 227], [127, 124, 255]],
        thinking: [[91, 71, 214], [199, 120, 245]],
        speaking: [[16, 139, 168], [0, 113, 227]]
    };

    class DotSphere {
        constructor(canvas, options = {}) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.count = options.count || 160;
            this.dotSize = options.dotSize || 1;
            this.near = [...(options.near || COLORS.idle[0])];
            this.far = [...(options.far || COLORS.idle[1])];
            this.chatter = options.chatter || false;
            this.state = 'idle';
            this.current = { ...STATES.idle };
            this.pulse = 0;
            this.angle = 0;
            this.time = 0;
            this.visible = true;
            this.points = Array.from({ length: this.count }, (_, i) => {
                const y = 1 - (i / (this.count - 1)) * 2;
                const r = Math.sqrt(1 - y * y);
                const theta = GOLDEN * i;
                return [Math.cos(theta) * r, y, Math.sin(theta) * r];
            });
            this.resize();
            if ('ResizeObserver' in window) new ResizeObserver(() => this.resize()).observe(canvas);
            if ('IntersectionObserver' in window) {
                new IntersectionObserver(([e]) => {
                    this.visible = e.isIntersecting;
                    if (this.visible) this.start();
                }).observe(canvas);
            }
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) this.start();
            });
            this.last = performance.now();
            if (reducedMotion) this.draw();
            else this.start();
        }

        resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = this.canvas.clientWidth || this.canvas.width;
            const h = this.canvas.clientHeight || this.canvas.height;
            this.canvas.width = Math.round(w * dpr);
            this.canvas.height = Math.round(h * dpr);
            this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            this.w = w;
            this.h = h;
            if (reducedMotion) this.draw();
        }

        setState(name) {
            if (STATES[name]) this.state = name;
            if (reducedMotion) this.draw();
        }

        // A single beat, e.g. on each spoken word.
        beat(strength = 1) {
            this.pulse = Math.min(1.5, this.pulse + 0.6 * strength);
        }

        start() {
            if (reducedMotion || this.running) return;
            this.running = true;
            this.last = performance.now();
            const loop = now => {
                if (!this.visible || document.hidden) {
                    this.running = false;
                    return;
                }
                const dt = Math.min(0.05, (now - this.last) / 1000);
                this.last = now;
                this.step(dt);
                this.draw();
                requestAnimationFrame(loop);
            };
            requestAnimationFrame(loop);
        }

        step(dt) {
            const target = STATES[this.state];
            // Ease every parameter toward the state, so changes feel physical.
            for (const k of Object.keys(target)) {
                this.current[k] += (target[k] - this.current[k]) * Math.min(1, dt * 3);
            }
            const [near, far] = COLORS[this.state];
            const k = Math.min(1, dt * 4);
            for (let i = 0; i < 3; i++) {
                this.near[i] += (near[i] - this.near[i]) * k;
                this.far[i] += (far[i] - this.far[i]) * k;
            }
            this.time += dt;
            this.angle += this.current.spin * dt;
            this.pulse *= Math.pow(0.12, dt);
            // Idle chatter: every few seconds a short burst, as if about to speak.
            if (this.chatter && this.state === 'idle') {
                const phase = this.time % 5.2;
                if (phase > 3.9 && phase < 4.9) this.pulse = Math.max(this.pulse, 0.55 * Math.sin((phase - 3.9) * Math.PI));
            }
        }

        draw() {
            const { ctx, w, h } = this;
            ctx.clearRect(0, 0, w, h);
            const cx = w / 2;
            const cy = h / 2;
            const radius = Math.min(w, h) * 0.38;
            const cosA = Math.cos(this.angle);
            const sinA = Math.sin(this.angle);
            const tilt = 0.35;
            const cosT = Math.cos(tilt);
            const sinT = Math.sin(tilt);
            const amp = this.current.amp + this.pulse * 0.09;
            const t = this.time * this.current.speed;
            const projected = this.points.map(([x, y, z]) => {
                // Turn around the vertical axis, then tilt toward the viewer.
                const x1 = x * cosA + z * sinA;
                const z1 = -x * sinA + z * cosA;
                const y1 = y * cosT - z1 * sinT;
                const z2 = y * sinT + z1 * cosT;
                // A wave that travels up the sphere, the way a voice rises and falls.
                const wave = 1 + amp * Math.sin(y * 5 - t) * (0.6 + 0.4 * Math.cos(x * 3 + t * 0.5));
                return [cx + x1 * radius * wave, cy + y1 * radius * wave, z2];
            });
            projected.sort((a, b) => a[2] - b[2]);
            for (const [px, py, z] of projected) {
                const depth = (z + 1) / 2;
                const r = this.near[0] * depth + this.far[0] * (1 - depth);
                const g = this.near[1] * depth + this.far[1] * (1 - depth);
                const b = this.near[2] * depth + this.far[2] * (1 - depth);
                ctx.fillStyle = `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${(0.18 + depth * 0.82).toFixed(3)})`;
                ctx.beginPath();
                ctx.arc(px, py, this.dotSize * (0.45 + depth * 0.9), 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    window.DotSphere = DotSphere;
})();
