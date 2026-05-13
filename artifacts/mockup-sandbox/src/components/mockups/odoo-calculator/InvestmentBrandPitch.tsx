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

const TERM_LABELS: Record<TermKey, { short: string; long: string; sub: string }> = {
  monthly: { short: "Mo", long: "Monthly", sub: "Pay as you go" },
  "1year": { short: "1Y", long: "Year 1", sub: "12-month" },
  "2year": { short: "2Y", long: "Years 1-2", sub: "24-month" },
  "3year": { short: "3Y", long: "Years 1-3", sub: "36-month" },
  "4year": { short: "4Y", long: "Years 1-4", sub: "48-month" },
  "5year": { short: "5Y", long: "Years 1-5", sub: "60-month" },
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
  card: "#EEEEEE",
  cardAlt: "#F5F5F5",
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

export function InvestmentBrandPitch() {
  // — State (mirrored) —
  const [country, setCountry] = useState<Country>("US");
  const [users, setUsers] = useState(25);
  const [plan, setPlan] = useState<PlanKey>("standard");
  const [implementation, setImplementation] = useState("basic");
  const [shEnabled, setShEnabled] = useState(true);
  const [shType, setShType] = useState<ShType>("shared");
  const [shWorkers, setShWorkers] = useState(3);
  const [shStorage, setShStorage] = useState(1);
  const [shStaging, setShStaging] = useState(0);
  const [internalView, setInternalView] = useState(false);

  const [selected, setSelected] = useState<Record<TermKey, boolean>>({
    monthly: true, "1year": true, "2year": false, "3year": true, "4year": false, "5year": true,
  });

  const [discounts, setDiscounts] = useState<Record<TermKey, { plan: number; impl: number }>>({
    monthly: { plan: 0, impl: 5 },
    "1year": { plan: 0, impl: 5 },
    "2year": { plan: 5, impl: 5 },
    "3year": { plan: 10, impl: 5 },
    "4year": { plan: 10, impl: 5 },
    "5year": { plan: 10, impl: 5 },
  });

  const config = COUNTRIES[country];
  const fmt0 = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: config.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);

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
    const planDisc = discounts[termKey].plan;
    const implDisc = discounts[termKey].impl;
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
    activeTerms, country, users, plan, implementation, shEnabled, shType, shWorkers, shStorage, shStaging, discounts,
  ]);

  // Find best deal (lowest per-month for non-monthly terms)
  const bestQuote = useMemo(() => {
    const nonMo = quotes.filter((q) => !q.isMonthly);
    if (!nonMo.length) return null;
    return nonMo.reduce((min, q) => (q.perMonth < min.perMonth ? q : min), nonMo[0]);
  }, [quotes]);

  // ─── Sidebar atoms (marker-pitch style) ───────────────────────────────

  const SectionLabel = ({ children, icon: Icon, color = BRAND.blue }: {
    children: React.ReactNode; icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color?: string;
  }) => (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="w-4 h-4" style={{ color: BRAND.ink }} />}
      <h3
        className="text-base"
        style={{ fontFamily: FONT_BRUSH, color: BRAND.ink, letterSpacing: "0.02em" }}
      >
        <Marker color={color} opacity={0.7} height="40%">{children}</Marker>
      </h3>
    </div>
  );

  const PillButton = ({
    active, onClick, children, color = BRAND.purple, testId,
  }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string; testId?: string }) => (
    <button
      onClick={onClick}
      data-testid={testId}
      className="flex-1 py-2 px-3 text-sm font-medium rounded-2xl transition-all"
      style={{
        background: active ? color : BRAND.card,
        color: active ? "#FFFFFF" : BRAND.ink,
        fontFamily: FONT_BODY,
        boxShadow: active ? `0 2px 0 ${color}` : "none",
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
      {/* ── HEADER ── */}
      <header
        className="flex-shrink-0 h-14 px-6 flex items-center justify-between sticky top-0 z-30"
        style={{ background: BRAND.paper, borderBottom: "1px solid #ECECEC" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-2xl"
            style={{ fontFamily: FONT_BRUSH, color: BRAND.purple, letterSpacing: "-0.01em" }}
          >
            odoo
          </span>
          <span className="text-xs uppercase tracking-[0.25em] text-stone-400 font-medium">
            Pricing Pitch
          </span>
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white"
            style={{ background: BRAND.purple }}
          >
            Export PDF
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-56px)]">

        {/* ── LEFT SIDEBAR ── */}
        <aside
          className="w-[340px] overflow-y-auto flex-shrink-0 px-5 py-6"
          style={{ background: BRAND.paper, borderRight: "1px solid #ECECEC" }}
        >
          {/* Sidebar title */}
          <div className="mb-6">
            <h2 className="text-2xl leading-none" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
              <Marker color={BRAND.blue} opacity={0.85} height="45%">Configure</Marker>
              {" "}Your Quote
            </h2>
            <p className="mt-1 text-xs text-stone-500" style={{ fontFamily: FONT_HAND }}>
              Adjust anything · numbers update live
            </p>
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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setUsers(Math.max(1, users - 1))}
                className="w-9 h-10 flex items-center justify-center rounded-2xl transition"
                style={{ background: BRAND.card, color: BRAND.ink }}
                data-testid="button-users-minus"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={users}
                onChange={(e) => setUsers(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center font-semibold text-base h-10 rounded-2xl outline-none"
                style={{ background: BRAND.card, color: BRAND.ink, fontFamily: FONT_BODY }}
                data-testid="input-users"
              />
              <button
                onClick={() => setUsers(users + 1)}
                className="w-9 h-10 flex items-center justify-center rounded-2xl transition"
                style={{ background: BRAND.card, color: BRAND.ink }}
                data-testid="button-users-plus"
              >
                <Plus className="w-4 h-4" />
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
                className="w-full appearance-none rounded-2xl px-4 py-2.5 text-sm font-medium outline-none cursor-pointer pr-10"
                style={{ background: BRAND.card, color: BRAND.ink, fontFamily: FONT_BODY }}
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
            <div className="flex items-center justify-between mb-3">
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
              <div className="rounded-2xl p-3 space-y-3" style={{ background: BRAND.cardAlt }}>
                <div className="flex gap-2">
                  <PillButton active={shType === "shared"} onClick={() => setShType("shared")} color={BRAND.teal} testId="pill-sh-shared">Shared</PillButton>
                  <PillButton active={shType === "dedicated"} onClick={() => setShType("dedicated")} color={BRAND.teal} testId="pill-sh-dedicated">Dedicated</PillButton>
                </div>
                {[
                  { label: "Workers", key: "workers", v: shWorkers, set: setShWorkers, min: 1 },
                  { label: "Storage GB", key: "storage", v: shStorage, set: setShStorage, min: 0 },
                  { label: "Staging", key: "staging", v: shStaging, set: setShStaging, min: 0 },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
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
                    className="py-2 text-xs font-semibold rounded-2xl transition"
                    style={{
                      background: active ? BRAND.purple : BRAND.card,
                      color: active ? "#FFFFFF" : BRAND.ink,
                      fontFamily: FONT_BODY,
                    }}
                    data-testid={`pill-term-${t}`}
                  >
                    {TERM_LABELS[t].short}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[10px] text-stone-400 italic" style={{ fontFamily: FONT_HAND }}>
              Multi-year terms include cost savings & price lock
            </p>
          </div>

          {/* Discounts editor */}
          <div className="mb-5">
            <SectionLabel icon={TrendingDown} color={BRAND.coral}>Discounts %</SectionLabel>
            <div className="rounded-2xl p-3" style={{ background: BRAND.cardAlt }}>
              <div className="grid grid-cols-3 gap-2 mb-2 text-[10px] font-bold tracking-wider uppercase text-stone-500">
                <span>Term</span>
                <span className="text-center">Plan</span>
                <span className="text-center">Impl</span>
              </div>
              {activeTerms.map((t) => {
                const planApplies = t !== "monthly" && t !== "1year";
                return (
                  <div key={t} className="grid grid-cols-3 gap-2 mb-1.5 items-center">
                    <span className="text-xs font-semibold" style={{ fontFamily: FONT_BODY, color: BRAND.ink }}>
                      {TERM_LABELS[t].short}
                    </span>
                    {planApplies ? (
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={discounts[t].plan}
                        onChange={(e) =>
                          setDiscounts({
                            ...discounts,
                            [t]: { ...discounts[t], plan: Math.max(0, Math.min(50, parseInt(e.target.value) || 0)) },
                          })
                        }
                        className="w-full h-7 text-center text-xs font-semibold rounded-lg outline-none bg-white border border-stone-200 tabular-nums"
                        style={{ color: BRAND.purple, fontFamily: FONT_BODY }}
                        aria-label={`${TERM_LABELS[t].short} plan discount percent`}
                        data-testid={`input-disc-plan-${t}`}
                      />
                    ) : (
                      <div
                        className="w-full h-7 text-center text-xs rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400"
                        title="Plan discount applies to multi-year terms only"
                        aria-label={`${TERM_LABELS[t].short} plan discount not applicable`}
                      >
                        —
                      </div>
                    )}
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={discounts[t].impl}
                      onChange={(e) =>
                        setDiscounts({
                          ...discounts,
                          [t]: { ...discounts[t], impl: Math.max(0, Math.min(50, parseInt(e.target.value) || 0)) },
                        })
                      }
                      className="w-full h-7 text-center text-xs font-semibold rounded-lg outline-none bg-white border border-stone-200 tabular-nums"
                      style={{ color: "#D97706", fontFamily: FONT_BODY }}
                      aria-label={`${TERM_LABELS[t].short} implementation discount percent`}
                      data-testid={`input-disc-impl-${t}`}
                    />
                  </div>
                );
              })}
              <p className="mt-2 text-[10px] text-stone-400 italic" style={{ fontFamily: FONT_HAND }}>
                Plan % applies years 2+ · Impl % is one-time
              </p>
            </div>
          </div>
        </aside>

        {/* ── MAIN PANEL ── */}
        <main className="flex-1 overflow-y-auto px-8 py-8" style={{ background: BRAND.paper }}>

          {/* Title block (deck-style) */}
          <div className="mb-8 relative">
            <div className="flex items-baseline gap-3">
              <h1
                className="text-5xl leading-none"
                style={{ fontFamily: FONT_BRUSH, color: BRAND.ink, letterSpacing: "-0.01em" }}
              >
                Your <Marker color={BRAND.blue} opacity={0.7} height="55%">Odoo Pricing</Marker>
              </h1>
              <Sparkle className="ml-2" />
            </div>
            <p
              className="mt-2 text-lg text-stone-700"
              style={{ fontFamily: FONT_HAND }}
            >
              Subscription &amp; Implementation
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs text-stone-500" style={{ fontFamily: FONT_BODY }}>
              <span><span className="font-semibold" style={{ color: BRAND.purple }}>VEDANG PATEL</span>, Business Advisor</span>
              <span className="text-stone-300">·</span>
              <span>{users} users · {plan === "standard" ? "Standard" : "Custom"} plan</span>
              <span className="text-stone-300">·</span>
              <span>{config.label}</span>
            </div>
          </div>

          {/* ── COST COMPARISON — pitch-deck style ── */}
          <div className="mb-8">
            <h2 className="text-3xl mb-4" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
              <Marker color={BRAND.yellow} opacity={0.85} height="45%">Cost</Marker> Breakdown
            </h2>

            {/* Term pricing row — like deck slide 5: Year 1 ... Year N */}
            <div
              className="rounded-3xl p-6 mb-4 relative"
              style={{ background: BRAND.cardAlt }}
            >
              <div className="flex items-end justify-around gap-3 flex-wrap">
                {quotes.map((q) => {
                  const isBest = bestQuote && q.termKey === bestQuote.termKey && !q.isMonthly;
                  return (
                    <div key={q.termKey} className="flex-1 min-w-[120px] text-center relative">
                      <p className="text-base mb-1" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
                        {TERM_LABELS[q.termKey].long}
                      </p>
                      <p className="text-[10px] uppercase tracking-wider text-stone-400 mb-2" style={{ fontFamily: FONT_BODY }}>
                        {TERM_LABELS[q.termKey].sub}
                      </p>
                      <div className="relative inline-block px-3 py-1">
                        {isBest && <HandCircle color={BRAND.yellow} />}
                        <p
                          className="text-2xl font-bold tabular-nums relative"
                          style={{ color: BRAND.ink, fontFamily: FONT_BODY, zIndex: 1 }}
                        >
                          {q.isMonthly ? `${fmt0(q.softwareList)}` : fmt0(q.perMonth)}
                          <span className="text-xs font-normal text-stone-500">/mo</span>
                        </p>
                      </div>
                      {!q.isMonthly && (
                        <p className="text-[11px] text-stone-500 mt-1" style={{ fontFamily: FONT_HAND }}>
                          {fmt0(q.totalContract)} total
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="absolute bottom-3 right-4">
                <Sparkle color={BRAND.coral} />
              </div>
            </div>

            {/* Detailed breakdown — grey cards per cost component */}
            <div className="space-y-3">

              {/* Software License row */}
              <div className="rounded-3xl p-5" style={{ background: BRAND.cardAlt }}>
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
                {quotes.some((q) => q.year1Promo > 0 || q.multiYearSoftware > 0) && (
                  <div className="mt-2 pt-2 border-t border-stone-200/70 grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                    <span className="text-xs text-stone-500 italic" style={{ fontFamily: FONT_HAND }}>
                      Multi-year savings
                    </span>
                    {quotes.map((q) => (
                      <div key={q.termKey} className="text-right tabular-nums text-sm font-semibold" style={{ color: BRAND.purple }}>
                        {q.year1Promo + q.multiYearSoftware > 0 ? `−${fmt0(q.year1Promo + q.multiYearSoftware)}` : dash}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Implementation row */}
              {implPrice > 0 && (
                <div className="rounded-3xl p-5" style={{ background: BRAND.cardAlt }}>
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
                </div>
              )}

              {/* SH row */}
              {shEnabled && (
                <div className="rounded-3xl p-5" style={{ background: BRAND.cardAlt }}>
                  <div className="flex items-baseline justify-between mb-3">
                    <h3 className="text-xl" style={{ fontFamily: FONT_BRUSH, color: BRAND.ink }}>
                      <Marker color={BRAND.teal} opacity={0.7} height="40%">Odoo SH</Marker> Hosting
                    </h3>
                    <span className="text-xs text-stone-500" style={{ fontFamily: FONT_HAND }}>
                      {shType} · {shWorkers}w
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
                <div className="absolute top-3 right-4">
                  <Sparkle color={BRAND.coral} />
                </div>
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

          {/* ── INTERNAL · MRR / NRR — partner-only cream card ── */}
          {internalView && (
            <div
              className="mb-8 rounded-3xl p-6 relative border-2"
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
                      <Marker color={BRAND.yellow} opacity={0.85} height="45%">Payout</Marker>{" "}
                      <span style={{ color: BRAND.purple }}>Recurring Revenue</span>
                    </h3>
                    <p className="text-[11px] text-stone-500 mt-1" style={{ fontFamily: FONT_HAND }}>
                      Internal only · Payout share {Math.round(PARTNER_RECURRING_PCT * 100)}%
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
                {[
                  { label: "MRR", icon: Repeat, getValue: (q: TermQuote) => (q.softwareSubtotal + q.shSubtotal) / q.months },
                  { label: "NRR", icon: Wallet, getValue: (q: TermQuote) => ((q.softwareSubtotal + q.shSubtotal) / q.months) * PARTNER_RECURRING_PCT },
                ].map((row, idx, arr) => (
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
                        {fmt0(row.getValue(q))}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── CATALYST FINANCE — pitch deck style ── */}
          {quotes.some((q) => q.finLow > 0) && (
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
                  {APR_LOW * 100}–{APR_HIGH * 100}% APR
                </span>
              </div>

              <div className="grid gap-2" style={{ gridTemplateColumns: `1.4fr repeat(${quotes.length}, 1fr)` }}>
                <div className="text-xs">
                  <p className="font-semibold" style={{ color: BRAND.purple }}>Best Rate</p>
                  <p className="text-stone-500 italic" style={{ fontFamily: FONT_HAND }}>{APR_LOW * 100}% APR</p>
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
                  <p className="text-stone-500 italic" style={{ fontFamily: FONT_HAND }}>{APR_HIGH * 100}% APR</p>
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

export default InvestmentBrandPitch;
