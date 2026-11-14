(() => {
  const cfg = window.TL_CONFIG;
  const products = window.TL_PRODUCTS;
  const categories = window.TL_CATEGORIES;
  const $ = (s) => document.querySelector(s);
  const money = (n) => "Rs. " + Number(n).toLocaleString("en-LK");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const waLink = (text) => `https://wa.me/${cfg.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;

  /* ---------- Icons ---------- */
  const ICONS = {
    charger: '<svg viewBox="0 0 48 48"><rect x="17" y="6" width="14" height="30" rx="5"/><path d="M21 36v6M27 36v6M21 14h6M21 20h6"/><path d="m25 25-3 5h4l-3 5"/></svg>',
    wireless: '<svg viewBox="0 0 48 48"><rect x="15" y="8" width="18" height="32" rx="4"/><path d="M22 35h4"/><path d="M8 18c-3 4-3 8 0 12M40 18c3 4 3 8 0 12M11 21c-1.5 2-1.5 4 0 6M37 21c1.5 2 1.5 4 0 6"/></svg>',
    fm: '<svg viewBox="0 0 48 48"><rect x="12" y="10" width="24" height="22" rx="6"/><circle cx="24" cy="21" r="5"/><path d="M20 32v8h8v-8"/><path d="M6 14c-2 4-2 10 0 14M42 14c2 4 2 10 0 14"/></svg>',
    audio: '<svg viewBox="0 0 48 48"><path d="M10 28v-4a14 14 0 0 1 28 0v4"/><rect x="6" y="27" width="8" height="13" rx="4"/><rect x="34" y="27" width="8" height="13" rx="4"/></svg>',
    case: '<svg viewBox="0 0 48 48"><rect x="13" y="5" width="22" height="38" rx="5"/><rect x="17" y="9" width="9" height="9" rx="3"/><circle cx="24" cy="29" r="6"/></svg>',
    home: '<svg viewBox="0 0 48 48"><path d="M16 22a8 8 0 0 1 16 0c0 4-3 5-3 9H19c0-4-3-5-3-9Z"/><path d="M20 36h8M21 40h6M24 6v4M10 12l3 3M38 12l-3 3"/></svg>',
    powerbank: '<svg viewBox="0 0 48 48"><rect x="13" y="6" width="22" height="36" rx="5"/><path d="m26 15-5 9h6l-5 9"/></svg>',
    car: '<svg viewBox="0 0 48 48"><path d="M8 30v-6l4-10h24l4 10v6Z"/><path d="M8 24h32M12 30v4M36 30v4"/><circle cx="15" cy="27" r="1.5"/><circle cx="33" cy="27" r="1.5"/></svg>',
    vacuum: '<svg viewBox="0 0 48 48"><path d="M10 14h18a6 6 0 0 1 6 6v4a6 6 0 0 1-6 6H10z"/><path d="M34 22h4l4 4-4 4h-4"/><path d="M14 30v6a4 4 0 0 0 4 4h6M18 20h8"/></svg>',
  };
  const catOf = (id) => categories.find((c) => c.id === id) || {};
  const iconFor = (p) => ICONS[catOf(p.category).icon] || ICONS.charger;

  document.querySelectorAll("[data-icon]").forEach((el) => (el.innerHTML = ICONS[el.dataset.icon]));

  /* ---------- Contact details ---------- */
  $("#phoneLink").textContent = cfg.phone;
  $("#phoneLink").href = "tel:+" + cfg.whatsapp;
  $("#handleText").textContent = "@" + cfg.handle;
  $("#locationText").textContent = cfg.location;
  $("#waFloat").href = waLink("Hi TranquilLink! I have a question.");
  $("#year").textContent = new Date().getFullYear();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("#menuBtn"), nav = $("#nav");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); }
  });

  /* ---------- Categories ---------- */
  let activeCat = "all";
  $("#catGrid").innerHTML = categories.map((c) => {
    const count = products.filter((p) => p.category === c.id).length;
    return `<button class="cat" data-cat="${c.id}">
      <div class="cat-icon">${ICONS[c.icon]}</div>
      <h3>${esc(c.name)}</h3><p>${esc(c.blurb)}</p>
      <small>${count} product${count === 1 ? "" : "s"} →</small>
    </button>`;
  }).join("");
  $("#catGrid").addEventListener("click", (e) => {
    const btn = e.target.closest(".cat");
    if (!btn) return;
    setCat(btn.dataset.cat);
    $("#shop").scrollIntoView();
  });

  const chips = [{ id: "all", name: "All" }, ...categories];
  $("#chips").innerHTML = chips.map((c) => `<button class="chip" role="tab" data-cat="${c.id}">${esc(c.name)}</button>`).join("");
  $("#chips").addEventListener("click", (e) => { const b = e.target.closest(".chip"); if (b) setCat(b.dataset.cat); });

  function setCat(id) {
    activeCat = id;
    document.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-selected", c.dataset.cat === id));
    renderProducts();
  }

  /* ---------- Products ---------- */
  $("#search").addEventListener("input", renderProducts);

  const optsOf = (p) => p.options || [{ label: "", price: p.price }];
  const keyOf = (id, i) => id + "::" + i;
  const lineOf = (key) => {
    const [id, i] = key.split("::");
    const p = products.find((x) => x.id === id);
    const o = p && optsOf(p)[+i];
    return o ? { p, o, name: p.name + (o.label ? ` (${o.label})` : "") } : null;
  };

  function renderProducts() {
    const q = $("#search").value.trim().toLowerCase();
    const list = products.filter((p) =>
      (activeCat === "all" || p.category === activeCat) &&
      (p.name + " " + p.brand + " " + catOf(p.category).name).toLowerCase().includes(q));
    const order = (p) => categories.findIndex((c) => c.id === p.category);
    list.sort((x, y) => order(x) - order(y));
    $("#empty").hidden = list.length > 0;
    $("#productGrid").innerHTML = list.map((p) => {
      const opts = optsOf(p);
      return `<article class="product" data-id="${p.id}">
        <div class="product-media">
          ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
          ${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : iconFor(p)}
        </div>
        <div class="product-body">
          <span class="product-brand">${esc(p.brand)}</span>
          <h3>${esc(p.name)}</h3>
          <ul>${(p.features || []).map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
          ${p.warranty ? `<p class="warranty">${esc(p.warranty)}</p>` : ""}
          ${opts.length > 1 ? `<select class="opt" aria-label="Pack size">${opts.map((o, i) =>
            `<option value="${i}">${esc(o.label)} — ${money(o.price)}</option>`).join("")}</select>` : ""}
          <div class="product-foot">
            <div><span class="price">${money(opts[0].price)}</span>${p.was ? `<s class="was">${money(p.was)}</s>` : ""}</div>
            <button class="add-btn">Add to order</button>
          </div>
        </div>
      </article>`;
    }).join("");
    document.querySelectorAll(".product").forEach(syncCard);
  }

  function syncCard(card) {
    const p = products.find((x) => x.id === card.dataset.id);
    const sel = card.querySelector(".opt"), i = sel ? +sel.value : 0;
    const added = cart[keyOf(p.id, i)];
    card.querySelector(".price").textContent = money(optsOf(p)[i].price);
    const btn = card.querySelector(".add-btn");
    btn.classList.toggle("added", !!added);
    btn.textContent = added ? "✓ Added" : "Add to order";
  }
  $("#productGrid").addEventListener("change", (e) => {
    if (e.target.classList.contains("opt")) syncCard(e.target.closest(".product"));
  });
  $("#productGrid").addEventListener("click", (e) => {
    const b = e.target.closest(".add-btn");
    if (!b) return;
    const card = b.closest(".product"), sel = card.querySelector(".opt");
    const key = keyOf(card.dataset.id, sel ? +sel.value : 0);
    if (cart[key]) { openDrawer(); return; }
    cart[key] = 1;
    saveCart();
    toast(`${lineOf(key).name} added to your order`);
  });

  /* ---------- Order list (cart) ---------- */
  let cart = {};
  try { cart = JSON.parse(localStorage.getItem("tl-cart")) || {}; } catch { cart = {}; }
  for (const k in cart) if (!lineOf(k)) delete cart[k];

  function saveCart() {
    try { localStorage.setItem("tl-cart", JSON.stringify(cart)); } catch {}
    renderCart();
    renderProducts();
  }

  function renderCart() {
    const items = Object.entries(cart).map(([key, qty]) => ({ key, qty, ...lineOf(key) }));
    const count = items.reduce((s, i) => s + i.qty, 0);
    const total = items.reduce((s, i) => s + i.qty * i.o.price, 0);
    $("#cartCount").hidden = count === 0;
    $("#cartCount").textContent = count;
    $("#cartTotal").textContent = money(total);
    $("#checkout").disabled = count === 0;
    $("#cartItems").innerHTML = items.length
      ? items.map(({ key, p, o, name, qty }) => `<div class="cart-item">
          <div class="thumb">${p.image ? `<img src="${esc(p.image)}" alt="">` : iconFor(p)}</div>
          <div class="info"><b>${esc(name)}</b><small>${money(o.price)}</small></div>
          <div class="qty">
            <button data-act="dec" data-id="${key}" aria-label="Decrease">−</button>
            <span>${qty}</span>
            <button data-act="inc" data-id="${key}" aria-label="Increase">+</button>
          </div>
        </div>`).join("")
      : `<div class="cart-empty">Your order list is empty.<br>Add products from the shop to get started.</div>`;
  }

  $("#cartItems").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-act]");
    if (!b) return;
    const id = b.dataset.id;
    if (b.dataset.act === "inc") cart[id]++;
    else if (--cart[id] <= 0) delete cart[id];
    saveCart();
  });

  $("#checkout").addEventListener("click", () => {
    const items = Object.entries(cart).map(([key, qty]) => ({ qty, ...lineOf(key) }));
    const lines = items.map((i) => `• ${i.qty} × ${i.name} — ${money(i.o.price * i.qty)}`);
    const total = items.reduce((s, i) => s + i.qty * i.o.price, 0);
    const msg = `Hi TranquilLink! I'd like to order:\n\n${lines.join("\n")}\n\nEstimated total: ${money(total)}\n\nPlease confirm availability and delivery.`;
    window.open(waLink(msg), "_blank", "noopener");
  });

  const drawer = $("#drawer"), backdrop = $("#backdrop");
  function openDrawer() { drawer.classList.add("open"); drawer.setAttribute("aria-hidden", false); backdrop.hidden = false; }
  function closeDrawer() { drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", true); backdrop.hidden = true; }
  $("#cartBtn").addEventListener("click", openDrawer);
  $("#closeDrawer").addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  /* ---------- Contact form → WhatsApp ---------- */
  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#cName").value.trim(), phone = $("#cPhone").value.trim(), msg = $("#cMsg").value.trim();
    const text = `Hi TranquilLink! I'm ${name}${phone ? ` (${phone})` : ""}.\n\n${msg}`;
    window.open(waLink(text), "_blank", "noopener");
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(text) {
    const t = $("#toast");
    t.textContent = text;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  setCat("all");
  renderCart();
})();
