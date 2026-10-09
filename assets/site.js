document.documentElement.classList.add('js');
(() => {
  const path=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.site-header nav a').forEach(a=>{if(a.getAttribute('href')===path)a.setAttribute('aria-current','page');});
  const deck=document.querySelector('main[data-deck]');
  if(deck){
    const chapters=[...deck.querySelectorAll('section.chapter')];
    if(!chapters.length)return;
    let index=0,presenting=false,returnFocus=null;
    const title=c=>c.dataset.title||c.querySelector('h1,h2')?.textContent.trim()||c.id;
    const toolbar=document.createElement('nav'); toolbar.className='deck-tools';toolbar.setAttribute('aria-label','Presentation controls');
    toolbar.innerHTML='<button type="button" data-toggle aria-pressed="false">Present chapters</button><button type="button" data-prev hidden>Previous</button><button type="button" data-next hidden>Next</button><button type="button" data-overview>Chapter overview</button><span class="deck-status" role="status" aria-live="polite"></span>';
    deck.before(toolbar);
    const toggle=toolbar.querySelector('[data-toggle]'),prev=toolbar.querySelector('[data-prev]'),next=toolbar.querySelector('[data-next]'),overview=toolbar.querySelector('[data-overview]'),status=toolbar.querySelector('.deck-status');
    const dialog=document.createElement('dialog');dialog.className='deck-overview';dialog.setAttribute('aria-labelledby','deck-overview-heading');
    const heading=document.createElement('h2');heading.id='deck-overview-heading';heading.textContent='Choose a chapter';dialog.append(heading);
    const list=document.createElement('ol');chapters.forEach((chapter,i)=>{const li=document.createElement('li'),a=document.createElement('a');a.href='#'+chapter.id;a.textContent=title(chapter);a.addEventListener('click',e=>{e.preventDefault();dialog.close();if(presenting){show(i,true)}else{index=i;location.hash=chapter.id;chapter.scrollIntoView();focusHeading(chapter)} });li.append(a);list.append(li)});dialog.append(list);
    const close=document.createElement('button');close.type='button';close.textContent='Close overview';close.addEventListener('click',()=>dialog.close());dialog.append(close);document.body.append(dialog);
    function focusHeading(chapter){const h=chapter.querySelector('h1,h2')||chapter;h.setAttribute('tabindex','-1');h.focus({preventScroll:true});}
    function activeHash(){const target=document.getElementById(decodeURIComponent(location.hash.slice(1)));return chapters.findIndex(c=>c===target||c.contains(target));}
    function show(i,focus=false){index=Math.max(0,Math.min(chapters.length-1,i));chapters.forEach((c,j)=>{c.hidden=presenting&&j!==index;c.inert=presenting&&j!==index;});prev.disabled=index===0;next.disabled=index===chapters.length-1;status.textContent=presenting?`${index+1} of ${chapters.length} · ${title(chapters[index])}`:`${chapters.length} chapters · continuous reading`;if(presenting)history.replaceState(null,'','#'+chapters[index].id);if(focus){chapters[index].scrollIntoView({behavior:'instant',block:'start'});focusHeading(chapters[index]);}}
    toggle.addEventListener('click',()=>{presenting=!presenting;document.body.classList.toggle('presentation',presenting);toggle.setAttribute('aria-pressed',String(presenting));toggle.textContent=presenting?'Continuous reading':'Present chapters';prev.hidden=next.hidden=!presenting;const target=activeHash();if(target>=0)index=target;show(index,presenting);});
    prev.addEventListener('click',()=>show(index-1,true));next.addEventListener('click',()=>show(index+1,true));
    overview.addEventListener('click',()=>{returnFocus=document.activeElement;dialog.showModal();});
    dialog.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));
    window.addEventListener('hashchange',()=>{const i=activeHash();if(i>=0&&presenting)show(i,true);});
    document.addEventListener('keydown',e=>{if(!presenting||dialog.open||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('input,textarea,select,[contenteditable],dialog'))return;if(['ArrowRight','PageDown'].includes(e.key)){e.preventDefault();show(index+1,true)}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();show(index-1,true)}else if(e.key==='Home'){e.preventDefault();show(0,true)}else if(e.key==='End'){e.preventDefault();show(chapters.length-1,true)}else if(e.key==='Escape'){toggle.click();toggle.focus();}});
    show(0);
  }
  const worksheet=document.querySelector('[data-ai-readiness]');
  if(worksheet){
    const fields=[...worksheet.querySelectorAll('fieldset')],out=worksheet.querySelector('[data-readiness-output]');
    const answer=f=>f.querySelector('input:checked')?.value||'Unanswered';
    const summary=()=>['AI-first working notes','Self-report only. No maturity score or technical assessment.',...fields.map((f,i)=>`${i+1}. ${f.dataset.topic}: ${answer(f)}`),'Unknown and unanswered items need a conversation with the relevant process owner.'].join('\n');
    function update(){const done=fields.filter(f=>answer(f)!=='Unanswered').length;out.textContent=`${done} of ${fields.length} answered.\n\n`+summary();}worksheet.addEventListener('change',update);update();
    worksheet.querySelector('[data-copy]')?.addEventListener('click',async e=>{try{await navigator.clipboard.writeText(summary());e.target.textContent='Notes copied';setTimeout(()=>e.target.textContent='Copy my notes',2000)}catch{out.textContent=summary()+'\n\nCopy the text above to keep your notes.';}});
    worksheet.querySelector('[data-download]')?.addEventListener('click',()=>{const a=document.createElement('a'),url=URL.createObjectURL(new Blob([summary()+'\n'],{type:'text/plain'}));a.href=url;a.download='ai-first-working-notes.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
    worksheet.querySelector('[data-reset]')?.addEventListener('click',()=>{worksheet.querySelectorAll('input').forEach(i=>i.checked=false);update();});
  }
  let opened=[];
  window.addEventListener('beforeprint',()=>{opened=[...document.querySelectorAll('details:not([open])')];opened.forEach(d=>d.open=true);});
  window.addEventListener('afterprint',()=>{opened.forEach(d=>d.open=false);opened=[];});
})();