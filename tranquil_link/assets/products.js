/*
 * TranquilLink — store settings & public catalogue.
 * Edit this file to update contact details, products and prices.
 * Only public info goes here (never cost prices — those live in admin.html).
 */
window.TL_CONFIG = {
  whatsapp: "94715447732",            // international format, digits only
  phone: "071 544 7732",
  handle: "tranquil_link",            // social media handle (@tranquil_link)
  location: "Dehiwala, Colombo",
};

window.TL_CATEGORIES = [
  { id: "audio",      name: "Audio",             icon: "audio",     blurb: "Earbuds by Soundcore" },
  { id: "cases",      name: "Phone Cases",       icon: "case",      blurb: "MagSafe & protective cases" },
  { id: "powerbanks", name: "Power Banks",       icon: "powerbank", blurb: "10,000 to 48,000mAh" },
  { id: "chargers",   name: "Chargers & Cables", icon: "charger",   blurb: "Car & home chargers, cables, batteries" },
  { id: "car",        name: "Car & Bike",        icon: "car",       blurb: "Washer, safety & phone holder" },
  { id: "home",       name: "Home & Office",     icon: "home",      blurb: "Lighting, cleaning & desk gear" },
];

/*
 * Product fields:
 *   price     – single price, OR
 *   was       – optional previous price, shown crossed out
 *   options   – [{ label, price }] when sold in several pack sizes
 *   warranty  – optional short warranty label
 *   badge     – optional corner label
 *   image     – path to the product photo
 */
window.TL_PRODUCTS = [
  {
    id: "soundcore-r50i-nc", name: "Soundcore R50i NC", brand: "Anker Soundcore", category: "audio",
    price: 8000, badge: "New arrival", warranty: "18-month 1-to-1 replacement warranty",
    image: "assets/img/soundcore-r50i-nc.jpg",
    features: ["Adaptive ANC noise cancelling", "10H playtime, 45H with case", "4-mic AI clear calls", "2-in-1 case & phone stand", "IP54 dust & splash resistant"],
  },
  {
    id: "soundcore-v20i", name: "Soundcore V20i Open-Ear Earbuds", brand: "Anker Soundcore", category: "audio",
    price: 8500, warranty: "18-month warranty",
    image: "assets/img/soundcore-v20i.jpg",
    features: ["Open-ear design, 4 rotatable fit positions", "36H playtime", "16mm BassUp drivers", "4 mics, AI clear calls", "IP55 sweat & water resistant, multipoint connection"],
  },
  {
    id: "ugreen-magnetic-case", name: "Ugreen Magnetic Protective Case — iPhone 17 Air", brand: "Ugreen", category: "cases",
    price: 4200, badge: "New arrival",
    image: "assets/img/ugreen-magnetic-case.jpg",
    features: ["Magnetic ring", "Crystal clear", "Camera guard"],
  },
  {
    id: "greenlion-woven-case", name: "Green Lion Woven MagSafe Case — iPhone Duo", brand: "Green Lion", category: "cases",
    price: 6200, badge: "New arrival",
    image: "assets/img/greenlion-woven-case.jpg",
    features: ["Premium woven, soft-touch fabric texture", "Ultra lightweight", "MagSafe compatible"],
  },
  {
    id: "remax-rcc358", name: "Remax 30W Car Charger (RCC358)", brand: "Remax", category: "chargers",
    price: 1900, warranty: "6-month warranty",
    image: "assets/img/remax-rcc358.jpg",
    features: ["30W PD + QC fast charging", "USB + Type-C ports — charge two devices", "Smart power control", "Works with 12–24V car sockets"],
  },
  {
    id: "remax-aa", name: "Remax AA Type-C Rechargeable Lithium Battery", brand: "Remax", category: "chargers",
    options: [{ label: "2 pcs pack", price: 2800 }, { label: "4 pcs pack", price: 4400 }],
    image: "assets/img/remax-aa.jpg",
    features: ["Built-in Type-C port — no charger needed", "1.5V output, fits standard AA devices", "3071mWh capacity"],
  },
  {
    id: "remax-aaa", name: "Remax AAA Type-C Rechargeable Lithium Battery", brand: "Remax", category: "chargers",
    options: [{ label: "2 pcs pack", price: 2600 }, { label: "4 pcs pack", price: 3700 }],
    image: "assets/img/remax-aaa.jpg",
    features: ["Built-in Type-C port — no charger needed", "1.5V output, fits standard AAA devices", "814mWh capacity (435mAh per battery)"],
  },
  {
    id: "yesido-dh16", name: "Yesido DH16 Stretchable LED Light Bulb", brand: "Yesido", category: "home",
    price: 3000,
    image: "assets/img/yesido-dh16.jpg",
    features: ["60W max power, 38 LEDs", "3600mAh battery — 6–7 hrs per charge", "Type-C charging", "3 modes + battery indicator"],
  },
  {
    id: "yesido-ec22", name: "Yesido EC22 Robot Vacuum Cleaner", brand: "Yesido", category: "home",
    price: 48000, badge: "3-in-1", warranty: "6-month warranty",
    image: "assets/img/yesido-ec22.jpg",
    features: ["Sweeps, vacuums and mops", "2000Pa suction, 120+ min runtime", "6-axis gyro navigation, visual map display", "Voice + wireless control, auto-return charging", "Anti-collision & anti-fall, 130 ml water tank"],
  },
  {
    id: "ugreen-nexode-48000", name: "Ugreen Nexode 48,000mAh Power Bank (25286)", brand: "Ugreen", category: "powerbanks",
    price: 39500, warranty: "1-year warranty",
    image: "assets/img/ugreen-nexode-48000.jpg",
    features: ["300W total output, charge 5 devices at once", "USB-C 140W + 2× USB-C 100W + 2× USB-A 22.5W", "LED light + SOS mode", "LiFePO4 battery, 3000 cycles", "Full recharge in about 1.5 hrs with a 140W USB-C charger"],
  },
  {
    id: "wiwu-essen-20000", name: "WiWU Essen 20,000mAh Power Bank", brand: "WiWU", category: "powerbanks",
    price: 6950, badge: "Offer",
    image: "assets/img/wiwu-essen-20000.jpg",
    features: ["22.5W fast charging", "Built-in USB-C & Lightning cables", "Digital % display"],
  },
  {
    id: "baseus-10000-powerbank", name: "Baseus 10,000mAh Power Bank 30W", brand: "Baseus", category: "powerbanks",
    price: 8500, was: 8950, badge: "Offer", warranty: "6-month warranty",
    image: "assets/img/baseus-10000-powerbank.jpg",
    features: ["30W fast charging", "Two built-in USB-C cables", "Digital % display"],
  },
  {
    id: "porodo-dualpower-102w", name: "Porodo DualPower 102W Car Charger", brand: "Porodo", category: "chargers",
    price: 3850, warranty: "6-month warranty",
    image: "assets/img/porodo-dualpower-102w.jpg",
    features: ["4 ports, 102W max output", "2× USB-C PD 30W", "2× USB-A QC 18W", "For 12–24V sockets"],
  },
  {
    id: "wiwu-nano", name: "WiWU Nano 30W Car Charger", brand: "WiWU", category: "chargers",
    price: 3200, was: 3450, badge: "New arrival",
    image: "assets/img/wiwu-nano.jpg",
    features: ["30W USB-C + 18W USB-A, PD and QC", "Just 41 mm tall and 17.5 g", "Solid metal body", "For 12–24V sockets"],
  },
  {
    id: "aspor-a975", name: "Aspor A975 33W Car Charger", brand: "Aspor", category: "chargers",
    price: 1900, was: 2150, badge: "Offer", warranty: "6-month warranty",
    image: "assets/img/aspor-a975.jpg",
    features: ["33W fast charging", "QC + PD, 2 output ports", "Mini compact size, hard metal shell"],
  },
  {
    id: "aspor-a973", name: "Aspor A973 33W Car Charger", brand: "Aspor", category: "chargers",
    price: 1550, warranty: "6-month warranty",
    image: "assets/img/aspor-a973.jpg",
    features: ["33W max, single USB-C port", "PD fast charge with PPS support", "Mini size, hard metal shell", "For 12–24V sockets"],
  },
  {
    id: "aspor-a833", name: "Aspor A833 40W Home Charger", brand: "Aspor", category: "chargers",
    price: 1450, was: 1950, badge: "Offer", warranty: "6-month warranty",
    image: "assets/img/aspor-a833.jpg",
    features: ["PD 40W total output", "2× USB-C + 2× USB-A — charges 4 devices together", "UK plug"],
  },
  {
    id: "wiwu-flameguard", name: "WiWU FlameGuard USB-C to USB-C Cable", brand: "WiWU", category: "chargers",
    price: 1200,
    image: "assets/img/wiwu-flameguard.jpg",
    features: ["60W fast charging", "Flame-retardant materials", "31,000+ bend lifespan", "1.2 m braided"],
  },
  {
    id: "wiwu-titanlink", name: "WiWU Titanlink USB-C to USB-C Cable (Wi-C057)", brand: "WiWU", category: "chargers",
    price: 1090, badge: "Offer",
    image: "assets/img/wiwu-titanlink.jpg",
    features: ["60W fast charging", "Nylon braided", "1 m long, charging & data"],
  },
  {
    id: "aspor-a083", name: "Aspor A083 100W Silicone USB-C Cable", brand: "Aspor", category: "chargers",
    price: 850, was: 1100, badge: "Offer",
    image: "assets/img/aspor-a083.jpg",
    features: ["100W fast charging", "USB-C to USB-C, charging & data", "1 m silicone cable"],
  },
  {
    id: "ldnio-lc23c", name: "LDNIO LC23C USB-C to USB-C Cable", brand: "LDNIO", category: "chargers",
    price: 1250, warranty: "6-month warranty",
    image: "assets/img/ldnio-lc23c.jpg",
    features: ["65W max", "25 cm compact braided cable", "Magnetic storage"],
  },
  {
    id: "yesido-vc18", name: "Yesido VC18 Cordless Car Pressure Washer", brand: "Yesido", category: "car",
    price: 25500, warranty: "6-month warranty",
    image: "assets/img/yesido-vc18.jpg",
    features: ["24V battery, 15,000mAh — about 24 min working time", "0.9 MPa max pressure, 4 L/min flow", "Foam dispenser, 5 m water pipe", "LED display, temperature protection"],
  },
  {
    id: "ugreen-safety-hammer", name: "Ugreen Car Safety Hammer (35347)", brand: "Ugreen", category: "car",
    price: 2400,
    image: "assets/img/ugreen-safety-hammer.jpg",
    features: ["2-in-1: break window + cut safety belt", "Tungsten steel window breaker", "Built-in stainless steel cutter"],
  },
  {
    id: "aspor-a705", name: "Aspor A705 Riding Bracket — Bicycle Phone Holder", brand: "Aspor", category: "car",
    price: 1500,
    image: "assets/img/aspor-a705.jpg",
    features: ["Handlebar mount, 360° rotation", "Gravity auto-clamping", "One-handed operation", "Wide phone compatibility"],
  },
  {
    id: "ugreen-finetrack-2", name: "Ugreen FineTrack 2 Tracker", brand: "Ugreen", category: "home",
    price: 5800, was: 6700, badge: "Offer", warranty: "18-month warranty",
    image: "assets/img/ugreen-finetrack-2.jpg",
    features: ["Works with Apple Find My (iOS only)", "5–7 years battery, no charging", "110dB loud alert", "IP68 waterproof"],
  },
  {
    id: "aspor-a781", name: "Aspor A781 7-in-1 USB Hub", brand: "Aspor", category: "home",
    price: 4800, was: 7000, badge: "Offer",
    image: "assets/img/aspor-a781.jpg",
    features: ["5 USB-A + 2 USB-C ports", "One USB 3.0 port, up to 5Gbps", "Plugs into USB-A or USB-C", "Windows, Mac & Android"],
  },
  {
    id: "ugreen-lp669-wrist-rest", name: "Ugreen LP669 Ergonomic Keyboard Wrist Rest", brand: "Ugreen", category: "home",
    price: 2350, warranty: "18-month warranty",
    image: "assets/img/ugreen-lp669-wrist-rest.jpg",
    features: ["Memory foam, comfortable & firm support", "Lycra top, anti-slip PU base", "435 × 70 × 20 mm — fits full-size keyboards", "Colour: black"],
  },
];
