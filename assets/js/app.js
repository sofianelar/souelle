// ========================================================
// Souelle Pajamas - Storefront Application Controller
// ========================================================

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize and apply branding & settings
  applyStoreBranding();

  // Load and render products
  await loadAndRenderProducts();

  // Initialize event listeners
  setupEventListeners();

  // Initialize cart drawer & counter
  updateCartUI();

  // Populate Wilayas in checkout forms
  populateWilayasDropdowns();
});

// Global state
let currentFilter = "all";
let activeProductForModal = null;

// ==================== BRANDING & THEME ====================
function applyStoreBranding() {
  const settings = db.getSettings();

  // 1. Store Name & Tagline
  document.querySelectorAll(".brand-name-text").forEach(el => el.textContent = settings.storeName);
  document.querySelectorAll(".brand-tagline-text").forEach(el => el.textContent = settings.storeTagline);
  
  // 2. Logo
  document.querySelectorAll(".brand-logo-img").forEach(el => {
    el.src = settings.logoUrl || "assets/images/logo.jpg";
    el.alt = settings.storeName;
  });

  // 3. Topbar Announcement
  const topbarTextEl = document.getElementById("topbarText");
  if (topbarTextEl && settings.topbar?.text) {
    topbarTextEl.textContent = settings.topbar.text;
  }
  const topbarWaLabelEl = document.getElementById("topbarWhatsappLabel");
  if (topbarWaLabelEl && settings.topbar?.whatsappLabel) {
    topbarWaLabelEl.textContent = settings.topbar.whatsappLabel;
  }

  // 4. WhatsApp & Social Links
  const whatsappNum = (settings.whatsappNumber || "+213557857717").replace(/[^0-9]/g, "");
  document.querySelectorAll(".whatsapp-link-btn").forEach(link => {
    link.href = `https://wa.me/${whatsappNum}?text=${encodeURIComponent("مرحباً Souelle Pajamas 🎀، أريد الاستفسار عن التشكيلة المتوفرة لديكم.")}`;
  });

  document.querySelectorAll(".whatsapp-display-num").forEach(el => {
    el.textContent = settings.whatsappDisplay || settings.whatsappNumber;
  });

  document.querySelectorAll(".instagram-link-btn").forEach(link => {
    link.href = settings.instagramUrl || `https://instagram.com/${settings.instagramHandle || 'souelle_pajamas'}`;
  });

  // 5. Dynamic Navbar Links
  renderNavLinks(settings);

  // 6. Dynamic Hero Section
  if (settings.hero) {
    const heroTitle = document.getElementById("heroTitle");
    if (heroTitle) heroTitle.innerHTML = settings.hero.title || "نعومة فائقة وأناقة <span>تليق بأنوثتك</span>";
    const heroSubtitle = document.getElementById("heroSubtitle");
    if (heroSubtitle) heroSubtitle.textContent = settings.hero.subtitle;
    const heroBadge = document.getElementById("heroBadge");
    if (heroBadge) heroBadge.textContent = settings.hero.badge;
    const heroBannerImg = document.getElementById("heroBannerImg");
    if (heroBannerImg) heroBannerImg.src = settings.hero.bannerImage || "assets/images/hero-banner.jpg";
  }

  // 7. Dynamic Features Strip
  renderFeaturesStrip(settings);

  // 8. Dynamic Category Filter Pills
  renderCategoryFilterPills(settings);

  // 9. Dynamic Section Headings
  if (settings.sections) {
    // Products
    if (settings.sections.products) {
      const pBadge = document.getElementById("productsSectionBadge");
      if (pBadge) pBadge.textContent = settings.sections.products.badge;
      const pTitle = document.getElementById("productsSectionTitle");
      if (pTitle) pTitle.textContent = settings.sections.products.title;
      const pSubtitle = document.getElementById("productsSectionSubtitle");
      if (pSubtitle) pSubtitle.textContent = settings.sections.products.subtitle;
    }
    // Testimonials
    if (settings.sections.reviews) {
      const rBadge = document.getElementById("reviewsSectionBadge");
      if (rBadge) rBadge.textContent = settings.sections.reviews.badge;
      const rTitle = document.getElementById("reviewsSectionTitle");
      if (rTitle) rTitle.textContent = settings.sections.reviews.title;
      const rSubtitle = document.getElementById("reviewsSectionSubtitle");
      if (rSubtitle) rSubtitle.textContent = settings.sections.reviews.subtitle;
    }
    // Delivery Banner
    if (settings.sections.deliveryBanner) {
      const dBadge = document.getElementById("deliveryBannerBadge");
      if (dBadge) dBadge.textContent = settings.sections.deliveryBanner.badge;
      const dTitle = document.getElementById("deliveryBannerTitle");
      if (dTitle) dTitle.textContent = settings.sections.deliveryBanner.title;
      const dDesc = document.getElementById("deliveryBannerDesc");
      if (dDesc) dDesc.textContent = settings.sections.deliveryBanner.subtitle;
    }
  }

  // 10. Dynamic Customer Testimonials
  renderCustomerReviews(settings);
}

// Render dynamic navbar
function renderNavLinks(settings) {
  const mainNav = document.getElementById("mainNavLinks");
  const mobileNav = document.getElementById("mobileNavLinks");
  const links = settings.navLinks || DEFAULT_CONFIG.navLinks;
  const whatsappNum = (settings.whatsappNumber || "+213557857717").replace(/[^0-9]/g, "");

  const html = links.map(link => {
    if (link.type === "whatsapp") {
      return `<li><a href="https://wa.me/${whatsappNum}" target="_blank" class="nav-link" style="color: #25D366; font-weight: 700;">${link.label}</a></li>`;
    } else if (link.type === "filter") {
      return `<li><a href="#productsSection" class="nav-link" onclick="filterStoreCategory('${link.categoryFilter}')">${link.label}</a></li>`;
    } else {
      return `<li><a href="${link.url}" class="nav-link ${link.url === 'index.html' ? 'active' : ''}">${link.label}</a></li>`;
    }
  }).join("");

  if (mainNav) mainNav.innerHTML = html;
  if (mobileNav) mobileNav.innerHTML = html;
}

// Render dynamic category filter pills
function renderCategoryFilterPills(settings) {
  const container = document.getElementById("categoryFilterPills");
  if (!container) return;

  const categories = settings.categories || DEFAULT_CONFIG.categories;
  container.innerHTML = categories.map(cat => `
    <button class="filter-btn ${cat.id === currentFilter ? 'active' : ''}" data-filter="${cat.id}" onclick="filterStoreCategory('${cat.id}')">
      <span>${cat.icon || '🎀'} ${cat.name}</span>
    </button>
  `).join("");
}

// Global category switcher
function filterStoreCategory(catId) {
  currentFilter = catId;
  document.querySelectorAll("#categoryFilterPills .filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.filter === catId);
  });
  loadAndRenderProducts(currentFilter);
  const section = document.getElementById("productsSection");
  if (section) {
    section.scrollIntoView({ behavior: "smooth" });
  }
}
window.filterStoreCategory = filterStoreCategory;

// Render dynamic features strip
function renderFeaturesStrip(settings) {
  const container = document.getElementById("featuresGrid");
  if (!container) return;

  const features = settings.features || DEFAULT_CONFIG.features;
  container.innerHTML = features.map(f => `
    <div class="feature-box">
      <div class="feature-icon-circle">${f.icon || '✨'}</div>
      <div class="feature-info">
        <h4>${f.title}</h4>
        <p>${f.desc}</p>
      </div>
    </div>
  `).join("");
}

// Render dynamic customer reviews
function renderCustomerReviews(settings) {
  const container = document.getElementById("testimonialsGrid");
  if (!container) return;

  const reviews = settings.reviews || DEFAULT_CONFIG.reviews;
  container.innerHTML = reviews.map(r => {
    const stars = "⭐".repeat(r.stars || 5);
    const initial = r.name ? r.name.charAt(0) : "س";
    return `
      <div style="background:#fff; padding:1.75rem; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); border: 1px solid var(--border-color);">
        <div style="color: #FFA41C; margin-bottom: 0.5rem; font-size: 1.1rem;">${stars}</div>
        <p style="color: var(--text-dark); line-height: 1.7; font-size: 0.95rem; margin-bottom: 1rem;">
          "${r.text}"
        </p>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--secondary); color:#fff; display: flex; align-items: center; justify-content: center; font-weight: 700;">${initial}</div>
          <div>
            <strong style="color: var(--secondary); display: block; font-size: 0.95rem;">${r.name}</strong>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${r.city}</span>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ==================== PRODUCTS RENDERING ====================
async function loadAndRenderProducts(filter = "all", searchQuery = "") {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 3rem;"><div class="pulse-dot" style="margin: 0 auto 1rem;"></div><p style="color:var(--text-muted)">جاري تحميل المنتجات الأنيقة...</p></div>`;

  const products = await db.getProducts();

  let filtered = products;
  if (filter !== "all") {
    if (filter === "promotions") {
      filtered = products.filter(p => p.oldPrice > p.price || p.category === "promotions");
    } else {
      filtered = products.filter(p => p.category === filter);
    }
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align:center; padding: 4rem 1rem;">
        <span style="font-size: 3rem; display:block; margin-bottom: 1rem;">🛍️</span>
        <h3 style="color:var(--secondary); font-size: 1.4rem; margin-bottom: 0.5rem;">لم نجد منتجات مطابقة</h3>
        <p style="color:var(--text-muted);">يرجى تجربة تصنيف آخر أو البحث بكلمة مختلفة.</p>
      </div>
    `;
    return;
  }

  const settings = db.getSettings();
  const whatsappNum = (settings.whatsappNumber || "+213557857717").replace(/[^0-9]/g, "");

  grid.innerHTML = filtered.map(product => {
    const discountPercent = product.oldPrice > product.price 
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

    const whatsappInquiryMsg = encodeURIComponent(
      `مرحباً Souelle Pajamas 🎀\nأريد الاستفسار عن منتج:\n• ${product.name}\n• السعر: ${product.price} د.ج\nهل متوفر لديكم حالياً؟`
    );

    return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-thumb-box" onclick="openProductModal('${product.id}')">
          <img src="${product.image}" alt="${product.name}" class="product-thumb" loading="lazy">
          ${product.badge ? `<span class="product-badge-tag">${product.badge}</span>` : ''}
          ${discountPercent > 0 ? `<span class="product-discount-tag">-${discountPercent}%</span>` : ''}
          <button class="product-quick-view-btn" type="button">
            <span>نظرة سريعة</span> 👁️
          </button>
        </div>
        <div class="product-body">
          <span class="product-category-label">${product.categoryLabel || (product.category === 'pajamas' ? 'بيجامات فاخرة' : 'عطور فاخرة')}</span>
          <h3 class="product-name" onclick="openProductModal('${product.id}')">${product.name}</h3>
          
          <div class="product-rating">
            <span>⭐⭐⭐⭐⭐</span>
            <span class="rating-count">(${product.reviewsCount || 15} تقييم)</span>
          </div>

          <div class="product-price-row">
            <div class="current-price">${product.price.toLocaleString()} <span>د.ج</span></div>
            ${product.oldPrice > product.price ? `<div class="oldPrice">${product.oldPrice.toLocaleString()} د.ج</div>` : ''}
          </div>

          <div class="product-actions">
            <button class="btn-fast-order" type="button" onclick="openQuickOrderModal('${product.id}')">
              <span>طلب سريع</span> ⚡
            </button>
            <button class="btn-add-cart-icon" type="button" title="أضيفي للسلة" onclick="quickAddToCart('${product.id}')">
              🛒
            </button>
            <a href="https://wa.me/${whatsappNum}?text=${whatsappInquiryMsg}" target="_blank" class="btn-card-whatsapp">
              <span>استفسار فوري عبر واتساب</span> 💬
            </a>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ==================== WILAYAS POPULATION ====================
function populateWilayasDropdowns() {
  const wilayas = db.getWilayas();
  const options = `
    <option value="">-- اختاري الولاية (58 ولاية) --</option>
    ${wilayas.map(w => `<option value="${w.code}" data-home="${w.home_price}" data-desk="${w.desk_price}">${w.code}. ${w.name} (${w.name_latin})</option>`).join("")}
  `;

  document.querySelectorAll(".wilaya-select").forEach(select => {
    select.innerHTML = options;
  });
}

// ==================== PRODUCT DETAIL & ORDER MODALS ====================
async function openProductModal(productId) {
  const products = await db.getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  activeProductForModal = product;
  const modal = document.getElementById("productDetailModal");
  const modalContent = document.getElementById("productDetailContent");

  const settings = db.getSettings();
  const whatsappNum = (settings.whatsappNumber || "+213557857717").replace(/[^0-9]/g, "");

  const sizesHtml = product.sizes && product.sizes.length > 0 ? `
    <div style="margin-bottom: 1rem;">
      <label class="form-label">المقاس / الحجم:</label>
      <div style="display:flex; gap: 0.5rem; flex-wrap:wrap;" id="modalSizesGroup">
        ${product.sizes.map((s, idx) => `
          <button type="button" class="btn-secondary size-opt-btn ${idx === 0 ? 'active' : ''}" style="padding: 0.4rem 1rem; font-size: 0.9rem;" onclick="selectModalOption(this, 'size')">${s}</button>
        `).join("")}
      </div>
    </div>
  ` : '';

  const colorsHtml = product.colors && product.colors.length > 0 ? `
    <div style="margin-bottom: 1rem;">
      <label class="form-label">اللون / الطراز:</label>
      <div style="display:flex; gap: 0.5rem; flex-wrap:wrap;" id="modalColorsGroup">
        ${product.colors.map((c, idx) => `
          <button type="button" class="btn-secondary color-opt-btn ${idx === 0 ? 'active' : ''}" style="padding: 0.4rem 1rem; font-size: 0.9rem;" onclick="selectModalOption(this, 'color')">${c}</button>
        `).join("")}
      </div>
    </div>
  ` : '';

  modalContent.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 1.5rem; align-items: start;">
      <div>
        <img src="${product.image}" alt="${product.name}" style="width:100%; border-radius: var(--radius-md); box-shadow: var(--shadow-sm); object-fit: cover; max-height: 380px;">
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem; background: var(--primary-light); padding: 0.75rem; border-radius: var(--radius-md); font-size: 0.85rem; color: var(--secondary);">
          <span>🚚</span>
          <div><strong>التوصيل متوفر لجميع الولايات:</strong> الدفع عند الاستلام مع إمكانية معاينة الطلب قبل الدفع.</div>
        </div>
      </div>
      <div>
        <span class="product-category-label">${product.categoryLabel || ''}</span>
        <h2 style="font-size: 1.45rem; font-weight: 800; color: var(--secondary); margin-bottom: 0.5rem;">${product.name}</h2>
        <div class="product-price-row" style="margin-bottom: 1rem;">
          <div class="current-price">${product.price.toLocaleString()} <span>د.ج</span></div>
          ${product.oldPrice > product.price ? `<div class="oldPrice">${product.oldPrice.toLocaleString()} د.ج</div>` : ''}
        </div>
        <p style="color: var(--text-muted); font-size: 0.95rem; line-height: 1.7; margin-bottom: 1.25rem;">${product.description || ''}</p>
        
        ${sizesHtml}
        ${colorsHtml}

        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
          <label class="form-label" style="margin: 0;">الكمية:</label>
          <div class="qty-control-box">
            <button type="button" class="qty-btn" onclick="adjustModalQty(-1)">-</button>
            <span id="modalQtyDisplay" style="font-weight: 700; min-width: 28px; text-align: center;">1</span>
            <button type="button" class="qty-btn" onclick="adjustModalQty(1)">+</button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
          <button type="button" class="btn-primary" style="width:100%;" onclick="submitModalAddToCart()">
            <span>إضافة إلى سلة المشتريات</span> 🛒
          </button>
          <button type="button" class="btn-secondary" style="width:100%; border-color: var(--secondary); color: var(--secondary);" onclick="openQuickOrderModal('${product.id}')">
            <span>شراء سريع ومباشر (الدفع عند الاستلام)</span> ⚡
          </button>
          <button type="button" class="btn-whatsapp-hero" style="width:100%;" onclick="sendProductWhatsapp('${product.id}')">
            <span>طلب أو استفسار مباشر عبر واتساب</span> 💬
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");
}

function selectModalOption(btn, type) {
  const container = type === 'size' ? document.getElementById("modalSizesGroup") : document.getElementById("modalColorsGroup");
  if (!container) return;
  container.querySelectorAll("button").forEach(b => {
    b.classList.remove("active");
    b.style.background = "#fff";
    b.style.borderColor = "var(--border-color)";
    b.style.color = "var(--secondary)";
  });
  btn.classList.add("active");
  btn.style.background = "var(--secondary)";
  btn.style.borderColor = "var(--secondary)";
  btn.style.color = "#fff";
}

let modalQty = 1;
function adjustModalQty(delta) {
  modalQty = Math.max(1, modalQty + delta);
  const display = document.getElementById("modalQtyDisplay");
  if (display) display.textContent = modalQty;
}

function submitModalAddToCart() {
  if (!activeProductForModal) return;
  const activeSizeBtn = document.querySelector("#modalSizesGroup .active");
  const activeColorBtn = document.querySelector("#modalColorsGroup .active");

  const size = activeSizeBtn ? activeSizeBtn.textContent.trim() : "";
  const color = activeColorBtn ? activeColorBtn.textContent.trim() : "";

  db.addToCart(activeProductForModal, size, color, modalQty);
  closeModal("productDetailModal");
  showToast("تمت إضافة المنتج إلى السلة بنجاح! 🎀", "success");
  openCartDrawer();
}

async function quickAddToCart(productId) {
  const products = await db.getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const defaultSize = product.sizes && product.sizes.length ? product.sizes[0] : "";
  const defaultColor = product.colors && product.colors.length ? product.colors[0] : "";

  db.addToCart(product, defaultSize, defaultColor, 1);
  showToast(`تمت إضافة "${product.name}" إلى السلة 🛍️`, "success");
}

// ==================== FAST CHECKOUT MODAL ====================
async function openQuickOrderModal(productId) {
  const products = await db.getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  activeProductForModal = product;
  closeModal("productDetailModal");

  const modal = document.getElementById("quickOrderModal");
  const orderProductInfo = document.getElementById("quickOrderProductInfo");

  orderProductInfo.innerHTML = `
    <div style="display:flex; gap: 1rem; align-items:center; background: var(--bg-main); padding: 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 1.25rem;">
      <img src="${product.image}" alt="${product.name}" style="width: 65px; height: 65px; object-fit:cover; border-radius: var(--radius-sm);">
      <div style="flex-grow: 1;">
        <h4 style="font-size: 0.98rem; font-weight: 700; color: var(--secondary); margin-bottom: 0.2rem;">${product.name}</h4>
        <div style="font-weight: 800; color: var(--secondary); font-size: 1.1rem;">
          <span id="quickOrderProductPrice">${product.price.toLocaleString()}</span> د.ج
        </div>
      </div>
    </div>
  `;

  // Pre-fill sizes and colors if available
  const sizeSelect = document.getElementById("quickOrderSize");
  if (sizeSelect) {
    if (product.sizes && product.sizes.length > 0) {
      sizeSelect.parentElement.style.display = "block";
      sizeSelect.innerHTML = product.sizes.map(s => `<option value="${s}">${s}</option>`).join("");
    } else {
      sizeSelect.parentElement.style.display = "none";
    }
  }

  const colorSelect = document.getElementById("quickOrderColor");
  if (colorSelect) {
    if (product.colors && product.colors.length > 0) {
      colorSelect.parentElement.style.display = "block";
      colorSelect.innerHTML = product.colors.map(c => `<option value="${c}">${c}</option>`).join("");
    } else {
      colorSelect.parentElement.style.display = "none";
    }
  }

  calculateQuickOrderTotal();
  modal.classList.add("active");
}

function calculateQuickOrderTotal() {
  if (!activeProductForModal) return;
  const wilayaSelect = document.getElementById("quickOrderWilaya");
  const selectedOption = wilayaSelect.options[wilayaSelect.selectedIndex];
  const deliveryFee = selectedOption && selectedOption.dataset.home ? Number(selectedOption.dataset.home) : 0;
  
  const qty = Number(document.getElementById("quickOrderQty")?.value || 1);
  const subtotal = activeProductForModal.price * qty;
  const total = subtotal + deliveryFee;

  const feeEl = document.getElementById("quickOrderDeliveryFee");
  if (feeEl) feeEl.textContent = deliveryFee > 0 ? `${deliveryFee.toLocaleString()} د.ج` : "يُحدد حسب الولاية";

  const totalEl = document.getElementById("quickOrderTotal");
  if (totalEl) totalEl.textContent = `${total.toLocaleString()} د.ج`;
}

async function handleQuickOrderSubmit(e) {
  e.preventDefault();
  if (!activeProductForModal) return;

  const name = document.getElementById("quickOrderName").value.trim();
  const phone = document.getElementById("quickOrderPhone").value.trim();
  const wilayaSelect = document.getElementById("quickOrderWilaya");
  const wilayaCode = wilayaSelect.value;
  const wilayaName = wilayaSelect.options[wilayaSelect.selectedIndex]?.text || "";
  const commune = document.getElementById("quickOrderCommune").value.trim();
  const address = document.getElementById("quickOrderAddress")?.value.trim() || "";
  const size = document.getElementById("quickOrderSize")?.value || "";
  const color = document.getElementById("quickOrderColor")?.value || "";
  const qty = Number(document.getElementById("quickOrderQty")?.value || 1);

  if (!name || !phone || !wilayaCode || !commune) {
    showToast("يرجى ملء جميع الحقول الإلزامية (الاسم، الهاتف، الولاية، البلدية)", "error");
    return;
  }

  const deliveryFee = Number(wilayaSelect.options[wilayaSelect.selectedIndex]?.dataset.home || 0);
  const subtotal = activeProductForModal.price * qty;
  const total = subtotal + deliveryFee;

  const orderData = {
    customerName: name,
    customerPhone: phone,
    wilayaCode: Number(wilayaCode),
    wilayaName: wilayaName,
    commune: commune,
    address: address,
    items: [
      {
        id: activeProductForModal.id,
        name: activeProductForModal.name,
        price: activeProductForModal.price,
        size: size,
        color: color,
        qty: qty
      }
    ],
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: total,
    notes: `طلب سريع مباشر | المقاس: ${size} | اللون: ${color}`
  };

  const order = await db.createOrder(orderData);
  closeModal("quickOrderModal");

  // Show order success modal
  showOrderSuccessModal(order);
}

function sendProductWhatsapp(productId) {
  const settings = db.getSettings();
  const whatsappNum = (settings.whatsappNumber || "+213557857717").replace(/[^0-9]/g, "");

  const activeSizeBtn = document.querySelector("#modalSizesGroup .active");
  const activeColorBtn = document.querySelector("#modalColorsGroup .active");
  const size = activeSizeBtn ? activeSizeBtn.textContent.trim() : "";
  const color = activeColorBtn ? activeColorBtn.textContent.trim() : "";

  const msg = encodeURIComponent(
    `مرحباً Souelle Pajamas 🎀\n` +
    `أريد طلب المنتج التالي:\n` +
    `• الاسم: ${activeProductForModal.name}\n` +
    `• السعر: ${activeProductForModal.price} د.ج\n` +
    (size ? `• المقاس: ${size}\n` : '') +
    (color ? `• اللون: ${color}\n` : '') +
    `• الكمية: ${modalQty}\n` +
    `يرجى تأكيد التوفر وإرسال تفاصيل التوصيل.`
  );

  window.open(`https://wa.me/${whatsappNum}?text=${msg}`, "_blank");
}

function showOrderSuccessModal(order) {
  const modal = document.getElementById("orderSuccessModal");
  const orderRefEl = document.getElementById("successOrderRef");
  const orderSummaryEl = document.getElementById("successOrderSummary");
  const whatsappConfirmBtn = document.getElementById("successWhatsappBtn");

  if (orderRefEl) orderRefEl.textContent = order.id;

  if (orderSummaryEl) {
    orderSummaryEl.innerHTML = `
      <div style="font-size: 0.95rem; line-height: 1.8; color: var(--text-dark);">
        <div><strong>الزبونة:</strong> ${order.customerName} (${order.customerPhone})</div>
        <div><strong>عنوان التوصيل:</strong> ${order.wilayaName} - ${order.commune}</div>
        <div><strong>المبلغ الإجمالي (مع التوصيل):</strong> <span style="color:var(--secondary); font-weight:800;">${order.total.toLocaleString()} د.ج</span></div>
        <div style="color: #27AE60; font-weight:700; margin-top: 0.5rem;">🚚 الدفع عند الاستلام بعد المعاينة</div>
      </div>
    `;
  }

  if (whatsappConfirmBtn) {
    const settings = db.getSettings();
    const whatsappNum = (settings.whatsappNumber || "+213557857717").replace(/[^0-9]/g, "");
    
    const itemsList = order.items.map(i => `• ${i.name} (الكمية: ${i.qty})`).join("\n");
    const msg = encodeURIComponent(
      `مرحباً Souelle Pajamas 🎀\n` +
      `لقد قمت بتأكيد الطلب رقم: *${order.id}*\n` +
      `• الاسم: ${order.customerName}\n` +
      `• الهاتف: ${order.customerPhone}\n` +
      `• الولاية: ${order.wilayaName}\n` +
      `• البلدية: ${order.commune}\n` +
      `• المنتجات المطلوبة:\n${itemsList}\n` +
      `• المجموع الكلي مع التوصيل: *${order.total} د.ج*\n` +
      `يرجى تأكيد وشحن طلبي في أقرب وقت وشكراً!`
    );

    whatsappConfirmBtn.onclick = () => {
      window.open(`https://wa.me/${whatsappNum}?text=${msg}`, "_blank");
    };
  }

  modal.classList.add("active");
}

// ==================== CART DRAWER ====================
function openCartDrawer() {
  renderCartDrawer();
  const drawerOverlay = document.getElementById("cartDrawerOverlay");
  if (drawerOverlay) drawerOverlay.classList.add("active");
}

function closeCartDrawer() {
  const drawerOverlay = document.getElementById("cartDrawerOverlay");
  if (drawerOverlay) drawerOverlay.classList.remove("active");
}

function updateCartUI() {
  const cart = db.getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll(".cart-count-badge").forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  });
}

function renderCartDrawer() {
  const cart = db.getCart();
  const container = document.getElementById("cartDrawerItems");
  const subtotalEl = document.getElementById("cartDrawerSubtotal");
  const totalEl = document.getElementById("cartDrawerTotal");
  const checkoutBtn = document.getElementById("cartDrawerCheckoutBtn");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 4rem 1rem;">
        <span style="font-size: 3.5rem; display:block; margin-bottom: 1rem;">🛍️</span>
        <h4 style="color:var(--secondary); font-size: 1.2rem; margin-bottom: 0.5rem;">سلة المشتريات فارغة</h4>
        <p style="color:var(--text-muted); font-size: 0.9rem;">تصفحي تشكيلة البيجامات والعطور وأضيفي ما يعجبك!</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = "0 د.ج";
    if (totalEl) totalEl.textContent = "0 د.ج";
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  if (subtotalEl) subtotalEl.textContent = `${subtotal.toLocaleString()} د.ج`;

  // Delivery fee calculation
  const wilayaSelect = document.getElementById("cartCheckoutWilaya");
  const selectedOption = wilayaSelect ? wilayaSelect.options[wilayaSelect.selectedIndex] : null;
  const deliveryFee = selectedOption && selectedOption.dataset.home ? Number(selectedOption.dataset.home) : 0;
  
  const deliveryFeeEl = document.getElementById("cartDrawerDeliveryFee");
  if (deliveryFeeEl) {
    deliveryFeeEl.textContent = deliveryFee > 0 ? `${deliveryFee.toLocaleString()} د.ج` : "حددي الولاية";
  }

  if (totalEl) totalEl.textContent = `${(subtotal + deliveryFee).toLocaleString()} د.ج`;

  container.innerHTML = cart.map(item => `
    <div class="cart-item-row">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img">
      <div>
        <h4 class="cart-item-title">${item.name}</h4>
        <div class="cart-item-meta">
          ${item.size ? `المقاس: ${item.size}` : ''} ${item.color ? `| اللون: ${item.color}` : ''}
        </div>
        <div class="cart-item-price">${(item.price * item.qty).toLocaleString()} د.ج</div>
      </div>
      <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem;">
        <div class="qty-control-box">
          <button type="button" class="qty-btn" onclick="updateCartItemQty('${item.cartKey}', ${item.qty - 1})">-</button>
          <span style="font-weight:700; min-width: 20px; text-align:center;">${item.qty}</span>
          <button type="button" class="qty-btn" onclick="updateCartItemQty('${item.cartKey}', ${item.qty + 1})">+</button>
        </div>
        <button type="button" style="background:transparent; color:#E74C3C; font-size:0.8rem; text-decoration:underline;" onclick="updateCartItemQty('${item.cartKey}', 0)">حذف</button>
      </div>
    </div>
  `).join("");
}

function updateCartItemQty(cartKey, qty) {
  db.updateCartQty(cartKey, qty);
  renderCartDrawer();
  updateCartUI();
}

async function handleCartCheckoutSubmit(e) {
  e.preventDefault();
  const cart = db.getCart();
  if (cart.length === 0) {
    showToast("سلتك فارغة!", "error");
    return;
  }

  const name = document.getElementById("cartCheckoutName").value.trim();
  const phone = document.getElementById("cartCheckoutPhone").value.trim();
  const wilayaSelect = document.getElementById("cartCheckoutWilaya");
  const wilayaCode = wilayaSelect.value;
  const wilayaName = wilayaSelect.options[wilayaSelect.selectedIndex]?.text || "";
  const commune = document.getElementById("cartCheckoutCommune").value.trim();
  const address = document.getElementById("cartCheckoutAddress")?.value.trim() || "";

  if (!name || !phone || !wilayaCode || !commune) {
    showToast("يرجى ملء جميع معلومات التوصيل المطلوبة", "error");
    return;
  }

  const deliveryFee = Number(wilayaSelect.options[wilayaSelect.selectedIndex]?.dataset.home || 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = subtotal + deliveryFee;

  const orderData = {
    customerName: name,
    customerPhone: phone,
    wilayaCode: Number(wilayaCode),
    wilayaName: wilayaName,
    commune: commune,
    address: address,
    items: cart,
    subtotal: subtotal,
    deliveryFee: deliveryFee,
    total: total,
    notes: ""
  };

  const order = await db.createOrder(orderData);
  closeCartDrawer();
  updateCartUI();
  showOrderSuccessModal(order);
}

function sendCartWhatsapp() {
  const cart = db.getCart();
  if (cart.length === 0) {
    showToast("سلتك فارغة!", "error");
    return;
  }

  const name = document.getElementById("cartCheckoutName")?.value.trim() || "زبونة وفية";
  const wilayaSelect = document.getElementById("cartCheckoutWilaya");
  const wilayaName = wilayaSelect ? wilayaSelect.options[wilayaSelect.selectedIndex]?.text : "";
  const commune = document.getElementById("cartCheckoutCommune")?.value.trim() || "";

  const settings = db.getSettings();
  const whatsappNum = (settings.whatsappNumber || "+213557857717").replace(/[^0-9]/g, "");

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const itemsText = cart.map(i => `• ${i.name} ${i.size ? `(مقاس ${i.size})` : ''} × ${i.qty} = ${i.price * i.qty} د.ج`).join("\n");

  const msg = encodeURIComponent(
    `مرحباً Souelle Pajamas 🎀\n` +
    `أريد تقديم طلب سلة المشتريات مباشرة:\n` +
    `• الاسم: ${name}\n` +
    (wilayaName ? `• الولاية: ${wilayaName}\n` : '') +
    (commune ? `• البلدية: ${commune}\n` : '') +
    `\nالمنتجات:\n${itemsText}\n\n` +
    `• المجموع: *${subtotal} د.ج* (بدون احتساب التوصيل)\n` +
    `يرجى تأكيد التوفر وقبول طلبي وشكراً!`
  );

  window.open(`https://wa.me/${whatsappNum}?text=${msg}`, "_blank");
}

// ==================== EVENT LISTENERS SETUP ====================
function setupEventListeners() {
  // Category Filter buttons
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      loadAndRenderProducts(currentFilter);
    });
  });

  // Search input
  const searchInput = document.getElementById("storeSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      loadAndRenderProducts(currentFilter, e.target.value);
    });
  }

  // Wilaya select change in quick order
  const quickOrderWilaya = document.getElementById("quickOrderWilaya");
  if (quickOrderWilaya) {
    quickOrderWilaya.addEventListener("change", calculateQuickOrderTotal);
  }

  // Wilaya select change in cart drawer
  const cartWilaya = document.getElementById("cartCheckoutWilaya");
  if (cartWilaya) {
    cartWilaya.addEventListener("change", renderCartDrawer);
  }

  // Listen to cart update events
  window.addEventListener("cart-updated", () => {
    updateCartUI();
  });
}

// Modal helper
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
}

// Toast helper
function showToast(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '⚠️' : '🎀'}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(-20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Expose globals for onclick attributes
window.openProductModal = openProductModal;
window.openQuickOrderModal = openQuickOrderModal;
window.quickAddToCart = quickAddToCart;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.closeModal = closeModal;
window.selectModalOption = selectModalOption;
window.adjustModalQty = adjustModalQty;
window.submitModalAddToCart = submitModalAddToCart;
window.sendProductWhatsapp = sendProductWhatsapp;
window.handleQuickOrderSubmit = handleQuickOrderSubmit;
window.handleCartCheckoutSubmit = handleCartCheckoutSubmit;
window.sendCartWhatsapp = sendCartWhatsapp;
window.updateCartItemQty = updateCartItemQty;
window.showToast = showToast;
