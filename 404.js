/* Stackly 404 — smart back button, parallax and particles */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);

  // 1. Show the address that was not found
  const p = decodeURIComponent(location.pathname.replace(/\/+$/, '').split('/').pop() || '/');
  $('#path').textContent = (p === '/' ? '/' : '/' + p) + location.search;

  // 2. "Back to previous page": go back in history; fall back to the right start page if there is none
  let S = null;
  try { S = JSON.parse(localStorage.getItem('stk_session')); } catch (e) {}
  const DASH = { admin: 'admin-dashboard.html', user: 'user-dashboard.html' };
  const back = $('#backPage');
  let ref = '';
  try { ref = document.referrer && new URL(document.referrer).origin === location.origin ? document.referrer : ''; } catch (e) {}
  back.href = ref || (S && DASH[S.role]) || 'login.html';
  back.addEventListener('click', e => {
    if (ref && history.length > 1) { e.preventDefault(); history.back(); }
  });
  if (S && DASH[S.role]) {
    const who = $('#who');
    who.hidden = false;
    who.innerHTML = 'Signed in as <b></b> (' + S.role + ')';
    who.querySelector('b').textContent = S.name || S.email;
  }

  // 3. Floating particles
  const dust = $('#dust'), n = innerWidth < 640 ? 14 : 28;
  for (let i = 0; i < n; i++) {
    const s = document.createElement('span'), z = 3 + Math.random() * 6;
    s.style.cssText = 'left:' + Math.random() * 100 + '%;width:' + z + 'px;height:' + z + 'px;animation-duration:' + (9 + Math.random() * 12) + 's;animation-delay:-' + Math.random() * 20 + 's';
    dust.appendChild(s);
  }

  // 4. Mouse / touch parallax on the big 404
  const nf = $('#nf');
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    addEventListener('pointermove', e => {
      nf.style.setProperty('--mx', (e.clientX / innerWidth - .5).toFixed(3));
      nf.style.setProperty('--my', (e.clientY / innerHeight - .5).toFixed(3));
    }, { passive: true });
  }
})();