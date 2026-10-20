// Souelle Pajamas - Complete Dynamic Storefront Configuration
const DEFAULT_CONFIG = {
  // Store Branding & Contacts
  storeName: "Souelle Pajamas",
  storeTagline: "نعومة • أناقة • أنوثة | راحتك، أسلوبنا",
  logoUrl: "assets/images/logo.jpg",
  whatsappNumber: "+213557857717",
  whatsappDisplay: "0557 85 77 17",
  instagramHandle: "souelle_pajamas",
  instagramUrl: "https://instagram.com/souelle_pajamas",
  currency: "د.ج",
  adminPin: "souelle2025",

  // Top Announcement Bar
  topbar: {
    enabled: true,
    text: "🚚 التوصيل متوفر لجميع الولايات (58 ولاية) • الدفع عند الاستلام مع إمكانية المعاينة قبل الدفع ✨",
    whatsappLabel: "خدمة الزبائن (واتساب):"
  },

  // Navbar Links (Dynamic Navbar Management)
  navLinks: [
    { id: "nav-1", label: "الرئيسية", url: "index.html", type: "link" },
    { id: "nav-2", label: "بيجامات فاخرة", categoryFilter: "pajamas", type: "filter" },
    { id: "nav-3", label: "عطور ساحرة", categoryFilter: "perfumes", type: "filter" },
    { id: "nav-4", label: "عروض وتخفيضات", categoryFilter: "promotions", type: "filter" },
    { id: "nav-5", label: "أسعار التوصيل (58 ولاية)", url: "delivery.html", type: "link" },
    { id: "nav-6", label: "طلب عبر واتساب 💬", url: "whatsapp", type: "whatsapp", highlight: true }
  ],

  // Store Categories (Controls Filter Pills & Product Selection)
  categories: [
    { id: "all", name: "الكل", icon: "✨" },
    { id: "pajamas", name: "بيجامات فاخرة", icon: "👚" },
    { id: "perfumes", name: "عطور ساحرة", icon: "🌸" },
    { id: "bridal", name: "أطقم عرائس", icon: "👰" },
    { id: "promotions", name: "عروض وتخفيضات", icon: "🎁" }
  ],

  // Hero Section Settings
  hero: {
    badge: "✨ التشكيلة الحصرية 2026",
    title: "نعومة فائقة وأناقة <span>تليق بأنوثتك</span>",
    subtitle: "اكتشفي أرقى تشكيلات بيجامات النوم الفاخرة والعطور الساحرة المصممة خصيصاً للمرأة العصرية الأنيقة. أقمشة حريرية ناعمة وعطور تلامس الروح مع توصيل سريع لباب منزلك.",
    bannerImage: "assets/images/hero-banner.jpg",
    ctaPrimaryText: "تسوّقي البيجامات الآن",
    ctaSecondaryText: "اكتشفي العطور",
    ctaWhatsappText: "استفسار فوري عبر واتساب"
  },

  // Section Headings & Subtitles
  sections: {
    products: {
      badge: "🎀 أرقى الموديلات",
      title: "التشكيلة المختارة لكِ",
      subtitle: "بيجامات نوم راقية، أطقم عرائس وعطور تمنحك شعوراً استثنائياً بالدلال"
    },
    reviews: {
      badge: "⭐ تجارب حقيقية",
      title: "ماذا تقول زبوناتنا الوفيات؟",
      subtitle: "أكثر من 1,500 زبونة سعيدة عبر كامل التراب الوطني"
    },
    deliveryBanner: {
      badge: "🚚 خدمة شحن احترافية",
      title: "نوصلك وين ما كنتِ في الجزائر (58 ولاية)",
      subtitle: "توصيل سريع وموثوق إلى باب منزلك أو استلام من المكتب، مع ضمان المعاينة قبل الدفع لراحة بالك التامة."
    }
  },

  // Features Strip (4 Customizable Cards)
  features: [
    { icon: "🚚", title: "توصيل سريع لـ 58 ولاية", desc: "توصيل لباب دارك أو المكتب خلال 24 إلى 48 ساعة فقط." },
    { icon: "💎", title: "أقمشة حريرية فاخرة", desc: "خامات ناعمة وباردة منتقاة بعناية لراحتك التامة." },
    { icon: "🤝", title: "الدفع عند الاستلام", desc: "افتحي طلبيتك وعاينيها قبل دفع أي دينار للموزع." },
    { icon: "💬", title: "خدمة زبائن فورية", desc: "فريقنا في خدمتك يومياً عبر الواتساب للإجابة عن كل استفسار." }
  ],

  // Customer Reviews (Testimonials)
  reviews: [
    {
      id: "rev-1",
      name: "سارة م.",
      city: "وهران (Oran)",
      stars: 5,
      text: "وصلتني البيجاما الحريرية لولاية وهران في 24 ساعة، القماش بزاف خفيف وبارد وناعم، لا فينيسيون تحفة كيما فالفوطو تماماً. شكراً بزاف Souelle Pajamas!"
    },
    {
      id: "rev-2",
      name: "مريم ك.",
      city: "الجزائر العاصمة",
      stars: 5,
      text: "شريت عطر Souelle Rose Nocturne مع البيجاما، الريحة تع العطر تبقى شادة يومين في القش، حتى راجلي عجبو بزاف. تعامل راقي وتوصيل سريع للعاصمة."
    },
    {
      id: "rev-3",
      name: "نورهان ب.",
      city: "قسنطينة (Constantine)",
      stars: 5,
      text: "كنت نوجد فجهازي وديت الطقم العرائسي الأبيض الملكي، الدانتيل فرنسي تحفة والبياض ناصع، فرحت بيه بزاف ربي يباركلكم فرزقكم."
    }
  ],

  // Theme Colors (Live customizable via CSS Variables)
  theme: {
    primary: "#E8829C",       // Rose / Blush Pink
    primaryHover: "#D66B86",  // Darker Rose
    secondary: "#8A2846",     // Deep Mulberry / Burgundy
    accent: "#D4AF37",        // Champagne Gold
    accentHover: "#B89728",
    background: "#FFF9FA",    // Soft warm blush white
    cardBg: "#FFFFFF",
    textDark: "#2B2226",
    textMuted: "#7A6D74"
  },

  // Supabase Connection Settings
  supabase: {
    url: "",
    anonKey: ""
  }
};

// Initial Seed Products
const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "طقم بيجاما حرير ساتان ناعم - Rose Poudré",
    category: "pajamas",
    categoryLabel: "بيجامات فاخرة",
    price: 4900,
    oldPrice: 6200,
    image: "assets/images/pajama-silk-rose.jpg",
    description: "طقم بيجاما حريرية فائقة النعومة من قطعتين (قميص بأزرار وياقة أنيقة + سروال فضفاض مريح). ملمس بارد خفيف على البشرة يمنحك نوماً هادئاً وراحة ملكية في منزلك.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["وردي بودري", "شمباني", "أسود ملكي"],
    inStock: true,
    badge: "الأكثر مبيعاً 🔥",
    rating: 5.0,
    reviewsCount: 38
  },
  {
    id: "prod-2",
    name: "طقم عرائسي ملكي بالدانتيل الفرنسي - Blanc Soie",
    category: "bridal",
    categoryLabel: "أطقم عرائس",
    price: 7800,
    oldPrice: 9500,
    image: "assets/images/pajama-bridal-white.jpg",
    description: "طقم عروس ساحر من قطعتين (روب حريري طويل بأكمام مطرزة بدانتيل فرنسي راقي + قميص نوم قصير بتصميم أنثوي ناعم). خيار مثالي لكل عروس تبحث عن الفخامة والتميز في جهازها.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["أبيض عاجي", "وردي ناعم"],
    inStock: true,
    badge: "طقم عرائسي فاخر 👰",
    rating: 4.9,
    reviewsCount: 52
  },
  {
    id: "prod-3",
    name: "عطر Souelle Rose Nocturne - أو دو بارفان",
    category: "perfumes",
    categoryLabel: "عطور فاخرة",
    price: 5200,
    oldPrice: 6500,
    image: "assets/images/perfume-rose-nocturne.jpg",
    description: "عطر نسائي زهري ساحر يجمع بين عبير الورود البلغارية الناعمة مع لمسات من الفواكه والمسك الأبيض الدافئ. ثباتية تدوم أكثر من 48 ساعة على الملابس مع فوحان أنثوي آسر.",
    sizes: ["100ml"],
    colors: ["Eau de Parfum"],
    inStock: true,
    badge: "عطر الموسم 🌸",
    rating: 5.0,
    reviewsCount: 44
  },
  {
    id: "prod-4",
    name: "عطر Souelle Vanille Royale - خشب الصندل والعنبر",
    category: "perfumes",
    categoryLabel: "عطور فاخرة",
    price: 5800,
    oldPrice: 7200,
    image: "assets/images/perfume-vanille-royale.jpg",
    description: "عطر شرقي دافئ وراقي يمتزج فيه سحر الفانيلا المدغشقرية الفاخرة مع نفحات العنبر الملكي وخشب الصندل. عطر شتوي بامتياز يمنحك دفئاً وجاذبية لا تُقاوم.",
    sizes: ["75ml"],
    colors: ["Eau de Parfum"],
    inStock: true,
    badge: "فخامة ملكية 👑",
    rating: 4.8,
    reviewsCount: 29
  },
  {
    id: "prod-5",
    name: "بيجاما قطيفة دافئة ملكية - Velours Impérial",
    category: "pajamas",
    categoryLabel: "بيجامات فاخرة",
    price: 5400,
    oldPrice: 6800,
    image: "assets/images/pajama-silk-rose.jpg",
    description: "بيجاما قطيفة ناعمة من أفخم أنواع المخمل الشتوي مع تطريز ذهبي خفيف على الياقة. تدفئة ممتازة ومظهر أنيق يجعلك تشعرين بالراحة طوال أيام الشتاء الباردة.",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["عنابي ملكي", "وردي بودري", "أزرق ليلي"],
    inStock: true,
    badge: "دفء ونعومة ❄️",
    rating: 4.9,
    reviewsCount: 31
  },
  {
    id: "prod-6",
    name: "باك الدلال: بيجاما حرير + عطر Rose Nocturne",
    category: "promotions",
    categoryLabel: "عروض خاصة",
    price: 8900,
    oldPrice: 11400,
    image: "assets/images/hero-banner.jpg",
    description: "بكج التوفير الفاخر: احصلي على طقم بيجاما حريرية روز بودري الفاخر مع عطر Souelle Rose Nocturne 100ml في علبة هدايا أنيقة مجهزة لتقديمها كهدية راقية لنفسك أو لمن تحبين.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["طقم الورد الكامل"],
    inStock: true,
    badge: "تخفيض 2500 د.ج 🎁",
    rating: 5.0,
    reviewsCount: 67
  }
];

if (typeof module !== 'undefined') {
  module.exports = { DEFAULT_CONFIG, INITIAL_PRODUCTS };
}
