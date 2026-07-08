// ============================================================
//  BAZAAR — APP.JS v6
// ============================================================
let currentUser = null;
let sessionToken = null;
let currentItemForDl = null;
let currentShopFilter = 'discord';
let currentProfileSection = null;
let searchMode = 'auto';

// ── GLOBAL 48h CREDIT RESET ──────────────────────────
const CREDIT_EPOCH = new Date('2026-01-01T00:00:00Z').getTime();
const CREDIT_PERIOD = 48 * 3600 * 1000;
function getCreditPeriod(){ return Math.floor((Date.now() - CREDIT_EPOCH) / CREDIT_PERIOD); }
function getCreditPeriodEnd(){ return CREDIT_EPOCH + (getCreditPeriod() + 1) * CREDIT_PERIOD; }
function getCreditResetLeft(){ return Math.max(0, Math.floor((getCreditPeriodEnd() - Date.now()) / 1000)); }

let resetTimerInterval = null;
function startResetTimer(){
  const row = document.getElementById('sr-reset');
  const span = document.getElementById('sr-timer');
  if(!row || !span) return;
  if(resetTimerInterval) clearInterval(resetTimerInterval);
  function tick(){
    const left = getCreditsLeft();
    const max = currentUser ? (currentUser.credits_max || 5) : 5;
    if(left >= max || !currentUser){
      row.style.display = 'none';
      return;
    }
    const sec = getCreditResetLeft();
    if(sec <= 0){ row.style.display = 'none'; return; }
    row.style.display = '';
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    span.textContent = `${h}h ${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`;
  }
  tick();
  resetTimerInterval = setInterval(tick, 1000);
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
    unlimitedSearches:'Illimitées', searchesPerDay:'recherches / 48h', bestValue:'MEILLEURE OFFRE',
    currentPlan:'Plan actuel', subscribeBtn:'S\'abonner', buyBtn:'Acheter ce plan', openTicketToActivate:'Ouvrez un ticket Discord pour activer',
    // order page
    orderTitle:'Finaliser votre commande', orderSub:'Completez votre abonnement en toute simplicité.',
    orderSubShop:'Complétez votre achat en toute simplicité.',
    promoCodeTitle:'Code promo', applyBtn:'Appliquer',
    payWithTitle:'Payer avec',
    orderSummaryTitle:'Récapitulatif', orderDiscount:'Réduction', orderTotal:'Total',
    orderItemCount:'Articles', orderSubtotal:'Sous-total', orderSavings:'Économies réalisées',
    orderPayment:'Paiement', orderCrypto:'Crypto',
    acceptedCurrencies:'Devises acceptées',
    yourOrderCode:'Votre code de commande',
    orderCodePageNote:'Copiez ce code et ouvrez un ticket Discord section <strong>« Shop purchase »</strong> pour finaliser.',
    orderPayNote:'Vos informations sont cryptées et sécurisées.',
    orderCodeTitle:'🔑 Votre code de commande', orderCodeDesc:'Utilisez ce code dans un ticket Discord pour finaliser votre achat.',
    orderCodeNote:'⚠️ Gardez ce code confidentiel. Un staff ne vous le demandera jamais en public.',
    tutorialTitle:'Comment finaliser votre commande ?',
    tutorialStep1:'Cliquez sur <strong>« Pay with crypto »</strong> ci-dessus pour générer votre code de commande.',
    tutorialStep2:'Copiez ce code et ouvrez un <strong>ticket Discord</strong> dans la section <strong>« Shop purchase »</strong>.',
    tutorialStep3:'Donnez le code de commande ainsi que votre <strong>méthode de paiement</strong> au staff.',
    tutorialStep4:'Les instructions de paiement vous seront communiquées par le staff sous <strong>24h maximum</strong>.',
    openTicketCta:'Ouvrir un ticket Discord',
    backToSubs:'← Retour aux abonnements', backToShop:'← Retour à la boutique', backToTools:'← Retour aux tools',
    // item modal
    detailsTitle:'Détails', priceLabel:'Prix', freeLabel:'GRATUIT', downloadBtn:'Télécharger',
    orderBtn:'Commander', downloadStarted:'⬇ Téléchargement lancé !',
    // profile / stats
    myStats:'Mes Statistiques', creditsLabel:'Crédits', rankLabel:'Rang', staffRank:'STAFF',
    adminRank:'Admin',
    vipRank:'VIP', memberRank:'Membre', searchesLabel:'Recherches', loginsLabel:'Connexions',
    userLabel:'Utilisateur',
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
    invalidEmail:'Email invalide.', connecting:'Connexion…', connectingServer:'Connexion au serveur…', connectedOk:'✓ Connecté !',
    enterTarget:'Veuillez entrer une cible.', loginRequired:'🔑 Connexion requise.',
    loginRequiredSection:'🔑 Connexion requise pour accéder à cette section.', welcomeMsg:'👋 Bienvenue, ',
    passwordsMismatch:'Les mots de passe ne correspondent pas.', changeDone:'✓ Changement effectué !',
    enterCode:'Entrez un code.', codeActivated:'✓ Code activé !',
    forgotPassword:'Mot de passe oublié ?', verifyEmailTitle:'Vérifiez votre email',
    verifyEmailSub:'Entrez le code à 6 chiffres envoyé à', verifCode:'Code de vérification',
    verifyAndCreate:'Vérifier et créer mon compte', noCodeReceived:'Pas reçu de code ?',
    resendCode:'Renvoyer', backToForm:'← Retour au formulaire',
    forgotTitle:'Mot de passe oublié', forgotSub:'Entrez votre email pour recevoir un code de réinitialisation.',
    sendResetCode:'Envoyer le code', backToLogin:'← Retour à la connexion',
    resetTitle:'Réinitialiser le mot de passe', resetPasswordBtn:'Réinitialiser le mot de passe',
    codeSent:'✓ Code envoyé ! Vérifiez vos emails.', passwordTooShort:'Mot de passe trop court (8 caractères minimum).',
    passwordResetOk:'✓ Mot de passe réinitialisé !',
    noResults:'Aucun résultat', noResultsDesc:'Aucune donnée trouvée pour cette cible avec les sources disponibles.',
    resultLabel:'Résultat',
    loginToReview:'🔑 Connectez-vous pour laisser un avis.', reviewTooShort:'Avis trop court.',
    sending:'Envoi…', reviewSent:'✓ Avis envoyé !', noReviewsYet:'Aucun avis pour le moment.',
    ltcCopied:'✓ Adresse LTC copiée !', captchaWrong:'❌ Raté !', captchaOk:'✓ Ok !', captchaRequired:'⚠️ Captcha !',
    serverError:'Erreur serveur', serverErrorParse:'Erreur serveur (Réponse invalide).',
    // static footer/captcha
    navTitle:'Navigation', communityTitle:'Communauté', communityDesc:'Support & News sur Discord.',
    captchaPrompt:'Sécurité : Cliquez sur le triangle', captchaHint:'Veuillez prouver que vous êtes humain',
    passStrength:'Force du mot de passe',
    veryWeak:'Très faible', weak:'Faible', medium:'Moyen', good:'Bon', strong:'Fort',
    ruleLen:'• Au moins 8 caractères', ruleUp:'• Contient une majuscule',
    ruleLow:'• Contient une minuscule', ruleNum:'• Contient un chiffre',
    // auth left panel
    authTagline:'Intelligence OSINT pour les professionnels',
    authSubText:'Recherchez des informations sur n\'importe quelle cible — email, téléphone, IP, Discord ID — en quelques secondes.',
    authStatSources:'<strong>47 sources</strong>OSINT en temps réel',
    authStatSupport:'<strong>Support 7j/7</strong>Par Boubou & ZIamana',
    authStatPayments:'<strong>Paiements</strong>LTC, PayPal, PSC & Crypto',
    authAboutTitle:'À propos des créateurs',
    authAboutText:'Fondé par une équipe de passionnés de cybersécurité, Bazaar est la solution ultime pour vos enquêtes numériques. Nous acceptons de nombreux moyens de paiement pour garantir votre anonymat et votre confort.',
    // hero / features
    heroFeatureCrypto:'Crypto anonyme',
    heroFeaturePaypal:'PayPal F&F',
    heroFeatureDiscord:'Support Discord',
    heroFeatureTools:'Outils gratuits',
    creditsRemaining:'Crédits Restants',
    searchPlaceholder:'Recherche automatique…',
    phEmail:'Adresse email…', phPhone:'Numéro de téléphone…', phIp:'Adresse IP…', phName:'Nom complet…', phMachineId:'Machine ID…',
    phDiscordId:'ID Discord (17-19 chiffres)…', phGithub:'Pseudo GitHub…', phTwitter:'Pseudo Twitter/X…',
    phTiktok:'Pseudo TikTok…', phReddit:'Pseudo Reddit…', phSocial:'Pseudo à rechercher…',
    phUsernameHistory:'Pseudo actuel…', phDomainIntel:'Nom de domaine…', phXbox:'Gamertag Xbox…',
    phRoblox:'Pseudo Roblox…', phMinecraft:'Pseudo Minecraft…',
    loginRequiredTitle:'Connexion requise pour rechercher',
    loginRequiredBtn:'Se connecter',
    loadingSearch:'Interrogation des sources OSINT…',
    statusOperational:'Service opérationnel', statusDegraded:'Service dégradé', statusDown:'Service hors ligne',
    accountCreated:'Créé le', linkedEmails:'Emails liés', breachMentions:'Mentions dans des fuites', otherInfo:'Autres informations',
    stolenInfoTitle:'Informations volées', loadedLabel:'chargés', stealerLogTag:'LOG DE MALWARE',
    addToCart:'Ajouter au panier', cartAdded:'✓ Ajouté au panier', cartAlreadyIn:'Déjà dans le panier',
    cartFull:'Panier plein (5 articles max)', removeFromCartBtn:'Retirer du panier', moreInfoBtn:'Plus d\'informations',
    accessCart:'Accéder au panier',
    shopOffTitle:'Boutique temporairement indisponible', shopOffDesc:'La boutique est en maintenance. Reviens un peu plus tard, ou passe sur notre Discord pour plus d\'infos.',
    osintOffTitle:'Recherche temporairement indisponible', osintOffDesc:'L\'outil de recherche est en maintenance. Le reste du site reste accessible normalement.',
    siteStatusShopLabel:'Boutique en ligne', siteStatusOsintLabel:'Recherche OSINT en ligne', siteStatusUpdated:'✓ Statut mis à jour',
    pageCartTitle:'Panier', pageCartSub:'Retrouvez ici les articles ajoutés depuis la boutique, les tools et les abonnements.',
    cartEmpty:'Votre panier est vide.', cartEmptyCta:'Découvrir la boutique', cartCheckoutBtn:'Passer la commande',
    cartOrderName:'Panier', removeFromCart:'Retirer du panier', backToCart:'← Retour au panier',
    quotaExhausted:'⛔ Quota épuisé',
    autoDetectPrefix:'Type détecté : ',
    // reviews
    reviewsTitle:'Avis clients',
    reviewsSub:'Ce que nos utilisateurs disent de Bazaar.',
    leaveReview:'⭐ LAISSER UN AVIS ⭐',
    reviewsBtnAlt:'⭐ Avis Clients',
    // stats row
    statDiscord:'Serveur Discord',
    statJoin:'Rejoindre ↗',
    statActive:'Actif',
    statSources:'Sources OSINT',
    statUptime:'Uptime',
    statPayment:'Payment Methods',
    statBuy:'Buy in Discord ↗',
    // how section
    howTitle:'Comment ça marche',
    howSub:'De l\'inscription à votre première recherche en moins de 2 minutes.',
    howStep1Title:'1. Créez votre compte',
    howStep1Desc:'Renseignez votre email, pseudo et mot de passe. Création instantanée, aucune vérification requise.',
    howStep2Title:'2. Connectez-vous',
    howStep2Desc:'Utilisez votre email et mot de passe. Session persistante — reconnexion automatique à chaque visite.',
    howStep3Title:'3. Lancez une recherche',
    howStep3Desc:'Entrez n\'importe quelle cible. Mode auto-détection ou manuel — résultats en quelques secondes.',
    // community CTA
    communityCtaTitle:'Rejoignez notre communauté',
    communityCtaDesc:'Support, annonces, codes et bien plus sur notre Discord.',
    // announcements
    announceOffer:'🎁 Offre — Starter Gratuit',
    announceOfferDesc:'Invite <strong>10 personnes</strong> sur Discord → plan <strong>Starter</strong> offert',
    announceOfferDesc2:'Invite <strong>10 personnes</strong> sur notre Discord et reçois l\'abonnement <strong>Starter</strong> gratuitement. Offre valable jusqu\'au 12 juillet 2026.',
    announceOfferDesc3:'Invite 10 personnes sur Discord → Starter offert. Expire :',
    announceOfferDesc4:'Invite <strong>10 personnes</strong> sur Discord → reçois le plan <strong>Starter</strong> gratuitement.',
    announceCta:'Rejoindre',
    announceExpire:'Expire dans :',
    recruitTitle:'📋 Recrutement Helper',
    recruitTitle2:'📋 Recrutement — Helper Discord',
    recruitDesc:'Rejoins l\'équipe Bazaar en tant que <strong>Helper</strong> — ouvre un ticket sur Discord.',
    recruitDesc2:'Nous recrutons des <strong>Helpers</strong> pour notre serveur Discord. Ouvre un ticket si tu souhaites postuler.',
    recruitCta:'Ticket',
    betaNotice:'Site en bêta — des bugs peuvent survenir, signalez-les sur notre <a href="https://discord.gg/ssYFSXRGPP" target="_blank" style="color:rgba(251,191,36,.7);text-decoration:underline">Discord</a>.',
    boostOfferTitle:'🚀 Offre de Boost Discord',
    boostCta:'Booster le serveur',
    // shop page
    pageShopTitle:'Boutique',
    pageShopSub:'Comptes et services premium. Paiement via Discord.',
    filterDiscord:'Discord',
    filterStreaming:'Streaming',
    filterGames:'Games',
    filterVpn:'VPN',
    filterTransfert:'Transfert',
    filterPremium:'Premium',
    paymentTitle:'Moyens de paiement acceptés',
    payFnf:'Friends & Family uniquement',
    payWarn1:'⚠️ Paiements en USD non acceptés — EUR uniquement.',
    payWarn2:'⚠️ PayPal F&F obligatoire — Goods & Services refusé.',
    payCoordTitle:'PayPal :',
    payCoordLtc:'LTC :',
    createTicket:'Créer un ticket',
    // tools page
    pageToolsTitle:'Tools',
    pageToolsSub:'Outils OSINT & packs téléchargeables.',
    toolsFreeNotice:'✓ Tous les outils Standard sont gratuits et téléchargeables directement.',
    vsPageSub:'Site web informatique complet & vérification d\'identité.',
    vsDesc:'Une plateforme complète dédiée à l\'informatique et à la vérification d\'identité en ligne. Rendez-vous sur le site pour découvrir l\'ensemble des outils et services disponibles.',
    vsBadgeId:'Vérification d\'identité', vsBadgeSecure:'Sécurisé', vsBadgeCertified:'Certifié', vsOpenBtn:'Ouvrir le site',
    standardTools:'Free',
    standardToolsDesc:'Outils gratuits accessibles à tous.',
    premiumTools:'Payant',
    premiumToolsDesc:'Outils payants à l\'unité, même système de paiement que la boutique.',
    premiumVipNote:'VIP requis',
    premiumRequiredCta:'Premium requis — va dans Abonnements pour voir les plans disponibles.',
    // subs page
    pageSubsTitle:'Abonnements',
    pageSubsSub:'Choisissez le plan qui vous convient et boostez vos capacités.',
    boostOfferDesc:'Boostez notre serveur Discord <strong>2 fois</strong> et recevez l\'abonnement <span style="color:var(--accent);font-weight:700">STARTER</span> gratuitement à vie !',
    howSubTitle:'Comment s\'abonner ?',
    howSubDesc:'La procédure est simple et sécurisée :',
    howSubDesc2:'Nous acceptons les modes de paiement suivants :',
    howSubStep1:'1. Rejoignez notre serveur <strong>Discord</strong>.',
    howSubStep2:'2. Ouvrez un <strong>ticket</strong> de commande.',
    howSubStep3:'3. Un administrateur traitera votre demande sous 24h.',
    howSubCta:'Ouvrir un ticket',
    subPayTitle:'Moyens de paiement',
    subPayWarning:'⚠️ PayPal G&S et autres devises que EUR sont refusés.',
    // features page
    pageFeaturesTitle:'Fonctionnalités',
    pageFeaturesSub:'Tout ce que Bazaar offre — OSINT, sécurité, flexibilité.',
    featResponseTime:'Temps de réponse',
    featPaymentsAccepted:'Paiements acceptés',
    featCard1Title:'Recherche OSINT',
    featCard2Title:'Auto-détection',
    featCard3Title:'Résultats instantanés',
    featCard4Title:'Sécurité intégrée',
    featCard5Title:'Plans flexibles',
    featCard6Title:'Bilingue FR / EN',
    featCard7Title:'Multi-paiement',
    featCard8Title:'Boutique intégrée',
    featCard1Desc:'Data Leaks, Social & Gaming, Network — Email, téléphone, IP, Discord, GitHub, Roblox, Xbox, Minecraft, WHOIS et bien plus, en mode Manual ou Automated.',
    featCard2Desc:'Le moteur identifie automatiquement le type de cible saisie. Aucune configuration manuelle requise.',
    featCard3Desc:'Résultats agrégés en moins de 2 secondes grâce à des requêtes parallèles sur toutes les sources.',
    featCard4Desc:'Délai anti-spam entre les recherches. Tokens de session signés HMAC. Pas de stockage de résultats.',
    featCard5Desc:'De 12 recherches / 48h en Standard à 64 en Lifetime. Choisissez selon vos besoins.',
    featCard6Desc:'Interface complète en Français et Anglais. Changez instantanément dans les Paramètres.',
    featCard7Desc:'LTC, PayPal F&F, Paysafecard, et autres cryptos. Paiements traités via Discord.',
    featCard8Desc:'Nitro Discord, Server Boosts, Currency Exchange — au meilleur prix, sans intermédiaire.',
    featCreditsTable:'Crédits par plan',
    featColPlan:'Plan',
    featColCredits:'Crédits/48h',
    featColPrice:'Prix',
    featFree:'Gratuit',
    featOnce:'une fois',
    // contact page
    pageContactTitle:'Contact',
    pageContactSub:'Notre équipe vous répond en moins de 2 heures.',
    contactDiscordTitle:'Discord Officiel',
    contactDiscordDesc:'Canal principal pour le support, les commandes, les annonces et les codes promo exclusifs.',
    contactJoinServer:'Rejoindre le serveur',
    contactResponseTitle:'Temps de réponse',
    contactResponseTime:'<strong>&lt; 2h</strong> en général',
    contactSupport:'Support 7j/7',
    contactCopy:'Copier',
    contactOrderTitle:'Pour les commandes',
    contactOrderDesc:'Ouvrez un ticket sur Discord. Précisez votre commande, votre méthode de paiement et votre pseudo Bazaar. Délai de livraison : 1 à 24 heures.',
    // about page
    pageAboutTitle:'À propos',
    pageAboutSub:'Bazaar Services — La référence OSINT francophone depuis 2026.',
    aboutMissionTitle:'Notre mission',
    aboutMissionDesc:'Bazaar est une plateforme OSINT (Open Source Intelligence) fondée en 2026 par deux passionnés de cybersécurité. Notre objectif : rendre la recherche d\'informations publiques accessible, rapide et fiable — en un seul endroit.',
    aboutMissionWarning:'⚠️ Bazaar n\'utilise que des données publiquement accessibles. Usage légal et éthique strictement requis.',
    aboutTeamTitle:'L\'équipe fondatrice',
    aboutStatsTitle:'En chiffres',
    aboutSources:'Sources OSINT',
    aboutAvailability:'Disponibilité',
    aboutSupport:'Support',
    aboutFounded:'Fondé en',
    aboutPaymentTitle:'Paiements acceptés',
    aboutPayOther:'Paysafecard & Autres',
    aboutPayOtherDesc:'Via ticket Discord uniquement',
    aboutLegalLink:'📄 Mentions légales · Confidentialité · CGU',
    // legal page
    pageLegalTitle:'Informations Légales',
    pageLegalSub:'Mentions légales, politique de confidentialité et conditions d\'utilisation.',
    // settings page
    pageSettingsHeader:'⚙️ Paramètres',
    pageSettingsSub:'Personnalisez votre expérience Bazaar.',
    sblockInterface:'🎨 Interface',
    sblockUser:'👤 Utilisateur',
    sblockStats:'📊 Statistiques',
    sblockProject:'ℹ️ Projet',
    langFr:'FR',
    langEn:'EN',
    themeDark:'🌙 Sombre',
    themeLight:'☀️ Clair',
    cursorEnabled:'✓ Activé',
    cursorDisabled:'✕ Désactivé',
    animEnabled:'✓ Activées',
    animDisabled:'✕ Désactivées',
    changeAvatar:'Changer la photo',
    sblockAvatar:'Photo de profil',
    myReviews:'Mes avis',
    sblockLogout:'Se déconnecter',
    modify:'Modifier',
    change:'Changer',
    view:'Voir',
    logout:'Déconnexion',
    deleteAccount:'Supprimer le compte',
    delete:'Supprimer',
    statsCredits:'Crédits',
    statsSearches:'Recherches',
    statsLogins:'Connexions',
    statsPlan:'Plan',
    memberSince:'Membre depuis',
    lastLogin:'Dernière connexion',
    role:'Rôle',
    projectVersion:'Version',
    projectCreators:'Créateurs',
    projectAvailability:'Disponibilité',
    projectSources:'Sources OSINT',
    projectFounded:'Fondé en',
    joinDiscordBtn:'Rejoindre le Discord',
    // footer
    footerBrandDesc:'Plateforme OSINT professionnelle fondée en 2026.<br>Croisez des millions de données en quelques secondes.<br>Usage légal et éthique uniquement.',
    footerNav:'Navigation',
    footerServices:'Services',
    footerCommunity:'Communauté',
    footerCommunityDesc:'Support, annonces et codes promo sur notre serveur Discord 7j/7.',
    footerBottom:'© 2026 Bazaar Services — Boubou & ZIamana. All rights reserved.',
    footerLegal:'Usage légal uniquement — Données publiques uniquement',
    footerMentions:'Mentions légales',
    // modals
    creditsModalTitle:'💰 Crédits',
    creditsRemainingLabel:'Crédits restants',
    creditsDesc:'Les crédits se rechargent automatiquement <strong style="color:var(--white)">toutes les 48h</strong>. Pour obtenir plus de crédits ou un rechargement instantané, passez à un plan supérieur.',
    creditsCta:'🚀 Voir les abonnements',
    myReviewsTitle:'📝 Mes avis',
    cancel:'Annuler', save:'Sauvegarder', loading:'Chargement…', uploading:'Chargement…',
    vipRequired:'🔒 Accès Premium — abonnement VIP requis. Va dans Abonnements.',
    confirmDeleteReview:'Supprimer cet avis ?',
    reviewDeleted:'✓ Avis supprimé.', reviewUpdated:'✓ Avis mis à jour.',
    loginToSeeReviews:'Connectez-vous pour voir vos avis.', loadError:'Erreur de chargement.',
    avatarTooBig:'Image trop grande (max 2MB).', avatarUpdated:'✓ Photo mise à jour !',
    enterPassword:'Entrez votre mot de passe.', deletingAccount:'Suppression en cours…',
    accountDeleted:'✓ Compte supprimé.',
    deleteAccountTitle:'🗑️ Supprimer mon compte',
    deleteAccountWarning:'Cette action est irréversible. Tous vos avis et données seront supprimés définitivement.',
    currentPassword:'Mot de passe actuel',
    deleteAccountBtn:'Supprimer définitivement mon compte',
    avatarProfileNote:'Photo de profil visible sur les avis.',
    chooseImage:'Choisir une image',
    creditResetTimer:'Réinitialisation dans :',
    offerExpired:'EXPIRÉ', offerCountdown:'%dj %hh %mm %ss',
    triangle:'Triangle', square:'Carré',
    howToOrder:'Comment commander',
    orderStep1:'Clique sur "Commander" ci-dessous pour générer ton code de commande',
    orderStep2:'Ouvre un ticket et indique le produit souhaité',
    orderStep3:'Effectue le paiement et reçois ta livraison',
    productDetails:'Détails du produit', toolDetails:'Outil — Détails',
    orderOnDiscord:'Commander sur Discord', joinDiscordServer:'Rejoindre le serveur Discord',
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
    unlimitedSearches:'Unlimited', searchesPerDay:'searches / 48h', bestValue:'BEST VALUE',
    currentPlan:'Current plan', subscribeBtn:'Subscribe', buyBtn:'Buy this plan', openTicketToActivate:'Open a Discord ticket to activate',
    // order page
    orderTitle:'Finalize your order', orderSub:'Complete your subscription easily.',
    orderSubShop:'Complete your purchase easily.',
    promoCodeTitle:'Promo code', applyBtn:'Apply',
    payWithTitle:'Pay with',
    orderSummaryTitle:'Order Summary', orderDiscount:'Discount', orderTotal:'Total',
    orderItemCount:'Items', orderSubtotal:'Subtotal', orderSavings:'Total savings',
    orderPayment:'Payment', orderCrypto:'Crypto',
    acceptedCurrencies:'Accepted Currencies',
    yourOrderCode:'Your order code',
    orderCodePageNote:'Copy this code and open a Discord ticket in the <strong>« Shop purchase »</strong> section to finalize.',
    orderPayNote:'Your information is encrypted and secure.',
    orderCodeTitle:'🔑 Your order code', orderCodeDesc:'Use this code in a Discord ticket to finalize your purchase.',
    orderCodeNote:'⚠️ Keep this code private. A staff member will never ask for it in public.',
    tutorialTitle:'How to finalize your order?',
    tutorialStep1:'Click on <strong>« Pay with crypto »</strong> above to generate your order code.',
    tutorialStep2:'Copy this code and open a <strong>Discord ticket</strong> in the <strong>« Shop purchase »</strong> section.',
    tutorialStep3:'Give the order code and your <strong>payment method</strong> to the staff.',
    tutorialStep4:'Payment instructions will be provided by staff within <strong>24h maximum</strong>.',
    openTicketCta:'Open a Discord ticket',
    backToSubs:'← Back to subscriptions', backToShop:'← Back to shop', backToTools:'← Back to tools',
    // item modal
    detailsTitle:'Details', priceLabel:'Price', freeLabel:'FREE', downloadBtn:'Download',
    orderBtn:'Order', downloadStarted:'⬇ Download started!',
    // profile / stats
    myStats:'My Stats', creditsLabel:'Credits', rankLabel:'Rank', staffRank:'STAFF',
    adminRank:'Admin',
    vipRank:'VIP', memberRank:'Member', searchesLabel:'Searches', loginsLabel:'Logins',
    userLabel:'User',
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
    invalidEmail:'Invalid email.', connecting:'Connecting…', connectingServer:'Connecting to server…', connectedOk:'✓ Connected!',
    enterTarget:'Please enter a target.', loginRequired:'🔑 Login required.',
    loginRequiredSection:'🔑 Login required to access this section.', welcomeMsg:'👋 Welcome, ',
    passwordsMismatch:'Passwords do not match.', changeDone:'✓ Change applied!',
    enterCode:'Enter a code.', codeActivated:'✓ Code activated!',
    forgotPassword:'Forgot password?', verifyEmailTitle:'Verify your email',
    verifyEmailSub:'Enter the 6-digit code sent to', verifCode:'Verification code',
    verifyAndCreate:'Verify and create my account', noCodeReceived:'Didn\'t receive a code?',
    resendCode:'Resend', backToForm:'← Back to form',
    forgotTitle:'Forgot password', forgotSub:'Enter your email to receive a reset code.',
    sendResetCode:'Send code', backToLogin:'← Back to login',
    resetTitle:'Reset password', resetPasswordBtn:'Reset password',
    codeSent:'✓ Code sent! Check your email.', passwordTooShort:'Password too short (8 characters minimum).',
    passwordResetOk:'✓ Password reset!',
    noResults:'No results', noResultsDesc:'No data found for this target with available sources.',
    resultLabel:'Result',
    loginToReview:'🔑 Log in to leave a review.', reviewTooShort:'Review too short.',
    sending:'Sending…', reviewSent:'✓ Review sent!', noReviewsYet:'No reviews yet.',
    ltcCopied:'✓ LTC address copied!', captchaWrong:'❌ Missed!', captchaOk:'✓ OK!', captchaRequired:'⚠️ Captcha!',
    serverError:'Server error', serverErrorParse:'Server error (Invalid response).',
    // static footer/captcha
    navTitle:'Navigation', communityTitle:'Community', communityDesc:'Support & news on Discord.',
    captchaPrompt:'Security check: click the triangle', captchaHint:'Please prove you are human',
    passStrength:'Password strength',
    veryWeak:'Very Weak', weak:'Weak', medium:'Medium', good:'Good', strong:'Strong',
    ruleLen:'• At least 8 characters long', ruleUp:'• Contains uppercase letter',
    ruleLow:'• Contains lowercase letter', ruleNum:'• Contains number',
    // auth left panel
    authTagline:'OSINT Intelligence for Professionals',
    authSubText:'Search for information on any target — email, phone, IP, Discord ID — in seconds.',
    authStatSources:'<strong>47 sources</strong>Real-time OSINT',
    authStatSupport:'<strong>24/7 Support</strong>By Boubou & ZIamana',
    authStatPayments:'<strong>Payments</strong>LTC, PayPal, PSC & Crypto',
    authAboutTitle:'About the creators',
    authAboutText:'Founded by a team of cybersecurity enthusiasts, Bazaar is the ultimate solution for your digital investigations. We accept many payment methods to guarantee your anonymity and comfort.',
    // hero / features
    heroFeatureCrypto:'Anonymous Crypto',
    heroFeaturePaypal:'PayPal F&F',
    heroFeatureDiscord:'Discord Support',
    heroFeatureTools:'Free Tools',
    creditsRemaining:'Credits Left',
    searchPlaceholder:'Search automatically…',
    phEmail:'Email address…', phPhone:'Phone number…', phIp:'IP address…', phName:'Full name…', phMachineId:'Machine ID…',
    phDiscordId:'Discord ID (17-19 digits)…', phGithub:'GitHub username…', phTwitter:'Twitter/X handle…',
    phTiktok:'TikTok username…', phReddit:'Reddit username…', phSocial:'Username to search…',
    phUsernameHistory:'Current username…', phDomainIntel:'Domain name…', phXbox:'Xbox gamertag…',
    phRoblox:'Roblox username…', phMinecraft:'Minecraft username…',
    loginRequiredTitle:'Login required to search',
    loginRequiredBtn:'Log in',
    loadingSearch:'Querying OSINT sources…',
    statusOperational:'Service operational', statusDegraded:'Service degraded', statusDown:'Service offline',
    accountCreated:'Created on', linkedEmails:'Linked emails', breachMentions:'Breach mentions', otherInfo:'Other information',
    stolenInfoTitle:'Stolen Information', loadedLabel:'loaded', stealerLogTag:'STEALER LOG',
    addToCart:'Add to cart', cartAdded:'✓ Added to cart', cartAlreadyIn:'Already in cart',
    cartFull:'Cart full (5 items max)', removeFromCartBtn:'Remove from cart', moreInfoBtn:'More information',
    accessCart:'Go to cart',
    shopOffTitle:'Shop temporarily unavailable', shopOffDesc:'The shop is under maintenance. Check back a bit later, or hop on our Discord for more info.',
    osintOffTitle:'Search temporarily unavailable', osintOffDesc:'The search tool is under maintenance. The rest of the site remains accessible as usual.',
    siteStatusShopLabel:'Shop online', siteStatusOsintLabel:'OSINT search online', siteStatusUpdated:'✓ Status updated',
    pageCartTitle:'Cart', pageCartSub:'Find here the items you added from the shop, tools and subscriptions.',
    cartEmpty:'Your cart is empty.', cartEmptyCta:'Discover the shop', cartCheckoutBtn:'Place order',
    cartOrderName:'Cart', removeFromCart:'Remove from cart', backToCart:'← Back to cart',
    quotaExhausted:'⛔ Quota exhausted',
    autoDetectPrefix:'Detected type: ',
    // reviews
    reviewsTitle:'Customer Reviews',
    reviewsSub:'What our users say about Bazaar.',
    leaveReview:'⭐ LEAVE A REVIEW ⭐',
    reviewsBtnAlt:'⭐ Customer Reviews',
    // stats row
    statDiscord:'Discord Server',
    statJoin:'Join ↗',
    statActive:'Active',
    statSources:'OSINT Sources',
    statUptime:'Uptime',
    statPayment:'Payment Methods',
    statBuy:'Buy in Discord ↗',
    // how section
    howTitle:'How it works',
    howSub:'From signup to your first search in under 2 minutes.',
    howStep1Title:'1. Create your account',
    howStep1Desc:'Enter your email, username and password. Instant creation, no verification required.',
    howStep2Title:'2. Log in',
    howStep2Desc:'Use your email and password. Persistent session — auto-login on every visit.',
    howStep3Title:'3. Start a search',
    howStep3Desc:'Enter any target. Auto-detect or manual mode — results in seconds.',
    // community CTA
    communityCtaTitle:'Join our community',
    communityCtaDesc:'Support, announcements, codes and more on our Discord.',
    // announcements
    announceOffer:'🎁 Offer — Free Starter',
    announceOfferDesc:'Invite <strong>10 people</strong> on Discord → get <strong>Starter</strong> plan free',
    announceOfferDesc2:'Invite <strong>10 people</strong> on our Discord and get the <strong>Starter</strong> subscription for free. Offer valid until July 12, 2026.',
    announceOfferDesc3:'Invite 10 people on Discord → Starter free. Expires:',
    announceOfferDesc4:'Invite <strong>10 people</strong> on Discord → get the <strong>Starter</strong> plan free.',
    announceCta:'Join',
    announceExpire:'Expires in:',
    recruitTitle:'📋 Helper Recruitment',
    recruitTitle2:'📋 Recruitment — Discord Helper',
    recruitDesc:'Join the Bazaar team as a <strong>Helper</strong> — open a ticket on Discord.',
    recruitDesc2:'We are recruiting <strong>Helpers</strong> for our Discord server. Open a ticket if you wish to apply.',
    recruitCta:'Ticket',
    betaNotice:'Site in beta — bugs may occur, report them on our <a href="https://discord.gg/ssYFSXRGPP" target="_blank" style="color:rgba(251,191,36,.7);text-decoration:underline">Discord</a>.',
    boostOfferTitle:'🚀 Discord Boost Offer',
    boostCta:'Boost the server',
    // shop page
    pageShopTitle:'Shop',
    pageShopSub:'Premium accounts and services. Payment via Discord.',
    filterDiscord:'Discord',
    filterStreaming:'Streaming',
    filterGames:'Games',
    filterVpn:'VPN',
    filterTransfert:'Transfer',
    filterPremium:'Premium',
    paymentTitle:'Accepted payment methods',
    payFnf:'Friends & Family only',
    payWarn1:'⚠️ USD payments not accepted — EUR only.',
    payWarn2:'⚠️ PayPal F&F required — Goods & Services refused.',
    payCoordTitle:'PayPal:',
    payCoordLtc:'LTC:',
    createTicket:'Open a ticket',
    // tools page
    pageToolsTitle:'Tools',
    pageToolsSub:'OSINT tools & downloadable packs.',
    toolsFreeNotice:'✓ All Standard tools are free and directly downloadable.',
    vsPageSub:'Complete IT website & identity verification.',
    vsDesc:'A complete platform dedicated to IT and online identity verification. Visit the site to discover all the available tools and services.',
    vsBadgeId:'Identity verification', vsBadgeSecure:'Secure', vsBadgeCertified:'Certified', vsOpenBtn:'Open the site',
    standardTools:'Free',
    standardToolsDesc:'Free tools accessible to everyone.',
    premiumTools:'Paid',
    premiumToolsDesc:'Individually priced paid tools — same payment system as the shop.',
    premiumVipNote:'VIP required',
    premiumRequiredCta:'Premium required — go to Plans to see available subscriptions.',
    // subs page
    pageSubsTitle:'Subscriptions',
    pageSubsSub:'Choose the plan that suits you and boost your capabilities.',
    boostOfferDesc:'Boost our Discord server <strong>2 times</strong> and get the <span style="color:var(--accent);font-weight:700">STARTER</span> plan free for life!',
    howSubTitle:'How to subscribe?',
    howSubDesc:'The process is simple and secure:',
    howSubDesc2:'We accept the following payment methods:',
    howSubStep1:'1. Join our <strong>Discord</strong> server.',
    howSubStep2:'2. Open an order <strong>ticket</strong>.',
    howSubStep3:'3. An admin will process your request within 24h.',
    howSubCta:'Open a ticket',
    subPayTitle:'Payment methods',
    subPayWarning:'⚠️ PayPal G&S and non-EUR currencies are refused.',
    // features page
    pageFeaturesTitle:'Features',
    pageFeaturesSub:'Everything Bazaar offers — OSINT, security, flexibility.',
    featResponseTime:'Response time',
    featPaymentsAccepted:'Accepted payments',
    featCard1Title:'OSINT Search',
    featCard2Title:'Auto-detection',
    featCard3Title:'Instant results',
    featCard4Title:'Built-in security',
    featCard5Title:'Flexible plans',
    featCard6Title:'Bilingual FR / EN',
    featCard7Title:'Multi-payment',
    featCard8Title:'Integrated shop',
    featCard1Desc:'Data Leaks, Social & Gaming, Network — email, phone, IP, Discord, GitHub, Roblox, Xbox, Minecraft, WHOIS and more, in Manual or Automated mode.',
    featCard2Desc:'The engine automatically identifies the target type. No manual configuration needed.',
    featCard3Desc:'Aggregated results in under 2 seconds using parallel queries across all sources.',
    featCard4Desc:'Anti-spam delay between searches. HMAC-signed session tokens. No result storage.',
    featCard5Desc:'From 12 searches / 48h on Standard to 64 on Lifetime. Choose according to your needs.',
    featCard6Desc:'Full interface in French and English. Switch instantly in Settings.',
    featCard7Desc:'LTC, PayPal F&F, Paysafecard, and other cryptos. Payments processed via Discord.',
    featCard8Desc:'Discord Nitro, Server Boosts, Currency Exchange — best price, no middleman.',
    featCreditsTable:'Credits per plan',
    featColPlan:'Plan',
    featColCredits:'Credits/48h',
    featColPrice:'Price',
    featFree:'Free',
    featOnce:'once',
    // contact page
    pageContactTitle:'Contact',
    pageContactSub:'Our team responds in under 2 hours.',
    contactDiscordTitle:'Official Discord',
    contactDiscordDesc:'Main channel for support, orders, announcements and exclusive promo codes.',
    contactJoinServer:'Join the server',
    contactResponseTitle:'Response time',
    contactResponseTime:'<strong>&lt; 2h</strong> on average',
    contactSupport:'24/7 Support',
    contactCopy:'Copy',
    contactOrderTitle:'For orders',
    contactOrderDesc:'Open a ticket on Discord. Specify your order, payment method and Bazaar username. Delivery time: 1 to 24 hours.',
    // about page
    pageAboutTitle:'About',
    pageAboutSub:'Bazaar Services — The French-speaking OSINT reference since 2026.',
    aboutMissionTitle:'Our mission',
    aboutMissionDesc:'Bazaar is an OSINT (Open Source Intelligence) platform founded in 2026 by two cybersecurity enthusiasts. Our goal: make public information search accessible, fast and reliable — all in one place.',
    aboutMissionWarning:'⚠️ Bazaar only uses publicly accessible data. Legal and ethical use strictly required.',
    aboutTeamTitle:'The founding team',
    aboutStatsTitle:'By the numbers',
    aboutSources:'OSINT Sources',
    aboutAvailability:'Availability',
    aboutSupport:'Support',
    aboutFounded:'Founded in',
    aboutPaymentTitle:'Accepted payments',
    aboutPayOther:'Paysafecard & Others',
    aboutPayOtherDesc:'Via Discord ticket only',
    aboutLegalLink:'📄 Legal notices · Privacy · Terms',
    // legal page
    pageLegalTitle:'Legal Information',
    pageLegalSub:'Legal notices, privacy policy and terms of use.',
    // settings page
    pageSettingsHeader:'⚙️ Settings',
    pageSettingsSub:'Customize your Bazaar experience.',
    sblockInterface:'🎨 Interface',
    sblockUser:'👤 User',
    sblockStats:'📊 Statistics',
    sblockProject:'ℹ️ Project',
    langFr:'FR',
    langEn:'EN',
    themeDark:'🌙 Dark',
    themeLight:'☀️ Light',
    cursorEnabled:'✓ Enabled',
    cursorDisabled:'✕ Disabled',
    animEnabled:'✓ Enabled',
    animDisabled:'✕ Disabled',
    changeAvatar:'Change picture',
    sblockAvatar:'Profile picture',
    myReviews:'My reviews',
    sblockLogout:'Log out',
    modify:'Edit',
    change:'Change',
    view:'View',
    logout:'Log out',
    deleteAccount:'Delete account',
    delete:'Delete',
    statsCredits:'Credits',
    statsSearches:'Searches',
    statsLogins:'Logins',
    statsPlan:'Plan',
    memberSince:'Member since',
    lastLogin:'Last login',
    role:'Role',
    projectVersion:'Version',
    projectCreators:'Creators',
    projectAvailability:'Availability',
    projectSources:'OSINT Sources',
    projectFounded:'Founded in',
    joinDiscordBtn:'Join Discord',
    // footer
    footerBrandDesc:'Professional OSINT platform founded in 2026.<br>Cross-check millions of data points in seconds.<br>Legal and ethical use only.',
    footerNav:'Navigation',
    footerServices:'Services',
    footerCommunity:'Community',
    footerCommunityDesc:'Support, announcements and promo codes on our Discord server 24/7.',
    footerBottom:'© 2026 Bazaar Services — Boubou & ZIamana. All rights reserved.',
    footerLegal:'Legal use only — Public data only',
    footerMentions:'Legal notices',
    // modals
    creditsModalTitle:'💰 Credits',
    creditsRemainingLabel:'Credits remaining',
    creditsDesc:'Credits are automatically refilled <strong style="color:var(--white)">every 48h</strong>. To get more credits or instant refill, upgrade to a higher plan.',
    creditsCta:'🚀 View subscriptions',
    myReviewsTitle:'📝 My reviews',
    cancel:'Cancel', save:'Save', loading:'Loading…', uploading:'Uploading…',
    vipRequired:'🔒 Premium access — VIP subscription required. Go to Plans.',
    confirmDeleteReview:'Delete this review?',
    reviewDeleted:'✓ Review deleted.', reviewUpdated:'✓ Review updated.',
    loginToSeeReviews:'Log in to see your reviews.', loadError:'Loading error.',
    avatarTooBig:'Image too large (max 2MB).', avatarUpdated:'✓ Picture updated!',
    enterPassword:'Enter your password.', deletingAccount:'Deleting account…',
    accountDeleted:'✓ Account deleted.',
    deleteAccountTitle:'🗑️ Delete my account',
    deleteAccountWarning:'This action is irreversible. All your reviews and data will be permanently deleted.',
    currentPassword:'Current password',
    deleteAccountBtn:'Permanently delete my account',
    avatarProfileNote:'Profile picture visible on reviews.',
    chooseImage:'Choose an image',
    creditResetTimer:'Reset in :',
    offerExpired:'EXPIRED', offerCountdown:'%dd %hh %mm %ss',
    triangle:'Triangle', square:'Square',
    howToOrder:'How to order',
    orderStep1:'Click "Order" below to generate your order code',
    orderStep2:'Open a ticket and specify the desired product',
    orderStep3:'Make the payment and receive your delivery',
    productDetails:'Product details', toolDetails:'Tool — Details',
    orderOnDiscord:'Order on Discord', joinDiscordServer:'Join Discord server',
  }
};

function t(key){ return (I18N[settings.lang] || I18N.fr)[key] || key; }

// ── Shop/tools/plans content translations (js/config.en.js) ────
// Every lookup falls back to the French CONFIG value when no English
// translation exists yet, so an incomplete config.en.js never breaks anything.
function trCat(id, fr){ return (settings.lang==='en' && typeof CONFIG_EN!=='undefined' && CONFIG_EN.categories[id]) || fr; }
function trGroup(id){ return (settings.lang==='en' && typeof CONFIG_EN!=='undefined') ? CONFIG_EN.groups[id] : null; }
function trItem(id){ return (settings.lang==='en' && typeof CONFIG_EN!=='undefined') ? CONFIG_EN.items[id] : null; }
function trPlan(id){ return (settings.lang==='en' && typeof CONFIG_EN!=='undefined') ? CONFIG_EN.plans[id] : null; }
function trTool(id){ return (settings.lang==='en' && typeof CONFIG_EN!=='undefined') ? CONFIG_EN.tools[id] : null; }
function trPeriod(period){
  if(settings.lang!=='en') return period;
  const map = { '/mois':'/month', 'une fois':'once' };
  return map[period] !== undefined ? map[period] : period;
}

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
    if(dict[key]) {
      if(dict[key].includes('<')) el.innerHTML = dict[key];
      else el.textContent = dict[key];
    }
  });
  const activeTab = document.querySelector('.stt-btn.active');
  const searchInput = document.getElementById('search-input');
  if(activeTab && searchInput && activeTab.dataset.i18nPh) searchInput.placeholder = t(activeTab.dataset.i18nPh);
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

function toggleGear(){ gotoPage('settings'); closeDropdown?.(); }

// ── MOBILE NAV ────────────────────────────────────────────────
function toggleMobileNav(){
  const nav = document.getElementById('main-nav'); if(!nav) return;
  const open = nav.classList.toggle('mobile-open');
  document.getElementById('nav-burger')?.setAttribute('aria-expanded', open ? 'true' : 'false');
}
function closeMobileNav(){
  document.getElementById('main-nav')?.classList.remove('mobile-open');
  document.getElementById('nav-burger')?.setAttribute('aria-expanded', 'false');
}
document.addEventListener('click', e => {
  const nav = document.getElementById('main-nav');
  if(nav && nav.classList.contains('mobile-open') && !nav.contains(e.target)) closeMobileNav();
});

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
  function getWords(){
    const l=settings.lang;
    if(l==='en') return ['investigations.','researches.','searches.','verifications.'];
    return ['enquêtes.','investigations.','recherches.','vérifications.'];
  }
  let words=getWords(),wi=0,ci=0,del=false;
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
    try { data = JSON.parse(text); } catch(e) { throw new Error(t('serverErrorParse')); }
    if(!r.ok) throw new Error(data.error || t('serverError'));
    return data;
  } catch(e) { throw e; }
}

// ── ANALYTICS (first-party, no third-party service) ───────────
function getAnalyticsSessionId(){
  let id = localStorage.getItem('bzr_anon_id');
  if(!id){ id = 'a_' + Date.now().toString(36) + Math.random().toString(36).slice(2,10); localStorage.setItem('bzr_anon_id', id); }
  return id;
}
function track(event_type, page){
  try {
    const body = JSON.stringify({ event_type, page: page || '', session_id: getAnalyticsSessionId() });
    if(navigator.sendBeacon){ navigator.sendBeacon('/api/track', new Blob([body], {type:'application/json'})); }
    else fetch('/api/track', { method:'POST', headers:{'Content-Type':'application/json'}, body, keepalive:true }).catch(()=>{});
  } catch(e) {}
}

// ── INIT ──────────────────────────────────────────────────────
// ── Site status (staff on/off switches for shop & search) ──────
let siteStatus = { shop_enabled: true, osint_enabled: true };
async function loadSiteStatus(){
  try{
    const res = await api('site-status', {});
    siteStatus = { shop_enabled: res.shop_enabled !== false, osint_enabled: res.osint_enabled !== false };
  }catch(e){
    siteStatus = { shop_enabled: true, osint_enabled: true };
  }
  applySiteStatus();
}
function applySiteStatus(){
  const shopOff = document.getElementById('shop-disabled-state');
  const shopOn = document.getElementById('shop-active-content');
  if(shopOff && shopOn){
    shopOff.style.display = siteStatus.shop_enabled ? 'none' : 'flex';
    shopOn.style.display = siteStatus.shop_enabled ? '' : 'none';
  }
  const searchOff = document.getElementById('search-off-state');
  const searchOn = document.getElementById('search-active-content');
  if(searchOff && searchOn){
    searchOff.style.display = siteStatus.osint_enabled ? 'none' : 'flex';
    searchOn.style.display = siteStatus.osint_enabled ? '' : 'none';
  }
}

async function initApp() {
  loadSettings();
  loadCart();
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
        const res = await api('account', { action:'get', token: sessionToken });
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
  loadSiteStatus();
  const vsBtn = document.getElementById('vs-open-btn');
  if(vsBtn) vsBtn.href = CONFIG.site.veritySuiteUrl;
  startOfferCountdown();
  loadReviews();
  setSearchTopMode('manual');

  // Scroll reveal
  initScrollReveal();

  // Shop/tools/founders/plans live on hidden pages and pull in ~100+ images —
  // deferred so the visible hero + search bar paint first instead of competing
  // with them for bandwidth on load.
  const renderHiddenPages = () => {
    renderShop(); renderTools(); renderFounders(); renderPlans();
    initCardSpotlight();
  };
  if('requestIdleCallback' in window) requestIdleCallback(renderHiddenPages, { timeout: 1500 });
  else setTimeout(renderHiddenPages, 50);

  track('pageview', 'home');
  checkServiceStatus();
}

async function checkServiceStatus(){
  const badge = document.getElementById('service-status-badge');
  if(!badge) return;
  try{
    const res = await api('search', { action:'status' });
    const s = res.status || {};
    const sources = s.sources || {};
    const overall = (s.status || '').toLowerCase();
    const values = Object.values(sources);
    const anyDown = values.some(v => String(v).toLowerCase() === 'down');
    const anyDegraded = values.some(v => String(v).toLowerCase() !== 'ok');
    let color = 'var(--green)', label = t('statusOperational');
    if(overall === 'down' || anyDown){ color = 'var(--red)'; label = t('statusDown'); }
    else if(overall === 'degraded' || anyDegraded){ color = 'var(--yellow)'; label = t('statusDegraded'); }
    const dot = document.getElementById('ssb-dot');
    const text = document.getElementById('ssb-text');
    if(dot) dot.style.background = color;
    if(text) text.textContent = label + (s.uptime ? ` · ${s.uptime}` : '');
    badge.title = Object.entries(sources).map(([k,v]) => `${k}: ${v}`).join(' · ');
    badge.style.display = 'inline-flex';
  }catch(e){
    badge.style.display = 'none';
  }
}

function initScrollReveal(){
  const els = document.querySelectorAll('.reveal');
  if(!els.length) return;
  if(!settings.anim){ els.forEach(el => el.classList.add('revealed')); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('revealed'); obs.unobserve(e.target); } });
  }, { threshold: 0.12 });
  els.forEach(el => obs.observe(el));
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
      if(guestMsg) guestMsg.style.display='flex';
      ['shop','tools','subs','features','contact','about'].forEach(id => {
        const el = document.getElementById('nav-'+id);
        if(el) {
          el.classList.add('locked-nav');
          el.setAttribute('onclick', "notify(t('loginRequiredSection'), true); switchAuthTab('login'); document.getElementById('auth-screen').classList.remove('hidden'); closeMobileNav()");
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
    const name = currentUser.pseudo || (currentUser.email ? currentUser.email.split('@')[0] : t('userLabel'));
    const nameEl = document.getElementById('user-name-nav');
    if(nameEl) nameEl.textContent = name;
    const navAvatar = document.getElementById('nav-avatar-img');
    if(navAvatar && currentUser.avatar_url) { navAvatar.src = currentUser.avatar_url; navAvatar.style.borderRadius='50%'; }
    const planEl = document.getElementById('nav-plan-text');
    if(planEl) planEl.textContent = (currentUser.plan || 'standard').toUpperCase();
    const planIcon = document.getElementById('nav-plan-icon');
    if(planIcon) {
      const p = (currentUser.plan || 'standard').toLowerCase();
      if(p === 'founder') { planIcon.src = 'logo/couronneperso.png'; planIcon.classList.add('crown-icon'); }
      else { planIcon.classList.remove('crown-icon'); if(p === 'starter' || p === 'pro') planIcon.src = 'logo/trophee.png'; else planIcon.src = 'logo/user.png'; }
    }
    updateSettingsProfile();
    ['shop','tools','subs','features','contact','about'].forEach(id => {
      const el = document.getElementById('nav-'+id);
      if(el) {
        el.classList.remove('locked-nav'); el.setAttribute('onclick', `gotoPage('${id}');closeMobileNav()`);
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

function getLocale(){ return settings.lang === 'en' ? 'en-US' : 'fr-FR'; }

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
  const fmtDate = d => d ? new Date(d).toLocaleDateString(getLocale(), {day:'2-digit',month:'short',year:'numeric'}) : '—';
  const jn = document.getElementById('st-joined'); if(jn) jn.textContent = fmtDate(u.joined_at || u.created_at);
  const ll = document.getElementById('st-last-login'); if(ll) ll.textContent = fmtDate(u.last_login);
  const ro = document.getElementById('st-role'); if(ro) {
    const roleMap = { dev:t('staffRank'), admin:t('adminRank'), vip:t('vipRank'), user:t('memberRank') };
    ro.textContent = roleMap[u.role] || t('memberRank');
    ro.style.color = u.role === 'dev' ? '#ff4d4d' : u.vip_active ? 'var(--accent)' : 'var(--text2)';
  }
  // Staff-only analytics block
  const anBlock = document.getElementById('settings-analytics-block');
  const isStaff = u.role === 'dev' || u.role === 'admin';
  if(anBlock) {
    anBlock.style.display = isStaff ? 'block' : 'none';
    if(isStaff) loadAnalytics();
  }
  // Staff-only site status toggles
  const statusBlock = document.getElementById('settings-status-block');
  if(statusBlock){
    statusBlock.style.display = isStaff ? 'block' : 'none';
    if(isStaff) syncSiteStatusToggleUI();
  }
}

function syncSiteStatusToggleUI(){
  document.getElementById('status-shop-on')?.classList.toggle('active', siteStatus.shop_enabled);
  document.getElementById('status-shop-off')?.classList.toggle('active', !siteStatus.shop_enabled);
  document.getElementById('status-osint-on')?.classList.toggle('active', siteStatus.osint_enabled);
  document.getElementById('status-osint-off')?.classList.toggle('active', !siteStatus.osint_enabled);
}

async function setSiteStatusToggle(field, value){
  if(!currentUser){ notify(t('loginRequired'), true); return; }
  try{
    const res = await api('site-status', { action:'set', token: sessionToken, [field]: value });
    siteStatus = { shop_enabled: res.shop_enabled !== false, osint_enabled: res.osint_enabled !== false };
    syncSiteStatusToggleUI();
    applySiteStatus();
    notify(t('siteStatusUpdated'));
  }catch(e){
    notify(e.message, true);
  }
}

async function loadAnalytics(){
  try {
    const res = await api('analytics-summary', { token: sessionToken });
    const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    set('an-pv-24h', res.pageviews.last24h);
    set('an-pv-7d', res.pageviews.last7d);
    set('an-uniq-7d', res.uniqueVisitors.last7d);
    set('an-search-7d', res.searches.last7d);
    set('an-signups-7d', res.signups7d);
    set('an-logins-7d', res.logins7d);
    const top = document.getElementById('an-top-pages');
    if(top) {
      if(!res.topPages7d.length) top.innerHTML = '<span style="color:var(--text3)">Aucune donnée pour le moment.</span>';
      else top.innerHTML = '<div style="font-size:11px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Pages les plus vues (7j)</div>'
        + res.topPages7d.map(p => `<div style="display:flex;justify-content:space-between"><span>${esc(p.page||'(inconnu)')}</span><span style="font-family:'JetBrains Mono',monospace;color:var(--white)">${p.count}</span></div>`).join('');
    }
  } catch(e) {}
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
  if(!currentUser) { wrap.innerHTML = '<div style="padding:20px 24px;font-size:12px;color:var(--text3)">'+t('loginToSeeReviews')+'</div>'; return; }
  wrap.innerHTML = '<div style="padding:20px 24px;font-size:13px;color:var(--text3)">'+t('loading')+'</div>';
  try {
    const res = await api('reviews', { action:'get', token: sessionToken, user_id: currentUser.id });
    const reviews = res.reviews || [];
    if(!reviews.length) {
      wrap.innerHTML = '<div style="padding:20px 24px;font-size:13px;color:var(--text3)">'+t('noReviewsYet')+'</div>';
      return;
    }
    wrap.innerHTML = reviews.map(r => `
      <div class="my-review-item" id="modal-review-${r.id}" data-stars="${r.stars}">
        <div style="flex:1;min-width:0">
          <div class="my-review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
          <div class="my-review-text" id="modal-review-text-${r.id}">${esc(r.text)}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:4px;font-family:'JetBrains Mono',monospace">${new Date(r.created_at).toLocaleDateString(getLocale())}</div>
        </div>
        <div class="my-review-actions">
          <button class="my-review-btn" onclick="editModalReview('${r.id}')">✏️ ${t('modify')}</button>
          <button class="my-review-btn del" onclick="deleteModalReview('${r.id}')">🗑️</button>
        </div>
      </div>`).join('');
  } catch(e) { wrap.innerHTML = '<div style="padding:12px 20px;font-size:12px;color:var(--red)">'+t('loadError')+'</div>'; }
}

async function deleteModalReview(id) {
  if(!confirm(t('confirmDeleteReview'))) return;
  try {
    await api('reviews', { action:'delete', token: sessionToken, review_id: id });
    document.getElementById(`modal-review-${id}`)?.remove();
    notify(t('reviewDeleted')); loadReviews();
  } catch(e) { notify(e.message, true); }
}

function editModalReview(id) {
  const item = document.getElementById(`modal-review-${id}`); if(!item) return;
  const textEl = document.getElementById(`modal-review-text-${id}`); if(!textEl) return;
  const currentText = textEl.textContent;
  item.innerHTML = `
    <div style="flex:1;display:flex;flex-direction:column;gap:8px">
      <textarea id="modal-edit-ta-${id}" class="inp" style="min-height:70px;font-size:12px;resize:vertical">${esc(currentText)}</textarea>
      <div style="display:flex;gap:6px;justify-content:flex-end">
        <button class="my-review-btn" onclick="loadMyReviewsModal()">${t('cancel')}</button>
        <button class="my-review-btn" style="border-color:var(--accent);color:var(--accent)" onclick="saveModalReview('${id}')">✓ ${t('save')}</button>
      </div>
    </div>`;
}

async function saveModalReview(id) {
  const ta = document.getElementById(`modal-edit-ta-${id}`); if(!ta) return;
  const text = ta.value.trim(); if(text.length < 5) { notify(t('reviewTooShort'), true); return; }
  const stars = parseInt(document.getElementById(`modal-review-${id}`)?.dataset.stars, 10) || 5;
  try {
    await api('reviews', { action:'submit', token: sessionToken, text, stars, review_id: id });
    notify(t('reviewUpdated')); loadMyReviewsModal(); loadReviews();
  } catch(e) { notify(e.message, true); }
}

// ── MY REVIEWS IN SETTINGS ────────────────────
async function loadMyReviews() {
  const wrap = document.getElementById('settings-my-reviews'); if(!wrap) return;
  if(!currentUser) { wrap.innerHTML = '<div style="padding:12px 20px;font-size:12px;color:var(--text3)">'+t('loginToSeeReviews')+'</div>'; return; }
  wrap.innerHTML = '<div style="padding:12px 20px;font-size:12px;color:var(--text3)">'+t('loading')+'</div>';
  try {
    const res = await api('reviews', { action:'get', token: sessionToken, user_id: currentUser.id });
    const reviews = res.reviews || [];
    if(!reviews.length) {
      wrap.innerHTML = '<div style="padding:12px 20px;font-size:12px;color:var(--text3)">'+t('noReviewsYet')+'</div>';
      return;
    }
    wrap.innerHTML = reviews.map(r => `
      <div class="my-review-item" id="my-review-${r.id}" data-stars="${r.stars}">
        <div style="flex:1;min-width:0">
          <div class="my-review-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
          <div class="my-review-text" id="my-review-text-${r.id}">${esc(r.text)}</div>
          <div style="font-size:10px;color:var(--text3);margin-top:4px;font-family:'JetBrains Mono',monospace">${new Date(r.created_at).toLocaleDateString(getLocale())}</div>
        </div>
        <div class="my-review-actions">
          <button class="my-review-btn" onclick="editMyReview('${r.id}')">✏️ ${t('modify')}</button>
          <button class="my-review-btn del" onclick="deleteMyReview('${r.id}')">🗑️</button>
        </div>
      </div>`).join('');
  } catch(e) { wrap.innerHTML = '<div style="padding:12px 20px;font-size:12px;color:var(--red)">'+t('loadError')+'</div>'; }
}

async function deleteMyReview(id) {
  if(!confirm(t('confirmDeleteReview'))) return;
  try {
    await api('reviews', { action:'delete', token: sessionToken, review_id: id });
    document.getElementById(`my-review-${id}`)?.remove();
    notify(t('reviewDeleted'));
    loadReviews();
  } catch(e) { notify(e.message, true); }
}

function editMyReview(id) {
  const item = document.getElementById(`my-review-${id}`); if(!item) return;
  const textEl = document.getElementById(`my-review-text-${id}`); if(!textEl) return;
  const currentText = textEl.textContent;
  item.innerHTML = `
    <div style="flex:1;display:flex;flex-direction:column;gap:8px">
      <textarea id="edit-review-ta-${id}" class="inp" style="min-height:70px;font-size:12px;resize:vertical">${esc(currentText)}</textarea>
      <div style="display:flex;gap:6px;justify-content:flex-end">
        <button class="my-review-btn" onclick="loadMyReviews()">${t('cancel')}</button>
        <button class="my-review-btn" style="border-color:var(--accent);color:var(--accent)" onclick="saveMyReview('${id}')">✓ ${t('save')}</button>
      </div>
    </div>`;
}

async function saveMyReview(id) {
  const ta = document.getElementById(`edit-review-ta-${id}`); if(!ta) return;
  const text = ta.value.trim(); if(text.length < 5) { notify(t('reviewTooShort'), true); return; }
  const stars = parseInt(document.getElementById(`my-review-${id}`)?.dataset.stars, 10) || 5;
  try {
    await api('reviews', { action:'submit', token: sessionToken, text, stars, review_id: id });
    notify(t('reviewUpdated')); loadMyReviews(); loadReviews();
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
function togglePwVisibility(id, btn){
  const inp = document.getElementById(id); if(!inp) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.textContent = show ? '🙈' : '👁';
}
async function doLogin(){
  const email=document.getElementById('login-email').value.trim(), pass=document.getElementById('login-password').value;
  if(!email.includes('@')){ notify(t('invalidEmail'),true); return; }
  setAuthNote('login-note',t('connecting'),'inf');
  try{
    const res=await api('auth',{action:'login',email,password:pass});
    saveSession(res.user, res.token); setAuthNote('login-note',t('connectedOk'),'ok'); track('login'); setTimeout(() => { bootApp(); }, 400);
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
    el.setAttribute('aria-label', type === 'triangle' ? t('triangle') : t('square'));
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

let _signupPending = null;
async function doSignup(){
  const pseudo=document.getElementById('signup-pseudo').value.trim(), email=document.getElementById('signup-email').value.trim(), pass=document.getElementById('signup-password').value, confirm=document.getElementById('signup-confirm').value;
  if(pass !== confirm) return setAuthNote('signup-note', t('passwordsMismatch'), 'err');
  setAuthNote('signup-note', t('connectingServer'), 'inf');
  try{
    await api('otp', { email, purpose: 'signup' });
    _signupPending = { email, pseudo, password: pass };
    document.getElementById('signup-step1').style.display = 'none';
    document.getElementById('signup-step2').style.display = 'block';
    document.getElementById('signup-step2-email').textContent = email;
    setAuthNote('signup-note', '', '');
    setAuthNote('signup-otp-note', t('codeSent'), 'ok');
  }catch(e){ setAuthNote('signup-note',e.message,'err'); }
}

async function verifySignupCode(){
  if(!_signupPending) return backToSignupStep1();
  const code = document.getElementById('signup-otp-code').value.trim();
  if(!code) { setAuthNote('signup-otp-note', t('enterCode'), 'err'); return; }
  setAuthNote('signup-otp-note', t('connecting'), 'inf');
  try{
    const res=await api('auth',{action:'signup', email:_signupPending.email, pseudo:_signupPending.pseudo, password:_signupPending.password, code});
    saveSession(res.user, res.token);
    track('signup');
    if(signupAvatarBase64 && res.token){
      try { await api('upload-avatar',{token:res.token,imageBase64:signupAvatarBase64,mimeType:signupAvatarMime}); } catch(e){}
      signupAvatarBase64=null; signupAvatarMime=null;
    }
    _signupPending = null;
    setTimeout(bootApp,400);
  }catch(e){ setAuthNote('signup-otp-note',e.message,'err'); }
}

async function resendSignupCode(){
  if(!_signupPending) return;
  setAuthNote('signup-otp-note', t('connecting'), 'inf');
  try{ await api('otp', { email: _signupPending.email, purpose: 'signup' }); setAuthNote('signup-otp-note', t('codeSent'), 'ok'); }
  catch(e){ setAuthNote('signup-otp-note', e.message, 'err'); }
}

function backToSignupStep1(){
  document.getElementById('signup-step2').style.display = 'none';
  document.getElementById('signup-step1').style.display = 'block';
  _signupPending = null;
}

// ── FORGOT PASSWORD ────────────────────────────────────────────
let _resetEmail = '';
function showForgotPassword(){
  document.querySelector('#auth-signup')?.classList.remove('active');
  document.getElementById('auth-login')?.classList.remove('active');
  const tabs = document.querySelector('.auth-tabs'); if(tabs) tabs.style.display = 'none';
  document.getElementById('auth-forgot')?.classList.add('active');
  document.getElementById('forgot-step1').style.display = 'block';
  document.getElementById('forgot-step2').style.display = 'none';
  const loginEmail = document.getElementById('login-email')?.value || '';
  document.getElementById('forgot-email').value = loginEmail;
}
function backToLoginFromForgot(){
  document.getElementById('auth-forgot')?.classList.remove('active');
  const tabs = document.querySelector('.auth-tabs'); if(tabs) tabs.style.display = 'flex';
  switchAuthTab('login');
}
async function sendResetCode(){
  const email = document.getElementById('forgot-email').value.trim();
  if(!email.includes('@')) { setAuthNote('forgot-note', t('invalidEmail'), 'err'); return; }
  _resetEmail = email;
  setAuthNote('forgot-note', t('connecting'), 'inf');
  try {
    await api('otp', { email, purpose: 'reset' });
    document.getElementById('forgot-step1').style.display = 'none';
    document.getElementById('forgot-step2').style.display = 'block';
    document.getElementById('forgot-step2-email').textContent = email;
    setAuthNote('reset-otp-note', t('codeSent'), 'ok');
  } catch(e) { setAuthNote('forgot-note', e.message, 'err'); }
}
async function verifyResetCode(){
  const code = document.getElementById('reset-otp-code').value.trim();
  const new_password = document.getElementById('reset-new-password').value;
  if(!code) { setAuthNote('reset-otp-note', t('enterCode'), 'err'); return; }
  if(new_password.length < 8) { setAuthNote('reset-otp-note', t('passwordTooShort'), 'err'); return; }
  setAuthNote('reset-otp-note', t('connecting'), 'inf');
  try {
    await api('auth', { action:'reset', email: _resetEmail, code, new_password });
    setAuthNote('reset-otp-note', t('passwordResetOk'), 'ok');
    setTimeout(() => { backToLoginFromForgot(); notify(t('passwordResetOk')); }, 1200);
  } catch(e) { setAuthNote('reset-otp-note', e.message, 'err'); }
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
      <div class="profile-stat-item"><span class="stat-val">${getCreditsLeft()} / ${u.credits_max||5}</span><span class="stat-lbl">${t('statsCredits')}</span></div>
      <div class="profile-stat-item"><span class="stat-val">${u.total_searches||0}</span><span class="stat-lbl">${t('statsSearches')}</span></div>
      <div class="profile-stat-item"><span class="stat-val">${u.login_count||1}</span><span class="stat-lbl">${t('statsLogins')}</span></div>
      <div class="profile-stat-item"><span class="stat-val">${new Date(u.joined_at||u.created_at).toLocaleDateString(getLocale())}</span><span class="stat-lbl">${t('memberSince')}</span></div>
    </div>
    <div class="profile-plan-badge">
      <span style="font-size:13px;color:var(--text2)">${t('currentPlan')}</span>
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
    <input class="inp" id="new-pseudo" placeholder="${t('pseudo')}">
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
    <input class="inp" type="email" id="new-email" placeholder="email@domain.com">
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
  const body = { action:'update', token: sessionToken };
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
    const res = await api('account', body);
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
    <h3 style="color:var(--red,#f87171);margin-bottom:8px">🗑️ ${t('deleteAccountTitle')}</h3>
    <p style="font-size:13px;color:var(--text2);margin-bottom:18px">${t('deleteAccountWarning')}</p>
    <label class="lbl">${t('currentPassword')}</label>
    <input class="inp" type="password" id="del-password" placeholder="••••••••" style="margin-bottom:14px">
    <button class="btn" style="width:100%;background:rgba(248,113,113,.15);border-color:rgba(248,113,113,.4);color:var(--red,#f87171);font-weight:700" onclick="confirmDeleteAccount()">${t('deleteAccountBtn')}</button>
    <p class="modal-note" id="del-note" style="min-height:16px;margin-top:10px"></p>
  </div>`;
  document.getElementById('profile-modal')?.classList.add('open');
}

async function confirmDeleteAccount(){
  const pw = document.getElementById('del-password')?.value;
  if(!pw) return setNote('del-note', t('enterPassword'), 'err');
  setNote('del-note', t('deletingAccount'), 'inf');
  try {
    await api('account', { action:'delete', token: sessionToken, password: pw });
    notify(t('accountDeleted'));
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
  const pages=['home','shop','tools','subs','features','contact','about','settings','order'];
  const idx=pages.indexOf(name); if(idx>=0 && idx<document.querySelectorAll('.nav-link').length) document.querySelectorAll('.nav-link')[idx]?.classList.add('active');
  if(name==='settings') { applySettings(); updateSettingsProfile(); }
  if(name==='analytics') { loadAnalyticsPageGuard(); }
  if(name==='cart') { renderCartPage(); }
  if(name==='features') { renderFeatCreditsTable(); }
  if(name==='shop' || name==='home') { applySiteStatus(); }
  track('pageview', name);
}

// ── ANALYTICS PAGE (staff only) ────────────────────────────────
let _analyticsState = { range: '7d', pageFilter: null, metric: 'pageviews' };
let _lastSeries = [];
const ANALYTICS_METRIC_LABELS = { pageviews: 'Vues', uniqueVisitors: 'Visiteurs uniques', searches: 'Recherches', signups: 'Inscriptions', logins: 'Connexions' };

function loadAnalyticsPageGuard(){
  if(!currentUser || (currentUser.role !== 'dev' && currentUser.role !== 'admin')){
    notify('🔒 Accès réservé au staff.', true);
    gotoPage('home');
    return;
  }
  loadAnalyticsPage();
}
function setAnalyticsRange(range){
  _analyticsState.range = range;
  _analyticsState.pageFilter = null;
  document.querySelectorAll('.an-range-btn').forEach(b => b.classList.toggle('active', b.dataset.range === range));
  loadAnalyticsPage();
}
function setAnalyticsMetric(metric){
  _analyticsState.metric = metric;
  document.querySelectorAll('.an-metric-btn').forEach(b => b.classList.toggle('active', b.dataset.metric === metric));
  renderAnalyticsChart(_lastSeries);
}
function clearAnalyticsPageFilter(){
  _analyticsState.pageFilter = null;
  loadAnalyticsPage();
}
function toggleAnalyticsPageFilter(page){
  _analyticsState.pageFilter = _analyticsState.pageFilter === page ? null : page;
  loadAnalyticsPage();
}
async function loadAnalyticsPage(){
  try {
    const res = await api('analytics-summary', { token: sessionToken, range: _analyticsState.range, page: _analyticsState.pageFilter || undefined });
    const set = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    set('anp-pageviews', res.totals.pageviews);
    set('anp-uniques', res.totals.uniqueVisitors);
    set('anp-searches', res.totals.searches);
    set('anp-signups', res.totals.signups);
    set('anp-logins', res.totals.logins);
    const filterEl = document.getElementById('an-chart-filter');
    if(_analyticsState.pageFilter){ filterEl.style.display = 'inline-flex'; document.getElementById('an-chart-filter-name').textContent = _analyticsState.pageFilter; }
    else filterEl.style.display = 'none';
    _lastSeries = res.series || [];
    renderAnalyticsChart(_lastSeries);
    renderAnalyticsTopPages(res.topPages, _analyticsState.pageFilter);
  } catch(e) { notify(e.message, true); }
}
function smoothPath(points){
  if(points.length < 2) return points.length ? `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}` : '';
  let d = `M ${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for(let i=0; i<points.length-1; i++){
    const p0 = points[i-1] || points[i], p1 = points[i], p2 = points[i+1], p3 = points[i+2] || p2;
    const cp1x = p1[0] + (p2[0]-p0[0])/6, cp1y = p1[1] + (p2[1]-p0[1])/6;
    const cp2x = p2[0] - (p3[0]-p1[0])/6, cp2y = p2[1] - (p3[1]-p1[1])/6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}
function renderAnalyticsChart(series){
  const svg = document.getElementById('an-chart-svg'); if(!svg) return;
  const metric = _analyticsState.metric;
  const cur = document.getElementById('an-chart-current');
  if(!series || !series.length){
    svg.removeAttribute('viewBox');
    svg.innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="var(--text3)" font-size="12">Aucune donnée pour cette période.</text>';
    if(cur) cur.innerHTML = '';
    return;
  }
  const total = series.reduce((a,s)=>a+(s[metric]||0),0);
  if(cur) cur.innerHTML = `<span class="an-chart-current-val">${total.toLocaleString('fr-FR')}</span><span class="an-chart-current-lbl">${ANALYTICS_METRIC_LABELS[metric]}${_analyticsState.pageFilter ? ' — ' + esc(_analyticsState.pageFilter) : ''}</span>`;

  const W = 900, H = 220, padL = 40, padR = 10, padT = 16, padB = 26;
  const chartW = W - padL - padR, chartH = H - padT - padB;
  const max = Math.max(1, ...series.map(s => s[metric] || 0));
  const stepX = series.length > 1 ? chartW / (series.length - 1) : 0;

  const points = series.map((s,i) => [padL + i*stepX, padT + chartH - ((s[metric]||0)/max)*chartH]);
  const linePath = smoothPath(points);
  const bottom = (padT+chartH).toFixed(1);
  const areaPath = points.length > 1
    ? `${linePath} L ${points[points.length-1][0].toFixed(1)},${bottom} L ${points[0][0].toFixed(1)},${bottom} Z`
    : '';

  let grid = '';
  for(let g=1; g<=3; g++){
    const gy = (padT + chartH - (chartH * g/4)).toFixed(1);
    grid += `<line x1="${padL}" y1="${gy}" x2="${W-padR}" y2="${gy}" stroke="var(--border)" stroke-width="1"/>`;
  }

  const labelStep = Math.max(1, Math.ceil(series.length / 10));
  let labels = '', dots = '';
  series.forEach((s,i) => {
    if(i % labelStep === 0 || i === series.length-1) labels += `<text x="${points[i][0].toFixed(1)}" y="${H-8}" text-anchor="middle" font-size="10" fill="var(--text3)">${esc(s.label)}</text>`;
    dots += `<circle cx="${points[i][0].toFixed(1)}" cy="${points[i][1].toFixed(1)}" r="10" fill="transparent" stroke="none"><title>${esc(s.label)}: ${s[metric]||0}</title></circle>`;
  });

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `
    <defs>
      <linearGradient id="an-area-grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    ${grid}
    <path d="${areaPath}" fill="url(#an-area-grad)" stroke="none"/>
    <path d="${linePath}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}
    ${labels}
    <text x="${padL-6}" y="${padT+6}" text-anchor="end" font-size="10" fill="var(--text3)">${max.toLocaleString('fr-FR')}</text>
  `;
}
function renderAnalyticsTopPages(topPages, activeFilter){
  const wrap = document.getElementById('an-toppages-list'); if(!wrap) return;
  if(!topPages || !topPages.length){ wrap.innerHTML = '<div style="color:var(--text3);font-size:12px;padding:8px 0">Aucune donnée.</div>'; return; }
  const max = Math.max(1, ...topPages.map(p => p.count));
  wrap.innerHTML = topPages.map(p => `
    <div class="an-toppage-row${activeFilter === p.page ? ' active' : ''}" onclick="toggleAnalyticsPageFilter('${esc(p.page).replace(/'/g,"\\'")}')">
      <span class="an-toppage-name">${esc(p.page || '(inconnu)')}</span>
      <div class="an-toppage-bar-wrap"><div class="an-toppage-bar" style="width:${Math.max(4, p.count/max*100)}%"></div></div>
      <span class="an-toppage-count">${p.count}</span>
    </div>`).join('');
}

function openSettings(){ gotoPage('settings'); closeDropdown?.(); }

function getCreditsLeft(){ return currentUser ? Math.max(0, (currentUser.credits_max||5) - (currentUser.credits_used||0)) : 0; }
function updateCreditsUI(){
  const left = getCreditsLeft();
  const max  = currentUser ? (currentUser.credits_max || 5) : 5;
  ['sq-left','credits-above-num'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=left; });
  ['sq-max','credits-above-max'].forEach(id=>{ const el=document.getElementById(id); if(el) el.textContent=max; });
  startResetTimer();
}

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

// ── Manual/Automated search mode + category-grouped type picker ────
const SEARCH_CATEGORIES = [
  { id:'data_leaks', label:'Data Leaks', icon:'logo/database.png', types:[
    { v:'email', icon:'logo/mail.png', label:'Email', ph:'phEmail' },
    { v:'phone', icon:'logo/phone.png', label:'Phone', ph:'phPhone' },
    { v:'ip', icon:'logo/ip.png', label:'IP', ph:'phIp' },
    { v:'name', icon:'logo/id.png', label:'Name', ph:'phName' },
    { v:'machine_id', icon:'logo/fabrication.png', label:'Machine ID', ph:'phMachineId' },
  ]},
  { id:'social_gaming', label:'Social & Gaming', icon:'logo/manette.png', types:[
    { v:'discord_user', icon:'logo/discord.png', label:'Discord', ph:'phDiscordId' },
    { v:'discord_roblox', icon:'logo/roblox.png', label:'D→Roblox', ph:'phDiscordId' },
    { v:'roblox', icon:'logo/roblox.png', label:'Roblox', ph:'phRoblox' },
    { v:'xbox', icon:'logo/trophee.png', label:'Xbox', ph:'phXbox' },
    { v:'minecraft', icon:'logo/fabrication.png', label:'Minecraft', ph:'phMinecraft' },
    { v:'username_history', icon:'logo/id.png', label:'History', ph:'phUsernameHistory' },
    { v:'gh', icon:'logo/github.png', label:'GitHub', ph:'phGithub' },
    { v:'twitter', icon:'logo/twitter.png', label:'Twitter/X', ph:'phTwitter' },
    { v:'tiktok', icon:'logo/tiktok.png', label:'TikTok', ph:'phTiktok' },
    { v:'reddit', icon:'logo/redit.png', label:'Reddit', ph:'phReddit' },
    { v:'social', icon:'logo/link.png', label:'Social', ph:'phSocial' },
  ]},
  { id:'network', label:'Network', icon:'logo/satellite.png', types:[
    { v:'email_check', icon:'logo/mail.png', label:'Email Check', ph:'phEmail' },
    { v:'ip_intel', icon:'logo/ip.png', label:'IP Intel', ph:'phIp' },
    { v:'domain_intel', icon:'logo/server.png', label:'Domain Intel', ph:'phDomainIntel' },
    { v:'whois', icon:'logo/contact.png', label:'WHOIS', ph:'phDomainIntel' },
    { v:'phone_intel', icon:'logo/phone.png', label:'Phone OSINT', ph:'phPhone' },
  ]},
];

let searchTopMode = 'manual';
let manualCategory = 'data_leaks';

function setSearchTopMode(mode){
  searchTopMode = mode;
  document.getElementById('smode-manual')?.classList.toggle('active', mode==='manual');
  document.getElementById('smode-automated')?.classList.toggle('active', mode==='automated');
  const grid = document.getElementById('manual-search-grid');
  if(grid) grid.style.display = mode==='manual' ? '' : 'none';
  const input = document.getElementById('search-input');
  if(mode==='automated'){
    selectedSearchType = 'auto';
    const sel = document.getElementById('search-type');
    if(sel) sel.value = 'auto';
    const iconEl = document.getElementById('std-icon');
    if(iconEl) iconEl.src = 'logo/robot.png';
    if(input){ input.placeholder = t('searchPlaceholder'); if(input.value.trim()) showAutoDetect(input.value.trim()); }
  } else {
    setManualCategory(manualCategory);
  }
}

function setManualCategory(catId){
  manualCategory = catId;
  const cat = SEARCH_CATEGORIES.find(c => c.id === catId) || SEARCH_CATEGORIES[0];
  renderSearchCatTabs();
  renderSearchTypeButtons(cat);
  selectManualType(cat.types[0].v);
}

function renderSearchCatTabs(){
  const wrap = document.getElementById('search-cat-tabs'); if(!wrap) return;
  wrap.innerHTML = SEARCH_CATEGORIES.map(c => `
    <button class="search-cat-btn${c.id===manualCategory?' active':''}" onclick="setManualCategory('${c.id}')">
      <img src="${c.icon}" alt="">${c.label}
    </button>`).join('');
}

function renderSearchTypeButtons(cat){
  const wrap = document.getElementById('search-type-tabs'); if(!wrap) return;
  wrap.innerHTML = cat.types.map(ty => `
    <button class="stt-btn${ty.v===selectedSearchType?' active':''}" data-value="${ty.v}" data-icon="${ty.icon}" data-i18n-ph="${ty.ph}" onclick="selectManualType('${ty.v}')">
      <img src="${ty.icon}" alt="">${ty.label}
    </button>`).join('');
}

function selectManualType(value){
  selectedSearchType = value;
  const cat = SEARCH_CATEGORIES.find(c => c.id === manualCategory);
  if(cat) renderSearchTypeButtons(cat);
  const typeObj = cat?.types.find(ty => ty.v === value);
  const iconEl = document.getElementById('std-icon');
  const input = document.getElementById('search-input');
  if(iconEl && typeObj) iconEl.src = typeObj.icon;
  if(input && typeObj) input.placeholder = t(typeObj.ph);
  const sel = document.getElementById('search-type');
  if(sel) sel.value = value;
  if(value !== 'auto') hideAutoDetect();
  else if(input?.value.trim()) showAutoDetect(input.value.trim());
}

const AUTO_DETECT_TYPES = [
  { id:'email',   label:'Email',          icon:'logo/mail.png',      test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) },
  { id:'username',label:'Discord ID',     icon:'logo/discord.png',   test: v => /^\d{17,19}$/.test(v) },
  { id:'username',label:'Discord Tag',    icon:'logo/discord.png',   test: v => /.+#\d{4}$/.test(v) },
  { id:'phone',   label:'Phone Number',   icon:'logo/telephone.png', test: v => /^\+?[\d\s\-().]{7,}$/.test(v) && (v.match(/\d/g)||[]).length >= 7 },
  { id:'ip',      label:'IP Address',     icon:'logo/ip.png',        test: v => /^(\d{1,3}\.){3}\d{1,3}$/.test(v) && v.split('.').every(n=>+n<=255) },
  { id:'ip',      label:'IPv6 Address',   icon:'logo/ip.png',        test: v => /^[0-9a-fA-F:]{2,}:[0-9a-fA-F:]{2,}$/.test(v) },
  { id:'name',    label:'Full Name',      icon:'logo/id.png',        test: v => /^[a-zA-ZÀ-ÿ'-]+ [a-zA-ZÀ-ÿ'-]+/.test(v) && !/\d/.test(v) },
  { id:'username',label:'Username',       icon:'logo/id.png',        test: v => /^[a-zA-Z0-9._\-]{3,}$/.test(v) },
  { id:'domain',  label:'Domain',         icon:'logo/server.png',    test: v => /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) && !/^https?:\/\//i.test(v) },
  { id:'url',     label:'URL',            icon:'logo/link.png',      test: v => /^https?:\/\/.+/i.test(v) },
  { id:'hash',    label:'Hash',           icon:'logo/cmd.png',       test: v => /^[a-fA-F0-9]{32,}$/.test(v) },
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
    iconEl.innerHTML = `<img src="${det.icon}" alt="" style="width:14px;height:14px;object-fit:contain;vertical-align:-2px">`;
    textEl.textContent = t('autoDetectPrefix') + det.label;
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
  // Start global 48h credit reset timer
  startResetTimer();

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
  const sel = document.getElementById('search-type');
  if(sel) selectedSearchType = sel.value;

  const loading = document.getElementById('search-loading');
  const resultsWrap = document.getElementById('results-wrap');
  const quotaWarn = document.getElementById('quota-warn');
  const fill = document.getElementById('search-fill');
  const loadText = document.getElementById('search-loading-text');
  if(loading) loading.classList.add('show');
  if(resultsWrap) resultsWrap.innerHTML = '';
  if(quotaWarn) quotaWarn.style.display = 'none';
  if(fill) { fill.style.animation = 'none'; fill.offsetHeight; fill.style.animation = 'searchLoad 5s linear forwards'; }
  if(loadText) loadText.textContent = t('loadingSearch');

  try{
    const res=await api('search',{token:sessionToken, query:q, type:selectedSearchType, mode:searchTopMode});
    saveSession(res.user);
    updateCreditsUI();
    track('search');

    if(loading) loading.classList.remove('show');
    if(!resultsWrap) return;

    const data = res.results;
    if(res.category === 'discord_user'){
      resultsWrap.innerHTML = renderDiscordProfileCard(data);
    } else if(res.category){
      resultsWrap.innerHTML = renderSpecialResult(data);
    } else if(!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0)){
      resultsWrap.innerHTML = `<div class="result-item"><h4>${t('noResults')}</h4><p>${t('noResultsDesc')}</p></div>`;
    } else if(Array.isArray(data)){
      resultsWrap.innerHTML = data.map((r, i) => `
        <div class="result-item" style="animation-delay:${i*80}ms">
          <h4>${esc(r.source || t('resultLabel')+' '+(i+1))}</h4>
          <p>${Object.entries(r.data || r).filter(([k]) => k !== 'source').map(([k,v]) => `<strong>${esc(k)}:</strong> ${esc(typeof v === 'string' ? v : JSON.stringify(v))}`).join('<br>')}</p>
          ${r.tag ? `<span class="result-tag">${esc(r.tag)}</span>` : ''}
        </div>
      `).join('');
    } else {
      resultsWrap.innerHTML = Object.entries(data).map(([key, val], i) => `
        <div class="result-item" style="animation-delay:${i*80}ms">
          <h4>${esc(key)}</h4>
          <p>${typeof val === 'string' ? esc(val) : Object.entries(val || {}).map(([k,v]) => `<strong>${esc(k)}:</strong> ${esc(typeof v === 'string' ? v : JSON.stringify(v))}`).join('<br>')}</p>
        </div>
      `).join('');
    }

    const stolenHtml = renderStolenInfoSection(res.stealer_results);
    if(stolenHtml) resultsWrap.innerHTML += stolenHtml;
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
        <img src="${g.icon}" alt=""> ${(trGroup(g.id)?.name) || g.name}
      </button>`).join('');
  }

  const vip = currentUser && (currentUser.vip_active || currentUser.role==='dev');
  const catLocked = cat.premium && !vip;
  const grp = cat.groups.find(g => g.id === currentShopGroup);
  if(!grp){ grid.innerHTML=''; return; }
  const grpTr = trGroup(grp.id);

  grid.innerHTML = grp.items.map(item => {
    const locked = catLocked;
    const itemTr = trItem(item.id);
    return `<div class="item-card${locked?' locked-card':''}" style="--glow:${grp.color||'#7b6ef6'}" onclick="${locked?'notifyVipRequired()':'openItem(\''+item.id+'\',\'shop\')'}">
      <div class="card-img"><img src="${grp.icon}" alt="" loading="lazy">${locked?'<div class="lock-overlay">🔒</div>':''}<div class="card-glow"></div></div>
      <div class="card-body-inner">
        <div class="card-name">${itemTr?.name || item.name}</div>
        <div class="card-cat">${grpTr?.name || grp.name}</div>
        <p class="card-desc-text">${locked?t('lockedDesc'):(itemTr?.desc || item.desc)}</p>
      </div>
      <div class="card-footer-inner">
        <span class="card-price${locked?' premium-price':''}">${locked?'🔒':item.price}</span>
        <div class="card-footer-btns">
          ${(!locked && !isNaN(parseFloat(String(item.price).replace('€','').replace(',','.')))) ? `<button class="cart-add-btn" onclick="event.stopPropagation();addToCart('${item.id}','shop')" title="${t('addToCart')}"><img src="logo/panier.png" alt=""></button>` : ''}
          <button class="btn-sm">${t('viewBtn')}</button>
        </div>
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
    if (diff <= 0) { els.forEach(el => el.textContent = t('offerExpired')); return; }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    const pad = n => String(n).padStart(2, '0');
    els.forEach(el => el.textContent = t('offerCountdown').replace('%d',d).replace('%h',pad(h)).replace('%m',pad(m)).replace('%s',pad(s)));
  }
  update(); setInterval(update, 1000);
}
function renderTools(){
  const grid = document.getElementById('tools-grid'); if(!grid) return;
  const standard=CONFIG.tools.filter(i=>i.category==='Standard');
  const paid=CONFIG.tools.filter(i=>i.category==='Premium');
  const parts=[];
  if(standard.length){
    parts.push(`<div class="tools-cat-header"><span class="tools-cat-badge tools-cat-standard">${t('standardTools')}</span><span class="tools-cat-desc">${t('standardToolsDesc')}</span></div>`);
    parts.push(...standard.map(item=>{ const tr=trTool(item.id); const name=tr?.name||item.name, desc=tr?.desc||item.desc;
      const click = item.id === 't4' ? "gotoPage('veritysuite')" : `openItem('${item.id}','tools')`;
      return `<div class="item-card" onclick="${click}"><div class="card-img">${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="" loading="lazy">`:item.icon}</div><div class="card-body-inner"><div class="card-name">${name}</div><div class="card-cat">${t('standardTools')}</div><p class="card-desc-text">${desc.substring(0,80)}…</p></div><div class="card-footer-inner"><span class="card-free">${t('freeBadge')}</span><button class="btn-sm">${item.id==='t4'?t('vsOpenBtn'):t('viewBtn')}</button></div></div>`; }));
  }
  if(paid.length){
    parts.push(`<div class="tools-cat-header"><span class="tools-cat-badge tools-cat-premium">${t('premiumTools')}</span><span class="tools-cat-desc">${t('premiumToolsDesc')}</span></div>`);
    parts.push(...paid.map(item=>{ const tr=trTool(item.id); const name=tr?.name||item.name, desc=tr?.desc||item.desc;
      return `<div class="item-card premium-card" onclick="openItem('${item.id}','tools')"><div class="card-img">${item.icon.startsWith('logo/')?`<img src="${item.icon}" alt="" loading="lazy">`:item.icon}<span class="premium-crown">👑</span></div><div class="card-body-inner"><div class="card-name">${name}</div><div class="card-cat">${t('premiumTools')}</div><p class="card-desc-text">${desc.substring(0,80)}…</p></div><div class="card-footer-inner"><span class="premium-price">${item.price}</span><div class="card-footer-btns"><button class="cart-add-btn" onclick="event.stopPropagation();addToCart('${item.id}','tool')" title="${t('addToCart')}"><img src="logo/panier.png" alt=""></button><button class="btn-sm">${t('viewBtn')}</button></div></div></div>`; }));
  }
  grid.innerHTML=parts.join('');
}
function renderPlans(){
  const grid=document.getElementById('plans-grid'); if(!grid) return;
  const userPlanToId = { standard:'plan_free', starter:'plan_starter', pro:'plan_pro', lifetime:'plan_lifetime' };
  const userPlanId = currentUser ? (userPlanToId[(currentUser.plan || 'standard').toLowerCase()] || null) : null;
  grid.innerHTML=CONFIG.plans.map((p, idx)=>{
    const isCurrentPlan = userPlanId === p.id;
    const pTr = trPlan(p.id);
    const subtitle = pTr?.subtitle || p.subtitle;
    const priceNum = parseFloat(String(p.price).replace('€','').replace(',','.')) || 0;
    return `
    <div class="plan-card${p.highlight?' plan-highlight':''}" data-color="${p.color}">
      ${p.highlight?`<div class="plan-best"><img src="logo/couronneperso.png" class="plan-best-icon">${t('bestValue')}</div>`:''}
      <div class="plan-name" style="color:${p.color}">${p.name}</div>
      <div class="plan-subtitle">${subtitle}</div>
      <div class="plan-price">${p.price}<span class="plan-period"> ${trPeriod(p.period)}</span></div>
      <div class="plan-searches-badge">⚡ ${p.searches>=999999?t('unlimitedSearches'):p.searches} ${t('searchesPerDay')}</div>
      <hr class="plan-divider">
      <ul class="plan-features">${p.features.map((f,i)=>`<li class="${f.ok?'ok':'no'}"><span class="plan-check">${f.ok?'✓':'✗'}</span><span class="plan-feat-text">${(pTr?.features&&pTr.features[i])||f.text}</span></li>`).join('')}</ul>
      <div class="plan-card-actions">
        ${isCurrentPlan
          ? `<button class="btn-plan-cta" disabled style="opacity:.5;cursor:not-allowed"><img src="logo/user.png" alt="">${t('currentPlan')}</button>`
          : `<div class="plan-cta-row">
              ${priceNum > 0 ? `<button class="cart-add-btn" onclick="addToCart('${p.id}','plan')" title="${t('addToCart')}"><img src="logo/panier.png" alt=""></button>` : ''}
              <button class="btn-plan-cta${p.highlight?' btn-plan-cta-hl':''}" onclick="openPlanDetails('${p.id}')"><img src="logo/oeil.png" alt="">${t('moreInfoBtn')}</button>
             </div>`
        }
        <p class="plan-ticket-note">${t('openTicketToActivate')}</p>
      </div>
    </div>`}).join('');
  initCardSpotlight();
}
function renderFeatCreditsTable(){
  const table = document.getElementById('feat-credits-table');
  if(!table) return;
  // Keep the 3 header cells (Plan/Crédits/Prix), drop any previously rendered rows.
  [...table.querySelectorAll('.feat-credits-row-cell')].forEach(el => el.remove());
  const rowsHtml = CONFIG.plans.map(p => {
    const priceColor = p.price === '0€' ? '#4ade80' : (p.period === 'une fois' ? 'var(--accent)' : 'var(--yellow)');
    const priceText = p.price === '0€' ? t('featFree') : `${p.price}${p.period ? ' '+trPeriod(p.period) : ''}`;
    return `
      <div class="feat-credits-row-cell" style="padding:10px 14px;border-top:1px solid var(--border);font-size:13px;font-weight:600">${p.name}</div>
      <div class="feat-credits-row-cell" style="padding:10px 14px;border-top:1px solid var(--border);font-size:13px;color:var(--text2)">${p.searches>=999999?'∞':p.searches}</div>
      <div class="feat-credits-row-cell" style="padding:10px 14px;border-top:1px solid var(--border);font-size:13px;color:${priceColor};font-weight:700">${priceText}</div>`;
  }).join('');
  table.insertAdjacentHTML('beforeend', rowsHtml);
}
function renderFounders(){
  const c=document.getElementById('founders-grid'); if(!c)return;
  c.innerHTML=CONFIG.founders.map((f, idx)=>`
    <div class="team-card" style="animation:fadeUp .3s ease forwards; animation-delay:${idx*50}ms">
      <img src="${f.img}" class="team-img" alt="${f.name}" loading="lazy">
      <div class="t-name">${f.name}</div><div class="t-role">${f.role}</div>
      <div class="t-links" style="margin-top:10px">
        <a href="https://discord.com/users/" target="_blank" class="t-link"><img src="logo/discord.png" alt="">${f.discord}</a>
        <a href="${f.gunslol}" target="_blank" class="t-link"><img src="logo/gunslol.png" alt="">${f.gunslolLabel}</a>
      </div>
    </div>`).join('');
}

// ── ORDER PAGE ────────────────────────────────────────────────
// ── CART ─────────────────────────────────────────────────────
let cart = [];
function loadCart(){
  try{ cart = JSON.parse(localStorage.getItem('bzr_cart') || '[]'); }catch(e){ cart = []; }
  updateCartBadge();
}
function saveCart(){
  localStorage.setItem('bzr_cart', JSON.stringify(cart));
  updateCartBadge();
}
function updateCartBadge(){
  const badge = document.getElementById('cart-badge');
  if(!badge) return;
  if(cart.length){ badge.textContent = cart.length; badge.style.display = 'flex'; }
  else badge.style.display = 'none';
}
function resolveCartItem(id, type){
  if(type === 'shop') return CONFIG.shop.find(i => i.id === id);
  if(type === 'tool') return CONFIG.tools.find(i => i.id === id);
  if(type === 'plan') return CONFIG.plans.find(i => i.id === id);
  return null;
}
function cartItemTranslation(id, type){
  if(type === 'shop') return trItem(id);
  if(type === 'tool') return trTool(id);
  if(type === 'plan') return trPlan(id);
  return null;
}
const CART_MAX_ITEMS = 5;
function addToCart(id, type){
  if(cart.find(c => c.id === id && c.type === type)){ notify(t('cartAlreadyIn'), true); return; }
  if(cart.length >= CART_MAX_ITEMS){ notify(t('cartFull'), true); return; }
  cart.push({ id, type });
  saveCart();
  notify(t('cartAdded'));
  refreshCartToggleButtons();
}
function removeFromCart(id, type){
  cart = cart.filter(c => !(c.id === id && c.type === type));
  saveCart();
  renderCartPage();
  refreshCartToggleButtons();
}
// Toggle button used in item/plan detail modals — shows "Add to cart" or
// "Remove from cart" depending on current state, re-rendered in place on click
// so the modal doesn't need to close.
function cartToggleButtonHtml(id, type){
  const inCart = cart.some(c => c.id === id && c.type === type);
  const label = inCart ? t('removeFromCartBtn') : t('addToCart');
  const bg = inCart ? 'style="flex:1;justify-content:center;gap:6px;background:linear-gradient(135deg,var(--red),#dc2626)"' : 'style="flex:1;justify-content:center;gap:6px"';
  return `<button class="btn btn-primary cart-toggle-btn" data-cart-id="${esc(id)}" data-cart-type="${esc(type)}" onclick="toggleCartFromModal('${id}','${type}')" ${bg}><img src="logo/panier.png" alt="" style="width:16px;height:16px">${label}</button>`;
}
function toggleCartFromModal(id, type){
  const inCart = cart.some(c => c.id === id && c.type === type);
  if(inCart) removeFromCart(id, type); else addToCart(id, type);
}
function refreshCartToggleButtons(){
  document.querySelectorAll('.cart-toggle-btn').forEach(btn => {
    const id = btn.dataset.cartId, type = btn.dataset.cartType;
    btn.outerHTML = cartToggleButtonHtml(id, type);
  });
}
function renderCartPage(){
  const list = document.getElementById('cart-items-list');
  const empty = document.getElementById('cart-empty-state');
  const summary = document.getElementById('cart-summary-card');
  if(!list) return;
  // Drop any entries whose item no longer exists in CONFIG.
  cart = cart.filter(c => !!resolveCartItem(c.id, c.type));
  saveCart();

  if(!cart.length){
    list.innerHTML = '';
    if(empty) empty.style.display = 'block';
    if(summary) summary.style.display = 'none';
    return;
  }
  if(empty) empty.style.display = 'none';
  if(summary) summary.style.display = 'flex';

  let total = 0;
  const catLabels = { shop: t('shop'), tool: t('premiumTools'), plan: t('subs') };
  list.innerHTML = cart.map(c => {
    const item = resolveCartItem(c.id, c.type);
    const tr = cartItemTranslation(c.id, c.type);
    const name = tr?.name || item.name;
    const priceNum = parseFloat(String(item.price).replace('€','').replace(',','.')) || 0;
    total += priceNum;
    const icon = c.type === 'plan' ? 'logo/etoile.png' : (item.icon || 'logo/panier.png');
    return `<div class="cart-item-row">
      <img src="${icon}" class="cart-item-icon" alt="">
      <div class="cart-item-info"><div class="cart-item-name">${esc(name)}</div><div class="cart-item-cat">${catLabels[c.type] || ''}</div></div>
      <div class="cart-item-price">${item.price}</div>
      <button class="cart-item-remove" onclick="removeFromCart('${c.id}','${c.type}')" title="${t('removeFromCart')}"><img src="logo/corbeille.png" alt=""></button>
    </div>`;
  }).join('');
  const totalEl = document.getElementById('cart-total-price');
  if(totalEl) totalEl.textContent = '€' + total.toFixed(2).replace('.', ',');
}
function openCartOrderPage(){
  if(!cart.length) return;
  if(!currentUser){ switchAuthTab('login'); return; }
  let total = 0;
  cart.forEach(c => {
    const item = resolveCartItem(c.id, c.type);
    if(item) total += parseFloat(String(item.price).replace('€','').replace(',','.')) || 0;
  });
  _orderPlan = {
    id: 'cart', name: `${t('cartOrderName')} (${cart.length})`,
    price: total.toFixed(2).replace('.', ',') + '€', period: '',
    color: '#7b6ef6', searches: null, isShop: true, backPage: 'cart', codeSlug: 'cart'
  };
  _setupOrderPage();
}

let _orderPlan = null;
let _orderCode = null;
let _orderDiscount = 0;

function openOrderPage(planId){
  const plan = CONFIG.plans.find(p => p.id === planId);
  if(!plan) return;
  _orderPlan = {
    id: plan.id, name: plan.name, price: plan.price, period: trPeriod(plan.period),
    color: plan.color, searches: plan.searches, isShop: false,
    codeSlug: plan.id.replace('plan_','')
  };
  _setupOrderPage();
}

function openShopOrderPage(itemId){
  const shopItem = CONFIG.shop.find(i => i.id === itemId);
  const isTool = !shopItem;
  const item = shopItem || CONFIG.tools.find(i => i.id === itemId);
  if(!item) return;
  const priceNum = parseFloat(String(item.price).replace('€','').replace(',','.'));
  if(isNaN(priceNum)){
    // No fixed price (e.g. "Variable"/"Abonnement") — nothing to generate a code for, go straight to Discord.
    window.open(CONFIG.site.discord, '_blank');
    return;
  }
  const grp = isTool ? null : findShopGroup(itemId);
  const itemTr = isTool ? trTool(item.id) : trItem(item.id);
  document.getElementById('item-modal')?.classList.remove('open');
  _orderPlan = {
    id: item.id, name: itemTr?.name || item.name, price: item.price, period: '',
    color: grp?.color || '#7b6ef6', searches: null, isShop: true,
    backPage: isTool ? 'tools' : 'shop',
    codeSlug: item.id.replace(/_/g,'')
  };
  _setupOrderPage();
}

function _setupOrderPage(){
  const o = _orderPlan;
  _orderCode = null;
  _orderDiscount = 0;
  document.getElementById('order-promo-input').value = '';
  document.getElementById('order-promo-msg').textContent = '';
  document.getElementById('order-code-reveal').style.display = 'none';

  const priceNum = parseFloat(String(o.price).replace('€','').replace(',','.')) || 0;
  const isFree = priceNum === 0;

  // Badge
  const badge = document.getElementById('order-plan-badge');
  const meta = o.isShop ? o.price : `${o.searches} ${t('searchesPerDay')} · ${o.price}${o.period}`;
  badge.innerHTML = `<span class="order-plan-name" style="color:${o.color}">${o.name}</span><span class="order-plan-meta">${meta}</span>`;

  // Cart contents list (image/name/info per product) — only for cart checkouts
  const cartList = document.getElementById('order-cart-items-list');
  if(cartList){
    if(o.id === 'cart' && cart.length){
      const catLabels = { shop: t('shop'), tool: t('premiumTools'), plan: t('subs') };
      cartList.innerHTML = cart.map(c => {
        const item = resolveCartItem(c.id, c.type);
        if(!item) return '';
        const tr = cartItemTranslation(c.id, c.type);
        const name = tr?.name || item.name;
        const icon = c.type === 'plan' ? 'logo/etoile.png' : (item.icon || 'logo/panier.png');
        return `<div class="order-cart-item-row">
          <img src="${icon}" class="order-cart-item-icon" alt="">
          <div class="order-cart-item-info"><div class="order-cart-item-name">${esc(name)}</div><div class="order-cart-item-cat">${catLabels[c.type]||''}</div></div>
          <div class="order-cart-item-price">${item.price}</div>
        </div>`;
      }).join('');
      cartList.style.display = 'flex';
    } else {
      cartList.style.display = 'none';
      cartList.innerHTML = '';
    }
  }

  // Subtitle + back button (shop vs plan wording)
  const subEl = document.querySelector('.order-sub');
  if(subEl) subEl.textContent = t(o.isShop ? 'orderSubShop' : 'orderSub');
  const backBtn = document.getElementById('order-back-btn');
  if(backBtn){
    const backPage = o.backPage || (o.isShop ? 'shop' : 'subs');
    const backLabels = { shop:'backToShop', tools:'backToTools', subs:'backToSubs', cart:'backToCart' };
    backBtn.textContent = t(backLabels[backPage] || 'backToSubs');
    backBtn.onclick = () => gotoPage(backPage);
  }

  // Summary
  document.getElementById('order-summary-plan-name').textContent = o.name;
  document.getElementById('order-summary-plan-price').textContent = o.price;
  updateOrderSummary();

  // Pay button
  const paySection = document.getElementById('order-pay-section');
  const captchaWrap = document.getElementById('order-captcha-wrap');
  if(isFree){
    paySection.style.display = 'none';
    if(captchaWrap) captchaWrap.style.display = 'none';
  } else {
    paySection.style.display = 'flex';
    if(captchaWrap) captchaWrap.style.display = 'flex';
    updatePayButtonText();
  }

  gotoPage('order');
  setTimeout(generateOrderCaptcha, 100);
}

function updatePayButtonText(){
  const method = document.querySelector('.pay-option.selected')?.getAttribute('data-value') || 'LTC';
  const plan = _orderPlan;
  if(!plan) return;
  const priceNum = parseFloat(plan.price.replace('€','').replace(',','.')) || 0;
  let displayPrice = priceNum;
  if(_orderDiscount > 0) displayPrice = priceNum - (priceNum * _orderDiscount / 100);
  document.getElementById('order-pay-text').textContent = `Pay €${displayPrice.toFixed(2).replace('.',',')} with ${method}`;

  // Update summary payment method display
  const icons = { BTC:'bitcoin.png', ETH:'etherum.png', LTC:'ltc.png', PayPal:'paypal.png', Paysafecard:'paysafecard.png' };
  const labels = { BTC:'Bitcoin (BTC)', ETH:'Ethereum (ETH)', LTC:'Litecoin (LTC)', PayPal:'PayPal', Paysafecard:'Paysafecard' };
  const display = document.getElementById('order-payment-method-display');
  if(display){
    display.innerHTML = `<img src="logo/${icons[method]||'ltc.png'}" alt="" style="width:16px;height:16px"> <span>${labels[method]||method}</span>`;
  }
}

let _payDropdownOpen = false;

function togglePayDropdown(){
  const dd = document.getElementById('order-pay-dropdown');
  const btn = document.getElementById('order-pay-select-btn');
  _payDropdownOpen = !_payDropdownOpen;
  dd.classList.toggle('open', _payDropdownOpen);
  btn.classList.toggle('open', _payDropdownOpen);
}

function selectPayMethod(value){
  const icons = { BTC:'bitcoin.png', ETH:'etherum.png', LTC:'ltc.png', PayPal:'paypal.png', Paysafecard:'paysafecard.png' };
  const labels = { BTC:'Bitcoin (BTC)', ETH:'Ethereum (ETH)', LTC:'Litecoin (LTC)', PayPal:'PayPal', Paysafecard:'Paysafecard' };

  document.querySelectorAll('.pay-option').forEach(o => o.classList.remove('selected'));
  document.querySelector(`.pay-option[data-value="${value}"]`)?.classList.add('selected');
  document.getElementById('pay-select-icon').src = `logo/${icons[value]||'ltc.png'}`;
  document.getElementById('pay-select-label').textContent = labels[value]||value;

  _payDropdownOpen = false;
  document.getElementById('order-pay-dropdown').classList.remove('open');

  updatePayButtonText();
}

document.addEventListener('click', function(e){
  if(_payDropdownOpen && !e.target.closest('.order-pay-select-wrap')){
    _payDropdownOpen = false;
    document.getElementById('order-pay-dropdown')?.classList.remove('open');
  }
});

let orderCaptchaSolved = false;

function generateOrderCaptcha(){
  const game = document.getElementById('order-captcha-game');
  if(!game) return;
  orderCaptchaSolved = false;
  game.innerHTML = '';
  const shapes = ['square', 'square', 'square', 'triangle'];
  shapes.sort(() => Math.random() - 0.5);
  shapes.forEach(type => {
    const el = document.createElement('div');
    el.className = `captcha-shape ${type}`;
    el.tabIndex = 0;
    el.setAttribute('role','button');
    el.setAttribute('aria-label', type === 'triangle' ? 'triangle' : 'square');
    el.onclick = function(){
      if(type === 'triangle'){
        orderCaptchaSolved = true;
        const st = document.getElementById('order-captcha-status');
        if(st){ st.textContent = '✓'; st.style.color = '#4ade80'; st.style.fontWeight = '700'; }
        game.querySelectorAll('.captcha-shape').forEach(s => { s.style.pointerEvents = 'none'; s.style.opacity = '.4'; });
        this.style.opacity = '1'; this.style.filter = 'drop-shadow(0 0 8px #7b6ef6)';
      } else {
        notify('❌', true);
        generateOrderCaptcha();
      }
    };
    game.appendChild(el);
  });
}

function updateOrderSummary(){
  const plan = _orderPlan;
  if(!plan) return;
  const priceNum = parseFloat(plan.price.replace('€','').replace(',','.')) || 0;
  const discountRow = document.getElementById('order-summary-discount-row');
  const discountEl = document.getElementById('order-summary-discount');
  const totalEl = document.getElementById('order-summary-total');
  const subtotalEl = document.getElementById('order-summary-subtotal');
  const itemsRow = document.getElementById('order-summary-items-row');
  const itemCountEl = document.getElementById('order-summary-item-count');
  const savingsRow = document.getElementById('order-summary-savings-row');
  const savingsEl = document.getElementById('order-summary-savings');

  if(subtotalEl) subtotalEl.textContent = plan.price;

  if(itemsRow && itemCountEl){
    if(plan.id === 'cart' && cart.length){
      itemsRow.style.display = 'flex';
      itemCountEl.textContent = cart.length;
    } else {
      itemsRow.style.display = 'none';
    }
  }

  let discountAmount = 0;
  if(_orderDiscount > 0 && priceNum > 0){
    discountAmount = priceNum * _orderDiscount / 100;
    const totalPrice = priceNum - discountAmount;
    discountRow.style.display = 'flex';
    discountEl.textContent = `-€${discountAmount.toFixed(2)}`;
    totalEl.textContent = `€${totalPrice.toFixed(2).replace('.',',')}`;
  } else {
    discountRow.style.display = 'none';
    totalEl.textContent = plan.price;
  }

  if(savingsRow && savingsEl){
    if(discountAmount > 0){
      savingsRow.style.display = 'flex';
      savingsEl.textContent = `€${discountAmount.toFixed(2)}`;
    } else {
      savingsRow.style.display = 'none';
    }
  }

  updatePayButtonText();
}

async function applyPromoCode(){
  const code = document.getElementById('order-promo-input').value.trim();
  const msg = document.getElementById('order-promo-msg');
  if(!code){
    msg.textContent = 'Veuillez entrer un code promo.';
    msg.style.color = 'var(--red)';
    return;
  }
  if(!currentUser){
    msg.textContent = '❌ Connectez-vous pour utiliser un code promo.';
    msg.style.color = 'var(--red)';
    return;
  }
  try{
    const res = await api('coupon', { token: sessionToken, code });
    if(res.type === 'discount' && res.discount_percent){
      _orderDiscount = res.discount_percent;
      msg.textContent = `✅ Code trouvé -${res.discount_percent}%`;
      msg.style.color = 'var(--green)';
    } else {
      // 'refund'/'vip' codes aren't meant for order discounts — already
      // applied to the account by the call above, but not usable here.
      _orderDiscount = 0;
      msg.textContent = '❌ Ce code n\'est pas une réduction commande.';
      msg.style.color = 'var(--red)';
    }
  }catch(e){
    _orderDiscount = 0;
    msg.textContent = '❌ ' + (e.message || 'Code promo invalide.');
    msg.style.color = 'var(--red)';
  }
  updateOrderSummary();
}

function generateOrderCode(){
  if(!_orderPlan) return '';
  const idPart = Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2,6).toUpperCase();
  const method = document.querySelector('.pay-option.selected')?.getAttribute('data-value') || 'LTC';
  const methodLetter = method[0].toLowerCase();
  const promoInput = document.getElementById('order-promo-input').value.trim();
  const promoPart = promoInput ? promoInput[0].toLowerCase() : 'nocp';
  const contentPart = (_orderPlan.id === 'cart' && cart.length)
    ? cart.map(c => c.id).join('_')
    : (_orderPlan.codeSlug || _orderPlan.id);
  return `${idPart}-${methodLetter}-${promoPart}-${contentPart}`;
}

function showOrderCode(){
  if(!currentUser){
    notify(t('loginRequired'), true);
    return;
  }
  _orderCode = generateOrderCode();

  // Show on page
  const reveal = document.getElementById('order-code-reveal');
  document.getElementById('order-code-page-value').textContent = _orderCode;
  reveal.style.display = 'flex';

  // Show in modal too
  const display = document.getElementById('order-code-value');
  display.textContent = _orderCode;
  display.classList.add('order-code-hidden');
  document.getElementById('order-code-eye-btn').textContent = '👁';
  document.getElementById('order-code-modal').style.display = 'flex';
}

function closeOrderCodeModal(){
  document.getElementById('order-code-modal').style.display = 'none';
  _payDropdownOpen = false;
  document.getElementById('order-pay-dropdown')?.classList.remove('open');
  document.getElementById('order-pay-select-btn')?.classList.remove('open');
}

function toggleOrderCodeVisibility(){
  const display = document.getElementById('order-code-value');
  const btn = document.getElementById('order-code-eye-btn');
  if(display.classList.contains('order-code-hidden')){
    display.classList.remove('order-code-hidden');
    btn.textContent = '👁‍🗨';
  } else {
    display.classList.add('order-code-hidden');
    btn.textContent = '👁';
  }
}

function copyOrderCode(){
  if(!_orderCode) return;
  navigator.clipboard.writeText(_orderCode).then(() => {
    notify('✓ Code copié !', false);
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = _orderCode;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    notify('✓ Code copié !', false);
  });
}

function notifyVipRequired(){notify(t('vipRequired'),true);}

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
  const grpTr = grp ? trGroup(grp.id) : null;
  const itemTr = isShop ? trItem(item.id) : trTool(item.id);
  const catName = isShop ? (trCat(item._catId, item.category)) : item.category;
  const badgesHtml = grp?.badges ? `
    <div class="im-badges">${(grpTr?.badges||grp.badges).map(b=>`<span class="im-badge">${b}</span>`).join('')}</div>` : '';
  const longDescHtml = grp?.longDesc ? `<p class="im-longdesc">${grpTr?.longDesc || grp.longDesc}</p>` : '';
  const warningHtml = grp?.warning ? `
    <div class="im-warning"><img src="logo/construction.png" alt="" style="width:14px;height:14px;opacity:.7"> ${grpTr?.warning || grp.warning}</div>` : '';
  const howHtml = isShop ? `
    <div class="im-how">
      <div class="im-how-title">${t('howToOrder')}</div>
      <div class="im-how-steps">
        <div class="im-how-step"><span class="im-step-n">1</span>${t('orderStep1')}</div>
        <div class="im-how-step"><span class="im-step-n">2</span>${t('orderStep2')}</div>
        <div class="im-how-step"><span class="im-step-n">3</span>${t('orderStep3')}</div>
      </div>
    </div>` : '';

  // Tools with a price (e.g. Database Pack, Discord Private Vocal) use the same
  // order/payment flow as shop items instead of a free direct download.
  const toolPriceNum = (!isShop && item.price) ? parseFloat(String(item.price).replace('€','').replace(',','.')) : NaN;
  const isPaidTool = !isNaN(toolPriceNum);
  const isPaidShop = isShop && !isNaN(parseFloat(String(item.price).replace('€','').replace(',','.')));
  const isPaid = isPaidTool || isPaidShop;

  let ctaHtml;
  if(isPaid){
    ctaHtml = cartToggleButtonHtml(item.id, isShop ? 'shop' : 'tool');
  } else if(!isShop && item.downloadUrl){
    // Too large to host in this repo/deployment — served from an external link instead.
    ctaHtml = `<a href="${item.downloadUrl}" target="_blank" rel="noopener" class="btn btn-primary" style="flex:1;justify-content:center;gap:6px">⬇ ${t('downloadBtn')}</a>`;
  } else if(!isShop && !item.vip){
    ctaHtml = `<a href="/api/coupon?toolId=${encodeURIComponent(item.id)}&token=${encodeURIComponent(sessionToken||'')}" class="btn btn-primary" style="flex:1;justify-content:center;gap:6px">⬇ ${t('downloadBtn')}</a>`;
  } else {
    ctaHtml = `<a href="${CONFIG.site.discord}" target="_blank" class="btn btn-discord" style="flex:1;justify-content:center"><img src="logo/discord.png" alt="">${isShop ? t('orderOnDiscord') : t('joinDiscordServer')}</a>`;
  }

  box.innerHTML = `
    <div class="im-header">
      <h2>${isShop ? t('productDetails') : t('toolDetails')}</h2>
      <button class="modal-close-btn" onclick="closeItemView()">✕</button>
    </div>
    <div class="im-body">
      <div class="im-top">
        <div class="im-icon-wrap">${icon}</div>
        <div class="im-info">
          <div class="im-cat">${catName}</div>
          <h1 class="im-name">${itemTr?.name || item.name}</h1>
          <p class="im-desc">${itemTr?.desc || item.desc}</p>
        </div>
      </div>
      ${badgesHtml}
      ${longDescHtml}
      ${howHtml}
      ${warningHtml}
      <div class="im-cta-row">
        <div class="im-price-block">
          <div class="im-price-lbl">${isPaid ? t('priceLabel') : t('freeLabel')}</div>
          <div class="im-price-val" style="color:${isPaid?'var(--white)':'var(--green)'}">${isPaid ? item.price : 'FREE'}</div>
        </div>
        ${ctaHtml}
      </div>
    </div>`;
  document.getElementById('item-modal').classList.add('open');
}
function closeItemView(){document.getElementById('item-modal').classList.remove('open');}

// Subscription plan detail modal — same item-modal shell as shop/tools, same
// cart-toggle CTA, so the whole site behaves identically no matter what's
// being added to the cart.
function openPlanDetails(planId){
  const plan = CONFIG.plans.find(p => p.id === planId);
  if(!plan) return;
  const pTr = trPlan(plan.id);
  const subtitle = pTr?.subtitle || plan.subtitle;
  const priceNum = parseFloat(String(plan.price).replace('€','').replace(',','.')) || 0;
  const box = document.getElementById('item-modal-content');
  const featuresHtml = plan.features.map((f,i) => `<li class="${f.ok?'ok':'no'}"><span class="plan-check">${f.ok?'✓':'✗'}</span><span class="plan-feat-text">${(pTr?.features&&pTr.features[i])||f.text}</span></li>`).join('');

  box.innerHTML = `
    <div class="im-header">
      <h2>${t('subs')}</h2>
      <button class="modal-close-btn" onclick="closeItemView()">✕</button>
    </div>
    <div class="im-body">
      <div class="im-top">
        <div class="im-info">
          <div class="im-cat" style="color:${plan.color}">${plan.name}</div>
          <h1 class="im-name">${plan.name}</h1>
          <p class="im-desc">${subtitle}</p>
        </div>
      </div>
      <div class="im-badges">
        <span class="im-badge">⚡ ${plan.searches>=999999?t('unlimitedSearches'):plan.searches} ${t('searchesPerDay')}</span>
      </div>
      <ul class="plan-features" style="margin:16px 2px">${featuresHtml}</ul>
      <div class="im-cta-row">
        <div class="im-price-block">
          <div class="im-price-lbl">${t('priceLabel')}</div>
          <div class="im-price-val">${plan.price}${plan.period?' '+trPeriod(plan.period):''}</div>
        </div>
        ${priceNum > 0 ? cartToggleButtonHtml(plan.id, 'plan') : `<button class="btn" disabled style="flex:1;justify-content:center;opacity:.5;cursor:not-allowed">${t('currentPlan')}</button>`}
      </div>
    </div>`;
  document.getElementById('item-modal').classList.add('open');
}

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
  try { await api('reviews', { action:'submit', token: sessionToken, text, stars: reviewStars }); setNote('review-note', t('reviewSent'), 'ok'); setTimeout(() => { closeReviewModal(); loadReviews(); btn.disabled = false; }, 1200); } catch(e) { setNote('review-note', e.message, 'err'); btn.disabled = false; }
}

async function loadReviews() {
  try {
    const res = await api('reviews', { action:'get' }); const m = document.getElementById('reviews-marquee'); if(!m) return;
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
        ? `<div class="rc-avatar-wrap"><img src="${esc(r.avatar_url)}" class="review-avatar" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="review-avatar-placeholder" style="display:none">${initial}</div></div>`
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
        <div class="rc-date">${new Date(r.created_at).toLocaleDateString(getLocale())}</div>
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
        <p style="font-size:13px;color:var(--text2);margin-bottom:12px">${t('avatarProfileNote')}</p>
        <label class="avatar-upload-btn" style="cursor:pointer">
          📸 ${t('chooseImage')}
          <input type="file" accept="image/*" id="avatar-file-input" style="display:none" onchange="handleAvatarFile(event)">
        </label>
      </div>
      <p class="modal-note" id="avatar-note" style="min-height:16px"></p>
    </div>`;
}

async function handleAvatarFile(e) {
  const file = e.target.files[0]; if(!file) return;
  if(file.size > 2 * 1024 * 1024) { setNote('avatar-note', t('avatarTooBig'), 'err'); return; }
  setNote('avatar-note', t('uploading'), 'inf');
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
      setNote('avatar-note', t('avatarUpdated'), 'ok');
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

// ── Generic renderer for specialized single-purpose lookups (Discord ID,
// GitHub, IP intel, WHOIS, etc.) — response shapes differ per endpoint,
// so this just walks whatever fields come back instead of a bespoke
// template per endpoint.
function renderProfileValue(v){
  if(v === null || v === undefined || v === '') return '—';
  if(typeof v === 'boolean') return v ? '✅' : '❌';
  if(Array.isArray(v)) return v.length ? v.map(x => typeof x === 'object' && x !== null ? esc(JSON.stringify(x)) : esc(String(x))).join(', ') : '—';
  if(typeof v === 'object') return Object.entries(v).map(([k,val]) => `<strong>${esc(k)}:</strong> ${renderProfileValue(val)}`).join('<br>');
  return esc(String(v));
}
// Rich Discord profile card. Only shows fields that the API actually returned
// (avatar/banner/badges/nitro/bio/created_at/accent_color are optional extras —
// documented minimum is discord_id/username/linked_emails/breach_mentions) so
// nothing is ever fabricated; anything unexpected still falls through to a
// generic key/value block instead of being silently dropped.
// Collapsible "Stolen Information" section for stealer-log style credential
// leaks — collapsed by default, expands on click. Only ever shown for a
// user's own search, per the site's stated purpose (self-checking exposure).
function renderStolenInfoSection(stealerData){
  const items = stealerData && Array.isArray(stealerData.results) ? stealerData.results : null;
  if(!items || !items.length) return '';
  const cardsHtml = items.map(renderStolenCredentialCard).join('');
  return `<div class="stolen-section">
    <button class="stolen-header" onclick="toggleStolenSection(this)">
      <div class="stolen-header-left">
        <img src="logo/coffre-fort.png" alt="" class="stolen-warn-icon">
        <span class="stolen-title">${t('stolenInfoTitle')}</span>
        <span class="stolen-count-badge">${items.length} ${t('loadedLabel')}</span>
      </div>
      <span class="stolen-chevron">▾</span>
    </button>
    <div class="stolen-body" style="display:none">${cardsHtml}</div>
  </div>`;
}
function toggleStolenSection(btn){
  const body = btn.nextElementSibling;
  const chevron = btn.querySelector('.stolen-chevron');
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  btn.classList.toggle('open', !isOpen);
}
function renderStolenCredentialCard(item){
  const urlHtml = item.url ? `<a href="${esc(item.url)}" target="_blank" rel="noopener" class="stolen-url">${esc(item.url)}</a>` : '';
  const knownOrder = ['email','username','password','machine_id','os','browser','country','subdomain'];
  const known = new Set(['url', ...knownOrder]);
  const fields = knownOrder.filter(k => item[k] !== undefined && item[k] !== null && item[k] !== '')
    .concat(Object.keys(item).filter(k => !known.has(k)));
  const fieldsHtml = fields.map(k => `
    <div class="stolen-field"><span class="stolen-field-lbl">${esc(k.replace(/_/g,' '))}</span><span class="stolen-field-val">${esc(typeof item[k]==='string'?item[k]:JSON.stringify(item[k]))}</span></div>
  `).join('');
  return `<div class="stolen-card">
    <span class="stolen-tag">🔥 ${t('stealerLogTag')}</span>
    ${urlHtml}
    <div class="stolen-fields-grid">${fieldsHtml}</div>
  </div>`;
}
function renderDiscordProfileCard(data){
  if(!data || !data.username) return renderSpecialResult(data);
  const accent = data.accent_color || '#5865F2';
  const avatarHtml = data.avatar_url
    ? `<img src="${esc(data.avatar_url)}" class="dpc-avatar-img" alt="" loading="lazy">`
    : `<div class="dpc-avatar-fallback" style="background:linear-gradient(135deg, ${esc(accent)}, #23272a)">${esc((data.username||'?')[0].toUpperCase())}</div>`;
  const bannerHtml = data.banner_url
    ? `<div class="dpc-banner" style="background-image:url('${esc(data.banner_url)}')"></div>`
    : `<div class="dpc-banner dpc-banner-fallback" style="background:linear-gradient(135deg, ${esc(accent)}, #14151a)"></div>`;
  const badgesHtml = Array.isArray(data.badges) && data.badges.length
    ? `<div class="dpc-badges">${data.badges.map(b=>`<span class="dpc-badge">${esc(typeof b==='string'?b:JSON.stringify(b))}</span>`).join('')}</div>` : '';
  const nitroHtml = (data.nitro || data.premium_type)
    ? `<span class="dpc-badge dpc-badge-nitro">✨ Nitro${typeof data.nitro==='string'?': '+esc(data.nitro):''}</span>` : '';
  const bioHtml = data.bio ? `<p class="dpc-bio">${esc(data.bio)}</p>` : '';
  const createdHtml = data.created_at ? `<div class="dpc-meta-row"><img src="logo/clochnotif.png" alt="">${t('accountCreated')} ${esc(new Date(data.created_at).toLocaleDateString())}</div>` : '';
  const displayNameHtml = (data.display_name && data.display_name !== data.username)
    ? `<div class="dpc-displayname">${esc(data.display_name)}</div>` : '';

  const emails = Array.isArray(data.linked_emails) ? data.linked_emails : [];
  const emailsHtml = emails.length
    ? `<div class="dpc-section"><div class="dpc-section-title"><img src="logo/mail.png" alt="">${t('linkedEmails')}</div><div class="dpc-chips">${emails.map(e=>`<span class="dpc-chip">${esc(e)}</span>`).join('')}</div></div>` : '';

  const breachCount = typeof data.breach_mentions === 'number' ? data.breach_mentions : null;
  const breachHtml = breachCount !== null
    ? `<div class="dpc-stat-box${breachCount>0?' dpc-stat-danger':' dpc-stat-safe'}"><img src="logo/coffre-fort.png" alt=""><div><div class="dpc-stat-num">${breachCount}</div><div class="dpc-stat-lbl">${t('breachMentions')}</div></div></div>` : '';

  const known = new Set(['success','credits_remaining','discord_id','username','display_name','avatar_url','banner_url','accent_color','bio','created_at','badges','nitro','premium_type','linked_emails','breach_mentions']);
  const extra = Object.entries(data).filter(([k]) => !known.has(k));
  const extraHtml = extra.length
    ? `<div class="dpc-section"><div class="dpc-section-title">${t('otherInfo')}</div>${extra.map(([k,v])=>`<p><strong>${esc(k)}:</strong> ${renderProfileValue(v)}</p>`).join('')}</div>` : '';

  return `<div class="dpc-card" style="--dpc-accent:${esc(accent)}">
    ${bannerHtml}
    <div class="dpc-top">
      <div class="dpc-avatar-wrap">${avatarHtml}</div>
      <div class="dpc-id-block">
        <div class="dpc-username">${esc(data.username)}${nitroHtml}</div>
        ${displayNameHtml}
        ${data.discord_id ? `<div class="dpc-discordid">ID: ${esc(data.discord_id)}</div>` : ''}
      </div>
    </div>
    ${badgesHtml}
    ${bioHtml}
    ${createdHtml}
    ${breachHtml ? `<div class="dpc-stats-row">${breachHtml}</div>` : ''}
    ${emailsHtml}
    ${extraHtml}
  </div>`;
}
function renderSpecialResult(data){
  if(!data) return `<div class="result-item"><h4>${t('noResults')}</h4><p>${t('noResultsDesc')}</p></div>`;
  const entries = Object.entries(data).filter(([k]) => k !== 'success' && k !== 'credits_remaining');
  if(!entries.length) return `<div class="result-item"><h4>${t('noResults')}</h4><p>${t('noResultsDesc')}</p></div>`;
  return `<div class="result-item">${entries.map(([k,v]) => `<p><strong>${esc(k)}:</strong> ${renderProfileValue(v)}</p>`).join('')}</div>`;
}
function copyLTC(){navigator.clipboard.writeText(CONFIG.site.ltcAddress).then(()=>notify(t('ltcCopied')));}

document.getElementById('search-btn')?.addEventListener('click', () => doSearch());

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
