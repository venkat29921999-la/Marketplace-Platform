/* Stackly — login, signup and role dashboards (front-end demo: data lives in localStorage) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const get = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const seeds = [
    { name: 'Admin', email: 'admin@stackly.com', pass: 'admin123', role: 'admin' },
    { name: 'Riya Sharma', email: 'user@stackly.com', pass: 'user123', role: 'user' }
  ];
  const users = () => { const u = get('stk_users', []); seeds.forEach(s => u.some(x => x.email === s.email) || u.push(s)); return u; };
  const DASH = { admin: 'admin-dashboard.html', user: 'user-dashboard.html' };
  const BRAND = '<img src="Assest/logo.webp" width="229" height="58" alt="Stackly" onerror="this.replaceWith(\'Stackly\')">';
  $$('[data-brand]').forEach(e => { e.innerHTML = BRAND; e.setAttribute('aria-label', 'Stackly home'); });
  const page = document.body.dataset.page;

  /* ---------- shared form helpers ---------- */
  const say = (f, t, k) => {
    const m = $('.msg', f); m.className = 'msg show ' + k;
    m.innerHTML = '<i class="fa-solid ' + (k === 'ok' ? 'fa-circle-check' : 'fa-circle-exclamation') + '"></i><span></span>';
    m.lastChild.textContent = t;
  };
  const val = f => {
    const i = $('input', f);
    const ok = i.checkValidity() && i.value.trim() !== '' && (!i.dataset.match || i.value === $(i.dataset.match).value);
    f.classList.toggle('invalid', !ok); return ok;
  };
  const wire = (form, go) => {
    const fs = $$('.field', form);
    fs.forEach(f => { const i = $('input', f); i.addEventListener('blur', () => val(f)); i.addEventListener('input', () => f.classList.contains('invalid') && val(f)); });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const r = fs.map(val);
      if (r.every(Boolean)) go(form);
      else { $('input', fs[r.indexOf(false)]).focus(); form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake'); }
    });
  };
  $$('.eye').forEach(b => b.addEventListener('click', () => {
    const i = $('input', b.parentElement), show = i.type === 'password';
    i.type = show ? 'text' : 'password'; b.firstChild.className = 'fa-regular ' + (show ? 'fa-eye-slash' : 'fa-eye');
    b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  }));
  const go = (btn, url) => { btn.classList.add('load'); setTimeout(() => location.href = url, 900); };

  /* ---------- login ---------- */
  if (page === 'login') {
    const f = $('#form'); let flash = null;
    try { flash = sessionStorage.getItem('stk_flash'); sessionStorage.removeItem('stk_flash'); } catch (e) {}
    if (flash) say(f, flash, 'ok');
    $$('[data-fill]').forEach(b => b.addEventListener('click', () => {
      const s = seeds[+b.dataset.fill];
      $('#email').value = s.email; $('#pass').value = s.pass; $('input[value=' + s.role + ']', f).checked = true;
      $$('.field', f).forEach(x => x.classList.remove('invalid'));
    }));
    wire(f, () => {
      const em = $('#email').value.trim().toLowerCase(), role = $('input[name=role]:checked', f).value;
      const known = users().find(x => x.email === em);
      const nm = known ? known.name : em.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const u = { name: nm, email: em, role };
      put('stk_session', { name: u.name, email: u.email, role: u.role });
      say(f, 'Welcome back, ' + u.name.split(' ')[0] + '! Opening your dashboard…', 'ok');
      go($('.btn', f), DASH[u.role]);
    });
  }

  /* ---------- signup ---------- */
  if (page === 'signup') {
    const f = $('#form');
    wire(f, () => {
      const em = $('#email').value.trim().toLowerCase();
      /* same email again: no "already exists" message, just update that account and continue */
      const list = get('stk_users', []);
      const acc = { name: $('#name').value.trim(), email: em, pass: $('#pass').value, role: $('input[name=role]:checked', f).value };
      const at = list.findIndex(x => x.email === em);
      if (at > -1) list[at] = acc; else list.push(acc);
      put('stk_users', list);
      try { sessionStorage.setItem('stk_flash', 'Account created! Please log in to continue.'); } catch (e) {}
      say(f, 'Account created! Taking you to login…', 'ok');
      go($('.btn', f), 'login.html');
    });
  }

  /* ---------- dashboards ---------- */
  if (page !== 'dash') return;
  const role = document.body.dataset.role, S = get('stk_session', null);
  if (!S || S.role !== role) { location.replace('login.html'); return; }
  const admin = role === 'admin';
  const C = admin ? {
    greet: 'Here is what is happening across the marketplace today.',
    stats: [['fa-users', 'Total users', 1240 + users().length, '', '', 0, '+12% this month'], ['fa-sack-dollar', 'Revenue', 84.2, '$', 'K', 1, '+8.4% this week'], ['fa-box', 'Orders', 3912, '', '', 0, '+5.1% today'], ['fa-headset', 'Open tickets', 18, '', '', 0, '4 need a reply']],
    chart: ['Sales, last 12 months', [38, 52, 47, 63, 58, 71, 66, 82, 77, 90, 84, 96]],
    mails: [
      ['Maya Fernandez', 'maya@northgrove.com', 'Payout delayed for order #4821', 'Hi team,\nMy payout for order #4821 still shows as pending after 5 days. Could you check the escrow status?\n\nThanks,\nMaya', '8m'],
      ['Stackly Security', 'security@stackly.com', 'New admin login from Chennai', 'A new sign-in to your admin account was detected.\nIf this was you, no action is needed.', '1h'],
      ['Tomás Aguilar', 'tomas@mail.com', 'Refund request: wrong size', 'The seller shipped the wrong size. I have uploaded photos to the dispute. Please advise on the next step.', '3h'],
      ['Voltline Support', 'help@voltline.com', 'Bulk listing import ready', 'Your CSV import of 240 listings finished with 3 warnings. Review them in the seller console.', 'Yesterday'],
      ['Elena Voss', 'elena@marigold.com', 'Feature request: scheduled listings', 'Love the new builder! It would help to schedule listings to go live at a set time.', 'Yesterday']
    ],
    inbound: [['Priya Nair', 'priya@lens.in', 'Verification documents uploaded', 'I have re-uploaded my ID and bank proof. Please re-check my seller verification.'], ['Billing Bot', 'billing@stackly.com', 'Weekly payout report is ready', 'Total payouts this week: $12,480 across 312 sellers.'], ['Marcus Reid', 'marcus@mail.com', 'Spam seller report', 'Listing #9921 looks like a scam. Please review it.']]
  } : {
    greet: 'Your orders, wishlist and messages are all here.',
    stats: [['fa-bag-shopping', 'Orders', 12, '', '', 0, '2 on the way'], ['fa-heart', 'Wishlist', 27, '', '', 0, '3 price drops'], ['fa-wallet', 'Wallet', 142, '$', '', 0, 'Cashback ready'], ['fa-star', 'Reviews', 9, '', '', 0, 'Helpful to 214']],
    chart: ['Your spending, last 12 months', [22, 40, 18, 55, 30, 65, 28, 48, 72, 36, 58, 80]],
    mails: [
      ['Stackly Orders', 'orders@stackly.com', 'Your Halo Headphones have shipped', 'Good news! Order #5530 is on its way.\nCarrier: BlueDart. Expected delivery: Thursday.', '12m'],
      ['Mira Studio', 'mira@studio.com', 'Re: Atelier Tote colour options', 'Hi! The tote is also available in olive and cream. Happy to hold one for you for 24 hours.', '2h'],
      ['Stackly Escrow', 'escrow@stackly.com', 'Funds held safely for order #5521', 'We are holding $189.00 until you confirm delivery. Your refund window is 7 days.', '5h'],
      ['Stackly Offers', 'offers@stackly.com', 'Price drop on your wishlist item', 'The Orbit Field Watch is now 20% off. Offer ends Sunday.', 'Yesterday']
    ],
    inbound: [['Alder Peak', 'sales@alderpeak.com', 'Your offer was accepted', 'The seller accepted your offer on the Orbit Field Watch. Complete payment within 24 hours.'], ['Stackly Orders', 'orders@stackly.com', 'Order delivered', 'Your Halo Headphones were delivered. Tell us how it went by leaving a review.'], ['Rootwork', 'hi@rootwork.com', 'Thanks for your purchase', 'Your Agave in Clay Pot is being packed with extra care.']]
  };
  const list = admin
    ? users().map(u => [u.name, u.email, u.role])
    : [['Halo Over-ear Headphones', 'Order #5530 · $189', 'shipped'], ['Atelier Tote', 'Order #5521 · $128', 'in escrow'], ['Dusk Table Lamp', 'Order #5410 · $74', 'delivered'], ['Oakmoss Body Oil', 'Order #5388 · $42', 'delivered']];
  const li = (ic, t, sub, tg) => `<li><span class="av c1"><i class="fa-solid ${ic}"></i></span><div class="tx"><b>${t}</b><small>${sub}</small></div>${tg ? `<span class="tag l">${tg}</span>` : ''}</li>`;
  const bar = (l, p) => `<li class="pb"><div class="tx"><b>${l}</b><div class="pbar"><i style="--w:${p}%"></i></div></div><b>${p}%</b></li>`;
  const pick = (id, n, p, sh) => `<li><img class="pimg" src="${id.startsWith('Assest/') ? id : 'https://images.unsplash.com/' + id + '?auto=format&fm=webp&q=55&fit=crop&w=160'}" width="56" height="56" alt="" loading="lazy"><div class="tx"><b>${n}</b><small>${sh}</small></div><b>${p}</b></li>`;
  const steps = (a) => '<ol class="steps">' + ['Ordered', 'Packed', 'Shipped', 'Out for delivery', 'Delivered'].map((t, i) => `<li class="${i < a ? 'done' : i === a ? 'now' : ''}"><i>${i < a ? '<span class="fa-solid fa-check"></span>' : i + 1}</i><span>${t}</span></li>`).join('') + '</ol>';
  const blocks = admin ? [
    ['Recent activity', '<ul class="rl">' + li('fa-user-plus', 'New seller registered', 'Northgrove · 5 min ago') + li('fa-shield-halved', 'Dispute resolved', 'Order #4790 · 1 h ago', 'done') + li('fa-credit-card', 'Payout released', '$12,480 · 3 h ago') + li('fa-flag', 'Listing reported', 'Listing #9921 · 5 h ago', 'review') + '</ul>'],
    ['Top categories', '<ul class="rl">' + bar('Fashion', 82) + bar('Tech', 68) + bar('Home', 57) + bar('Beauty', 41) + '</ul>'],
    ['System status', '<ul class="rl">' + li('fa-server', 'API', 'Response time 180 ms', 'ok') + li('fa-credit-card', 'Payments', 'All gateways online', 'ok') + li('fa-envelope', 'Email delivery', 'Queue is empty', 'ok') + li('fa-magnifying-glass', 'Search', 'Slower than usual', 'watch') + '</ul>']
  ] : [
    ['Track your order', '<p class="muted">Halo Over-ear Headphones · Order #5530</p>' + steps(2) + '<p class="eta"><i class="fa-solid fa-truck-fast"></i> Arrives Thursday by 6 PM</p>'],
    ['Recommended for you', '<ul class="rl">' + pick('Assest/mp25.webp', 'Atelier Tote', '$128', 'Mira Studio') + pick('Assest/mp27.webp', 'Orbit Field Watch', '$240', 'Alder Peak') + pick('Assest/mp29.webp', 'Dusk Table Lamp', '$74', 'Marigold Goods') + '</ul>'],
    ['Offers and rewards', '<ul class="rl">' + li('fa-heart', 'Orbit Field Watch', 'On your wishlist, now 20% off', '-20%') + li('fa-gift', 'Loyalty points', 'Earned from your last 3 orders', '240') + li('fa-shield-halved', 'Escrow protection', '$189.00 held until delivery', 'safe') + '</ul>']
  ];
  const nA = users().filter(x => x.role === 'admin').length, nU = users().length - nA;
  const wk = (arr, lab) => `<div class="bars">${arr.map((v, i) => `<span class="${i === arr.length - 1 ? 'hi' : ''}" title="${v}"><i style="--h:${v}%;--n:${i}"></i>${lab[i]}</span>`).join('')}</div>`;
  const row = (id, n, sub, pr, tg) => `<li><img class="pimg" src="${id.startsWith('Assest/') ? id : 'https://images.unsplash.com/' + id + '?auto=format&fm=webp&q=55&fit=crop&w=160'}" width="56" height="56" alt="" loading="lazy"><div class="tx"><b>${n}</b><small>${sub}</small></div><b>${pr}</b><span class="tag${tg === 'approved' ? ' l' : ''}">${tg}</span></li>`;
  const mini = (ic, v, l, e) => `<div class="sc"><i class="fa-solid ${ic}"></i><strong>${v}</strong><span>${l}</span><em>${e}</em></div>`;
  const wish = (id, n, p, sh) => `<div class="card pc"><img src="${id.startsWith('Assest/') ? id : 'https://images.unsplash.com/' + id + '?auto=format&fm=webp&q=55&fit=crop&w=500'}" width="500" height="500" alt="${n}" loading="lazy"><h3>${n}</h3><p class="muted">${sh}</p><div class="pf"><b>${p}</b><span class="tag l"><i class="fa-solid fa-heart"></i> Saved</span></div></div>`;
  const tg = (t, on) => `<label class="tg"><input type="checkbox"${on ? ' checked' : ''}><span></span>${t}</label>`;
  const settings = `<div class="cols3"><form class="card" id="sf" novalidate><h3>Profile</h3><div class="msg"></div><div class="sfields"><div class="field"><input id="sn" placeholder=" " value="${esc(S.name)}" required><label for="sn">Full name</label><i class="fa-solid fa-user"></i></div><div class="field"><input id="se" placeholder=" " value="${esc(S.email)}" readonly><label for="se">Email address</label><i class="fa-solid fa-envelope"></i></div><p class="muted">Account type: <span class="tag l">${role}</span></p><button class="btn btn-dark" type="submit"><span>Save changes</span><i class="fa-solid fa-check"></i></button></div></form>
    <div class="card"><h3>Notifications</h3><div class="sfields">${tg('Email alerts for new messages', 1)}${tg(admin ? 'Daily platform summary' : 'Order and shipping updates', 1)}${tg(admin ? 'Report and dispute alerts' : 'Price drops on my wishlist', 1)}${tg('Product news and tips', 0)}</div></div>
    <div class="card"><h3>Security</h3><div class="sfields">${tg('Two-step verification', 0)}${tg('Login alerts for new devices', 1)}<p class="muted">Last sign-in: today, this device.</p></div></div></div>`;
  const extras = admin ? [
    ['ana', 'Insights', 'Analytics', `<div class="stats4">${mini('fa-eye', '48.2K', 'Visitors this week', '+9.3%')}${mini('fa-percent', '3.8%', 'Conversion rate', '+0.4 pts')}${mini('fa-receipt', '$62', 'Average order value', '+$3')}${mini('fa-rotate-left', '1.2%', 'Refund rate', '-0.2 pts')}</div><div class="cols"><div class="card"><h3>Weekly traffic</h3>${wk([45, 62, 58, 74, 81, 93, 70], 'MTWTFSS')}</div><div class="card"><h3>Top sellers</h3><ul class="rl">${bar('Mira Studio', 88)}${bar('Voltline', 74)}${bar('Alder Peak', 63)}${bar('Rootwork', 49)}</ul></div></div>`],
    ['prod', 'Catalogue', 'Listings', `<div class="chips"><span>Live <b>1,284</b></span><span>Pending <b>37</b></span><span>Rejected <b>12</b></span></div><div class="card"><ul class="rl">${row('Assest/mp25.webp', 'Atelier Tote', 'Mira Studio', '$128', 'approved')}${row('Assest/mp26.webp', 'Halo Over-ear Headphones', 'Voltline', '$189', 'approved')}${row('Assest/mp28.webp', 'Rangefinder 35 Camera', 'Lumen & Co', '$460', 'pending')}${row('Assest/mp29.webp', 'Dusk Table Lamp', 'Marigold Goods', '$74', 'pending')}${row('Assest/mp31.webp', 'Oakmoss Body Oil', 'Northgrove', '$42', 'approved')}</ul></div>`],
    ['set', 'Account', 'Settings', settings]
  ] : [
    ['wish', 'Saved items', 'Wishlist', `<div class="cols3">${wish('Assest/mp25.webp', 'Atelier Tote', '$128', 'Mira Studio')}${wish('Assest/mp27.webp', 'Orbit Field Watch', '$240', 'Alder Peak · 20% off')}${wish('Assest/mp29.webp', 'Dusk Table Lamp', '$74', 'Marigold Goods')}${wish('Assest/mp28.webp', 'Rangefinder 35 Camera', '$460', 'Lumen & Co')}${wish('Assest/mp31.webp', 'Oakmoss Body Oil', '$42', 'Northgrove')}${wish('Assest/mp26.webp', 'Halo Headphones', '$189', 'Voltline')}</div>`],
    ['wal', 'Payments', 'Wallet', `<div class="hello"><div><p class="muted">Available balance</p><h2>$142.00</h2></div><div class="chips" style="margin:0"><span>Cashback <b>$18</b></span><span>Points <b>240</b></span></div></div><h3 class="sh">Recent transactions</h3><div class="card"><ul class="rl">${li('fa-bag-shopping', 'Halo Headphones', 'Escrow payment · Order #5530', '-$189')}${li('fa-gift', 'Cashback credited', 'Order #5410', '+$4')}${li('fa-rotate-left', 'Refund received', 'Order #5301', '+$42')}${li('fa-wallet', 'Wallet top-up', 'UPI', '+$200')}</ul></div>`],
    ['set', 'Account', 'Settings', settings]
  ];
  const extraNav = admin ? [['ana', 'fa-chart-line', 'Analytics'], ['prod', 'fa-boxes-stacked', 'Listings'], ['set', 'fa-gear', 'Settings']] : [['wish', 'fa-heart', 'Wishlist'], ['wal', 'fa-wallet', 'Wallet'], ['set', 'fa-gear', 'Settings']];
  const NAV = [['ov', 'fa-table-cells-large', 'Overview'], ['mail', 'fa-envelope', 'Inbox'], ['list', admin ? 'fa-users' : 'fa-bag-shopping', admin ? 'Users' : 'My orders']].concat(extraNav);
  let nid = 1, M = C.mails.map(m => ({ id: nid++, from: m[0], mail: m[1], sub: m[2], body: m[3], t: m[4], f: 'inbox', read: false, star: false }));
  M[M.length - 1].read = M[M.length - 2].read = true;
  let tab = 'inbox', cur = null, q = '';

  $('#app').innerHTML = `
  <div class="dash">
    <aside class="side" id="side" aria-label="Sidebar">
      <a class="brand" data-brand href="${DASH[role]}">${BRAND}</a>
      <span class="role-tag">${role}</span>
      <nav>${NAV.map((n, i) => `<button type="button" data-v="${n[0]}"${i ? '' : ' class="on"'}><i class="fa-solid ${n[1]}"></i>${n[2]}${n[0] === 'mail' ? '<span class="nb" id="nb">0</span>' : ''}</button>`).join('')}</nav>
      <div class="side-foot"><a href="index.html"><i class="fa-solid fa-house"></i>Back to home</a><button type="button" id="out"><i class="fa-solid fa-right-from-bracket"></i>Log out</button></div>
    </aside>
    <div class="scrim" id="scrim"></div>
    <main class="main">
      <header class="top">
        <button class="menu-btn" id="mb" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
        <label class="sbox"><i class="fa-solid fa-magnifying-glass"></i><input id="q" type="search" placeholder="Search emails…" aria-label="Search emails"></label>
        <div class="me"><span class="av">${esc(S.name[0])}</span><div><b>${esc(S.name)}</b><small>${role}</small></div></div>
      </header>
      <section class="view on" id="v-ov">
        <p class="kick">Dashboard</p>
        <div class="hello rise"><div><h2>Hello, <em>${esc(S.name.split(' ')[0])}.</em></h2><p>${C.greet}</p></div><button class="btn btn-primary" type="button" data-v="mail"><span>Open inbox</span><i class="fa-solid fa-arrow-right"></i></button></div>
        <h3 class="sh">Key metrics</h3>
        <div class="stats4">${C.stats.map((s, i) => `<div class="sc rise" style="--i:${i + 1}"><i class="fa-solid ${s[0]}"></i><strong class="cnt" data-v="${s[2]}" data-p="${s[3]}" data-s="${s[4]}" data-d="${s[5]}">0</strong><span>${s[1]}</span><em>${s[6]}</em></div>`).join('')}</div>
        <h3 class="sh">Performance and latest emails</h3>
        <div class="cols">
          <div class="card rise" style="--i:5"><h3>${C.chart[0]}</h3><div class="bars">${C.chart[1].map((v, i) => `<span class="${i === 11 ? 'hi' : ''}" title="${v}"><i style="--h:${v}%;--n:${i}"></i>${'JFMAMJJASOND'[i]}</span>`).join('')}</div></div>
          <div class="card rise" style="--i:6"><h3>Latest emails <button type="button" data-v="mail">View all</button></h3><ul class="rl" id="lat"></ul></div>
        </div>
        <h3 class="sh">${admin ? 'Platform health' : 'Your activity'}</h3>
        <div class="cols3">${blocks.map((b, i) => `<div class="card rise" style="--i:${i + 7}"><h3>${b[0]}</h3>${b[1]}</div>`).join('')}</div>
      </section>
      <section class="view" id="v-mail">
        <p class="kick">Messages</p><h2 class="vt">Inbox</h2><p class="muted" style="margin:-14px 0 18px">Read, reply, star and compose emails. New messages appear here live.</p>
        <div class="tabs"><button class="t on" data-t="inbox" type="button">Inbox <small id="nIn"></small></button><button class="t" data-t="starred" type="button">Starred</button><button class="t" data-t="sent" type="button">Sent</button><button class="btn btn-primary btn-sm" id="cmp" type="button"><i class="fa-solid fa-pen"></i><span>Compose</span></button></div>
        <div class="mail"><div class="ml" id="ml"></div><div class="rd" id="rd"></div></div>
      </section>
      <section class="view" id="v-list">
        <p class="kick">${admin ? 'Management' : 'Shopping'}</p><h2 class="vt">${admin ? 'Registered users' : 'My orders'}</h2>
        <div class="chips">${admin ? `<span>Total <b>${list.length}</b></span><span>Admins <b>${nA}</b></span><span>Users <b>${nU}</b></span>` : '<span>Total <b>12</b></span><span>In transit <b>2</b></span><span>Delivered <b>9</b></span><span>Returned <b>1</b></span>'}</div>
        <h3 class="sh" style="margin-top:6px">${admin ? 'All users' : 'Order history'}</h3>
        <div class="card"><ul class="rl">${list.map(l => `<li class="rise"><span class="av ${admin ? '' : 'c1'}">${esc(l[0][0])}</span><div class="tx"><b>${esc(l[0])}</b><small>${esc(l[1])}</small></div><span class="tag${l[2] === 'user' || l[2] === 'delivered' ? ' l' : ''}">${esc(l[2])}</span></li>`).join('')}</ul></div>
      </section>
      ${extras.map(x => `<section class="view" id="v-${x[0]}"><p class="kick">${x[1]}</p><h2 class="vt">${x[2]}</h2>${x[3]}</section>`).join('')}
    </main>
  </div>
  <div class="toast" id="toast" role="status" aria-live="polite"></div>`;

  /* navigation + hamburger */
  const side = $('#side'), scrim = $('#scrim'), mb = $('#mb');
  const drawer = o => { side.classList.toggle('open', o); scrim.classList.toggle('show', o); mb.setAttribute('aria-expanded', o); document.documentElement.style.overflow = o ? 'hidden' : ''; };
  mb.onclick = () => drawer(!side.classList.contains('open')); scrim.onclick = () => drawer(false);
  addEventListener('keydown', e => e.key === 'Escape' && drawer(false));
  addEventListener('resize', () => innerWidth > 980 && drawer(false));
  const show = v => {
    $$('.view').forEach(x => x.classList.toggle('on', x.id === 'v-' + v));
    $$('.side nav button').forEach(b => b.classList.toggle('on', b.dataset.v === v));
    drawer(false); scrollTo({ top: 0 });
    $$('#v-' + v + ' .rise').forEach(e => { e.style.animation = 'none'; void e.offsetWidth; e.style.animation = ''; });
    if (v === 'ov') $$('.cnt').forEach(count);
  };
  document.addEventListener('click', e => { const b = e.target.closest('[data-v]:not(.cnt)'); if (b) show(b.dataset.v); });
  /* Any button / link inside the page CONTENT (not the sidebar or top bar) opens 404.html */
  const to404 = () => { location.href = '404.html'; };
  document.addEventListener('click', e => {
    const hit = e.target.closest('.main .view button, .main .view .btn, .main .view a');
    if (!hit) return;
    /* the Inbox (tabs, open message, star, reply, compose) and the buttons that open it keep working */
    if (hit.closest('#v-mail') || hit.closest('[data-open], [data-v="mail"]')) return;
    e.preventDefault(); e.stopImmediatePropagation(); to404();
  }, true);
  /* pressing Enter inside a content form must do the same */
  document.addEventListener('submit', e => {
    if (!e.target.closest('.main .view') || e.target.closest('#v-mail')) return;
    e.preventDefault(); e.stopImmediatePropagation(); to404();
  }, true);
  $('#out').onclick = () => { try { localStorage.removeItem('stk_session'); } catch (e) {} location.href = 'login.html'; };
  const count = el => {
    const v = +el.dataset.v, d = +el.dataset.d, t0 = performance.now();
    const f = t => { const p = Math.min((t - t0) / 1400, 1), k = 1 - Math.pow(1 - p, 3); el.textContent = el.dataset.p + (v * k).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) + el.dataset.s; if (p < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  };
  $$('.cnt').forEach(count);

  const sf = $('#sf');
  sf.addEventListener('submit', e => {
    e.preventDefault(); const n = $('#sn').value.trim();
    if (!n) return say(sf, 'Please enter your name.', 'err');
    S.name = n; put('stk_session', S); $('.me b').textContent = n; $('.me .av').textContent = n[0]; say(sf, 'Settings saved.', 'ok');
  });
  /* mail: dynamic list, reader, compose, live arrivals */
  const toastEl = $('#toast'); let tt;
  const toast = m => { toastEl.innerHTML = '<i class="fa-solid fa-envelope"></i><span></span>'; toastEl.lastChild.textContent = m; toastEl.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove('show'), 3000); };
  const av = m => `<span class="av c${m.id % 4}">${esc(m.from[0])}</span>`;
  const render = () => {
    const L = M.filter(m => (tab === 'starred' ? m.star : m.f === tab) && (m.from + ' ' + m.sub + ' ' + m.body).toLowerCase().includes(q));
    $('#ml').innerHTML = L.length ? L.map((m, i) => `<button type="button" class="mi${m.read ? '' : ' unread'}${m.id === cur ? ' on' : ''}${m.fresh ? ' fresh' : ''}" data-id="${m.id}" style="animation-delay:${Math.min(i, 8) * 45}ms">${av(m)}<span class="mt"><b>${esc(m.f === 'sent' ? 'To: ' + m.from : m.from)}</b><span>${esc(m.sub)}</span><small>${esc(m.body)}</small></span><span class="mm"><time>${esc(m.t)}</time>${m.star ? '<i class="fa-solid fa-star on"></i>' : ''}</span></button>`).join('') : '<div class="empty"><i class="fa-regular fa-envelope-open"></i><p>No emails here.</p></div>';
    const un = M.filter(m => m.f === 'inbox' && !m.read).length;
    $('#nb').textContent = un; $('#nb').hidden = !un; $('#nIn').textContent = un ? '(' + un + ')' : '';
    const inb = M.filter(m => m.f === 'inbox').slice(0, 4);
    $('#lat').innerHTML = inb.map(m => `<li class="${m.fresh ? 'fresh' : ''}">${av(m)}<button type="button" class="tx" data-open="${m.id}"><b>${esc(m.sub)}</b><small>${esc(m.from)} · ${esc(m.t)}</small></button>${m.read ? '' : '<span class="tag l">new</span>'}</li>`).join('');
  };
  const blank = () => { cur = null; $('#rd').classList.remove('show'); $('#rd').innerHTML = '<div class="empty"><i class="fa-regular fa-envelope"></i><p>Select an email to read it,<br>or compose a new one.</p></div>'; };
  const back = '<button class="rd-back" type="button" data-a="close"><i class="fa-solid fa-arrow-left"></i>Back to inbox</button>';
  const openMail = id => {
    const m = M.find(x => x.id === id); if (!m) return;
    cur = id; m.read = true; m.fresh = false;
    $('#rd').innerHTML = `${back}<div class="rd-h">${av(m).replace('class="av', 'class="big av')}<div><h2>${esc(m.sub)}</h2><p><b>${esc(m.f === 'sent' ? 'To: ' + m.from : m.from)}</b> · ${esc(m.mail)} · ${esc(m.t)}</p></div></div><div class="rd-b">${esc(m.body).replace(/\n/g, '<br>')}</div><div class="rd-a"><button class="btn btn-dark btn-sm" type="button" data-a="reply"><i class="fa-solid fa-reply"></i><span>Reply</span></button><button class="btn btn-ghost-dk btn-sm" type="button" data-a="star"><i class="fa-regular fa-star"></i><span>${m.star ? 'Unstar' : 'Star'}</span></button><button class="btn btn-ghost-dk btn-sm" type="button" data-a="del"><i class="fa-regular fa-trash-can"></i><span>Delete</span></button></div><div id="rp"></div>`;
    $('#rd').classList.add('show'); render();
  };
  const sendMail = (to, mail, sub, body) => { M.unshift({ id: nid++, from: to, mail, sub, body, t: 'Just now', f: 'sent', read: true, star: false }); };
  const form = (fields, label) => `<form class="rd-f" id="rf" novalidate><div class="msg"></div>${fields}<textarea id="rb" rows="6" placeholder="Write your message…" aria-label="Message" required></textarea><button class="btn btn-primary" type="submit"><span>${label}</span><i class="fa-solid fa-paper-plane"></i></button></form>`;
  $('#v-mail').addEventListener('click', e => {
    const t = e.target.closest('[data-t]'), mi = e.target.closest('.mi'), a = e.target.closest('[data-a]');
    if (t) { tab = t.dataset.t; $$('.tabs .t').forEach(x => x.classList.toggle('on', x === t)); blank(); render(); }
    else if (mi) openMail(+mi.dataset.id);
    else if (e.target.closest('#cmp')) {
      cur = null; render(); $('#rd').classList.add('show');
      $('#rd').innerHTML = back + '<h2 class="vt" style="margin-top:0">New email</h2>' + form('<input id="rt" type="email" placeholder="To (email address)" aria-label="To" required><input id="rs" placeholder="Subject" aria-label="Subject" required>', 'Send email');
    } else if (a) {
      const m = M.find(x => x.id === cur), k = a.dataset.a;
      if (k === 'close') { $('#rd').classList.remove('show'); }
      if (k === 'star' && m) { m.star = !m.star; openMail(cur); }
      if (k === 'del' && m) { M.splice(M.indexOf(m), 1); blank(); render(); }
      if (k === 'reply' && m) { $('#rp').innerHTML = form('', 'Send reply'); $('#rb').focus(); }
    }
  });
  $('#v-mail').addEventListener('submit', e => {
    e.preventDefault(); const f = e.target, body = $('#rb').value.trim(), m = M.find(x => x.id === cur);
    const bad = !body || ($('#rt') && (!$('#rt').checkValidity() || !$('#rs').value.trim()));
    if (bad) return say(f, $('#rt') ? 'Enter a valid email, a subject and a message.' : 'Write a message first.', 'err');
    if ($('#rt')) { sendMail($('#rt').value.trim(), $('#rt').value.trim(), $('#rs').value.trim(), body); tab = 'sent'; $$('.tabs .t').forEach(x => x.classList.toggle('on', x.dataset.t === 'sent')); blank(); render(); toast('Email sent'); }
    else { f.reset(); location.href = '404.html'; }   /* valid reply: empty the field, then go to the 404 page */
  });
  /* coming back from 404.html (Back button / bfcache): reply & compose fields must be empty */
  addEventListener('pageshow', () => { $$('#v-mail textarea, #v-mail #rt, #v-mail #rs').forEach(x => { x.value = ''; }); $$('#v-mail .msg').forEach(m => { m.className = 'msg'; m.innerHTML = ''; }); });
  document.addEventListener('click', e => { const o = e.target.closest('[data-open]'); if (o) { show('mail'); tab = 'inbox'; $$('.tabs .t').forEach(x => x.classList.toggle('on', x.dataset.t === 'inbox')); openMail(+o.dataset.open); } });
  $('#q').addEventListener('input', e => { q = e.target.value.trim().toLowerCase(); if (!$('#v-mail').classList.contains('on')) show('mail'); render(); });
  let n = 0;
  const live = setInterval(() => {
    const m = C.inbound[n++]; if (!m) return clearInterval(live);
    M.unshift({ id: nid++, from: m[0], mail: m[1], sub: m[2], body: m[3], t: 'Just now', f: 'inbox', read: false, star: false, fresh: true });
    render(); toast('New email from ' + m[0]);
  }, 16000);
  blank(); render();
})();