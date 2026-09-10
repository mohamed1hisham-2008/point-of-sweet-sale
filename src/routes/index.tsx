import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  checkout,
  fetchProducts,
  type CartLine,
  type Product,
} from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الكاشير — Sweet Spot" },
      {
        name: "description",
        content: "شاشة الكاشير: اختار المنتجات، راجع الفاتورة، وسجّل البيع.",
      },
      { property: "og:title", content: "الكاشير — Sweet Spot" },
      {
        property: "og:description",
        content: "شاشة الكاشير: اختار المنتجات، راجع الفاتورة، وسجّل البيع.",
      },
    ],
  }),
  component: CashierPage,
});

const fmt = (n: number) =>
  n.toLocaleString("ar-EG", { maximumFractionDigits: 2 });

function CashierPage() {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartLine[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("الكل");
  const [payment, setPayment] = useState("نقدي");
  const [receipt, setReceipt] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const checkoutMutation = useMutation({
    mutationFn: () => checkout(cart, payment),
    onSuccess: (saleId) => {
      setCart([]);
      setReceipt(saleId);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["sales"] });
    },
  });

  const products = productsQuery.data ?? [];

  const categories = useMemo(
    () => ["الكل", ...Array.from(new Set(products.map((p) => p.category)))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = search.trim();
    return products.filter(
      (p) =>
        (category === "الكل" || p.category === category) &&
        (!q || p.name.includes(q) || (p.barcode ?? "").includes(q))
    );
  }, [products, search, category]);

  const total = cart.reduce((s, l) => s + l.product.price * l.quantity, 0);

  function addToCart(product: Product) {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((l) =>
          l.product.id === product.id
            ? { ...l, quantity: l.quantity + 1 }
            : l
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => {
          if (l.product.id !== id) return l;
          const q = Math.min(l.product.stock, Math.max(0, l.quantity + delta));
          return { ...l, quantity: q };
        })
        .filter((l) => l.quantity > 0)
    );
  }

  function removeLine(id: string) {
    setCart((prev) => prev.filter((l) => l.product.id !== id));
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[1fr_380px]">
      {/* Products */}
      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو الباركود..."
            className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring sm:max-w-xs"
          />
          <div className="flex flex-wrap gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  category === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {productsQuery.isLoading ? (
          <p className="py-16 text-center text-muted-foreground">
            جاري تحميل المنتجات...
          </p>
        ) : productsQuery.isError ? (
          <p className="py-16 text-center text-destructive">
            حصل خطأ في تحميل المنتجات
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => {
              const out = p.stock <= 0;
              const low = p.stock > 0 && p.stock <= 5;
              return (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  disabled={out}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-4 text-right shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="text-sm font-bold text-card-foreground">
                    {p.name}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {p.category}
                  </span>
                  <span className="mt-3 text-lg font-extrabold text-primary">
                    {fmt(p.price)} ج.م
                  </span>
                  <span
                    className={`mt-1 text-xs font-semibold ${
                      out
                        ? "text-destructive"
                        : low
                          ? "text-chart-5"
                          : "text-muted-foreground"
                    }`}
                  >
                    {out ? "خلص من المخزون" : `المتاح: ${p.stock}`}
                  </span>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full py-16 text-center text-muted-foreground">
                مفيش منتجات مطابقة للبحث
              </p>
            )}
          </div>
        )}
      </section>

      {/* Cart */}
      <aside className="flex h-fit flex-col rounded-2xl border border-border bg-card shadow-sm lg:sticky lg:top-20">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-lg font-extrabold text-card-foreground">
            الفاتورة الحالية
          </h2>
        </div>

        <div className="max-h-80 flex-1 overflow-y-auto px-3 py-2">
          {cart.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              اضغط على أي منتج عشان تضيفه للفاتورة
            </p>
          ) : (
            cart.map((l) => (
              <div
                key={l.product.id}
                className="flex items-center gap-2 rounded-xl px-2 py-2.5 hover:bg-secondary/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{l.product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {fmt(l.product.price)} × {l.quantity} ={" "}
                    {fmt(l.product.price * l.quantity)} ج.م
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => changeQty(l.product.id, 1)}
                    className="h-7 w-7 rounded-lg bg-secondary text-sm font-bold hover:bg-accent"
                    aria-label="زيادة الكمية"
                  >
                    +
                  </button>
                  <button
                    onClick={() => changeQty(l.product.id, -1)}
                    className="h-7 w-7 rounded-lg bg-secondary text-sm font-bold hover:bg-accent"
                    aria-label="تقليل الكمية"
                  >
                    −
                  </button>
                  <button
                    onClick={() => removeLine(l.product.id)}
                    className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10"
                    aria-label="حذف"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-border px-5 py-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted-foreground">
              الإجمالي
            </span>
            <span className="text-2xl font-black text-primary">
              {fmt(total)} ج.م
            </span>
          </div>
          <div className="mb-3 flex gap-2">
            {["نقدي", "فيزا", "محفظة"].map((m) => (
              <button
                key={m}
                onClick={() => setPayment(m)}
                className={`flex-1 rounded-xl px-2 py-2 text-xs font-bold transition-colors ${
                  payment === m
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <button
            onClick={() => checkoutMutation.mutate()}
            disabled={cart.length === 0 || checkoutMutation.isPending}
            className="w-full rounded-xl bg-primary py-3 text-base font-extrabold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {checkoutMutation.isPending ? "جاري التسجيل..." : "إتمام البيع ✅"}
          </button>
          {checkoutMutation.isError && (
            <p className="mt-2 text-center text-xs font-semibold text-destructive">
              حصل خطأ أثناء تسجيل البيع، حاول تاني
            </p>
          )}
          {receipt && (
            <p className="mt-2 text-center text-xs font-semibold text-success">
              تم تسجيل البيع بنجاح — رقم الفاتورة: {receipt.slice(0, 8)}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
