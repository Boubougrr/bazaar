// ============================================================
//  BAZAAR — APP.JS v6
// ============================================================
let currentUser = null;
let sessionToken = null;
let currentItemForDl = null;
let currentShopFilter = 'discord';
let currentProfileSection = null;
let searchMode = 'auto';
let searchCooldown = false;
let cooldownEnd = 0;

function startCooldown(seconds) {
  const end = Date.now() + seconds * 1000;
  localStorage.setItem('bzCooldownEnd', end);
  runCooldownTimer();
}

function runCooldownTimer() {
  const cooldown = document.getElementById('search-cooldown');
  if(!cooldown) return;
  const end = parseInt(localStorage.getItem('bzCooldownEnd') || '0');
  const left = Math.ceil((end - Date.now()) / 1000);
  if(left <= 0){ cooldown.classList.remove('show'); return; }
  cooldown.classList.add('show');
  cooldown.textContent = `⏳ Prochaine recherche dans ${left}s`;
  const timer = setInterval(() => {
    const remaining = Math.ceil((end - Date.now()) / 1000);
    if(remaining <= 0){
      clearInterval(timer);
      cooldown.classList.remove('show');
      localStorage.removeItem('bzCooldownEnd');
    } else {
      cooldown.textContent = `⏳ Prochaine recherche dans ${remaining}s`;
    }
  }, 1000);
}

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
    heroSub:'Nom, email, téléphone, IP, Discord ID — croisez des millions de fuites de données.',
    startSearch:'Commencer une recherche',joinDiscord:'Rejoindre le Discord',
    credits:'crédits',
    // shop / tools
    shopEmpty:'Aucun article dans cette catégorie pour le moment.', lockedDesc:'Contenu réservé.',
    viewBtn:'Voir', unlockBtn:'Débloquer', freeBadge:'✓ Gratuit', premiumBadge:'Premium',
    paidToolDesc:'Outil payant.', vipRequiredMsg:'🔒 Accès restreint — entrez votre code VIP dans le menu profil',
    // plans
    unlimitedSearches:'Illimitées', searchesPerDay:'recherches/jour', bestValue:'👑 MEILLEURE OFFRE',
    currentPlan:'Plan actuel', subscribeBtn:'S\'abonner', openTicketToActivate:'Ouvrez un ticket Discord pour activer',
    // item modal
    detailsTitle:'Détails', priceLabel:'Prix', freeLabel:'GRATUIT', downloadBtn:'Télécharger',
    orderBtn:'Commander', downloadStarted:'⬇ Téléchargement lancé !',
    // profile / stats
    myStats:'Mes Statistiques', creditsLabel:'Crédits', rankLabel:'Rang', staffRank:'STAFF',
    vipRank:'VIP', memberRank:'Membre', searchesLabel:'Recherches', loginsLabel:'Connexions',
    joinedLabel:'Inscrit le', planInfoTitle:'Information Plan',
    planInfoPrefix:'Votre compte est actuellement sur le plan', planInfoSuffix:'.',
    buyCreditsTitle:'Acheter des crédits', creditPriceLine:'1 Crédit = 0.25€',
    creditsInfoText:'• Les crédits sont ajoutés manuellement.<br>• Paiement via PayPal, LTC ou PSC.<br>• Ouvrez un ticket sur notre Discord.',
    openDiscordTicket:'Ouvrir un ticket Discord',
    changePseudoTitle:'Changer le pseudo', newPseudoLabel:'Nouveau pseudo', currentPasswordLabel:'Mot de passe actuel',
    changePasswordTitle:'Changer le mot de passe', newPasswordLabel:'Nouveau mot de passe',
    confirmNewPasswordLabel:'Confirmer mot de passe', oldPasswordLabel:'Ancien mot de passe',
    changeEmailTitle:'Changer l\'email', newEmailLabel:'Nouvel email', updateBtn:'Mettre à jour',
    applyCouponTitle:'Appliquer un coupon', applyCouponDesc:'Entrez un code promo ou VIP pour l\'activer sur votre compte.',
    activateCodeBtn:'Activer le code',
    // notifications
    invalidEmail:'Email invalide.', connecting:'Connexion…', connectedOk:'✓ Connecté !',
    enterTarget:'Veuillez entrer une cible.', loginRequired:'🔑 Connexion requise.',
    loginRequiredSection:'🔑 Connexion requise pour accéder à cette section.', welcomeMsg:'👋 Bienvenue, ',
    passwordsMismatch:'Les mots de passe ne correspondent pas.', changeDone:'✓ Changement effectué !',
    enterCode:'Entrez un code.', codeActivated:'✓ Code activé !',
    loginToReview:'🔑 Connectez-vous pour laisser un avis.', reviewTooShort:'Avis trop court.',
    sending:'Envoi…', reviewSent:'✓ Avis envoyé !', noReviewsYet:'Aucun avis pour le moment.',
    ltcCopied:'✓ Adresse LTC copiée !', captchaWrong:'❌ Raté !', captchaOk:'✓ Ok !', captchaRequired:'⚠️ Captcha !',
    // static footer/captcha
    navTitle:'Navigation', communityTitle:'Communauté', communityDesc:'Support & News sur Discord.',
    captchaPrompt:'Sécurité : Cliquez sur le triangle', captchaHint:'Veuillez prouver que vous êtes humain',
    passStrength:'Force du mot de passe',
    veryWeak:'Très faible', weak:'Faible', medium:'Moyen', good:'Bon', strong:'Fort',
    ruleLen:'• Au moins 8 caractères', ruleUp:'• Contient une majuscule',
    ruleLow:'• Contient une minuscule', ruleNum:'• Contient un chiffre',
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
    heroSub:'Name, email, phone, IP, Discord ID — cross millions of data leaks in seconds.',
    startSearch:'Start a search',joinDiscord:'Join Discord',
    credits:'credits',
    // shop / tools
    shopEmpty:'No items in this category yet.', lockedDesc:'Restricted content.',
    viewBtn:'View', unlockBtn:'Unlock', freeBadge:'✓ Free', premiumBadge:'Premium',
    paidToolDesc:'Paid tool.', vipRequiredMsg:'🔒 Restricted access — enter your VIP code in the profile menu',
    // plans
    unlimitedSearches:'Unlimited', searchesPerDay:'searches/day', bestValue:'👑 BEST VALUE',
    currentPlan:'Current plan', subscribeBtn:'Subscribe', openTicketToActivate:'Open a Discord ticket to activate',
    // item modal
    detailsTitle:'Details', priceLabel:'Price', freeLabel:'FREE', downloadBtn:'Download',
    orderBtn:'Order', downloadStarted:'⬇ Download started!',
    // profile / stats
    myStats:'My Stats', creditsLabel:'Credits', rankLabel:'Rank', staffRank:'STAFF',
    vipRank:'VIP', memberRank:'Member', searchesLabel:'Searches', loginsLabel:'Logins',
    joinedLabel:'Joined on', planInfoTitle:'Plan information',
    planInfoPrefix:'Your account is currently on the', planInfoSuffix:' plan.',
    buyCreditsTitle:'Buy credits', creditPriceLine:'1 Credit = €0.25',
    creditsInfoText:'• Credits are added manually.<br>• Payment via PayPal, LTC or PSC.<br>• Open a ticket on our Discord.',
    openDiscordTicket:'Open a Discord ticket',
    changePseudoTitle:'Change username', newPseudoLabel:'New username', currentPasswordLabel:'Current password',
    changePasswordTitle:'Change password', newPasswordLabel:'New password',
    confirmNewPasswordLabel:'Confirm password', oldPasswordLabel:'Old password',
    changeEmailTitle:'Change email', newEmailLabel:'New email', updateBtn:'Update',
    applyCouponTitle:'Apply a coupon', applyCouponDesc:'Enter a promo or VIP code to activate it on your account.',
    activateCodeBtn:'Activate code',
    // notifications
    invalidEmail:'Invalid email.', connecting:'Connecting…', connectedOk:'✓ Connected!',
    enterTarget:'Please enter a target.', loginRequired:'🔑 Login required.',
    loginRequiredSection:'🔑 Login required to access this section.', welcomeMsg:'👋 Welcome, ',
    passwordsMismatch:'Passwords do not match.', changeDone:'✓ Change applied!',
    enterCode:'Enter a code.', codeActivated:'✓ Code activated!',
    loginToReview:'🔑 Log in to leave a review.', reviewTooShort:'Review too short.',
    sending:'Sending…', reviewSent:'✓ Review sent!', noReviewsYet:'No reviews yet.',
    ltcCopied:'✓ LTC address copied!', captchaWrong:'❌ Missed!', captchaOk:'✓ OK!', captchaRequired:'⚠️ Captcha!',
    // static footer/captcha
    navTitle:'Navigation', communityTitle:'Community', communityDesc:'Support & news on Discord.',
    captchaPrompt:'Security check: click the triangle', captchaHint:'Please prove you are human',
    passStrength:'Password strength',
    veryWeak:'Very Weak', weak:'Weak', medium:'Medium', good:'Good', strong:'Strong',
    ruleLen:'• At least 8 characters long', ruleUp:'• Contains uppercase letter',
    ruleLow:'• Contains lowercase letter', ruleNum:'• Contains number',
  }
};

function t(key){ return (I18N[settings.lang] || I18N.fr)[key] || key; }

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
  document.body.classList.toggle('theme-light',  settings.theme === 'light');
  document.body.classList.toggle('theme-darker', settings.theme === 'darker');
  document.body.classList.toggle('custom-cursor', settings.cursor);
  applyLang(settings.lang);

  // Sync toggle buttons (stgl-btn) — match by ID pattern
  const active = {
    'p-lang-fr':      settings.lang === 'fr',
    'p-lang-en':      settings.lang === 'en',
    'p-theme-dark':   settings.theme === 'dark',
    'p-theme-light':  settings.theme === 'light',
    'p-cursor-on':    settings.cursor === true,
    'p-cursor-off':   settings.cursor === false,
    'p-anim-on':      settings.anim === true,
    'p-anim-off':     settings.anim === false,
  };
  Object.entries(active).forEach(([id, on]) => {
    document.getElementById(id)?.classList.toggle('active', on);
  });

  // legacy setting-btn support
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
  const dict = I18N[lang] || I18N.fr;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(dict[key]) el.textContent = dict[key];
  });
  document.documentElement.setAttribute('lang', lang);

  // Re-render dynamically generated content so it picks up the new language too
  if(document.getElementById('shop-grid')) renderShop();
  if(document.getElementById('tools-grid')) renderTools();
  if(document.getElementById('plans-grid')) renderPlans();
  if(currentProfileSection) openProfile(currentProfileSection);
}

function setLang(lang){ settings.lang=lang; saveSettings(); applySettings(); }
function setTheme(t){ settings.theme=t; saveSettings(); applySettings(); }
function setCursor(v){ settings.cursor=v; saveSettings(); applySettings(); }
function setAnim(v){ settings.anim=v; saveSettings(); applySettings(); }
function setDefaultSearchMode(m){ settings.searchMode=m; saveSettings(); applySettings(); setSearchMode(m); }

function openSettings(){ gotoPage('settings'); document.getElementById('auth-screen')?.classList.add('hidden'); }
function closeSettings(){ }
function toggleGear(){ openSettings(); }

// ── CURSOR ────────────────────────────────────────────────────
const cursorEl = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursorEl.style.left = e.clientX + 'px'; cursorEl.style.top  = e.clientY + 'px';
  document.documentElement.style.setProperty('--mx', e.clientX + 'px');
  document.documentElement.style.setProperty('--my', e.clientY + 'px');
}, { passive: true });
document.addEventListener('mousedown', () => cursorEl.classList.add('click'));
document.addEventListener('mouseup',   () => cursorEl.classList.remove('click'));
const hQ = 'a,button,.nav-link,.item-card,.filter-btn,.mode-tab,.plan-card,.dd-item,.btn,.credits-pill,.auth-tab,.setting-btn';
document.addEventListener('mouseover', e => { if(e.target.closest(hQ)) cursorEl.classList.add('hover'); });
document.addEventListener('mouseout',  e => {
  const related = e.relatedTarget;
  // Only remove hover if we're truly leaving the hoverable element (not just moving to a child)
  if(!related || !e.target.closest(hQ)?.contains(related)) cursorEl.classList.remove('hover');
});

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
  loadSettings();
  try {
    const saved = localStorage.getItem('bzr_session');
    const tok = localStorage.getItem('bzr_token');
    if(saved && saved !== 'undefined'){ currentUser = JSON.parse(saved); }
    if(tok) sessionToken = tok;
  } catch(e) {}

  bootApp(true);

  if(currentUser && currentUser.id){
    if(!sessionToken){
      // Pre-existing local session from before signed tokens — force a clean re-login.
      currentUser = null;
      localStorage.removeItem('bzr_session');
      bootApp(true);
    } else {
      try {
        const res = await api('get-user', { token: sessionToken });
        saveSession(res.user); currentUser = res.user;
        bootApp(true);
      } catch(e) {
        currentUser = null; sessionToken = null;
        localStorage.removeItem('bzr_session'); localStorage.removeItem('bzr_token');
        bootApp(true);
      }
    }
  }

  generateCaptcha(); initAuthEvents();
  renderShop(); renderTools(); renderFounders(); renderPlans();
  startOfferCountdown();
  loadReviews();
  selectSearchType('auto');
  initCardSpotlight();

  // Splash Loader (0.5s)
  const pctEl = document.getElementById('loader-percent');
  let pct = 0;
  const pctTimer = setInterval(() => {
    pct = Math.min(100, pct + 2);
    if(pctEl) pctEl.textContent = pct + '%';
    if(pct >= 100) clearInterval(pctTimer);
  }, 10);
  setTimeout(() => {
    document.getElementById('app-loader')?.classList.add('hidden');
  }, 500);
}

if(document.readyState === 'complete') initApp();
else window.addEventListener('load', initApp);

// Close search dropdown when clicking outside
document.addEventListener('click', function() {
  document.getElementById('std-panel')?.classList.remove('open');
  document.getElementById('std-trigger')?.classList.remove('active');
});

function bootApp(silent = false){
  try {
    const navAuth = document.getElementById('nav-auth-only'), navLogin = document.getElementById('nav-login-btn');
    const badge = document.getElementById('dev-badge'), mainScreen = document.getElementById('main-screen');
    const creditsRow = document.getElementById('search-credits-row');
    if(mainScreen) mainScreen.style.display='flex';
    if(!currentUser) {
      document.getElementById('auth-screen')?.classList.add('hidden');
      if(navAuth) navAuth.style.display='none';
      if(navLogin) navLogin.style.display='block';
      if(badge) badge.style.display='none';
      if(creditsRow) creditsRow.style.display='none';
      const guestMsg = document.getElementById('search-guest-msg');
      if(guestMsg) guestMsg.style.display='block';
      ['shop','tools','subs','features','contact','about'].forEach(id => {
        const el = document.getElementById('nav-'+id);
        if(el) {
          el.classList.add('locked-nav');
          el.setAttribute('onclick', "notify(t('loginRequiredSection'), true); switchAuthTab('login'); document.getElementById('auth-screen').classList.remove('hidden')");
          el.style.textDecoration = 'line-through'; el.style.opacity = '0.5';
        }
      });
      return;
    }
    document.getElementById('auth-screen')?.classList.add('hidden');
    if(navAuth) navAuth.style.display='contents';
    if(navLogin) navLogin.style.display='none';
    if(creditsRow) creditsRow.style.display='flex';
    const guestMsg = document.getElementById('search-guest-msg');
    if(guestMsg) guestMsg.style.display='none';
    const name = currentUser.pseudo || (currentUser.email ? currentUser.email.split('@')[0] : 'Utilisateur');
    const nameEl = document.getElementById('user-name-nav');
    if(nameEl) nameEl.textContent = name;
    const navAvatar = document.getElementById('nav-avatar-img');
    if(navAvatar && currentUser.avatar_url) { navAvatar.src = currentUser.avatar_url; navAvatar.style.borderRadius='50%'; }
    updateSettingsProfile();
    ['shop','tools','subs','features','contact','about'].forEach(id => {
      const el = document.getElementById('nav-'+id);
      if(el) {
        el.classList.remove('locked-nav'); el.setAttribute('onclick', `gotoPage('${id}')`);
        el.style.textDecoration = 'none'; el.style.opacity = '1';
      }
    });
    if(badge) badge.style.display = currentUser.role === 'dev' ? 'block' : 'none';
    applyUserStyling(); startResetTimer(); updateCreditsUI();
    if(!silent) notify(t('welcomeMsg') + name + '!');
    loadReviews();
  } catch(e) { console.error('bootApp crashed', e); }
}

function applyUserStyling() {
  const nameNav = document.getElementById('user-name-nav'); if(!nameNav || !currentUser) return;
  if(currentUser.email === 'phoenix.guecko@gmail.com') { nameNav.style.color = '#ff4d4d'; nameNav.style.fontWeight = '900'; }
}

function updateSettingsProfile() {
  if(!currentUser) return;
  const u = currentUser;
  // Avatar
  const img = document.getElementById('settings-avatar-img');
  const init = document.getElementById('settings-avatar-initial');
  if(img && u.avatar_url) { img.src = u.avatar_url; img.style.display = 'block'; if(init) init.style.display = 'none'; }
  else if(init) { init.textContent = (u.pseudo || u.email || '?')[0].toUpperCase(); }
  // Text fields
  const ps = document.getElementById('settings-pseudo-display'); if(ps) ps.textContent = u.pseudo || '—';
  const em = document.getElementById('settings-email-display'); if(em) em.textContent = u.email || '—';
  const pl = document.getElementById('settings-plan-display'); if(pl) pl.textContent = (u.plan || 'standard').toUpperCase();
  // Stats grid
  const used = u.credits_used || 0;
  const max = u.credits_max || 5;
  const cr = document.getElementById('st-credits'); if(cr) cr.textContent = `${Math.max(0, max-used)}/${max}`;
  const se = document.getElementById('st-searches'); if(se) se.textContent = u.total_searches || 0;
  const lo = document.getElementById('st-logins'); if(lo) lo.textContent = u.login_count || 0;
  const pl2 = document.getElementById('st-plan'); if(pl2) pl2.textContent = (u.plan || 'std').toUpperCase();
  // Stats rows
  const fmtDate = d => d ? new Date(d).toLocaleDateString('fr-FR', {day:'2-digit',month:'short',year:'numeric'}) : '—';
  const jn = document.getElementById('st-joined'); if(jn) jn.textContent = fmtDate(u.joined_at || u.created_at);
  const ll = document.getElementById('st-last-login'); if(ll) ll.textContent = fmtDate(u.last_login);
  const ro = document.getElementById('st-role'); if(ro) {
    const roleMap = { dev:'Staff', admin:'Admin', vip:'VIP', user:'Membre' };
    ro.textContent = roleMap[u.role] || 'Membre';
    ro.style.color = u.role === 'dev' ? '#ff4d4d' : u.vip_active ? 'var(--accent)' : 'var(--text2)';
  }
}

// ── CREDITS MODAL ─────────────────────────────
function openCreditsModal() {
  if(!currentUser) return;
  const left = (currentUser.credits_max||5) - (currentUser.credits_used||0);
  const el1 = document.getElementById('cm-credits-left'); if(el1) el1.textContent = Math.max(0, left);
  const el2 = document.getElementById('cm-credits-max'); if(el2) el2.textContent = currentUser.credits_max || 5;
  document.getElementById('credits-modal')?.classList.add('open');
}
function closeCreditsModal() { document.getElementById('credits-modal')?.classList.remove('open'); }

// ── MY REVIEWS MODAL ──────────────────────────
function openMyReviewsModal() {
  document.getElementById('my-reviews-modal')?.classList.add('open');
  loadMyReviewsModal();
}
function closeMyReviewsModal() { document.getElementById('my-reviews-modal')?.classList.remove('open'); }

async function loadMyReviewsModal() {
  const wrap = document.getElementById('modal-my-reviews-content'); if(!wrap) return;
  if(!currentUser) { wrap.innerHTML = '<div style="padding:20px 24px;font-size:12px;color:var(--text3)">Connectez-vous pour voir vos avis.</div>'; return; }
  wrap.innerHTML = '<div style="padding:20px 24px;font-size:13px;color:var(--text3)">Chargement…</div>';
  try {
    const res = await api('get-reviews', { user_id: currentUser.id });
    const reviews = res.reviews || [];
    if(!reviews.length) {
      wrap.innerHTML = '<div style="padding:20px 24px;font-size:13px;color:var(--text3)">Aucun avis publié pour le moment.</div>';
      return;
    }
    wrap.innerHTML = reviews.map(r => `
      <div class="my-review-item" id="modal-review-${r.id}">
        <div style="flex:1;min-width:0">
          <div class="my-review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
          <div class="my-review-text" id="modal-review-text-${r.id}">${esc(r.text)}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:4px;font-family:'JetBrains Mono',monospace">${new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
        </div>
        <div class="my-review-actions">
          <button class="my-review-btn" onclick="editModalReview('${r.id}')">✏️ Modifier</button>
          <button class="my-review-btn del" onclick="deleteModalReview('${r.id}')">🗑️</button>
        </div>
      </div>`).join('');
  } catch(e) { wrap.innerHTML = '<div style="padding:20px 24px;font-size:12px;color:var(--red)">Erreur de chargement.</div>'; }
}

async function deleteModalReview(id) {
  if(!confirm('Supprimer cet avis ?')) return;
  try {
    await api('delete-review', { token: sessionToken, review_id: id });
    document.getElementById(`modal-review-${id}`)?.remove();
    notify('✓ Avis supprimé.'); loadReviews();
  } catch(e) { notify(e.message, true); }
}

function editModalReview(id) {
  const item = document.getElementById(`modal-review-${id}`); if(!item) return;
  const textEl = document.getElementById(`modal-review-text-${id}`); if(!textEl) return;
  const currentText = textEl.textContent;
  item.innerHTML = `
    <div style="flex:1;display:flex;flex-direction:column;gap:8px">
      <textarea id="modal-edit-ta-${id}" class="inp" style="min-height:70px;font-size:12px;resize:vertical">${currentText}</textarea>
      <div style="display:flex;gap:6px;justify-content:flex-end">
        <button class="my-review-btn" onclick="loadMyReviewsModal()">Annuler</button>
        <button class="my-review-btn" style="border-color:var(--accent);color:var(--accent)" onclick="saveModalReview('${id}')">✓ Sauvegarder</button>
      </div>
    </div>`;
}

async function saveModalReview(id) {
  const ta = document.getElementById(`modal-edit-ta-${id}`); if(!ta) return;
  const text = ta.value.trim(); if(text.length < 5) { notify('Avis trop court.', true); return; }
  try {
    await api('submit-review', { token: sessionToken, text, stars: 5, review_id: id });
    notify('✓ Avis mis à jour.'); loadMyReviewsModal(); loadReviews();
  } catch(e) { notify(e.message, true); }
}

// ── MY REVIEWS IN SETTINGS ────────────────────
async function loadMyReviews() {
  const wrap = document.getElementById('settings-my-reviews'); if(!wrap) return;
  if(!currentUser) { wrap.innerHTML = '<div style="padding:12px 20px;font-size:12px;color:var(--text3)">Connectez-vous pour voir vos avis.</div>'; return; }
  wrap.innerHTML = '<div style="padding:12px 20px;font-size:12px;color:var(--text3)">Chargement…</div>';
  try {
    const res = await api('get-reviews', { user_id: currentUser.id });
    const reviews = res.reviews || [];
    if(!reviews.length) {
      wrap.innerHTML = '<div style="padding:12px 20px;font-size:12px;color:var(--text3)">Aucun avis publié pour le moment.</div>';
      return;
    }
    wrap.innerHTML = reviews.map(r => `
      <div class="my-review-item" id="my-review-${r.id}">
        <div style="flex:1;min-width:0">
          <div class="my-review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
          <div class="my-review-text" id="my-review-text-${r.id}">${esc(r.text)}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:4px;font-family:'JetBrains Mono',monospace">${new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
        </div>
        <div class="my-review-actions">
          <button class="my-review-btn" onclick="editMyReview('${r.id}')">✏️ Modifier</button>
          <button class="my-review-btn del" onclick="deleteMyReview('${r.id}')">🗑️</button>
        </div>
      </div>`).join('');
  } catch(e) { wrap.innerHTML = '<div style="padding:12px 20px;font-size:12px;color:var(--red)">Erreur de chargement.</div>'; }
}

async function deleteMyReview(id) {
  if(!confirm('Supprimer cet avis ?')) return;
  try {
    await api('delete-review', { token: sessionToken, review_id: id });
    document.getElementById(`my-review-${id}`)?.remove();
    notify('✓ Avis supprimé.');
    loadReviews();
  } catch(e) { notify(e.message, true); }
}

function editMyReview(id) {
  const item = document.getElementById(`my-review-${id}`); if(!item) return;
  const textEl = document.getElementById(`my-review-text-${id}`); if(!textEl) return;
  const currentText = textEl.textContent;
  item.innerHTML = `
    <div style="flex:1;display:flex;flex-direction:column;gap:8px">
      <textarea id="edit-review-ta-${id}" class="inp" style="min-height:70px;font-size:12px;resize:vertical">${currentText}</textarea>
      <div style="display:flex;gap:6px;justify-content:flex-end">
        <button class="my-review-btn" onclick="loadMyReviews()">Annuler</button>
        <button class="my-review-btn" style="border-color:var(--accent);color:var(--accent)" onclick="saveMyReview('${id}')">✓ Sauvegarder</button>
      </div>
    </div>`;
}

async function saveMyReview(id) {
  const ta = document.getElementById(`edit-review-ta-${id}`); if(!ta) return;
  const text = ta.value.trim(); if(text.length < 5) { notify('Avis trop court.', true); return; }
  try {
    await api('submit-review', { token: sessionToken, text, stars: 5, review_id: id });
    notify('✓ Avis mis à jour.'); loadMyReviews(); loadReviews();
  } catch(e) { notify(e.message, true); }
}

function saveSession(u, token = sessionToken){
  currentUser = u;
  localStorage.setItem('bzr_session', JSON.stringify(u));
  if(token){ sessionToken = token; localStorage.setItem('bzr_token', token); }
}

// ── AUTH ──────────────────────────────────────────────────────
function switchAuthTab(tab){
  document.querySelectorAll('.auth-tab').forEach((t,i)=>t.classList.toggle('active',(i===0&&tab==='login')||(i===1&&tab==='signup')));
  document.getElementById('auth-login').classList.toggle('active',tab==='login');
  document.getElementById('auth-signup').classList.toggle('active',tab==='signup');
}
async function doLogin(){
  const email=document.getElementById('login-email').value.trim(), pass=document.getElementById('login-password').value;
  if(!email.includes('@')){ notify(t('invalidEmail'),true); return; }
  setAuthNote('login-note',t('connecting'),'inf');
  try{
    const res=await api('login',{email,password:pass});
    saveSession(res.user, res.token); setAuthNote('login-note',t('connectedOk'),'ok'); setTimeout(() => { bootApp(); }, 400);
  }catch(e){ setAuthNote('login-note',e.message,'err'); }
}

// ── CAPTCHA ───────────────────────────────────────────────────
let captchaSolved = false;
function generateCaptcha() {
  const game = document.getElementById('captcha-game'); if(!game) return;
  game.innerHTML = ''; captchaSolved = false; const shapes = ['square', 'square', 'square', 'triangle']; shapes.sort(() => Math.random() - 0.5);
  shapes.forEach(type => {
    const el = document.createElement('div'); el.className = `captcha-shape ${type}`;
    el.tabIndex = 0; el.setAttribute('role','button');
    el.setAttribute('aria-label', type === 'triangle' ? 'Triangle' : 'Carré');
    el.onclick = function() {
      if(type === 'triangle') {
        captchaSolved = true;
        const st = document.getElementById('captcha-status');
        if(st){ st.textContent = t('captchaOk'); st.style.color = '#4ade80'; st.style.fontWeight = '700'; }
        game.querySelectorAll('.captcha-shape').forEach(s => { s.style.pointerEvents = 'none'; s.style.opacity = '.4'; });
        this.style.opacity = '1'; this.style.filter = 'drop-shadow(0 0 8px #7b6ef6)';
      } else { notify(t('captchaWrong'), true); generateCaptcha(); }
    };
    game.appendChild(el);
  });
}
function initAuthEvents() {
  const signupBtn = document.querySelector('#auth-signup .btn-primary');
  if(signupBtn) signupBtn.onclick = () => { if(!captchaSolved) { notify(t('captchaRequired'), true); return; } doSignup(); };
}

function checkPassStrength(){
  const val = document.getElementById('signup-password').value;
  const wrap = document.getElementById('pass-strength-wrap');
  if(!wrap) return;
  wrap.style.display = val ? 'block' : 'none';
  if(!val) return;

  // Translate rule labels
  const ruleEl = document.getElementById('rule-len');
  if(ruleEl){
    const next = ruleEl.parentElement;
    const lis = next.querySelectorAll('li');
    if(lis[0]) lis[0].textContent = t('ruleLen');
    if(lis[1]) lis[1].textContent = t('ruleUp');
    if(lis[2]) lis[2].textContent = t('ruleLow');
    if(lis[3]) lis[3].textContent = t('ruleNum');
  }
  // Translate strength label header
  const strengthHeader = wrap.querySelector('span');
  if(strengthHeader && strengthHeader.closest('div').querySelector('.fa, [style]')) {
    // Already has the header
  }

  const rules = { len: val.length >= 8, up: /[A-Z]/.test(val), low: /[a-z]/.test(val), num: /[0-9]/.test(val) };
  Object.entries(rules).forEach(([key, ok]) => {
    const li = document.getElementById('rule-'+key);
    if(li) li.style.color = ok ? 'var(--green)' : 'var(--text3)';
  });

  const levels = [
    { label:t('veryWeak'), color:'var(--red)',    width:'20%' },
    { label:t('weak'),      color:'var(--red)',    width:'40%' },
    { label:t('medium'),    color:'var(--yellow)', width:'60%' },
    { label:t('good'),      color:'var(--accent)', width:'80%' },
    { label:t('strong'),    color:'var(--green)',  width:'100%' },
  ];
  const lvl = levels[Object.values(rules).filter(Boolean).length] || levels[0];
  const bar = document.getElementById('pass-strength-bar'), label = document.getElementById('pass-strength-label');
  if(bar){ bar.style.width = lvl.width; bar.style.background = lvl.color; }
  if(label){ label.textContent = lvl.label; label.style.color = lvl.color; }
}

async function doSignup(){
  const pseudo=document.getElementById('signup-pseudo').value.trim(), email=document.getElementById('signup-email').value.trim(), pass=document.getElementById('signup-password').value, confirm=document.getElementById('signup-confirm').value;
  if(pass !== confirm) return setAuthNote('signup-note', t('passwordsMismatch'), 'err');
  try{
    const res=await api('signup',{email,pseudo,password:pass});
    saveSession(res.user, res.token);
    // Upload avatar if chosen during signup
    if(signupAvatarBase64 && res.token){
      try { await api('upload-avatar',{token:res.token,imageBase64:signupAvatarBase64,mimeType:signupAvatarMime}); } catch(e){}
      signupAvatarBase64=null; signupAvatarMime=null;
    }
    setTimeout(bootApp,400);
  }catch(e){ setAuthNote('signup-note',e.message,'err'); }
}

function setAuthNote(id,msg,type=''){ const el=document.getElementById(id);if(el)el.textContent=msg; }
function logout(){ localStorage.removeItem('bzr_session'); localStorage.removeItem('bzr_token'); location.reload(); }

function toggleDropdown(){ document.getElementById('user-dropdown').classList.toggle('open'); }

function openProfile(section){
  try {
    const box = document.getElementById('profile-content');
    if(!box) return;
    currentProfileSection = section;
    if(section==='stats')    renderStats(box);
    else if(section==='credits')  renderCreditsInfo(box);
    else if(section==='pseudo')   renderChangePseudo(box);
    else if(section==='password') renderChangePassword(box);
    else if(section==='email')    renderChangeEmail(box);
    else if(section==='coupon')   renderApplyCoupon(box);
    else if(section==='avatar')   renderAvatarUpload(box);
    document.getElementById('profile-modal')?.classList.add('open');
  } catch(e) { console.error('Error opening profile:', e); }
}

function renderStats(box){
  const u = currentUser;
  const rank = u.role === 'dev' ? t('staffRank') : (u.vip_active ? t('vipRank') : t('memberRank'));
  const initial = (u.pseudo || u.email || '?')[0].toUpperCase();
  const avatarHtml = u.avatar_url
    ? `<img src="${esc(u.avatar_url)}" class="avatar-circle" style="width:56px;height:56px" alt="">`
    : `<div class="avatar-placeholder" style="width:56px;height:56px;font-size:20px">${initial}</div>`;
  box.innerHTML=`
    <div style="padding:20px 24px 12px;display:flex;align-items:center;gap:14px;border-bottom:1px solid var(--border)">
      ${avatarHtml}
      <div>
        <div style="font-size:16px;font-weight:800;color:var(--white)">${esc(u.pseudo||u.email)}</div>
        <div style="font-size:11px;color:var(--text3);margin-top:2px;text-transform:uppercase;letter-spacing:1px">${rank} · ${(u.plan||'standard').toUpperCase()}</div>
      </div>
    </div>
    <div class="profile-stat-grid">
      <div class="profile-stat-item"><span class="stat-val">${getCreditsLeft()} / ${u.credits_max||5}</span><span class="stat-lbl">Crédits</span></div>
      <div class="profile-stat-item"><span class="stat-val">${u.total_searches||0}</span><span class="stat-lbl">Recherches</span></div>
      <div class="profile-stat-item"><span class="stat-val">${u.login_count||1}</span><span class="stat-lbl">Connexions</span></div>
      <div class="profile-stat-item"><span class="stat-val">${new Date(u.joined_at||u.created_at).toLocaleDateString('fr')}</span><span class="stat-lbl">Inscrit le</span></div>
    </div>
    <div class="profile-plan-badge">
      <span style="font-size:13px;color:var(--text2)">Plan actuel</span>
      <span style="font-size:14px;font-weight:800;color:var(--accent)">${(u.plan||'standard').toUpperCase()}</span>
    </div>`;
}

function renderCreditsInfo(box){
  box.innerHTML=`<div style="padding:24px;text-align:center">
    <img src="logo/coins.png" style="width:60px;margin-bottom:16px">
    <h3 style="color:#fff;margin-bottom:8px">${t('buyCreditsTitle')}</h3>
    <p style="color:var(--text2);font-size:14px;margin-bottom:16px">${t('creditPriceLine')}</p>
    <div style="background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:16px;margin-bottom:20px;text-align:left">
      <p style="font-size:13px;color:var(--text2);line-height:1.6">${t('creditsInfoText')}</p>
    </div>
    <a href="${CONFIG.site.discord}" target="_blank" class="btn btn-discord" style="width:100%">${t('openDiscordTicket')}</a>
  </div>`;
}

function renderChangePseudo(box){
  box.innerHTML=`<div style="padding:24px">
    <h3 style="color:#fff;margin-bottom:16px">${t('changePseudoTitle')}</h3>
    <label class="lbl">${t('newPseudoLabel')}</label>
    <input class="inp" id="new-pseudo" placeholder="MonNouveauPseudo">
    <label class="lbl">${t('currentPasswordLabel')}</label>
    <input class="inp" type="password" id="confirm-pass" placeholder="••••••••">
    <button class="btn btn-primary" style="width:100%" onclick="updateUserField('pseudo')">${t('updateBtn')}</button>
  </div>`;
}

function renderChangePassword(box){
  box.innerHTML=`<div style="padding:24px">
    <h3 style="color:#fff;margin-bottom:16px">${t('changePasswordTitle')}</h3>
    <label class="lbl">${t('newPasswordLabel')}</label>
    <input class="inp" type="password" id="new-pass" placeholder="••••••••">
    <label class="lbl">${t('confirmNewPasswordLabel')}</label>
    <input class="inp" type="password" id="confirm-new-pass" placeholder="••••••••">
    <hr style="border:none;border-top:1px solid var(--border);margin:12px 0">
    <label class="lbl">${t('oldPasswordLabel')}</label>
    <input class="inp" type="password" id="old-pass" placeholder="••••••••">
    <button class="btn btn-primary" style="width:100%" onclick="updateUserField('password')">${t('updateBtn')}</button>
  </div>`;
}

function renderChangeEmail(box){
  box.innerHTML=`<div style="padding:24px">
    <h3 style="color:#fff;margin-bottom:16px">${t('changeEmailTitle')}</h3>
    <label class="lbl">${t('newEmailLabel')}</label>
    <input class="inp" type="email" id="new-email" placeholder="nouveau@domaine.com">
    <label class="lbl">${t('currentPasswordLabel')}</label>
    <input class="inp" type="password" id="confirm-pass" placeholder="••••••••">
    <button class="btn btn-primary" style="width:100%" onclick="updateUserField('email')">${t('updateBtn')}</button>
  </div>`;
}

function renderApplyCoupon(box){
  box.innerHTML=`<div style="padding:24px">
    <h3 style="color:#fff;margin-bottom:16px">${t('applyCouponTitle')}</h3>
    <p style="font-size:13px;color:var(--text2);margin-bottom:16px">${t('applyCouponDesc')}</p>
    <input class="inp" id="coupon-code" placeholder="BAZAAR-XXXX">
    <button class="btn btn-primary" style="width:100%" onclick="applyCoupon()">${t('activateCodeBtn')}</button>
  </div>`;
}

async function updateUserField(field){
  const body = { token: sessionToken };
  if(field === 'pseudo') {
    body.pseudo = document.getElementById('new-pseudo').value.trim();
    body.verify_password = document.getElementById('confirm-pass').value;
  } else if(field === 'email') {
    body.email = document.getElementById('new-email').value.trim();
    body.verify_password = document.getElementById('confirm-pass').value;
  } else if(field === 'password') {
    const np = document.getElementById('new-pass').value;
    const cp = document.getElementById('confirm-new-pass').value;
    if(np !== cp) return notify(t('passwordsMismatch'), true);
    body.new_password = np;
    body.verify_password = document.getElementById('old-pass').value;
  }
  try {
    const res = await api('update-user', body);
    saveSession(res.user); notify(t('changeDone')); closeProfile(); bootApp(true);
  } catch(e) { notify(e.message, true); }
}
async function applyCoupon(){
  const code = document.getElementById('coupon-code').value.trim();
  if(!code) return notify(t('enterCode'), true);
  try {
    const res = await api('coupon', { token: sessionToken, code });
    saveSession(res.user); notify(t('codeActivated')); closeProfile(); bootApp(true);
  } catch(e) { notify(e.message, true); }
}

function closeProfile(){document.getElementById('profile-modal').classList.remove('open');currentProfileSection=null;}

// ── DELETE ACCOUNT ────────────────────────────
function openDeleteAccount(){
  const box = document.getElementById('profile-content');
  if(!box) return;
  currentProfileSection = 'delete';
  box.innerHTML = `<div style="padding:24px">
    <h3 style="color:var(--red,#f87171);margin-bottom:8px">🗑️ Supprimer mon compte</h3>
    <p style="font-size:13px;color:var(--text2);margin-bottom:18px">Cette action est irréversible. Tous vos avis et données seront supprimés définitivement.</p>
    <label class="lbl">Mot de passe actuel</label>
    <input class="inp" type="password" id="del-password" placeholder="••••••••" style="margin-bottom:14px">
    <button class="btn" style="width:100%;background:rgba(248,113,113,.15);border-color:rgba(248,113,113,.4);color:var(--red,#f87171);font-weight:700" onclick="confirmDeleteAccount()">Supprimer définitivement mon compte</button>
    <p class="modal-note" id="del-note" style="min-height:16px;margin-top:10px"></p>
  </div>`;
  document.getElementById('profile-modal')?.classList.add('open');
}

async function confirmDeleteAccount(){
  const pw = document.getElementById('del-password')?.value;
  if(!pw) return setNote('del-note', 'Entrez votre mot de passe.', 'err');
  setNote('del-note', 'Suppression en cours…', 'inf');
  try {
    await api('delete-account', { token: sessionToken, password: pw });
    notify('✓ Compte supprimé.');
    localStorage.removeItem('bzr_session'); localStorage.removeItem('bzr_token');
    setTimeout(() => location.reload(), 1200);
  } catch(e) { setNote('del-note', e.message, 'err'); }
}

// ── SIGNUP AVATAR PREVIEW ──────────────────────
let signupAvatarBase64 = null;
let signupAvatarMime = null;
function previewSignupAvatar(e){
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    signupAvatarBase64 = ev.target.result;
    signupAvatarMime = file.type;
    const prev = document.getElementById('signup-avatar-preview');
    if(prev){ prev.style.background='none'; prev.innerHTML=`<img src="${signupAvatarBase64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`; }
  };
  reader.readAsDataURL(file);
}
function clearSignupAvatar(){
  signupAvatarBase64 = null; signupAvatarMime = null;
  const prev = document.getElementById('signup-avatar-preview');
  if(prev){ prev.style.background='linear-gradient(135deg,var(--accent),var(--accent2))'; prev.innerHTML='?'; }
  const fi = document.getElementById('signup-avatar-file'); if(fi) fi.value='';
}
function gotoPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
  document.getElementById('page-'+name)?.classList.add('active');
  const pages=['home','shop','tools','subs','features','contact','about','settings'];
  const idx=pages.indexOf(name); if(idx>=0)document.querySelectorAll('.nav-link')[idx]?.classList.add('active');
  if(name==='settings') { applySettings(); updateSettingsProfile(); }
}

function openSettings(){ gotoPage('settings'); closeDropdown?.(); }

function getCreditsLeft(){ return currentUser ? Math.max(0, (currentUser.credits_max||5) - (currentUser.credits_used||0)) : 0; }
function updateCreditsUI(){
  const left = getCreditsLeft();
  const max  = currentUser ? (currentUser.credits_max || 5) : 5;
  ['sq-left','credits-above-num'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=left; });
  ['sq-max','credits-above-max'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=max; });
}
function startResetTimer(){ setInterval(()=>{},1000); }

let selectedSearchType = 'auto';

function toggleSearchDD(e) {
  e.stopPropagation();
  const panel = document.getElementById('std-panel');
  const trigger = document.getElementById('std-trigger');
  if(!panel) return;
  const willOpen = !panel.classList.contains('open');
  panel.classList.toggle('open', willOpen);
  trigger?.classList.toggle('active', willOpen);
}

function pickTypeTab(el) {
  selectSearchType(el.dataset.value);
  const iconEl = document.getElementById('std-icon');
  const input  = document.getElementById('search-input');
  if(iconEl && el.dataset.icon) iconEl.src = el.dataset.icon;
  if(input  && el.dataset.ph)   input.placeholder = el.dataset.ph;
  document.querySelectorAll('.stt-btn').forEach(b => b.classList.toggle('active', b === el));
  // Hide detect label when switching to a non-auto tab
  if(el.dataset.value !== 'auto') hideAutoDetect();
  else if(input?.value.trim()) showAutoDetect(input.value.trim());
}

const AUTO_DETECT_TYPES = [
  { id:'ipv4',    label:'IPv4 Address',   icon:'🌐', test: v => /^(\d{1,3}\.){3}\d{1,3}$/.test(v) && v.split('.').every(n=>+n<=255) },
  { id:'ipv6',    label:'IPv6 Address',   icon:'🌐', test: v => /^[0-9a-fA-F:]{2,}:[0-9a-fA-F:]{2,}$/.test(v) },
  { id:'mail',    label:'Email',          icon:'✉️',  test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
  { id:'discord', label:'Discord ID',     icon:'🎮', test: v => /^\d{17,19}$/.test(v) },
  { id:'discord', label:'Discord Tag',    icon:'🎮', test: v => /^.+#\d{4}$/.test(v) },
  { id:'phone',   label:'Phone Number',   icon:'📞', test: v => /^\+?[\d\s\-().]{7,}$/.test(v) && (v.match(/\d/g)||[]).length >= 7 },
  { id:'name',    label:'Full Name',      icon:'👤', test: v => /^[a-zA-ZÀ-ÿ'-]+ [a-zA-ZÀ-ÿ'-]+/.test(v) && !/\d/.test(v) },
  { id:'username',label:'Username',       icon:'🔑', test: v => /^[a-zA-Z0-9._\-]{3,}$/.test(v) },
];

function detectInputType(val) {
  for(const t of AUTO_DETECT_TYPES) if(t.test(val)) return t;
  return null;
}

function showAutoDetect(val) {
  const wrap = document.getElementById('auto-detect-label');
  const iconEl = document.getElementById('auto-detect-icon');
  const textEl = document.getElementById('auto-detect-text');
  if(!wrap) return;
  const det = detectInputType(val);
  if(det){
    iconEl.textContent = det.icon + ' ';
    textEl.textContent = 'Type détecté : ' + det.label;
    wrap.className = 'auto-detect-label show det-' + det.id;
    wrap.style.display = '';
  } else {
    hideAutoDetect();
  }
}

function hideAutoDetect() {
  const wrap = document.getElementById('auto-detect-label');
  if(wrap){ wrap.style.display = 'none'; wrap.className = 'auto-detect-label'; }
}

document.addEventListener('DOMContentLoaded', () => {
  // Restore cooldown after page reload
  if(parseInt(localStorage.getItem('bzCooldownEnd') || '0') > Date.now()) runCooldownTimer();

  const input = document.getElementById('search-input');
  if(input) input.addEventListener('input', () => {
    if(selectedSearchType === 'auto') {
      const v = input.value.trim();
      if(v) showAutoDetect(v); else hideAutoDetect();
    }
  });
});

function pickSearchType(el) {
  selectedSearchType = el.dataset.value;
  const iconEl = document.getElementById('std-icon');
  const labelEl = document.getElementById('std-label');
  if(iconEl) iconEl.src = el.dataset.icon || 'logo/loupe.png';
  if(labelEl) labelEl.textContent = el.textContent.trim();
  document.querySelectorAll('.std-opt').forEach(o => o.classList.toggle('active', o === el));
  document.getElementById('std-panel')?.classList.remove('open');
  document.getElementById('std-trigger')?.classList.remove('active');
  const sel = document.getElementById('search-type');
  if(sel) sel.value = selectedSearchType;
}

function onSearchTypeChange(sel) { selectedSearchType = sel.value; }

function selectSearchType(type) {
  selectedSearchType = type;
  const sel = document.getElementById('search-type');
  if(sel) sel.value = type;
  searchMode = type === 'auto' ? 'auto' : 'manual';
}

function setSearchMode(mode){
  searchMode = mode;
  document.querySelectorAll('.mode-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
}

async function doSearch(){
  const q=document.getElementById('search-input').value.trim();
  if(!q) return notify(t('enterTarget'), true);
  if(!currentUser) return notify(t('loginRequired'), true);
  // Sync type from dropdown
  const sel = document.getElementById('search-type');
  if(sel) selectedSearchType = sel.value;

  // Show loading bar
  const loading = document.getElementById('search-loading');
  const cooldown = document.getElementById('search-cooldown');
  const resultsWrap = document.getElementById('results-wrap');
  const quotaWarn = document.getElementById('quota-warn');
  const fill = document.getElementById('search-fill');
  const loadText = document.getElementById('search-loading-text');
  if(loading) loading.classList.add('show');
  if(cooldown) cooldown.classList.remove('show');
  if(resultsWrap) resultsWrap.innerHTML = '';
  if(quotaWarn) quotaWarn.style.display = 'none';
  if(fill) { fill.style.animation = 'none'; fill.offsetHeight; fill.style.animation = 'searchLoad 5s linear forwards'; }
  if(loadText) loadText.textContent = 'Interrogation des sources OSINT…';

  try{
    // ── IP lookup via ipquery.io ─────────────────────────────────
    const detectedType = detectInputType(q);
    const isIpQuery = selectedSearchType === 'ip' ||
      (selectedSearchType === 'auto' && (detectedType?.id === 'ipv4' || detectedType?.id === 'ipv6'));
    if(isIpQuery){
      const ipRes = await fetch(`https://api.ipquery.io/${q}`);
      if(!ipRes.ok){
        const errMap = {400:'Adresse IP invalide.', 429:'Trop de requêtes, réessaie dans un instant.', 500:'Erreur serveur ipquery.io.'};
        throw new Error(errMap[ipRes.status] || `Erreur ${ipRes.status}`);
      }
      const d = await ipRes.json();
      if(loading) loading.classList.remove('show');
      if(!resultsWrap) return;

      const riskBadge = (val, labelTrue, labelFalse) =>
        `<span class="ip-badge${val?' ip-bad':' ip-ok'}">${val ? '⚠ '+labelTrue : '✓ '+labelFalse}</span>`;
      const riskScore = d.risk?.risk_score ?? 0;
      const scoreColor = riskScore >= 70 ? '#ef4444' : riskScore >= 30 ? '#f59e0b' : '#22c55e';

      resultsWrap.innerHTML = `
        <div class="result-item ip-result" style="animation-delay:0ms">
          <div class="ip-header">
            <span class="ip-address">${esc(d.ip)}</span>
            <span class="ip-risk-score" style="--sc:${scoreColor}">Risk: ${riskScore}/100</span>
          </div>
          <div class="ip-sections">
            <div class="ip-section">
              <div class="ip-section-title">📍 Localisation</div>
              <div class="ip-rows">
                <div class="ip-row"><span>Pays</span><span>${esc(d.location?.country||'—')} ${d.location?.country_code ? `(${esc(d.location.country_code)})` : ''}</span></div>
                <div class="ip-row"><span>Ville</span><span>${esc(d.location?.city||'—')}</span></div>
                <div class="ip-row"><span>Région</span><span>${esc(d.location?.state||'—')}</span></div>
                <div class="ip-row"><span>Code postal</span><span>${esc(d.location?.zipcode||'—')}</span></div>
                <div class="ip-row"><span>Timezone</span><span>${esc(d.location?.timezone||'—')}</span></div>
                <div class="ip-row"><span>Heure locale</span><span>${esc(d.location?.localtime||'—')}</span></div>
                ${d.location?.latitude != null ? `<div class="ip-row"><span>Coordonnées</span><span>${d.location.latitude.toFixed(4)}, ${d.location.longitude.toFixed(4)}</span></div>` : ''}
              </div>
            </div>
            <div class="ip-section">
              <div class="ip-section-title">🌐 ISP / Réseau</div>
              <div class="ip-rows">
                <div class="ip-row"><span>ISP</span><span>${esc(d.isp?.isp||'—')}</span></div>
                <div class="ip-row"><span>Organisation</span><span>${esc(d.isp?.org||'—')}</span></div>
                <div class="ip-row"><span>ASN</span><span>${esc(d.isp?.asn||'—')}</span></div>
              </div>
            </div>
            <div class="ip-section">
              <div class="ip-section-title">🛡 Analyse de risque</div>
              <div class="ip-badges">
                ${riskBadge(d.risk?.is_vpn,    'VPN',        'Pas de VPN')}
                ${riskBadge(d.risk?.is_proxy,  'Proxy',      'Pas de proxy')}
                ${riskBadge(d.risk?.is_tor,    'Tor',        'Pas de Tor')}
                ${riskBadge(d.risk?.is_mobile, 'Mobile',     'Non mobile')}
                ${riskBadge(d.risk?.is_datacenter, 'Datacenter', 'Pas datacenter')}
              </div>
            </div>
          </div>
          <div class="ip-geo-warning">⚠ La géolocalisation IP est approximative — ville, code postal et coordonnées peuvent être inexacts, surtout sur IP résidentielle ou IPv6.</div>
        </div>`;

      startCooldown(15);
      return;
    }
    // ── Other search types via backend ───────────────────────────
    const res=await api('search',{token:sessionToken, query:q, type:selectedSearchType});
    saveSession(res.user);
    updateCreditsUI();

    if(loading) loading.classList.remove('show');

    // Render search results
    if(!resultsWrap) return;
    if(res.results && res.results.length > 0){
      resultsWrap.innerHTML = res.results.map((r, i) => `
        <div class="result-item" style="animation-delay:${i*80}ms">
          <h4>${esc(r.source || 'Source '+(i+1))}</h4>
          <p>${Object.entries(r.data || {}).map(([k,v]) => `<strong>${esc(k)}:</strong> ${esc(v)}`).join('<br>')}</p>
          ${r.tag ? `<span class="result-tag">${esc(r.tag)}</span>` : ''}
        </div>
      `).join('');
    } else {
      resultsWrap.innerHTML = `<div class="result-item"><h4>Aucun résultat</h4><p>Aucune donnée trouvée pour cette cible avec les sources disponibles.</p></div>`;
    }

    startCooldown(60);
  }catch(e){
    if(loading) loading.classList.remove('show');
    notify(e.message, true);
    if(quotaWarn && e.message.includes('Quota')){
      quotaWarn.style.display = 'flex';
    }
  }
}

// ── RENDER ────────────────────────────────────────────────────
let currentShopGroup = null;
function renderShop(mainCat, groupId){
  if(mainCat) { currentShopFilter = mainCat; currentShopGroup = null; }
  const grid = document.getElementById('shop-grid');
  const subbar = document.getElementById('shop-subfilters');
  if(!grid) return;

  // Main category tabs
  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.classList.toggle('active', btn.dataset.filter === currentShopFilter));

  const cat = CONFIG.shopCategories.find(c => c.id === currentShopFilter);
  if(!cat){ grid.innerHTML=''; if(subbar) subbar.innerHTML=''; return; }

  // Pick sub-group
  if(!groupId || !cat.groups.find(g => g.id === groupId))
    groupId = cat.groups[0]?.id;
  currentShopGroup = groupId;

  // Sub-category pills
  if(subbar){
    subbar.innerHTML = cat.groups.map(g => `
      <button class="subfilter-btn${g.id===currentShopGroup?' active':''}"
        data-group="${g.id}" onclick="renderShop(null,'${g.id}')">
        <img src="${g.icon}" alt=""> ${g.name}
      </button>`).join('');
  }

  const vip = currentUser && (currentUser.vip_active || currentUser.role==='dev');
  const catLocked = cat.premium && !vip;
  const grp = cat.groups.find(g => g.id === currentShopGroup);
  if(!grp){ grid.innerHTML=''; return; }

  grid.innerHTML = grp.items.map(item => {
    const locked = catLocked;
    return `<div class="item-card${locked?' locked-card':''}" style="--glow:${grp.color||'#7b6ef6'}" onclick="${locked?'notifyVipRequired()':'openItem(\''+item.id+'\',\'shop\')'}">
      <div class="card-img"><img src="${grp.icon}" alt="">${locked?'<div class="lock-overlay">🔒</div>':''}<div class="card-glow"></div></div>
      <div class="card-body-inner">
        <div class="card-name">${item.name}</div>
        <div class="card-cat">${grp.name}</div>
        <p class="card-desc-text">${locked?'Abonnement requis.':item.desc}</p>
      </div>
      <div class="card-footer-inner">
        <span class="card-price${locked?' premium-price':''}">${locked?'🔒':item.price}</span>
        <button class="btn-sm">${t('viewBtn')}</button>
      </div>
    </div>`;
  }).join('');
  initCardSpotlight();
}

// ── OFFER COUNTDOWN ───────────────────────────
const OFFER_END = new Date('2026-07-12T23:59:59');
function startOfferCountdown() {
  function update() {
    const els = document.querySelectorAll('.offer-countdown');
    if (!els.length) return;
    const diff = OFFER_END - Date.now();
    if (diff <= 0) { els.forEach(el => el.textContent = 'EXPIRÉ'); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    const pad = n => String(n).padStart(2, '0');
    els.forEach(el => el.textContent = `${d}j ${pad(h)}h ${pad(m)}m ${pad(s)}s`);
  }
  update(); setInterval(update, 1000);
}
function renderTools(){
  const grid = document.getElementById('tools-grid'); if(!grid) return;
  const vip=currentUser&&(currentUser.vip_active || currentUser.role === 'dev');
  const visible=CONFIG.tools.filter(i=>i.category==='FreeTools' || (i.category==='Tools' && vip));
  const locked=CONFIG.tools.filter(i=>i.category==='Tools' && !vip);
  grid.innerHTML=[
    ...visible.map((item)=>`<div class="item-card${item.category==='Tools'?' premium-card':''}" onclick="openItem('${item.id}','tools')"><div class="card-img">${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="">`:item.icon}${item.category==='Tools'?'<span class="premium-crown">👑</span>':''}</div><div class="card-body-inner"><div class="card-name">${item.name}</div><div class="card-cat">${item.category}</div><p class="card-desc-text">${item.desc.substring(0,80)}…</p></div><div class="card-footer-inner"><span class="${item.category==='Tools'?'premium-price':'card-free'}">${item.category==='Tools'?t('premiumBadge'):t('freeBadge')}</span><button class="btn-sm">${t('viewBtn')}</button></div></div>`),
    ...locked.map((item)=>`<div class="item-card premium-card locked-card" onclick="notifyVipRequired()"><div class="lock-overlay">🔒</div><div class="card-img">${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="">`:item.icon}</div><div class="card-body-inner"><div class="card-name">${item.name}</div><div class="card-cat">${item.category}</div><p class="card-desc-text">${t('paidToolDesc')}</p></div><div class="card-footer-inner"><span class="premium-price">🔒</span><button class="btn-sm">${t('unlockBtn')}</button></div></div>`)
  ].join('');
}
function renderPlans(){
  const grid=document.getElementById('plans-grid'); if(!grid) return;
  grid.innerHTML=CONFIG.plans.map((p, idx)=>`
    <div class="plan-card${p.highlight?' plan-highlight':''}" style="border-color:${p.highlight?'var(--yellow)':p.color+'33'}">
      ${p.highlight?`<div class="plan-best">${t('bestValue')}</div>`:''}
      <div class="plan-name" style="color:${p.color}">${p.name}</div>
      <div class="plan-subtitle">${p.subtitle}</div>
      <div class="plan-price">${p.price}<span class="plan-period"> ${p.period}</span></div>
      <div class="plan-searches-badge">${p.searches>=999999?t('unlimitedSearches'):p.searches} ${t('searchesPerDay')}</div>
      <hr style="border:none;border-top:1px solid var(--border);margin:0">
      <ul class="plan-features">${p.features.map(f=>`<li class="${f.ok?'ok':'no'}"><span class="plan-check">${f.ok?'✓':'✗'}</span>${f.text}</li>`).join('')}</ul>
      <a href="${CONFIG.site.discord}" target="_blank" class="btn-plan-cta${p.highlight?' btn-plan-cta-hl':''}"><img src="logo/discord.png" alt="">${(currentUser&&p.id==='plan_free')?t('currentPlan'):t('subscribeBtn')}</a>
      <p class="plan-ticket-note">${t('openTicketToActivate')}</p>
    </div>`).join('');
  initCardSpotlight();
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

function notifyVipRequired(){notify('🔒 Abonnement supérieur requis.',true);}

function findShopGroup(itemId){
  for(const cat of CONFIG.shopCategories)
    for(const grp of cat.groups)
      if(grp.items.find(i=>i.id===itemId)) return grp;
  return null;
}

function openItem(id,src){
  const item = src==='shop' ? CONFIG.shop.find(i=>i.id===id) : CONFIG.tools.find(i=>i.id===id);
  if(!item) return; currentItemForDl=item;
  const grp = src==='shop' ? findShopGroup(id) : null;
  const isShop = src==='shop';
  const box = document.getElementById('item-modal-content');
  const icon = item.icon.startsWith('logo/') ? `<img src="${item.icon}" style="width:52px;height:52px;object-fit:contain">` : `<span style="font-size:42px">${item.icon}</span>`;
  const badgesHtml = grp?.badges ? `
    <div class="im-badges">${grp.badges.map(b=>`<span class="im-badge">${b}</span>`).join('')}</div>` : '';
  const longDescHtml = grp?.longDesc ? `<p class="im-longdesc">${grp.longDesc}</p>` : '';
  const warningHtml = grp?.warning ? `
    <div class="im-warning"><img src="logo/construction.png" alt="" style="width:14px;height:14px;opacity:.7"> ${grp.warning}</div>` : '';
  const howHtml = isShop ? `
    <div class="im-how">
      <div class="im-how-title">Comment commander</div>
      <div class="im-how-steps">
        <div class="im-how-step"><span class="im-step-n">1</span>Clique sur "Commander sur Discord" ci-dessous</div>
        <div class="im-how-step"><span class="im-step-n">2</span>Ouvre un ticket et indique le produit souhaité</div>
        <div class="im-how-step"><span class="im-step-n">3</span>Effectue le paiement et reçois ta livraison</div>
      </div>
    </div>` : '';

  box.innerHTML = `
    <div class="im-header">
      <h2>${isShop ? 'Détails du produit' : 'Outil — Détails'}</h2>
      <button class="modal-close-btn" onclick="closeItemView()">✕</button>
    </div>
    <div class="im-body">
      <div class="im-top">
        <div class="im-icon-wrap">${icon}</div>
        <div class="im-info">
          <div class="im-cat">${item.category}</div>
          <h1 class="im-name">${item.name}</h1>
          <p class="im-desc">${item.desc}</p>
        </div>
      </div>
      ${badgesHtml}
      ${longDescHtml}
      ${howHtml}
      ${warningHtml}
      <div class="im-cta-row">
        <div class="im-price-block">
          <div class="im-price-lbl">${isShop ? 'Prix' : 'Gratuit'}</div>
          <div class="im-price-val" style="color:${isShop?'var(--white)':'var(--green)'}">${isShop ? item.price : 'FREE'}</div>
        </div>
        <a href="${CONFIG.site.discord}" target="_blank" class="btn btn-discord" style="flex:1;justify-content:center">
          <img src="logo/discord.png" alt="">${isShop ? 'Commander sur Discord' : 'Rejoindre le serveur Discord'}
        </a>
      </div>
    </div>`;
  document.getElementById('item-modal').classList.add('open');
}
function closeItemView(){document.getElementById('item-modal').classList.remove('open');}
function downloadTool(){ if(!currentItemForDl)return; const blob=new Blob([currentItemForDl.dlContent||`=== ${currentItemForDl.name} ===\ndiscord.gg/ssYFSXRGPP`],{type:'text/plain;charset=utf-8'}); const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=(currentItemForDl.name||'tool').replace(/[^a-z0-9]/gi,'_').toLowerCase()+'.txt';a.click();URL.revokeObjectURL(a.href); notify(t('downloadStarted')); }

let nq=[],nActive=false;
function notify(msg,err=false){nq.push({msg,err});if(!nActive)processNotif();}
function processNotif(){ if(!nq.length){nActive=false;return;}nActive=true; const{msg,err}=nq.shift();const el=document.getElementById('notif'); el.textContent=msg;el.className='notif show'+(err?' notif-err':''); clearTimeout(el._t);el._t=setTimeout(()=>{el.className='notif';setTimeout(processNotif,300);},2800); }

let reviewStars = 5;
function openReviewModal() { if(!currentUser) { notify(t('loginToReview'), true); return; } document.getElementById('review-pseudo').value = currentUser.pseudo; document.getElementById('review-modal').classList.add('open'); setReviewStars(5); }
function closeReviewModal() { document.getElementById('review-modal').classList.remove('open'); }
function setReviewStars(n) { reviewStars = n; document.getElementById('review-stars-val').textContent = n + '/5'; document.querySelectorAll('.star-btn').forEach((s, i) => { s.style.color = i < n ? 'var(--yellow)' : 'var(--text3)'; }); }
async function submitReview() {
  const btn = document.querySelector('#review-modal .btn-primary'), text = document.getElementById('review-text').value.trim();
  if(text.length < 5) { setNote('review-note', t('reviewTooShort'), 'err'); return; }
  if(btn.disabled) return; btn.disabled = true; setNote('review-note', t('sending'), 'inf');
  try { await api('submit-review', { token: sessionToken, text, stars: reviewStars }); setNote('review-note', t('reviewSent'), 'ok'); setTimeout(() => { closeReviewModal(); loadReviews(); btn.disabled = false; }, 1200); } catch(e) { setNote('review-note', e.message, 'err'); btn.disabled = false; }
}

async function loadReviews() {
  try {
    const res = await api('get-reviews', {}); const m = document.getElementById('reviews-marquee'); if(!m) return;
    if(!res.reviews || res.reviews.length === 0) { m.innerHTML = `<div style="color:var(--text3);font-size:12px;text-align:center;width:100%">${t('noReviewsYet')}</div>`; return; }
    let items = res.reviews;
    if(items.length < 15) {
      let repeated = [];
      const targetCount = items.length === 1 ? 10 : 20;
      while(repeated.length < targetCount) repeated = [...repeated, ...items];
      items = repeated;
    }
    m.innerHTML = items.map(r => {
      const initial = (r.pseudo || '?')[0].toUpperCase();
      const avatarHtml = r.avatar_url
        ? `<div class="rc-avatar-wrap"><img src="${esc(r.avatar_url)}" class="review-avatar" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="review-avatar-placeholder" style="display:none">${initial}</div></div>`
        : `<div class="rc-avatar-wrap"><div class="review-avatar-placeholder">${initial}</div></div>`;
      const stars = '★'.repeat(r.stars) + '☆'.repeat(5 - r.stars);
      const textShort = esc(r.text).substring(0, 220);
      return `<div class="review-card">
        <div class="rc-header">
          ${avatarHtml}
          <div class="rc-meta">
            <div class="rc-pseudo">${esc(r.pseudo)}</div>
            <div class="rc-stars">${stars}</div>
          </div>
        </div>
        <p class="rc-text">${textShort}${r.text.length > 220 ? '…' : ''}</p>
        <div class="rc-date">${new Date(r.created_at).toLocaleDateString('fr-FR')}</div>
      </div>`;
    }).join('');
  } catch(e) {}
}

// ── CARD SPOTLIGHT ────────────────────────────
function initCardSpotlight() {
  document.querySelectorAll('.item-card, .plan-card, .info-card, .how-step, .stat-card').forEach(card => {
    if(card.dataset.spotlightInit) return;
    card.dataset.spotlightInit = '1';

    // Add spotlight div for item-cards
    if(card.classList.contains('item-card') && !card.querySelector('.card-spotlight')) {
      const sp = document.createElement('div');
      sp.className = 'card-spotlight';
      card.appendChild(sp);
    }

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1) + '%';
      const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1) + '%';
      card.style.setProperty('--sx', x);
      card.style.setProperty('--sy', y);
      const sp = card.querySelector('.card-spotlight');
      if(sp) { sp.style.setProperty('--sx', x); sp.style.setProperty('--sy', y); }
    }, { passive: true });
  });
}

// ── AVATAR UPLOAD ─────────────────────────────
function renderAvatarUpload(box) {
  const u = currentUser;
  const initial = (u?.pseudo || u?.email || '?')[0].toUpperCase();
  const avatarHtml = u?.avatar_url
    ? `<img src="${esc(u.avatar_url)}" class="avatar-preview-img" id="avatar-preview" alt="">`
    : `<div class="avatar-preview-placeholder" id="avatar-preview">${initial}</div>`;
  box.innerHTML = `
    <div class="avatar-upload-area">
      ${avatarHtml}
      <div style="text-align:center">
        <p style="font-size:13px;color:var(--text2);margin-bottom:12px">Photo de profil visible sur les avis.</p>
        <label class="avatar-upload-btn" style="cursor:pointer">
          📸 Choisir une image
          <input type="file" accept="image/*" id="avatar-file-input" style="display:none" onchange="handleAvatarFile(event)">
        </label>
      </div>
      <p class="modal-note" id="avatar-note" style="min-height:16px"></p>
    </div>`;
}

async function handleAvatarFile(e) {
  const file = e.target.files[0]; if(!file) return;
  if(file.size > 2 * 1024 * 1024) { setNote('avatar-note', 'Image trop grande (max 2MB).', 'err'); return; }
  setNote('avatar-note', 'Chargement…', 'inf');
  const reader = new FileReader();
  reader.onload = async ev => {
    const b64 = ev.target.result;
    // Preview
    const prev = document.getElementById('avatar-preview');
    if(prev) { prev.src = b64; prev.onerror = null; }
    try {
      const res = await api('upload-avatar', { token: sessionToken, imageBase64: b64, mimeType: file.type });
      currentUser.avatar_url = res.avatar_url;
      saveSession(currentUser);
      // Update nav avatar and settings avatar immediately
      const navAv = document.getElementById('nav-avatar-img');
      if(navAv) { navAv.src = res.avatar_url; navAv.style.borderRadius='50%'; }
      const settAv = document.getElementById('settings-avatar-img');
      if(settAv) { settAv.src = res.avatar_url; settAv.style.display = 'block'; document.getElementById('settings-avatar-initial')?.style && (document.getElementById('settings-avatar-initial').style.display='none'); }
      setNote('avatar-note', '✓ Photo mise à jour !', 'ok');
    } catch(err) { setNote('avatar-note', err.message, 'err'); }
  };
  reader.readAsDataURL(file);
}

function setNote(id, msg, type='') {
  const el = document.getElementById(id); if(!el) return;
  el.textContent = msg;
  el.className = 'modal-note' + (type ? ' '+type : '');
}

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function copyLTC(){navigator.clipboard.writeText(CONFIG.site.ltcAddress).then(()=>notify(t('ltcCopied')));}

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){closeItemView();closeProfile();closeSettings();closeReviewModal();}
  if(e.key==='Enter'){
    const authVisible = !document.getElementById('auth-screen')?.classList.contains('hidden');
    if(authVisible){
      if(document.getElementById('auth-signup')?.classList.contains('active')) doSignup();
      else if(document.getElementById('auth-login')?.classList.contains('active')) doLogin();
    } else if(e.target.id==='search-input'){
      doSearch();
    }
  }
  // Generic keyboard activation for div/span elements used as buttons (role="button")
  if((e.key==='Enter'||e.key===' ') && e.target.getAttribute && e.target.getAttribute('role')==='button'){
    e.preventDefault(); e.target.click();
  }
});

// Close modals when clicking the backdrop (not when clicking inside the box)
document.addEventListener('click', e => {
  if(e.target.classList?.contains('modal-bg')){
    closeItemView(); closeProfile(); closeSettings(); closeReviewModal();
  }
});
