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
    templateId: "template_8wtc9vk",
    publicKey:  "M-eHZGppCNRyWiLMi",
  },
  // Codes secrets — jamais affichés dans l'UI
  _codes: {
    refund: "BAZAAR-REFUNDS",
    vip:    "BAZAAR-VIP2565",
  },
  founders: [
    { name:"Boubou",  role:"Founder",    discord:"ps0.",       gunslol:"https://guns.lol/ps0",    gunslolLabel:"guns.lol/ps0",   img:"logo/boubou.jpg" },
    { name:"ZIamana", role:"Co-Founder", discord:"canalisation_", gunslol:"https://guns.lol/ziamana",  gunslolLabel:"guns.lol/ziamana", img:"logo/ziamana.png" },
  ],
  plans: [
    {
      id:"plan_free", name:"Standard", subtitle:"Accès de base gratuit",
      price:"0€", period:"/mois", searches:5, color:"#6b7280", highlight:false,
      features:[
        {ok:true,  text:"5 recherches / 48h"},
        {ok:false, text:"Outils payants"},
        {ok:true,  text:"Recherche OSINT de base"},
        {ok:true,  text:"Support Discord"},
      ]
    },
    {
      id:"plan_starter", name:"Starter", subtitle:"Boostez vos capacités",
      price:"2.99€", period:"/mois", searches:20, color:"#7b6ef6", highlight:false,
      features:[
        {ok:true,  text:"20 recherches / 48h"},
        {ok:true,  text:"Outils standard"},
        {ok:true,  text:"Accès boutique"},
        {ok:true,  text:"Support prioritaire"},
      ]
    },
    {
      id:"plan_pro", name:"Pro", subtitle:"Pour les enquêteurs sérieux",
      price:"7.99€", period:"/mois", searches:50, color:"#7b6ef6", highlight:true,
      features:[
        {ok:true,  text:"50 recherches / 48h"},
        {ok:true,  text:"Tous les outils"},
        {ok:true,  text:"Accès boutique premium"},
        {ok:true,  text:"Support VIP 24h/24"},
      ]
    },
    {
      id:"plan_lifetime", name:"Lifetime", subtitle:"Accès ultime à vie",
      price:"19.99€", period:"une fois", searches:999999, color:"#10b981", highlight:false,
      features:[
        {ok:true,  text:"Recherches illimitées"},
        {ok:true,  text:"Outils & Boutique à vie"},
        {ok:true,  text:"0€ par recherche"},
        {ok:true,  text:"Support Fondateur"},
      ]
    },
  ],
  shop: [
    { id:"nitro_id",     name:"Nitro Discord",         icon:"logo/server.png",      category:"Discord",  desc:"Nitro server boosting - Livraison rapide via Discord.", price:"3.00€" },
    { id:"n1tr0",        name:"Nitro Classic",         icon:"logo/discord.png",     category:"Discord",  desc:"Nitro classique pour votre compte.", price:"2.00€" },
    { id:"dec0",         name:"Decorations DC",        icon:"logo/boost.png",       category:"Discord",  desc:"Décorations de profil Discord exclusives.", price:"1.50€" },
    { id:"reacts",       name:"Discord Reactions",     icon:"logo/discord.png",     category:"Boost",    desc:"Réactions automatiques sur vos messages.", price:"1.00€" },
    { id:"0w0",          name:"0w0 Bot Currency",      icon:"logo/coins.png",       category:"Bots",     desc:"Crédits pour le bot 0w0.", price:"2.00€" },
    { id:"bots",         name:"Custom Discord Bot",    icon:"logo/code.png",        category:"Bots",     desc:"Création de bot Discord sur mesure.", price:"10.00€" },
    { id:"r0bux",        name:"Robux Cheap",           icon:"logo/roblox.png",      category:"Exchange", desc:"Robux à prix réduit.", price:"5.00€" },
    { id:"exchange",     name:"Currency Exchange",     icon:"logo/dollars.png",     category:"Exchange", desc:"Échange de devises (LTC/PayPal/PSC).", price:"Variable" },
    { id:"auto_quest",   name:"Auto Quest Bot",        icon:"logo/tools.png",       category:"Bots",     desc:"Bot de quêtes automatiques.", price:"4.00€" },
    { id:"server_boosts",name:"Server Boosting",       icon:"logo/server.png",      category:"Boost",    desc:"Booster votre serveur Discord instantanément.", price:"3.00€" },
    { id:"server_members",name:"Server Members",       icon:"logo/user.png",        category:"Boost",    desc:"Membres Discord pour votre serveur.", price:"2.00€/100" },
    { id:"discord_servers",name:"Aged Servers",        icon:"logo/discord.png",     category:"Discord",  desc:"Serveurs Discord anciens avec historique.", price:"5.00€" },
    { id:"aged_accounts",name:"Aged Accounts",         icon:"logo/user.png",        category:"Compte",   desc:"Comptes Discord/Instagram âgés.", price:"3.00€" },
    { id:"stock_available",name:"Full Stock Access",   icon:"logo/tools.png",       category:"Premium",  desc:"Accès complet au stock Bazaar.", price:"Abonnement requis", premium:true },
    { id:"chat_members", name:"Telegram Members",      icon:"logo/telegram.png",    category:"Boost",    desc:"Membres pour groupe/canal Telegram.", price:"2.00€/100" },
  ],
  tools: [
    { id:"t1", name:"Discord Nitro Generator",   icon:"logo/discord.png", category:"FreeTools", desc:"Générateur Nitro Discord gratuit.", dlContent:"..." },
    { id:"t2", name:"Username Checker",          icon:"logo/user.png",    category:"FreeTools", desc:"Vérifie un username sur 47 sites.", dlContent:"..." },
    { id:"t3", name:"Phone OSINT",               icon:"logo/phone.png",   category:"FreeTools", desc:"Suite OSINT numéros de téléphone.", dlContent:"..." },
    { id:"t4", name:"Advanced Scanner Pro",      icon:"logo/loupe.png",   category:"Tools",     desc:"Scanner de vulnérabilités avancé. (Payant sur Discord)", dlContent:"Payant", vip:true },
    { id:"t5", name:"IP Tracker Premium",        icon:"logo/ip.png",      category:"Tools",     desc:"Tracking IP avec historique. (Payant sur Discord)", dlContent:"Payant", vip:true },
  ],
};
