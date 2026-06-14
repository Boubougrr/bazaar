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
  // Update setting buttons active state in modal
  document.querySelectorAll('.setting-btn').forEach(btn => {
    const id = btn.id;
    if(id === 'lang-' + settings.lang) btn.classList.add('active');
    else if(id.startsWith('lang-')) btn.classList.remove('active');
    
    if(id === 'theme-' + settings.theme) btn.classList.add('active');
    else if(id.startsWith('theme-')) btn.classList.remove('active');
    
    if(id === 'cursor-' + (settings.cursor ? 'on' : 'off')) btn.classList.add('active');
    else if(id.startsWith('cursor-')) btn.classList.remove('active');
    
    if(id === 'anim-' + (settings.anim ? 'on' : 'off')) btn.classList.add('active');
    else if(id.startsWith('anim-')) btn.classList.remove('active');
    
    if(id === 'sm-' + settings.searchMode) btn.classList.add('active');
    else if(id.startsWith('sm-')) btn.classList.remove('active');
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
  document.getElementById('user-dropdown')?.classList.remove('open');
  document.querySelector('.user-menu-btn')?.classList.remove('open');
  document.getElementById('gear-dropdown')?.classList.remove('open');
  document.getElementById('auth-gear-dropdown')?.classList.remove('open');
  applySettings();
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
}, { passive: true });
document.addEventListener('mousedown', () => cursorEl.classList.add('click'));
document.addEventListener('mouseup',   () => cursorEl.classList.remove('click'));
const hQ = 'a,button,.nav-link,.item-card,.filter-btn,.mode-tab,.plan-card,.dd-item,.btn,.credits-pill,.auth-tab,.setting-btn';
document.addEventListener('mouseover', e => { if(e.target.closest(hQ)) cursorEl.classList.add('hover'); });
document.addEventListener('mouseout',  e => { if(e.target.closest(hQ)) cursorEl.classList.remove('hover'); });

// ── BG CANVAS (no mouse tracking) ────────────────────────────
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
  const r = await fetch('/api/'+path, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)
  });
  const data = await r.json();
  if(!r.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
}

// ── INIT ──────────────────────────────────────────────────────
window.addEventListener('load', () => {
  loadSettings();
  const saved = localStorage.getItem('bzr_session');
  if(saved && saved !== 'undefined'){ 
    try{ 
      currentUser=JSON.parse(saved); 
      if(currentUser && currentUser.email) bootApp(); 
      else localStorage.removeItem('bzr_session');
    }catch(e){ localStorage.removeItem('bzr_session'); } 
  }
  renderShop('Discord'); renderTools(); renderFounders(); renderPlans();
  document.querySelector('.credits-pill')?.addEventListener('click', openCreditsModal);
  // Apply default search mode from settings
  setSearchMode(settings.searchMode);
});

function bootApp(){
  if(!currentUser) return;
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('main-screen').style.display='flex';
  const name = currentUser.pseudo || (currentUser.email ? currentUser.email.split('@')[0] : 'Utilisateur');
  document.getElementById('user-name-nav').textContent = name;
  startResetTimer(); updateCreditsUI();
  notify('👋 Bienvenue, ' + name + '!');
}

function saveSession(u){ currentUser=u; localStorage.setItem('bzr_session',JSON.stringify(u)); }

// ── AUTH TABS ─────────────────────────────────────────────────
function switchAuthTab(tab){
  document.querySelectorAll('.auth-tab').forEach((t,i)=>t.classList.toggle('active',(i===0&&tab==='login')||(i===1&&tab==='signup')));
  document.getElementById('auth-login').classList.toggle('active',tab==='login');
  document.getElementById('auth-signup').classList.toggle('active',tab==='signup');
}

// ── LOGIN ─────────────────────────────────────────────────────
async function doLogin(){
  const email=document.getElementById('login-email').value.trim();
  const pass=document.getElementById('login-password').value;
  if(!email.includes('@')){ setAuthNote('login-note','Email invalide.','err'); return; }
  if(!pass){ setAuthNote('login-note','Mot de passe requis.','err'); return; }
  setAuthNote('login-note','Connexion…','inf');
  try{
    const res=await api('login',{email,password:pass});
    saveSession(res.user);
    setAuthNote('login-note','✓ Connecté !','ok');
    setTimeout(bootApp,400);
  }catch(e){ setAuthNote('login-note',e.message,'err'); }
}

// ── SIGNUP ────────────────────────────────────────────────────
async function doSignup(){
  const pseudo=document.getElementById('signup-pseudo').value.trim();
  const email=document.getElementById('signup-email').value.trim();
  const pass=document.getElementById('signup-password').value;
  const confirm=document.getElementById('signup-confirm').value;
  if(pseudo.length<2){setAuthNote('signup-note','Pseudo trop court.','err');return;}
  if(!email.includes('@')){setAuthNote('signup-note','Email invalide.','err');return;}
  if(pass.length<8){setAuthNote('signup-note','Mot de passe trop court (min 8 caractères).','err');return;}
  if(pass!==confirm){setAuthNote('signup-note','Les mots de passe ne correspondent pas.','err');return;}
  setAuthNote('signup-note','Création du compte…','inf');
  try{
    const res=await api('signup',{email,pseudo,password:pass});
    saveSession(res.user);
    setAuthNote('signup-note','✓ Compte créé !','ok');
    setTimeout(bootApp,400);
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
  if(!e.target.closest('#settings-modal')&&!e.target.closest('.auth-settings-btn')&&!e.target.closest('.nav-settings-btn')){}
});

// ── CREDITS MODAL ────────────────────────────────────────────
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

// ── PROFILE MODAL ────────────────────────────────────────────
function openProfile(section){
  document.getElementById('user-dropdown')?.classList.remove('open');
  document.querySelector('.user-menu-btn')?.classList.remove('open');
  const box=document.getElementById('profile-content');
  document.querySelector('#profile-modal .modal-header h2').textContent='Mon profil';

  if(section==='pseudo'){
    box.innerHTML=`<label class="lbl">Nouveau pseudo</label>
      <div class="inp-icon-wrap"><img class="inp-icon" src="logo/user.png" alt=""><input class="inp" type="text" id="pm-pseudo" placeholder="MonPseudo" maxlength="20" value="${esc(currentUser.pseudo||'')}"></div>
      <button class="btn btn-primary" style="width:100%" onclick="saveNewPseudo()">Enregistrer</button>
      <p class="modal-note" id="pm-note"></p>`;
  } else if(section==='password'){
    box.innerHTML=`<label class="lbl">Nouveau mot de passe</label>
      <div class="inp-icon-wrap"><img class="inp-icon" src="logo/pass.png" alt=""><input class="inp" type="password" id="pm-pass1" placeholder="Min. 8 caractères"></div>
      <label class="lbl">Confirmer</label>
      <div class="inp-icon-wrap"><img class="inp-icon" src="logo/pass.png" alt=""><input class="inp" type="password" id="pm-pass2" placeholder="Répétez le mot de passe"></div>
      <button class="btn btn-primary" style="width:100%" onclick="saveNewPassword()">Changer le mot de passe</button>
      <p class="modal-note" id="pm-note"></p>`;
  } else if(section==='email'){
    box.innerHTML=`<p style="font-size:13px;color:var(--text2);margin-bottom:16px;line-height:1.7">Entrez votre nouveau email.</p>
      <label class="lbl">Nouvel email</label>
      <div class="inp-icon-wrap"><img class="inp-icon" src="logo/mail.png" alt=""><input class="inp" type="email" id="pm-email" placeholder="nouveau@domaine.com"></div>
      <label class="lbl">Mot de passe actuel (confirmation)</label>
      <div class="inp-icon-wrap"><img class="inp-icon" src="logo/pass.png" alt=""><input class="inp" type="password" id="pm-email-pass" placeholder="••••••••"></div>
      <button class="btn btn-primary" style="width:100%" onclick="changeEmail()">Changer l'email</button>
      <p class="modal-note" id="pm-note"></p>`;
  } else if(section==='coupon'){
    box.innerHTML=`<label class="lbl">Code</label>
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <input class="inp" style="margin-bottom:0;flex:1" type="text" id="pm-coupon" placeholder="••••••••••••" maxlength="30">
        <button class="btn btn-primary" style="white-space:nowrap;padding:0 18px" onclick="applyCoupon()">Appliquer</button>
      </div>
      <p class="modal-note" id="pm-note"></p>`;
  } else if(section==='stats'){
    document.querySelector('#profile-modal .modal-header h2').textContent='Statistiques';
    renderStats(box);
  }
  document.getElementById('profile-modal').classList.add('open');
}

function renderStats(box){
  if(!currentUser)return;
  const left=getCreditsLeft();
  const now=new Date();
  const wk=`w_${now.getFullYear()}_${getWeek(now)}`;
  const mk=`m_${now.getFullYear()}_${now.getMonth()}`;
  const timeOn=Math.floor((Date.now()-sessionStart)/60000);
  box.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
    ${sRow('👤','Pseudo',currentUser.pseudo||'—')}
    ${sRow('✉','Email',currentUser.email)}
    ${sRow('📅','Inscrit le',currentUser.joined_at?new Date(currentUser.joined_at).toLocaleDateString('fr-FR'):'—')}
    ${sRow('🕐','Dernière connexion',currentUser.last_login?new Date(currentUser.last_login).toLocaleDateString('fr-FR'):'—')}
    ${sRow('⏱','Session',timeOn+'min')}
    ${sRow('🔑','Connexions',currentUser.login_count||1)}
    ${sRow('🔍','Recherches / 24h',currentUser.credits_used||0)}
    ${sRow('📊','Cette semaine',(currentUser.week_searches||{})[wk]||0)}
    ${sRow('📈','Ce mois',(currentUser.month_searches||{})[mk]||0)}
    ${sRow('🔎','Total',currentUser.total_searches||0)}
    ${sRow('💛','Crédits restants',left+' / '+(currentUser.credits_max||5))}
    ${sRow('🏅','Rang',getRank(currentUser.total_searches||0))}
    ${sRow('📦','Plan',currentUser.plan||'standard')}
    ${sRow('👑','VIP',currentUser.vip_active?'✓ Actif':'✗ Inactif')}
  </div>`;
}
function sRow(i,l,v){return`<div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px 12px"><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text3);margin-bottom:3px">${i} ${l}</div><div style="font-size:13px;font-weight:700;color:var(--text)">${v}</div></div>`;}
function getRank(n){if(n>=500)return'🏆 Expert';if(n>=200)return'💎 Avancé';if(n>=50)return'🥈 Intermédiaire';if(n>=10)return'🥉 Débutant+';return'🆕 Nouveau';}
function getWeek(d){const s=new Date(d.getFullYear(),0,1);return Math.ceil(((d-s)/86400000+s.getDay()+1)/7);}

function closeProfile(){document.getElementById('profile-modal').classList.remove('open');}

async function saveNewPseudo(){
  const p=document.getElementById('pm-pseudo')?.value.trim();
  if(!p||p.length<2){setNote('pm-note','Pseudo trop court.','err');return;}
  try{
    const res=await api('update-user',{user_id:currentUser.id,pseudo:p});
    saveSession({...currentUser,...res.user});
    document.getElementById('user-name-nav').textContent=p;
    setNote('pm-note','✓ Mis à jour !','ok'); setTimeout(closeProfile,900);
  }catch(e){setNote('pm-note',e.message,'err');}
}

async function saveNewPassword(){
  const p1=document.getElementById('pm-pass1')?.value;
  const p2=document.getElementById('pm-pass2')?.value;
  if(!p1||p1.length<8){setNote('pm-note','Min 8 caractères.','err');return;}
  if(p1!==p2){setNote('pm-note','Les mots de passe ne correspondent pas.','err');return;}
  try{
    await api('update-user',{user_id:currentUser.id,new_password:p1});
    setNote('pm-note','✓ Mot de passe mis à jour !','ok'); setTimeout(closeProfile,900);
  }catch(e){setNote('pm-note',e.message,'err');}
}

async function changeEmail(){
  const email=document.getElementById('pm-email')?.value.trim();
  const pass=document.getElementById('pm-email-pass')?.value;
  if(!email||!email.includes('@')){setNote('pm-note','Email invalide.','err');return;}
  if(!pass){setNote('pm-note','Mot de passe requis pour confirmer.','err');return;}
  try{
    const res=await api('update-user',{user_id:currentUser.id,email,verify_password:pass});
    saveSession({...currentUser,...res.user});
    setNote('pm-note','✓ Email mis à jour !','ok'); setTimeout(closeProfile,900);
  }catch(e){setNote('pm-note',e.message,'err');}
}

async function applyCoupon(){
  const code=document.getElementById('pm-coupon')?.value.trim();
  if(!code){setNote('pm-note','Entrez un code.','err');return;}
  try{
    const res=await api('coupon',{user_id:currentUser.id,code});
    saveSession({...currentUser,...res.user});
    updateCreditsUI();
    if(res.type==='vip')notify('👑 Accès VIP activé !');
    else if(res.type==='refund')notify('✅ Crédits restaurés !');
    setNote('pm-note','✓ Code appliqué !','ok'); setTimeout(closeProfile,1200);
  }catch(e){setNote('pm-note',e.message,'err');}
}

// ── NAV ───────────────────────────────────────────────────────
function gotoPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  document.getElementById('page-'+name)?.classList.add('active');
  const pages=['home','shop','tools','subs','features','contact','about'];
  const idx=pages.indexOf(name);
  if(idx>=0)document.querySelectorAll('.nav-link')[idx]?.classList.add('active');
  window.scrollTo(0,0);
}

// ── CREDITS ───────────────────────────────────────────────────
function getCreditsLeft(){
  if(!currentUser)return 0;
  return Math.max(0,(currentUser.credits_max||5)-(currentUser.credits_used||0));
}
function updateCreditsUI(){
  const left=getCreditsLeft();
  ['sq-left','sr-left'].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=left;});
}
function startResetTimer(){
  setInterval(()=>{
    if(!currentUser)return;
    const left=getCreditsLeft();
    const qw=document.getElementById('quota-warn'),qt=document.getElementById('quota-timer'),srt=document.getElementById('sr-reset');
    if(left<=0&&currentUser.credits_exhausted_at){
      const resetAt=new Date(currentUser.credits_exhausted_at).getTime()+24*3600*1000;
      const d=Math.max(0,resetAt-Date.now());
      if(d<=0){currentUser.credits_used=0;currentUser.credits_exhausted_at=null;saveSession(currentUser);if(qw)qw.style.display='none';if(srt)srt.style.display='none';updateCreditsUI();notify('✅ Crédits réinitialisés !');return;}
      const str=`${pad(Math.floor(d/3600000))}h ${pad(Math.floor((d%3600000)/60000))}m ${pad(Math.floor((d%60000)/1000))}s`;
      if(qw)qw.style.display='flex';if(qt)qt.textContent=str;
      if(srt){srt.style.display='block';const el=document.getElementById('sr-timer');if(el)el.textContent=str;}
    }else{if(qw)qw.style.display='none';if(srt)srt.style.display='none';}
    // Cooldown countdown
    if(searchCooldown){
      const r=Math.ceil((cooldownEnd-Date.now())/1000);
      if(r<=0){searchCooldown=false;const btn=document.getElementById('search-btn');if(btn){btn.disabled=false;btn.textContent='Rechercher';}document.getElementById('search-cooldown').className='search-cooldown';}
      else{const btn=document.getElementById('search-btn');if(btn)btn.textContent=`⏳ ${r}s`;const cd=document.getElementById('search-cooldown');if(cd){cd.className='search-cooldown show';cd.textContent=`Prochaine recherche dans ${r}s`;}}
    }
  },1000);
}
function pad(n){return String(n).padStart(2,'0');}

// ── SEARCH ────────────────────────────────────────────────────
function setSearchMode(mode){
  searchMode=mode;
  document.querySelectorAll('.mode-tab').forEach(t=>t.classList.remove('active'));
  document.querySelector(`.mode-tab[data-mode="${mode}"]`)?.classList.add('active');
  const row=document.getElementById('manual-select-row');
  if(row)row.style.display=mode==='manual'?'flex':'none';
  const si=document.getElementById('search-input');
  if(si)si.placeholder=mode==='manual'?'Entrez votre cible…':'Entrez une cible (auto-détection du type)…';
}
function updateSelIcon(){
  const sel=document.getElementById('search-type'),opt=sel?.options[sel.selectedIndex],img=document.getElementById('sel-icon-img');
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

async function doSearch(){
  if(searchCooldown){notify(`⏳ Attendez encore ${Math.ceil((cooldownEnd-Date.now())/1000)}s.`,true);return;}
  if(getCreditsLeft()<=0){notify('⛔ Plus de crédits — rechargez via Discord',true);return;}
  const q=document.getElementById('search-input').value.trim();
  if(!q){notify('Entrez une cible.',true);return;}
  const type=searchMode==='auto'?detectType(q):(document.getElementById('search-type')?.value||'username');
  const labels={phone:'📱 Téléphone',mail:'✉ Email',username:'👤 Username',discord:'💬 Discord ID',ip:'🌐 IP'};
  try{
    const res=await api('search',{user_id:currentUser.id});
    currentUser.credits_used=(currentUser.credits_max||5)-res.credits_left;
    if(res.exhausted_at)currentUser.credits_exhausted_at=res.exhausted_at;
    saveSession(currentUser); updateCreditsUI();
  }catch(e){notify(e.message,true);return;}
  const btn=document.getElementById('search-btn');
  btn.disabled=true; searchCooldown=true; cooldownEnd=Date.now()+60000;
  const loadDiv=document.getElementById('search-loading'),fillEl=document.getElementById('search-fill'),loadTxt=document.getElementById('search-loading-text');
  const msgs=['Interrogation des sources OSINT…','Agrégation des données…','Analyse en cours…','Vérification des résultats…','Finalisation…'];
  loadDiv.className='search-loading show';
  fillEl.style.animation='none'; fillEl.offsetHeight; fillEl.style.animation='searchLoad 5s linear forwards';
  let mi=0; const mi_=setInterval(()=>{mi=(mi+1)%msgs.length;if(loadTxt)loadTxt.textContent=msgs[mi];},1000);
  notify(`🔍 Recherche ${labels[type]||type} lancée…`);
  document.getElementById('results-wrap').innerHTML='';
  await new Promise(r=>setTimeout(r,5000));
  clearInterval(mi_); loadDiv.className='search-loading';
  try{document.getElementById('results-wrap').innerHTML=await fetchOSINT(q,type);}
  catch(e){document.getElementById('results-wrap').innerHTML=`<div class="result-item"><h4>Erreur</h4><p>Réessayez.</p></div>`;}
}

async function fetchOSINT(q,type){
  if(type==='ip'){try{const r=await fetch(`https://ipapi.co/${encodeURIComponent(q)}/json/`);const d=await r.json();if(d.error)throw'';return`<div class="result-item"><h4>🌐 IP — ${esc(q)}</h4><p>Pays : <strong>${d.country_name||'N/A'}</strong><br>Région : <strong>${d.region||'N/A'}</strong> — Ville : <strong>${d.city||'N/A'}</strong><br>FAI : <strong>${d.org||'N/A'}</strong><br>Timezone : <strong>${d.timezone||'N/A'}</strong><br>GPS : <strong>${d.latitude||'?'}, ${d.longitude||'?'}</strong></p><span class="result-tag">IPAPI.CO</span></div>`;}catch(e){return noRes(q);}}
  if(type==='username'){const ps=[{n:'GitHub',u:`https://github.com/${q}`,i:'logo/github.png'},{n:'Reddit',u:`https://reddit.com/u/${q}`,i:'logo/redit.png'},{n:'Twitter',u:`https://twitter.com/${q}`,i:'logo/twitter.png'},{n:'Instagram',u:`https://instagram.com/${q}`,i:'logo/insta.png'},{n:'TikTok',u:`https://tiktok.com/@${q}`,i:'logo/tiktok.png'},{n:'Twitch',u:`https://twitch.tv/${q}`,i:'logo/twitch.png'},{n:'Steam',u:`https://steamcommunity.com/id/${q}`,i:'logo/steam.png'},{n:'Pinterest',u:`https://pinterest.com/${q}`,i:'logo/pinterest.png'},{n:'SoundCloud',u:`https://soundcloud.com/${q}`,i:'logo/soundcloud.png'},{n:'Spotify',u:`https://open.spotify.com/user/${q}`,i:'logo/spotify.png'},{n:'Snapchat',u:`https://snapchat.com/add/${q}`,i:'logo/snap.png'},{n:'Roblox',u:`https://roblox.com/users/profile?username=${q}`,i:'logo/roblox.png'}];const links=ps.map(p=>`<a href="${p.u}" target="_blank" style="display:inline-flex;align-items:center;gap:5px;color:var(--blue);text-decoration:none;font-size:12px;margin-right:14px;margin-bottom:4px;font-family:'JetBrains Mono',monospace"><img src="${p.i}" style="width:13px;height:13px">${p.n} ↗</a>`).join('');return`<div class="result-item"><h4>👤 Username — ${esc(q)}</h4><div style="line-height:2.4;margin-bottom:6px">${links}</div><span class="result-tag">MULTI-PLATFORM</span></div>`;}
  if(type==='mail'){const enc=encodeURIComponent(q),dom=q.split('@')[1]||'';return`<div class="result-item"><h4>✉ Email — ${esc(q)}</h4><p>Domaine : <strong>${esc(dom)}</strong><br><a href="https://haveibeenpwned.com/account/${enc}" target="_blank" style="color:var(--blue)">HaveIBeenPwned ↗</a><br><a href="https://hunter.io/email-verifier/${enc}" target="_blank" style="color:var(--blue)">Hunter.io ↗</a><br><a href="https://www.google.com/search?q=%22${enc}%22" target="_blank" style="color:var(--blue)">Google ↗</a></p><span class="result-tag">HIBP · HUNTER.IO</span></div>`;}
  if(type==='phone'){return`<div class="result-item"><h4>📱 Téléphone — ${esc(q)}</h4><p><a href="https://www.numlookup.com/?number=${encodeURIComponent(q)}" target="_blank" style="color:var(--blue)">NumLookup ↗</a><br><a href="https://sync.me/search/?number=${encodeURIComponent(q)}" target="_blank" style="color:var(--blue)">Sync.me ↗</a><br><a href="https://www.google.com/search?q=%22${encodeURIComponent(q)}%22" target="_blank" style="color:var(--blue)">Google ↗</a></p><span class="result-tag">NUMLOOKUP · SYNC.ME</span></div>`;}
  if(type==='discord'){return`<div class="result-item"><h4>💬 Discord ID — ${esc(q)}</h4><p>Créé le : <strong>${discordTs(q)}</strong><br><a href="https://discord.id/?prefill=${encodeURIComponent(q)}" target="_blank" style="color:var(--blue)">discord.id ↗</a><br><a href="https://discordlookup.com/user/${encodeURIComponent(q)}" target="_blank" style="color:var(--blue)">discordlookup.com ↗</a></p><span class="result-tag">DISCORD.ID</span></div>`;}
  return noRes(q);
}
function discordTs(id){try{return new Date(Number(BigInt(id)>>22n)+1420070400000).toLocaleDateString('fr-FR');}catch{return'ID invalide';}}
function noRes(q){return`<div class="result-item"><h4>Aucun résultat</h4><p>Aucune donnée pour <strong>${esc(q)}</strong>.</p></div>`;}

// ── RENDER ────────────────────────────────────────────────────
function renderShop(filter='Discord'){
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b.getAttribute('data-filter')===filter));
  const vip=currentUser&&currentUser.vip_active;
  const items=CONFIG.shop.filter(i=>i.category===filter);
  document.getElementById('shop-grid').innerHTML=items.map(item=>{
    const locked=item.premium&&!vip;
    return`<div class="item-card${item.premium?' premium-card':''}${locked?' locked-card':''}" onclick="${locked?'notifyVipRequired()':'openItem(\''+item.id+'\',\'shop\')'}">
      <div class="card-img">${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="">`:item.icon}${item.premium?'<span class="premium-crown">👑</span>':''}${locked?'<div class="lock-overlay">🔒</div>':''}</div>
      <div class="card-body-inner"><div class="card-name">${item.name}</div><div class="card-cat">${item.category}</div><p class="card-desc-text">${locked?'Contenu réservé.':item.desc.substring(0,80)+'…'}</p></div>
      <div class="card-footer-inner"><span class="card-price${item.premium?' premium-price':''}">${locked?'🔒':item.price}</span><button class="btn-sm">Voir</button></div>
    </div>`;
  }).join('');
}

function renderTools(){
  const vip=currentUser&&currentUser.vip_active;
  const visible=CONFIG.tools.filter(i=>!i.vip||(i.vip&&vip));
  const locked=CONFIG.tools.filter(i=>i.vip&&!vip);
  document.getElementById('tools-grid').innerHTML=[
    ...visible.map(item=>`<div class="item-card${item.vip?' premium-card':''}" onclick="openItem('${item.id}','tools')"><div class="card-img">${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="">`:item.icon}${item.vip?'<span class="premium-crown">👑</span>':''}</div><div class="card-body-inner"><div class="card-name">${item.name}</div><div class="card-cat">${item.category}</div><p class="card-desc-text">${item.desc.substring(0,80)}…</p></div><div class="card-footer-inner"><span class="card-free">✓ Gratuit</span><button class="btn-sm">Télécharger</button></div></div>`),
    ...locked.map(item=>`<div class="item-card premium-card locked-card" onclick="notifyVipRequired()"><div class="card-img">${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="">`:item.icon}<div class="lock-overlay">🔒</div></div><div class="card-body-inner"><div class="card-name">${item.name}</div><div class="card-cat">${item.category}</div><p class="card-desc-text">Contenu réservé.</p></div><div class="card-footer-inner"><span class="premium-price">🔒</span><button class="btn-sm">Voir</button></div></div>`)
  ].join('');
}

function renderPlans(){
  const c=document.getElementById('plans-grid');if(!c)return;
  c.innerHTML=CONFIG.plans.map(p=>`
    <div class="plan-card${p.highlight?' plan-highlight':''}">
      ${p.highlight?'<div class="plan-best">👑 BEST VALUE</div>':''}
      <div class="plan-name" style="color:${p.color}">${p.name}</div>
      <div class="plan-subtitle">${p.subtitle}</div>
      <div class="plan-price">${p.price}<span class="plan-period"> ${p.period}</span></div>
      <div class="plan-searches-badge">${p.searches>=999999?'Illimitées':p.searches} recherches/jour</div>
      <hr style="border:none;border-top:1px solid var(--border);margin:4px 0">
      <ul class="plan-features">${p.features.map(f=>`<li class="${f.ok?'ok':'no'}"><span class="plan-check">${f.ok?'✓':'✗'}</span>${f.text}</li>`).join('')}</ul>
      <a href="${CONFIG.site.discord}" target="_blank" class="btn-plan-cta${p.highlight?' btn-plan-cta-hl':''}"><img src="logo/discord.png" alt="">${p.price==='0€'?'Plan actuel':'S\'abonner'}</a>
      <p class="plan-ticket-note">Ouvrez un ticket Discord pour activer</p>
    </div>`).join('');
}

function renderFounders(){
  const c=document.getElementById('founders-grid');if(!c)return;
  c.innerHTML=CONFIG.founders.map(f=>`
    <div class="team-card"><span class="t-crown">👑</span><div class="t-name">${f.name}</div><div class="t-role">${f.role}</div>
    <div class="t-links" style="margin-top:10px">
      <a href="https://discord.com/users/" target="_blank" class="t-link"><img src="logo/discord.png" alt="">${f.discord}</a>
      <a href="${f.gunslol}" target="_blank" class="t-link"><img src="logo/gunslol.png" alt="">${f.gunslolLabel}</a>
    </div></div>`).join('');
}

function notifyVipRequired(){notify('🔒 Accès restreint — entrez votre code VIP dans le menu profil',true);}

function openItem(id,src){
  const item=src==='shop'?CONFIG.shop.find(i=>i.id===id):CONFIG.tools.find(i=>i.id===id);
  if(!item)return;currentItemForDl=item;
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

// ── NOTIFY ────────────────────────────────────────────────────
let nq=[],nActive=false;
function notify(msg,err=false){nq.push({msg,err});if(!nActive)processNotif();}
function processNotif(){
  if(!nq.length){nActive=false;return;}nActive=true;
  const{msg,err}=nq.shift();const el=document.getElementById('notif');
  el.textContent=msg;el.className='notif show'+(err?' notif-err':'');
  clearTimeout(el._t);el._t=setTimeout(()=>{el.className='notif';setTimeout(processNotif,300);},2800);
}

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function copyLTC(){navigator.clipboard.writeText(CONFIG.site.ltcAddress).then(()=>notify('✓ Adresse LTC copiée !'));}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeItemView();closeProfile();closeSettings();}
  if(e.key==='Enter'){
    if(document.getElementById('auth-signup')?.classList.contains('active'))doSignup();
    else if(document.getElementById('auth-login')?.classList.contains('active'))doLogin();
  }
});
