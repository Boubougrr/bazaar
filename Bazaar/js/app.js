// ============================================================
//  BAZAAR — APP.JS v3
// ============================================================
let currentUser = null;
let pendingEmail = null, pendingCode = null;
let currentItemForDl = null;
let searchMode = 'auto';
let sessionStart = Date.now();
let pageTimer = null;

// ── CURSOR (always on top) ───────────────────────────────────
const cursorEl = document.getElementById('cursor');
let cx = innerWidth/2, cy = innerHeight/2, tx = cx, ty = cy;
document.addEventListener('mousemove', e => { tx=e.clientX; ty=e.clientY; });
document.addEventListener('mousedown', () => cursorEl.classList.add('click'));
document.addEventListener('mouseup',   () => cursorEl.classList.remove('click'));
const hoverQ = 'a,button,.nav-link,.item-card,.filter-btn,.mode-tab,.plan-card,.dd-item,.btn,.credits-pill';
document.addEventListener('mouseover', e => { if(e.target.closest(hoverQ)) cursorEl.classList.add('hover'); });
document.addEventListener('mouseout',  e => { if(e.target.closest(hoverQ)) cursorEl.classList.remove('hover'); });
(function loop(){ cx+=(tx-cx)*.22; cy+=(ty-cy)*.22; cursorEl.style.left=cx+'px'; cursorEl.style.top=cy+'px'; requestAnimationFrame(loop); })();

// ── BG CANVAS (fixed, no mouse tracking) ────────────────────
(function(){
  const c=document.getElementById('bg-canvas'), ctx=c.getContext('2d');
  let w,h; function resize(){w=c.width=innerWidth;h=c.height=innerHeight;}
  window.addEventListener('resize',resize); resize();
  let off=0;
  function draw(){
    ctx.clearRect(0,0,w,h); off=(off+0.15)%80;
    const vpx=w*.5,vpy=h*.55,depth=600,far=1200,spread=2400;
    ctx.lineWidth=.6;
    for(let i=-22;i<=22;i++){const x=i*80;for(let z=40;z<far;z+=10){const z1=z-off,z2=z-off+10,s1=depth/(depth+z1),s2=depth/(depth+z2);ctx.strokeStyle=`rgba(123,110,246,${.05*s1})`;ctx.beginPath();ctx.moveTo(vpx+(x-vpx)*s1,vpy+(h*.9-vpy)*s1);ctx.lineTo(vpx+(x-vpx)*s2,vpy+(h*.9-vpy)*s2);ctx.stroke();}}
    for(let z=40;z<far;z+=80){const zz=z-(off%80),s=depth/(depth+zz),y=vpy+(h*.9-vpy)*s,hw=spread*s;ctx.strokeStyle=`rgba(123,110,246,${.035*s})`;ctx.beginPath();ctx.moveTo(vpx-hw,y);ctx.lineTo(vpx+hw,y);ctx.stroke();}
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── TYPEWRITER ───────────────────────────────────────────────
(function(){
  const words=['enquêtes.','investigations.','recherches.','vérifications.'];
  let wi=0,ci=0,del=false;
  const el=document.getElementById('hero-type'); if(!el)return;
  function tick(){const w=words[wi];if(!del){el.textContent=w.slice(0,++ci);if(ci===w.length){del=true;setTimeout(tick,1800);return;}setTimeout(tick,60);}else{el.textContent=w.slice(0,--ci);if(ci===0){del=false;wi=(wi+1)%words.length;setTimeout(tick,300);return;}setTimeout(tick,35);}}
  setTimeout(tick,800);
})();

// ── INIT ─────────────────────────────────────────────────────
window.addEventListener('load',()=>{
  const saved=localStorage.getItem('bazaar_user');
  if(saved){currentUser=JSON.parse(saved); check48hVerif();}
  renderShop(); renderTools(); renderFounders(); renderPlans();
  initQuota();
});

function bootApp(){
  document.getElementById('login-screen').style.display='none';
  document.getElementById('main-screen').style.display='flex';
  document.getElementById('user-name-nav').textContent=currentUser.pseudo||currentUser.email.split('@')[0];
  updateQuotaUI(); startResetTimer();
  // track session
  sessionStart=Date.now();
  currentUser.lastLogin=new Date().toISOString();
  currentUser.loginCount=(currentUser.loginCount||0)+1;
  saveUser();
}

function saveUser(){ localStorage.setItem('bazaar_user',JSON.stringify(currentUser)); }

// ── 48H RE-VERIFY ────────────────────────────────────────────
function check48hVerif(){
  const last=currentUser.lastVerif||0;
  const h48=48*60*60*1000;
  if(Date.now()-last>h48){
    // Need re-verify
    showReVerify();
  } else {
    bootApp();
  }
}

function showReVerify(){
  document.getElementById('login-screen').style.display='flex';
  document.getElementById('step-email').style.display='none';
  document.getElementById('step-reverify').style.display='block';
  // Auto-send code
  const email=currentUser.email;
  pendingEmail=email;
  pendingCode=Math.floor(100000+Math.random()*900000).toString();
  document.getElementById('reverify-email').textContent=email;
  const payload={service_id:CONFIG.emailjs.serviceId,template_id:CONFIG.emailjs.templateId,user_id:CONFIG.emailjs.publicKey,template_params:{to_email:email,otp_code:pendingCode,from_name:'Bazaar — Vérification'}};
  fetch('https://api.emailjs.com/api/v1.0/email/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}).catch(()=>{});
  setLoginNote(`Code envoyé (démo: ${pendingCode})`,'inf','reverify-note');
}

function verifyReverify(){
  const input=document.getElementById('reverify-code').value.trim();
  if(input!==pendingCode){setLoginNote('Code incorrect.','err','reverify-note');return;}
  currentUser.lastVerif=Date.now(); saveUser();
  document.getElementById('step-reverify').style.display='none';
  bootApp();
}

// ── LOGIN ─────────────────────────────────────────────────────
async function sendCode(){
  const email=document.getElementById('email-input').value.trim();
  if(!email.includes('@')){setLoginNote('Email invalide.','err');return;}
  pendingEmail=email; pendingCode=Math.floor(100000+Math.random()*900000).toString();
  setLoginNote('Envoi en cours…','inf');
  const payload={service_id:CONFIG.emailjs.serviceId,template_id:CONFIG.emailjs.templateId,user_id:CONFIG.emailjs.publicKey,template_params:{to_email:email,otp_code:pendingCode,from_name:'Bazaar'}};
  try{const r=await fetch('https://api.emailjs.com/api/v1.0/email/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});showStep2(email,r.ok?'':'(code: '+pendingCode+')');}
  catch(e){showStep2(email,'(mode démo — code: '+pendingCode+')');}
}

function showStep2(email,extra){
  document.getElementById('email-show').textContent=email;
  document.getElementById('step-email').style.display='none';
  document.getElementById('step-code').style.display='block';
  setLoginNote(extra?'Code envoyé ! '+extra:'Code envoyé !',extra?'inf':'ok','login-note2');
}

function verifyCode(){
  const input=document.getElementById('code-input').value.trim();
  if(input!==pendingCode){setLoginNote('Code incorrect.','err','login-note2');return;}
  setLoginNote('✓ Connexion réussie !','ok','login-note2');
  const existing=localStorage.getItem('bazaar_user');
  if(existing){const u=JSON.parse(existing);if(u.email===pendingEmail){currentUser=u;currentUser.lastVerif=Date.now();saveUser();setTimeout(bootApp,400);return;}}
  currentUser={email:pendingEmail,joined:new Date().toISOString(),lastVerif:Date.now(),loginCount:0,totalSearches:0,weekSearches:{},monthSearches:{}};
  setTimeout(()=>{document.getElementById('login-screen').style.display='none';document.getElementById('pseudo-modal').classList.add('open');},400);
}

function savePseudo(){
  const p=document.getElementById('pseudo-input').value.trim();
  if(p.length<2){setNote('pseudo-note','Pseudo trop court.','err');return;}
  currentUser.pseudo=p; saveUser();
  document.getElementById('pseudo-modal').classList.remove('open');
  bootApp();
}

function resetLogin(){
  document.getElementById('step-email').style.display='block';
  document.getElementById('step-code').style.display='none';
  setLoginNote('');
}

function setLoginNote(msg,type='',id='login-note'){const el=document.getElementById(id);if(!el)return;el.textContent=msg;el.className='login-note '+type;}
function setNote(id,msg,type=''){const el=document.getElementById(id);if(!el)return;el.textContent=msg;el.className='modal-note '+type;}
function logout(){if(!confirm('Se déconnecter ?'))return;localStorage.removeItem('bazaar_user');location.reload();}

// ── DROPDOWN ─────────────────────────────────────────────────
function toggleDropdown(){
  const btn=document.querySelector('.user-menu-btn'),dd=document.getElementById('user-dropdown');
  const open=dd.classList.toggle('open');btn.classList.toggle('open',open);
}
document.addEventListener('click',e=>{if(!e.target.closest('.user-menu-wrap')){document.getElementById('user-dropdown')?.classList.remove('open');document.querySelector('.user-menu-btn')?.classList.remove('open');}});

// Credits click → open recharge modal
document.addEventListener('click',e=>{if(e.target.closest('.credits-pill'))openCreditsModal();});

function openCreditsModal(){
  const s=JSON.parse(localStorage.getItem('bzq')||'{"used":0,"max":5}');
  const left=Math.max(0,(s.max||5)-(s.used||0));
  const box=document.getElementById('profile-content');
  box.innerHTML=`
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:36px;font-weight:900;color:var(--yellow);font-family:'JetBrains Mono',monospace">${left}</div>
      <div style="font-size:12px;color:var(--text3);margin-top:4px;letter-spacing:1px;text-transform:uppercase">Crédits restants</div>
    </div>
    <div class="info-card" style="margin-bottom:14px;padding:16px">
      <p style="font-size:13px;color:var(--text2);line-height:1.8;margin-bottom:0">
        Pour recharger vos crédits, ouvrez un ticket sur notre Discord.<br>
        <strong style="color:var(--white)">Tarif : 1 crédit = 0.10€</strong><br>
        Paiement en LTC ou PayPal.
      </p>
    </div>
    <a href="${CONFIG.site.discord}" target="_blank" class="btn btn-discord" style="width:100%;justify-content:center">
      <img src="logo/discord.png" alt="">Recharger via Discord
    </a>`;
  document.getElementById('profile-modal').classList.add('open');
  document.querySelector('#profile-modal .modal-header h2').textContent='Recharger les crédits';
}

function openProfile(section){
  document.getElementById('user-dropdown')?.classList.remove('open');
  document.querySelector('.user-menu-btn')?.classList.remove('open');
  const box=document.getElementById('profile-content');
  document.querySelector('#profile-modal .modal-header h2').textContent='Mon profil';

  if(section==='pseudo'){
    box.innerHTML=`<label class="lbl">Nouveau pseudo</label>
      <input class="inp" type="text" id="pm-pseudo" placeholder="MonPseudo" maxlength="20" value="${esc(currentUser.pseudo||'')}">
      <button class="btn btn-primary" style="width:100%" onclick="saveNewPseudo()">Enregistrer</button>
      <p class="modal-note" id="pm-note"></p>`;
  } else if(section==='email'){
    box.innerHTML=`<p style="font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.7">Un code OTP sera envoyé à la nouvelle adresse.</p>
      <label class="lbl">Nouvel email</label>
      <input class="inp" type="email" id="pm-email" placeholder="nouveau@domaine.com">
      <button class="btn btn-primary" style="width:100%" onclick="changeEmailStep1()">Envoyer le code</button>
      <p class="modal-note" id="pm-note"></p>`;
  } else if(section==='coupon'){
    box.innerHTML=`<label class="lbl">Code</label>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input class="inp" style="margin-bottom:0;flex:1" type="text" id="pm-coupon" placeholder="••••••••••••" maxlength="30">
        <button class="btn btn-primary" style="white-space:nowrap;padding:0 18px" onclick="applyCouponModal()">Appliquer</button>
      </div>
      <p class="modal-note" id="pm-note"></p>`;
  } else if(section==='stats'){
    renderStats(box);
  }
  document.getElementById('profile-modal').classList.add('open');
}

function renderStats(box){
  const s=JSON.parse(localStorage.getItem('bzq')||'{"used":0,"max":5}');
  const left=Math.max(0,(s.max||5)-(s.used||0));
  const now=new Date();
  const weekKey=`w_${now.getFullYear()}_${getWeek(now)}`;
  const monthKey=`m_${now.getFullYear()}_${now.getMonth()}`;
  const weekS=(currentUser.weekSearches||{})[weekKey]||0;
  const monthS=(currentUser.monthSearches||{})[monthKey]||0;
  const totalS=currentUser.totalSearches||0;
  const todayS=s.used||0;
  const joinDate=currentUser.joined?new Date(currentUser.joined).toLocaleDateString('fr-FR'):'—';
  const lastLogin=currentUser.lastLogin?new Date(currentUser.lastLogin).toLocaleDateString('fr-FR'):'—';
  const timeOnSite=Math.floor((Date.now()-sessionStart)/60000);
  const logins=currentUser.loginCount||1;
  const vipActive=localStorage.getItem('bzaar_vip_'+currentUser.email)==='1';
  const plan=currentUser.plan||'Standard';
  box.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
    ${sRow('👤','Pseudo',currentUser.pseudo||'—')}
    ${sRow('✉','Email',currentUser.email)}
    ${sRow('📅','Inscrit le',joinDate)}
    ${sRow('🕐','Dernière connexion',lastLogin)}
    ${sRow('⏱','Session actuelle',timeOnSite+'min')}
    ${sRow('🔑','Connexions totales',logins)}
    ${sRow('🔍','Recherches aujourd\'hui',todayS)}
    ${sRow('📊','Recherches cette semaine',weekS)}
    ${sRow('📈','Recherches ce mois',monthS)}
    ${sRow('🔎','Recherches totales',totalS)}
    ${sRow('💛','Crédits restants',left+' / '+(s.max||5))}
    ${sRow('💰','Crédits utilisés (total)',Math.max(0,totalS))}
    ${sRow('🏅','Rang',getRank(totalS))}
    ${sRow('📦','Abonnement',plan)}
    ${sRow('👑','Accès VIP',vipActive?'✓ Actif':'✗ Inactif')}
    ${sRow('✅','Email vérifié','✓ Oui')}
  </div>`;
}

function sRow(icon,label,value){
  return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px">
    <div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-bottom:3px">${icon} ${label}</div>
    <div style="font-size:13px;font-weight:700;color:var(--text)">${value}</div>
  </div>`;
}

function getRank(n){
  if(n>=500)return'🏆 Expert';
  if(n>=200)return'💎 Avancé';
  if(n>=50) return'🥈 Intermédiaire';
  if(n>=10) return'🥉 Débutant+';
  return '🆕 Nouveau';
}

function getWeek(d){const s=new Date(d.getFullYear(),0,1);return Math.ceil(((d-s)/86400000+s.getDay()+1)/7);}

function closeProfile(){document.getElementById('profile-modal').classList.remove('open');}

function saveNewPseudo(){
  const p=document.getElementById('pm-pseudo')?.value.trim();
  if(!p||p.length<2){setNote('pm-note','Pseudo trop court.','err');return;}
  currentUser.pseudo=p; saveUser();
  document.getElementById('user-name-nav').textContent=p;
  setNote('pm-note','✓ Mis à jour !','ok'); setTimeout(closeProfile,900);
}

let newEmailPending=null,newEmailCode=null;
async function changeEmailStep1(){
  const email=document.getElementById('pm-email')?.value.trim();
  if(!email.includes('@')){setNote('pm-note','Email invalide.','err');return;}
  newEmailPending=email; newEmailCode=Math.floor(100000+Math.random()*900000).toString();
  const payload={service_id:CONFIG.emailjs.serviceId,template_id:CONFIG.emailjs.templateId,user_id:CONFIG.emailjs.publicKey,template_params:{to_email:email,otp_code:newEmailCode,from_name:'Bazaar'}};
  try{await fetch('https://api.emailjs.com/api/v1.0/email/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});}catch(e){}
  document.getElementById('profile-content').innerHTML=`
    <p style="font-size:13px;color:var(--text2);margin-bottom:16px">Code envoyé à <strong style="color:var(--white)">${esc(email)}</strong> (démo: ${newEmailCode})</p>
    <label class="lbl">Code reçu</label><input class="inp" type="text" id="pm-code" placeholder="000000" maxlength="6">
    <button class="btn btn-primary" style="width:100%" onclick="changeEmailStep2()">Confirmer</button>
    <p class="modal-note" id="pm-note"></p>`;
}
function changeEmailStep2(){
  const code=document.getElementById('pm-code')?.value.trim();
  if(code!==newEmailCode){setNote('pm-note','Code incorrect.','err');return;}
  currentUser.email=newEmailPending; saveUser();
  setNote('pm-note','✓ Email mis à jour !','ok'); setTimeout(closeProfile,900);
}

function applyCouponModal(){
  const code=document.getElementById('pm-coupon')?.value.trim().toUpperCase();
  const note=document.getElementById('pm-note');
  // Refund code
  if(code===CONFIG._codes.refund.toUpperCase()){
    const s=JSON.parse(localStorage.getItem('bzq')||'{"used":0,"max":5}');
    const left=Math.max(0,(s.max||5)-(s.used||0));
    if(left>0){setNote('pm-note','✗ Vous avez encore des crédits.','err');return;}
    const usedCodes=JSON.parse(localStorage.getItem('bzaar_used_codes')||'[]');
    const key=CONFIG._codes.refund.toUpperCase()+'_'+currentUser.email;
    if(usedCodes.includes(key)){setNote('pm-note','✗ Code déjà utilisé.','err');return;}
    s.used=0;s.max=5;
    // Reset timer: set exhausted time to now - 23h so next reset is in 1h
    localStorage.setItem('bzq',JSON.stringify(s));
    usedCodes.push(key);localStorage.setItem('bzaar_used_codes',JSON.stringify(usedCodes));
    updateQuotaUI();
    setNote('pm-note','✓ 5 crédits restaurés !','ok');
    notify('✅ Crédits restaurés !');
    setTimeout(closeProfile,1200); return;
  }
  // VIP code
  if(code===CONFIG._codes.vip.toUpperCase()){
    localStorage.setItem('bzaar_vip_'+currentUser.email,'1');
    setNote('pm-note','✓ Accès VIP activé !','ok');
    notify('👑 Accès VIP activé !');
    setTimeout(closeProfile,1200); return;
  }
  setNote('pm-note','✗ Code invalide.','err');
}

// ── NAV ──────────────────────────────────────────────────────
function gotoPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  document.getElementById('page-'+name)?.classList.add('active');
  const pages=['home','shop','tools','subs','features','contact','about'];
  const idx=pages.indexOf(name);
  if(idx>=0)document.querySelectorAll('.nav-link')[idx]?.classList.add('active');
  window.scrollTo(0,0);
}

// ── QUOTA (24h from exhaustion) ────────────────────────────────
function initQuota(){
  const q=JSON.parse(localStorage.getItem('bzq')||'null');
  if(!q){localStorage.setItem('bzq',JSON.stringify({used:0,max:5,exhaustedAt:null}));}
  updateQuotaUI();
}

function updateQuotaUI(){
  const s=JSON.parse(localStorage.getItem('bzq')||'{"used":0,"max":5}');
  const left=Math.max(0,(s.max||5)-(s.used||0));
  ['sq-left','sr-left'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=left;});
}

function startResetTimer(){
  setInterval(()=>{
    let s=JSON.parse(localStorage.getItem('bzq')||'{"used":0,"max":5}');
    const left=Math.max(0,(s.max||5)-(s.used||0));
    const qw=document.getElementById('quota-warn');
    const qt=document.getElementById('quota-timer');
    const srt=document.getElementById('sr-reset');
    if(left<=0){
      // If just exhausted, record the time
      if(!s.exhaustedAt){s.exhaustedAt=Date.now();localStorage.setItem('bzq',JSON.stringify(s));}
      const resetAt=s.exhaustedAt+24*3600*1000;
      const d=Math.max(0,resetAt-Date.now());
      if(d<=0){
        // Reset now
        s.used=0;s.exhaustedAt=null;localStorage.setItem('bzq',JSON.stringify(s));
        if(qw)qw.style.display='none';
        if(srt)srt.style.display='none';
        updateQuotaUI();
        notify('✅ Crédits réinitialisés !'); return;
      }
      const h=Math.floor(d/3600000),m=Math.floor((d%3600000)/60000),sec=Math.floor((d%60000)/1000);
      const str=`${pad(h)}h ${pad(m)}m ${pad(sec)}s`;
      if(qw)qw.style.display='flex';
      if(qt)qt.textContent=str;
      if(srt){srt.style.display='block';const el=document.getElementById('sr-timer');if(el)el.textContent=str;}
    }else{
      if(qw)qw.style.display='none';
      if(srt)srt.style.display='none';
    }
  },1000);
}
function pad(n){return String(n).padStart(2,'0');}

// ── SEARCH MODE ───────────────────────────────────────────────
function setSearchMode(mode){
  searchMode=mode;
  document.querySelectorAll('.mode-tab').forEach(t=>t.classList.remove('active'));
  document.querySelector(`.mode-tab[data-mode="${mode}"]`)?.classList.add('active');
  const row=document.getElementById('manual-select-row');
  if(row)row.style.display=mode==='manual'?'flex':'none';
}

function updateSelIcon(){
  const sel=document.getElementById('search-type');
  const opt=sel?.options[sel.selectedIndex];
  const img=document.getElementById('sel-icon-img');
  if(opt&&img)img.src=opt.getAttribute('data-icon')||'';
}

function detectType(q){
  if(!q)return'username';
  if(/^(\+\d{1,3}[\s-]?)?\d{6,15}$/.test(q.replace(/[\s\-\(\)\.]/g,'')))return'phone';
  if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q))return'mail';
  if(/^\d{17,20}$/.test(q))return'discord';
  if(/^(\d{1,3}\.){3}\d{1,3}$/.test(q)||/^([0-9a-fA-F]{1,4}:){2,7}/.test(q))return'ip';
  return'username';
}

// ── SEARCH ────────────────────────────────────────────────────
async function doSearch(){
  let s=JSON.parse(localStorage.getItem('bzq')||'{"used":0,"max":5}');
  const left=(s.max||5)-(s.used||0);
  if(left<=0){notify('⛔ Plus de crédits — utilisez un code ou rechargez',true);return;}
  const q=document.getElementById('search-input').value.trim();
  if(!q){notify('Entrez une cible.',true);return;}
  s.used++;
  if((s.max||5)-s.used<=0)s.exhaustedAt=Date.now();
  localStorage.setItem('bzq',JSON.stringify(s)); updateQuotaUI();
  // Track search stats
  if(currentUser){
    currentUser.totalSearches=(currentUser.totalSearches||0)+1;
    const now=new Date();
    const wk=`w_${now.getFullYear()}_${getWeek(now)}`;
    const mk=`m_${now.getFullYear()}_${now.getMonth()}`;
    if(!currentUser.weekSearches)currentUser.weekSearches={};
    if(!currentUser.monthSearches)currentUser.monthSearches={};
    currentUser.weekSearches[wk]=(currentUser.weekSearches[wk]||0)+1;
    currentUser.monthSearches[mk]=(currentUser.monthSearches[mk]||0)+1;
    saveUser();
  }
  const type=searchMode==='auto'?detectType(q):(document.getElementById('search-type')?.value||'username');
  const labels={phone:'📱 Téléphone',mail:'✉ Email',username:'👤 Username',discord:'💬 Discord ID',ip:'🌐 IP'};
  notify(`🔍 Recherche ${labels[type]||type}…`);
  const wrap=document.getElementById('results-wrap');
  wrap.innerHTML=`<div class="result-item"><h4>Recherche en cours… <span style="font-size:11px;font-weight:500;color:var(--accent);margin-left:8px">Type: ${labels[type]||type}</span></h4><p style="color:var(--blue)">Interrogation des sources pour <strong style="color:#fff">${esc(q)}</strong>…</p></div>`;
  try{wrap.innerHTML=await fetchOSINT(q,type);}
  catch(e){wrap.innerHTML=`<div class="result-item"><h4>Erreur</h4><p>Réessayez.</p></div>`;}
}

async function fetchOSINT(q,type){
  if(type==='ip'){
    try{const r=await fetch(`https://ipapi.co/${encodeURIComponent(q)}/json/`);const d=await r.json();if(d.error)throw'';
      return`<div class="result-item"><h4>🌐 IP Lookup — ${esc(q)}</h4><p>Pays : <strong>${d.country_name||'N/A'}</strong> (${d.country_code||'?'})<br>Région : <strong>${d.region||'N/A'}</strong> — Ville : <strong>${d.city||'N/A'}</strong><br>FAI / ASN : <strong>${d.org||'N/A'}</strong><br>Timezone : <strong>${d.timezone||'N/A'}</strong><br>Coordonnées : <strong>${d.latitude||'?'}, ${d.longitude||'?'}</strong></p><span class="result-tag">IPAPI.CO</span></div>`;}catch(e){return noRes(q);}
  }
  if(type==='username'){
    const ps=[{n:'GitHub',u:`https://github.com/${q}`,i:'logo/github.png'},{n:'Reddit',u:`https://reddit.com/u/${q}`,i:'logo/redit.png'},{n:'Twitter',u:`https://twitter.com/${q}`,i:'logo/twitter.png'},{n:'Instagram',u:`https://instagram.com/${q}`,i:'logo/insta.png'},{n:'TikTok',u:`https://tiktok.com/@${q}`,i:'logo/tiktok.png'},{n:'Twitch',u:`https://twitch.tv/${q}`,i:'logo/twitch.png'},{n:'Steam',u:`https://steamcommunity.com/id/${q}`,i:'logo/steam.png'},{n:'Pinterest',u:`https://pinterest.com/${q}`,i:'logo/pinterest.png'},{n:'SoundCloud',u:`https://soundcloud.com/${q}`,i:'logo/soundcloud.png'},{n:'Spotify',u:`https://open.spotify.com/user/${q}`,i:'logo/spotify.png'},{n:'Snapchat',u:`https://snapchat.com/add/${q}`,i:'logo/snap.png'},{n:'Roblox',u:`https://roblox.com/users/profile?username=${q}`,i:'logo/roblox.png'}];
    const links=ps.map(p=>`<a href="${p.u}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;color:var(--blue);text-decoration:none;font-size:12px;margin-right:14px;margin-bottom:4px;font-family:'JetBrains Mono',monospace"><img src="${p.i}" style="width:13px;height:13px">${p.n} ↗</a>`).join('');
    return`<div class="result-item"><h4>👤 Username — ${esc(q)}</h4><div style="line-height:2.4;margin-bottom:6px">${links}</div><span class="result-tag">MULTI-PLATFORM</span></div>`;
  }
  if(type==='mail'){const enc=encodeURIComponent(q),dom=q.split('@')[1]||'';return`<div class="result-item"><h4>✉ Email — ${esc(q)}</h4><p>Domaine : <strong>${esc(dom)}</strong><br><a href="https://haveibeenpwned.com/account/${enc}" target="_blank" style="color:var(--blue)">HaveIBeenPwned ↗</a><br><a href="https://hunter.io/email-verifier/${enc}" target="_blank" style="color:var(--blue)">Hunter.io ↗</a><br><a href="https://www.google.com/search?q=%22${enc}%22" target="_blank" style="color:var(--blue)">Google ↗</a></p><span class="result-tag">HIBP · HUNTER.IO · GOOGLE</span></div>`;}
  if(type==='phone'){return`<div class="result-item"><h4>📱 Téléphone — ${esc(q)}</h4><p><a href="https://www.numlookup.com/?number=${encodeURIComponent(q)}" target="_blank" style="color:var(--blue)">NumLookup ↗</a><br><a href="https://sync.me/search/?number=${encodeURIComponent(q)}" target="_blank" style="color:var(--blue)">Sync.me ↗</a><br><a href="https://www.google.com/search?q=%22${encodeURIComponent(q)}%22" target="_blank" style="color:var(--blue)">Google ↗</a></p><span class="result-tag">NUMLOOKUP · SYNC.ME</span></div>`;}
  if(type==='discord'){return`<div class="result-item"><h4>💬 Discord ID — ${esc(q)}</h4><p>Compte créé le : <strong>${discordTs(q)}</strong><br><a href="https://discord.id/?prefill=${encodeURIComponent(q)}" target="_blank" style="color:var(--blue)">discord.id ↗</a><br><a href="https://discordlookup.com/user/${encodeURIComponent(q)}" target="_blank" style="color:var(--blue)">discordlookup.com ↗</a></p><span class="result-tag">DISCORD.ID · DISCORDLOOKUP</span></div>`;}
  return noRes(q);
}
function discordTs(id){try{return new Date(Number(BigInt(id)>>22n)+1420070400000).toLocaleDateString('fr-FR');}catch{return'ID invalide';}}
function noRes(q){return`<div class="result-item"><h4>Aucun résultat</h4><p>Aucune donnée pour <strong>${esc(q)}</strong>.</p></div>`;}

// ── RENDER SHOP ───────────────────────────────────────────────
function renderShop(filter='Discord'){
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b.getAttribute('data-filter')===filter));
  const vipActive=currentUser&&localStorage.getItem('bzaar_vip_'+currentUser.email)==='1';
  let items=CONFIG.shop.filter(i=>i.category===filter);
  if(filter==='Premium'&&!vipActive)items=items.map(i=>({...i,locked:true}));
  document.getElementById('shop-grid').innerHTML=items.map(item=>`
    <div class="item-card${item.premium?' premium-card':''}${item.locked?' locked-card':''}" onclick="${item.locked?'notifyVipRequired()':'openItem(\''+item.id+'\',\'shop\')'}">
      <div class="card-img">
        ${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="">`:item.icon}
        ${item.premium?'<span class="premium-crown">👑</span>':''}
        ${item.locked?'<div class="lock-overlay">🔒</div>':''}
      </div>
      <div class="card-body-inner">
        <div class="card-name">${item.name}</div>
        <div class="card-cat">${item.category}</div>
        <p class="card-desc-text">${item.locked?'Contenu réservé.':item.desc.substring(0,80)+'…'}</p>
      </div>
      <div class="card-footer-inner">
        <span class="card-price${item.premium?' premium-price':''}">${item.locked?'🔒 Accès restreint':item.price}</span>
        <button class="btn-sm">${item.locked?'Voir':'Voir'}</button>
      </div>
    </div>`).join('');
}

// ── RENDER TOOLS ─────────────────────────────────────────────
function renderTools(){
  const vipActive=currentUser&&localStorage.getItem('bzaar_vip_'+currentUser.email)==='1';
  const items=CONFIG.tools.filter(i=>!i.vip||(i.vip&&vipActive));
  const locked=CONFIG.tools.filter(i=>i.vip&&!vipActive);
  document.getElementById('tools-grid').innerHTML=[...items.map(item=>`
    <div class="item-card${item.vip?' premium-card':''}" onclick="openItem('${item.id}','tools')">
      <div class="card-img">
        ${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="">`:item.icon}
        ${item.vip?'<span class="premium-crown">👑</span>':''}
      </div>
      <div class="card-body-inner">
        <div class="card-name">${item.name}</div>
        <div class="card-cat">${item.category}</div>
        <p class="card-desc-text">${item.desc.substring(0,80)}…</p>
      </div>
      <div class="card-footer-inner">
        <span class="card-free">✓ Gratuit</span>
        <button class="btn-sm">Télécharger</button>
      </div>
    </div>`),
    ...locked.map(item=>`
    <div class="item-card premium-card locked-card" onclick="notifyVipRequired()">
      <div class="card-img">
        ${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="">`:item.icon}
        <div class="lock-overlay">🔒</div>
      </div>
      <div class="card-body-inner">
        <div class="card-name">${item.name}</div>
        <div class="card-cat">${item.category}</div>
        <p class="card-desc-text">Contenu réservé.</p>
      </div>
      <div class="card-footer-inner">
        <span class="card-price premium-price">🔒 Accès restreint</span>
        <button class="btn-sm">Voir</button>
      </div>
    </div>`)
  ].join('');
}

function notifyVipRequired(){notify('🔒 Accès restreint — entrez votre code dans le menu profil',true);}

// ── RENDER PLANS ─────────────────────────────────────────────
function renderPlans(){
  const container=document.getElementById('plans-grid');
  if(!container)return;
  container.innerHTML=CONFIG.plans.map(p=>`
    <div class="plan-card${p.highlight?' plan-highlight':''}">
      ${p.highlight?'<div class="plan-best">👑 BEST VALUE</div>':''}
      <div class="plan-name" style="color:${p.color}">${p.name}</div>
      <div class="plan-subtitle">${p.subtitle}</div>
      <div class="plan-price">${p.price}<span class="plan-period"> ${p.period}</span></div>
      <div class="plan-searches-badge">${p.searches>=999999?'Illimitées':p.searches} recherches/jour</div>
      <hr style="border:none;border-top:1px solid var(--border);margin:16px 0">
      <ul class="plan-features">
        ${p.features.map(f=>`<li class="${f.ok?'ok':'no'}"><span class="plan-check">${f.ok?'✓':'✗'}</span>${f.text}</li>`).join('')}
      </ul>
      <a href="${CONFIG.site.discord}" target="_blank" class="btn-plan-cta${p.highlight?' btn-plan-cta-hl':''}">
        <img src="logo/discord.png" alt="">
        ${p.price==='0€'?'Plan actuel':'S\'abonner via Discord'}
      </a>
      <p class="plan-ticket-note">Ouvrez un ticket sur Discord pour activer votre abonnement</p>
    </div>`).join('');
}

// ── RENDER FOUNDERS ───────────────────────────────────────────
function renderFounders(){
  const container=document.getElementById('founders-grid');
  if(!container)return;
  container.innerHTML=CONFIG.founders.map(f=>`
    <div class="team-card">
      <span class="t-crown">👑</span>
      <div class="t-name">${f.name}</div>
      <div class="t-role">${f.role}</div>
      <div class="t-links" style="margin-top:10px">
        <a href="https://discord.com/users/" target="_blank" class="t-link"><img src="logo/discord.png" alt="">${f.discord}</a>
        <a href="${f.gunslol}" target="_blank" class="t-link"><img src="logo/gunslol.png" alt="">${f.gunslolLabel}</a>
      </div>
    </div>`).join('');
}

// ── ITEM VIEW ─────────────────────────────────────────────────
function openItem(id,src){
  const item=src==='shop'?CONFIG.shop.find(i=>i.id===id):CONFIG.tools.find(i=>i.id===id);
  if(!item)return;
  currentItemForDl=item;
  document.getElementById('iv-name').textContent=item.name;
  document.getElementById('iv-cat').textContent=(item.category||'').toUpperCase();
  document.getElementById('iv-desc').textContent=item.desc;
  document.getElementById('iv-img').innerHTML=item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="">`:`<span style="font-size:58px">${item.icon}</span>`;
  const pe=document.getElementById('iv-price');
  if(src==='tools'){pe.textContent='✓ Gratuit';pe.className='iv-price free';}
  else{pe.textContent=item.price;pe.className='iv-price'+(item.premium?' premium-price':'');}
  document.getElementById('iv-free-section').style.display=src==='tools'?'block':'none';
  document.getElementById('iv-pay-section').style.display=src==='shop'?'block':'none';
  document.getElementById('item-view').classList.add('open');
  window.scrollTo(0,0);
}
function closeItemView(){document.getElementById('item-view').classList.remove('open');}
function downloadTool(){
  if(!currentItemForDl)return;
  const blob=new Blob([currentItemForDl.dlContent||`=== ${currentItemForDl.name} ===\ndiscord.gg/ssYFSXRGPP`],{type:'text/plain;charset=utf-8'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(currentItemForDl.name||'tool').replace(/[^a-z0-9]/gi,'_').toLowerCase()+'.txt';a.click();URL.revokeObjectURL(a.href);
  notify('⬇ Téléchargement lancé !');
}

// ── NOTIFY ───────────────────────────────────────────────────
let nq=[],nActive=false;
function notify(msg,err=false){nq.push({msg,err});if(!nActive)processNotif();}
function processNotif(){
  if(!nq.length){nActive=false;return;}nActive=true;
  const {msg,err}=nq.shift();
  const el=document.getElementById('notif');
  el.textContent=msg;el.className='notif show'+(err?' notif-err':'');
  clearTimeout(el._t);el._t=setTimeout(()=>{el.className='notif';setTimeout(processNotif,300);},2800);
}

// ── UTILS ────────────────────────────────────────────────────
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function copyLTC(){navigator.clipboard.writeText(CONFIG.site.ltcAddress).then(()=>notify('✓ Adresse LTC copiée !'));}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeItemView();closeProfile();}if(e.key==='Enter'){if(document.getElementById('step-code')?.style.display!=='none')verifyCode();else if(document.getElementById('reverify-code')&&document.getElementById('step-reverify').style.display!=='none')verifyReverify();else if(document.getElementById('email-input')?.value)sendCode();}});