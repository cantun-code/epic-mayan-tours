/* ============================================================
   Epic Mayan Tours — app.js
   Responsibilities:
     1. Service Worker registration
     2. PWA install prompt (beforeinstallprompt)
     3. SW update detection → update toast
     4. Header scroll effect
     5. IntersectionObserver → fade-in animations
     6. Lightbox2 configuration
     7. Smooth scroll for nav links
============================================================ */

'use strict';

/* ── 1. Service Worker Registration ────────────────────────── */
let swRegistration = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      // Detect when a new SW is waiting to activate
      swRegistration.addEventListener('updatefound', () => {
        const newWorker = swRegistration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // New version ready — show update toast
            showUpdateToast();
          }
        });
      });

      // Listen for SW postMessage (activated after skipWaiting)
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type === 'SW_UPDATED') {
          showUpdateToast();
        }
      });

    } catch (err) {
      console.error('[SW] Registration failed:', err);
    }
  });
}

/* ── 2. PWA Install Prompt ──────────────────────────────────── */
let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  showInstallBanner();
});

function showInstallBanner() {
  const banner = document.getElementById('install-banner');
  if (banner) banner.hidden = false;
}

document.addEventListener('DOMContentLoaded', () => {
  const installBtn = document.getElementById('install-btn');
  if (installBtn) {
    installBtn.addEventListener('click', async () => {
      if (!deferredInstallPrompt) return;

      deferredInstallPrompt.prompt();
      const { outcome } = await deferredInstallPrompt.userChoice;

      if (outcome === 'accepted') {
        const banner = document.getElementById('install-banner');
        if (banner) banner.hidden = true;
      }

      deferredInstallPrompt = null;
    });
  }
});

// Hide install banner once app is installed
window.addEventListener('appinstalled', () => {
  const banner = document.getElementById('install-banner');
  if (banner) banner.hidden = true;
  deferredInstallPrompt = null;
});

/* ── 3. Update Toast ────────────────────────────────────────── */
function showUpdateToast() {
  const toast = document.getElementById('update-toast');
  if (toast) toast.hidden = false;
}

// Called by the "Refresh" button inside the update toast (index.html)
function applyUpdate() {
  const toast = document.getElementById('update-toast');
  if (toast) toast.hidden = true;

  if (swRegistration?.waiting) {
    // Tell the waiting SW to skip waiting
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  // Reload once the new SW takes control
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  }, { once: true });
}

// Expose to global scope (called inline from index.html button)
window.applyUpdate = applyUpdate;

/* ── 4. Header Scroll Effect ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
});

/* ── 5. IntersectionObserver — Fade-in ──────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const fadeEls = document.querySelectorAll('.fade-in');
  if (!fadeEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once only
        }
      });
    },
    {
      threshold: 0.12,      // trigger when 12% of element is visible
      rootMargin: '0px 0px -40px 0px'
    }
  );

  fadeEls.forEach(el => observer.observe(el));
});

/* ── 6. Lightbox2 Configuration ─────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lightbox === 'undefined') return;

  lightbox.option({
    resizeDuration      : 220,
    fadeDuration        : 280,
    imageFadeDuration   : 240,
    wrapAround          : true,
    alwaysShowNavOnTouchDevices: false,
    albumLabel          : 'Photo %1 of %2',
    disableScrolling    : true,
    positionFromTop     : 60
  });
});

/* ── 7. Smooth Scroll for Nav Links ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();

      const headerH = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--header-h') || '72'
      );

      const top = target.getBoundingClientRect().top +
                  window.scrollY -
                  headerH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
});
