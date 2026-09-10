import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchSales } from "@/lib/api";
import { fmtNum, paymentLabel, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [
      { title: "Sales — Sweet Spot" },
      {
        name: "description",
        content: "Sweet Spot sales receipts log and today's totals.",
      },
      { property: "og:title", content: "Sales — Sweet Spot" },
      {
        property: "og:description",
        content: "Sweet Spot sales receipts log and today's totals.",
      },
    ],
  }),
  component: SalesPage,
});

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function SalesPage() {
  const { t, lang } = useLang();
  const [openId, setOpenId] = useState<string | null>(null);
  const salesQuery = useQuery({ queryKey: ["sales"], queryFn: fetchSales });
  const sales = salesQuery.data ?? [];

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const stats = useMemo(() => {
    const today = sales.filter((s) => isToday(s.created_at));
    return {
      todayTotal: today.reduce((s, x) => s + Number(x.total), 0),
      todayCount: today.length,
      allTotal: sales.reduce((s, x) => s + Number(x.total), 0),
      allCount: sales.length,
    };
  }, [sales]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-5">
      <h1 className="mb-4 text-xl font-black">{t("salesLog")}</h1>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label={t("todaySales")}
          value={`${fmtNum(stats.todayTotal, lang)} ${t("egp")}`}
        />
        <StatCard label={t("todayReceipts")} value={String(stats.todayCount)} />
        <StatCard
          label={t("allSales")}
          value={`${fmtNum(stats.allTotal, lang)} ${t("egp")}`}
        />
        <StatCard label={t("receiptsCount")} value={String(stats.allCount)} />
      </div>

      {salesQuery.isLoading ? (
        <p className="py-16 text-center text-muted-foreground">
          {t("loadingSales")}
        </p>
      ) : sales.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          {t("noSales")}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {sales.map((s) => {
            const open = openId === s.id;
            return (
              <div
                key={s.id}
                className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
              >
                <button
                  onClick={() => setOpenId(open ? null : s.id)}
                  className="flex w-full flex-wrap items-center gap-3 px-5 py-4 text-start hover:bg-secondary/40"
                >
                  <span className="font-mono text-xs font-bold text-muted-foreground">
                    #{s.id.slice(0, 8)}
                  </span>
                  <span className="text-sm font-semibold">
                    {fmtDate(s.created_at)}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-secondary-foreground">
                    {paymentLabel(s.payment_method, lang)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {s.sale_items?.reduce((a, i) => a + i.quantity, 0) ?? 0}{" "}
                    {t("items")}
                  </span>
                  <span className="ms-auto text-base font-extrabold text-primary">
                    {fmtNum(Number(s.total), lang)} {t("egp")}
                  </span>
                  <span className="text-muted-foreground">
                    {open ? "▲" : "▼"}
                  </span>
                </button>
                {open && (
                  <div className="border-t border-border bg-secondary/30 px-5 py-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-start text-xs text-muted-foreground">
                          <th className="py-1 text-start font-bold">
                            {t("product")}
                          </th>
                          <th className="py-1 text-start font-bold">
                            {t("quantity")}
                          </th>
                          <th className="py-1 text-start font-bold">
                            {t("price")}
                          </th>
                          <th className="py-1 text-start font-bold">
                            {t("lineTotal")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(s.sale_items ?? []).map((i) => (
                          <tr key={i.id} className="border-t border-border/60">
                            <td className="py-2 font-semibold">
                              {i.product_name}
                            </td>
                            <td className="py-2">{i.quantity}</td>
                            <td className="py-2">
                              {fmtNum(Number(i.price), lang)}
                            </td>
                            <td className="py-2 font-bold">
                              {fmtNum(Number(i.price) * i.quantity, lang)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-black text-foreground">{value}</p>
    </div>
  );
}
