// ============================================================
//  BAZAAR — CONFIGURATION GLOBALE
// ============================================================
const CONFIG = {
  site: {
    name: "Bazaar",
    discord: "https://discord.gg/ssYFSXRGPP",
    discordCode: "ssYFSXRGPP",
    ltcAddress: "LgajyZa9NKaUT1oBNRD9qQttHsDEas8oVT",
    paypalEmail: "phoenix.guecko@gmail.com",
  },
  emailjs: {
    serviceId:  "service_bazaar",
    templateId: "template_7kiw3sb",
    publicKey:  "M-eHZGppCNRyWiLMi",
  },
  // Codes secrets — jamais affichés dans l'UI
  _codes: {
    refund: "BAZAAR-REFUNDS",
    vip:    "BAZAAR-VIP2565",
  },
  founders: [
    { name:"Boubou",  role:"Founder",    discord:"france.eu",     gunslol:"https://guns.lol/boubou_",  gunslolLabel:"guns.lol/boubou_"  },
    { name:"flux.3d", role:"Co-Founder", discord:"flux.3d.",      gunslol:"https://guns.lol/flux3d.",  gunslolLabel:"guns.lol/flux3d."  },
    { name:"ZIamana", role:"Co-Founder", discord:"canalisation_", gunslol:"https://guns.lol/ziamana",  gunslolLabel:"guns.lol/ziamana"  },
  ],
  plans: [
    {
      id:"plan_free", name:"Gratuit (basique)", subtitle:"Accès de base à la plateforme",
      price:"0€", period:"/mois", searches:5, color:"#6d2f2f", highlight:false,
      features:[
        {ok:true,  text:"5 recherches / jour"},
        {ok:false, text:"Accès API"},
        {ok:true,  text:"Recherche de base"},
        {ok:true,  text:"Support Discord"},
      ]
    },
    {
      id:"plan_starter", name:"Bronze", subtitle:"Intelligence essentielle pour débutants",
      price:"2.99€", period:"/mois", searches:15, color:"#ffbb00", highlight:false,
      features:[
        {ok:true,  text:"15 recherches / jour"},
        {ok:true,  text:"Rôle discord : Inclus"},
        {ok:true,  text:"0.15€ / recherche"},
        {ok:true,  text:"Accès items Premium ⭐"},
        {ok:true,  text:"Support prioritaire"},
      ]
    },
    {
      id:"plan_pro", name:"Diamant (BEST)", subtitle:"Capacités avancées pour les professionnels",
      price:"7.99€", period:"/mois", searches:30, color:"#39c0ff", highlight:true,
      features:[
        {ok:true,  text:"30 recherches / jour"},
        {ok:true,  text:"Rôle discord : Inclus"},
        {ok:true,  text:"Accès produits/shop Premium ⭐"},
        {ok:true,  text:"Fonctionnalités avancées"},
        {ok:true,  text:"Support VIP Discord"},
        {ok:true,  text:"-25% sur la Boutique"},
      ]
    },
    {
      id:"plan_lifetime", name:"Emeraude (BEST)", subtitle:"Accès illimité à vie",
      price:"19.99€", period:"/LIFETIME", searches:999999, color:"#56ff80", highlight:true,
      features:[
        {ok:true,  text:"Recherches illimitées"},
        {ok:true,  text:"Rôle discord : Inclus"},
        {ok:true,  text:"Coût par recherche : 0€"},
        {ok:true,  text:"Accès produits/shop Premium ⭐"},
        {ok:true,  text:"-50% sur la Boutique"},
        {ok:true,  text:"Support VIP Discord"},
      ]
    },
  ],
  shop: [
    { id:"s1",  name:"Discord Account [FA]",   icon:"logo/discord.png",     category:"Discord",  desc:"Compte Discord Full Access livré avec email associé. Compte vérifié, âge minimum 3 mois. Livraison sous 24h.",              price:"2.50€" },
    { id:"s2",  name:"Discord Nitro Gift",      icon:"logo/discord.png",     category:"Discord",  desc:"Lien cadeau Discord Nitro officiel. 1 mois ou 3 mois selon stock. Envoi immédiat après confirmation.",                    price:"4.00€" },
    { id:"s3",  name:"DC Nitro Boost 1 Month",  icon:"logo/discord.png",     category:"Discord",  desc:"Compte avec 30 jours de nitro boost + 2 boosts inutilisés. Livraison instantanée.",                                      price:"3.00€" },
    { id:"s4",  name:"DC Nitro Boost 3 Months", icon:"logo/discord.png",     category:"Discord",  desc:"Compte avec 80-90 jours de nitro boost + 2 boosts inutilisés. Livraison instantanée.",                                   price:"5.00€" },
    { id:"s5",  name:"Guns.lol Views",          icon:"logo/gunslol.png",     category:"Boost",    desc:"Vues sur Guns.lol. 0.015€/vue. Minimum 100 vues (1.50€). Livraison 24–48h.",                                             price:"1.50€/100 vues" },
    { id:"s6",  name:"Steam Account [FA]",      icon:"logo/steam.png",       category:"Compte",   desc:"Compte Steam FA avec email. Niveau 5 minimum, jeux inclus selon disponibilité.",                                          price:"6.00€" },
    { id:"s7",  name:"Instagram Account [FA]",  icon:"logo/insta.png",       category:"Compte",   desc:"Compte Instagram FA avec email et recovery codes. Âgé 6 mois minimum.",                                                  price:"3.50€" },
    { id:"s8",  name:"Spotify Premium",         icon:"logo/spotify.png",     category:"Compte",   desc:"Compte Spotify Premium individuel. 1 à 3 mois selon dispo. Sans pub, téléchargement illimité.",                          price:"3.00€" },
    { id:"s9",  name:"Twitter/X Account [FA]",  icon:"logo/twitter.png",     category:"Compte",   desc:"Compte Twitter/X FA avec email. Compte âgé, historique de tweets.",                                                      price:"3.00€" },
    { id:"s10", name:"Snapchat Account [FA]",   icon:"logo/snap.png",        category:"Compte",   desc:"Compte Snapchat FA avec email. Compte actif avec streak existant.",                                                       price:"2.00€" },
    { id:"s11", name:"Roblox Account [FA]",     icon:"logo/roblox.png",      category:"Compte",   desc:"Compte Roblox FA avec Robux ou items selon dispo.",                                                                       price:"2.00€" },
    { id:"s12", name:"VPN Premium 1 An",        icon:"logo/ip.png",          category:"Sécurité", desc:"Compte VPN premium (NordVPN/ExpressVPN). 1 an, multi-appareils, 60+ pays.",                                              price:"5.50€" },
    // Premium items — accessibles uniquement avec coupon VIP
    { id:"sp1", name:"Pack OSINT Complet ⭐",   icon:"logo/ip.png",          category:"Premium",  desc:"Accès complet aux outils OSINT avancés. Scripts Python, API keys, bases privées. Mise à jour mensuelle.",               price:"Abonnement requis", premium:true },
    { id:"sp2", name:"Discord Toolkit ⭐",      icon:"logo/discord.png",     category:"Premium",  desc:"Outils avancés Discord. Token checker, mass reporter, user analyzer. Réservé aux abonnés.",                              price:"Abonnement requis", premium:true },
    { id:"sp3", name:"Database Access ⭐",      icon:"logo/github.png",      category:"Premium",  desc:"Accès direct aux bases de données leakées en temps réel. Interface dédiée. +50M d'entrées.",                            price:"Abonnement requis", premium:true },
    { id:"sp4", name:"Phone Deep Lookup ⭐",    icon:"logo/phone.png",       category:"Premium",  desc:"Lookup téléphonique avancé. Historique complet, réseaux sociaux liés, géolocalisation précise.",                        price:"Abonnement requis", premium:true },
    { id:"sp5", name:"Email Intelligence ⭐",   icon:"logo/mail.png",        category:"Premium",  desc:"Analyse email complète. Fuites, domaines liés, comptes associés, historique d'activité.",                               price:"Abonnement requis", premium:true },
    { id:"sp6", name:"IP Tracker Pro ⭐",       icon:"logo/ip.png",          category:"Premium",  desc:"Tracking IP avancé avec historique de connexions, VPN detection, profil comportemental.",                               price:"Abonnement requis", premium:true },
  ],
  tools: [
    { id:"t1", name:"Discord Nitro Generator",   icon:"logo/discord.png", category:"Generator", desc:"Générateur Nitro Discord. Méthode 2026. Inclut proxy rotator, checker et tutoriel.",                     dlContent:"=== BAZAAR — NITRO GENERATOR ===\n\nRepo : https://github.com/example/nitro-gen\n\npip install -r requirements.txt\npython main.py\n\nSupport : discord.gg/ssYFSXRGPP\n© 2026 Bazaar" },
    { id:"t2", name:"Username Checker 47 Sites", icon:"logo/user.png",    category:"OSINT",     desc:"Vérifie un username sur 47 plateformes : GitHub, Reddit, Twitter, TikTok, Twitch, Steam...",            dlContent:"=== BAZAAR — USERNAME CHECKER ===\n\npip install sherlock-project\nsherlock PSEUDO\n\nAlternative : https://whatsmyname.app\n\nSupport : discord.gg/ssYFSXRGPP\n© 2026 Bazaar" },
    { id:"t3", name:"Phone OSINT Toolkit",       icon:"logo/phone.png",   category:"OSINT",     desc:"Suite OSINT numéros de téléphone. Géolocalisation, opérateur, spam score, réseaux liés.",               dlContent:"=== BAZAAR — PHONE OSINT ===\n\nRepo : https://github.com/example/phone-osint\nUsage : python phone_lookup.py +33XXXXXXXXX\n\nSupport : discord.gg/ssYFSXRGPP\n© 2026 Bazaar" },
    { id:"t4", name:"Email Bomber",              icon:"logo/mail.png",    category:"Pentest",   desc:"Stress test email. 50+ providers. Usage légal uniquement (pentest autorisé).",                           dlContent:"=== BAZAAR — EMAIL BOMBER ===\n\nRepo : https://github.com/example/email-bomber\n⚠️ Usage légal uniquement\n\nSupport : discord.gg/ssYFSXRGPP\n© 2026 Bazaar" },
    { id:"t5", name:"IP Info & Geo Pack",        icon:"logo/ip.png",      category:"Network",   desc:"Géolocalisation IP avancée. Reverse DNS, ASN, ISP, VPN detection. API keys 30 jours.",                  dlContent:"=== BAZAAR — IP GEO PACK ===\n\nRepo : https://github.com/example/ip-geo\nUsage : python ip_info.py 8.8.8.8\n\nSupport : discord.gg/ssYFSXRGPP\n© 2026 Bazaar" },
    { id:"t6", name:"Web Scraper OSINT",         icon:"logo/github.png",  category:"Scraping",  desc:"Framework Python OSINT. Contourne CloudFlare, proxies rotatifs. 20+ templates.",                        dlContent:"=== BAZAAR — WEB SCRAPER ===\n\npip install -r requirements.txt\npython scraper.py --target URL\n\nSupport : discord.gg/ssYFSXRGPP\n© 2026 Bazaar" },
    { id:"t7", name:"Crypto Wallet Scanner",     icon:"logo/bitcoin.png", category:"Crypto",    desc:"Scanne wallets BTC/ETH/LTC. Suivi transactions, wallets liés, export CSV.",                             dlContent:"=== BAZAAR — WALLET SCANNER ===\n\npython scanner.py --address ADRESSE --coin btc\n\nSupport : discord.gg/ssYFSXRGPP\n© 2026 Bazaar" },
    { id:"t8", name:"TikTok OSINT Tool",         icon:"logo/tiktok.png",  category:"OSINT",     desc:"Analyse profils TikTok. Historique, likes, follows, métadonnées. Export JSON.",                         dlContent:"=== BAZAAR — TIKTOK OSINT ===\n\npython tiktok_lookup.py --user USERNAME\n\nSupport : discord.gg/ssYFSXRGPP\n© 2026 Bazaar" },
    { id:"t9", name:"Social Engineering Pack",   icon:"logo/jsp2.png",    category:"SE",        desc:"Kit SE professionnel. Templates, scripts, guides psychologie. Certifiés uniquement.",                    dlContent:"=== BAZAAR — SE PACK ===\n\nAccès complet via Discord\ndiscord.gg/ssYFSXRGPP\n⚠️ Usage éthique uniquement\n© 2026 Bazaar" },
    // VIP tools — accessibles uniquement avec coupon BAZAAR-VIP2565
    { id:"tv1", name:"Advanced OSINT Suite ⭐",  icon:"logo/ip.png",      category:"VIP",       desc:"Suite OSINT complète avec modules avancés. Agrégation de 100+ sources, export automatisé, API.",        dlContent:"=== BAZAAR — ADVANCED OSINT ===\n\nAccès réservé aux membres VIP.\nRejoignez le Discord pour y accéder.\ndiscord.gg/ssYFSXRGPP\n© 2026 Bazaar", vip:true },
    { id:"tv2", name:"Leaked DB Search ⭐",      icon:"logo/github.png",  category:"VIP",       desc:"Recherche dans 500M+ entrées de bases leakées. Interface dédiée, recherche par email/user/phone.",      dlContent:"=== BAZAAR — LEAKED DB ===\n\nAccès réservé aux membres VIP.\ndiscord.gg/ssYFSXRGPP\n© 2026 Bazaar", vip:true },
    { id:"tv3", name:"Stealth Recon Pack ⭐",    icon:"logo/user.png",    category:"VIP",       desc:"Pack de reconnaissance discrète. Profiling complet, suivi multi-plateforme, rapport automatique.",      dlContent:"=== BAZAAR — STEALTH RECON ===\n\nAccès réservé aux membres VIP.\ndiscord.gg/ssYFSXRGPP\n© 2026 Bazaar", vip:true },
    { id:"tv4", name:"Social Media Tracker ⭐",  icon:"logo/twitter.png", category:"VIP",       desc:"Suivi multi-réseaux en temps réel. Twitter, Instagram, TikTok, Reddit. Alertes automatiques.",          dlContent:"=== BAZAAR — SOCIAL TRACKER ===\n\nAccès réservé aux membres VIP.\ndiscord.gg/ssYFSXRGPP\n© 2026 Bazaar", vip:true },
    { id:"tv5", name:"Dark Web Monitor ⭐",      icon:"logo/github.png",  category:"VIP",       desc:"Surveillance dark web. Détection de mentions d'emails/usernames sur les forums Tor indexés.",            dlContent:"=== BAZAAR — DARK WEB MONITOR ===\n\nAccès réservé aux membres VIP.\ndiscord.gg/ssYFSXRGPP\n© 2026 Bazaar", vip:true },
  ],
};