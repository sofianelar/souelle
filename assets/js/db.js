// Database and Storage Layer for Souelle Pajamas
// Supports LocalStorage (instant out-of-the-box) and Supabase cloud sync

class StoreDB {
  constructor() {
    this.STORAGE_KEYS = {
      SETTINGS: "souelle_settings",
      PRODUCTS: "souelle_products",
      ORDERS: "souelle_orders",
      WILAYAS: "souelle_wilayas",
      CART: "souelle_cart"
    };

    this.init();
  }

  init() {
    // Initialize LocalStorage with defaults if empty
    if (!localStorage.getItem(this.STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_CONFIG));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.ORDERS)) {
      // Seed a couple of demo orders for the admin to inspect
      const demoOrders = [
        {
          id: "ORD-2026-1001",
          customerName: "أمينة بوقرة",
          customerPhone: "0555123456",
          wilayaCode: 16,
          wilayaName: "الجزائر العاصمة",
          commune: "الرويبة - حي النخيل",
          address: "عمارة ج، الطابق 2",
          items: [
            { id: "prod-1", name: "طقم بيجاما حرير ساتان ناعم", size: "M", color: "وردي بودري", price: 4900, qty: 1 }
          ],
          subtotal: 4900,
          deliveryFee: 400,
          total: 5300,
          status: "مؤكد",
          notes: "يرجى الاتصال قبل الوصول",
          date: new Date(Date.now() - 3600000 * 5).toISOString()
        },
        {
          id: "ORD-2026-1002",
          customerName: "سارة مداني",
          customerPhone: "0661987654",
          wilayaCode: 31,
          wilayaName: "وهران",
          commune: "السانية",
          address: "قرب محطة الترامواي",
          items: [
            { id: "prod-3", name: "عطر Souelle Rose Nocturne", size: "100ml", color: "Eau de Parfum", price: 5200, qty: 1 },
            { id: "prod-2", name: "طقم عرائسي ملكي بالدانتيل", size: "L", color: "أبيض عاجي", price: 7800, qty: 1 }
          ],
          subtotal: 13000,
          deliveryFee: 550,
          total: 13550,
          status: "قيد الانتظار",
          notes: "",
          date: new Date(Date.now() - 3600000 * 18).toISOString()
        }
      ];
      localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(demoOrders));
    }
    if (!localStorage.getItem(this.STORAGE_KEYS.WILAYAS)) {
      localStorage.setItem(this.STORAGE_KEYS.WILAYAS, JSON.stringify(ALGERIA_WILAYAS));
    }

    // Apply active theme colors
    this.applyThemeColors();
  }

  // ==================== SETTINGS ====================
  getSettings() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_CONFIG;
      const parsed = JSON.parse(data);
      // Merge defaults for missing arrays or sub-objects
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        topbar: { ...DEFAULT_CONFIG.topbar, ...(parsed.topbar || {}) },
        navLinks: parsed.navLinks && parsed.navLinks.length > 0 ? parsed.navLinks : DEFAULT_CONFIG.navLinks,
        categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : DEFAULT_CONFIG.categories,
        hero: { ...DEFAULT_CONFIG.hero, ...(parsed.hero || {}) },
        sections: {
          products: { ...DEFAULT_CONFIG.sections.products, ...(parsed.sections?.products || {}) },
          reviews: { ...DEFAULT_CONFIG.sections.reviews, ...(parsed.sections?.reviews || {}) },
          deliveryBanner: { ...DEFAULT_CONFIG.sections.deliveryBanner, ...(parsed.sections?.deliveryBanner || {}) }
        },
        features: parsed.features && parsed.features.length > 0 ? parsed.features : DEFAULT_CONFIG.features,
        reviews: parsed.reviews && parsed.reviews.length > 0 ? parsed.reviews : DEFAULT_CONFIG.reviews,
        theme: { ...DEFAULT_CONFIG.theme, ...(parsed.theme || {}) }
      };
    } catch (e) {
      console.error("Error reading settings:", e);
      return DEFAULT_CONFIG;
    }
  }

  async saveSettings(newSettings) {
    const merged = { ...this.getSettings(), ...newSettings };
    localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(merged));
    this.applyThemeColors();

    // If Supabase is configured, push to remote table
    if (this.isSupabaseConfigured()) {
      try {
        await this.supabaseRequest("store_settings", "POST", {
          id: "main_config",
          config: merged,
          updated_at: new Date().toISOString()
        }, true);
      } catch (err) {
        console.warn("Supabase settings sync error:", err);
      }
    }
    return merged;
  }

  applyThemeColors() {
    const settings = this.getSettings();
    const theme = settings.theme || DEFAULT_CONFIG.theme;
    const root = document.documentElement;

    root.style.setProperty("--primary", theme.primary || "#E8829C");
    root.style.setProperty("--primary-hover", theme.primaryHover || "#D66B86");
    root.style.setProperty("--secondary", theme.secondary || "#8A2846");
    root.style.setProperty("--accent", theme.accent || "#D4AF37");
    root.style.setProperty("--accent-hover", theme.accentHover || "#B89728");
    root.style.setProperty("--bg-main", theme.background || "#FFF9FA");
    root.style.setProperty("--card-bg", theme.cardBg || "#FFFFFF");
    root.style.setProperty("--text-dark", theme.textDark || "#2B2226");
    root.style.setProperty("--text-muted", theme.textMuted || "#7A6D74");
  }

  // ==================== PRODUCTS ====================
  async getProducts() {
    // If Supabase is connected, try to fetch from it
    if (this.isSupabaseConfigured()) {
      try {
        const remote = await this.supabaseRequest("products?select=*&order=created_at.desc", "GET");
        if (Array.isArray(remote) && remote.length > 0) {
          // Normalize Supabase fields to local format
          const formatted = remote.map(r => ({
            id: r.id,
            name: r.name,
            category: r.category,
            categoryLabel: r.category_label || (r.category === 'pajamas' ? 'بيجامات فاخرة' : 'عطور فاخرة'),
            price: Number(r.price),
            oldPrice: Number(r.old_price || 0),
            image: r.image_url,
            description: r.description,
            sizes: Array.isArray(r.sizes) ? r.sizes : (r.sizes ? JSON.parse(r.sizes) : ["M"]),
            colors: Array.isArray(r.colors) ? r.colors : (r.colors ? JSON.parse(r.colors) : ["وردي"]),
            inStock: r.in_stock !== false,
            badge: r.badge || "",
            rating: Number(r.rating || 5.0),
            reviewsCount: Number(r.reviews_count || 12)
          }));
          localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(formatted));
          return formatted;
        }
      } catch (e) {
        console.warn("Failed to fetch products from Supabase, using LocalStorage fallback:", e);
      }
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.PRODUCTS);
      return data ? JSON.parse(data) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  }

  async saveProduct(product) {
    const products = await this.getProducts();
    const index = products.findIndex(p => p.id === product.id);

    if (index >= 0) {
      products[index] = { ...products[index], ...product };
    } else {
      if (!product.id) {
        product.id = "prod-" + Date.now();
      }
      products.unshift(product);
    }

    localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    // Supabase sync
    if (this.isSupabaseConfigured()) {
      try {
        const payload = {
          id: product.id,
          name: product.name,
          category: product.category,
          category_label: product.categoryLabel,
          price: product.price,
          old_price: product.oldPrice,
          image_url: product.image,
          description: product.description,
          sizes: JSON.stringify(product.sizes || []),
          colors: JSON.stringify(product.colors || []),
          in_stock: product.inStock,
          badge: product.badge,
          updated_at: new Date().toISOString()
        };
        await this.supabaseRequest("products", "POST", payload, true);
      } catch (err) {
        console.warn("Supabase product save error:", err);
      }
    }

    return product;
  }

  async deleteProduct(productId) {
    let products = await this.getProducts();
    products = products.filter(p => p.id !== productId);
    localStorage.setItem(this.STORAGE_KEYS.PRODUCTS, JSON.stringify(products));

    if (this.isSupabaseConfigured()) {
      try {
        await this.supabaseRequest(`products?id=eq.${productId}`, "DELETE");
      } catch (err) {
        console.warn("Supabase product delete error:", err);
      }
    }
    return true;
  }

  // ==================== ORDERS ====================
  async getOrders() {
    if (this.isSupabaseConfigured()) {
      try {
        const remote = await this.supabaseRequest("orders?select=*&order=created_at.desc", "GET");
        if (Array.isArray(remote)) {
          const formatted = remote.map(r => ({
            id: r.id,
            customerName: r.customer_name,
            customerPhone: r.customer_phone,
            wilayaCode: r.wilaya_code,
            wilayaName: r.wilaya_name,
            commune: r.commune,
            address: r.address,
            items: typeof r.items === "string" ? JSON.parse(r.items) : (r.items || []),
            subtotal: Number(r.subtotal),
            deliveryFee: Number(r.delivery_fee),
            total: Number(r.total),
            status: r.status || "قيد الانتظار",
            notes: r.notes || "",
            date: r.created_at || new Date().toISOString()
          }));
          localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(formatted));
          return formatted;
        }
      } catch (e) {
        console.warn("Supabase orders fetch error:", e);
      }
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.ORDERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  async createOrder(orderData) {
    const orders = await this.getOrders();
    const orderId = "ORD-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: orderId,
      date: new Date().toISOString(),
      status: "قيد الانتظار",
      ...orderData
    };

    orders.unshift(newOrder);
    localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    // Clear cart on successful order
    this.clearCart();

    // Push to Supabase if configured
    if (this.isSupabaseConfigured()) {
      try {
        const payload = {
          id: newOrder.id,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.customerPhone,
          wilaya_code: newOrder.wilayaCode,
          wilaya_name: newOrder.wilayaName,
          commune: newOrder.commune,
          address: newOrder.address || "",
          items: JSON.stringify(newOrder.items || []),
          subtotal: newOrder.subtotal,
          delivery_fee: newOrder.deliveryFee,
          total: newOrder.total,
          status: newOrder.status,
          notes: newOrder.notes || "",
          created_at: newOrder.date
        };
        await this.supabaseRequest("orders", "POST", payload);
      } catch (err) {
        console.warn("Supabase order push error:", err);
      }
    }

    return newOrder;
  }

  async updateOrderStatus(orderId, status) {
    const orders = await this.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));

      if (this.isSupabaseConfigured()) {
        try {
          await this.supabaseRequest(`orders?id=eq.${orderId}`, "PATCH", { status });
        } catch (err) {
          console.warn("Supabase order update status error:", err);
        }
      }
      return true;
    }
    return false;
  }

  async deleteOrder(orderId) {
    let orders = await this.getOrders();
    orders = orders.filter(o => o.id !== orderId);
    localStorage.setItem(this.STORAGE_KEYS.ORDERS, JSON.stringify(orders));

    if (this.isSupabaseConfigured()) {
      try {
        await this.supabaseRequest(`orders?id=eq.${orderId}`, "DELETE");
      } catch (err) {
        console.warn("Supabase order delete error:", err);
      }
    }
    return true;
  }

  // ==================== CART ====================
  getCart() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.CART);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  saveCart(cart) {
    localStorage.setItem(this.STORAGE_KEYS.CART, JSON.stringify(cart));
    // Trigger storage event so badge updates
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: { cart } }));
  }

  addToCart(product, size, color, quantity = 1) {
    const cart = this.getCart();
    const cartKey = `${product.id}-${size || 'default'}-${color || 'default'}`;
    const existingIndex = cart.findIndex(item => item.cartKey === cartKey);

    if (existingIndex >= 0) {
      cart[existingIndex].qty += Number(quantity);
    } else {
      cart.push({
        cartKey,
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: size || (product.sizes && product.sizes[0]) || "",
        color: color || (product.colors && product.colors[0]) || "",
        qty: Number(quantity)
      });
    }

    this.saveCart(cart);
    return cart;
  }

  updateCartQty(cartKey, qty) {
    let cart = this.getCart();
    if (qty <= 0) {
      cart = cart.filter(item => item.cartKey !== cartKey);
    } else {
      const item = cart.find(i => i.cartKey === cartKey);
      if (item) item.qty = qty;
    }
    this.saveCart(cart);
    return cart;
  }

  clearCart() {
    this.saveCart([]);
  }

  // ==================== WILAYAS & DELIVERY ====================
  getWilayas() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEYS.WILAYAS);
      return data ? JSON.parse(data) : ALGERIA_WILAYAS;
    } catch (e) {
      return ALGERIA_WILAYAS;
    }
  }

  saveWilayas(wilayasList) {
    localStorage.setItem(this.STORAGE_KEYS.WILAYAS, JSON.stringify(wilayasList));
  }

  updateWilayaPrice(code, homePrice, deskPrice) {
    const list = this.getWilayas();
    const item = list.find(w => w.code === Number(code));
    if (item) {
      item.home_price = Number(homePrice);
      item.desk_price = Number(deskPrice);
      this.saveWilayas(list);
      return true;
    }
    return false;
  }

  // ==================== SUPABASE API ====================
  isSupabaseConfigured() {
    const settings = this.getSettings();
    return !!(settings.supabase && settings.supabase.url && settings.supabase.anonKey);
  }

  async supabaseRequest(endpoint, method = "GET", body = null, upsert = false) {
    const settings = this.getSettings();
    const url = settings.supabase.url.replace(/\/$/, "");
    const anonKey = settings.supabase.anonKey;

    if (!url || !anonKey) {
      throw new Error("Supabase credentials not configured");
    }

    const headers = {
      "apikey": anonKey,
      "Authorization": `Bearer ${anonKey}`,
      "Content-Type": "application/json",
      "Prefer": upsert ? "resolution=merge-duplicates" : "return=representation"
    };

    const config = {
      method,
      headers
    };

    if (body && (method === "POST" || method === "PATCH" || method === "PUT")) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${url}/rest/v1/${endpoint}`, config);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Supabase API error (${response.status}): ${errText}`);
    }

    if (method === "DELETE") return true;

    try {
      return await response.json();
    } catch (e) {
      return null;
    }
  }

  async testSupabaseConnection(url, anonKey) {
    const cleanUrl = (url || "").replace(/\/$/, "");
    try {
      const res = await fetch(`${cleanUrl}/rest/v1/products?select=count`, {
        method: "HEAD",
        headers: {
          "apikey": anonKey,
          "Authorization": `Bearer ${anonKey}`
        }
      });
      return { success: res.ok, status: res.status };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async syncLocalToSupabase() {
    if (!this.isSupabaseConfigured()) {
      throw new Error("يرجى إدخال بيانات Supabase وحفظها أولاً");
    }

    // 1. Sync Settings
    const settings = this.getSettings();
    await this.supabaseRequest("store_settings", "POST", {
      id: "main_config",
      config: settings,
      updated_at: new Date().toISOString()
    }, true);

    // 2. Sync Products
    const products = await this.getProducts();
    for (const p of products) {
      await this.supabaseRequest("products", "POST", {
        id: p.id,
        name: p.name,
        category: p.category,
        category_label: p.categoryLabel,
        price: p.price,
        old_price: p.oldPrice,
        image_url: p.image,
        description: p.description,
        sizes: JSON.stringify(p.sizes || []),
        colors: JSON.stringify(p.colors || []),
        in_stock: p.inStock,
        badge: p.badge,
        updated_at: new Date().toISOString()
      }, true);
    }

    return true;
  }

  resetAllData() {
    localStorage.removeItem(this.STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(this.STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(this.STORAGE_KEYS.ORDERS);
    localStorage.removeItem(this.STORAGE_KEYS.WILAYAS);
    localStorage.removeItem(this.STORAGE_KEYS.CART);
    this.init();
  }
}

// Global database instance
const db = new StoreDB();
if (typeof window !== "undefined") {
  window.db = db;
}
