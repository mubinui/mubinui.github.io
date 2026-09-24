// Painted glass, in three GPU layers that share the site's own theme colours:
//  1. the first-screen card, where colour bleeds out of the name (inside that card);
//  2. every other glass card, tinted from a shared layer behind the page;
//  3. an ink layer over the cards: moving the mouse paints a brush stroke whose colour
//     travels through the theme as you paint, spreads outward like wet ink on paper,
//     then slowly dries away.

(() => {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const seed = Math.random() * 100;

    // Glass cards that carry colour. The hero card has its own bleed; the rest share a layer.
    const heroCard = document.querySelector('.hero-window');
    const otherCards = [...document.querySelectorAll('main .window, main .tag, .footer-card')].filter(el =>
        !el.classList.contains('hero-window') && !el.classList.contains('photo-window') &&
        !el.classList.contains('pop-card') && !el.closest('.assistant') && !el.closest('.wall'));
    const paintable = heroCard ? [heroCard, ...otherCards] : otherCards;

    // ---------------------------------------------------------------
    // Brush: eased pointer, and a trail of points that age as the ink dries
    // ---------------------------------------------------------------

    const TRAIL = 24;
    const DRY_MS = 5200;
    const HUES = 7;            // theme colours the brush travels through
    const trail = [];          // { x, y, t, r, c, lift } in viewport pixels
    const tip = { x: 0, y: 0, tx: 0, ty: 0, down: false, fresh: false, lastStep: 0, hue: Math.random() * HUES };

    if (finePointer && !reducedMotion) {
        window.addEventListener('pointermove', e => {
            const over = e.target instanceof Element && paintable.some(s => s.contains(e.target));
            if (over && !tip.down) {
                tip.x = tip.tx = e.clientX;
                tip.y = tip.ty = e.clientY;
                tip.fresh = true;
            }
            tip.down = over;
            tip.tx = e.clientX;
            tip.ty = e.clientY;
        }, { passive: true });
        document.addEventListener('pointerleave', () => { tip.down = false; });
    }

    // Once per frame: the brush trails the pointer with an easing lag, which turns jittery
    // mouse movement into smooth, unhurried curves. Its colour advances with distance.
    function stepBrush(now) {
        if (now - tip.lastStep < 12) return;
        const dt = Math.min(64, now - (tip.lastStep || now));
        tip.lastStep = now;
        while (trail.length && now - trail[0].t > DRY_MS) trail.shift();
        if (!tip.down) return;
        const k = 1 - Math.pow(0.84, dt / 16.7);
        tip.x += (tip.tx - tip.x) * k;
        tip.y += (tip.ty - tip.y) * k;
        // Trail points live in page coordinates, so painted ink scrolls with its card.
        const px = tip.x + window.scrollX;
        const py = tip.y + window.scrollY;
        const prev = trail[trail.length - 1];
        if (tip.fresh || !prev) {
            trail.push({ x: px, y: py, t: now, r: 30, c: tip.hue, lift: true });
            tip.fresh = false;
        } else {
            const dist = Math.hypot(px - prev.x, py - prev.y);
            if (dist >= 7) {
                const speed = dist / Math.max(16, now - prev.t);
                const r = Math.max(22, Math.min(38, 38 - speed * 6));
                // About one full theme colour per 420 px of painting.
                tip.hue = (tip.hue + dist / 420) % HUES;
                trail.push({ x: px, y: py, t: now, r: prev.r + (r - prev.r) * 0.35, c: tip.hue });
            }
        }
        while (trail.length > TRAIL) trail.shift();
    }

    // ---------------------------------------------------------------
    // GLSL shared by the layers
    // ---------------------------------------------------------------

    // The theme: Apple blue, and the icon hues used across the page.
    const COMMON = `
precision mediump float;
uniform float time;

const vec3 BLUE   = vec3(0.000, 0.443, 0.890);  // #0071e3
const vec3 INDIGO = vec3(0.294, 0.278, 0.839);  // #4b47d6
const vec3 PURPLE = vec3(0.580, 0.216, 0.812);  // #9437cf
const vec3 TEAL   = vec3(0.094, 0.569, 0.678);  // #1891ad
const vec3 PINK   = vec3(0.875, 0.169, 0.345);  // #df2b58
const vec3 ORANGE = vec3(0.961, 0.486, 0.000);  // #f57c00
const vec3 GREEN  = vec3(0.122, 0.616, 0.271);  // #1f9d45

// The brush's colour wheel, in theme order: 0 blue … 6 green, wrapping back to blue.
vec3 themeHue(float c) {
    c = mod(c, 7.0);
    float f = smoothstep(0.0, 1.0, fract(c));
    if (c < 1.0) return mix(BLUE, INDIGO, f);
    if (c < 2.0) return mix(INDIGO, PURPLE, f);
    if (c < 3.0) return mix(PURPLE, PINK, f);
    if (c < 4.0) return mix(PINK, ORANGE, f);
    if (c < 5.0) return mix(ORANGE, GREEN, f);
    if (c < 6.0) return mix(GREEN, TEAL, f);
    return mix(TEAL, BLUE, f);
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
    return v;
}

// The flowing wash: mostly the site's blue family, with purple and teal drifting through,
// and a rare touch of pink. Domain-warped noise keeps it moving like wet paint.
vec3 paint(vec2 p, out float f) {
    float t = time;
    vec2 q = vec2(fbm(p + vec2(0.0, t * 0.07)), fbm(p + vec2(5.2, 1.3) - t * 0.06));
    vec2 w = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.04), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.05));
    f = fbm(p + 2.6 * w);
    vec3 col = mix(BLUE, INDIGO, smoothstep(0.25, 0.75, q.x));
    col = mix(col, TEAL, smoothstep(0.4, 0.85, w.y) * 0.8);
    col = mix(col, PURPLE, smoothstep(0.5, 0.85, f) * 0.7);
    col = mix(col, PINK, smoothstep(0.7, 0.95, q.y) * 0.3);
    return col;
}

float roundedBox(vec2 p, vec2 hb, float r) {
    vec2 q = abs(p) - hb + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}
`;

    const VERTEX = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

    function makeProgram(gl, fragment) {
        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                console.warn('flow.js shader:', gl.getShaderInfoLog(s));
                return null;
            }
            return s;
        };
        const vs = compile(gl.VERTEX_SHADER, VERTEX);
        const fs = compile(gl.FRAGMENT_SHADER, fragment);
        if (!vs || !fs) return null;
        const program = gl.createProgram();
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        const loc = gl.getAttribLocation(program, 'a');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        gl.clearColor(0, 0, 0, 0);
        return name => gl.getUniformLocation(program, name);
    }

    const glContext = canvas => canvas.getContext('webgl', {
        alpha: true, premultipliedAlpha: true, antialias: false, depth: false, powerPreference: 'low-power'
    });

    // Runs a draw function at ~30 fps while it's wanted; calls onStop when it goes idle.
    // Scrolling is tracked once for all layers: while it lasts, they redraw every frame
    // so the colour stays locked to the cards instead of lagging a frame behind.
    let lastScroll = 0;
    const kicks = [];
    // While the page scrolls, the layers that sit behind or over it fade out (the browser
    // scrolls on its own fast track, so anything following the cards would trail them),
    // and fade back once scrolling settles.
    const root = document.documentElement;
    let settle = 0;
    window.addEventListener('scroll', () => {
        lastScroll = performance.now();
        tip.down = false;   // scrolling lifts the brush, so the paper doesn't smear under it
        root.classList.add('is-scrolling');
        clearTimeout(settle);
        settle = setTimeout(() => {
            root.classList.remove('is-scrolling');
            kicks.forEach(k => k());
        }, 220);
        kicks.forEach(k => k());
    }, { passive: true });

    function loop(draw, wanted, onStop) {
        if (reducedMotion) return () => draw(0);
        let running = false;
        let last = 0;
        const frame = now => {
            if (document.hidden || !wanted()) {
                running = false;
                if (onStop) onStop();
                return;
            }
            if (now - lastScroll < 250 || now - last > 33) {
                last = now;
                draw(now / 1000);
            }
            requestAnimationFrame(frame);
        };
        const kick = () => {
            if (running) return;
            running = true;
            requestAnimationFrame(frame);
        };
        document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
        kicks.push(kick);
        return kick;
    }

    // Tracks which of a set of elements are near the viewport.
    function watchVisible(elements, onChange) {
        const visible = new Set();
        const io = new IntersectionObserver(entries => {
            entries.forEach(en => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target)));
            onChange();
        }, { rootMargin: '10% 0px' });
        elements.forEach(el => io.observe(el));
        return visible;
    }

    // Packs element rectangles into a uniform array, in a canvas's coordinates (y up).
    function packRects(out, elements, scale, max) {
        const vh = window.innerHeight;
        let n = 0;
        for (const el of elements) {
            if (n >= max) break;
            const r = el.getBoundingClientRect();
            out.set([r.left * scale, (vh - r.bottom) * scale, r.width * scale, r.height * scale], n * 4);
            n++;
        }
        return n;
    }

    // ---------------------------------------------------------------
    // 1. The first-screen card: colour bleeding out of the name
    // ---------------------------------------------------------------

    (() => {
        const source = document.querySelector('.hero-name');
        if (!heroCard || !source) return;
        const SCALE = 0.35;
        const canvas = document.createElement('canvas');
        canvas.className = 'bleed';
        canvas.setAttribute('aria-hidden', 'true');
        const gl = glContext(canvas);
        if (!gl) return;
        const u = makeProgram(gl, COMMON + `
uniform vec2 res;
uniform vec2 origin;
uniform vec2 reach;
void main() {
    vec2 px = gl_FragCoord.xy;
    float f;
    vec3 col = paint(px / res.y * 2.2, f);
    vec2 d = (px - origin) / reach;
    float bleed = 1.0 - smoothstep(0.15, 1.0, length(d) + (f - 0.5) * 0.55);
    float alpha = bleed * (0.07 + smoothstep(0.25, 0.8, f) * 0.12);
    gl_FragColor = vec4(col * alpha, alpha);
}`);
        if (!u) return;
        const uRes = u('res'), uOrigin = u('origin'), uReach = u('reach'), uTime = u('time');

        const layout = () => {
            const rect = heroCard.getBoundingClientRect();
            const n = source.getBoundingClientRect();
            canvas.width = Math.max(32, Math.round(rect.width * SCALE));
            canvas.height = Math.max(32, Math.round(rect.height * SCALE));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform2f(uOrigin, (n.left - rect.left + n.width * 0.45) * SCALE, (rect.bottom - (n.top + n.height * 0.45)) * SCALE);
            gl.uniform2f(uReach, rect.width * SCALE * 0.75, rect.height * SCALE * 0.62);
        };
        const draw = seconds => {
            gl.uniform1f(uTime, seed + seconds);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        heroCard.prepend(canvas);
        heroCard.classList.add('has-bleed');
        layout();
        let onScreen = true;
        const kick = loop(draw, () => onScreen);
        if ('ResizeObserver' in window) new ResizeObserver(() => { layout(); kick(); }).observe(heroCard);
        if (document.fonts) document.fonts.ready.then(() => { layout(); kick(); });
        new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) kick(); }).observe(heroCard);
        kick();
    })();

    // ---------------------------------------------------------------
    // 2. Every other glass card: flowing colour behind the glass
    // ---------------------------------------------------------------

    (() => {
        const host = document.querySelector('.ambient');
        if (!host || !otherCards.length) return;
        const MAX = 20;
        const SCALE = 0.3;
        const canvas = document.createElement('canvas');
        canvas.className = 'card-flow';
        canvas.setAttribute('aria-hidden', 'true');
        const gl = glContext(canvas);
        if (!gl) return;
        const u = makeProgram(gl, COMMON + `
uniform vec2 res;
uniform vec4 rects[${MAX}];
uniform float lit[${MAX}];
uniform float ids[${MAX}];
uniform int count;
uniform float radius;
void main() {
    vec2 px = gl_FragCoord.xy;
    float mask = 0.0;
    float glow = 0.0;
    vec2 local = vec2(0.0);
    for (int i = 0; i < ${MAX}; i++) {
        if (i >= count) break;
        vec4 r = rects[i];
        float inside = 1.0 - smoothstep(-radius, 0.0, roundedBox(px - (r.xy + r.zw * 0.5), r.zw * 0.5, radius));
        // Strongest near the card's top-left, where its title sits.
        float fromTitle = 1.0 - smoothstep(0.0, 1.0, length((px - vec2(r.x, r.y + r.w)) / (r.zw * vec2(0.9, 1.1))));
        float m = inside * (0.45 + 0.55 * fromTitle);
        if (m > mask) {
            mask = m;
            glow = lit[i];
            // Measured from the card's own top-left, plus a per-card offset: the colour
            // travels with the card when the page scrolls, and each card gets its own.
            local = (px - vec2(r.x, r.y + r.w)) + vec2(ids[i] * 97.0, ids[i] * 53.0);
        }
    }
    if (mask <= 0.001) { gl_FragColor = vec4(0.0); return; }
    float f;
    vec3 col = paint(local / res.y * 2.4, f);
    // Faint at rest; a touched card's colour swells, then settles back.
    float alpha = mask * mix(0.015 + smoothstep(0.25, 0.8, f) * 0.03, 0.3 + smoothstep(0.25, 0.8, f) * 0.3, glow);
    gl_FragColor = vec4(col * alpha, alpha);
}`);
        if (!u) return;
        const uRes = u('res'), uTime = u('time'), uRects = u('rects'), uLit = u('lit'), uIds = u('ids'), uCount = u('count'), uRadius = u('radius');
        const rects = new Float32Array(MAX * 4);
        const lit = new Float32Array(MAX);
        const ids = new Float32Array(MAX);
        // Each card's glow eases toward 1 while touched and back to 0 after.
        const glow = new Map();
        let touched = null;
        if (finePointer && !reducedMotion) {
            window.addEventListener('pointermove', e => {
                touched = e.target instanceof Element ? otherCards.find(c => c.contains(e.target)) || null : null;
                if (touched) kick();
            }, { passive: true });
        }

        const resize = () => {
            canvas.width = Math.max(64, Math.round(window.innerWidth * SCALE));
            canvas.height = Math.max(64, Math.round(window.innerHeight * SCALE));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uRadius, 30 * SCALE);
        };
        let visible = new Set();
        const draw = seconds => {
            gl.uniform1i(uCount, packRects(rects, visible, SCALE, MAX));
            let i = 0;
            for (const c of visible) {
                if (i >= MAX) break;
                const g = glow.get(c) || 0;
                const target = c === touched ? 1 : 0;
                const next = g + (target - g) * (target ? 0.06 : 0.025);
                glow.set(c, next);
                ids[i] = otherCards.indexOf(c);
                lit[i++] = next;
            }
            gl.uniform1fv(uLit, lit);
            gl.uniform1fv(uIds, ids);
            gl.uniform4fv(uRects, rects);
            gl.uniform1f(uTime, seed + 37 + seconds);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        host.appendChild(canvas);
        resize();
        let kick = () => {};
        visible = watchVisible(otherCards, () => { if (!visible.size) draw(0); kick(); });
        kick = loop(draw, () => visible.size > 0);
        window.addEventListener('resize', () => { resize(); kick(); });
        if (reducedMotion) window.addEventListener('scroll', () => draw(0), { passive: true });
        kick();
    })();

    // ---------------------------------------------------------------
    // 3. Ink over the glass: the brush
    // ---------------------------------------------------------------

    (() => {
        if (!finePointer || reducedMotion || !paintable.length) return;
        const MAX = 20;
        const SCALE = 0.5;
        const canvas = document.createElement('canvas');
        canvas.className = 'ink';
        canvas.setAttribute('aria-hidden', 'true');
        const gl = glContext(canvas);
        if (!gl) return;
        const u = makeProgram(gl, COMMON + `
uniform vec2 res;
uniform vec4 rects[${MAX}];
uniform int count;
uniform float radius;
uniform vec4 pts[${TRAIL}];
uniform float hues[${TRAIL}];
uniform int npts;

// Capsules between trail points. After it lands, the ink keeps creeping outward: the edge
// wicks and wobbles like wet paper, pigment pools at the rim, the colour thins as it
// spreads, and the stroke slowly dries away. Returns coverage in .a, colour in .rgb.
vec4 ink(vec2 px) {
    float a = 0.0;
    float hue = 0.0;
    for (int i = 0; i < ${TRAIL - 1}; i++) {
        if (i >= npts - 1) break;
        vec4 A = pts[i];
        vec4 B = pts[i + 1];
        if (B.w < 0.0) continue;
        vec2 ab = B.xy - A.xy;
        float L = max(length(ab), 0.0001);
        float h = clamp(dot(px - A.xy, ab) / (L * L), 0.0, 1.0);
        float d = length(px - (A.xy + ab * h));
        float r0 = mix(abs(A.w), B.w, h);
        float age = mix(A.z, B.z, h);
        float spread = 1.0 + 0.95 * sqrt(age);
        float r = r0 * spread;
        if (d > r * 1.6) continue;
        float wick = (noise(px / r0 * 1.4 + vec2(age * 1.3, float(i) * 2.1)) - 0.5) * (0.25 + 0.5 * age);
        float e = d / r + wick;
        vec2 dir = ab / L;
        float across = dot(px - A.xy, vec2(-dir.y, dir.x)) / r0;
        float along = (h * L) / r0 + float(i) * 1.7;
        float bristle = 0.62 + 0.38 * noise(vec2(across * 5.0, along * 0.3));
        float body = 1.0 - smoothstep(0.62, 1.0, e);
        float rim = smoothstep(0.62, 0.92, e) * (1.0 - smoothstep(0.92, 1.06, e)) * 0.55;
        float dilute = 1.0 / (spread * spread);
        float dry = 1.0 - smoothstep(0.2, 1.0, age);
        dry *= dry * (3.0 - 2.0 * dry);
        float s = (body * mix(bristle, 1.0, age) * 1.4 + rim) * dilute * dry;
        if (s > a) {
            a = s;
            // Hue along the stroke, taking the short way round the colour wheel.
            float ha = hues[i];
            float hb = hues[i + 1];
            if (hb - ha > 3.5) ha += 7.0;
            if (ha - hb > 3.5) hb += 7.0;
            hue = mix(ha, hb, h);
        }
    }
    return vec4(themeHue(hue), min(a, 1.0));
}

void main() {
    vec2 px = gl_FragCoord.xy;
    float inside = 0.0;
    for (int i = 0; i < ${MAX}; i++) {
        if (i >= count) break;
        vec4 r = rects[i];
        inside = max(inside, 1.0 - smoothstep(-1.5, 0.5, roundedBox(px - (r.xy + r.zw * 0.5), r.zw * 0.5, radius)));
    }
    if (inside <= 0.001 || npts < 2) { gl_FragColor = vec4(0.0); return; }
    vec4 k = ink(px);
    float a = k.a * inside;
    if (a <= 0.001) { gl_FragColor = vec4(0.0); return; }
    // Pale enough to read as a wash of ink over the glass; text stays crisp beneath it.
    vec3 col = mix(k.rgb, vec3(1.0), 0.35);
    float alpha = a * 0.3;
    gl_FragColor = vec4(col * alpha, alpha);
}`);
        if (!u) return;
        const uRes = u('res'), uTime = u('time'), uRects = u('rects'), uCount = u('count'), uRadius = u('radius'),
            uPts = u('pts'), uHues = u('hues'), uN = u('npts');
        const rects = new Float32Array(MAX * 4);
        const pts = new Float32Array(TRAIL * 4);
        const hues = new Float32Array(TRAIL);

        const resize = () => {
            canvas.width = Math.max(64, Math.round(window.innerWidth * SCALE));
            canvas.height = Math.max(64, Math.round(window.innerHeight * SCALE));
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uRadius, 30 * SCALE);
        };
        let visible = new Set();
        const draw = seconds => {
            const now = performance.now();
            stepBrush(now);
            const vh = window.innerHeight;
            let n = 0;
            for (const p of trail) {
                const cx = p.x - window.scrollX;
                const cy = p.y - window.scrollY;
                pts.set([cx * SCALE, (vh - cy) * SCALE, (now - p.t) / DRY_MS, (p.lift ? -p.r : p.r) * SCALE], n * 4);
                hues[n] = p.c;
                n++;
            }
            gl.uniform4fv(uPts, pts);
            gl.uniform1fv(uHues, hues);
            gl.uniform1i(uN, n);
            gl.uniform1i(uCount, packRects(rects, visible, SCALE, MAX));
            gl.uniform4fv(uRects, rects);
            gl.uniform1f(uTime, seed + 37 + seconds);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        };

        document.body.appendChild(canvas);
        resize();
        let kick = () => {};
        visible = watchVisible(paintable, () => kick());
        // Runs only while a stroke is being painted or is still drying.
        kick = loop(draw, () => tip.down || trail.length > 0, () => gl.clear(gl.COLOR_BUFFER_BIT));
        window.addEventListener('pointermove', () => kick(), { passive: true });
        window.addEventListener('resize', resize);
    })();
})();
