import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchSettings, saveSettings } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Receipt Settings — Sweet Spot" },
      {
        name: "description",
        content: "Customize the Sweet Spot printed receipt: store name, phone, address, tax number and footer message.",
      },
      { property: "og:title", content: "Receipt Settings — Sweet Spot" },
      {
        property: "og:description",
        content: "Customize the Sweet Spot printed receipt: store name, phone, address, tax number and footer message.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { t } = useLang();
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: fetchSettings,
  });

  const [form, setForm] = useState({
    store_name: "",
    phone: "",
    address: "",
    tax_number: "",
    footer_message: "",
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settingsQuery.data) {
      const d = settingsQuery.data;
      setForm({
        store_name: d.store_name,
        phone: d.phone,
        address: d.address,
        tax_number: d.tax_number,
        footer_message: d.footer_message,
      });
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => saveSettings(form),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });

  const inputClass =
    "mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
  const labelClass = "text-xs font-bold text-muted-foreground";

  return (
    <div className="mx-auto max-w-xl px-4 py-5">
      <h1 className="text-xl font-black">{t("receiptSettings")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {t("receiptSettingsDesc")}
      </p>

      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <label className={labelClass}>
          {t("storeName")}
          <input
            value={form.store_name}
            onChange={(e) => setForm({ ...form, store_name: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          {t("phone")}
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
            dir="ltr"
          />
        </label>
        <label className={labelClass}>
          {t("address")}
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          {t("taxNumber")}
          <input
            value={form.tax_number}
            onChange={(e) => setForm({ ...form, tax_number: e.target.value })}
            className={inputClass}
            dir="ltr"
          />
        </label>
        <label className={labelClass}>
          {t("footerMessage")}
          <textarea
            value={form.footer_message}
            onChange={(e) =>
              setForm({ ...form, footer_message: e.target.value })
            }
            rows={2}
            className={inputClass}
          />
        </label>

        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending || settingsQuery.isLoading}
          className="rounded-xl bg-primary py-2.5 text-sm font-extrabold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {saveMutation.isPending ? t("savingBtn") : t("save")}
        </button>
        {saved && (
          <p className="text-center text-sm font-bold text-success">
            {t("saved")}
          </p>
        )}
        {saveMutation.isError && (
          <p className="text-center text-sm font-bold text-destructive">
            {t("genericError")}
          </p>
        )}
      </div>
    </div>
  );
}
