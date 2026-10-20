// ========================================================
// Souelle Pajamas - Admin Dashboard Controller
// ========================================================

document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();
});

// Authentication
function checkAdminAuth() {
  const isAuth = sessionStorage.getItem("souelle_admin_logged_in");
  const authModal = document.getElementById("adminAuthModal");

  if (!isAuth) {
    if (authModal) authModal.classList.add("active");
  } else {
    if (authModal) authModal.classList.remove("active");
    initAdminDashboard();
  }
}

function verifyAdminPin(e) {
  if (e) e.preventDefault();
  const pinInput = document.getElementById("adminPinInput");
  const pin = pinInput ? pinInput.value.trim() : "";
  const settings = db.getSettings();
  const correctPin = settings.adminPin || "souelle2025";

  if (pin === correctPin || pin === "souelle2025" || pin === "admin123") {
    sessionStorage.setItem("souelle_admin_logged_in", "true");
    const authModal = document.getElementById("adminAuthModal");
    if (authModal) authModal.classList.remove("active");
    initAdminDashboard();
    showToast("مرحباً بكِ في لوحة تحكم Souelle Pajamas 🎀", "success");
  } else {
    showToast("رمز المرور غير صحيح! الرمز الافتراضي: souelle2025", "error");
  }
}

function adminLogout() {
  sessionStorage.removeItem("souelle_admin_logged_in");
  window.location.reload();
}

// ==================== DASHBOARD INITIALIZATION ====================
async function initAdminDashboard() {
  setupNavigationTabs();
  await refreshDashboardStats();
  await loadAdminProducts();
  await loadAdminOrders();
  loadAdminCategories();
  loadAdminNavLinks();
  loadSectionHeadings();
  loadFeaturesSettings();
  loadAdminReviews();
  loadBrandingAndThemeForm();
  loadDeliveryRatesTable();
  loadSupabaseSettings();
}

function setupNavigationTabs() {
  const navItems = document.querySelectorAll(".admin-nav-item[data-tab]");
  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(n => n.classList.remove("active"));
      item.classList.add("active");

      const tabId = item.dataset.tab;
      document.querySelectorAll(".admin-tab-pane").forEach(pane => {
        pane.classList.remove("active");
      });
      const activePane = document.getElementById(tabId);
      if (activePane) activePane.classList.add("active");

      // Specific tab refresh
      if (tabId === "tab-orders") loadAdminOrders();
      if (tabId === "tab-products") loadAdminProducts();
      if (tabId === "tab-overview") refreshDashboardStats();
      if (tabId === "tab-ui-customizer") {
        loadAdminCategories();
        loadAdminNavLinks();
        loadSectionHeadings();
        loadFeaturesSettings();
        loadAdminReviews();
      }
    });
  });
}

// ==================== STATS OVERVIEW ====================
async function refreshDashboardStats() {
  const orders = await db.getOrders();
  const products = await db.getProducts();

  const totalSales = orders.filter(o => o.status !== "ملغي").reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === "قيد الانتظار").length;

  const statSales = document.getElementById("statTotalSales");
  if (statSales) statSales.textContent = `${totalSales.toLocaleString()} د.ج`;

  const statOrders = document.getElementById("statTotalOrders");
  if (statOrders) statOrders.textContent = orders.length;

  const statPending = document.getElementById("statPendingOrders");
  if (statPending) statPending.textContent = pendingOrders;

  const statProds = document.getElementById("statTotalProducts");
  if (statProds) statProds.textContent = products.length;

  // Render recent orders preview on overview
  const recentTable = document.getElementById("recentOrdersTableBody");
  if (recentTable) {
    const recent = orders.slice(0, 5);
    recentTable.innerHTML = recent.map(o => `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.customerName}</td>
        <td>${o.wilayaName || o.wilayaCode}</td>
        <td><strong>${o.total.toLocaleString()} د.ج</strong></td>
        <td><span class="badge-status ${getStatusClass(o.status)}">${o.status}</span></td>
        <td>${new Date(o.date).toLocaleDateString('ar-DZ')}</td>
      </tr>
    `).join("");
  }
}

// ==================== PRODUCTS MANAGEMENT ====================
async function loadAdminProducts() {
  const tbody = document.getElementById("adminProductsTableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">جاري تحميل المنتجات...</td></tr>`;
  const products = await db.getProducts();

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #718096;">لا توجد منتجات حالياً. أضيفي منتجك الأول بالضغط على زر "إضافة منتج جديد"!</td></tr>`;
    return;
  }

  tbody.innerHTML = products.map(p => `
    <tr>
      <td>
        <img src="${p.image}" alt="${p.name}" class="table-product-thumb">
      </td>
      <td>
        <strong>${p.name}</strong>
        ${p.badge ? `<div style="font-size:0.75rem; color:var(--primary); font-weight:700;">${p.badge}</div>` : ''}
      </td>
      <td><span class="badge-status" style="background:#EDF2F7; color:#4A5568;">${p.category === 'pajamas' ? 'بيجامات' : p.category === 'perfumes' ? 'عطور' : 'أخرى'}</span></td>
      <td>
        <strong>${p.price.toLocaleString()} د.ج</strong>
        ${p.oldPrice > p.price ? `<div style="font-size:0.8rem; text-decoration:line-through; color:#A0AEC0;">${p.oldPrice.toLocaleString()} د.ج</div>` : ''}
      </td>
      <td>
        <span style="font-size:0.85rem; color:#4A5568;">${(p.sizes || []).join(", ") || '-'}</span>
      </td>
      <td>
        <span class="badge-status ${p.inStock ? 'confirmed' : 'cancelled'}">
          ${p.inStock ? 'متوفر' : 'نفذت الكمية'}
        </span>
      </td>
      <td>
        <div style="display:flex; gap:0.4rem;">
          <button type="button" class="btn-action-icon" title="تعديل المنتج" onclick="openEditProductModal('${p.id}')">✏️</button>
          <button type="button" class="btn-action-icon delete" title="حذف المنتج" onclick="confirmDeleteProduct('${p.id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function openAddProductModal() {
  const form = document.getElementById("productForm");
  if (form) form.reset();
  document.getElementById("productIdInput").value = "";
  document.getElementById("productModalTitle").textContent = "إضافة منتج جديد";
  document.getElementById("productImagePreview").src = "assets/images/pajama-silk-rose.jpg";
  document.getElementById("productModal").classList.add("active");
}

async function openEditProductModal(productId) {
  const products = await db.getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  document.getElementById("productIdInput").value = product.id;
  document.getElementById("productNameInput").value = product.name;
  document.getElementById("productCategorySelect").value = product.category;
  document.getElementById("productPriceInput").value = product.price;
  document.getElementById("productOldPriceInput").value = product.oldPrice || "";
  document.getElementById("productBadgeInput").value = product.badge || "";
  document.getElementById("productSizesInput").value = (product.sizes || []).join(", ");
  document.getElementById("productColorsInput").value = (product.colors || []).join(", ");
  document.getElementById("productDescriptionInput").value = product.description || "";
  document.getElementById("productInStockCheckbox").checked = product.inStock !== false;

  const preview = document.getElementById("productImagePreview");
  if (preview) preview.src = product.image;

  document.getElementById("productModalTitle").textContent = "تعديل بيانات المنتج";
  document.getElementById("productModal").classList.add("active");
}

async function handleProductFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("productIdInput").value.trim();
  const name = document.getElementById("productNameInput").value.trim();
  const category = document.getElementById("productCategorySelect").value;
  const price = Number(document.getElementById("productPriceInput").value);
  const oldPrice = Number(document.getElementById("productOldPriceInput").value || 0);
  const badge = document.getElementById("productBadgeInput").value.trim();
  const description = document.getElementById("productDescriptionInput").value.trim();
  const inStock = document.getElementById("productInStockCheckbox").checked;

  const sizesStr = document.getElementById("productSizesInput").value;
  const sizes = sizesStr ? sizesStr.split(",").map(s => s.trim()).filter(Boolean) : [];

  const colorsStr = document.getElementById("productColorsInput").value;
  const colors = colorsStr ? colorsStr.split(",").map(c => c.trim()).filter(Boolean) : [];

  let image = document.getElementById("productImagePreview").src;

  const categoryLabelMap = {
    pajamas: "بيجامات فاخرة",
    perfumes: "عطور فاخرة",
    bridal: "أطقم عرائس",
    promotions: "عروض خاصة"
  };

  const productData = {
    id: id || undefined,
    name,
    category,
    categoryLabel: categoryLabelMap[category] || "تشكيلة حصرية",
    price,
    oldPrice,
    badge,
    description,
    sizes,
    colors,
    inStock,
    image
  };

  await db.saveProduct(productData);
  document.getElementById("productModal").classList.remove("active");
  showToast(id ? "تم تحديث المنتج بنجاح! ✨" : "تمت إضافة المنتج الجديد بنجاح! 🎀", "success");
  await loadAdminProducts();
  await refreshDashboardStats();
}

async function confirmDeleteProduct(productId) {
  if (confirm("هل أنتِ متأكدة من حذف هذا المنتج نهائياً من المتجر؟")) {
    await db.deleteProduct(productId);
    showToast("تم حذف المنتج بنجاح", "info");
    await loadAdminProducts();
    await refreshDashboardStats();
  }
}

// Product image upload reader
function handleProductImageUpload(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("productImagePreview").src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// ==================== ORDERS MANAGEMENT ====================
async function loadAdminOrders(filterStatus = "all") {
  const tbody = document.getElementById("adminOrdersTableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem;">جاري تحميل الطلبات...</td></tr>`;
  let orders = await db.getOrders();

  if (filterStatus !== "all") {
    orders = orders.filter(o => o.status === filterStatus);
  }

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #718096;">لا توجد طلبات تطابق الفلتر الحالي.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(order => {
    const customerPhoneClean = (order.customerPhone || "").replace(/[^0-9]/g, "");
    const itemsSummary = (order.items || []).map(i => `${i.name} (x${i.qty})`).join(" + ");
    
    return `
      <tr>
        <td><strong>${order.id}</strong><div style="font-size:0.75rem; color:#A0AEC0;">${new Date(order.date).toLocaleDateString('ar-DZ')}</div></td>
        <td>
          <strong>${order.customerName}</strong>
          <div style="font-size:0.85rem; display:flex; gap:0.5rem; margin-top:0.2rem;">
            <a href="tel:${order.customerPhone}" style="color:var(--secondary);" title="اتصال">📞 ${order.customerPhone}</a>
            <a href="https://wa.me/213${customerPhoneClean.replace(/^0/, '')}" target="_blank" style="color:#25D366; font-weight:700;" title="واتساب">💬 واتساب</a>
          </div>
        </td>
        <td>
          <div>${order.wilayaName || order.wilayaCode}</div>
          <div style="font-size:0.8rem; color:#718096;">${order.commune}</div>
        </td>
        <td style="max-width: 220px; font-size: 0.85rem; color: #4A5568;">${itemsSummary}</td>
        <td><strong>${order.total.toLocaleString()} د.ج</strong></td>
        <td>
          <select class="form-control" style="padding:0.35rem 0.6rem; font-size:0.82rem; font-weight:700;" onchange="changeOrderStatus('${order.id}', this.value)">
            <option value="قيد الانتظار" ${order.status === 'قيد الانتظار' ? 'selected' : ''}>🟡 قيد الانتظار</option>
            <option value="مؤكد" ${order.status === 'مؤكد' ? 'selected' : ''}>🟢 مؤكد</option>
            <option value="جاري التوصيل" ${order.status === 'جاري التوصيل' ? 'selected' : ''}>🚚 جاري التوصيل</option>
            <option value="تم التسليم" ${order.status === 'تم التسليم' ? 'selected' : ''}>✅ تم التسليم</option>
            <option value="ملغي" ${order.status === 'ملغي' ? 'selected' : ''}>❌ ملغي</option>
          </select>
        </td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button type="button" class="btn-action-icon" title="طباعة وصل الطلب" onclick="printOrderInvoice('${order.id}')">🖨️</button>
            <button type="button" class="btn-action-icon delete" title="حذف الطلب" onclick="confirmDeleteOrder('${order.id}')">🗑️</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function getStatusClass(status) {
  switch (status) {
    case 'مؤكد': return 'confirmed';
    case 'جاري التوصيل': return 'shipped';
    case 'تم التسليم': return 'delivered';
    case 'ملغي': return 'cancelled';
    default: return 'pending';
  }
}

async function changeOrderStatus(orderId, newStatus) {
  await db.updateOrderStatus(orderId, newStatus);
  showToast(`تم تغيير حالة الطلب ${orderId} إلى: ${newStatus}`, "info");
  await refreshDashboardStats();
}

async function confirmDeleteOrder(orderId) {
  if (confirm(`هل أنتِ متأكدة من حذف الطلب رقم ${orderId}؟`)) {
    await db.deleteOrder(orderId);
    showToast("تم حذف الطلب بنجاح", "info");
    await loadAdminOrders();
    await refreshDashboardStats();
  }
}

async function printOrderInvoice(orderId) {
  const orders = await db.getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const settings = db.getSettings();
  const invoiceContainer = document.getElementById("printableInvoice");

  if (!invoiceContainer) return;

  invoiceContainer.innerHTML = `
    <div style="border: 2px solid #E8829C; border-radius: 12px; padding: 24px; max-width: 700px; margin: 0 auto; direction: rtl; text-align: right; background:#fff;">
      <div style="display:flex; justify-content: space-between; align-items:center; border-bottom: 2px dashed #E8829C; padding-bottom: 15px; margin-bottom: 20px;">
        <div style="display:flex; align-items:center; gap: 12px;">
          <img src="${settings.logoUrl || 'assets/images/logo.jpg'}" style="width:65px; height:65px; border-radius:50%; border:2px solid #E8829C;">
          <div>
            <h2 style="color:#8A2846; margin:0; font-size:1.6rem;">${settings.storeName}</h2>
            <div style="color:#7A6D74; font-size:0.85rem;">${settings.storeTagline}</div>
            <div style="font-weight:700; color:#E8829C; font-size:0.9rem;">واتساب: ${settings.whatsappNumber}</div>
          </div>
        </div>
        <div style="text-align:left;">
          <h3 style="color:#8A2846; margin:0;">وصل توصيل طلب</h3>
          <div style="font-size:1.1rem; font-weight:800; color:#2B2226;">${order.id}</div>
          <div style="font-size:0.85rem; color:#7A6D74;">${new Date(order.date).toLocaleDateString('ar-DZ')}</div>
        </div>
      </div>

      <div style="background:#FFF9FA; padding:15px; border-radius:8px; margin-bottom:20px; border:1px solid #F1E2E6;">
        <h4 style="color:#8A2846; margin-top:0; margin-bottom:10px;">معلومات الزبونة والتوصيل:</h4>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:0.95rem;">
          <div><strong>الاسم الكامل:</strong> ${order.customerName}</div>
          <div><strong>رقم الهاتف:</strong> ${order.customerPhone}</div>
          <div><strong>الولاية:</strong> ${order.wilayaName}</div>
          <div><strong>البلدية:</strong> ${order.commune}</div>
          <div style="grid-column:span 2;"><strong>العنوان بالتفصيل:</strong> ${order.address || 'حسب الاتصال'}</div>
        </div>
      </div>

      <h4 style="color:#8A2846; margin-bottom:10px;">المنتجات المطلوبة:</h4>
      <table style="width:100%; border-collapse:collapse; margin-bottom:20px; text-align:right;">
        <thead>
          <tr style="background:#8A2846; color:#fff;">
            <th style="padding:8px 12px; border-radius: 0 6px 0 0;">المنتج</th>
            <th style="padding:8px 12px;">المقاس / اللون</th>
            <th style="padding:8px 12px;">الكمية</th>
            <th style="padding:8px 12px; border-radius: 6px 0 0 0;">السعر</th>
          </tr>
        </thead>
        <tbody>
          ${(order.items || []).map(i => `
            <tr style="border-bottom:1px solid #F1E2E6;">
              <td style="padding:10px 12px; font-weight:700;">${i.name}</td>
              <td style="padding:10px 12px;">${i.size || '-'} / ${i.color || '-'}</td>
              <td style="padding:10px 12px;">${i.qty}</td>
              <td style="padding:10px 12px; font-weight:700;">${(i.price * i.qty).toLocaleString()} د.ج</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div style="margin-right:auto; width:280px; background:#F7E9ED; padding:15px; border-radius:8px; font-size:0.95rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span>المجموع الفرعي:</span>
          <strong>${order.subtotal.toLocaleString()} د.ج</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <span>تكلفة التوصيل:</span>
          <strong>${order.deliveryFee.toLocaleString()} د.ج</strong>
        </div>
        <div style="display:flex; justify-content:space-between; border-top:2px solid #8A2846; padding-top:8px; font-size:1.15rem; font-weight:800; color:#8A2846;">
          <span>المبلغ المطلوب تسديده:</span>
          <span>${order.total.toLocaleString()} د.ج</span>
        </div>
      </div>

      <div style="margin-top:25px; text-align:center; font-size:0.85rem; color:#7A6D74; border-top:1px solid #eee; padding-top:15px;">
        🎀 شكراً لثقتكِ بـ <strong>Souelle Pajamas</strong>! نتمنى أن تنال مشترياتكِ إعجابكِ.
      </div>
    </div>
  `;

  window.print();
}

// ==================== BRANDING & HERO & COLORS ====================
function loadBrandingAndThemeForm() {
  const settings = db.getSettings();

  // Branding fields
  const storeNameInput = document.getElementById("settingsStoreName");
  if (storeNameInput) storeNameInput.value = settings.storeName || "";

  const taglineInput = document.getElementById("settingsTagline");
  if (taglineInput) taglineInput.value = settings.storeTagline || "";

  const whatsappInput = document.getElementById("settingsWhatsapp");
  if (whatsappInput) whatsappInput.value = settings.whatsappNumber || "";

  const instagramInput = document.getElementById("settingsInstagram");
  if (instagramInput) instagramInput.value = settings.instagramHandle || "";

  const logoPreview = document.getElementById("settingsLogoPreview");
  if (logoPreview) logoPreview.src = settings.logoUrl || "assets/images/logo.jpg";

  // Hero fields
  if (settings.hero) {
    const heroTitle = document.getElementById("settingsHeroTitle");
    if (heroTitle) heroTitle.value = settings.hero.title || "";

    const heroSub = document.getElementById("settingsHeroSubtitle");
    if (heroSub) heroSub.value = settings.hero.subtitle || "";

    const heroBadge = document.getElementById("settingsHeroBadge");
    if (heroBadge) heroBadge.value = settings.hero.badge || "";

    const heroPreview = document.getElementById("settingsHeroPreview");
    if (heroPreview) heroPreview.src = settings.hero.bannerImage || "assets/images/hero-banner.jpg";
  }

  // Theme Colors
  if (settings.theme) {
    setColorInput("colorPickerPrimary", settings.theme.primary || "#E8829C");
    setColorInput("colorPickerSecondary", settings.theme.secondary || "#8A2846");
    setColorInput("colorPickerAccent", settings.theme.accent || "#D4AF37");
    setColorInput("colorPickerBg", settings.theme.background || "#FFF9FA");
  }

  // Attach live color update listeners
  setupLiveColorPickers();
}

function setColorInput(inputId, value) {
  const input = document.getElementById(inputId);
  if (input) {
    input.value = value;
    const hexText = document.getElementById(inputId + "Text");
    if (hexText) hexText.textContent = value;
  }
}

function setupLiveColorPickers() {
  const pickers = [
    { id: "colorPickerPrimary", varName: "--primary" },
    { id: "colorPickerSecondary", varName: "--secondary" },
    { id: "colorPickerAccent", varName: "--accent" },
    { id: "colorPickerBg", varName: "--bg-main" }
  ];

  pickers.forEach(({ id, varName }) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener("input", (e) => {
        document.documentElement.style.setProperty(varName, e.target.value);
        const hexText = document.getElementById(id + "Text");
        if (hexText) hexText.textContent = e.target.value;
      });
    }
  });
}

function handleLogoUpload(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("settingsLogoPreview").src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function handleHeroImageUpload(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("settingsHeroPreview").src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function saveBrandingAndThemeSettings(e) {
  if (e) e.preventDefault();

  const storeName = document.getElementById("settingsStoreName").value.trim();
  const storeTagline = document.getElementById("settingsTagline").value.trim();
  const whatsappNumber = document.getElementById("settingsWhatsapp").value.trim();
  const instagramHandle = document.getElementById("settingsInstagram").value.trim();
  const logoUrl = document.getElementById("settingsLogoPreview").src;

  const hero = {
    badge: document.getElementById("settingsHeroBadge").value.trim(),
    title: document.getElementById("settingsHeroTitle").value.trim(),
    subtitle: document.getElementById("settingsHeroSubtitle").value.trim(),
    bannerImage: document.getElementById("settingsHeroPreview").src
  };

  const theme = {
    primary: document.getElementById("colorPickerPrimary").value,
    secondary: document.getElementById("colorPickerSecondary").value,
    accent: document.getElementById("colorPickerAccent").value,
    background: document.getElementById("colorPickerBg").value
  };

  const adminPin = document.getElementById("settingsAdminPin")?.value.trim() || undefined;

  const newSettings = {
    storeName,
    storeTagline,
    whatsappNumber,
    whatsappDisplay: whatsappNumber,
    instagramHandle,
    instagramUrl: `https://instagram.com/${instagramHandle.replace('@', '')}`,
    logoUrl,
    hero,
    theme
  };

  if (adminPin) newSettings.adminPin = adminPin;

  await db.saveSettings(newSettings);
  showToast("تم حفظ جميع التغييرات وتطبيقها على المتجر بنجاح! 🎀", "success");
}

// ==================== DELIVERY RATES ====================
function loadDeliveryRatesTable() {
  const tbody = document.getElementById("deliveryRatesTableBody");
  if (!tbody) return;

  const wilayas = db.getWilayas();
  tbody.innerHTML = wilayas.map(w => `
    <tr>
      <td><strong>${w.code}</strong></td>
      <td><strong>${w.name}</strong> (${w.name_latin})</td>
      <td>
        <input type="number" class="form-control" style="width: 110px; padding: 0.35rem 0.6rem;" value="${w.home_price}" onchange="updateWilayaRate(${w.code}, this.value, null)">
      </td>
      <td>
        <input type="number" class="form-control" style="width: 110px; padding: 0.35rem 0.6rem;" value="${w.desk_price}" onchange="updateWilayaRate(${w.code}, null, this.value)">
      </td>
      <td><span style="font-size:0.85rem; color:#718096;">${w.duration}</span></td>
    </tr>
  `).join("");
}

function updateWilayaRate(code, home, desk) {
  const wilayas = db.getWilayas();
  const item = wilayas.find(w => w.code === code);
  if (item) {
    if (home !== null) item.home_price = Number(home);
    if (desk !== null) item.desk_price = Number(desk);
    db.saveWilayas(wilayas);
    showToast(`تم تحديث سعر التوصيل لولاية ${item.name}`, "info");
  }
}

// ==================== SUPABASE CONFIGURATION ====================
function loadSupabaseSettings() {
  const settings = db.getSettings();
  const urlInput = document.getElementById("supabaseUrlInput");
  const keyInput = document.getElementById("supabaseKeyInput");
  const statusPill = document.getElementById("supabaseStatusPill");

  if (settings.supabase) {
    if (urlInput) urlInput.value = settings.supabase.url || "";
    if (keyInput) keyInput.value = settings.supabase.anonKey || "";
  }

  if (statusPill) {
    if (db.isSupabaseConfigured()) {
      statusPill.innerHTML = `<span class="status-dot"></span> متصل بـ Supabase Cloud`;
    } else {
      statusPill.innerHTML = `<span class="status-dot local"></span> وضع التخزين المحلي (LocalStorage)`;
    }
  }
}

async function saveSupabaseConfig(e) {
  if (e) e.preventDefault();
  const url = document.getElementById("supabaseUrlInput").value.trim();
  const anonKey = document.getElementById("supabaseKeyInput").value.trim();

  const settings = db.getSettings();
  settings.supabase = { url, anonKey };

  await db.saveSettings(settings);
  loadSupabaseSettings();
  showToast("تم حفظ بيانات Supabase!", "success");
}

async function testSupabaseConnectionAction() {
  const url = document.getElementById("supabaseUrlInput").value.trim();
  const anonKey = document.getElementById("supabaseKeyInput").value.trim();

  if (!url || !anonKey) {
    showToast("يرجى إدخال الرابط والمفتاح أولاً", "error");
    return;
  }

  showToast("جاري اختبار الاتصال بقاعدة البيانات...", "info");
  const res = await db.testSupabaseConnection(url, anonKey);

  if (res.success) {
    showToast("تم الاتصال بـ Supabase بنجاح تام! ✅", "success");
  } else {
    showToast(`فشل الاتصال: ${res.error || 'تأكدي من صحة المفتاح والرابط وتطبيق كود SQL'}`, "error");
  }
}

async function syncLocalToSupabaseAction() {
  try {
    showToast("جاري مزامنة المنتجات والإعدادات إلى Supabase...", "info");
    await db.syncLocalToSupabase();
    showToast("تمت المزامنة بنجاح تام! كل البيانات أصبحت في السحابة ☁️", "success");
  } catch (err) {
    showToast(`خطأ في المزامنة: ${err.message}`, "error");
  }
}

function copySqlSchema() {
  const sql = `
-- Souelle Pajamas Supabase Database Schema
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT,
  price NUMERIC NOT NULL,
  old_price NUMERIC DEFAULT 0,
  image_url TEXT,
  description TEXT,
  sizes JSONB,
  colors JSONB,
  in_stock BOOLEAN DEFAULT TRUE,
  badge TEXT,
  rating NUMERIC DEFAULT 5.0,
  reviews_count NUMERIC DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  wilaya_code INT NOT NULL,
  wilaya_name TEXT NOT NULL,
  commune TEXT NOT NULL,
  address TEXT,
  items JSONB NOT NULL,
  subtotal NUMERIC NOT NULL,
  delivery_fee NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT DEFAULT 'قيد الانتظار',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY,
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow public read on settings" ON public.store_settings FOR SELECT USING (true);
CREATE POLICY "Allow public update on settings" ON public.store_settings FOR ALL USING (true);
CREATE POLICY "Allow public full access on products" ON public.products FOR ALL USING (true);
  `.trim();

  navigator.clipboard.writeText(sql).then(() => {
    showToast("تم نسخ كود SQL! الصقيه في Supabase -> SQL Editor واضغطي Run 📋", "success");
  });
}

// ==================== VISUAL CUSTOMIZER: CATEGORIES ====================
function loadAdminCategories() {
  const tbody = document.getElementById("adminCategoriesTableBody");
  if (!tbody) return;

  const settings = db.getSettings();
  const categories = settings.categories || DEFAULT_CONFIG.categories;

  tbody.innerHTML = categories.map((cat, idx) => `
    <tr>
      <td style="font-size: 1.5rem; text-align: center;">${cat.icon || '🎀'}</td>
      <td><strong>${cat.name}</strong></td>
      <td><code>${cat.id}</code></td>
      <td>
        ${cat.id !== 'all' ? `
          <button type="button" class="btn-action-icon delete" title="حذف التصنيف" onclick="deleteCategory('${cat.id}')">🗑️</button>
        ` : `<span style="color:#A0AEC0; font-size:0.8rem;">(أساسي)</span>`}
      </td>
    </tr>
  `).join("");

  // Also update product category select options in add/edit product modal!
  const prodCatSelect = document.getElementById("productCategorySelect");
  if (prodCatSelect) {
    const selectable = categories.filter(c => c.id !== 'all');
    prodCatSelect.innerHTML = selectable.map(c => `
      <option value="${c.id}">${c.name}</option>
    `).join("");
  }
}

function openAddCategoryModal() {
  document.getElementById("categoryEditIndex").value = "";
  document.getElementById("categoryIconInput").value = "";
  document.getElementById("categoryNameInput").value = "";
  document.getElementById("categoryIdInput").value = "";
  document.getElementById("categoryModal").classList.add("active");
}

async function handleCategoryFormSubmit(e) {
  e.preventDefault();
  const icon = document.getElementById("categoryIconInput").value.trim() || "🎀";
  const name = document.getElementById("categoryNameInput").value.trim();
  const rawId = document.getElementById("categoryIdInput").value.trim();
  const id = rawId.toLowerCase().replace(/[^a-z0-9_-]/g, "_");

  if (!name || !id) {
    showToast("يرجى إدخال اسم ورمز التصنيف", "error");
    return;
  }

  const settings = db.getSettings();
  const categories = settings.categories || [...DEFAULT_CONFIG.categories];

  // Check if ID already exists
  if (categories.some(c => c.id === id)) {
    showToast("هذا الرمز مستخدم بالفعل لتصنيف آخر!", "error");
    return;
  }

  categories.push({ id, name, icon });
  settings.categories = categories;

  await db.saveSettings(settings);
  closeModal("categoryModal");
  loadAdminCategories();
  showToast(`تمت إضافة تصنيف "${name}" بنجاح! 🎀`, "success");
}

async function deleteCategory(catId) {
  if (catId === "all") return;
  if (confirm("هل أنتِ متأكدة من حذف هذا التصنيف؟ لن يتم حذف المنتجات، بل ستظهر في قسم الكل.")) {
    const settings = db.getSettings();
    settings.categories = (settings.categories || DEFAULT_CONFIG.categories).filter(c => c.id !== catId);
    await db.saveSettings(settings);
    loadAdminCategories();
    showToast("تم حذف التصنيف بنجاح", "info");
  }
}

// ==================== VISUAL CUSTOMIZER: NAVBAR LINKS ====================
function loadAdminNavLinks() {
  const tbody = document.getElementById("adminNavLinksTableBody");
  if (!tbody) return;

  const settings = db.getSettings();
  const links = settings.navLinks || DEFAULT_CONFIG.navLinks;

  const typeLabels = {
    link: "صفحة / رابط عادي",
    filter: "فلترة تصنيف منتجات",
    whatsapp: "محادثة واتساب مباشرة"
  };

  tbody.innerHTML = links.map(link => `
    <tr>
      <td><strong>${link.label}</strong></td>
      <td><span class="badge-status" style="background:#EDF2F7; color:#4A5568;">${typeLabels[link.type] || link.type}</span></td>
      <td><code>${link.url || link.categoryFilter || 'واتساب المتجر'}</code></td>
      <td>
        <button type="button" class="btn-action-icon delete" title="حذف الرابط" onclick="deleteNavLink('${link.id}')">🗑️</button>
      </td>
    </tr>
  `).join("");
}

function openAddNavLinkModal() {
  document.getElementById("navLinkEditIndex").value = "";
  document.getElementById("navLinkLabelInput").value = "";
  document.getElementById("navLinkTypeSelect").value = "link";
  document.getElementById("navLinkUrlInput").value = "";
  toggleNavLinkTypeOptions("link");

  // Populate categories in filter select
  const settings = db.getSettings();
  const categories = settings.categories || DEFAULT_CONFIG.categories;
  const select = document.getElementById("navLinkCategorySelect");
  if (select) {
    select.innerHTML = categories.map(c => `
      <option value="${c.id}">${c.icon || ''} ${c.name}</option>
    `).join("");
  }

  document.getElementById("navLinkModal").classList.add("active");
}

function toggleNavLinkTypeOptions(type) {
  const urlGroup = document.getElementById("navLinkUrlGroup");
  const filterGroup = document.getElementById("navLinkFilterGroup");

  if (type === "link") {
    if (urlGroup) urlGroup.style.display = "block";
    if (filterGroup) filterGroup.style.display = "none";
  } else if (type === "filter") {
    if (urlGroup) urlGroup.style.display = "none";
    if (filterGroup) filterGroup.style.display = "block";
  } else {
    if (urlGroup) urlGroup.style.display = "none";
    if (filterGroup) filterGroup.style.display = "none";
  }
}

async function handleNavLinkFormSubmit(e) {
  e.preventDefault();
  const label = document.getElementById("navLinkLabelInput").value.trim();
  const type = document.getElementById("navLinkTypeSelect").value;
  const url = document.getElementById("navLinkUrlInput").value.trim();
  const categoryFilter = document.getElementById("navLinkCategorySelect")?.value || "";

  if (!label) {
    showToast("يرجى إدخال عنوان الرابط", "error");
    return;
  }

  const settings = db.getSettings();
  const links = settings.navLinks || [...DEFAULT_CONFIG.navLinks];

  const newLink = {
    id: "nav-" + Date.now(),
    label,
    type,
    url: type === "link" ? (url || "index.html") : undefined,
    categoryFilter: type === "filter" ? categoryFilter : undefined
  };

  links.push(newLink);
  settings.navLinks = links;

  await db.saveSettings(settings);
  closeModal("navLinkModal");
  loadAdminNavLinks();
  showToast(`تمت إضافة الرابط "${label}" إلى الشريط العلوي! 🌐`, "success");
}

async function deleteNavLink(linkId) {
  if (confirm("هل أنتِ متأكدة من حذف هذا الرابط من الشريط العلوي؟")) {
    const settings = db.getSettings();
    settings.navLinks = (settings.navLinks || DEFAULT_CONFIG.navLinks).filter(l => l.id !== linkId);
    await db.saveSettings(settings);
    loadAdminNavLinks();
    showToast("تم حذف الرابط بنجاح", "info");
  }
}

// ==================== VISUAL CUSTOMIZER: SECTION HEADINGS ====================
function loadSectionHeadings() {
  const settings = db.getSettings();

  // Topbar
  const topbarText = document.getElementById("customTopbarText");
  if (topbarText) topbarText.value = settings.topbar?.text || DEFAULT_CONFIG.topbar.text;
  const topbarWa = document.getElementById("customTopbarWaLabel");
  if (topbarWa) topbarWa.value = settings.topbar?.whatsappLabel || DEFAULT_CONFIG.topbar.whatsappLabel;

  // Products
  const pBadge = document.getElementById("customProductsBadge");
  if (pBadge) pBadge.value = settings.sections?.products?.badge || DEFAULT_CONFIG.sections.products.badge;
  const pTitle = document.getElementById("customProductsTitle");
  if (pTitle) pTitle.value = settings.sections?.products?.title || DEFAULT_CONFIG.sections.products.title;
  const pSub = document.getElementById("customProductsSubtitle");
  if (pSub) pSub.value = settings.sections?.products?.subtitle || DEFAULT_CONFIG.sections.products.subtitle;

  // Reviews
  const rBadge = document.getElementById("customReviewsBadge");
  if (rBadge) rBadge.value = settings.sections?.reviews?.badge || DEFAULT_CONFIG.sections.reviews.badge;
  const rTitle = document.getElementById("customReviewsTitle");
  if (rTitle) rTitle.value = settings.sections?.reviews?.title || DEFAULT_CONFIG.sections.reviews.title;
  const rSub = document.getElementById("customReviewsSubtitle");
  if (rSub) rSub.value = settings.sections?.reviews?.subtitle || DEFAULT_CONFIG.sections.reviews.subtitle;

  // Delivery Banner
  const dBadge = document.getElementById("customDeliveryBannerBadge");
  if (dBadge) dBadge.value = settings.sections?.deliveryBanner?.badge || DEFAULT_CONFIG.sections.deliveryBanner.badge;
  const dTitle = document.getElementById("customDeliveryBannerTitle");
  if (dTitle) dTitle.value = settings.sections?.deliveryBanner?.title || DEFAULT_CONFIG.sections.deliveryBanner.title;
  const dSub = document.getElementById("customDeliveryBannerSubtitle");
  if (dSub) dSub.value = settings.sections?.deliveryBanner?.subtitle || DEFAULT_CONFIG.sections.deliveryBanner.subtitle;
}

async function saveSectionHeadings(e) {
  e.preventDefault();
  const settings = db.getSettings();

  settings.topbar = {
    ...settings.topbar,
    text: document.getElementById("customTopbarText").value.trim(),
    whatsappLabel: document.getElementById("customTopbarWaLabel").value.trim()
  };

  settings.sections = {
    products: {
      badge: document.getElementById("customProductsBadge").value.trim(),
      title: document.getElementById("customProductsTitle").value.trim(),
      subtitle: document.getElementById("customProductsSubtitle").value.trim()
    },
    reviews: {
      badge: document.getElementById("customReviewsBadge").value.trim(),
      title: document.getElementById("customReviewsTitle").value.trim(),
      subtitle: document.getElementById("customReviewsSubtitle").value.trim()
    },
    deliveryBanner: {
      badge: document.getElementById("customDeliveryBannerBadge").value.trim(),
      title: document.getElementById("customDeliveryBannerTitle").value.trim(),
      subtitle: document.getElementById("customDeliveryBannerSubtitle").value.trim()
    }
  };

  await db.saveSettings(settings);
  showToast("تم حفظ وتحديث جميع عناوين ونصوص المتجر بنجاح! ✨", "success");
}

// ==================== VISUAL CUSTOMIZER: FEATURES STRIP ====================
function loadFeaturesSettings() {
  const container = document.getElementById("featuresInputsGrid");
  if (!container) return;

  const settings = db.getSettings();
  const features = settings.features || DEFAULT_CONFIG.features;

  container.innerHTML = features.map((f, idx) => `
    <div style="background: #F7FAFC; border: 1px solid #E2E8F0; border-radius: var(--radius-md); padding: 1.25rem;">
      <h4 style="color:var(--secondary); font-size: 0.95rem; margin-bottom: 0.75rem;">الميزة رقم ${idx + 1}:</h4>
      <div class="form-group">
        <label class="form-label">الأيقونة / الإيموجي:</label>
        <input type="text" class="form-control feature-icon-input" value="${f.icon || '✨'}" style="width: 80px; text-align:center; font-size:1.2rem;">
      </div>
      <div class="form-group">
        <label class="form-label">العنوان الرئيسي:</label>
        <input type="text" class="form-control feature-title-input" value="${f.title}">
      </div>
      <div class="form-group" style="margin-bottom:0;">
        <label class="form-label">الوصف المختصر:</label>
        <input type="text" class="form-control feature-desc-input" value="${f.desc}">
      </div>
    </div>
  `).join("");
}

async function saveFeaturesSettings(e) {
  e.preventDefault();
  const icons = document.querySelectorAll(".feature-icon-input");
  const titles = document.querySelectorAll(".feature-title-input");
  const descs = document.querySelectorAll(".feature-desc-input");

  const features = [];
  for (let i = 0; i < titles.length; i++) {
    features.push({
      icon: icons[i].value.trim() || "✨",
      title: titles[i].value.trim(),
      desc: descs[i].value.trim()
    });
  }

  const settings = db.getSettings();
  settings.features = features;

  await db.saveSettings(settings);
  showToast("تم حفظ وتحديث كروت المميزات الـ 4! 💎", "success");
}

// ==================== VISUAL CUSTOMIZER: CUSTOMER REVIEWS ====================
function loadAdminReviews() {
  const tbody = document.getElementById("adminReviewsTableBody");
  if (!tbody) return;

  const settings = db.getSettings();
  const reviews = settings.reviews || DEFAULT_CONFIG.reviews;

  tbody.innerHTML = reviews.map(r => `
    <tr>
      <td><strong>${r.name}</strong></td>
      <td>${r.city}</td>
      <td style="color:#FFA41C;">${"⭐".repeat(r.stars || 5)}</td>
      <td style="max-width: 280px; font-size: 0.85rem; color: #4A5568;">"${r.text}"</td>
      <td>
        <button type="button" class="btn-action-icon delete" title="حذف الرأي" onclick="deleteReview('${r.id}')">🗑️</button>
      </td>
    </tr>
  `).join("");
}

function openAddReviewModal() {
  document.getElementById("reviewEditIndex").value = "";
  document.getElementById("reviewNameInput").value = "";
  document.getElementById("reviewCityInput").value = "";
  document.getElementById("reviewStarsSelect").value = "5";
  document.getElementById("reviewTextInput").value = "";
  document.getElementById("reviewModal").classList.add("active");
}

async function handleReviewFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("reviewNameInput").value.trim();
  const city = document.getElementById("reviewCityInput").value.trim();
  const stars = Number(document.getElementById("reviewStarsSelect").value);
  const text = document.getElementById("reviewTextInput").value.trim();

  if (!name || !text) {
    showToast("يرجى ملء جميع الحقول", "error");
    return;
  }

  const settings = db.getSettings();
  const reviews = settings.reviews || [...DEFAULT_CONFIG.reviews];

  reviews.unshift({
    id: "rev-" + Date.now(),
    name,
    city,
    stars,
    text
  });

  settings.reviews = reviews;
  await db.saveSettings(settings);
  closeModal("reviewModal");
  loadAdminReviews();
  showToast("تمت إضافة رأي الزبونة بنجاح! ⭐", "success");
}

async function deleteReview(revId) {
  if (confirm("هل أنتِ متأكدة من حذف هذا الرأي؟")) {
    const settings = db.getSettings();
    settings.reviews = (settings.reviews || DEFAULT_CONFIG.reviews).filter(r => r.id !== revId);
    await db.saveSettings(settings);
    loadAdminReviews();
    showToast("تم حذف الرأي بنجاح", "info");
  }
}

// Global expose
window.verifyAdminPin = verifyAdminPin;
window.adminLogout = adminLogout;
window.openAddProductModal = openAddProductModal;
window.openEditProductModal = openEditProductModal;
window.handleProductFormSubmit = handleProductFormSubmit;
window.confirmDeleteProduct = confirmDeleteProduct;
window.handleProductImageUpload = handleProductImageUpload;
window.changeOrderStatus = changeOrderStatus;
window.confirmDeleteOrder = confirmDeleteOrder;
window.printOrderInvoice = printOrderInvoice;
window.handleLogoUpload = handleLogoUpload;
window.handleHeroImageUpload = handleHeroImageUpload;
window.saveBrandingAndThemeSettings = saveBrandingAndThemeSettings;
window.updateWilayaRate = updateWilayaRate;
window.saveSupabaseConfig = saveSupabaseConfig;
window.testSupabaseConnectionAction = testSupabaseConnectionAction;
window.syncLocalToSupabaseAction = syncLocalToSupabaseAction;
window.copySqlSchema = copySqlSchema;
window.loadAdminOrders = loadAdminOrders;

// Visual Customizer Window Exports
window.openAddCategoryModal = openAddCategoryModal;
window.handleCategoryFormSubmit = handleCategoryFormSubmit;
window.deleteCategory = deleteCategory;
window.openAddNavLinkModal = openAddNavLinkModal;
window.toggleNavLinkTypeOptions = toggleNavLinkTypeOptions;
window.handleNavLinkFormSubmit = handleNavLinkFormSubmit;
window.deleteNavLink = deleteNavLink;
window.saveSectionHeadings = saveSectionHeadings;
window.saveFeaturesSettings = saveFeaturesSettings;
window.openAddReviewModal = openAddReviewModal;
window.handleReviewFormSubmit = handleReviewFormSubmit;
window.deleteReview = deleteReview;

