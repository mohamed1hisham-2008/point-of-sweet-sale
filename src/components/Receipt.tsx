import { useQuery } from "@tanstack/react-query";
import { fetchSettings, type SaleItem } from "@/lib/api";
import { fmtNum, paymentLabel, useLang } from "@/lib/i18n";

export interface ReceiptData {
  id: string;
  created_at: string;
  payment_method: string;
  total: number;
  items: Pick<SaleItem, "id" | "product_name" | "quantity" | "price">[];
}

export function ReceiptDialog({
  receipt,
  onClose,
}: {
  receipt: ReceiptData | null;
  onClose: () => void;
}) {
  const { t, lang } = useLang();
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
    staleTime: 60_000,
  });
  const s = settingsQuery.data;

  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-card shadow-xl">
        <div
          id="receipt-print"
          dir={lang === "ar" ? "rtl" : "ltr"}
          className="max-h-[70vh] overflow-y-auto rounded-t-2xl bg-card p-6 font-mono text-sm text-card-foreground"
        >
          <div className="text-center">
            <p className="text-xl font-black">{s?.store_name ?? "Sweet Spot"}</p>
            {s?.address && <p className="mt-1 text-xs">{s.address}</p>}
            {s?.phone && <p className="text-xs">{s.phone}</p>}
            {s?.tax_number && (
              <p className="text-xs">
                {t("taxNumber")}: {s.tax_number}
              </p>
            )}
          </div>
          <div className="my-3 border-t border-dashed border-border" />
          <div className="flex justify-between text-xs">
            <span>
              {t("receiptTitle")} #{receipt.id.slice(0, 8)}
            </span>
            <span>
              {new Date(receipt.created_at).toLocaleString(
                lang === "ar" ? "ar-EG" : "en-US",
                { dateStyle: "short", timeStyle: "short" }
              )}
            </span>
          </div>
          <div className="my-3 border-t border-dashed border-border" />
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="py-1 text-start font-bold">{t("product")}</th>
                <th className="py-1 text-center font-bold">{t("quantity")}</th>
                <th className="py-1 text-end font-bold">{t("lineTotal")}</th>
              </tr>
            </thead>
            <tbody>
              {receipt.items.map((i) => (
                <tr key={i.id}>
                  <td className="py-1">{i.product_name}</td>
                  <td className="py-1 text-center">
                    {i.quantity} × {fmtNum(Number(i.price), lang)}
                  </td>
                  <td className="py-1 text-end font-bold">
                    {fmtNum(Number(i.price) * i.quantity, lang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="my-3 border-t border-dashed border-border" />
          <div className="flex justify-between text-base font-black">
            <span>{t("total")}</span>
            <span>
              {fmtNum(receipt.total, lang)} {t("egp")}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {paymentLabel(receipt.payment_method, lang)}
          </p>
          <div className="my-3 border-t border-dashed border-border" />
          <p className="text-center text-xs">
            {s?.footer_message || t("thanksDefault")}
          </p>
        </div>
        <div className="flex gap-2 border-t border-border p-3">
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-extrabold text-primary-foreground hover:bg-primary/90"
          >
            🖨️ {t("print")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-secondary py-2.5 text-sm font-bold text-secondary-foreground hover:bg-accent"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
