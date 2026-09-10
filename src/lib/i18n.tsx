import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type Lang = "ar" | "en";

const dict = {
  ar: {
    storeName: "Sweet Spot",
    tagline: "سيستم كاشير البقالة",
    navCashier: "الكاشير",
    navProducts: "المنتجات",
    navSales: "المبيعات",
    searchPlaceholder: "ابحث بالاسم أو الباركود...",
    all: "الكل",
    loadingProducts: "جاري تحميل المنتجات...",
    productsError: "حصل خطأ في تحميل المنتجات",
    outOfStock: "خلص من المخزون",
    available: "المتاح",
    noMatches: "مفيش منتجات مطابقة للبحث",
    currentReceipt: "الفاتورة الحالية",
    emptyCart: "اضغط على أي منتج عشان تضيفه للفاتورة",
    total: "الإجمالي",
    egp: "ج.م",
    cash: "نقدي",
    visa: "فيزا",
    wallet: "محفظة",
    completeSale: "إتمام البيع ✅",
    saving: "جاري التسجيل...",
    saleError: "حصل خطأ أثناء تسجيل البيع، حاول تاني",
    saleSuccess: "تم تسجيل البيع بنجاح — رقم الفاتورة",
    increaseQty: "زيادة الكمية",
    decreaseQty: "تقليل الكمية",
    remove: "حذف",
    addProduct: "إضافة منتج جديد",
    editProduct: "تعديل",
    productName: "اسم المنتج",
    category: "التصنيف",
    sellPrice: "سعر البيع",
    costPrice: "سعر التكلفة",
    stockQty: "الكمية بالمخزون",
    barcodeOptional: "الباركود (اختياري)",
    saveEdit: "حفظ التعديل",
    addBtn: "إضافة المنتج",
    savingBtn: "جاري الحفظ...",
    cancel: "إلغاء",
    inventory: "المخزون",
    productCount: "منتج",
    lowStockCount: "منتج مخزونه قليل",
    product: "المنتج",
    price: "البيع",
    cost: "التكلفة",
    stock: "المخزون",
    barcode: "الباركود",
    actions: "إجراءات",
    edit: "تعديل",
    deleteBtn: "حذف",
    confirmDelete: "حذف",
    loading: "جاري التحميل...",
    nameRequired: "اكتب اسم المنتج",
    genericError: "حصل خطأ",
    salesLog: "سجل المبيعات",
    todaySales: "مبيعات النهاردة",
    todayReceipts: "فواتير النهاردة",
    allSales: "إجمالي المبيعات",
    receiptsCount: "عدد الفواتير",
    loadingSales: "جاري تحميل المبيعات...",
    noSales: "لسه مفيش مبيعات — جرب تعمل فاتورة من شاشة الكاشير",
    items: "صنف",
    quantity: "الكمية",
    lineTotal: "الإجمالي",
    notFoundTitle: "الصفحة مش موجودة",
    notFoundDesc: "الصفحة اللي بتدور عليها مش موجودة أو اتنقلت.",
    backHome: "العودة للرئيسية",
    errorTitle: "حصلت مشكلة في تحميل الصفحة",
    errorDesc: "حصل خطأ من عندنا. جرب تحدث الصفحة أو ترجع للرئيسية.",
    tryAgain: "حاول تاني",
    home: "الرئيسية",
  },
  en: {
    storeName: "Sweet Spot",
    tagline: "Grocery POS System",
    navCashier: "Cashier",
    navProducts: "Products",
    navSales: "Sales",
    searchPlaceholder: "Search by name or barcode...",
    all: "All",
    loadingProducts: "Loading products...",
    productsError: "Failed to load products",
    outOfStock: "Out of stock",
    available: "In stock",
    noMatches: "No products match your search",
    currentReceipt: "Current Receipt",
    emptyCart: "Tap any product to add it to the receipt",
    total: "Total",
    egp: "EGP",
    cash: "Cash",
    visa: "Card",
    wallet: "Wallet",
    completeSale: "Complete Sale ✅",
    saving: "Saving...",
    saleError: "Something went wrong, please try again",
    saleSuccess: "Sale recorded — receipt no.",
    increaseQty: "Increase quantity",
    decreaseQty: "Decrease quantity",
    remove: "Remove",
    addProduct: "Add New Product",
    editProduct: "Edit",
    productName: "Product name",
    category: "Category",
    sellPrice: "Sell price",
    costPrice: "Cost price",
    stockQty: "Stock quantity",
    barcodeOptional: "Barcode (optional)",
    saveEdit: "Save Changes",
    addBtn: "Add Product",
    savingBtn: "Saving...",
    cancel: "Cancel",
    inventory: "Inventory",
    productCount: "products",
    lowStockCount: "low on stock",
    product: "Product",
    price: "Price",
    cost: "Cost",
    stock: "Stock",
    barcode: "Barcode",
    actions: "Actions",
    edit: "Edit",
    deleteBtn: "Delete",
    confirmDelete: "Delete",
    loading: "Loading...",
    nameRequired: "Please enter a product name",
    genericError: "Something went wrong",
    salesLog: "Sales Log",
    todaySales: "Today's sales",
    todayReceipts: "Today's receipts",
    allSales: "Total sales",
    receiptsCount: "Total receipts",
    loadingSales: "Loading sales...",
    noSales: "No sales yet — make a sale from the cashier screen",
    items: "items",
    quantity: "Qty",
    lineTotal: "Total",
    notFoundTitle: "Page not found",
    notFoundDesc: "The page you're looking for doesn't exist or has been moved.",
    backHome: "Back home",
    errorTitle: "This page didn't load",
    errorDesc: "Something went wrong on our end. Try refreshing or head back home.",
    tryAgain: "Try again",
    home: "Home",
  },
} as const;

export type TKey = keyof (typeof dict)["ar"];

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: TKey) => string;
  isRtl: boolean;
}

const Ctx = createContext<LangCtx | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = (k: TKey) => dict[lang][k] as string;

  return (
    <Ctx.Provider value={{ lang, setLang, t, isRtl: lang === "ar" }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used within LangProvider");
  return ctx;
}

/** Translate payment method values stored in Arabic. */
export function paymentLabel(value: string, lang: Lang): string {
  const map: Record<string, TKey> = {
    "نقدي": "cash",
    "فيزا": "visa",
    "محفظة": "wallet",
  };
  const key = map[value];
  return key ? dict[lang][key] : value;
}

export function fmtNum(n: number, lang: Lang) {
  return n.toLocaleString(lang === "ar" ? "ar-EG" : "en-US", {
    maximumFractionDigits: 2,
  });
}
