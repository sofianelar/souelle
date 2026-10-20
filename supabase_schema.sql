-- ========================================================
-- Souelle Pajamas - Complete Supabase Database Schema
-- Brand: Souelle Pajamas (Luxury Women Pajamas & Perfumes)
-- ========================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT,
  price NUMERIC NOT NULL,
  old_price NUMERIC DEFAULT 0,
  image_url TEXT,
  description TEXT,
  sizes JSONB DEFAULT '[]'::jsonb,
  colors JSONB DEFAULT '[]'::jsonb,
  in_stock BOOLEAN DEFAULT TRUE,
  badge TEXT,
  rating NUMERIC DEFAULT 5.0,
  reviews_count NUMERIC DEFAULT 15,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Orders Table
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

-- 3. Create Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY,
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- Row Level Security (RLS) Policies
-- ========================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Allow public read on products" ON public.products;
DROP POLICY IF EXISTS "Allow public all on products" ON public.products;
DROP POLICY IF EXISTS "Allow public insert on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public read on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public all on orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public all on settings" ON public.store_settings;

-- Public read for products & settings
CREATE POLICY "Allow public read on products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public all on products" ON public.products FOR ALL USING (true);

-- Customers can submit orders, and admins can read/update them
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public all on orders" ON public.orders FOR ALL USING (true);

-- Settings can be read and updated
CREATE POLICY "Allow public all on settings" ON public.store_settings FOR ALL USING (true);

-- ========================================================
-- Seed Initial Products
-- ========================================================

INSERT INTO public.products (id, name, category, category_label, price, old_price, image_url, description, sizes, colors, in_stock, badge)
VALUES
  (
    'prod-1',
    'طقم بيجاما حرير ساتان ناعم - Rose Poudré',
    'pajamas',
    'بيجامات فاخرة',
    4900,
    6200,
    'assets/images/pajama-silk-rose.jpg',
    'طقم بيجاما حريرية فائقة النعومة من قطعتين (قميص بأزرار وياقة أنيقة + سروال فضفاض مريح). ملمس بارد خفيف على البشرة يمنحك نوماً هادئاً وراحة ملكية في منزلك.',
    '["S", "M", "L", "XL", "XXL"]'::jsonb,
    '["وردي بودري", "شمباني", "أسود ملكي"]'::jsonb,
    true,
    'الأكثر مبيعاً 🔥'
  ),
  (
    'prod-2',
    'طقم عرائسي ملكي بالدانتيل الفرنسي - Blanc Soie',
    'pajamas',
    'أطقم عرائس',
    7800,
    9500,
    'assets/images/pajama-bridal-white.jpg',
    'طقم عروس ساحر من قطعتين (روب حريري طويل بأكمام مطرزة بدانتيل فرنسي راقي + قميص نوم قصير بتصميم أنثوي ناعم). خيار مثالي لكل عروس تبحث عن الفخامة والتميز في جهازها.',
    '["S", "M", "L", "XL"]'::jsonb,
    '["أبيض عاجي", "وردي ناعم"]'::jsonb,
    true,
    'طقم عرائسي فاخر 👰'
  ),
  (
    'prod-3',
    'عطر Souelle Rose Nocturne - أو دو بارفان',
    'perfumes',
    'عطور فاخرة',
    5200,
    6500,
    'assets/images/perfume-rose-nocturne.jpg',
    'عطر نسائي زهري ساحر يجمع بين عبير الورود البلغارية الناعمة مع لمسات من الفواكه والمسك الأبيض الدافئ. ثباتية تدوم أكثر من 48 ساعة على الملابس مع فوحان أنثوي آسر.',
    '["100ml"]'::jsonb,
    '["Eau de Parfum"]'::jsonb,
    true,
    'عطر الموسم 🌸'
  ),
  (
    'prod-4',
    'عطر Souelle Vanille Royale - خشب الصندل والعنبر',
    'perfumes',
    'عطور فاخرة',
    5800,
    7200,
    'assets/images/perfume-vanille-royale.jpg',
    'عطر شرقي دافئ وراقي يمتزج فيه سحر الفانيلا المدغشقرية الفاخرة مع نفحات العنبر الملكي وخشب الصندل. عطر شتوي بامتياز يمنحك دفئاً وجاذبية لا تُقاوم.',
    '["75ml"]'::jsonb,
    '["Eau de Parfum"]'::jsonb,
    true,
    'فخامة ملكية 👑'
  )
ON CONFLICT (id) DO NOTHING;
