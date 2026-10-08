(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cursor = $('.cursor');
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
  const cursorLoop = () => { cx += (mx - cx) * .18; cy += (my - cy) * .18; if (cursor) cursor.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(cursorLoop); };
  cursorLoop();
  $$('a,button,[data-cursor]').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor?.classList.add('active'); const label = el.dataset.cursor || (el.classList.contains('orb') ? 'WISH' : 'OPEN'); if (cursor) cursor.firstElementChild.textContent = label; });
    el.addEventListener('mouseleave', () => cursor?.classList.remove('active'));
  });

  addEventListener('scroll', () => { const max = document.documentElement.scrollHeight - innerHeight; $('.progress').style.width = `${(scrollY / max) * 100}%`; }, {passive:true});

  if (!reduce && window.Lenis) {
    const lenis = new Lenis({ lerp:.075, wheelMultiplier:.9, smoothWheel:true });
    function raf(t){ lenis.raf(t); requestAnimationFrame(raf); } requestAnimationFrame(raf);
  }

  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  }), {threshold:.18});
  $$('.reveal').forEach(el => revealObserver.observe(el));

  if (!reduce && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('.hero-goku',{yPercent:18,scale:1.08,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero-title',{xPercent:-10,yPercent:-8,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.fromTo('.vegeta',{xPercent:35},{xPercent:-4,ease:'none',scrollTrigger:{trigger:'.saiyan',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.fromTo('.red-slash',{xPercent:25},{xPercent:-12,ease:'none',scrollTrigger:{trigger:'.saiyan',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.fromTo('.awakens .flash',{opacity:.8},{opacity:0,duration:.5,scrollTrigger:{trigger:'.awakens',start:'top 70%',toggleActions:'play none none reverse'}});
    gsap.fromTo('.ssj',{scale:.72,yPercent:18},{scale:1,yPercent:0,ease:'power2.out',scrollTrigger:{trigger:'.awakens',start:'top 78%',end:'center center',scrub:1}});
    gsap.to('.awakens-title',{xPercent:-6,ease:'none',scrollTrigger:{trigger:'.awakens',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.fromTo('.villain-art',{xPercent:20},{xPercent:-7,ease:'none',scrollTrigger:{trigger:'.villains',start:'top bottom',end:'bottom top',scrub:true}});
    gsap.to('.final-silhouette',{opacity:0,yPercent:15,ease:'none',scrollTrigger:{trigger:'.finale',start:'top center',end:'bottom bottom',scrub:true}});
  }

  const rivals = $('.rivals');
  rivals?.addEventListener('pointermove', e => {
    if (reduce) return; const x = (e.clientX / innerWidth - .5) * 28, y = (e.clientY / innerHeight - .5) * 12;
    $('.rival.goku').style.transform = `translate3d(${x}px,${y}px,0)`;
    $('.rival.vegeta').style.transform = `translate3d(${-x}px,${y}px,0)`;
  });

  const formStates = [
    {name:'BASE.',bg:'#050505',color:'#fff',filter:'contrast(1.2) grayscale(.2)'},
    {name:'KAIOKEN.',bg:'#e60012',color:'#fff',filter:'grayscale(1) sepia(1) saturate(6) hue-rotate(320deg) contrast(1.4)'},
    {name:'SUPER SAIYAN.',bg:'#f2f0e9',color:'#050505',filter:'grayscale(1) sepia(1) saturate(3) contrast(1.35)'},
    {name:'SSJ 2.',bg:'#d8ad00',color:'#050505',filter:'grayscale(1) sepia(1) saturate(4) brightness(1.25) contrast(1.3)'},
    {name:'SSJ 3.',bg:'#050505',color:'#fff',filter:'grayscale(1) sepia(1) saturate(5) contrast(1.5)'}
  ];
  let activeForm = -1;
  const updateForms = () => {
    const wrap = $('.forms'); if (!wrap) return; const r = wrap.getBoundingClientRect(); const progress = Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))); const idx = Math.min(4, Math.floor(progress * 5));
    if (idx === activeForm) return; activeForm = idx; const s = formStates[idx], stage = $('.forms-sticky'); stage.style.setProperty('--form-bg',s.bg); stage.style.color=s.color; stage.style.setProperty('--form-filter',s.filter); $('.form-name').textContent=s.name; $('.form-counter b').textContent=String(idx+1).padStart(2,'0'); $$('.form-track span').forEach((el,i)=>el.classList.toggle('active',i===idx));
    if (!reduce && window.gsap) gsap.fromTo('.form-figure',{scale:.82,rotate:-2},{scale:1,rotate:0,duration:.55,ease:'power3.out'});
  };
  // The real-time 3D director owns the transformation sequence.

  // Dragon Ball collection and summoning are driven by the 3D director.

  $$('.magnetic').forEach(el => el.addEventListener('pointermove', e => { const r=el.getBoundingClientRect(); el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.16}px,${(e.clientY-r.top-r.height/2)*.16}px)`; }));
  $$('.magnetic').forEach(el => el.addEventListener('pointerleave',()=>el.style.transform=''));
})();
