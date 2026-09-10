import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  barcode: string | null;
  created_at: string;
}

export interface Sale {
  id: string;
  total: number;
  payment_method: string;
  created_at: string;
  sale_items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  sale_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  price: number;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("category")
    .order("name");
  if (error) throw error;
  return data as Product[];
}

export async function createProduct(
  p: Omit<Product, "id" | "created_at">
): Promise<void> {
  const { error } = await supabase.from("products").insert(p);
  if (error) throw error;
}

export async function updateProduct(
  id: string,
  p: Partial<Omit<Product, "id" | "created_at">>
): Promise<void> {
  const { error } = await supabase.from("products").update(p).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}

/** Creates a sale with its items and decrements stock, in order. */
export async function checkout(
  cart: CartLine[],
  paymentMethod: string
): Promise<string> {
  const total = cart.reduce((s, l) => s + l.product.price * l.quantity, 0);

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({ total, payment_method: paymentMethod })
    .select("id")
    .single();
  if (saleError) throw saleError;

  const items = cart.map((l) => ({
    sale_id: sale.id,
    product_id: l.product.id,
    product_name: l.product.name,
    quantity: l.quantity,
    price: l.product.price,
  }));
  const { error: itemsError } = await supabase.from("sale_items").insert(items);
  if (itemsError) throw itemsError;

  for (const l of cart) {
    const newStock = Math.max(0, l.product.stock - l.quantity);
    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", l.product.id);
    if (error) throw error;
  }

  return sale.id as string;
}

export async function fetchSales(): Promise<Sale[]> {
  const { data, error } = await supabase
    .from("sales")
    .select("*, sale_items(*)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data as Sale[];
}
