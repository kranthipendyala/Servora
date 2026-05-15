(function () {
    'use strict';
  
    let ticking = false;
    let elements = [];
    const visible = new Set();
    const settingsCache = new WeakMap();
    const prevStyle = new WeakMap();
    let io;
  
    function init() {
      elements = Array.from(document.querySelectorAll('[data-keydesign-scroll-effects="yes"]'));
      if (!elements.length) return;
  
      elements.forEach(el => {
        const s = readSettings(el);
        if (s) {
          settingsCache.set(el, s);
        }
      });
  
      io = new IntersectionObserver(onIntersect, { 
        root: null, 
        rootMargin: '50px 0px',
        threshold: [0, 0.1, 0.5, 1]
      });
      elements.forEach(el => io.observe(el));
  
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize, { passive: true });
  
      onScroll();
    }
  
    function readSettings(el) {
      const responsive = el.getAttribute('data-scroll-responsive');
      if (responsive && !isResponsiveEnabled(responsive)) return null;
      return {
        vertical: el.getAttribute('data-scroll-vertical'),
        horizontal: el.getAttribute('data-scroll-horizontal'),
        transparency: el.getAttribute('data-scroll-transparency'),
        rotate: el.getAttribute('data-scroll-rotate'),
        scale: el.getAttribute('data-scroll-scale'),
        speed: parseFloat(el.getAttribute('data-scroll-speed')) || 0.5
      };
    }
  
    function onIntersect(entries) {
      for (const e of entries) {
        if (e.isIntersecting || e.intersectionRatio > 0) {
          visible.add(e.target);
        } else {
          visible.delete(e.target);
        }
      }
      onScroll();
    }
  
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    }
  
    function onResize() {
      elements.forEach(el => {
        const s = readSettings(el);
        if (s) {
          settingsCache.set(el, s);
        } else {
          settingsCache.delete(el);
          visible.delete(el);
        }
      });
      onScroll();
    }
  
    function update() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;

      if (visible.size) {
        visible.forEach(el => {
          const s = settingsCache.get(el);
          if (!s) return;

          const rect = el.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > windowHeight) return;

          const elementTop = rect.top + scrollTop;
          const elementHeight = rect.height || 1;
          const progress = clamp((scrollTop + windowHeight - elementTop) / (windowHeight + elementHeight), 0, 1);

          apply(el, progress, s);
        });
      }
    }
  
    function apply(el, progress, s) {
      const t = [];
      let opacity = null;
  
      if (s.vertical) {
        const y = translate(progress, s.vertical, s.speed, 50);
        if (y) t.push(`translateY(${y}px)`);
      }

      if (s.horizontal) {
        const x = translate(progress, s.horizontal, s.speed, 30);
        if (x) t.push(`translateX(${x}px)`);
      }

      if (s.rotate) {
        const r = rotate(progress, s.rotate, s.speed, 20);
        if (r) t.push(`rotate(${r}deg)`);
      }
  
      if (s.scale) {
        const k = scale(progress, s.scale, s.speed, 0.2);
        if (k !== 1) t.push(`scale(${k})`);
      }
  
      if (s.transparency) {
        opacity = alpha(progress, s.transparency, s.speed);
      }
  
      const next = {
        transform: t.length ? t.join(' ') : '',
        opacity: opacity == null ? '' : String(opacity)
      };
  
      const prev = prevStyle.get(el);
      if (!prev || prev.transform !== next.transform || prev.opacity !== next.opacity) {
        if (!prev) {
          el.style.willChange = 'transform, opacity';
          el.style.transform = next.transform;
          el.style.opacity = next.opacity;
        } else {
          if (prev.transform !== next.transform) {
            el.style.transform = next.transform;
          }
          if (prev.opacity !== next.opacity) {
            el.style.opacity = next.opacity;
          }
        }
        prevStyle.set(el, next);
      }
    }
  
    function translate(progress, dir, speed, base) {
      const intensity = base * speed;
      const offset = (progress - 0.5) * 2;
      if (dir === 'up' || dir === 'left') return -offset * intensity;
      if (dir === 'down' || dir === 'right') return offset * intensity;
      return 0;
    }
  
    function rotate(progress, dir, speed, base) {
      const intensity = base * speed;
      const offset = (progress - 0.5) * 2;
      if (dir === 'left') return -offset * intensity;
      if (dir === 'right') return offset * intensity;
      return 0;
    }
  
    function scale(progress, type, speed, base) {
      const intensity = base * speed;
      if (type === 'scale-in') return 1 + progress * intensity;
      if (type === 'scale-out') return 1 + (1 - progress) * intensity;
      return 1;
    }
  
    function alpha(progress, type, speed) {
      if (type === 'fade-in') {
        const adjustedProgress = Math.min(progress / 0.5, 1);
        return clamp(adjustedProgress, 0, 1);
      }
      if (type === 'fade-out') {
        const adjustedProgress = Math.max((progress - 0.5) / 0.5, 0);
        return clamp(1 - adjustedProgress, 0, 1);
      }
      return 1;
    }
  
    function isResponsiveEnabled(responsive) {
      const w = window.innerWidth;
      const device = w <= 768 ? 'mobile' : w <= 1024 ? 'tablet' : 'desktop';
      return responsive.split(',').includes(device);
    }
  
    function clamp(v, min, max) {
      return v < min ? min : v > max ? max : v;
    }
  
    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
  })();
  
  