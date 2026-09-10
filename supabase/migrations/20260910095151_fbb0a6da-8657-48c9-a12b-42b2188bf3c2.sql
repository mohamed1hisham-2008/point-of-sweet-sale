CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'عام',
  price numeric(10,2) NOT NULL DEFAULT 0,
  cost numeric(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  barcode text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access products" ON public.products FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'نقدي',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sales TO anon, authenticated;
GRANT ALL ON public.sales TO service_role;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access sales" ON public.sales FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sale_items TO anon, authenticated;
GRANT ALL ON public.sale_items TO service_role;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access sale_items" ON public.sale_items FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

INSERT INTO public.products (name, category, price, cost, stock, barcode) VALUES
('أرز مصري 1 كجم', 'بقوليات', 38, 32, 50, '1001'),
('سكر 1 كجم', 'بقوليات', 45, 40, 60, '1002'),
('زيت عباد 1 لتر', 'زيوت', 85, 74, 40, '1003'),
('مكرونة 400 جم', 'بقوليات', 12, 9, 100, '1004'),
('شاي ليبتون 100 كيس', 'مشروبات', 95, 82, 25, '1005'),
('قهوة عربي 250 جم', 'مشروبات', 110, 95, 20, '1006'),
('لبن كامل الدسم 1 لتر', 'ألبان', 42, 36, 30, '1007'),
('جبنة بيضاء 250 جم', 'ألبان', 55, 46, 18, '1008'),
('بيض طبق 30', 'ألبان', 160, 148, 15, '1009'),
('صابون غسيل', 'منظفات', 28, 22, 45, '1010'),
('مسحوق غسيل 1 كجم', 'منظفات', 78, 66, 22, '1011'),
('بسكويت شاي', 'حلويات', 10, 7, 80, '1012'),
('شوكولاتة مورو', 'حلويات', 15, 11, 90, '1013'),
('مياه معدنية 1.5 لتر', 'مشروبات', 10, 7, 120, '1014'),
('عصير مانجو 1 لتر', 'مشروبات', 30, 24, 35, '1015');