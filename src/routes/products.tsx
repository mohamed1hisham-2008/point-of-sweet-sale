import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
  type Product,
} from "@/lib/api";
import { fmtNum, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products & Inventory — Sweet Spot" },
      {
        name: "description",
        content:
          "Manage Sweet Spot products: add, edit, delete and track stock.",
      },
      { property: "og:title", content: "Products & Inventory — Sweet Spot" },
      {
        property: "og:description",
        content:
          "Manage Sweet Spot products: add, edit, delete and track stock.",
      },
    ],
  }),
  component: ProductsPage,
});

const emptyForm = {
  name: "",
  category: "",
  price: "",
  cost: "",
  stock: "",
  barcode: "",
};

function ProductsPage() {
  const { t, lang } = useLang();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["products"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || "عام",
        price: Number(form.price) || 0,
        cost: Number(form.cost) || 0,
        stock: Math.max(0, Math.floor(Number(form.stock) || 0)),
        barcode: form.barcode.trim() || null,
      };
      if (!payload.name) throw new Error(t("nameRequired"));
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        await createProduct(payload);
      }
    },
    onSuccess: () => {
      setForm(emptyForm);
      setEditing(null);
      setError(null);
      invalidate();
    },
    onError: (e) =>
      setError(e instanceof Error ? e.message : t("genericError")),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: invalidate,
  });

  function startEdit(p: Product) {
    setEditing(p);
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      cost: String(p.cost),
      stock: String(p.stock),
      barcode: p.barcode ?? "",
    });
  }

  const products = productsQuery.data ?? [];
  const lowStock = products.filter((p) => p.stock <= 5).length;

  const inputClass =
    "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "text-xs font-bold text-muted-foreground";

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 lg:grid-cols-[360px_1fr]">
      {/* Form */}
      <section className="h-fit rounded-2xl border border-border bg-card p-5 shadow-sm lg:sticky lg:top-20">
        <h2 className="mb-4 text-lg font-extrabold">
          {editing
            ? `${t("editProduct")}: ${editing.name}`
            : t("addProduct")}
        </h2>
        <div className="flex flex-col gap-3">
          <label className={labelClass}>
            {t("productName")}
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className={labelClass}>
            {t("category")}
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputClass}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              {t("sellPrice")}
              <input
                type="number"
                min="0"
                step="0.25"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              {t("costPrice")}
              <input
                type="number"
                min="0"
                step="0.25"
                value={form.cost}
                onChange={(e) => setForm({ ...form, cost: e.target.value })}
                className={inputClass}
              />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className={labelClass}>
              {t("stockQty")}
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              {t("barcodeOptional")}
              <input
                value={form.barcode}
                onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                className={inputClass}
              />
            </label>
          </div>
          {error && (
            <p className="text-xs font-semibold text-destructive">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-extrabold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saveMutation.isPending
                ? t("savingBtn")
                : editing
                  ? t("saveEdit")
                  : t("addBtn")}
            </button>
            {editing && (
              <button
                onClick={() => {
                  setEditing(null);
                  setForm(emptyForm);
                  setError(null);
                }}
                className="rounded-xl bg-secondary px-4 py-2.5 text-sm font-bold text-secondary-foreground hover:bg-accent"
              >
                {t("cancel")}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Table */}
      <section>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-extrabold">{t("inventory")}</h2>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
            {products.length} {t("productCount")}
          </span>
          {lowStock > 0 && (
            <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
              {lowStock} {t("lowStockCount")}
            </span>
          )}
        </div>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs text-muted-foreground">
                <th className="px-4 py-3 text-start font-bold">{t("product")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("category")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("price")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("cost")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("stock")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("barcode")}</th>
                <th className="px-4 py-3 text-start font-bold">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {productsQuery.isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    {t("loading")}
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0 hover:bg-secondary/40"
                  >
                    <td className="px-4 py-3 font-bold">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.category}
                    </td>
                    <td className="px-4 py-3 font-semibold text-primary">
                      {fmtNum(p.price, lang)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {fmtNum(p.cost, lang)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                          p.stock <= 0
                            ? "bg-destructive/10 text-destructive"
                            : p.stock <= 5
                              ? "bg-chart-5/15 text-chart-5"
                              : "bg-success/10 text-success"
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {p.barcode ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => startEdit(p)}
                          className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold hover:bg-accent"
                        >
                          {t("edit")}
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(`${t("confirmDelete")} "${p.name}"؟`)
                            )
                              deleteMutation.mutate(p.id);
                          }}
                          className="rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-bold text-destructive hover:bg-destructive/20"
                        >
                          {t("deleteBtn")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
