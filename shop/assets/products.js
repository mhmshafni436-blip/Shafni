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
  { id: "audio",    name: "Audio",            icon: "audio",   blurb: "Earbuds by Soundcore" },
  { id: "cases",    name: "Phone Cases",      icon: "case",    blurb: "MagSafe & protective cases" },
  { id: "power",    name: "Power & Charging", icon: "charger", blurb: "Car chargers & batteries" },
  { id: "home",     name: "Home & Lighting",  icon: "home",    blurb: "Smart home & emergency light" },
];

/*
 * Product fields:
 *   price     – single price, OR
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
    id: "remax-rcc358", name: "Remax 30W Car Charger (RCC358)", brand: "Remax", category: "power",
    price: 1900, warranty: "6-month warranty",
    image: "assets/img/remax-rcc358.jpg",
    features: ["30W PD + QC fast charging", "USB + Type-C ports — charge two devices", "Smart power control", "Works with 12–24V car sockets"],
  },
  {
    id: "remax-aa", name: "Remax AA Type-C Rechargeable Lithium Battery", brand: "Remax", category: "power",
    options: [{ label: "2 pcs pack", price: 2800 }, { label: "4 pcs pack", price: 4400 }],
    image: "assets/img/remax-aa.jpg",
    features: ["Built-in Type-C port — no charger needed", "1.5V output, fits standard AA devices", "3071mWh capacity"],
  },
  {
    id: "remax-aaa", name: "Remax AAA Type-C Rechargeable Lithium Battery", brand: "Remax", category: "power",
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
];
