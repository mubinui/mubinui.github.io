// Mubin Ul Islam Chowdhury — Portfolio
// Ambient depth, glass light, window reveal, section ornament, gallery.

(() => {
    'use strict';

    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    const root = document.documentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const hasIO = 'IntersectionObserver' in window;
    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    // The main windows carry a visionOS grabber.
    $$('.hero-window, .hero-portrait, .featured, .contact-window').forEach(win => {
        const grabber = document.createElement('span');
        grabber.className = 'grabber';
        grabber.setAttribute('aria-hidden', 'true');
        win.appendChild(grabber);
    });

    // Depth: the ambient light drifts with scroll; the portrait sits on a far plane.
    const ambient = $('.ambient');
    const far = $$('[data-depth="far"]');
    let ticking = false;
    const renderDepth = () => {
        ticking = false;
        const vh = window.innerHeight;
        const max = Math.max(1, document.documentElement.scrollHeight - vh);
        ambient.style.setProperty('--amb-y', `${((0.5 - window.scrollY / max) * 120).toFixed(1)}px`);
        far.forEach(el => {
            const r = el.getBoundingClientRect();
            const offset = (r.top + r.height / 2 - vh / 2) * -0.06;
            el.style.setProperty('--depth-y', `${clamp(offset, -36, 36).toFixed(1)}px`);
        });
    };
    const requestDepth = () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(renderDepth);
        }
    };
    if (!reducedMotion) {
        window.addEventListener('scroll', requestDepth, { passive: true });
        window.addEventListener('resize', requestDepth);
        renderDepth();
    }

    // Glass light: a specular highlight follows the pointer across a window.
    if (finePointer) {
        $$('.window:not(.photo-window)').forEach(win => {
            win.addEventListener('pointermove', e => {
                const r = win.getBoundingClientRect();
                win.style.setProperty('--mx', `${e.clientX - r.left}px`);
                win.style.setProperty('--my', `${e.clientY - r.top}px`);
                win.classList.add('is-lit');
            });
            win.addEventListener('pointerleave', () => win.classList.remove('is-lit'));
        });
    }

    // Windows materialise from depth the first time they are seen.
    if (!reducedMotion && hasIO) {
        const windows = $$('.window').filter(w => !w.closest('.hero-visual') && !w.closest('.assistant'));
        const vh = window.innerHeight;
        windows.forEach(w => {
            w.classList.add('reveal');
            if (w.getBoundingClientRect().top < vh) w.classList.add('is-in');
        });
        root.classList.add('motion');
        const reveal = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                e.target.classList.add('is-in');
                reveal.unobserve(e.target);
            });
        }, { rootMargin: '0px 0px -6% 0px' });
        windows.filter(w => !w.classList.contains('is-in')).forEach(w => reveal.observe(w));
    }

    // Ornament: mark the section in view and slide the indicator under it.
    const ornament = $('.ornament');
    const indicator = $('.ornament-indicator');
    const links = $$('.ornament ul a');
    const moveIndicator = () => {
        const active = links.find(l => l.getAttribute('aria-current') === 'true' && l.offsetParent);
        if (!active) {
            indicator.style.opacity = '0';
            return;
        }
        indicator.style.width = `${active.offsetWidth}px`;
        indicator.style.transform = `translateX(${active.offsetLeft}px)`;
        indicator.style.opacity = '1';
    };
    if (hasIO && ornament) {
        const tracked = links
            .map(l => document.querySelector(l.getAttribute('href')))
            .filter(Boolean);
        const spy = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (!e.isIntersecting) return;
                links.forEach(l => {
                    if (l.getAttribute('href') === `#${e.target.id}`) l.setAttribute('aria-current', 'true');
                    else l.removeAttribute('aria-current');
                });
                moveIndicator();
            });
        }, { rootMargin: '-45% 0px -50% 0px' });
        tracked.forEach(s => spy.observe(s));
        const hero = $('#top');
        new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                links.forEach(l => l.removeAttribute('aria-current'));
                moveIndicator();
            }
        }, { rootMargin: '-45% 0px -50% 0px' }).observe(hero);
        window.addEventListener('resize', moveIndicator);
    }

    // Gallery: filter the wall, open any photo in the viewer.
    const wall = $('#wall');
    const filters = $$('.segmented [data-filter]');
    filters.forEach(button => {
        button.addEventListener('click', () => {
            const cat = button.dataset.filter;
            filters.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
            $$('li', wall).forEach(li => { li.hidden = cat !== 'all' && li.dataset.cat !== cat; });
        });
    });

    // Masonry: each tile spans rows in proportion to its photo's real shape.
    const layoutWall = () => {
        if (!wall) return;
        const cs = getComputedStyle(wall);
        const cols = cs.gridTemplateColumns.split(' ').length;
        const gap = parseFloat(cs.columnGap) || 0;
        const colWidth = (wall.clientWidth - gap * (cols - 1)) / cols;
        const unit = 8;
        $$('li', wall).forEach(li => {
            const img = $('img', li);
            const w = +img.getAttribute('width');
            const h = +img.getAttribute('height');
            if (!w || !h) return;
            const span = li.classList.contains('tile-wide') && cols > 1 ? 2 : 1;
            const width = colWidth * span + gap * (span - 1);
            li.style.gridColumn = `span ${span}`;
            li.style.gridRowEnd = `span ${Math.ceil((width * h / w + gap) / unit)}`;
        });
        wall.classList.add('is-masonry');
    };
    if (wall) {
        layoutWall();
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(layoutWall, 120);
        });
    }

    const viewer = $('#viewer');
    if (wall && viewer && typeof viewer.showModal === 'function') {
        const img = document.createElement('img');
        $('#viewerFrame').appendChild(img);
        const cap = $('#viewerCap');
        const count = $('#viewerCount');
        let list = [];
        let index = 0;
        const show = i => {
            index = (i + list.length) % list.length;
            const item = list[index];
            const source = $('img', item);
            img.src = source.currentSrc || source.src;
            img.alt = source.alt;
            cap.textContent = $('.wall-caption', item).textContent;
            count.textContent = `${index + 1} of ${list.length}`;
        };
        $$('.wall-item', wall).forEach(item => {
            item.addEventListener('click', () => {
                list = $$('li:not([hidden]) .wall-item', wall);
                show(list.indexOf(item));
                viewer.showModal();
            });
        });
        $('#viewerPrev').addEventListener('click', () => show(index - 1));
        $('#viewerNext').addEventListener('click', () => show(index + 1));
        $('#viewerClose').addEventListener('click', () => viewer.close());
        viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
        viewer.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') show(index - 1);
            if (e.key === 'ArrowRight') show(index + 1);
        });
        let startX = null;
        viewer.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
        viewer.addEventListener('touchend', e => {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
            startX = null;
        });
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js').catch(() => {});
        });
    }
})();
