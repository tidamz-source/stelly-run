
/* ================= v7.0 : flèches de défilement des Nouvelles ================= */
// Une flèche en haut et/ou en bas de la liste dès qu'il reste des nouvelles à faire défiler ; un tap sur la flèche fait défiler.
{ const list = $('newslist');
  const css = document.createElement('style');
  css.textContent = '.nscroll{ width:calc(var(--s)*20px); height:calc(var(--s)*7px); display:flex; align-items:center; justify-content:center; padding:0; border:0; background:none; cursor:pointer; flex:none; }'
    + '.nscroll[hidden]{ visibility:hidden; display:flex; }'
    + '.nscroll i{ display:block; width:calc(var(--s)*4.5px); height:calc(var(--s)*4.5px); border:solid var(--yellow); border-width:0 calc(var(--s)*1.6px) calc(var(--s)*1.6px) 0; }'
    + '.nscroll.dn i{ transform:rotate(45deg); animation:nsdn 1.1s ease-in-out infinite; }'
    + '.nscroll.up i{ transform:rotate(-135deg); animation:nsup 1.1s ease-in-out infinite; }'
    + '@keyframes nsdn{ 50%{ transform:translateY(calc(var(--s)*1.5px)) rotate(45deg); } }'
    + '@keyframes nsup{ 50%{ transform:translateY(calc(var(--s)*-1.5px)) rotate(-135deg); } }'
    + '@media (prefers-reduced-motion: reduce){ .nscroll i{ animation:none !important; } }';
  document.head.appendChild(css);
  const mkArrow = cls => { const b = document.createElement('button'); b.type = 'button'; b.className = 'nscroll ' + cls; b.hidden = true; b.appendChild(document.createElement('i')); return b; };
  const up = mkArrow('up'), dn = mkArrow('dn');
  list.before(up); list.after(dn);
  const update = () => { const more = list.scrollHeight - list.clientHeight > 2;
    up.hidden = !more || list.scrollTop <= 2; dn.hidden = !more || list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
    up.setAttribute('aria-label', txt('ui.prevPage')); dn.setAttribute('aria-label', txt('ui.nextPage')); };
  list.addEventListener('scroll', update, { passive:true });
  up.addEventListener('click', e => { e.stopPropagation(); list.scrollBy({ top: -list.clientHeight*.8, behavior:'smooth' }); });
  dn.addEventListener('click', e => { e.stopPropagation(); list.scrollBy({ top: list.clientHeight*.8, behavior:'smooth' }); });
  $('newsbtn').addEventListener('click', () => { list.scrollTop = 0; setTimeout(update, 60); setTimeout(update, 600); });
  addEventListener('resize', () => setTimeout(update, 100));
  update(); }
