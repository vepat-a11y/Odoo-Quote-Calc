import React, { useMemo, useState } from "react";
import {
  Users,
  Server,
  Globe,
  Sparkles,
  Wallet,
  CreditCard,
  Check,
  Minus,
  Plus,
  FileText,
  Lock,
  Repeat,
  Zap,
  ArrowRight,
  TrendingDown,
  ChevronDown,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";

// ─── Pricing data (mirrored from InvestmentCompact) ─────────────────────────

type Country = "US" | "CA";
type PlanKey = "standard" | "custom";
type ShType = "shared" | "dedicated";
type TermKey = "monthly" | "1year" | "2year" | "3year" | "4year" | "5year";

const COUNTRIES: Record<Country, { label: string; currency: string; symbol: string }> = {
  US: { label: "United States", currency: "USD", symbol: "$" },
  CA: { label: "Canada", currency: "CAD", symbol: "$" },
};

const PRICING: Record<Country, Record<PlanKey, { monthly: { year1: number; year2plus: number }; yearly: { year1: number; year2plus: number } }>> = {
  US: {
    standard: { monthly: { year1: 31.1, year2plus: 38.9 }, yearly: { year1: 24.9, year2plus: 31.1 } },
    custom: { monthly: { year1: 61.1, year2plus: 76.2 }, yearly: { year1: 49.0, year2plus: 61.0 } },
  },
  CA: {
    standard: { monthly: { year1: 43.7, year2plus: 54.7 }, yearly: { year1: 35.0, year2plus: 43.7 } },
    custom: { monthly: { year1: 68.7, year2plus: 85.7 }, yearly: { year1: 55.0, year2plus: 68.7 } },
  },
};

const IMPLEMENTATIONS: Record<Country, Record<string, { label: string; price: number }>> = {
  US: {
    none: { label: "None (Self-Service)", price: 0 },
    express: { label: "Express (4h)", price: 580 },
    starter: { label: "Starter (25h)", price: 3600 },
    basic: { label: "Basic (50h)", price: 7000 },
    standard: { label: "Standard (100h)", price: 12500 },
    custom: { label: "Custom (200h)", price: 25000 },
  },
  CA: {
    none: { label: "None (Self-Service)", price: 0 },
    starter: { label: "Starter (4h)", price: 850 },
    basic: { label: "Basic (25h)", price: 5250 },
    standard: { label: "Standard (50h)", price: 10300 },
    custom: { label: "Custom (100h)", price: 18250 },
    pro: { label: "Pro (200h)", price: 36500 },
  },
};

const SH: Record<Country, Record<ShType, { yearly: { worker: number; storage: number; staging: number; base: number }; monthly: { worker: number; storage: number; staging: number; base: number } }>> = {
  US: {
    shared: {
      yearly: { worker: 57.6, storage: 0.2, staging: 14.4, base: 0 },
      monthly: { worker: 72.0, storage: 0.25, staging: 18.0, base: 0 },
    },
    dedicated: {
      yearly: { worker: 57.6, storage: 0.2, staging: 14.4, base: 480.0 },
      monthly: { worker: 72.0, storage: 0.25, staging: 18.0, base: 600.0 },
    },
  },
  CA: {
    shared: {
      yearly: { worker: 86.4, storage: 0.32, staging: 21.6, base: 0 },
      monthly: { worker: 108.0, storage: 0.4, staging: 27.0, base: 0 },
    },
    dedicated: {
      yearly: { worker: 86.4, storage: 0.32, staging: 21.6, base: 653.0 },
      monthly: { worker: 108.0, storage: 0.4, staging: 27.0, base: 816.0 },
    },
  },
};

const APR_LOW = 0.06;
const APR_HIGH = 0.13;
const PARTNER_RECURRING_PCT = 0.25;
const CAD_TO_USD = 40.12 / 54.80;
const fmtUSD0 = (n: number) =>
  `$${new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)}`;

const TERM_LABELS: Record<TermKey, { short: string; long: string; sub: string }> = {
  monthly: { short: "Mo", long: "Monthly", sub: "Pay as you go" },
  "1year": { short: "1Y", long: "1 Year", sub: "12-month" },
  "2year": { short: "2Y", long: "2 Year", sub: "24-month" },
  "3year": { short: "3Y", long: "3 Year", sub: "36-month" },
  "4year": { short: "4Y", long: "4 Year", sub: "48-month" },
  "5year": { short: "5Y", long: "5 Year", sub: "60-month" },
};

const ALL_TERMS: TermKey[] = ["monthly", "1year", "2year", "3year", "4year", "5year"];

interface TermQuote {
  termKey: TermKey;
  isMonthly: boolean;
  years: number;
  months: number;
  softwareList: number;
  year1Promo: number;
  multiYearSoftware: number;
  softwareSubtotal: number;
  implList: number;
  implDiscount: number;
  implSubtotal: number;
  shList: number;
  shMultiYear: number;
  shSubtotal: number;
  totalContract: number;
  perMonth: number;
  savings: number;
  finLow: number;
  finHigh: number;
}

// ─── Marker brand palette ──────────────────────────────────────────────────
const BRAND = {
  purple: "#714B67",
  teal: "#1ABCAA",
  blue: "#29B6F6",
  yellow: "#FFC107",
  coral: "#FF8A80",
  ink: "#1F1F1F",
  paper: "#FFFFFF",
  card: "#F6F4EF",
  cardAlt: "#FAF8F3",
  hairline: "#E8E4DA",
};

const FONT_BRUSH = `'Permanent Marker', 'Caveat Brush', cursive`;
const FONT_HAND = `'Patrick Hand', 'Architects Daughter', cursive`;
const FONT_BODY = `'Inter', 'DM Sans', sans-serif`;

// ─── Marker highlight (skewed colored bar behind text) ─────────────────────
const Marker = ({
  children,
  color = BRAND.blue,
  height = "55%",
  opacity = 0.85,
  underline = false,
}: {
  children: React.ReactNode;
  color?: string;
  height?: string;
  opacity?: number;
  underline?: boolean;
}) => (
  <span className="relative inline-block">
    <span
      aria-hidden
      className="absolute left-0 right-0 pointer-events-none"
      style={{
        bottom: underline ? "-4px" : "8%",
        height: underline ? "8px" : height,
        background: color,
        opacity,
        transform: `skewX(-4deg) rotate(${underline ? -1 : 0}deg)`,
        borderRadius: underline ? "999px" : "3px",
        zIndex: 0,
      }}
    />
    <span className="relative" style={{ zIndex: 1 }}>{children}</span>
  </span>
);

// ─── Hand-drawn squiggle underline (SVG) ───────────────────────────────────
const Squiggle = ({ color = BRAND.blue, width = 120 }: { color?: string; width?: number }) => (
  <svg viewBox="0 0 120 12" width={width} height={12} style={{ display: "block" }}>
    <path
      d="M 2 7 Q 12 2, 24 6 T 48 7 T 72 5 T 96 7 T 118 6"
      stroke={color}
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
      opacity="0.85"
    />
  </svg>
);

// ─── Hand-drawn circle (for highlighting best value) ────────────────────────
const HandCircle = ({ color = BRAND.yellow, className = "" }: { color?: string; className?: string }) => (
  <svg viewBox="0 0 120 60" className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}>
    <ellipse
      cx="60"
      cy="30"
      rx="54"
      ry="22"
      stroke={color}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      opacity="0.9"
      transform="rotate(-3 60 30)"
    />
  </svg>
);

// ─── Tiny red sparkle decoration (like deck corners) ───────────────────────
const Sparkle = ({ className = "", color = BRAND.coral }: { className?: string; color?: string }) => (
  <svg viewBox="0 0 24 24" className={className} width="20" height="20" fill="none">
    <g stroke={color} strokeWidth="1.8" strokeLinecap="round">
      <line x1="12" y1="2" x2="12" y2="7" />
      <line x1="12" y1="17" x2="12" y2="22" />
      <line x1="2" y1="12" x2="7" y2="12" />
      <line x1="17" y1="12" x2="22" y2="12" />
      <line x1="5" y1="5" x2="8.5" y2="8.5" />
      <line x1="15.5" y1="15.5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="15.5" y2="8.5" />
      <line x1="8.5" y1="15.5" x2="5" y2="19" />
    </g>
  </svg>
);

// ─── Hand-drawn arrow (for between cards) ──────────────────────────────────
const HandArrow = ({ color = BRAND.teal, className = "" }: { color?: string; className?: string }) => (
  <svg viewBox="0 0 60 16" width="60" height="16" className={className}>
    <path
      d="M 4 8 Q 20 4, 38 8 T 54 8"
      stroke={color}
      strokeWidth="2.2"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 50 4 L 56 8 L 50 12"
      stroke={color}
      strokeWidth="2.2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Component ──────────────────────────────────────────────────────────────

export function Calculator() {
  // — State (mirrored) —
  const [country, setCountry] = useState<Country>("US");
  const [users, setUsers] = useState(1);
  const [plan, setPlan] = useState<PlanKey>("standard");
  const [implementation, setImplementation] = useState("none");
  const [shEnabled, setShEnabled] = useState(false);
  const [shType, setShType] = useState<ShType>("shared");
  const [shWorkers, setShWorkers] = useState(3);
  const [shStorage, setShStorage] = useState(1);
  const [shStaging, setShStaging] = useState(0);
  const [internalView, setInternalView] = useState(false);
  const [showFinancing, setShowFinancing] = useState(false);

  const [selected, setSelected] = useState<Record<TermKey, boolean>>({
    monthly: true, "1year": false, "2year": false, "3year": false, "4year": false, "5year": false,
  });

  const [discountsEnabled, setDiscountsEnabled] = useState(false);
  const [discounts, setDiscounts] = useState<Record<TermKey, { plan: number; impl: number }>>({
    monthly: { plan: 0, impl: 0 },
    "1year": { plan: 0, impl: 0 },
    "2year": { plan: 0, impl: 0 },
    "3year": { plan: 0, impl: 0 },
    "4year": { plan: 0, impl: 0 },
    "5year": { plan: 0, impl: 0 },
  });

  const config = COUNTRIES[country];
  const fmt0 = (n: number) =>
    `${config.symbol}${new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n)}`;

  const implPrice = IMPLEMENTATIONS[country][implementation]?.price ?? 0;

  const shMonthlyAt = (annual: boolean) => {
    if (!shEnabled) return 0;
    const p = annual ? SH[country][shType].yearly : SH[country][shType].monthly;
    return p.base + shWorkers * p.worker + shStorage * p.storage + shStaging * p.staging;
  };
  const shAnnualMo = shMonthlyAt(true);
  const shMonthlyMo = shMonthlyAt(false);

  // — Compute one term —
  const compute = (termKey: TermKey): TermQuote => {
    const isMonthly = termKey === "monthly";
    const years = isMonthly ? 0 : parseInt(termKey.replace("year", ""));
    const months = isMonthly ? 1 : years * 12;
    const planDisc = discountsEnabled ? discounts[termKey].plan : 0;
    const implDisc = discountsEnabled ? discounts[termKey].impl : 0;
    const yY1 = PRICING[country][plan].yearly.year1;
    const yY2 = PRICING[country][plan].yearly.year2plus;
    const mY1 = PRICING[country][plan].monthly.year1;
    const mY2 = PRICING[country][plan].monthly.year2plus;

    let softwareList = 0, year1Promo = 0, multiYearSoftware = 0, softwareSubtotal = 0;
    if (isMonthly) {
      softwareList = users * mY1;
      softwareSubtotal = softwareList;
    } else if (years === 1) {
      softwareList = users * yY2 * 12;
      year1Promo = users * (yY2 - yY1) * 12;
      softwareSubtotal = users * yY1 * 12;
    } else {
      softwareList = users * yY2 * 12 * years;
      year1Promo = users * (yY2 - yY1) * 12;
      multiYearSoftware = users * yY2 * 12 * (years - 1) * (planDisc / 100);
      softwareSubtotal = softwareList - year1Promo - multiYearSoftware;
    }
    const implList = implPrice;
    const implDiscount = implList * (implDisc / 100);
    const implSubtotal = implList - implDiscount;

    let shList = 0, shMultiYear = 0, shSubtotal = 0;
    if (shEnabled) {
      if (isMonthly) {
        shList = shMonthlyMo;
        shSubtotal = shList;
      } else if (years === 1) {
        shList = shAnnualMo * 12;
        shSubtotal = shList;
      } else {
        shList = shAnnualMo * 12 * years;
        shMultiYear = shAnnualMo * 12 * (years - 1) * (planDisc / 100);
        shSubtotal = shList - shMultiYear;
      }
    }
    const totalContract = softwareSubtotal + implSubtotal + shSubtotal;
    const perMonth = totalContract / months;

    let savings = 0;
    if (!isMonthly) {
      const fullMonthlySoftware = years === 1 ? users * mY1 * 12 : users * mY2 * months;
      const fullMonthlySh = shEnabled ? shMonthlyMo * months : 0;
      savings = (fullMonthlySoftware - softwareSubtotal) + (fullMonthlySh - shSubtotal) + implDiscount;
    }

    let finLow = 0, finHigh = 0;
    if (!isMonthly && totalContract > 0) {
      const pmt = (rate: number) => {
        const r = rate / 12;
        return (totalContract * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
      };
      finLow = pmt(APR_LOW);
      finHigh = pmt(APR_HIGH);
    }

    return {
      termKey, isMonthly, years, months,
      softwareList, year1Promo, multiYearSoftware, softwareSubtotal,
      implList, implDiscount, implSubtotal,
      shList, shMultiYear, shSubtotal,
      totalContract, perMonth, savings, finLow, finHigh,
    };
  };

  const activeTerms = useMemo(() => ALL_TERMS.filter((t) => selected[t]), [selected]);
  const quotes = useMemo(() => activeTerms.map(compute), [
    activeTerms, country, users, plan, implementation, shEnabled, shType, shWorkers, shStorage, shStaging, discountsEnabled, discounts,
  ]);

  // Find best deal (lowest per-month for non-monthly terms)
  const bestQuote = useMemo(() => {
    const nonMo = quotes.filter((q) => !q.isMonthly);
    if (!nonMo.length) return null;
    return nonMo.reduce((min, q) => (q.perMonth < min.perMonth ? q : min), nonMo[0]);
  }, [quotes]);

  // ─── Sidebar atoms (marker-pitch style) ───────────────────────────────

  const SectionLabel = ({ children, icon: Icon }: {
    children: React.ReactNode; icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color?: string;
  }) => (
    <div className="flex items-center gap-2 mb-2.5">
      {Icon && <Icon className="w-3.5 h-3.5" style={{ color: "#9A938A" }} strokeWidth={1.75} />}
      <h3
        className="text-[10px] uppercase font-semibold"
        style={{ fontFamily: FONT_BODY, color: "#7A7368", letterSpacing: "0.14em" }}
      >
        {children}
      </h3>
    </div>
  );

  const PillButton = ({
    active, onClick, children, color = BRAND.purple, testId,
  }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string; testId?: string }) => (
    <button
      onClick={onClick}
      data-testid={testId}
      className="flex-1 py-2 px-3 text-[13px] font-medium rounded-full"
      style={{
        background: active ? `${color}10` : "transparent",
        color: active ? color : "#6B6258",
        fontFamily: FONT_BODY,
        border: `1px solid ${active ? `${color}40` : "rgba(60,50,40,0.10)"}`,
      }}
    >
      {children}
    </button>
  );

  const dash = <span style={{ color: "#BBB" }}>—</span>;

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: BRAND.paper, color: BRAND.ink, fontFamily: FONT_BODY }}
    >
      {/* Print stylesheet — Export PDF / browser print (v6-scoped) */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          .v6-no-print { display: none !important; }
          .v6-body {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
          }
          .v6-main,
          .v6-main * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          .v6-main {
            overflow: visible !important;
            padding: 0 !important;
            background: #FFFFFF !important;
            width: 100% !important;
            font-size: 11px !important;
          }
          .v6-main h1 { font-size: 28px !important; }
          .v6-main h2 { font-size: 20px !important; }
          .v6-main h3 { font-size: 15px !important; }
          .v6-main .text-2xl { font-size: 16px !important; }
          .v6-main .text-xl  { font-size: 14px !important; }
          .v6-main .rounded-3xl { padding: 12px 14px !important; border-radius: 14px !important; }
          .v6-main .mb-8 { margin-bottom: 14px !important; }
          .v6-main .mb-6 { margin-bottom: 10px !important; }
          .v6-main .mb-4 { margin-bottom: 8px !important; }
          .v6-card { break-inside: avoid; page-break-inside: avoid; }
          .v6-print-only { display: block !important; }
        }
        .v6-print-only { display: none; }
      `}</style>

      {/* ── HEADER ── */}
      <header
        className="v6-no-print flex-shrink-0 h-14 px-6 flex items-center justify-between sticky top-0 z-30"
        style={{ background: BRAND.paper, borderBottom: "1px solid #ECECEC" }}
      >
        <div className="flex items-center gap-3">
          <img
            src={`${import.meta.env.BASE_URL}odoo_logo.png`}
            alt="Odoo"
            className="h-5"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInternalView(!internalView)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: internalView ? BRAND.ink : "#F5F5F5",
              color: internalView ? "#FFC107" : BRAND.ink,
              border: `1px solid ${internalView ? BRAND.ink : "#E5E5E5"}`,
            }}
            data-testid="button-internal-toggle"
          >
            {internalView ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Internal
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-all hover:opacity-90"
            style={{ background: BRAND.purple }}
            data-testid="button-export-pdf"
          >
            <Download className="w-3.5 h-3.5" />
            Export PDF
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="v6-body flex flex-1 overflow-hidden h-[calc(100vh-56px)]">

        {/* ── LEFT SIDEBAR ── */}
        <aside
          className="v6-no-print sidebar-shell w-[290px] overflow-y-auto flex-shrink-0 px-4 py-5"
          style={{
            background: "linear-gradient(180deg, #FAF8F3 0%, #F4F1E9 100%)",
            borderRight: `1px solid ${BRAND.hairline}`,
          }}
        >
          <div
            className="sidebar-elegant rounded-[22px] p-5"
            style={{
              background: BRAND.paper,
              border: "1px solid rgba(113, 75, 103, 0.08)",
              boxShadow:
                "0 1px 2px rgba(31, 31, 31, 0.03), 0 8px 24px -12px rgba(31, 31, 31, 0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
          {/* Sidebar title */}
          <div>
            <h2 className="text-base leading-none" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
              <Marker color={BRAND.blue} opacity={0.85} height="45%">Configure</Marker>
              {" "}Your Quote
            </h2>
          </div>

          {/* Country */}
          <div className="mb-5">
            <SectionLabel icon={Globe} color={BRAND.yellow}>Country</SectionLabel>
            <div className="flex gap-2">
              <PillButton active={country === "US"} onClick={() => setCountry("US")} testId="pill-country-us">USD · US</PillButton>
              <PillButton active={country === "CA"} onClick={() => setCountry("CA")} testId="pill-country-ca">CAD · Canada</PillButton>
            </div>
          </div>

          {/* Users */}
          <div className="mb-5">
            <SectionLabel icon={Users} color={BRAND.coral}>Users</SectionLabel>
            <div
              className="flex items-center rounded-full overflow-hidden"
              style={{ border: "1px solid rgba(60,50,40,0.12)", height: 36 }}
            >
              <button
                onClick={() => setUsers(Math.max(1, users - 1))}
                className="w-10 h-full flex items-center justify-center"
                style={{ color: "#6B6258", borderRight: "1px solid rgba(60,50,40,0.10)" }}
                aria-label="Decrease users"
                data-testid="button-users-minus"
              >
                <Minus className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
              <input
                type="number"
                min={1}
                value={users}
                onChange={(e) => setUsers(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 min-w-0 text-center font-semibold text-sm h-full outline-none bg-transparent tabular-nums"
                style={{ color: BRAND.ink, fontFamily: FONT_BODY }}
                data-testid="input-users"
              />
              <button
                onClick={() => setUsers(users + 1)}
                className="w-10 h-full flex items-center justify-center"
                style={{ color: "#6B6258", borderLeft: "1px solid rgba(60,50,40,0.10)" }}
                aria-label="Increase users"
                data-testid="button-users-plus"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Plan */}
          <div className="mb-5">
            <SectionLabel icon={Sparkles} color={BRAND.blue}>Plan</SectionLabel>
            <div className="flex gap-2">
              <PillButton active={plan === "standard"} onClick={() => setPlan("standard")} testId="pill-plan-standard">Standard</PillButton>
              <PillButton active={plan === "custom"} onClick={() => setPlan("custom")} testId="pill-plan-custom">Custom</PillButton>
            </div>
          </div>

          {/* Implementation */}
          <div className="mb-5">
            <SectionLabel icon={FileText} color={BRAND.yellow}>Implementation</SectionLabel>
            <div className="relative">
              <select
                value={implementation}
                onChange={(e) => setImplementation(e.target.value)}
                className="w-full appearance-none rounded-full px-4 py-2.5 text-xs font-medium outline-none cursor-pointer pr-9"
                style={{ background: "transparent", color: BRAND.ink, fontFamily: FONT_BODY, border: "1px solid rgba(60,50,40,0.12)" }}
                data-testid="select-implementation"
              >
                {Object.entries(IMPLEMENTATIONS[country]).map(([key, v]) => (
                  <option key={key} value={key}>{v.label} — {fmt0(v.price)}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: BRAND.ink }} />
            </div>
          </div>

          {/* SH Hosting */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <SectionLabel icon={Server} color={BRAND.teal}>Odoo SH</SectionLabel>
              <button
                onClick={() => setShEnabled(!shEnabled)}
                className="relative w-10 h-5 rounded-full transition-all"
                style={{ background: shEnabled ? BRAND.teal : "#D5D5D5" }}
                data-testid="switch-sh"
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                  style={{ left: shEnabled ? "22px" : "2px" }}
                />
              </button>
            </div>
            {shEnabled && (
              <div className="rounded-xl p-2.5 space-y-2" style={{ background: BRAND.cardAlt }}>
                <div className="flex gap-1.5">
                  <PillButton active={shType === "shared"} onClick={() => setShType("shared")} color={BRAND.teal} testId="pill-sh-shared">Shared</PillButton>
                  <PillButton active={shType === "dedicated"} onClick={() => setShType("dedicated")} color={BRAND.teal} testId="pill-sh-dedicated">Dedicated</PillButton>
                </div>
                {[
                  { label: "Workers", key: "workers", v: shWorkers, set: setShWorkers, min: 1 },
                  { label: "Storage GB", key: "storage", v: shStorage, set: setShStorage, min: 0 },
                  { label: "Staging", key: "staging", v: shStaging, set: setShStaging, min: 0 },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-xs">
                    <span className="text-stone-600" style={{ fontFamily: FONT_BODY }}>{row.label}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => row.set(Math.max(row.min, row.v - 1))}
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-stone-200"
                        data-testid={`button-sh-${row.key}-minus`}
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-semibold tabular-nums" data-testid={`text-sh-${row.key}`}>{row.v}</span>
                      <button
                        onClick={() => row.set(row.v + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-white border border-stone-200"
                        data-testid={`button-sh-${row.key}-plus`}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Terms */}
          <div className="mb-5">
            <SectionLabel icon={Wallet} color={BRAND.coral}>Terms to Compare</SectionLabel>
            <div className="grid grid-cols-3 gap-1.5">
              {ALL_TERMS.map((t) => {
                const active = selected[t];
                return (
                  <button
                    key={t}
                    onClick={() => setSelected({ ...selected, [t]: !active })}
                    className="py-2 text-xs font-semibold rounded-full"
                    style={{
                      background: active ? `${BRAND.purple}10` : "transparent",
                      color: active ? BRAND.purple : "#6B6258",
                      fontFamily: FONT_BODY,
                      border: `1px solid ${active ? `${BRAND.purple}40` : "rgba(60,50,40,0.10)"}`,
                    }}
                    data-testid={`pill-term-${t}`}
                  >
                    {TERM_LABELS[t].short}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Discounts editor — horizontal: rows=Plan/Impl, cols=terms */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <SectionLabel icon={TrendingDown} color={BRAND.coral}>Discounts %</SectionLabel>
              <button
                onClick={() => setDiscountsEnabled(!discountsEnabled)}
                className="relative w-10 h-5 rounded-full transition-all"
                style={{ background: discountsEnabled ? BRAND.purple : "#D5D5D5" }}
                data-testid="switch-discounts"
                aria-label="Toggle discounts"
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                  style={{ left: discountsEnabled ? "22px" : "2px" }}
                />
              </button>
            </div>
            {discountsEnabled && (
            <div className="rounded-2xl p-3" style={{ background: "transparent", border: "1px solid rgba(60,50,40,0.10)" }}>
              {/* Header: blank cell + term labels */}
              <div
                className="grid gap-1.5 mb-2 items-center"
                style={{ gridTemplateColumns: `42px repeat(${activeTerms.length}, minmax(0, 1fr))` }}
              >
                <span className="text-[10px] font-bold tracking-wider uppercase text-stone-500">Type</span>
                {activeTerms.map((t) => (
                  <span
                    key={t}
                    className="text-center text-[10px] font-bold tracking-wider uppercase text-stone-500"
                  >
                    {TERM_LABELS[t].short}
                  </span>
                ))}
              </div>
              {/* Plan row */}
              <div
                className="grid gap-1.5 mb-1.5 items-center"
                style={{ gridTemplateColumns: `42px repeat(${activeTerms.length}, minmax(0, 1fr))` }}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: BRAND.purple }}>
                  Plan
                </span>
                {activeTerms.map((t) => {
                  const planApplies = t !== "monthly" && t !== "1year";
                  return planApplies ? (
                    <input
                      key={t}
                      type="number"
                      min={0}
                      max={50}
                      value={discounts[t].plan || ""}
                      placeholder="0"
                      onChange={(e) =>
                        setDiscounts({
                          ...discounts,
                          [t]: { ...discounts[t], plan: Math.max(0, Math.min(50, parseInt(e.target.value) || 0)) },
                        })
                      }
                      className="w-full h-7 text-center text-xs font-semibold rounded-lg outline-none bg-transparent tabular-nums px-1"
                      style={{ color: BRAND.purple, fontFamily: FONT_BODY, border: "1px solid rgba(60,50,40,0.10)" }}
                      aria-label={`${TERM_LABELS[t].short} plan discount percent`}
                      data-testid={`input-disc-plan-${t}`}
                    />
                  ) : (
                    <div
                      key={t}
                      className="w-full h-7 text-center text-xs rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400"
                      title="Plan discount applies to multi-year terms only"
                      aria-label={`${TERM_LABELS[t].short} plan discount not applicable`}
                    >
                      —
                    </div>
                  );
                })}
              </div>
              {/* Impl row */}
              <div
                className="grid gap-1.5 items-center"
                style={{ gridTemplateColumns: `42px repeat(${activeTerms.length}, minmax(0, 1fr))` }}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "#D97706" }}>
                  Impl
                </span>
                {activeTerms.map((t) => (
                  <input
                    key={t}
                    type="number"
                    min={0}
                    max={50}
                    value={discounts[t].impl || ""}
                    placeholder="0"
                    onChange={(e) =>
                      setDiscounts({
                        ...discounts,
                        [t]: { ...discounts[t], impl: Math.max(0, Math.min(50, parseInt(e.target.value) || 0)) },
                      })
                    }
                    className="w-full h-7 text-center text-xs font-semibold rounded-lg outline-none bg-transparent tabular-nums px-1"
                    style={{ color: "#D97706", fontFamily: FONT_BODY, border: "1px solid rgba(60,50,40,0.10)" }}
                    aria-label={`${TERM_LABELS[t].short} implementation discount percent`}
                    data-testid={`input-disc-impl-${t}`}
                  />
                ))}
              </div>
              <p className="mt-2 text-[10px] text-stone-400 italic" style={{ fontFamily: FONT_HAND }}>
                Plan % applies years 2+ · Impl % is one-time
              </p>
            </div>
            )}
          </div>

          {/* Financing toggle */}
          <div className="mb-5">
            <div className="flex items-center justify-between">
              <SectionLabel icon={CreditCard} color={BRAND.coral}>Catalyst Finance</SectionLabel>
              <button
                onClick={() => setShowFinancing(!showFinancing)}
                className="relative w-10 h-5 rounded-full transition-all"
                style={{ background: showFinancing ? BRAND.coral : "#D5D5D5" }}
                data-testid="switch-financing"
                aria-label="Toggle Catalyst Finance section"
              >
                <span
                  className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                  style={{ left: showFinancing ? "22px" : "2px" }}
                />
              </button>
            </div>
            <p className="mt-2 text-[10px] text-stone-400 italic" style={{ fontFamily: FONT_HAND }}>
              Show monthly financing options on the quote
            </p>
          </div>
          </div>
        </aside>

        {/* ── MAIN PANEL ── */}
        <main className="v6-main flex-1 overflow-y-auto px-8 py-8" style={{ background: BRAND.paper }}>

          {/* Title block (deck-style) */}
          <div className="mb-8 relative">
            <h1
              className="text-5xl leading-none"
              style={{ fontFamily: FONT_BRUSH, color: BRAND.ink, letterSpacing: "-0.01em" }}
            >
              Your <Marker color={BRAND.blue} opacity={0.7} height="55%">Odoo Pricing</Marker>
            </h1>
            <p className="mt-3 text-xs font-bold text-stone-700" style={{ fontFamily: FONT_BODY }}>
              {users} users · {plan === "standard" ? "Standard" : "Custom"} plan · {config.label}
            </p>
          </div>

          {/* ── COST COMPARISON — pitch-deck style ── */}
          <div className="mb-8">
            {/* Term pricing row — like deck slide 5: Year 1 ... Year N */}
            <div
              className="rounded-3xl p-6 mb-4 relative"
              style={{ background: BRAND.cardAlt }}
            >
              <div
                className="grid items-end gap-2"
                style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}
              >
                <div className="self-end pb-1">
                  <h3
                    className="text-lg leading-none"
                    style={{ fontFamily: FONT_BRUSH, color: BRAND.ink, letterSpacing: "0.02em" }}
                  >
                    <Marker color={BRAND.yellow} opacity={0.75} height="45%">Amortized</Marker>
                    {" "}Cost
                  </h3>
                </div>
                {quotes.map((q) => (
                  <div key={q.termKey} className="text-right">
                    <p className="text-base mb-1" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
                      {TERM_LABELS[q.termKey].long}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2" style={{ fontFamily: FONT_BODY }}>
                      {TERM_LABELS[q.termKey].sub}
                    </p>
                    <p
                      className="text-2xl font-bold tabular-nums"
                      style={{ color: BRAND.ink, fontFamily: FONT_BODY }}
                    >
                      {q.isMonthly ? fmt0(q.softwareList) : fmt0(q.perMonth)}
                      <span className="text-xs font-normal text-stone-500">/mo</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed breakdown — grey cards per cost component */}
            <div className="space-y-3">

              {/* Software License row */}
              <div
                className="rounded-3xl p-5"
                style={{
                  background: BRAND.cardAlt,
                  boxShadow: `inset 6px 0 0 ${BRAND.blue}`,
                }}
              >
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="text-xl" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
                    <Marker color={BRAND.blue} opacity={0.7} height="40%">Software</Marker> License
                  </h3>
                  <span className="text-xs text-stone-500" style={{ fontFamily: FONT_HAND }}>
                    {users} users × {plan} plan
                  </span>
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Subtotal</span>
                  {quotes.map((q) => (
                    <div key={q.termKey} className="text-right tabular-nums font-semibold text-sm" style={{ color: BRAND.ink }}>
                      {fmt0(q.softwareSubtotal)}
                    </div>
                  ))}
                </div>
                {quotes.some((q) => q.year1Promo > 0) && (
                  <div className="mt-2 pt-2 border-t border-stone-200/70 grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                    <span className="text-sm font-semibold" style={{ color: BRAND.blue, fontFamily: FONT_HAND }}>
                      Year 1 promo
                    </span>
                    {quotes.map((q) => (
                      <div key={q.termKey} className="text-right tabular-nums text-sm font-semibold" style={{ color: BRAND.blue }}>
                        {q.year1Promo > 0 ? `−${fmt0(q.year1Promo)}` : dash}
                      </div>
                    ))}
                  </div>
                )}
                {discountsEnabled && quotes.some((q) => q.multiYearSoftware > 0) && (
                  <div className="mt-2 pt-2 border-t border-stone-200/70 grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                    <span className="text-sm font-semibold" style={{ color: BRAND.blue, fontFamily: FONT_HAND }}>
                      Multi-year discount
                    </span>
                    {quotes.map((q) => (
                      <div key={q.termKey} className="text-right tabular-nums text-sm font-semibold" style={{ color: BRAND.blue }}>
                        {q.multiYearSoftware > 0 ? `−${fmt0(q.multiYearSoftware)}` : dash}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Implementation row */}
              {implPrice > 0 && (
                <div
                  className="rounded-3xl p-5"
                  style={{
                    background: BRAND.cardAlt,
                    boxShadow: `inset 6px 0 0 #F59E0B`,
                  }}
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-xl" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
                      <Marker color={BRAND.yellow} opacity={0.85} height="40%">Implementation</Marker>
                    </h3>
                    <span className="text-xs text-stone-500" style={{ fontFamily: FONT_HAND }}>
                      one-time · {IMPLEMENTATIONS[country][implementation].label}
                    </span>
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                    <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Subtotal</span>
                    {quotes.map((q) => (
                      <div key={q.termKey} className="text-right tabular-nums font-semibold text-sm" style={{ color: BRAND.ink }}>
                        {fmt0(q.implSubtotal)}
                      </div>
                    ))}
                  </div>
                  {quotes.some((q) => q.implDiscount > 0) && (
                    <div className="mt-2 pt-2 border-t border-stone-200/70 grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                      <span className="text-sm font-semibold" style={{ color: "#D97706", fontFamily: FONT_HAND }}>
                        Implementation discount
                      </span>
                      {quotes.map((q) => (
                        <div key={q.termKey} className="text-right tabular-nums text-sm font-semibold" style={{ color: "#D97706" }}>
                          {q.implDiscount > 0 ? `−${fmt0(q.implDiscount)}` : dash}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SH row */}
              {shEnabled && (
                <div
                  className="rounded-3xl p-5"
                  style={{
                    background: BRAND.cardAlt,
                    boxShadow: `inset 6px 0 0 ${BRAND.teal}`,
                  }}
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-xl" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
                      <Marker color={BRAND.teal} opacity={0.7} height="40%">Odoo SH</Marker> Hosting
                    </h3>
                    <span className="text-xs text-stone-500" style={{ fontFamily: FONT_HAND }}>
                      {shType} · {shWorkers}w · {shStorage}GB{shStaging > 0 ? ` · ${shStaging} staging` : ""}
                    </span>
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                    <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">Subtotal</span>
                    {quotes.map((q) => (
                      <div key={q.termKey} className="text-right tabular-nums font-semibold text-sm" style={{ color: BRAND.ink }}>
                        {q.shSubtotal > 0 ? fmt0(q.shSubtotal) : dash}
                      </div>
                    ))}
                  </div>
                  {quotes.some((q) => q.shMultiYear > 0) && (
                    <div className="mt-2 pt-2 border-t border-stone-200/70 grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                      <span className="text-sm font-semibold" style={{ color: BRAND.teal, fontFamily: FONT_HAND }}>
                        Multi-year savings
                      </span>
                      {quotes.map((q) => (
                        <div key={q.termKey} className="text-right tabular-nums text-sm font-semibold" style={{ color: BRAND.teal }}>
                          {q.shMultiYear > 0 ? `−${fmt0(q.shMultiYear)}` : dash}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Total Contract — cream + purple hero (no black) */}
              <div
                className="rounded-3xl p-6 relative overflow-hidden border-2"
                style={{
                  background: "linear-gradient(135deg, #FAF7F1 0%, #F4EFE6 100%)",
                  borderColor: BRAND.purple,
                  boxShadow: `0 4px 0 ${BRAND.purple}`,
                }}
              >
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-2xl flex items-center gap-2" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
                    <Zap className="w-5 h-5" style={{ color: BRAND.teal }} />
                    <Marker color={BRAND.yellow} opacity={0.9} height="45%">Total</Marker>{" "}
                    <span style={{ color: BRAND.purple }}>Contract Value</span>
                  </h3>
                </div>
                <div className="grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                  <span className="text-xs uppercase tracking-wider font-semibold self-end" style={{ color: BRAND.purple }}>
                    All-in cost
                  </span>
                  {quotes.map((q) => (
                    <div
                      key={q.termKey}
                      className="text-right tabular-nums text-xl font-bold"
                      style={{ color: BRAND.purple, fontFamily: FONT_BODY }}
                    >
                      {fmt0(q.totalContract)}
                    </div>
                  ))}
                </div>
              </div>

              {/* You Save row */}
              {quotes.some((q) => q.savings > 0) && (
                <div className="rounded-3xl p-5 relative" style={{ background: `${BRAND.teal}1A` }}>
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-xl flex items-center gap-2" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
                      <Check className="w-5 h-5" style={{ color: BRAND.teal }} />
                      You <Marker color={BRAND.teal} opacity={0.6} height="40%">Save</Marker> vs Monthly
                    </h3>
                    <span className="text-xs italic" style={{ color: BRAND.teal, fontFamily: FONT_HAND }}>
                      cost savings + price lock
                    </span>
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                    <span className="text-xs uppercase tracking-wider text-stone-600 font-semibold">Total saved</span>
                    {quotes.map((q) => (
                      <div key={q.termKey} className="text-right tabular-nums font-bold text-base" style={{ color: BRAND.teal }}>
                        {q.savings > 0 ? fmt0(q.savings) : dash}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* ── INTERNAL · MRR / NRR — partner-only cream card (never printed) ── */}
          {internalView && (
            <div
              className="v6-no-print mb-8 rounded-3xl p-6 relative border-2"
              style={{
                background: "linear-gradient(135deg, #FAF7F1 0%, #F4EFE6 100%)",
                borderColor: BRAND.purple,
                borderStyle: "dashed",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: `${BRAND.purple}1A` }}
                  >
                    <Lock className="w-4 h-4" style={{ color: BRAND.purple }} />
                  </div>
                  <div>
                    <h3 className="text-xl leading-none" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
                      <Marker color={BRAND.yellow} opacity={0.85} height="45%">Payout</Marker>
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-1" style={{ fontFamily: FONT_HAND }}>
                      <strong className="font-bold text-stone-700">Internal only · USD</strong>
                    </p>
                  </div>
                </div>
                <span
                  className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full text-white"
                  style={{ background: BRAND.purple }}
                >
                  Internal
                </span>
              </div>

              <div className="rounded-2xl bg-white/60 border border-stone-200 overflow-hidden">
                {/* Header row — term labels */}
                <div
                  className="grid items-center px-4 py-2 border-b border-stone-200"
                  style={{ gridTemplateColumns: `1.1fr repeat(${quotes.length}, 1fr)` }}
                >
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400">Metric</span>
                  {quotes.map((q) => (
                    <span
                      key={q.termKey}
                      className="text-right text-[10px] font-bold tracking-[0.15em] uppercase text-stone-500"
                    >
                      {TERM_LABELS[q.termKey].short}
                    </span>
                  ))}
                </div>
                {(() => {
                  const fx = country === "CA" ? CAD_TO_USD : 1;
                  const hasImpl = quotes.some((q) => q.implSubtotal > 0);
                  const rows = [
                    { label: "MRR", icon: Repeat, getValue: (q: TermQuote) => ((q.softwareSubtotal + q.shSubtotal) / q.months) * fx },
                    ...(hasImpl ? [{ label: "NRR", icon: Wallet, getValue: (q: TermQuote) => q.implSubtotal * fx }] : []),
                  ];
                  return rows;
                })().map((row, idx, arr) => (
                  <div
                    key={row.label}
                    className={`grid items-center px-4 py-3 ${idx < arr.length - 1 ? "border-b border-stone-200/60" : ""}`}
                    style={{ gridTemplateColumns: `1.1fr repeat(${quotes.length}, 1fr)` }}
                  >
                    <div className="flex items-center gap-1.5">
                      <row.icon className="w-3.5 h-3.5" style={{ color: BRAND.purple }} />
                      <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: BRAND.purple }}>
                        {row.label}
                      </span>
                    </div>
                    {quotes.map((q) => (
                      <span
                        key={q.termKey}
                        className="text-right text-sm font-semibold tabular-nums"
                        style={{ color: BRAND.ink }}
                      >
                        {fmtUSD0(row.getValue(q))}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CATALYST FINANCE — pitch deck style ── */}
          {showFinancing && quotes.some((q) => q.finLow > 0) && (
            <div className="mb-8 rounded-3xl p-6" style={{ background: BRAND.cardAlt }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: `${BRAND.purple}1A` }}
                  >
                    <CreditCard className="w-4 h-4" style={{ color: BRAND.purple }} />
                  </div>
                  <div>
                    <h3 className="text-xl leading-none" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
                      <Marker color={BRAND.coral} opacity={0.7} height="45%">Catalyst</Marker> Finance
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-1" style={{ fontFamily: FONT_HAND }}>
                      Spread your investment · approved partners
                    </p>
                  </div>
                </div>
                <span
                  className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white border border-stone-200"
                  style={{ color: BRAND.purple }}
                >
                  {Math.round(APR_LOW * 100)}–{Math.round(APR_HIGH * 100)}% APR
                </span>
              </div>

              <div className="grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                <div className="text-xs">
                  <p className="font-semibold" style={{ color: BRAND.purple }}>Best Rate</p>
                  <p className="text-stone-500 italic" style={{ fontFamily: FONT_HAND }}>{Math.round(APR_LOW * 100)}% APR</p>
                </div>
                {quotes.map((q) => (
                  <div key={q.termKey} className="text-right tabular-nums font-bold text-sm" style={{ color: BRAND.ink }}>
                    {q.finLow > 0 ? `${fmt0(q.finLow)}/mo` : dash}
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-stone-200/60 grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                <div className="text-xs">
                  <p className="font-semibold text-stone-600">Standard Rate</p>
                  <p className="text-stone-500 italic" style={{ fontFamily: FONT_HAND }}>{Math.round(APR_HIGH * 100)}% APR</p>
                </div>
                {quotes.map((q) => (
                  <div key={q.termKey} className="text-right tabular-nums font-semibold text-sm text-stone-700">
                    {q.finHigh > 0 ? `${fmt0(q.finHigh)}/mo` : dash}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── WHAT MAKES ODOO DIFFERENT (deck slide 6) ── */}
          <div className="mb-6">
            <h2 className="text-2xl mb-4" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
              What Makes Odoo <Marker color={BRAND.blue} underline>Different?</Marker>
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { title: "Free Trial", body: "Experience the UI of the product", color: BRAND.blue },
                { title: "Immediate Pricing", body: "See pricing in the 1st meeting", color: BRAND.yellow },
                { title: "Live Demo", body: "See how the product actually works", color: BRAND.coral },
              ].map((card) => (
                <div key={card.title} className="rounded-3xl p-5 text-center" style={{ background: BRAND.cardAlt }}>
                  <h4 className="text-lg mb-2" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
                    <Marker color={card.color} opacity={0.5} height="35%">{card.title}</Marker>
                  </h4>
                  <p className="text-sm text-stone-700" style={{ fontFamily: FONT_HAND }}>{card.body}</p>
                </div>
              ))}
            </div>
            <p className="text-center mt-4 text-sm italic" style={{ color: BRAND.purple, fontFamily: FONT_HAND }}>
              To make you confident in your investment
            </p>
          </div>

          {/* Footer note */}
          <div className="text-center pt-4 border-t border-stone-100">
            <p className="text-xs text-stone-400" style={{ fontFamily: FONT_HAND }}>
              Estimation only · Final pricing subject to confirmation · Quote valid 30 days
            </p>
          </div>

        </main>
      </div>
    </div>
  );
}

export default Calculator;
