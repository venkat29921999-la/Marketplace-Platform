/* =========================================================
   STACKLY — interactions & animation
   GSAP + ScrollTrigger + Flip, AOS, IntersectionObserver
   ========================================================= */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';

  /* ---------- About page (about.html): runs only there, then stops ---------- */
  if ($('#abHero')) { aboutPage(); return; }
  if ($('#svHero')) { servicesPage(); return; }
  if ($('#blHero')) { blogPage(); return; }
  if ($('#ctHero')) { contactPage(); return; }
  function servicesPage() {
    const {$,$$,root,reduce,fine,G}=pageBase();
    /* 2 selector: panels wipe up over each other, auto-advance */
    const tabs=$$('.sv-tab'),pans=$$('.sv-pan');let cur=0,tm;
    function show(i){if(i===cur)return;pans.forEach(p=>p.classList.remove('prev'));pans[cur].classList.remove('on');pans[cur].classList.add('prev');cur=i;pans[i].classList.add('on');
      tabs.forEach((t,j)=>{t.classList.toggle('on',j===i);t.setAttribute('aria-selected',j===i)});setTimeout(()=>pans.forEach((p,j)=>j!==cur&&p.classList.remove('prev')),1050);auto()}
    function auto(){clearInterval(tm);tm=setInterval(()=>show((cur+1)%tabs.length),5500)}
    tabs.forEach((t,i)=>t.addEventListener('click',()=>show(i)));auto();
    /* 4 plans: price toggle (digits slide) + cursor spotlight */
    const tg=$('#svTog');tg.addEventListener('click',()=>{const y=tg.classList.toggle('y');tg.setAttribute('aria-checked',y);
      $$('.sv-amt').forEach(a=>{const v=y?a.dataset.y:a.dataset.m;if(G&&!reduce)gsap.to(a,{yPercent:-110,opacity:0,duration:.25,ease:'power2.in',onComplete:()=>{a.textContent=v;gsap.fromTo(a,{yPercent:110,opacity:0},{yPercent:0,opacity:1,duration:.55,ease:'expo.out'})}});else a.textContent=v})});
    $$('.sv-plan').forEach(p=>p.addEventListener('pointermove',e=>{const b=p.getBoundingClientRect();p.style.setProperty('--mx',(e.clientX-b.left)+'px');p.style.setProperty('--my',(e.clientY-b.top)+'px')}));
    /* 6 lens: coloured circle follows the pointer */
    $$('.sv-tile').forEach(t=>t.addEventListener('pointermove',e=>{const b=t.getBoundingClientRect();t.style.setProperty('--x',(e.clientX-b.left)+'px');t.style.setProperty('--y',(e.clientY-b.top)+'px')}));
    /* 7 accordion */
    $$('.sv-q button').forEach(b=>b.addEventListener('click',()=>{const q=b.parentElement,o=!q.classList.contains('open');$$('.sv-q').forEach(x=>{x.classList.remove('open');$('button',x).setAttribute('aria-expanded','false')});q.classList.toggle('open',o);b.setAttribute('aria-expanded',o)}));
    if(!G||reduce)return;
    const rnd=(a,b)=>a+Math.random()*(b-a);
    /* 1 hero: shutter blinds drop in; headline words swing in from alternating sides */
    const ti=$('#svTitle'),tx=ti.textContent;ti.setAttribute('aria-label',tx);ti.innerHTML=tx.split(' ').map(w=>`<span class="sv-w" aria-hidden="true">${w}</span>`).join(' ');
    gsap.timeline({defaults:{ease:'expo.out'}}).from('.sv-blinds span',{scaleY:0,duration:1.5,stagger:{each:.09,from:'center'}})
     .from('.sv-w',{xPercent:i=>i%2?60:-60,skewX:i=>i%2?-18:18,filter:'blur(12px)',opacity:0,duration:1.3,stagger:.1},0.2)
     .from('.sv-hero .lead,.sv-hero .ab-eyebrow,.sv-btns',{y:28,opacity:0,stagger:.12,duration:1},'-=.8').from('.sv-badge',{scale:0,rotation:-200,duration:1.4,ease:'back.out(1.6)'},'-=1');
    /* 3 flow: line draws, each step snaps its photo in from the side */
    gsap.fromTo('.sv-line i',{scaleY:0},{scaleY:1,ease:'none',scrollTrigger:{trigger:'.sv-steps',start:'top 60%',end:'bottom 60%',scrub:true}});
    $$('.sv-step').forEach((s,i)=>{ScrollTrigger.create({trigger:s,start:'top 62%',onEnter:()=>s.classList.add('on'),onLeaveBack:()=>s.classList.remove('on')});
      gsap.fromTo($('.sv-simg',s),{clipPath:i%2?'inset(0 100% 0 0)':'inset(0 0 0 100%)'},{clipPath:'inset(0 0% 0 0%)',duration:1.4,ease:'expo.out',scrollTrigger:{trigger:s,start:'top 78%',once:true}});
      gsap.from($('.sv-stxt',s),{y:40,opacity:0,duration:1,scrollTrigger:{trigger:s,start:'top 78%',once:true}})});
    /* 5 track: parcel follows an SVG route driven by scroll */
    const path=$('#svPath'),len=path.getTotalLength(),dot=$('#svDot'),stops=$$('.sv-stop'),lis=$$('.sv-stage-list li'),eta=$('#svEta'),fr=[0,.3,.55,.8,1];
    path.style.strokeDasharray=len;path.style.strokeDashoffset=len;
    stops.forEach((s,i)=>{const p=path.getPointAtLength(len*fr[i]);s.setAttribute('transform',`translate(${p.x},${p.y})`)});
    const p0=path.getPointAtLength(0);dot.setAttribute('transform',`translate(${p0.x},${p0.y})`);
    ScrollTrigger.create({trigger:'#svTrack',start:'top 55%',end:'bottom 75%',scrub:true,onUpdate:s=>{const p=s.progress,pt=path.getPointAtLength(len*p);
      dot.setAttribute('transform',`translate(${pt.x},${pt.y})`);path.style.strokeDashoffset=len*(1-p);lis.forEach((l,i)=>l.classList.toggle('on',p>=fr[i]-.02));
      const m=Math.round(18*(1-p));eta.textContent=m>0?m+' min':'Delivered'}});
    /* 6 kit: tiles rise from a tilted plane */
    gsap.from('.sv-tile',{y:90,rotateX:-25,transformPerspective:900,opacity:0,duration:1.3,ease:'expo.out',stagger:.12,scrollTrigger:{trigger:'.sv-bento',start:'top 80%',once:true}});
    /* 7 faq: photo frame grows from an oval while scrolling; confetti on the CTA */
    gsap.fromTo('#svFrame',{clipPath:'inset(18% 18% 18% 18% round 220px)'},{clipPath:'inset(0% 0% 0% 0% round 34px)',ease:'none',scrollTrigger:{trigger:'#svFrame',start:'top 90%',end:'center 45%',scrub:true}});
    $('#svConf').addEventListener('click',e=>{const b=e.currentTarget.getBoundingClientRect(),cx=b.left+b.width/2,cy=b.top+b.height/2,cols=['#FFB020','#F3EFE7','#0B2A25'];
      for(let i=0;i<40;i++){const c=document.createElement('i');c.className='sv-conf';c.style.cssText=`left:${cx}px;top:${cy}px;background:${cols[i%3]};border:1px solid #FFB020`;document.body.append(c);
        gsap.to(c,{x:rnd(-180,180),y:rnd(-220,-60),rotation:rnd(-540,540),duration:.7,ease:'power2.out'});gsap.to(c,{y:'+=420',opacity:0,duration:1.1,delay:.7,ease:'power1.in',onComplete:()=>c.remove()})}});
    addEventListener('load',()=>ScrollTrigger.refresh());
  }
  function pageBase() {
    const $=(s,c=document)=>c.querySelector(s),$$=(s,c=document)=>[...c.querySelectorAll(s)];
    const root=document.documentElement,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
    const G=window.gsap;if(!G){root.classList.remove('js')}else{gsap.registerPlugin(ScrollTrigger)}
    window.AOS&&AOS.init({duration:900,once:true,easing:'ease-out-cubic',disable:reduce});
    /* ---- shared: header, menu, login, newsletter ---- */
    const header=$('#siteHeader'),prog=$('#progress'),top=$('#toTop');let last=scrollY,menuOpen=false;
    addEventListener('scroll',()=>{const y=scrollY,m=root.scrollHeight-innerHeight;header.classList.toggle('is-scrolled',y>40);
     
     prog.style.transform='scaleX('+(m>0?y/m:0)+')';top.classList.toggle('show',y>900);last=y},{passive:true});
    top.onclick=()=>scrollTo({top:0,behavior:reduce?'auto':'smooth'});
    const burger=$('#burger'),menu=$('#mobileMenu');
    const setMenu=o=>{menuOpen=o;menu.classList.toggle('open',o);menu.setAttribute('aria-hidden',!o);burger.setAttribute('aria-expanded',o);root.style.overflow=o?'hidden':'';o&&header.classList.remove('is-hidden')};
    burger.onclick=()=>setMenu(!menuOpen);$$('#mobileMenu a').forEach(a=>a.onclick=()=>setMenu(false));
    addEventListener('keydown',e=>e.key==='Escape'&&menuOpen&&setMenu(false));addEventListener('resize',()=>innerWidth>980&&menuOpen&&setMenu(false));
    const dlg=$('#loginDialog');
    $$('[data-open-login]').forEach(b=>b.onclick=()=>{setMenu(false);dlg.showModal?dlg.showModal():dlg.setAttribute('open','')});
    $$('[data-close-login]').forEach(b=>b.onclick=()=>dlg.close?dlg.close():dlg.removeAttribute('open'));dlg.addEventListener('click',e=>e.target===dlg&&dlg.close());
    const lf=$('#loginForm');lf&&lf.addEventListener('submit',e=>{e.preventDefault();dlg.close&&dlg.close()});
    $('#newsForm').addEventListener('submit',e=>{e.preventDefault();const i=$('input',e.target),o=$('#newsOk');
     if(i.checkValidity()&&i.value.trim()){i.value='';o.textContent='';location.href='404.html'}else o.textContent='Please enter a valid email address.'});
    {const ni=$('#newsForm input');ni.setAttribute('autocomplete','off');ni.addEventListener('input',()=>{$('#newsOk').textContent=''});
     addEventListener('pageshow',()=>{$('#newsForm').reset();$('#newsOk').textContent=''})}
    return {$,$$,root,reduce,fine,G};
  }
  function aboutPage() {
    const {$,$$,root,reduce,fine,G}=pageBase();
    if(!G||reduce)return;
    /* 1 HERO: letters tumble in, photos fly in from random places, glow follows cursor */
    const t=$('#abTitle'),txt=t.textContent;t.setAttribute('aria-label',txt);t.innerHTML=[...txt].map(c=>c===' '?'<span class="sp"></span>':`<span class="ch" aria-hidden="true">${c}</span>`).join('');
    const r=(a,b)=>a+Math.random()*(b-a);
    gsap.timeline({defaults:{ease:'expo.out'}}).from('.ab-title .ch',{yPercent:140,rotateX:-90,rotation:()=>r(-12,12),opacity:0,duration:1.4,stagger:.025})
     .from('.ab-hero .lead,.ab-eyebrow',{y:30,opacity:0,stagger:.12,duration:1},'-=1')
     .from('.ph',{x:()=>r(-380,380),y:()=>r(-300,300),rotation:()=>r(-50,50),scale:.2,opacity:0,duration:1.8,stagger:.09},0.1);
    const hero=$('#abHero');if(fine)hero.addEventListener('pointermove',e=>{const b=hero.getBoundingClientRect();hero.style.setProperty('--mx',(e.clientX-b.left)+'px');hero.style.setProperty('--my',(e.clientY-b.top)+'px')});
    /* 2 DECK: each card sinks back and dims as the next one lands */
    const cards=$$('.ab-card');cards.forEach((c,i)=>{c.style.setProperty('--i',i);if(i<cards.length-1&&innerWidth>700)gsap.to(c,{scale:.92,yPercent:-3,filter:'brightness(.8)',ease:'none',scrollTrigger:{trigger:cards[i+1],start:'top 85%',end:'top '+(90+i*14)+'px',scrub:true}})});
    /* 3 MISSION: words light up with scroll, photo opens like an iris */
    const w=$('#abWords');w.innerHTML=w.textContent.split(' ').map(x=>`<span class="wd">${x}</span>`).join(' ');
    gsap.to('.wd',{opacity:1,stagger:.1,ease:'none',scrollTrigger:{trigger:w,start:'top 80%',end:'bottom 50%',scrub:true}});
    gsap.to('.ab-iris',{clipPath:'circle(75% at 50% 50%)',duration:1.8,ease:'expo.out',scrollTrigger:{trigger:'.ab-iris',start:'top 80%',once:true}});
    /* 4 ODOMETER: digit reels roll to their value */
    $$('.ab-odo').forEach(el=>{const v=el.dataset.v,s=el.dataset.suf||'';const reels=[];
     el.setAttribute('aria-label',(+v).toLocaleString()+s);
     [...(+v).toLocaleString('en-US')].forEach(ch=>{if(/\d/.test(ch)){const rl=document.createElement('span');rl.className='reel';rl.setAttribute('aria-hidden','true');
       rl.innerHTML='<span>'+[...Array(30)].map((_,i)=>`<b>${i%10}</b>`).join('')+'</span>';el.append(rl);reels.push([rl.firstChild,+ch])}
      else{const p=document.createElement('span');p.textContent=ch;p.setAttribute('aria-hidden','true');el.append(p)}});
     if(s){const p=document.createElement('span');p.className='st';p.textContent=s;p.setAttribute('aria-hidden','true');el.append(p)}
     reels.forEach(([x],i)=>gsap.set(x,{yPercent:0}));
     ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter:()=>reels.forEach(([x,d],i)=>gsap.to(x,{y:()=>-(20+d)*x.firstChild.offsetHeight,duration:2.2+i*.25,ease:'expo.out'}))})});
    /* 5 VALUES: cursor-following picture trail */
    const tr=$('#abTrail'),ti=$('img',tr);if(fine){const qx=gsap.quickTo(tr,'x',{duration:.6,ease:'power3'}),qy=gsap.quickTo(tr,'y',{duration:.6,ease:'power3'});
     $$('#abList li').forEach(li=>{li.addEventListener('mouseenter',()=>{ti.src=li.dataset.img;gsap.to(tr,{opacity:1,scale:1,rotation:r(-6,6),duration:.5,ease:'back.out(1.6)'})});
      li.addEventListener('mouseleave',()=>gsap.to(tr,{opacity:0,scale:.6,duration:.3}));
      li.addEventListener('mousemove',e=>{qx(e.clientX+30);qy(e.clientY-150)})});
     /* make sure the floating picture can never get "stuck" on screen */
     let lx=-1,ly=-1;
     const hideTrail=()=>gsap.to(tr,{opacity:0,scale:.6,duration:.25,overwrite:'auto'});
     const overList=()=>{const el=document.elementFromPoint(lx,ly);return !!(el&&el.closest('#abList li'))};
     addEventListener('pointermove',e=>{lx=e.clientX;ly=e.clientY},{passive:true});
     addEventListener('scroll',()=>{if(lx>=0&&!overList())hideTrail()},{passive:true});   /* scrolled away from the list */
     const lst=$('#abList');lst.addEventListener('mouseleave',hideTrail);
     document.addEventListener('mouseleave',hideTrail);
     addEventListener('blur',hideTrail);
     ScrollTrigger.create({trigger:'#abValues',start:'top bottom',end:'bottom top',onLeave:hideTrail,onLeaveBack:hideTrail})}
    /* 6 TEAM: portraits open like an iris, in a wave; tap to flip on touch */
    gsap.to('.ab-person',{clipPath:'circle(75% at 50% 50%)',duration:1.6,ease:'expo.out',stagger:.15,scrollTrigger:{trigger:'.ab-people',start:'top 80%',once:true}});
    $$('.ab-person').forEach(p=>p.addEventListener('click',()=>p.classList.toggle('flip')));
    /* 7 CTA: giant text skews with scroll speed, buttons are magnetic */
    const sk=gsap.quickTo('.ab-rows','skewX',{duration:.5,ease:'power3'});
    ScrollTrigger.create({trigger:'#abCta',start:'top bottom',end:'bottom top',onUpdate:s=>sk(gsap.utils.clamp(-14,14,s.getVelocity()/-120))});
    if(fine)$$('.ab-mag').forEach(b=>{b.addEventListener('pointermove',e=>{const k=b.getBoundingClientRect();gsap.to(b,{x:(e.clientX-k.left-k.width/2)*.3,y:(e.clientY-k.top-k.height/2)*.4,duration:.4})});b.addEventListener('pointerleave',()=>gsap.to(b,{x:0,y:0,duration:.8,ease:'elastic.out(1,.4)'}))});
    addEventListener('load',()=>ScrollTrigger.refresh());
  }

  /* ---------- Contact page (contact.html): runs only there, then stops ---------- */
  function contactPage() {
    const {$,$$,root,reduce,fine,G}=pageBase();
    const anim=G&&!reduce,rnd=(a,b)=>a+Math.random()*(b-a);
    const toastEl=$('#toast');let tt;
    const toast=(m,ic='fa-circle-check')=>{toastEl.innerHTML='<i class="fa-solid '+ic+'"></i><span></span>';toastEl.lastChild.textContent=m;toastEl.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>toastEl.classList.remove('show'),2400)};
    /* copy buttons (channels + promo code) */
    $$('[data-copy]').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const t=b.dataset.copy;
      const fb=()=>{const a=document.createElement('textarea');a.value=t;a.style.cssText='position:fixed;opacity:0';document.body.append(a);a.select();try{document.execCommand('copy');toast('Copied: '+t,'fa-copy')}catch(_){toast('Press Ctrl+C to copy','fa-copy')}a.remove()};
      navigator.clipboard?navigator.clipboard.writeText(t).then(()=>toast('Copied: '+t,'fa-copy'),fb):fb()}));

    /* 1 HERO: typed word, pointer glow, radar tilt */
    const sw=$('#ctSwap'),words=['selling.','shipping.','buying.','partnering.'];let wi=0,ci=words[0].length,del=false;
    if(!reduce){const tick=()=>{const w=words[wi];ci+=del?-1:1;sw.textContent=w.slice(0,ci);let d=del?38:85;
      if(!del&&ci===w.length){del=true;d=1700}else if(del&&ci===0){del=false;wi=(wi+1)%words.length;d=320}setTimeout(tick,d)};setTimeout(tick,1800)}
    const hero=$('#ctHero');
    if(fine&&!reduce){hero.addEventListener('pointermove',e=>{const b=hero.getBoundingClientRect(),nx=(e.clientX-b.left)/b.width-.5,ny=(e.clientY-b.top)/b.height-.5;
      hero.style.setProperty('--mx',(e.clientX-b.left)+'px');hero.style.setProperty('--my',(e.clientY-b.top)+'px');
      hero.style.setProperty('--ty',(nx*14)+'deg');hero.style.setProperty('--tx',(-ny*12)+'deg')});
      hero.addEventListener('pointerleave',()=>{hero.style.setProperty('--ty','0deg');hero.style.setProperty('--tx','0deg')})}

    /* 2 CHANNELS: tap to fill (hover handled in CSS) */
    const chs=$$('.ct-ch');
    chs.forEach(c=>{c.addEventListener('click',e=>{if(e.target.closest('a,button'))return;const o=!c.classList.contains('on');chs.forEach(x=>x.classList.remove('on'));c.classList.toggle('on',o)});
      c.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target===c)c.click()})});

    /* 3 FORM: paper plane flies a path as the steps advance */
    const fe=$('#ctFormEl'),card=$('#ctCard'),steps=$$('.ct-step',fe),stops=$$('.ct-stops span'),back=$('#ctBack'),nxt=$('#ctNext'),snd=$('#ctSend');
    const path=$('#ctPath'),plane=$('#ctPlane'),len=path.getTotalLength(),pr={v:0},ns='http://www.w3.org/2000/svg';let si=0;
    path.style.strokeDasharray=len;
    const sd=[0,.5,1].map(f=>{const p=path.getPointAtLength(len*f),c=document.createElementNS(ns,'circle');c.setAttribute('class','ct-sdot');c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r',6);$('#ctFly').before(c);return c});
    const place=p=>{const a=path.getPointAtLength(len*p),b=path.getPointAtLength(Math.min(len,len*p+1)),ang=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
      plane.setAttribute('transform','translate('+a.x+','+a.y+') rotate('+ang+')');path.style.strokeDashoffset=len*(1-p);sd.forEach((c,i)=>c.classList.toggle('on',p>=i/2-.01))};
    const go=(p,fast)=>{if(anim&&!fast)gsap.to(pr,{v:p,duration:1.1,ease:'power3.inOut',onUpdate:()=>place(pr.v)});else{pr.v=p;place(p)}};
    place(0);
    const val=f=>{const el=$('input,textarea',f),v=el.checkValidity()&&el.value.trim()!=='';f.classList.toggle('invalid',!v);return v};
    const okStep=i=>{if(i===0){const k=$('input[name=topic]:checked',fe);$('#ctTerr').classList.toggle('show',!k);return !!k}
      if(i===1)return $$('.field',steps[1]).map(val).every(Boolean);return val($('#ctMsgF'))};
    const buzz=()=>{card.classList.remove('shake');void card.offsetWidth;card.classList.add('shake')};
    function show(n,dir,focus){steps[si].classList.remove('on');si=n;steps[n].style.setProperty('--d',dir);steps[n].classList.add('on');
      stops.forEach((s,i)=>s.classList.toggle('on',i<=n));back.hidden=n===0;nxt.hidden=n===2;snd.hidden=n!==2;go(n/2);
      if(focus){const f=$('input:not([type=radio]),textarea',steps[n]);f&&f.focus({preventScroll:true})}}
    nxt.addEventListener('click',()=>okStep(si)?show(si+1,1,true):buzz());
    back.addEventListener('click',()=>show(si-1,-1,false));
    $$('input[name=topic]',fe).forEach(r=>r.addEventListener('change',()=>$('#ctTerr').classList.remove('show')));
    $$('.field',fe).forEach(f=>{const el=$('input,textarea',f);el.addEventListener('blur',()=>el.value&&val(f));el.addEventListener('input',()=>f.classList.contains('invalid')&&val(f))});
    $('#ctMsg').addEventListener('input',e=>$('#ctN').textContent=e.target.value.length);
    fe.addEventListener('submit',e=>{e.preventDefault();if(si<2){nxt.click();return}if(!okStep(2))return buzz();
      snd.disabled=true;
      const fin=()=>{$('#ctTicket').textContent='#SKL-'+Math.floor(10000+Math.random()*89999);$('#ctOkName').textContent=($('#ctName').value.trim().split(/\s+/)[0]||'friend');
        card.classList.add('sent');toast('Message sent. We will reply shortly.');setTimeout(()=>card.classList.add('thud'),450)};
      if(anim)gsap.timeline().to(pr,{v:1,duration:.5,ease:'none',onUpdate:()=>place(pr.v)}).to('#ctFly',{x:150,y:-110,scale:.3,opacity:0,duration:.9,ease:'power2.in'}).add(fin,'-=.15');else fin()});
    $('#ctAgain').addEventListener('click',()=>{fe.reset();$$('.field',fe).forEach(f=>f.classList.remove('invalid'));$('#ctN').textContent='0';card.classList.remove('sent','thud','shake');
      snd.disabled=false;steps.forEach(s=>s.classList.remove('on'));si=0;steps[0].classList.add('on');stops.forEach((s,i)=>s.classList.toggle('on',i===0));back.hidden=true;nxt.hidden=false;snd.hidden=true;
      G&&gsap.set('#ctFly',{clearProps:'all'});pr.v=0;place(0)});

    /* 4 HUBS: live analogue clocks, sun and moon, dimming photos */
    const hubs=$$('.ct-hub').map(h=>({h,f:new Intl.DateTimeFormat('en-GB',{timeZone:h.dataset.tz,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}),
      hr:$('.ct-hr',h),mn:$('.ct-mn',h),sc:$('.ct-sc',h),dg:$('.ct-dig',h),st:$('.ct-open em',h)}));
    const tickHubs=()=>{const now=new Date();hubs.forEach(o=>{const p={};o.f.formatToParts(now).forEach(x=>p[x.type]=+x.value);const H=p.hour%24,M=p.minute,S=p.second;
      o.hr.setAttribute('transform','rotate('+((H%12+M/60)*30)+' 50 50)');o.mn.setAttribute('transform','rotate('+((M+S/60)*6)+' 50 50)');o.sc.setAttribute('transform','rotate('+(S*6)+' 50 50)');
      o.dg.textContent=String(H).padStart(2,'0')+':'+String(M).padStart(2,'0');
      const hf=H+M/60,isDay=hf>=6&&hf<18,t=isDay?(hf-6)/12:((hf-18+24)%24)/12;
      o.h.style.setProperty('--px',t.toFixed(3));o.h.style.setProperty('--py',Math.sin(Math.PI*t).toFixed(3));
      o.h.classList.toggle('moon',!isDay);o.h.classList.toggle('night',hf<5||hf>=19);o.h.classList.toggle('dusk',(hf>=5&&hf<7)||(hf>=17&&hf<19));
      const open=H>=8&&H<20;o.h.classList.toggle('is-open',open);o.st.textContent=open?'Open now':'Opens at 08:00'})};
    tickHubs();setInterval(tickHubs,1000);

    /* 5 PULSE: gauge needle swings, equalizer ripples from the current hour */
    const eq=$('#ctEq'),tip=$('#ctTip'),staff=[.28,.22,.2,.18,.2,.26,.36,.5,.68,.82,.92,.98,.94,.9,.96,1,.92,.84,.74,.62,.5,.42,.36,.31],nowH=new Date().getHours();
    staff.forEach((v,i)=>{const b=document.createElement('button'),n=Math.round(v*46)+4,hh=String(i).padStart(2,'0');b.type='button';b.setAttribute('aria-label',hh+':00, '+n+' agents online');
      b.innerHTML='<i style="--v:'+v+';--d:'+((i*37%10)/10)+'"></i>';b.dataset.t=hh+':00 · '+n+' agents online';if(i===nowH)b.classList.add('now');eq.append(b)});
    const bars=$$('button',eq);
    const say=b=>{bars.forEach(x=>x.classList.toggle('sel',x===b));tip.textContent=b.dataset.t};
    bars.forEach(b=>{b.addEventListener('pointerenter',()=>say(b));b.addEventListener('focus',()=>say(b));b.addEventListener('click',()=>say(b))});
    tip.textContent='Now: '+bars[nowH].dataset.t;
    if(!anim)eq.classList.add('live');
    else{ScrollTrigger.create({trigger:'#ctPulse',start:'top 62%',once:true,onEnter:()=>{
      const g=$('#ctGnum'),o={v:0};
      gsap.fromTo('#ctNeedle',{rotation:-90,svgOrigin:'150 150'},{rotation:-42,svgOrigin:'150 150',duration:2.2,ease:'elastic.out(1,.45)'});
      gsap.fromTo('#ctFill',{strokeDashoffset:377},{strokeDashoffset:277,duration:2,ease:'expo.out'});
      gsap.to(o,{v:8,duration:2,ease:'power3.out',onUpdate:()=>g.textContent=Math.round(o.v)});
      gsap.from(bars.map(b=>b.firstChild),{scaleY:0,duration:1,ease:'back.out(1.5)',stagger:{each:.035,from:nowH},clearProps:'transform',onComplete:()=>eq.classList.add('live')})}})}

    /* 6 QUICK ANSWERS: drag-away card deck */
    const deck=$('#ctDeck'),cards=$$('.ct-qc',deck),cnt=$('#ctQcount');let ord=[...cards],busy=false,drag=null,sx=0,st=0,dx=0;
    const lay=l=>{l.forEach((c,i)=>{const o=Math.min(i,3);c.dataset.o=o;c.style.setProperty('--o',o);c.style.zIndex=cards.length-i;c.inert=i>0});cnt.textContent=(cards.indexOf(l[0])+1)+' / '+cards.length};
    const clr=c=>{['--x','--y','--r'].forEach(p=>c.style.removeProperty(p))};
    function next(dir){if(busy)return;busy=true;const c=ord[0],rest=ord.slice(1);c.classList.remove('drag');c.classList.add('gone');
      c.style.setProperty('--x',(dir*deck.offsetWidth*1.2)+'px');c.style.setProperty('--r',(dir*18)+'deg');c.inert=true;lay(rest);ord=[...rest,c];
      setTimeout(()=>{c.classList.add('snap');c.classList.remove('gone');clr(c);lay(ord);void c.offsetWidth;c.classList.remove('snap');busy=false},520)}
    function prev(){if(busy)return;busy=true;const c=ord[ord.length-1];c.classList.add('snap');c.style.setProperty('--x',(-deck.offsetWidth*1.1)+'px');c.style.setProperty('--r','-16deg');
      ord=[c,...ord.slice(0,-1)];lay(ord);void c.offsetWidth;c.classList.remove('snap');clr(c);setTimeout(()=>busy=false,520)}
    $('#ctNextQ').addEventListener('click',()=>next(1));$('#ctPrevQ').addEventListener('click',prev);
    deck.addEventListener('keydown',e=>{if(e.key==='ArrowRight')next(1);else if(e.key==='ArrowLeft')prev()});
    deck.addEventListener('pointerdown',e=>{const c=ord[0];if(busy||!c.contains(e.target))return;drag=c;sx=e.clientX;st=performance.now();dx=0;c.classList.add('drag');try{c.setPointerCapture(e.pointerId)}catch(_){}});
    deck.addEventListener('pointermove',e=>{if(!drag)return;dx=e.clientX-sx;drag.style.setProperty('--x',dx+'px');drag.style.setProperty('--r',(dx/18)+'deg')});
    const endDrag=()=>{if(!drag)return;const c=drag,v=Math.abs(dx)/Math.max(1,performance.now()-st);drag=null;c.classList.remove('drag');
      if(Math.abs(dx)>90||(v>.6&&Math.abs(dx)>30))next(dx<0?-1:1);else{clr(c)}};
    deck.addEventListener('pointerup',endDrag);deck.addEventListener('pointercancel',endDrag);
    lay(ord);

    /* 7 SCRATCH CARD */
    const sc=$('#ctScratchCard'),cv=$('canvas',sc),cx=cv.getContext('2d');let touched=false,done=false,last=null;
    function paint(){const w=sc.offsetWidth,h=sc.offsetHeight,d=Math.min(window.devicePixelRatio||1,2);cv.width=w*d;cv.height=h*d;cx.setTransform(d,0,0,d,0,0);cx.globalCompositeOperation='source-over';
      const g=cx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#F3EFE7');g.addColorStop(.5,'#CFC8B6');g.addColorStop(1,'#F3EFE7');cx.fillStyle=g;cx.fillRect(0,0,w,h);
      cx.strokeStyle='rgba(11,42,37,.09)';cx.lineWidth=10;for(let x=-h;x<w+h;x+=34){cx.beginPath();cx.moveTo(x,h);cx.lineTo(x+h,0);cx.stroke()}
      const fs=Math.max(22,w*.085);cx.fillStyle='rgba(11,42,37,.62)';cx.textAlign='center';cx.textBaseline='middle';
      cx.font='800 '+fs+'px "Bricolage Grotesque",system-ui,sans-serif';cx.fillText('SCRATCH HERE',w/2,h/2-fs*.1);
      cx.font='600 '+(fs*.38)+'px Figtree,system-ui,sans-serif';cx.fillText('to reveal your seller perk',w/2,h/2+fs*.75)}
    paint();document.fonts&&document.fonts.ready.then(()=>{if(!touched)paint()});
    let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{if(!touched&&!done)paint()},200)});
    function reveal(){if(done)return;done=true;sc.classList.add('done');toast('Perk unlocked! Copy your code below.','fa-gift');
      anim&&gsap.from('.ct-prize-in>*',{y:24,opacity:0,scale:.9,duration:.9,stagger:.09,ease:'back.out(1.6)'})}
    function check(){const d=cx.getImageData(0,0,cv.width,cv.height).data;let c=0,n=0;for(let i=3;i<d.length;i+=80){n++;if(d[i]===0)c++}if(c/n>.45)reveal()}
    cv.addEventListener('pointerdown',e=>{if(done)return;cv.setPointerCapture(e.pointerId);last=[e.offsetX,e.offsetY];touched=true;sc.classList.add('touched');stroke(last,last)});
    function stroke(a,b){cx.globalCompositeOperation='destination-out';cx.lineWidth=Math.max(36,sc.offsetWidth*.09);cx.lineCap=cx.lineJoin='round';cx.beginPath();cx.moveTo(a[0],a[1]);cx.lineTo(b[0],b[1]);cx.stroke()}
    cv.addEventListener('pointermove',e=>{if(!last||done)return;const p=[e.offsetX,e.offsetY];stroke(last,p);last=p});
    const up=()=>{if(!last)return;last=null;check()};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
    $('#ctReveal').addEventListener('click',reveal);

    if(!anim)return;
    /* entrances */
    const t1=$('#ctTitle .t1'),tx=t1.textContent;t1.innerHTML=tx.split(' ').map(w=>'<span class="ct-w">'+w+'</span>').join(' ');
    gsap.timeline({defaults:{ease:'expo.out'}})
      .from('.ct-w',{yPercent:-160,rotation:()=>rnd(-14,14),opacity:0,duration:1.5,ease:'bounce.out',stagger:.09})
      .from('.ct-line',{x:-30,opacity:0,duration:1},'-=.8')
      .from('.ct-hero .ab-eyebrow,.ct-live,.ct-hero .lead,.ct-hero .ab-btns',{y:26,opacity:0,stagger:.1,duration:1},'-=.9')
      .from('.ct-ring',{scale:0,duration:1.4,stagger:.12},0)
      .from('.ct-core',{scale:0,rotation:-120,duration:1.5,ease:'back.out(1.7)'},.1)
      .from('.ct-sat',{scale:0,opacity:0,duration:1.2,stagger:.14,ease:'back.out(2)'},.5)
      .from('.ct-bub',{scale:.4,opacity:0,duration:1,stagger:.2,ease:'back.out(1.8)'},1);
    gsap.from(chs,{yPercent:35,opacity:0,duration:1.3,stagger:.13,ease:'expo.out',clearProps:'transform,opacity',scrollTrigger:{trigger:'#ctChgrid',start:'top 82%',once:true}});
    gsap.from('.ct-fmedia figure',{clipPath:'inset(0 0 100% 0 round 34px)',duration:1.5,ease:'expo.inOut',scrollTrigger:{trigger:'.ct-fmedia',start:'top 80%',once:true}});
    gsap.from('.ct-note',{scale:0,rotation:-40,duration:1.2,delay:.5,ease:'back.out(1.8)',clearProps:'transform',scrollTrigger:{trigger:'.ct-fmedia',start:'top 70%',once:true}});
    gsap.from('.ct-qc[data-o="0"],.ct-qc[data-o="1"],.ct-qc[data-o="2"]',{yPercent:25,rotation:()=>rnd(-8,8),opacity:0,duration:1.1,stagger:.12,ease:'expo.out',clearProps:'transform,opacity',scrollTrigger:{trigger:'#ctDeck',start:'top 82%',once:true}});
    gsap.from('.ct-scratch',{y:90,rotation:10,opacity:0,duration:1.4,ease:'expo.out',clearProps:'transform,opacity',scrollTrigger:{trigger:'.ct-scratch',start:'top 85%',once:true}});
    addEventListener('load',()=>{ScrollTrigger.refresh();window.AOS&&AOS.refresh()});
  }

  /* ---------- Blog page (blog.html): runs only there, then stops ---------- */
  function blogPage() {
    const {$,$$,root,reduce,fine,G}=pageBase();
    /* 1 hero: headline words rise, 3D ring tilts with the pointer */
    const ti=$('#blTitle');
    if(ti){const tx=ti.textContent.trim();ti.setAttribute('aria-label',tx);
      ti.innerHTML=tx.split(/\s+/).map(w=>`<span class="bw" aria-hidden="true"><span>${w}</span></span>`).join(' ');
      if(G&&!reduce){gsap.from('#blTitle .bw>span',{yPercent:115,rotate:6,duration:1.2,stagger:.09,ease:'expo.out',delay:.15});
        gsap.from('.bl-hero .ab-eyebrow,.bl-hero .lead,.bl-hero .ab-btns',{y:28,opacity:0,duration:1,stagger:.12,ease:'expo.out',delay:.5})}}
    const st=$('.bl-stage'),hero=$('#blHero');
    if(st&&hero&&fine&&!reduce){
      hero.addEventListener('pointermove',e=>{const r=hero.getBoundingClientRect();
        st.style.setProperty('--ty',(((e.clientX-r.left)/r.width-.5)*16)+'deg');st.style.setProperty('--tx',(-((e.clientY-r.top)/r.height-.5)*12)+'deg')});
      hero.addEventListener('pointerleave',()=>{st.style.setProperty('--ty','0deg');st.style.setProperty('--tx','0deg')})}
    /* play-once reveals (watch el, add class to tgt) */
    const once=(el,cls,thr,tgt)=>{if(!el)return;tgt=tgt||el;
      if(reduce||!('IntersectionObserver' in window)){tgt.classList.add(cls);return}
      const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){tgt.classList.add(cls);io.disconnect()}}),{threshold:thr});io.observe(el)};
    once($('#blFeat'),'in',.3,$('#blBig'));  /* 2 headline wipes in (watch the section: a clipped element never reports as visible) */
    once($('#blFan'),'open',.3);             /* 3 pile fans out */
    once($('#blTrend'),'in',.2);             /* 5 rows + bars fill */
    once($('#blQuote'),'in',.3);             /* 6 blob + highlights */
    once($('#blEnv'),'open',.5);             /* 7 envelope opens */
    /* 2 headline image drifts while scrolling */
    const big=$('#blBig');
    if(big&&!reduce)addEventListener('scroll',()=>{const r=big.getBoundingClientRect();
      if(r.bottom>0&&r.top<innerHeight)big.style.setProperty('--bgy',(25+((r.top+r.height/2)/innerHeight)*50)+'%')},{passive:true});
    /* 3 fan: each card starts stacked on the centre of the row */
    const fan=$('#blFan');let rt;
    const layoutFan=()=>{if(fan)$$('.bl-pile',fan).forEach(p=>p.style.setProperty('--dx',(fan.offsetWidth/2-(p.offsetLeft+p.offsetWidth/2))+'px'))};
    layoutFan();addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(layoutFan,150)});
    addEventListener('load',()=>{layoutFan();window.AOS&&AOS.refresh()});
    /* 7 newsletter */
    const bf=$('#blForm'),bm=$('#blMail'),bmsg=$('#blMsg'),env=$('#blEnv');
    bf.addEventListener('submit',e=>{e.preventDefault();
      if(bm.value.trim()&&bm.checkValidity()){bm.classList.remove('bad');bm.value='';bmsg.textContent='';location.href='404.html'}
      else{bm.classList.add('bad');bmsg.textContent='Please enter a valid email address.';bm.focus()}});
    bm.addEventListener('input',()=>{bm.classList.remove('bad');bmsg.textContent=''});
    bm.setAttribute('autocomplete','off');
    /* back from 404.html: subscribe field must be empty */
    addEventListener('pageshow',()=>{bf.reset();bm.classList.remove('bad');bmsg.textContent='';env.classList.remove('sent')});
  }

  /* ---------- Fallback if GSAP failed to load ---------- */
  if (!hasGSAP) {
    root.classList.remove('js');
    const pre = $('#preloader'); if (pre) pre.remove();
  }

  if (hasGSAP) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Flip) gsap.registerPlugin(Flip);
  }

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg, icon = 'fa-circle-check') {
    toastEl.innerHTML = '<i class="fa-solid ' + icon + '"></i><span></span>';
    toastEl.lastChild.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  /* ---------- AOS ---------- */
  if (window.AOS) {
    AOS.init({ duration: 900, easing: 'ease-out-cubic', once: true, offset: 70, disable: reduce });
  }

  /* ---------- Header, progress, back-to-top ---------- */
  const header = $('#siteHeader');
  const progress = $('#progress');
  const toTop = $('#toTop');
  let lastY = window.scrollY, ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 40);
    if (!menuOpen) {
    }
    progress.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
    toTop.classList.toggle('show', y > 900);
    lastY = y; ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ---------- Active nav: follows the PAGE you are on, not the scroll position ---------- */
  const links = $$('.nav-link');
  const curFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  links.forEach(l => {
    const f = (l.getAttribute('href') || '').split('#')[0].toLowerCase();
    l.classList.toggle('is-active', f === curFile);
  });

  /* ---------- Mobile menu ---------- */
  const burger = $('#burger'), menu = $('#mobileMenu');
  let menuOpen = false;
  function setMenu(open) {
    menuOpen = open;
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    root.style.overflow = open ? 'hidden' : '';
    if (open) header.classList.remove('is-hidden');
  }
  burger.addEventListener('click', () => setMenu(!menuOpen));
  $$('#mobileMenu a').forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menuOpen) { setMenu(false); burger.focus(); } });
  window.addEventListener('resize', () => { if (window.innerWidth > 980 && menuOpen) setMenu(false); });

  /* ---------- Login dialog ---------- */
  const dlg = $('#loginDialog');
  function openLogin() {
    if (menuOpen) setMenu(false);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    if (hasGSAP && !reduce) gsap.fromTo('.login-card', { y: 50, scale: .96, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: .7, ease: 'expo.out' });
    setTimeout(() => $('#lMail').focus(), 120);
  }
  function closeLogin() {
    const done = () => { if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
    if (hasGSAP && !reduce) gsap.to('.login-card', { y: 30, autoAlpha: 0, duration: .3, ease: 'power2.in', onComplete: done });
    else done();
  }
  $$('[data-open-login]').forEach(b => b.addEventListener('click', openLogin));
  $$('[data-close-login]').forEach(b => b.addEventListener('click', closeLogin));
  dlg.addEventListener('click', e => { if (e.target === dlg) closeLogin(); });
  dlg.addEventListener('cancel', e => { e.preventDefault(); closeLogin(); });

  /* ---------- Form validation ---------- */
  function validateField(f) {
    const el = $('input,select,textarea', f);
    const ok = el.checkValidity();
    f.classList.toggle('invalid', !ok);
    return ok;
  }
  function wireForm(form, onValid) {
    $$('.field', form).forEach(f => {
      const el = $('input,select,textarea', f);
      el.addEventListener('blur', () => validateField(f));
      el.addEventListener('input', () => { if (f.classList.contains('invalid')) validateField(f); });
    });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fields = $$('.field', form);
      const results = fields.map(validateField);
      if (results.every(Boolean)) onValid(form);
      else { const bad = fields[results.indexOf(false)]; $('input,select,textarea', bad).focus(); }
    });
  }
  /* clears every field and any validation state */
  const clearContactForm = () => {
    const cf = $('#contactForm'); if (!cf) return;
    cf.reset();
    $$('.field', cf).forEach(f => f.classList.remove('invalid'));
    const ok = $('#formOk'); if (ok) ok.classList.remove('show');
  };
  wireForm($('#contactForm'), form => {
    clearContactForm();               /* empty all fields first */
    window.location.href = '404.html'; /* then go to the 404 page */
  });
  /* coming back from 404.html (Back button / bfcache): fields must be empty */
  window.addEventListener('pageshow', clearContactForm);
  wireForm($('#loginForm'), form => {
    toast('Logged in (demo only, no backend connected)', 'fa-user-check');
    form.reset(); closeLogin();
  });
  $('#newsForm').addEventListener('submit', e => {
    e.preventDefault();
    const input = $('input', e.target), out = $('#newsOk');
    if (input.checkValidity() && input.value.trim()) {
      input.value = ''; out.textContent = '';      /* empty the field first */
      window.location.href = '404.html';            /* then go to the 404 page */
    }
    else out.textContent = 'Please enter a valid email address.';
  });
  /* hide the error as soon as the person starts typing again */
  $('#newsForm input').addEventListener('input', () => { $('#newsOk').textContent = ''; });
  /* coming back from 404.html (Back button / bfcache): newsletter field must be empty */
  window.addEventListener('pageshow', () => { const n = $('#newsForm'); if (n) { n.reset(); $('#newsOk').textContent = ''; } });

  /* ---------- Wishlist & cart ---------- */
  $$('.p-heart').forEach(btn => btn.addEventListener('click', () => {
    const on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', String(on));
    const i = $('i', btn); i.className = (on ? 'fa-solid' : 'fa-regular') + ' fa-heart';
    btn.classList.remove('pop'); void btn.offsetWidth; btn.classList.add('pop');
    toast(on ? 'Saved to your wishlist' : 'Removed from wishlist', 'fa-heart');
  }));
  $$('.add-cart').forEach(btn => btn.addEventListener('click', () => {
    toast(btn.dataset.name + ' added to your bag', 'fa-bag-shopping');
    const old = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-check"></i> Added';
    setTimeout(() => { btn.innerHTML = old; }, 1400);
  }));

  /* ---------- Categories accordion ---------- */
  const cats = $$('.cat');
  cats.forEach(c => {
    const activate = () => { if (window.innerWidth > 980) { cats.forEach(x => x.classList.toggle('is-active', x === c)); } };
    c.addEventListener('mouseenter', activate);
    c.addEventListener('focus', activate);
  });

  /* ---------- Glare on service cards ---------- */
  $$('.glare').forEach(card => card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  if (!hasGSAP) {
    /* Minimal fallback: just make filter + slider work without animation */
    wireFilters(false); wireReviews(false);
    return;
  }

  /* =========================================================
     GSAP SECTION
     ========================================================= */

  /* ---------- Split titles (word-by-word reveal) ---------- */
  $$('.split-title').forEach(el => {
    const text = el.textContent.trim().replace(/\s+/g, ' ');
    el.setAttribute('aria-label', text);
    el.innerHTML = text.split(' ').map(w => '<span class="w" aria-hidden="true"><span>' + w + '</span></span>').join(' ');
    const spans = $$('.w > span', el);
    if (reduce) { gsap.set(spans, { yPercent: 0 }); return; }
    gsap.set(spans, { yPercent: 108 });
    gsap.to(spans, {
      yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: .055,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true }
    });
  });

  /* ---------- Image mask reveals ---------- */
  $$('.reveal-img').forEach(fig => {
    const img = $('img', fig);
    if (reduce) { gsap.set(fig, { clipPath: 'none' }); return; }
    const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 85%', once: true } });
    tl.fromTo(fig, { clipPath: 'inset(100% 0% 0% 0% round 34px)' }, { clipPath: 'inset(0% 0% 0% 0% round 34px)', duration: 1.5, ease: 'expo.inOut' })
      .fromTo(img, { scale: 1.4 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, 0);
    gsap.to(img, { yPercent: -6, ease: 'none', scrollTrigger: { trigger: fig, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* ---------- Counters ---------- */
  $$('.counter').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const render = v => { el.textContent = v.toFixed(dec) + suffix; };
    if (reduce) { render(target); return; }
    const o = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(o, { v: target, duration: 2.2, ease: 'power3.out', onUpdate: () => render(o.v) })
    });
  });

  /* ---------- Parallax helpers ---------- */
  if (!reduce) {
    gsap.fromTo('.stats-bg', { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.stats', start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.to('.hero-visual', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.orb-1', { y: 140, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.from('.about-float', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.about', start: 'top bottom', end: 'center center', scrub: true } });
    gsap.from('.about-float', { autoAlpha: 0, x: 70, duration: 1.2, delay: .25, ease: 'expo.out', scrollTrigger: { trigger: '.about-media', start: 'top 70%', once: true } });
  }

  /* ---------- Product entrance + tilt ---------- */
  const cards = $$('.product');
  if (!reduce) {
    gsap.set(cards, { autoAlpha: 0 });
    ScrollTrigger.batch(cards, {
      start: 'top 92%', once: true,
      onEnter: batch => gsap.fromTo(batch, { y: 80, autoAlpha: 0, rotateX: -14, transformPerspective: 900 }, { y: 0, autoAlpha: 1, rotateX: 0, duration: 1, ease: 'expo.out', stagger: .09, clearProps: 'rotateX,transformPerspective' })
    });
  }
  if (finePointer && !reduce) {
    cards.forEach(card => {
      const rx = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3.out' });
      const ry = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3.out' });
      gsap.set(card, { transformPerspective: 900 });
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - .5) * 12);
        rx(-((e.clientY - r.top) / r.height - .5) * 12);
      });
      card.addEventListener('pointerleave', () => { rx(0); ry(0); });
    });
  }

  /* ---------- Product filter (GSAP Flip) ---------- */
  function wireFilters(animate) {
    const grid = $('#productGrid');
    const chips = $$('.chip-btn');
    chips.forEach(btn => btn.addEventListener('click', () => {
      chips.forEach(c => { const on = c === btn; c.classList.toggle('is-active', on); c.setAttribute('aria-selected', String(on)); });
      const f = btn.dataset.filter;
      const items = $$('.product', grid);
      const apply = () => items.forEach(c => c.classList.toggle('is-hidden', f !== 'all' && c.dataset.cat !== f));
      if (animate && window.Flip && !reduce) {
        const state = Flip.getState(items);
        apply();
        Flip.from(state, {
          duration: .8, ease: 'power3.inOut', scale: true, absolute: true, stagger: .04,
          onEnter: els => gsap.fromTo(els, { autoAlpha: 0, scale: .6 }, { autoAlpha: 1, scale: 1, duration: .7, ease: 'back.out(1.6)' }),
          onLeave: els => gsap.to(els, { autoAlpha: 0, scale: .6, duration: .4 })
        });
      } else apply();
    }));
  }
  wireFilters(true);

  /* ---------- Reviews slider ---------- */
  function wireReviews(animate) {
    const revs = $$('.rev'), thumbs = $$('.thumb'), bar = $('#revTimer'), stage = $('#revStage');
    let cur = 0, busy = false, timer = null, hover = false;
    const total = revs.length;

    function startTimer() {
      if (!animate) return;
      if (timer) timer.kill();
      gsap.set(bar, { scaleX: 0 });
      timer = gsap.to(bar, { scaleX: 1, duration: 6.5, ease: 'none', onComplete: () => go((cur + 1) % total, 1) });
      if (hover) timer.pause();
    }
    function go(n, dir) {
      if (busy || n === cur) return;
      dir = dir || (n > cur ? 1 : -1);
      const out = revs[cur], inn = revs[n];
      thumbs.forEach((t, i) => t.classList.toggle('is-active', i === n));
      cur = n;
      if (!animate) { revs.forEach((r, i) => r.classList.toggle('is-active', i === n)); return; }
      busy = true;
      if (timer) timer.kill();
      gsap.to(out, { autoAlpha: 0, x: -50 * dir, duration: .45, ease: 'power2.in', onComplete: () => out.classList.remove('is-active') });
      inn.classList.add('is-active');
      gsap.fromTo(inn, { autoAlpha: 0, x: 60 * dir }, { autoAlpha: 1, x: 0, duration: .9, delay: .3, ease: 'expo.out', onComplete: () => { busy = false; startTimer(); } });
      gsap.fromTo($('footer img', inn), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: .8, delay: .55, ease: 'back.out(2)' });
    }
    $('#nextRev').addEventListener('click', () => go((cur + 1) % total, 1));
    $('#prevRev').addEventListener('click', () => go((cur - 1 + total) % total, -1));
    thumbs.forEach((t, i) => t.addEventListener('click', () => go(i)));

    let sx = null;
    stage.addEventListener('pointerdown', e => { sx = e.clientX; });
    stage.addEventListener('pointerup', e => {
      if (sx === null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 50) go(dx < 0 ? (cur + 1) % total : (cur - 1 + total) % total, dx < 0 ? 1 : -1);
    });
    stage.addEventListener('pointerenter', () => { if (finePointer) { hover = true; timer && timer.pause(); } });
    stage.addEventListener('pointerleave', () => { hover = false; timer && timer.play(); });

    if (animate && !reduce) {
      startTimer(); timer.pause();
      ScrollTrigger.create({
        trigger: '#reviews', start: 'top 75%', end: 'bottom 15%',
        onToggle: s => { if (!timer) return; (s.isActive && !hover) ? timer.play() : timer.pause(); }
      });
    }
  }
  wireReviews(true);

  /* ---------- Pinned horizontal "How it works" ---------- */
  const how = $('#how');
  const mm = gsap.matchMedia();
  if (reduce) how.classList.add('no-pin');
  else {
    mm.add('(min-width: 981px)', () => {
      const track = $('#howTrack'), bar = $('#howBar');
      const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.set(bar, { scaleX: .25 });
      const tween = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: '.how-pin', start: 'top top', end: () => '+=' + dist(),
          pin: true, scrub: .7, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: self => gsap.set(bar, { scaleX: .25 + self.progress * .75 })
        }
      });
      // panel imagery: gentle scale + number pop as each panel slides in
      $$('.how-panel').forEach((p, i) => {
        gsap.fromTo($('.how-img img', p), { scale: 1.25 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 90%', end: 'left 30%', scrub: true } });
        gsap.fromTo($('.how-num', p), { scale: .4, rotate: -120 }, { scale: 1, rotate: 0, ease: 'back.out(2)', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 70%', toggleActions: 'play none none reverse' } });
      });
    });
    mm.add('(max-width: 980px)', () => {
      $$('.how-panel').forEach(p => {
        gsap.from($('.how-img', p), { y: 60, autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 85%', once: true } });
        gsap.from($('.how-txt', p).children, { y: 40, autoAlpha: 0, duration: .9, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: p, start: 'top 75%', once: true } });
      });
    });
  }

  /* ---------- Cursor + magnetic buttons (fine pointers only) ---------- */
  if (finePointer && !reduce) {
    const cur = $('#cursor');
    const cx = gsap.quickTo(cur, 'x', { duration: .35, ease: 'power3.out' });
    const cy = gsap.quickTo(cur, 'y', { duration: .35, ease: 'power3.out' });
    window.addEventListener('pointermove', e => { cx(e.clientX); cy(e.clientY); cur.style.opacity = 1; }, { passive: true });
    document.addEventListener('pointerleave', () => { cur.style.opacity = 0; });
    document.addEventListener('pointerover', e => cur.classList.toggle('is-big', !!e.target.closest('a,button,.cat,.product,.post,.thumb')));

    $$('.magnetic').forEach(btn => {
      const mx = gsap.quickTo(btn, 'x', { duration: .6, ease: 'elastic.out(1,.5)' });
      const my = gsap.quickTo(btn, 'y', { duration: .6, ease: 'elastic.out(1,.5)' });
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        mx((e.clientX - (r.left + r.width / 2)) * .28);
        my((e.clientY - (r.top + r.height / 2)) * .35);
      });
      btn.addEventListener('pointerleave', () => { mx(0); my(0); });
    });
  }

  /* =========================================================
     HERO — preloader, intro sequence, interactive parallax
     ========================================================= */
  const pre = $('#preloader');
  const preBar = $('#preBar'), preNum = $('#preNum');
  const heroLns = $$('.hero-title .ln-in');
  const pills = $$('.hero-title .pill');
  const hvs = $$('.hv');
  const fades = $$('[data-hero="fade"]');

  if (!reduce) {
    gsap.set(heroLns, { yPercent: 115 });
    gsap.set(pills, { scaleX: 0 });
    gsap.set(fades, { autoAlpha: 0, y: 26 });
    gsap.set('.hv-main', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 30px 30px)' });
    gsap.set($$('.hv:not(.hv-main)'), { autoAlpha: 0, scale: .5 });
    gsap.set('.scroll-cue', { autoAlpha: 0 });
  }
  root.style.overflow = 'hidden';

  let loaded = document.readyState === 'complete', barDone = false, started = false;
  const counter = { v: 0 };
  gsap.to(counter, {
    v: 100, duration: reduce ? .1 : 1.5, ease: 'power2.inOut',
    onUpdate: () => { preNum.textContent = Math.round(counter.v); gsap.set(preBar, { scaleX: counter.v / 100 }); },
    onComplete: () => { barDone = true; tryStart(); }
  });
  window.addEventListener('load', () => { loaded = true; tryStart(); });
  setTimeout(() => { loaded = true; barDone = true; tryStart(); }, 4500);

  function tryStart() {
    if (started || !(loaded && barDone)) return;
    started = true;
    heroIntro();
  }

  function heroIntro() {
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    tl.to(pre, { yPercent: -100, duration: reduce ? .01 : 1, ease: 'expo.inOut', onComplete: () => { pre.remove(); root.style.overflow = ''; ScrollTrigger.refresh(); } });
    if (reduce) { gsap.set(heroLns, { yPercent: 0 }); return; }

    tl.to(heroLns, { yPercent: 0, duration: 1.3, stagger: .12 }, '-=.45')
      .to(pills, { scaleX: 1, duration: 1.1, stagger: .15, ease: 'expo.inOut' }, '-=.9')
      .to(fades, { autoAlpha: 1, y: 0, duration: 1, stagger: .1 }, '-=1')
      .to('.hv-main', { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 30px 30px)', duration: 1.6, ease: 'expo.inOut' }, '-=1.3')
      .fromTo('.hv-main img', { scale: 1.4 }, { scale: 1, duration: 2 }, '<')
      .to($$('.hv:not(.hv-main)'), { autoAlpha: 1, scale: 1, duration: 1.1, stagger: .12, ease: 'back.out(1.7)' }, '-=1.1')
      .to('.scroll-cue', { autoAlpha: 1, duration: .8 }, '-=.4')
      .add(startHeroLife);
  }

  /* idle float + mouse parallax. Float uses yPercent so it never fights x/y parallax. */
  function startHeroLife() {
    $$('.hv:not(.hv-main)').forEach((el, i) => {
      gsap.to(el, { yPercent: i % 2 ? -7 : 7, duration: 2.4 + i * .35, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    });
    gsap.to('.hv-main img', { scale: 1.06, duration: 7, ease: 'sine.inOut', yoyo: true, repeat: -1 });

    if (!finePointer) return;
    const hero = $('.hero'), main = $('.hv-main');
    const movers = hvs.map(el => ({
      x: gsap.quickTo(el, 'x', { duration: 1, ease: 'power3.out' }),
      y: gsap.quickTo(el, 'y', { duration: 1, ease: 'power3.out' }),
      d: parseFloat(el.dataset.depth || 20)
    }));
    const rx = gsap.quickTo(main, 'rotationX', { duration: 1, ease: 'power3.out' });
    const ry = gsap.quickTo(main, 'rotationY', { duration: 1, ease: 'power3.out' });
    gsap.set(main, { transformPerspective: 1000 });
    hero.addEventListener('pointermove', e => {
      const nx = e.clientX / window.innerWidth - .5;
      const ny = e.clientY / window.innerHeight - .5;
      movers.forEach(m => { m.x(-nx * m.d * 2); m.y(-ny * m.d * 2); });
      ry(nx * 9); rx(-ny * 7);
    });
    hero.addEventListener('pointerleave', () => { movers.forEach(m => { m.x(0); m.y(0); }); rx(0); ry(0); });
  }

  window.addEventListener('load', () => { ScrollTrigger.refresh(); if (window.AOS) AOS.refresh(); });
})();


/* Stackly — keeps ScrollTrigger measurements correct so the pinned section never overlaps its neighbours.
   Loads after script.js; nothing existing is edited. */
(() => {
  'use strict';
  if (!window.ScrollTrigger) return;

  let t;
  const refresh = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 150); };

  // Re-measure whenever something that changes page height finishes loading
  document.querySelectorAll('img').forEach(img => { if (!img.complete) img.addEventListener('load', refresh, { once: true }); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  addEventListener('load', () => { setTimeout(refresh, 300); setTimeout(refresh, 1600); });
  addEventListener('resize', refresh);
  addEventListener('orientationchange', refresh);

  // ...and whenever the page height itself changes by more than a couple of pixels
  if ('ResizeObserver' in window) {
    let h = document.body.scrollHeight;
    new ResizeObserver(() => {
      const n = document.body.scrollHeight;
      if (Math.abs(n - h) > 2) { h = n; refresh(); }
    }).observe(document.body);
  }

  // Opening the page with a hash (e.g. index.html#shop): wait for the preloader, re-measure, then jump to the right spot
  if (location.hash.length > 1) {
    let tries = 0;
    const wait = setInterval(() => {
      if (document.getElementById('preloader') && ++tries < 80) return;
      clearInterval(wait);
      ScrollTrigger.refresh();
      const el = document.querySelector(location.hash);
      if (el) setTimeout(() => el.scrollIntoView(), 60);
    }, 100);
  }
})();

/* Stackly - smooth anchor scrolling done in JS instead of CSS (scroll-behavior:smooth breaks ScrollTrigger pin measuring,
   which left the "How it works" area blank). Loads after script.js; nothing existing is edited. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (history.replaceState) history.replaceState(null, '', id);
  });
})();