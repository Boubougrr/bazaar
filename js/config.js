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
    veritySuiteUrl: "https://veritysuite.pro",
  },
  emailjs: {
    serviceId:  "service_bazaar",
    templateId: "template_8wtc9vk",
    publicKey:  "M-eHZGppCNRyWiLMi",
  },
  founders: [
    { name:"Boubou",  role:"Founder",    discord:"france.eu",    gunslol:"https://guns.lol/ps0",    gunslolLabel:"guns.lol/ps0",    img:"logo/boubou.png" },
    { name:"ZIamana", role:"Co-Founder", discord:"canalisation_",gunslol:"https://guns.lol/ziamana",gunslolLabel:"guns.lol/ziamana",img:"logo/ziamana.jpg" },
  ],
  plans: [
    {
      id:"plan_free", name:"Standard", subtitle:"Accès de base gratuit.",
      price:"0€", period:"", searches:12, color:"#6b7280", highlight:false,
      features:[
        {ok:true,  text:"12 recherches / 48h"},
        {ok:false, text:"Outils payants"},
        {ok:true,  text:"Recherche OSINT de base"},
        {ok:true,  text:"Support Discord"},
      ]
    },
    {
      id:"plan_starter", name:"Starter", subtitle:"Accès plus basique.",
      price:"3.99€", period:"/mois", searches:24, color:"#a0f66e", highlight:false,
      features:[
        {ok:true,  text:"24 recherches / 48h"},
        {ok:true,  text:"Accès outil premium"},
        {ok:true,  text:"Role discord Starter"},
        {ok:true,  text:"Prioritaire aux giveaways"},
      ]
    },
    {
      id:"plan_pro", name:"Pro", subtitle:"Accès pro serieux.",
      price:"7.99€", period:"/mois", searches:48, color:"#7b6ef6", highlight:true,
      features:[
        {ok:true,  text:"48 recherches / 48h"},
        {ok:true,  text:"-10% sur toute la boutique (Nitro...)"},
        {ok:true,  text:"Accès outil premium"},
        {ok:true,  text:"Role discord Pro"},
        {ok:true,  text:"Accès premium complet"},
        {ok:true,  text:"Support prioritaire"},
        {ok:true,  text:"Prioritaire aux giveaways"},
      ]
    },
    {
      id:"plan_lifetime", name:"Lifetime", subtitle:"Accès Premium pour grands services.",
      price:"29.99€", period:"une fois", searches:64, color:"#ff002b", highlight:false,
      features:[
        {ok:true,  text:"64 recherches / 48h"},
        {ok:true,  text:"Outils & Boutique à vie"},
        {ok:true,  text:"-20% sur toute la boutique (Nitro...)"},
        {ok:true,  text:"Vocal personnalisé sur le serveur discord"},
        {ok:true,  text:"Role discord Lifetime"},
        {ok:true,  text:"Accès premium complet"},
        {ok:true,  text:"Support Fondateur"},
        {ok:true,  text:"Prioritaire aux giveaways"},
      ]
    },
  ],
  // Hierarchical shop — major categories, each containing sub-groups with items
  shopCategories: [
    {
      id: "discord", name: "Discord", icon: "logo/discord.png", color: "#5865f2",
      groups: [
        {
          id: "nitro", name: "Nitro", icon: "logo/discord.png", color: "#5865f2",
          badges: ["✅ Account required","⚡ Delivered in minutes","🔒 Secure gift link"],
          longDesc: "Get Discord Nitro at the best price. Our gift links require no password or account sharing — just redeem the code and enjoy.",
          warning: "Produit non remboursable après livraison du lien.",
          items: [
            { id:"nitro_boost_gl",  name:"Nitro Boost — Gift Link",    price:"5.50€",        desc:"Livraison instantanée via Discord." },
            { id:"nitro_basic_gl",  name:"Nitro Basic — Gift Link",    price:"3.70€",        desc:"Nitro Classic via gift link." },
            { id:"nitro_boost_3m",  name:"Nitro Boost 3 Mois (FA)",   price:"4.00 – 5.00€", desc:"Compte full access Nitro Boost 3 mois." },
            { id:"nitro_promo_1m",  name:"Nitro Promo 1 Mois",        price:"2.50€",        desc:"Promotion Nitro 1 mois." },
            { id:"nitro_promo_3m",  name:"Nitro Promo 3 Mois",        price:"4.00€",        desc:"Promotion Nitro 3 mois." },
          ]
        },
        {
          id: "boost", name: "Server Boost", icon: "logo/boost.png", color: "#f472b6",
          badges: ["✅ No password required","⚡ Most orders within minutes","🔒 100% Secure checkout"],
          longDesc: "Boost your Discord server to unlock features like animated icons, better audio quality, custom invite links, and server banners. Bazaar provides affordable Discord boosts with fast delivery and simple ordering.",
          warning: "Produit non remboursable. Boosts actifs pendant la durée choisie.",
          items: [
            { id:"boost_14_1m", name:"x14 Boosts — 1 Mois", price:"6.70€",  desc:"14 server boosts pour 1 mois." },
            { id:"boost_14_3m", name:"x14 Boosts — 3 Mois", price:"10.50€", desc:"14 server boosts pour 3 mois." },
          ]
        },
        {
          id: "aged", name: "Comptes Agés", icon: "logo/discord.png", color: "#fbbf24",
          badges: ["📅 Année certifiée","🔐 Passwords and emails delivered","🔒 Vérification incluse"],
          longDesc: "Comptes Discord authentiques créés à l'année indiquée, parfaits pour les projets nécessitant un compte avec historique. Année de création vérifiée avant livraison.",
          warning: "Produit non remboursable. Ne pas enfreindre les CGU Discord.",
          items: [
            { id:"aged_2015", name:"Compte 2015", price:"51.05€", desc:"Compte Discord créé en 2015." },
            { id:"aged_2016", name:"Compte 2016", price:"8.40€",  desc:"Compte Discord créé en 2016." },
            { id:"aged_2017", name:"Compte 2017", price:"4.55€",  desc:"Compte Discord créé en 2017." },
            { id:"aged_2018", name:"Compte 2018", price:"3.70€",  desc:"Compte Discord créé en 2018." },
            { id:"aged_2019", name:"Compte 2019", price:"3.20€",  desc:"Compte Discord créé en 2019." },
            { id:"aged_2020", name:"Compte 2020", price:"2.80€",  desc:"Compte Discord créé en 2020." },
            { id:"aged_2021", name:"Compte 2021", price:"2.65€",  desc:"Compte Discord créé en 2021." },
            { id:"aged_2022", name:"Compte 2022", price:"2.50€",  desc:"Compte Discord créé en 2022." },
            { id:"aged_2023", name:"Compte 2023", price:"2.45€",  desc:"Compte Discord créé en 2023." },
            { id:"aged_2024", name:"Compte 2024", price:"2.40€",  desc:"Compte Discord créé en 2024." },
            { id:"aged_2025", name:"Compte 2025", price:"2.35€",  desc:"Compte Discord créé en 2025." },
            { id:"aged_2026", name:"Compte 2026", price:"2.30€",  desc:"Compte Discord créé en 2026." },
          ]
        },
        {
          id: "members", name: "Server Members (Online/Offline)", icon: "logo/discordagent.png", color: "#34d399",
          badges: ["📈 Livraison progressive","✅ Méthode sécurisée","🔒 Sans accès au compte"],
          longDesc: "Augmentez la visibilité de votre serveur ou profil social. Livraison progressive pour un résultat naturel. Compatible Discord, Instagram, TikTok, YouTube et plus.",
          warning: "Produit non remboursable. Résultats variables selon la plateforme.",
          items: [
            { id:"members_offline", name:"1k Members Offline",           price:"3.30€",   desc:"Membres hors-ligne pour votre serveur." },
            { id:"members_online",  name:"1k Members Online",            price:"4.30€",   desc:"Membres actifs pour votre serveur." },
            { id:"followers_nw",    name:"Followers/Views Sans Garantie",price:"3.70€/k", desc:"1k follows, vues ou likes sans garantie." },
            { id:"followers_fw",    name:"Followers/Views Garantis",     price:"4.20€/k", desc:"1k follows, vues ou likes garantis." },
          ]
        },
        {
          id: "decorations", name: "Décorations", icon: "logo/deployment.png", color: "#a78bfa",
          badges: ["✅ Via gift link","⚡ Livraison en quelques minutes","🔒 Sans partage de compte"],
          longDesc: "Décorations de profil Discord exclusives livrées par gift link. Aucun partage de compte nécessaire — il suffit de redeem le lien.",
          warning: "Produit non remboursable après livraison du lien.",
          items: [
            { id:"decors_random", name:"Décoration Aléatoire", price:"3.50€", desc:"Via gift link, livraison rapide." },
          ]
        },
      ]
    },
    {
      id: "streaming", name: "Streaming", icon: "logo/boite-a-outils.png", color: "#1db954",
      groups: [
        {
          id: "streaming_netflix", name: "Netflix", icon: "logo/netflix.png", color: "#e50914",
          badges: ["✅ Accès complet","🔒 Compte premium","⚠️ Ne pas changer le mot de passe"],
          longDesc: "Comptes Netflix premium — accès à tout le catalogue films et séries en HD/4K sans abonnement mensuel.",
          warning: "Ne pas changer le mot de passe ni les informations du compte. Non remboursable.",
          items: [
            { id:"netflix_life", name:"Netflix Premium", price:"4.20€", desc:"Compte Netflix premium." },
          ]
        },
        {
          id: "streaming_crunchy", name: "Crunchyroll", icon: "logo/crunchy.png", color: "#ff6400",
          badges: ["✅ Accès complet","🔒 Compte premium","⚠️ Ne pas changer le mot de passe"],
          longDesc: "Crunchyroll Premium — tous les animés en streaming sans publicité et en simulcast.",
          warning: "Ne pas changer le mot de passe ni les informations du compte. Non remboursable.",
          items: [
            { id:"crunchyroll_life", name:"Crunchyroll Premium", price:"4.20€", desc:"Compte Crunchyroll premium." },
          ]
        },
        {
          id: "streaming_youtube", name: "YouTube Premium", icon: "logo/youtube.png", color: "#ff0000",
          badges: ["✅ Accès complet","🔒 Compte premium","⚡ Livraison rapide"],
          longDesc: "YouTube Premium — sans publicité, musique incluse (YouTube Music), téléchargements offline et lecture en arrière-plan.",
          warning: "Ne pas changer le mot de passe ni les informations du compte. Non remboursable.",
          items: [
            { id:"youtube_1m", name:"YouTube Premium — 1 Mois", price:"4.20€", desc:"Accès 1 mois sans pub." },
          ]
        },
        {
          id: "streaming_deezer", name: "Deezer Premium", icon: "logo/soundcloud.png", color: "#a238ff",
          badges: ["✅ Accès complet","🔒 Compte lifetime","⚠️ Ne pas changer le mot de passe"],
          longDesc: "Deezer Premium à vie — musique en qualité HD sans publicité, téléchargement illimité.",
          warning: "Ne pas changer le mot de passe ni les informations du compte. Non remboursable.",
          items: [
            { id:"deezer_life", name:"Deezer Premium Lifetime", price:"4.20€", desc:"Compte Deezer à vie." },
          ]
        },
        {
          id: "streaming_prime", name: "Prime Video", icon: "logo/prime.png", color: "#00a8e0",
          badges: ["✅ Accès complet","🔒 Compte premium","⚠️ Ne pas changer le mot de passe"],
          longDesc: "Amazon Prime Video — tout le catalogue films, séries et productions Amazon Originals.",
          warning: "Ne pas changer le mot de passe ni les informations du compte. Non remboursable.",
          items: [
            { id:"prime_1m", name:"Prime Video — 1 Mois", price:"4.20€", desc:"Accès Prime Video 1 mois." },
          ]
        },
        {
          id: "streaming_nba", name: "NBA League Pass", icon: "logo/trophee.png", color: "#c9243f",
          badges: ["✅ Accès complet","🔒 Compte premium","⚡ Livraison rapide"],
          longDesc: "NBA League Pass Premium — regardez tous les matchs NBA en direct et en replay tout au long de la saison.",
          warning: "Ne pas changer le mot de passe ni les informations du compte. Non remboursable.",
          items: [
            { id:"nba_prem", name:"NBA League Pass Premium", price:"4.20€", desc:"Accès NBA League Pass." },
          ]
        },
        {
          id: "streaming_ufc", name: "UFC Fight Pass", icon: "logo/trophee.png", color: "#cc0000",
          badges: ["✅ Accès complet","🔒 Compte lifetime","⚡ Livraison rapide"],
          longDesc: "UFC Fight Pass à vie — tous les événements UFC en direct et l'archive complète des combats.",
          warning: "Ne pas changer le mot de passe ni les informations du compte. Non remboursable.",
          items: [
            { id:"ufc_life", name:"UFC Fight Pass Lifetime", price:"4.20€", desc:"Compte UFC à vie." },
          ]
        },
        {
          id: "streaming_hbo", name: "HBO Max", icon: "logo/deployment.png", color: "#6c2dc7",
          badges: ["✅ Accès complet","🔒 Compte premium","⚡ Livraison rapide"],
          longDesc: "HBO Max Premium — tout le catalogue HBO, Warner Bros, DC Comics et productions exclusives.",
          warning: "Ne pas changer le mot de passe ni les informations du compte. Non remboursable.",
          items: [
            { id:"hbo_prem", name:"HBO Max Premium", price:"4.20€", desc:"Compte HBO Max premium." },
          ]
        },
        {
          id: "streaming_dazn", name: "DAZN", icon: "logo/trophee.png", color: "#f5e400",
          badges: ["✅ Accès complet","🌍 Pays aléatoire","⚡ Livraison rapide"],
          longDesc: "DAZN — la plateforme sport en streaming : foot, boxe, F1, tennis et bien plus. Pays peut varier.",
          warning: "Ne pas changer le mot de passe. Pays peut varier selon le stock. Non remboursable.",
          items: [
            { id:"dazn_rand", name:"DAZN — Pays Aléatoire", price:"4.20€", desc:"Compte DAZN." },
          ]
        },
        {
          id: "streaming_paramount", name: "Paramount+ EU", icon: "logo/cybersecurite.png", color: "#0050a0",
          badges: ["✅ Accès complet","🔒 Compte lifetime","⚡ Livraison rapide"],
          longDesc: "Paramount+ EU à vie — films et séries Paramount, CBS, Nickelodeon et sports en direct.",
          warning: "Ne pas changer le mot de passe ni les informations du compte. Non remboursable.",
          items: [
            { id:"paramount_life", name:"Paramount+ EU Lifetime", price:"4.20€", desc:"Compte Paramount+ à vie." },
          ]
        },
        {
          id: "streaming_capcut", name: "CapCut Pro", icon: "logo/code.png", color: "#00ccb4",
          badges: ["✅ Accès complet","🔒 Compte premium","⚡ Livraison rapide"],
          longDesc: "CapCut Pro — tous les effets premium, templates exclusifs et export vidéo sans filigrane.",
          warning: "Ne pas changer le mot de passe ni les informations du compte. Non remboursable.",
          items: [
            { id:"capcut_prem", name:"CapCut Pro Premium", price:"4.20€", desc:"Compte CapCut Pro." },
          ]
        },
      ]
    },
    {
      id: "games", name: "Games", icon: "logo/trophee.png", color: "#22c55e",
      groups: [
        {
          id: "roblox", name: "Robux", icon: "logo/roblox.png", color: "#22c55e",
          badges: ["✅ Via Pls Donate","⚡ Livraison rapide","🔒 Compatible tout compte Roblox"],
          longDesc: "Des milliers de Robux instantanément sur votre compte via la méthode Pls Donate. Fournissez votre username Roblox lors de la commande.",
          warning: "Produit non remboursable. Vérifiez votre username avant de commander.",
          items: [
            { id:"robux_1k",   name:"Robux 1.000 – 2.500",   price:"9.50€",  desc:"Livraison via Pls Donate." },
            { id:"robux_2500", name:"Robux 2.500 – 5.000",   price:"14.50€", desc:"Livraison via Pls Donate." },
            { id:"robux_5k",   name:"Robux 5.000 – 10.000",  price:"22.00€", desc:"Livraison via Pls Donate." },
            { id:"robux_10k",  name:"Robux 10.000 – 15.000", price:"33.25€", desc:"Livraison via Pls Donate." },
            { id:"robux_50k",  name:"Robux 50.000+",         price:"77.00€", desc:"Livraison via Pls Donate." },
          ]
        },
        {
          id: "epicgames", name: "Epic Games", icon: "logo/epic.png", color: "#2d2d2d",
          badges: ["✅ Full Access","⚡ Livraison rapide","🎮 Email + Mot de passe inclus"],
          longDesc: "Comptes Epic Games avec des centaines de jeux premium. Full Access — email et mot de passe fournis, accès complet au compte.",
          warning: "Ne pas changer les informations du compte. Produit non remboursable.",
          items: [
            { id:"epic_50",   name:"Epic Games [50-100 Games] FA",   price:"2.75€",  desc:"Compte avec 50 à 100 jeux." },
            { id:"epic_100",  name:"Epic Games [100-200 Games] FA",  price:"4.50€",  desc:"Compte avec 100 à 200 jeux." },
            { id:"epic_200",  name:"Epic Games [200-350 Games] FA",  price:"7.00€",  desc:"Compte avec 200 à 350 jeux." },
            { id:"epic_350",  name:"Epic Games [350+ Games] FA",     price:"14.50€", desc:"Compte avec 350+ jeux." },
          ]
        },
        {
          id: "steam_action", name: "Action & Aventure", icon: "logo/steam.png", color: "#e8650a",
          badges: ["✅ Compte Steam FA","🎮 Jeu inclus","⚡ Livraison rapide"],
          longDesc: "Comptes Steam Full Access avec le jeu correspondant déjà installé. Email et mot de passe fournis. Les comptes peuvent contenir d'autres jeux bonus.",
          warning: "Ne pas changer les informations du compte. Produit non remboursable.",
          items: [
            { id:"steam_gow",       name:"God of War",                  price:"3.00€", desc:"Compte Steam — God of War." },
            { id:"steam_cp2077",    name:"Cyberpunk 2077",              price:"3.00€", desc:"Compte Steam — Cyberpunk 2077." },
            { id:"steam_hogwarts",  name:"Hogwarts Legacy",             price:"3.00€", desc:"Compte Steam — Hogwarts Legacy." },
            { id:"steam_witcher3",  name:"The Witcher 3",               price:"3.00€", desc:"Compte Steam — The Witcher 3." },
            { id:"steam_gta5",      name:"GTA 5",                       price:"3.00€", desc:"Compte Steam — GTA 5." },
            { id:"steam_uncharted", name:"UNCHARTED: Legacy of Thieves",price:"3.00€", desc:"Compte Steam — Uncharted." },
            { id:"steam_jc4",       name:"Just Cause 4",                price:"3.00€", desc:"Compte Steam — Just Cause 4." },
            { id:"steam_re8",       name:"Resident Evil Village",       price:"3.00€", desc:"Compte Steam — RE Village." },
            { id:"steam_hitman",    name:"Hitman",                      price:"3.00€", desc:"Compte Steam — Hitman." },
          ]
        },
        {
          id: "steam_horror", name: "Survie & Horreur", icon: "logo/steam.png", color: "#9b30d9",
          badges: ["✅ Compte Steam FA","🎮 Jeu inclus","⚡ Livraison rapide"],
          longDesc: "Comptes Steam Full Access avec le jeu correspondant déjà installé. Email et mot de passe fournis. Les comptes peuvent contenir d'autres jeux bonus.",
          warning: "Ne pas changer les informations du compte. Produit non remboursable.",
          items: [
            { id:"steam_outlast",   name:"Outlast",               price:"3.00€", desc:"Compte Steam — Outlast." },
            { id:"steam_outlast2",  name:"Outlast 2",             price:"3.00€", desc:"Compte Steam — Outlast 2." },
            { id:"steam_forest",    name:"The Forest",            price:"3.00€", desc:"Compte Steam — The Forest." },
            { id:"steam_sons",      name:"Sons of the Forest",    price:"3.00€", desc:"Compte Steam — Sons of the Forest." },
            { id:"steam_ark",       name:"ARK",                   price:"3.00€", desc:"Compte Steam — ARK." },
            { id:"steam_dbd",       name:"Dead by Daylight",      price:"3.00€", desc:"Compte Steam — Dead by Daylight." },
            { id:"steam_phasmo",    name:"Phasmophobia",          price:"3.00€", desc:"Compte Steam — Phasmophobia." },
            { id:"steam_backrooms", name:"Escape the Backrooms",  price:"3.00€", desc:"Compte Steam — Escape the Backrooms." },
            { id:"steam_raft",      name:"Raft",                  price:"3.00€", desc:"Compte Steam — Raft." },
          ]
        },
        {
          id: "steam_simulation", name: "Simulation & Bac à sable", icon: "logo/steam.png", color: "#00b8c8",
          badges: ["✅ Compte Steam FA","🎮 Jeu inclus","⚡ Livraison rapide"],
          longDesc: "Comptes Steam Full Access avec le jeu correspondant déjà installé. Email et mot de passe fournis. Les comptes peuvent contenir d'autres jeux bonus.",
          warning: "Ne pas changer les informations du compte. Produit non remboursable.",
          items: [
            { id:"steam_fs25",       name:"Farming Simulator 25",    price:"3.00€", desc:"Compte Steam — FS25." },
            { id:"steam_cs1",        name:"Cities: Skylines",        price:"3.00€", desc:"Compte Steam — Cities Skylines." },
            { id:"steam_cs2",        name:"Cities: Skylines 2",      price:"3.00€", desc:"Compte Steam — Cities Skylines 2." },
            { id:"steam_hf2",        name:"House Flipper 2",         price:"3.00€", desc:"Compte Steam — House Flipper 2." },
            { id:"steam_gmod",       name:"Garry's Mod",             price:"3.00€", desc:"Compte Steam — Garry's Mod." },
            { id:"steam_smarket",    name:"Supermarket Simulator",   price:"3.00€", desc:"Compte Steam — Supermarket Simulator." },
            { id:"steam_ets2",       name:"Euro Truck Simulator 2",  price:"3.00€", desc:"Compte Steam — ETS2." },
            { id:"steam_contraband", name:"Contraband Police",       price:"3.00€", desc:"Compte Steam — Contraband Police." },
            { id:"steam_assetto",    name:"Assetto Corsa",           price:"3.00€", desc:"Compte Steam — Assetto Corsa." },
            { id:"steam_beamng",     name:"BeamNG.drive",            price:"3.00€", desc:"Compte Steam — BeamNG.drive." },
          ]
        },
        {
          id: "steam_multi", name: "Multijoueur & Divers", icon: "logo/steam.png", color: "#22c55e",
          badges: ["✅ Compte Steam FA","🎮 Jeu inclus","⚡ Livraison rapide"],
          longDesc: "Comptes Steam Full Access avec le jeu correspondant déjà installé. Email et mot de passe fournis. Les comptes peuvent contenir d'autres jeux bonus.",
          warning: "Ne pas changer les informations du compte. Produit non remboursable.",
          items: [
            { id:"steam_sot",       name:"Sea of Thieves",        price:"3.00€", desc:"Compte Steam — Sea of Thieves." },
            { id:"steam_amongus",   name:"Among Us",              price:"3.00€", desc:"Compte Steam — Among Us." },
            { id:"steam_ron",       name:"Ready or Not",          price:"3.00€", desc:"Compte Steam — Ready or Not." },
            { id:"steam_marvel",    name:"Marvel Rivals",         price:"3.00€", desc:"Compte Steam — Marvel Rivals." },
            { id:"steam_detroit",   name:"Detroit: Become Human", price:"3.00€", desc:"Compte Steam — Detroit." },
            { id:"steam_wpe",       name:"Wallpaper Engine",      price:"3.00€", desc:"Compte Steam — Wallpaper Engine." },
            { id:"steam_schedule1", name:"Schedule 1",            price:"3.00€", desc:"Compte Steam — Schedule 1." },
          ]
        },
        {
          id: "valorant", name: "Valorant Account", icon: "logo/valorant.png", color: "#ff4655",
          badges: ["✅ Full Access","🎮 Inventaire VP inclus","⚡ Livraison rapide"],
          longDesc: "Comptes Valorant EU avec inventaire VP (Valorant Points) déjà présent. Full Access — email et mot de passe fournis, accès complet au compte.",
          warning: "Ne pas changer les informations du compte. Produit non remboursable.",
          items: [
            { id:"val_1k_3k",   name:"Valorant EU [1.000–3.000 VP]",   price:"32.00€",  desc:"Compte avec inventaire 1000-3000 VP." },
            { id:"val_3k_5k",   name:"Valorant EU [3.000–5.000 VP]",   price:"44.50€",  desc:"Compte avec inventaire 3000-5000 VP." },
            { id:"val_5k_7k",   name:"Valorant EU [5.000–7.000 VP]",   price:"64.50€",  desc:"Compte avec inventaire 5000-7000 VP." },
            { id:"val_7k_12k",  name:"Valorant EU [7.000–12.000 VP]",  price:"89.50€",  desc:"Compte avec inventaire 7000-12000 VP." },
            { id:"val_15k_25k", name:"Valorant EU [15.000–25.000 VP]", price:"107.00€", desc:"Compte avec inventaire 15000-25000 VP." },
          ]
        },
      ]
    },
    {
      id: "vpn", name: "VPN", icon: "logo/vpn.png", color: "#0ea5e9",
      groups: [
        {
          id: "nordvpn", name: "NordVPN", icon: "logo/vpn.png", color: "#3c73b5",
          badges: ["✅ Accès complet","🌍 5000+ serveurs","🔒 Politique no-logs"],
          longDesc: "NordVPN Premium — navigation 100% sécurisée avec 5000+ serveurs dans 60 pays. Protection contre les trackers, malwares et fuites DNS.",
          warning: "Ne pas changer le mot de passe ni les informations du compte. Non remboursable.",
          items: [
            { id:"nordvpn_prem", name:"NordVPN Premium", price:"4.00€", desc:"Compte NordVPN premium." },
          ]
        },
        {
          id: "ipvanish", name: "IPVanish", icon: "logo/vpn.png", color: "#22c55e",
          badges: ["✅ Accès complet","🌍 Multi-pays","🔒 No-logs certifié"],
          longDesc: "IPVanish Premium — VPN ultra-rapide avec politique no-logs certifiée et vitesses illimitées sur tous les appareils.",
          warning: "Ne pas changer le mot de passe ni les informations du compte. Non remboursable.",
          items: [
            { id:"ipvanish_prem", name:"IPVanish Premium", price:"4.00€", desc:"Compte IPVanish premium." },
          ]
        },
      ]
    },
    {
      id: "transfert", name: "Transfert", icon: "logo/cryptotopaypal.png", color: "#60a5fa",
      groups: [
        {
          id: "ltc", name: "LTC", icon: "logo/ltc.png", color: "#60a5fa",
          badges: ["⚡ Taux du marché","🔒 Service de confiance","💬 Via ticket Discord"],
          longDesc: "Échangez facilement vos crypto (LTC) contre du PayPal. Service disponible via ticket Discord, taux négocié en temps réel.",
          warning: "Taux variables selon le marché. Vérifiez le taux avant de procéder.",
          items: [
            { id:"exchange", name:"LTC ↔ PayPal", price:"Variable", desc:"Échange au taux du marché." },
          ]
        },
      ]
    },
  ],
  // Legacy flat shop array (kept for openItem compatibility)
  get shop() {
    const out = [];
    for(const cat of this.shopCategories)
      for(const grp of cat.groups)
        for(const item of grp.items)
          out.push({ ...item, icon: grp.icon, category: cat.name, premium: cat.premium || false,
                     _groupId: grp.id, _catId: cat.id });
    return out;
  },
  tools: [
    { id:"t1", name:"Sherlock",                icon:"logo/loupe.png",         category:"Standard", desc:"Hunt down social media accounts by username across social networks. Exemple : sherlock user123" },
    { id:"t2", name:"Tor Tools",                icon:"logo/tor.png",           category:"Standard", desc:"Best for safe, curated research; it filters illegal content and is endorsed by the Tor Project." },
    { id:"t3", name:"[New] Discord Nuker",       icon:"logo/nuker.png",         category:"Standard", desc:"Boubou-Discord-Nuker — nuke automatisé de serveurs Discord." },
    { id:"t4", name:"[Site] Verity Suite",       icon:"logo/veritysuite.png",   category:"Standard", desc:"Zlamana-VeritySuite — site web Informatique complète & vérification d'identité." },
    { id:"t5", name:"DMALL Services discord",    icon:"logo/discordagent.png",  category:"Standard", desc:"Boubou-DMALL — suite d'outils et services Discord tout-en-un." },
    { id:"t6", name:"Nitro Generator",           icon:"logo/discord.png",       category:"Standard", desc:"Discord-Nitro-Generator — génère des codes Nitro Discord." },
    { id:"t8", name:"Purple Grabber - Boubou",   icon:"logo/id.png",            category:"Standard", desc:"A Grabber with a lot of features ..." },
    { id:"t9", name:"Database pack",             icon:"logo/database.png",     category:"Premium",  desc:"Database pack (+10) - Buy on discord", price:"2.99€" },
    { id:"t10", name:"Discord private vocal",    icon:"logo/discord.png",      category:"Premium",  desc:"Private vocal in the discord server", price:"0.99€" },
    { id:"t11", name:"Searcher",                 icon:"logo/loupe.png",        category:"Standard", desc:"Description à venir." },
    { id:"t12", name:"CrosshairX - cracked by boubou", icon:"logo/crosshairx.png", category:"Standard", desc:"Description à venir.", downloadUrl:"https://www.mediafire.com/file/21gno03fxymnh5i/CrosshairX-cracked_by_boubou.zip/file" },
  ],
};
