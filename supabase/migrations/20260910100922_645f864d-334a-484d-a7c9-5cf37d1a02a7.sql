CREATE TABLE public.store_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name text NOT NULL DEFAULT 'Sweet Spot',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  tax_number text NOT NULL DEFAULT '',
  footer_message text NOT NULL DEFAULT 'شكرًا لتسوقكم من Sweet Spot 🍬',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_settings TO anon, authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public full access store_settings" ON public.store_settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
INSERT INTO public.store_settings (id) VALUES (1);