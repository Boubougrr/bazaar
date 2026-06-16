// ============================================================
//  BAZAAR — APP.JS v6
// ============================================================
let currentUser = null;
let currentItemForDl = null;
let searchMode = 'auto';
let searchCooldown = false;
let cooldownEnd = 0;
let sessionStart = Date.now();

// ── TRANSLATIONS ──────────────────────────────────────────────
const I18N = {
  fr: {
    home:'Accueil',shop:'Boutique',subs:'Abonnements',features:'Fonctionnalités',
    contact:'Contact',about:'À propos',settings:'Paramètres',language:'Langue',
    theme:'Thème',cursor:'Curseur',animations:'Animations',searchMode:'Mode recherche',
    login:'Se connecter',signup:'Créer un compte',welcomeBack:'Bon retour',
    loginSub:'Connectez-vous pour accéder à la plateforme.',
    email:'Email',password:'Mot de passe',loginBtn:'Se connecter',
    or:'ou',noAccount:'Pas encore de compte ?',hasAccount:'Déjà un compte ?',
    createAccount:'Créer un compte',signupSub:'Rejoignez Bazaar — gratuit, rapide, sécurisé.',
    pseudo:'Pseudo',confirmPassword:'Confirmer le mot de passe',createBtn:'Créer mon compte',
    heroSub:'Nom, email, téléphone, IP, Discord ID — croisez des millions d\'enregistrements.',
    startSearch:'Commencer une recherche',joinDiscord:'Rejoindre le Discord',
    credits:'crédits',
  },
  en: {
    home:'Home',shop:'Shop',subs:'Subscriptions',features:'Features',
    contact:'Contact',about:'About',settings:'Settings',language:'Language',
    theme:'Theme',cursor:'Cursor',animations:'Animations',searchMode:'Search mode',
    login:'Login',signup:'Create account',welcomeBack:'Welcome back',
    loginSub:'Log in to access the platform.',
    email:'Email',password:'Password',loginBtn:'Login',
    or:'or',noAccount:'No account yet?',hasAccount:'Already have an account?',
    createAccount:'Create account',signupSub:'Join Bazaar — free, fast, secure.',
    pseudo:'Username',confirmPassword:'Confirm password',createBtn:'Create my account',
    heroSub:'Name, email, phone, IP, Discord ID — cross millions of records in seconds.',
    startSearch:'Start a search',joinDiscord:'Join Discord',
    credits:'credits',
  }
};

// ── SETTINGS ──────────────────────────────────────────────────
const SETTINGS_DEFAULTS = { lang:'fr', theme:'dark', cursor:true, anim:true, searchMode:'auto' };
let settings = { ...SETTINGS_DEFAULTS };

function loadSettings(){
  const saved = localStorage.getItem('bzr_settings');
  if(saved){ try{ settings = { ...SETTINGS_DEFAULTS, ...JSON.parse(saved) }; }catch(e){} }
  applySettings();
}

function saveSettings(){ localStorage.setItem('bzr_settings', JSON.stringify(settings)); }

function applySettings(){
  document.body.classList.toggle('theme-darker', settings.theme === 'darker');
  document.body.classList.toggle('custom-cursor', settings.cursor);
  applyLang(settings.lang);
  
  document.querySelectorAll('.setting-btn').forEach(btn => {
    const id = btn.id;
    if(id.includes('lang-' + settings.lang)) btn.classList.add('active');
    else if(id.includes('lang-')) btn.classList.remove('active');
    if(id.includes('theme-' + settings.theme)) btn.classList.add('active');
    else if(id.includes('theme-')) btn.classList.remove('active');
    if(id.includes('cursor-' + (settings.cursor ? 'on' : 'off'))) btn.classList.add('active');
    else if(id.includes('cursor-')) btn.classList.remove('active');
    if(id.includes('anim-' + (settings.anim ? 'on' : 'off'))) btn.classList.add('active');
    else if(id.includes('anim-')) btn.classList.remove('active');
    if(id.includes('sm-' + settings.searchMode)) btn.classList.add('active');
    else if(id.includes('sm-')) btn.classList.remove('active');
  });
}

function applyLang(lang){
  const t = I18N[lang] || I18N.fr;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(t[key]) el.textContent = t[key];
  });
  document.documentElement.setAttribute('lang', lang);
}

function setLang(lang){ settings.lang=lang; saveSettings(); applySettings(); }
function setTheme(t){ settings.theme=t; saveSettings(); applySettings(); }
function setCursor(v){ settings.cursor=v; saveSettings(); applySettings(); }
function setAnim(v){ settings.anim=v; saveSettings(); applySettings(); }
function setDefaultSearchMode(m){ settings.searchMode=m; saveSettings(); applySettings(); setSearchMode(m); }

function openSettings(){
  document.getElementById('settings-modal').classList.add('open');
}
function closeSettings(){ document.getElementById('settings-modal')?.classList.remove('open'); }

function toggleGear(){ openSettings(); }
function toggleAuthGear(){ openSettings(); }

// ── CURSOR ────────────────────────────────────────────────────
const cursorEl = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursorEl.style.left = e.clientX + 'px';
  cursorEl.style.top  = e.clientY + 'px';
  document.documentElement.style.setProperty('--mx', e.clientX + 'px');
  document.documentElement.style.setProperty('--my', e.clientY + 'px');
}, { passive: true });
document.addEventListener('mousedown', () => cursorEl.classList.add('click'));
document.addEventListener('mouseup',   () => cursorEl.classList.remove('click'));
const hQ = 'a,button,.nav-link,.item-card,.filter-btn,.mode-tab,.plan-card,.dd-item,.btn,.credits-pill,.auth-tab,.setting-btn';
document.addEventListener('mouseover', e => { if(e.target.closest(hQ)) cursorEl.classList.add('hover'); });
document.addEventListener('mouseout',  e => { if(e.target.closest(hQ)) cursorEl.classList.remove('hover'); });

// ── BG CANVAS ─────────────────────────────────────────────────
(function(){
  const c = document.getElementById('bg-canvas'), ctx = c.getContext('2d');
  let w, h; function resize(){ w=c.width=innerWidth; h=c.height=innerHeight; }
  window.addEventListener('resize', resize, {passive:true}); resize();
  let off = 0;
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

// ── TYPEWRITER ────────────────────────────────────────────────
(function(){
  const words=['enquêtes.','investigations.','recherches.','vérifications.'];
  let wi=0,ci=0,del=false;
  const el=document.getElementById('hero-type'); if(!el)return;
  function tick(){const w=words[wi];if(!del){el.textContent=w.slice(0,++ci);if(ci===w.length){del=true;setTimeout(tick,1800);return;}setTimeout(tick,60);}else{el.textContent=w.slice(0,--ci);if(ci===0){del=false;wi=(wi+1)%words.length;setTimeout(tick,300);return;}setTimeout(tick,35);}}
  setTimeout(tick,800);
})();

// ── API HELPER ────────────────────────────────────────────────
async function api(path, body){
  try {
    const r = await fetch('/api/'+path, {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
    });
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { throw new Error('Erreur serveur (Réponse invalide).'); }
    if(!r.ok) throw new Error(data.error || 'Erreur serveur');
    return data;
  } catch(e) { throw e; }
}

// ── INIT ──────────────────────────────────────────────────────
async function initApp() {
  try { loadSettings(); } catch(e) {}
  try {
    const saved = localStorage.getItem('bzr_session');
    if(saved && saved !== 'undefined'){
      try { currentUser = JSON.parse(saved); } catch(e) {}
    }
  } catch(e) {}
  bootApp(true);
  if(currentUser && currentUser.id){
    try {
      const res = await api('get-user', { user_id: currentUser.id });
      saveSession(res.user);
      currentUser = res.user;
      bootApp(true);
    } catch(e) {}
  }
  try {
    generateCaptcha(); initAuthEvents();
    renderShop('Discord'); renderTools(); renderFounders(); renderPlans();
    document.querySelector('.credits-pill')?.addEventListener('click', openCreditsModal);
    setSearchMode(settings.searchMode);
  } catch(e) { console.error('Post-boot init failed', e); }
}

if(document.readyState === 'complete') initApp();
else window.addEventListener('load', initApp);

function bootApp(silent = false){
  try {
    const navAuth = document.getElementById('nav-auth-only'), navLogin = document.getElementById('nav-login-btn');
    const badge = document.getElementById('dev-badge'), mainScreen = document.getElementById('main-screen');
    if(mainScreen) mainScreen.style.display='flex';
    if(!currentUser) {
      document.getElementById('auth-screen')?.classList.add('hidden');
      if(navAuth) navAuth.style.display='none';
      if(navLogin) navLogin.style.display='block';
      if(badge) badge.style.display='none';
      ['shop','tools','subs','features','contact','about'].forEach(id => {
        const el = document.getElementById('nav-'+id);
        if(el) {
          el.classList.add('locked-nav');
          el.setAttribute('onclick', "notify('🔑 Connexion requise pour accéder à cette section.', true); switchAuthTab('login'); document.getElementById('auth-screen').classList.remove('hidden')");
          el.style.textDecoration = 'line-through'; el.style.opacity = '0.5';
          if(!el.querySelector('.nav-lock')) { const lock = document.createElement('span'); lock.className = 'nav-lock'; lock.innerHTML = ' 🔒'; lock.style.fontSize = '10px'; el.appendChild(lock); }
        }
      });
      return;
    }
    document.getElementById('auth-screen')?.classList.add('hidden');
    if(navAuth) navAuth.style.display='contents';
    if(navLogin) navLogin.style.display='none';
    const name = currentUser.pseudo || (currentUser.email ? currentUser.email.split('@')[0] : 'Utilisateur');
    const nameEl = document.getElementById('user-name-nav');
    if(nameEl) nameEl.textContent = name;
    ['shop','tools','subs','features','contact','about'].forEach(id => {
      const el = document.getElementById('nav-'+id);
      if(el) {
        el.classList.remove('locked-nav'); el.setAttribute('onclick', `gotoPage('${id}')`);
        el.style.textDecoration = 'none'; el.style.opacity = '1'; el.querySelector('.nav-lock')?.remove();
      }
    });
    if(badge) badge.style.display = currentUser.role === 'dev' ? 'block' : 'none';
    applyUserStyling();
    startResetTimer(); updateCreditsUI();
    if(!silent) notify('👋 Bienvenue, ' + name + '!');
    loadReviews();
  } catch(e) { console.error('bootApp crashed', e); }
}

function applyUserStyling() {
  const nameNav = document.getElementById('user-name-nav');
  if(!nameNav || !currentUser) return;
  if(currentUser.email === 'phoenix.guecko@gmail.com') {
    nameNav.style.background = 'linear-gradient(90deg, #ff4d4d, #ff0000)'; nameNav.style.webkitBackgroundClip = 'text'; nameNav.style.webkitTextFillColor = 'transparent'; nameNav.style.fontWeight = '900';
  } else if(currentUser.email === 'veritysuite@gmail.com') {
    nameNav.style.background = 'linear-gradient(90deg, #ff7e5f, #feb47b)'; nameNav.style.webkitBackgroundClip = 'text'; nameNav.style.webkitTextFillColor = 'transparent'; nameNav.style.fontWeight = '900';
  }
}

function saveSession(u){ currentUser=u; localStorage.setItem('bzr_session',JSON.stringify(u)); }

// ── AUTH ──────────────────────────────────────────────────────
function switchAuthTab(tab){
  document.querySelectorAll('.auth-tab').forEach((t,i)=>t.classList.toggle('active',(i===0&&tab==='login')||(i===1&&tab==='signup')));
  document.getElementById('auth-login').classList.toggle('active',tab==='login');
  document.getElementById('auth-signup').classList.toggle('active',tab==='signup');
}
async function doLogin(){
  const email=document.getElementById('login-email').value.trim(), pass=document.getElementById('login-password').value;
  if(!email.includes('@')){ setAuthNote('login-note','Email invalide.','err'); return; }
  if(!pass){ setAuthNote('login-note','Mot de passe requis.','err'); return; }
  setAuthNote('login-note','Connexion…','inf');
  try{
    const res=await api('login',{email,password:pass});
    saveSession(res.user); setAuthNote('login-note','✓ Connecté !','ok'); setTimeout(() => { bootApp(); }, 400);
  }catch(e){ setAuthNote('login-note',e.message,'err'); }
}

// ── CAPTCHA ───────────────────────────────────────────────────
let captchaSolved = false;
function generateCaptcha() {
  const game = document.getElementById('captcha-game'); if(!game) return;
  game.innerHTML = ''; captchaSolved = false; updateSignupBtn();
  const shapes = ['square', 'square', 'square', 'triangle']; shapes.sort(() => Math.random() - 0.5);
  shapes.forEach(type => {
    const el = document.createElement('div'); el.className = `captcha-shape ${type}`;
    el.onclick = () => {
      if(type === 'triangle') {
        captchaSolved = true; document.getElementById('captcha-status').textContent = '✓ Vérification réussie !';
        document.getElementById('captcha-status').style.color = 'var(--green)'; game.style.opacity = '0.5'; game.style.pointerEvents = 'none';
      } else { notify('❌ Raté ! Réessayez.', true); generateCaptcha(); }
      updateSignupBtn();
    };
    game.appendChild(el);
  });
}
function updateSignupBtn() { const btn = document.querySelector('#auth-signup .btn-primary'); const rules = document.getElementById('signup-accept-rules')?.checked; if(btn) btn.disabled = !rules || !captchaSolved; }
function initAuthEvents() {
  const rulesCheck = document.getElementById('signup-accept-rules'); if(rulesCheck) rulesCheck.onchange = updateSignupBtn;
  const signupBtn = document.querySelector('#auth-signup .btn-primary'); if(signupBtn) signupBtn.onclick = () => { if(!captchaSolved) { notify('⚠️ Veuillez compléter le mini-jeu.', true); return; } doSignup(); };
}

// ── SIGNUP ────────────────────────────────────────────────────
async function doSignup(){
  const pseudo=document.getElementById('signup-pseudo').value.trim(), email=document.getElementById('signup-email').value.trim(), pass=document.getElementById('signup-password').value, confirm=document.getElementById('signup-confirm').value;
  if(pseudo.length<2){setAuthNote('signup-note','Pseudo trop court.','err');return;}
  if(!email.includes('@')){setAuthNote('signup-note','Email invalide.','err');return;}
  if(pass.length<8){setAuthNote('signup-note','Mot de passe trop court.','err');return;}
  if(pass!==confirm){setAuthNote('signup-note','Les mots de passe ne correspondent pas.','err');return;}
  setAuthNote('signup-note','Création du compte…','inf');
  try{
    const res=await api('signup',{email,pseudo,password:pass});
    saveSession(res.user); setAuthNote('signup-note','✓ Compte créé !','ok'); setTimeout(bootApp,400);
  }catch(e){setAuthNote('signup-note',e.message,'err');}
}

function setAuthNote(id,msg,type=''){ const el=document.getElementById(id);if(!el)return;el.textContent=msg;el.className='auth-note '+type; }
function setNote(id,msg,type=''){ const el=document.getElementById(id);if(!el)return;el.textContent=msg;el.className='modal-note '+type; }
function logout(){ if(!confirm('Se déconnecter ?'))return; localStorage.removeItem('bzr_session'); location.reload(); }

// ── DROPDOWN ─────────────────────────────────────────────────
function toggleDropdown(){
  const btn=document.querySelector('.user-menu-btn'),dd=document.getElementById('user-dropdown');
  const open=dd.classList.toggle('open'); btn.classList.toggle('open',open);
}
document.addEventListener('click',e=>{
  if(!e.target.closest('#gear-wrap')){document.getElementById('gear-dropdown')?.classList.remove('open');}
  if(!e.target.closest('#auth-gear-wrap')){document.getElementById('auth-gear-dropdown')?.classList.remove('open');}
  if(!e.target.closest('.user-menu-wrap')){document.getElementById('user-dropdown')?.classList.remove('open');document.querySelector('.user-menu-btn')?.classList.remove('open');}
});

function openCreditsModal(){
  const left=getCreditsLeft();
  document.querySelector('#profile-modal .modal-header h2').textContent='Crédits';
  document.getElementById('profile-content').innerHTML=`
    <div style="text-align:center;margin-bottom:20px">
      <div style="font-size:40px;font-weight:900;color:var(--yellow);font-family:'JetBrains Mono',monospace">${left}</div>
      <div style="font-size:12px;color:var(--text3);margin-top:4px;letter-spacing:1px;text-transform:uppercase">Crédits restants</div>
    </div>
    <div class="info-card" style="margin-bottom:14px;padding:16px">
      <p style="font-size:13px;color:var(--text2);line-height:1.8;margin-bottom:0">Pour recharger, ouvrez un ticket sur Discord.<br><strong style="color:var(--white)">Tarif : 1 crédit = 0.25€</strong><br>Paiement LTC ou PayPal F&F.</p>
    </div>
    <a href="${CONFIG.site.discord}" target="_blank" class="btn btn-discord" style="width:100%;justify-content:center"><img src="logo/discord.png" alt="">Recharger via Discord</a>`;
  document.getElementById('profile-modal').classList.add('open');
}

function openProfile(section){
  document.getElementById('user-dropdown')?.classList.remove('open'); document.querySelector('.user-menu-btn')?.classList.remove('open');
  const box=document.getElementById('profile-content'); document.querySelector('#profile-modal .modal-header h2').textContent='Mon profil';
  if(section==='stats'){ document.querySelector('#profile-modal .modal-header h2').textContent='Statistiques'; renderStats(box); }
  else if(section==='coupon'){ box.innerHTML=`<label class="lbl">Code</label><div style="display:flex;gap:8px;margin-bottom:12px"><input class="inp" style="margin-bottom:0;flex:1" type="text" id="pm-coupon" placeholder="••••" maxlength="30"><button class="btn btn-primary" onclick="applyCoupon()">Appliquer</button></div><p class="modal-note" id="pm-note"></p>`; }
  document.getElementById('profile-modal').classList.add('open');
}

function renderStats(box){
  if(!currentUser)return;
  const left=getCreditsLeft(); const creditsStr = currentUser.role === 'dev' ? 'Illimités' : (left+' / '+(currentUser.credits_max||5));
  box.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
    ${sRow('👤','Pseudo',esc(currentUser.pseudo||'—'))} ${sRow('✉','Email',esc(currentUser.email))}
    ${sRow('💛','Crédits',creditsStr)} ${sRow('📦','Plan',esc(currentUser.plan||'standard'))}
    ${sRow('🔎','Total Searches',currentUser.total_searches||0)} ${sRow('👑','Role',esc(currentUser.role==='dev'?'FOUNDER':currentUser.role))}
  </div>`;
}
function sRow(i,l,v){return`<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px"><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-bottom:3px">${i} ${l}</div><div style="font-size:13px;font-weight:700;color:var(--text)">${v}</div></div>`;}
function closeProfile(){document.getElementById('profile-modal').classList.remove('open');}

async function applyCoupon(){
  const code=document.getElementById('pm-coupon')?.value.trim(); if(!code){setNote('pm-note','Entrez un code.','err');return;}
  try{
    const res=await api('coupon',{user_id:currentUser.id,code}); saveSession({...currentUser,...res.user}); updateCreditsUI();
    if(res.type==='vip')notify('👑 Accès VIP activé !'); else if(res.type==='refund')notify('✅ Crédits restaurés !');
    setNote('pm-note','✓ Code appliqué !','ok'); setTimeout(closeProfile,1200);
  }catch(e){setNote('pm-note',e.message,'err');}
}

function gotoPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  document.getElementById('page-'+name)?.classList.add('active');
  const pages=['home','shop','tools','subs','features','contact','about'];
  const idx=pages.indexOf(name); if(idx>=0)document.querySelectorAll('.nav-link')[idx]?.classList.add('active');
  window.scrollTo(0,0);
}

function getCreditsLeft(){ if(!currentUser)return 0; return Math.max(0,(currentUser.credits_max||5)-(currentUser.credits_used||0)); }
function updateCreditsUI(){ const left=getCreditsLeft(); const d = (currentUser && currentUser.role === 'dev') ? '∞' : left; ['sq-left','sr-left'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=d;}); }
function startResetTimer(){
  setInterval(()=>{
    if(!currentUser)return; const left=getCreditsLeft(); const qw=document.getElementById('quota-warn'),qt=document.getElementById('quota-timer'),srt=document.getElementById('sr-reset');
    if(left<=0&&currentUser.credits_exhausted_at){
      const resetAt=new Date(currentUser.credits_exhausted_at).getTime()+24*3600*1000, d=Math.max(0,resetAt-Date.now());
      if(d<=0){currentUser.credits_used=0;currentUser.credits_exhausted_at=null;saveSession(currentUser);if(qw)qw.style.display='none';if(srt)srt.style.display='none';updateCreditsUI();notify('✅ Crédits réinitialisés !');return;}
      const str=`${pad(Math.floor(d/3600000))}h ${pad(Math.floor((d%3600000)/60000))}m ${pad(Math.floor((d%60000)/1000))}s`;
      if(qw)qw.style.display='flex';if(qt)qt.textContent=str; if(srt){srt.style.display='block';const el=document.getElementById('sr-timer');if(el)el.textContent=str;}
    }else{if(qw)qw.style.display='none';if(srt)srt.style.display='none';}
    if(searchCooldown){ const r=Math.ceil((cooldownEnd-Date.now())/1000); if(r<=0){searchCooldown=false;const btn=document.getElementById('search-btn');if(btn){btn.disabled=false;btn.textContent='Rechercher';}document.getElementById('search-cooldown').className='search-cooldown';} else{const btn=document.getElementById('search-btn');if(btn)btn.textContent=`⏳ ${r}s`;const cd=document.getElementById('search-cooldown');if(cd){cd.className='search-cooldown show';cd.textContent=`Prochaine recherche dans ${r}s`;}} }
  },1000);
}
function pad(n){return String(n).padStart(2,'0');}

function setSearchMode(mode){
  searchMode=mode; document.querySelectorAll('.mode-tab').forEach(t=>t.classList.remove('active')); document.querySelector(`.mode-tab[data-mode="${mode}"]`)?.classList.add('active');
  const row=document.getElementById('manual-select-row'); if(row)row.style.display=mode==='manual'?'flex':'none';
  const si=document.getElementById('search-input'); if(si)si.placeholder=mode==='manual'?'Entrez votre cible…':'Entrez une cible (auto-détection du type)…';
}
function updateSelIcon(){ const sel=document.getElementById('search-type'),opt=sel?.options[sel.selectedIndex],img=document.getElementById('sel-icon-img'); if(opt&&img)img.src=opt.getAttribute('data-icon')||''; }
function detectType(q){ if(!q)return'username'; if(/^(\+\d{1,3}[\s-]?)?\d{6,15}$/.test(q.replace(/[\s\-\(\)\.]/g,'')))return'phone'; if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(q))return'mail'; if(/^\d{17,20}$/.test(q))return'discord'; if(/^(\d{1,3}\.){3}\d{1,3}$/.test(q)||/^([0-9a-fA-F]{1,4}:){2,7}/.test(q))return'ip'; return'username'; }

async function doSearch(){
  if(!currentUser) { notify('🔑 Veuillez vous connecter pour rechercher.', true); switchAuthTab('login'); document.getElementById('auth-screen').classList.remove('hidden'); return; }
  if(searchCooldown && currentUser.role !== 'dev'){notify(`⏳ Attendez encore ${Math.ceil((cooldownEnd-Date.now())/1000)}s.`,true);return;}
  if(getCreditsLeft()<=0 && currentUser.role !== 'dev'){notify('⛔ Plus de crédits — rechargez via Discord',true);return;}
  const q=document.getElementById('search-input').value.trim(); if(!q){notify('Entrez une cible.',true);return;}
  const type=searchMode==='auto'?detectType(q):(document.getElementById('search-type')?.value||'username');
  const labels={phone:'📱 Téléphone',mail:'✉ Email',username:'👤 Username',discord:'💬 Discord ID',ip:'🌐 IP'};
  const btn=document.getElementById('search-btn'); btn.disabled=true;
  try{ const res=await api('search',{user_id:currentUser.id, query:q, type:type}); if(res.user) { saveSession(res.user); updateCreditsUI(); } }catch(e){ notify(e.message,true); btn.disabled=false; return; }
  searchCooldown=true; cooldownEnd=Date.now()+60000;
  const loadDiv=document.getElementById('search-loading'),fillEl=document.getElementById('search-fill'),loadTxt=document.getElementById('search-loading-text');
  const msgs=['Interrogation des sources OSINT…','Agrégation des données…','Analyse en cours…','Vérification des résultats…','Finalisation…'];
  loadDiv.className='search-loading show'; fillEl.style.animation='none'; fillEl.offsetHeight; fillEl.style.animation='searchLoad 5s linear forwards';
  let mi=0; const mi_=setInterval(()=>{mi=(mi+1)%msgs.length;if(loadTxt)loadTxt.textContent=msgs[mi];},1000);
  notify(`🔍 Recherche ${labels[type]||type} lancée…`); document.getElementById('results-wrap').innerHTML='';
  await new Promise(r=>setTimeout(r,5000)); clearInterval(mi_); loadDiv.className='search-loading';
  try{document.getElementById('results-wrap').innerHTML=await fetchOSINT(q,type);} catch(e){document.getElementById('results-wrap').innerHTML=`<div class="result-item"><h4>Erreur</h4><p>Réessayez.</p></div>`;}
}

async function fetchOSINT(q,type){
  if(type==='ip'){try{const r=await fetch(`https://ipapi.co/${encodeURIComponent(q)}/json/`);const d=await r.json();if(d.error)throw'';return`<div class="result-item"><h4>🌐 IP — ${esc(q)}</h4><p>Pays : <strong>${d.country_name||'N/A'}</strong><br>FAI : <strong>${d.org||'N/A'}</strong></p><span class="result-tag">IPAPI.CO</span></div>`;}catch(e){return noRes(q);}}
  if(type==='username'){const ps=[{n:'GitHub',u:`https://github.com/${q}`,i:'logo/github.png'},{n:'Reddit',u:`https://reddit.com/u/${q}`,i:'logo/redit.png'},{n:'Twitter',u:`https://twitter.com/${q}`,i:'logo/twitter.png'}];const links=ps.map(p=>`<a href="${p.u}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;color:var(--blue);text-decoration:none;font-size:12px;margin-right:14px;margin-bottom:4px"><img src="${p.i}" style="width:13px;height:13px">${p.n} ↗</a>`).join('');return`<div class="result-item"><h4>👤 Username — ${esc(q)}</h4><div style="line-height:2.4;margin-bottom:6px">${links}</div><span class="result-tag">MULTI-PLATFORM</span></div>`;}
  if(type==='mail'){const enc=encodeURIComponent(q);return`<div class="result-item"><h4>✉ Email — ${esc(q)}</h4><p><a href="https://haveibeenpwned.com/account/${enc}" target="_blank" style="color:var(--blue)">HaveIBeenPwned ↗</a></p></div>`;}
  return noRes(q);
}
function discordTs(id){try{return new Date(Number(BigInt(id)>>22n)+1420070400000).toLocaleDateString('fr-FR');}catch{return'ID invalide';}}
function noRes(q){return`<div class="result-item"><h4>Aucun résultat</h4><p>Aucune donnée pour <strong>${esc(q)}</strong>.</p></div>`;}

// ── RENDER ────────────────────────────────────────────────────
function renderShop(filter='Discord'){
  const grid = document.getElementById('shop-grid'); if(!grid) return;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b.getAttribute('data-filter')===filter));
  const vip=currentUser&&(currentUser.vip_active || currentUser.role === 'dev');
  const items=CONFIG.shop.filter(i=>i.category===filter);
  grid.innerHTML=items.map((item, idx)=>{
    const locked=item.premium&&!vip;
    return`<div class="item-card${item.premium?' premium-card':''}${locked?' locked-card':''}" style="animation:fadeUp .3s ease forwards; animation-delay:${idx*40}ms" onclick="${locked?'notifyVipRequired()':'openItem(\''+item.id+'\',\'shop\')'}">
      <div class="card-img">${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="">`:item.icon}${item.premium?'<span class="premium-crown">👑</span>':''}${locked?'<div class="lock-overlay">🔒</div>':''}</div>
      <div class="card-body-inner"><div class="card-name">${item.name}</div><div class="card-cat">${item.category}</div><p class="card-desc-text">${locked?'Contenu réservé.':item.desc.substring(0,80)+'…'}</p></div>
      <div class="card-footer-inner"><span class="card-price${item.premium?' premium-price':''}">${locked?'🔒':item.price}</span><button class="btn-sm">Voir</button></div>
    </div>`;
  }).join('');
}
function renderTools(){
  const grid = document.getElementById('tools-grid'); if(!grid) return;
  const vip=currentUser&&(currentUser.vip_active || currentUser.role === 'dev');
  const visible=CONFIG.tools.filter(i=>i.category==='FreeTools' || (i.category==='Tools' && vip));
  const locked=CONFIG.tools.filter(i=>i.category==='Tools' && !vip);
  grid.innerHTML=[
    ...visible.map((item, idx)=>`<div class="item-card${item.category==='Tools'?' premium-card':''}" style="animation:fadeUp .3s ease forwards; animation-delay:${idx*40}ms" onclick="openItem('${item.id}','tools')"><div class="card-img">${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="">`:item.icon}${item.category==='Tools'?'<span class="premium-crown">👑</span>':''}</div><div class="card-body-inner"><div class="card-name">${item.name}</div><div class="card-cat">${item.category}</div><p class="card-desc-text">${item.desc.substring(0,80)}…</p></div><div class="card-footer-inner"><span class="${item.category==='Tools'?'premium-price':'card-free'}">${item.category==='Tools'?'Premium':'✓ Gratuit'}</span><button class="btn-sm">Voir</button></div></div>`),
    ...locked.map((item, idx)=>`<div class="item-card premium-card locked-card" style="animation:fadeUp .3s ease forwards; animation-delay:${(visible.length+idx)*40}ms" onclick="notifyVipRequired()"><div class="lock-overlay">🔒</div><div class="card-img">${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="">`:item.icon}</div><div class="card-body-inner"><div class="card-name">${item.name}</div><div class="card-cat">${item.category}</div><p class="card-desc-text">Outil payant.</p></div><div class="card-footer-inner"><span class="premium-price">🔒</span><button class="btn-sm">Débloquer</button></div></div>`)
  ].join('');
}
function renderPlans(){
  const grid=document.getElementById('plans-grid'); if(!grid) return;
  grid.innerHTML=CONFIG.plans.map((p, idx)=>`
    <div class="plan-card${p.highlight?' plan-highlight':''}" style="animation:fadeUp .4s ease forwards; animation-delay:${idx*60}ms">
      ${p.highlight?'<div class="plan-best">👑 BEST VALUE</div>':''}
      <div class="plan-card-body" style="padding: 24px 20px; border: 1px solid var(--border2); background: var(--panel);">
        <div class="plan-name" style="color:${p.color}">${p.name}</div>
        <div class="plan-subtitle">${p.subtitle}</div>
        <div class="plan-price">${p.price}<span class="plan-period"> ${p.period}</span></div>
        <div class="plan-searches-badge">${p.searches>=999999?'Illimitées':p.searches} recherches/jour</div>
        <hr style="border:none;border-top:1px solid var(--border);margin:4px 0">
        <ul class="plan-features">${p.features.map(f=>`<li class="${f.ok?'ok':'no'}"><span class="plan-check">${f.ok?'✓':'✗'}</span>${f.text}</li>`).join('')}</ul>
        <a href="${CONFIG.site.discord}" target="_blank" class="btn-plan-cta${p.highlight?' btn-plan-cta-hl':''}"><img src="logo/discord.png" alt="">${(currentUser && p.id==='plan_free')?'Plan actuel':'S\'abonner'}</a>
        <p class="plan-ticket-note">Ouvrez un ticket Discord pour activer</p>
      </div>
    </div>`).join('');
}
function renderFounders(){
  const c=document.getElementById('founders-grid'); if(!c)return;
  c.innerHTML=CONFIG.founders.map((f, idx)=>`
    <div class="team-card" style="animation:fadeUp .3s ease forwards; animation-delay:${idx*50}ms">
      <img src="${f.img}" class="team-img" alt="${f.name}">
      <div class="t-name">${f.name}</div><div class="t-role">${f.role}</div>
      <div class="t-links" style="margin-top:10px">
        <a href="https://discord.com/users/" target="_blank" class="t-link"><img src="logo/discord.png" alt="">${f.discord}</a>
        <a href="${f.gunslol}" target="_blank" class="t-link"><img src="logo/gunslol.png" alt="">${f.gunslolLabel}</a>
      </div>
    </div>`).join('');
}

function notifyVipRequired(){notify('🔒 Accès restreint — entrez votre code VIP dans le menu profil',true);}

function openItem(id,src){
  const item=src==='shop'?CONFIG.shop.find(i=>i.id===id):CONFIG.tools.find(i=>i.id===id); if(!item)return; currentItemForDl=item;
  const box = document.getElementById('item-modal-content');
  box.innerHTML = `
    <div style="padding:20px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center"><h2 style="font-size:18px;font-weight:800;color:var(--white)">Détails</h2><button class="modal-close-btn" onclick="closeItemView()">✕</button></div>
    <div style="padding:24px">
      <div style="display:flex;gap:20px;margin-bottom:20px">
        <div style="width:100px;height:100px;background:var(--panel);border:1px solid var(--border2);border-radius:var(--r);display:flex;align-items:center;justify-content:center;flex-shrink:0">${item.icon.startsWith('logo/')?`<img src="${item.icon}" style="width:50px;height:50px">`:`<span style="font-size:40px">${item.icon}</span>`}</div>
        <div style="flex:1"><div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:4px">${item.category}</div><h1 style="font-size:20px;font-weight:900;color:var(--white);margin-bottom:8px">${item.name}</h1><p style="font-size:13px;color:var(--text2);line-height:1.6">${item.desc}</p></div>
      </div>
      <div style="background:var(--panel);border:1px solid var(--border2);border-radius:var(--r);padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div><div style="font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;margin-bottom:2px">Prix</div><div style="font-size:22px;font-weight:900;color:${src==='tools'?'var(--green)':'var(--white)'}">${src==='tools'?'GRATUIT':item.price}</div></div>
          <div style="display:flex;align-items:center;gap:10px">${src==='tools' ? `<button class="btn btn-primary" onclick="downloadTool()">Télécharger</button>` : `<a href="${CONFIG.site.discord}" target="_blank" class="btn btn-discord">Commander</a>`}</div>
        </div>
      </div>
    </div>`;
  document.getElementById('item-modal').classList.add('open');
}
function closeItemView(){document.getElementById('item-modal').classList.remove('open');}
function downloadTool(){ if(!currentItemForDl)return; const blob=new Blob([currentItemForDl.dlContent||`=== ${currentItemForDl.name} ===\ndiscord.gg/ssYFSXRGPP`],{type:'text/plain;charset=utf-8'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(currentItemForDl.name||'tool').replace(/[^a-z0-9]/gi,'_').toLowerCase()+'.txt';a.click();URL.revokeObjectURL(a.href); notify('⬇ Téléchargement lancé !'); }

let nq=[],nActive=false;
function notify(msg,err=false){nq.push({msg,err});if(!nActive)processNotif();}
function processNotif(){ if(!nq.length){nActive=false;return;}nActive=true; const{msg,err}=nq.shift();const el=document.getElementById('notif'); el.textContent=msg;el.className='notif show'+(err?' notif-err':''); clearTimeout(el._t);el._t=setTimeout(()=>{el.className='notif';setTimeout(processNotif,300);},2800); }

let reviewStars = 5;
function openReviewModal() { if(!currentUser) { notify('🔑 Connectez-vous pour laisser un avis.', true); return; } document.getElementById('review-pseudo').value = currentUser.pseudo; document.getElementById('review-modal').classList.add('open'); setReviewStars(5); }
function closeReviewModal() { document.getElementById('review-modal').classList.remove('open'); }
function setReviewStars(n) { reviewStars = n; document.getElementById('review-stars-val').textContent = n + '/5'; document.querySelectorAll('.star-btn').forEach((s, i) => { s.style.color = i < n ? 'var(--yellow)' : 'var(--text3)'; }); }
async function submitReview() {
  const btn = document.querySelector('#review-modal .btn-primary'), text = document.getElementById('review-text').value.trim();
  if(text.length < 5) { setNote('review-note', 'Avis trop court.', 'err'); return; }
  if(btn.disabled) return; btn.disabled = true; setNote('review-note', 'Envoi…', 'inf');
  try { await api('submit-review', { user_id: currentUser.id, text, stars: reviewStars, pseudo: currentUser.pseudo }); setNote('review-note', '✓ Avis envoyé !', 'ok'); setTimeout(() => { closeReviewModal(); loadReviews(); btn.disabled = false; }, 1200); } catch(e) { setNote('review-note', e.message, 'err'); btn.disabled = false; }
}

async function loadReviews() {
  try {
    const res = await api('get-reviews', {}); const m = document.getElementById('reviews-marquee'); if(!m) return;
    if(!res.reviews || res.reviews.length === 0) { m.innerHTML = '<div style="color:var(--text3);font-size:12px;text-align:center;width:100%">Aucun avis pour le moment.</div>'; return; }
    let items = res.reviews; if(items.length > 0 && items.length < 15) { let repeated = []; while(repeated.length < 20) { repeated = [...repeated, ...items]; } items = repeated; }
    m.innerHTML = items.map(r => `<div class="review-card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span style="font-weight:700;color:var(--white);font-size:13px">${esc(r.pseudo)}</span><span style="color:var(--yellow);font-size:11px">${'★'.repeat(r.stars)}</span></div><p style="font-size:12px;color:var(--text2);line-height:1.5;margin-bottom:8px">${esc(r.text)}</p><div style="font-size:10px;color:var(--text3)">${new Date(r.created_at).toLocaleDateString()}</div></div>`).join('');
  } catch(e) {}
}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function copyLTC(){navigator.clipboard.writeText(CONFIG.site.ltcAddress).then(()=>notify('✓ Adresse LTC copiée !'));}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeItemView();closeProfile();closeSettings();}
  if(e.key==='Enter'){ if(document.getElementById('auth-signup')?.classList.contains('active'))doSignup(); else if(document.getElementById('auth-login')?.classList.contains('active'))doLogin(); }
});
