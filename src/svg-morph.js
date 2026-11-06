/*!
 * svg-morph v1.0.0
 * Morphing SVG paths, self-drawing line art, organic blobs, wave animations.
 * Zero dependencies. MIT License — https://github.com/hojullc/svg-morph
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory()
    : typeof define === 'function' && define.amd ? define(factory)
    : (global.SvgMorph = factory());
}(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  const raf = requestAnimationFrame.bind(window);
  const noop = () => {};
  const lerp = (a, b, t) => a + (b - a) * t;
  const easeInOut = t => t < .5 ? 2*t*t : -1+(4-2*t)*t;

  /* ─── Path tokenizer ─────────────────────────────────────────────────── */
  function parsePath(d) {
    const nums = d.match(/-?[\d.]+(?:e[-+]?\d+)?/gi);
    return nums ? nums.map(Number) : [];
  }

  function interpolatePaths(a, b, t) {
    const na = parsePath(a), nb = parsePath(b);
    const len = Math.min(na.length, nb.length);
    const result = [];
    for (let i = 0; i < len; i++) result.push(lerp(na[i], nb[i], t));
    // Re-inject numbers into template of path a
    let idx = 0;
    return a.replace(/-?[\d.]+(?:e[-+]?\d+)?/gi, () => {
      const v = result[idx++];
      return v !== undefined ? v.toFixed(3) : '0';
    });
  }

  /* ─── 1. MORPH ───────────────────────────────────────────────────────── */
  function morph(target, paths, opts = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return { stop: noop };

    const {
      duration = 800,
      easing   = easeInOut,
      loop     = true,
      delay    = 1200,
      onStep   = noop,
    } = opts;

    const list = Array.isArray(paths) ? paths : [el.getAttribute('d'), paths];
    let idx = 0, startTime = null, waiting = false, timer, frame;

    function step(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const t = easing(Math.min(elapsed / duration, 1));
      const from = list[idx % list.length];
      const to = list[(idx + 1) % list.length];
      const d = interpolatePaths(from, to, t);
      el.setAttribute('d', d);
      onStep(t, d);

      if (elapsed < duration) {
        frame = raf(step);
      } else {
        el.setAttribute('d', to);
        idx++;
        if (loop || idx < list.length - 1) {
          waiting = true;
          timer = setTimeout(() => {
            startTime = null;
            waiting = false;
            frame = raf(step);
          }, delay);
        }
      }
    }

    frame = raf(step);
    return {
      stop() { cancelAnimationFrame(frame); clearTimeout(timer); },
      replay() {
        cancelAnimationFrame(frame); clearTimeout(timer);
        idx = 0; startTime = null;
        frame = raf(step);
      },
    };
  }

  /* ─── 2. DRAW ─────────────────────────────────────────────────────────── */
  function draw(target, opts = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return { stop: noop };

    const {
      duration  = 1500,
      easing    = easeInOut,
      reverse   = false,
      onDone    = noop,
    } = opts;

    const paths = el.tagName.toLowerCase() === 'path'
      ? [el]
      : Array.from(el.querySelectorAll('path,line,polyline,polygon,circle,rect,ellipse'));

    // Measure total length and prepare
    paths.forEach(p => {
      let len;
      try { len = p.getTotalLength ? p.getTotalLength() : 500; } catch(e) { len = 500; }
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = reverse ? '0' : len;
      p.style.transition = 'none';
    });

    let start = null, frame;

    function step(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = easing(Math.min(elapsed / duration, 1));
      paths.forEach(p => {
        let len;
        try { len = p.getTotalLength ? p.getTotalLength() : 500; } catch(e) { len = 500; }
        const offset = reverse ? len * progress : len * (1 - progress);
        p.style.strokeDashoffset = offset;
      });
      if (elapsed < duration) {
        frame = raf(step);
      } else {
        paths.forEach(p => { p.style.strokeDashoffset = reverse ? p.style.strokeDasharray : '0'; });
        onDone();
      }
    }

    frame = raf(step);
    return {
      stop() { cancelAnimationFrame(frame); },
      replay() {
        cancelAnimationFrame(frame);
        paths.forEach(p => {
          let len;
          try { len = p.getTotalLength ? p.getTotalLength() : 500; } catch(e) { len = 500; }
          p.style.strokeDashoffset = reverse ? '0' : len;
        });
        start = null;
        frame = raf(step);
      },
    };
  }

  /* ─── 3. BLOB ─────────────────────────────────────────────────────────── */
  function blob(target, opts = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return { stop: noop };

    const {
      points  = 7,
      speed   = 0.004,
      range   = 0.35,
      cx      = 50,
      cy      = 50,
      r       = 38,
    } = opts;

    let t = 0, frame;

    function blobPath(t) {
      const coords = [];
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
        const rr = r * (1 + range * (
          Math.sin(t * 1.7 + i * 2.3) * 0.5 +
          Math.cos(t * 1.1 + i * 1.7) * 0.5
        ));
        coords.push([
          cx + Math.cos(angle) * rr,
          cy + Math.sin(angle) * rr,
        ]);
      }
      let d = `M ${coords[0][0].toFixed(2)} ${coords[0][1].toFixed(2)}`;
      for (let i = 0; i < points; i++) {
        const next = coords[(i + 1) % points];
        const curr = coords[i];
        const mx = (curr[0] + next[0]) / 2;
        const my = (curr[1] + next[1]) / 2;
        d += ` Q ${curr[0].toFixed(2)} ${curr[1].toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
      }
      return d + ' Z';
    }

    function tick() {
      t += speed;
      el.setAttribute('d', blobPath(t));
      frame = raf(tick);
    }
    frame = raf(tick);

    return { stop() { cancelAnimationFrame(frame); } };
  }

  /* ─── 4. WAVE ─────────────────────────────────────────────────────────── */
  function wave(target, opts = {}) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return { stop: noop };

    const {
      width      = 400,
      height     = 100,
      amplitude  = 20,
      frequency  = 2,
      speed      = 0.04,
      baseline   = 50,
      steps      = 80,
      fill       = true,
    } = opts;

    let t = 0, frame;

    function wavePath(t) {
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width;
        const y = baseline + amplitude * Math.sin((i / steps) * Math.PI * 2 * frequency + t);
        pts.push([x, y]);
      }
      let d = `M ${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0].toFixed(2)} ${pts[i][1].toFixed(2)}`;
      if (fill) d += ` L ${width} ${height} L 0 ${height} Z`;
      return d;
    }

    function tick() {
      t += speed;
      el.setAttribute('d', wavePath(t));
      frame = raf(tick);
    }
    frame = raf(tick);

    return { stop() { cancelAnimationFrame(frame); } };
  }

  /* ─── 5. AUTO-INIT ───────────────────────────────────────────────────── */
  function autoInit() {
    document.querySelectorAll('[data-svg-morph]').forEach(el => {
      const type = el.getAttribute('data-svg-morph');
      const opts = {};
      try { Object.assign(opts, JSON.parse(el.getAttribute('data-svg-opts') || '{}')); } catch(e) {}
      switch(type) {
        case 'draw': draw(el, opts); break;
        case 'blob': blob(el, opts); break;
        case 'wave': wave(el, opts); break;
      }
    });
  }

  if (typeof document !== 'undefined') {
    document.readyState === 'loading'
      ? document.addEventListener('DOMContentLoaded', autoInit)
      : autoInit();
  }

  return { morph, draw, blob, wave, autoInit };
}));
