import React, { useMemo, useState } from "react";
import {
  Download,
  ChevronDown,
  Users,
  Server,
  Globe,
  Sparkles,
  TrendingDown,
  Wallet,
  CreditCard,
  Check,
  Minus,
  Plus,
  FileText,
  Lock,
  Eye,
  EyeOff,
  Repeat,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

// ─── Pricing data (copied from production Calculator) ───────────────────────

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

const TERM_LABELS: Record<TermKey, { short: string; long: string; sub: string }> = {
  monthly: { short: "Mo", long: "Monthly", sub: "Pay as you go" },
  "1year": { short: "1Y", long: "1 Year", sub: "12-month term" },
  "2year": { short: "2Y", long: "2 Years", sub: "24-month term" },
  "3year": { short: "3Y", long: "3 Years", sub: "36-month term" },
  "4year": { short: "4Y", long: "4 Years", sub: "48-month term" },
  "5year": { short: "5Y", long: "5 Years", sub: "60-month term" },
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

// ─── Component ──────────────────────────────────────────────────────────────

export function InvestmentCompact() {
  // — State —
  const [country, setCountry] = useState<Country>("US");
  const [users, setUsers] = useState(25);
  const [plan, setPlan] = useState<PlanKey>("standard");
  const [implementation, setImplementation] = useState("basic");
  const [shEnabled, setShEnabled] = useState(true);
  const [shType, setShType] = useState<ShType>("shared");
  const [shWorkers, setShWorkers] = useState(3);
  const [shStorage, setShStorage] = useState(1);
  const [shStaging, setShStaging] = useState(0);

  const [selected, setSelected] = useState<Record<TermKey, boolean>>({
    monthly: true, "1year": true, "2year": false, "3year": true, "4year": false, "5year": true,
  });
  const [internalView, setInternalView] = useState(false);
  const PARTNER_RECURRING_PCT = 0.25; // Partner recurring commission share

  const [discounts, setDiscounts] = useState<Record<TermKey, { plan: number; impl: number }>>({
    monthly: { plan: 0, impl: 5 },
    "1year": { plan: 0, impl: 5 },
    "2year": { plan: 5, impl: 5 },
    "3year": { plan: 10, impl: 5 },
    "4year": { plan: 10, impl: 5 },
    "5year": { plan: 10, impl: 5 },
  });

  const config = COUNTRIES[country];
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: config.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  const fmt0 = (n: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);

  const implPrice = IMPLEMENTATIONS[country][implementation]?.price ?? 0;
  const implLabel = IMPLEMENTATIONS[country][implementation]?.label ?? "";

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

  const N = quotes.length;
  const dense = N >= 5;
  const labelColPct = dense ? 22 : 26;
  const dataColPct = N > 0 ? (100 - labelColPct) / N : 0;
  const totalSize = dense ? "text-base" : "text-xl";
  const cellPadX = dense ? "pr-2" : "pr-4";
  const sectionPadX = dense ? "px-3" : "px-4";

  // — Reusable cells —
  const HCell = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div
      className={`text-right ${cellPadX} ${className}`}
      style={{ width: `${dataColPct}%` }}
    >
      {children}
    </div>
  );
  const Lbl = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={className} style={{ width: `${labelColPct}%` }}>
      {children}
    </div>
  );
  const dash = <span className="text-stone-300">—</span>;

  // — Sidebar atoms —
  const SectionLabel = ({ children, icon: Icon }: { children: React.ReactNode; icon?: React.ComponentType<{ className?: string }> }) => (
    <div className="flex items-center gap-1.5 mb-2.5">
      {Icon && <Icon className="w-3 h-3 text-[#714B67]" />}
      <label className="text-[10px] font-semibold tracking-[0.16em] text-stone-600 uppercase">
        {children}
      </label>
    </div>
  );
  const SegBtn = ({ active, onClick, children, testId }: { active: boolean; onClick: () => void; children: React.ReactNode; testId?: string }) => (
    <button
      onClick={onClick}
      data-testid={testId}
      className={`flex-1 py-1.5 text-xs rounded transition-all ${
        active
          ? "bg-white text-stone-900 font-semibold shadow-sm"
          : "text-stone-500 font-medium hover:text-stone-800"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F7F5F0] text-stone-900 selection:bg-[#714B67] selection:text-white">
      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 h-14 bg-white border-b border-stone-200 px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-4">
          <img src="/__mockup/images/odoo-brand/odoo_logo.png" alt="Odoo" className="h-5" />
          <div className="w-px h-5 bg-stone-200" />
          <span className="text-[11px] font-semibold tracking-[0.22em] text-[#714B67] uppercase">
            Your Growth Plan
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInternalView(!internalView)}
            data-testid="button-internal-sales"
            className={`h-8 px-3 flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase rounded border transition-all ${
              internalView
                ? "bg-[#3D2A38] text-amber-200 border-[#3D2A38] shadow-sm"
                : "bg-white text-stone-600 border-stone-300 hover:border-[#714B67]/40 hover:text-[#714B67]"
            }`}
          >
            {internalView ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            Internal
          </button>
          <Button
            size="sm"
            className="h-8 text-xs bg-[#714B67] hover:bg-[#5a3b53] text-white shadow-sm"
            data-testid="button-export-pdf"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export PDF
          </Button>
        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-56px)]">
        {/* ── LEFT SIDEBAR ───────────────────────────────────────────── */}
        <aside className="w-[340px] bg-white border-r border-stone-200/70 overflow-y-auto flex-shrink-0 shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
          <div className="p-5">
            <div className="flex items-baseline justify-between mb-5 pb-3 border-b border-stone-200/60">
              <h2 className="font-serif italic text-base text-stone-800">Configure your quote</h2>
              <span className="text-[9px] font-semibold text-[#017E84] italic uppercase tracking-wider">
                · live
              </span>
            </div>

            {/* 1. Country */}
            <div className="pb-4 mb-4 border-b border-stone-200/50">
              <SectionLabel icon={Globe}>Country / Currency</SectionLabel>
              <div className="flex p-1 bg-stone-100 rounded-md">
                <SegBtn active={country === "US"} onClick={() => setCountry("US")} testId="segment-country-us">
                  USD · United States
                </SegBtn>
                <SegBtn active={country === "CA"} onClick={() => setCountry("CA")} testId="segment-country-ca">
                  CAD · Canada
                </SegBtn>
              </div>
            </div>

            {/* 2. Users */}
            <div className="pb-4 mb-4 border-b border-stone-200/50">
              <SectionLabel icon={Users}>Users</SectionLabel>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setUsers(Math.max(1, users - 1))}
                  className="w-8 h-9 flex items-center justify-center bg-stone-50 border border-stone-200 rounded text-stone-600 hover:bg-stone-100 transition"
                  data-testid="button-users-dec"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <Input
                  type="number"
                  value={users}
                  onChange={(e) => setUsers(Math.max(1, parseInt(e.target.value) || 1))}
                  className="text-center font-semibold text-base h-9 bg-stone-50 border-stone-200 focus-visible:ring-[#714B67]"
                  data-testid="input-users"
                />
                <button
                  onClick={() => setUsers(users + 1)}
                  className="w-8 h-9 flex items-center justify-center bg-stone-50 border border-stone-200 rounded text-stone-600 hover:bg-stone-100 transition"
                  data-testid="button-users-inc"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 3. Plan */}
            <div className="pb-4 mb-4 border-b border-stone-200/50">
              <SectionLabel icon={Sparkles}>Plan</SectionLabel>
              <div className="flex p-1 bg-stone-100 rounded-md">
                <SegBtn active={plan === "standard"} onClick={() => setPlan("standard")} testId="segment-plan-standard">
                  Standard
                </SegBtn>
                <SegBtn active={plan === "custom"} onClick={() => setPlan("custom")} testId="segment-plan-custom">
                  Custom
                </SegBtn>
              </div>
            </div>

            {/* 4. Implementation */}
            <div className="pb-4 mb-4 border-b border-stone-200/50">
              <SectionLabel icon={FileText}>Implementation</SectionLabel>
              <div className="relative">
                <select
                  value={implementation}
                  onChange={(e) => setImplementation(e.target.value)}
                  className="w-full appearance-none bg-stone-50 border border-stone-200 rounded-md px-3 py-2 text-sm font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#714B67]/30 cursor-pointer pr-9"
                  data-testid="select-implementation"
                >
                  {Object.entries(IMPLEMENTATIONS[country]).map(([key, v]) => (
                    <option key={key} value={key}>
                      {v.label} {v.price > 0 && `— ${fmt0(v.price)}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* 5. SH */}
            <div className="pb-4 mb-4 border-b border-stone-200/50">
              <div className="flex items-center justify-between mb-3">
                <SectionLabel icon={Server}>Odoo SH Hosting</SectionLabel>
                <Switch
                  checked={shEnabled}
                  onCheckedChange={setShEnabled}
                  className="data-[state=checked]:bg-[#017E84]"
                  data-testid="switch-sh-enabled"
                />
              </div>
              {shEnabled && (
                <div className="bg-[#FAF7F1] border border-stone-200/60 rounded-md p-3 space-y-3">
                  <div className="flex p-0.5 bg-stone-200/60 rounded">
                    <SegBtn active={shType === "shared"} onClick={() => setShType("shared")} testId="segment-sh-shared">
                      Shared
                    </SegBtn>
                    <SegBtn active={shType === "dedicated"} onClick={() => setShType("dedicated")} testId="segment-sh-dedicated">
                      Dedicated
                    </SegBtn>
                  </div>
                  {[
                    { label: "Workers", val: shWorkers, setVal: setShWorkers, min: 1, testId: "sh-workers" },
                    { label: "Storage GB", val: shStorage, setVal: setShStorage, min: 1, testId: "sh-storage" },
                    { label: "Staging", val: shStaging, setVal: setShStaging, min: 0, testId: "sh-staging" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-stone-500 font-medium">{row.label}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => row.setVal(Math.max(row.min, row.val - 1))}
                          className="w-6 h-6 flex items-center justify-center bg-white border border-stone-200 rounded text-stone-500 hover:bg-stone-100"
                          data-testid={`button-${row.testId}-dec`}
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="text-xs font-semibold w-7 text-center" data-testid={`text-${row.testId}`}>
                          {row.val}
                        </span>
                        <button
                          onClick={() => row.setVal(row.val + 1)}
                          className="w-6 h-6 flex items-center justify-center bg-white border border-stone-200 rounded text-stone-500 hover:bg-stone-100"
                          data-testid={`button-${row.testId}-inc`}
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline">
                    <span className="text-[10px] text-stone-500 italic">annual rate</span>
                    <span className="text-xs font-bold text-[#017E84] tabular-nums">
                      {fmt(shAnnualMo)}<span className="text-[9px] font-normal">/mo</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Terms */}
            <div className="pb-4 mb-4 border-b border-stone-200/50">
              <SectionLabel icon={Wallet}>Terms to Compare</SectionLabel>
              <div className="grid grid-cols-3 gap-1.5">
                {ALL_TERMS.map((t) => {
                  const active = selected[t];
                  return (
                    <button
                      key={t}
                      onClick={() => setSelected({ ...selected, [t]: !active })}
                      className={`py-1.5 text-xs rounded border transition-all ${
                        active
                          ? "bg-[#714B67] text-white border-[#714B67] font-semibold shadow-sm"
                          : "bg-white text-stone-500 border-stone-200 hover:border-stone-300"
                      }`}
                      data-testid={`button-term-${t}`}
                    >
                      {TERM_LABELS[t].short}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Discounts */}
            <div>
              <SectionLabel icon={TrendingDown}>Discounts %</SectionLabel>
              <div className="bg-[#FAF7F1] border border-stone-200/60 rounded-md overflow-hidden">
                <div
                  className="grid text-[10px] bg-[#F0EBE0]/70 text-stone-600 font-semibold uppercase tracking-wider"
                  style={{ gridTemplateColumns: `1fr repeat(${activeTerms.length || 1}, 1fr)` }}
                >
                  <div className="py-1.5 px-2 text-left">Type</div>
                  {activeTerms.map((t) => (
                    <div key={t} className="py-1.5 px-1 text-center">{TERM_LABELS[t].short}</div>
                  ))}
                </div>
                {(["plan", "impl"] as const).map((field, idx) => (
                  <div
                    key={field}
                    className={`grid text-xs ${idx === 0 ? "border-b border-stone-200/50" : ""}`}
                    style={{ gridTemplateColumns: `1fr repeat(${activeTerms.length || 1}, 1fr)` }}
                  >
                    <div className="py-1.5 px-2 text-stone-500 font-medium">
                      {field === "plan" ? "Plan" : "Impl"}
                    </div>
                    {activeTerms.map((t) => (
                      <input
                        key={t}
                        type="number"
                        min={0}
                        max={100}
                        value={discounts[t][field]}
                        onChange={(e) =>
                          setDiscounts({
                            ...discounts,
                            [t]: { ...discounts[t], [field]: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) },
                          })
                        }
                        className="py-1 px-1 text-xs text-center font-semibold text-stone-800 bg-transparent focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#714B67] focus:rounded-sm"
                        data-testid={`input-discount-${field}-${t}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── MAIN PANEL ────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto bg-[#F7F5F0]">
          {/* Sticky scenario chip */}
          <div className="sticky top-0 z-20 bg-[#F7F5F0]/95 backdrop-blur-md border-b border-stone-200 px-8 py-2.5">
            <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-stone-600">
              <span className="px-2 py-0.5 rounded bg-[#714B67] text-white text-[10px] font-bold tracking-wider">
                {config.currency}
              </span>
              <span className="font-semibold text-stone-800">{users} users</span>
              <span className="text-stone-300">·</span>
              <span>{plan === "standard" ? "Standard" : "Custom"}</span>
              <span className="text-stone-300">·</span>
              <span>{implLabel}</span>
              {shEnabled && (
                <>
                  <span className="text-stone-300">·</span>
                  <Server className="w-3 h-3 text-[#017E84]" />
                  <span>SH {shType === "shared" ? "Shared" : "Dedicated"} · {shWorkers}w</span>
                </>
              )}
              <span className="text-stone-300">·</span>
              <span className="font-semibold text-[#714B67]">{N} terms</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-[1100px] mx-auto px-8 py-8"
          >
            {/* ── PROPOSAL HEADER ───────────────────────────────── */}
            <div className="mb-7 pb-5 border-b-2 border-stone-900 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] text-[#714B67] uppercase mb-1.5">
                  Proposal · 2026
                </p>
                <h1 className="text-3xl font-serif italic text-stone-900 tracking-tight leading-none">
                  Your Growth Plan
                </h1>
              </div>
              <div className="flex gap-6 text-[11px] text-stone-500 font-medium">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-stone-400 mb-0.5">Prepared for</p>
                  <p className="text-stone-900 font-semibold">Acme Corporation</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-stone-400 mb-0.5">By</p>
                  <p className="text-stone-900 font-semibold">Odoo Advisors</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-stone-400 mb-0.5">Date</p>
                  <p className="text-stone-900 font-semibold">
                    {new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </p>
                </div>
              </div>
            </div>

            {N === 0 ? (
              <div className="py-24 text-center text-stone-400 italic">
                Select at least one term in the sidebar to compare quotes.
              </div>
            ) : (
              <>
                {/* ── COMPARISON TABLE ───────────────────────────── */}
                <div className="bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden">
                  {/* Table header */}
                  <div className="flex text-[10px] font-semibold tracking-[0.16em] uppercase text-stone-600 px-4 py-3 bg-[#FAF7F1] border-b border-stone-200/70">
                    <Lbl>Cost Component</Lbl>
                    {quotes.map((q) => (
                      <HCell key={q.termKey}>
                        <div className="text-stone-700">{TERM_LABELS[q.termKey].long}</div>
                        <div className="text-[9px] font-medium text-stone-400 normal-case tracking-normal italic mt-0.5">
                          {TERM_LABELS[q.termKey].sub}
                        </div>
                      </HCell>
                    ))}
                  </div>

                  {/* SOFTWARE LICENSE — purple band */}
                  <div className="px-4 py-4 border-l-[5px] border-[#714B67]" style={{ background: "linear-gradient(90deg, rgba(113,75,103,0.05) 0%, rgba(113,75,103,0.01) 100%)" }}>
                    <div className="flex mb-2.5 items-baseline">
                      <Lbl className="font-serif italic text-base text-stone-900">Software License</Lbl>
                      {quotes.map((q) => (
                        <HCell key={q.termKey} className="text-sm font-medium text-stone-500 tabular-nums">
                          {q.softwareList > 0 ? fmt(q.softwareList) : dash}
                          {q.isMonthly && q.softwareList > 0 && <span className="text-[10px] text-stone-400">/mo</span>}
                        </HCell>
                      ))}
                    </div>
                    {quotes.some((q) => q.year1Promo > 0) && (
                      <div className="flex text-xs mb-1.5 items-center">
                        <Lbl className="pl-4 text-stone-500">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-[#714B67]" />
                            Year-1 Promo Savings
                          </span>
                        </Lbl>
                        {quotes.map((q) => (
                          <HCell key={q.termKey} className="text-[#714B67] font-semibold tabular-nums">
                            {q.year1Promo > 0 ? `−${fmt(q.year1Promo)}` : dash}
                          </HCell>
                        ))}
                      </div>
                    )}
                    {quotes.some((q) => q.multiYearSoftware > 0) && (
                      <div className="flex text-xs mb-2.5 items-center">
                        <Lbl className="pl-4 text-stone-500">
                          <span className="inline-flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-[#714B67]" />
                            Multi-Year Discount
                          </span>
                        </Lbl>
                        {quotes.map((q) => (
                          <HCell key={q.termKey} className="text-[#714B67] font-semibold tabular-nums">
                            {q.multiYearSoftware > 0 ? `−${fmt(q.multiYearSoftware)}` : dash}
                          </HCell>
                        ))}
                      </div>
                    )}
                    <div className="flex pt-2.5 border-t border-stone-200/70 items-center">
                      <Lbl className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Subtotal</Lbl>
                      {quotes.map((q) => (
                        <HCell key={q.termKey} className="text-sm font-bold text-stone-900 tabular-nums">
                          {fmt(q.softwareSubtotal)}
                        </HCell>
                      ))}
                    </div>
                  </div>

                  {/* IMPLEMENTATION — amber band */}
                  {implPrice > 0 && (
                    <div className="px-4 py-4 border-l-[5px] border-amber-500 border-t border-stone-200/40" style={{ background: "linear-gradient(90deg, rgba(245,158,11,0.05) 0%, rgba(245,158,11,0.01) 100%)" }}>
                      <div className="flex mb-2.5 items-baseline">
                        <Lbl className="font-serif italic text-base text-stone-900">
                          Implementation
                          <span className="ml-1.5 text-[10px] not-italic font-medium text-stone-400 uppercase tracking-wider">
                            one-time
                          </span>
                        </Lbl>
                        {quotes.map((q) => (
                          <HCell key={q.termKey} className="text-sm font-medium text-stone-500 tabular-nums">
                            {fmt(q.implList)}
                          </HCell>
                        ))}
                      </div>
                      {quotes.some((q) => q.implDiscount > 0) && (
                        <div className="flex text-xs mb-2.5 items-center">
                          <Lbl className="pl-4 text-stone-500">
                            <span className="inline-flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-amber-600" />
                              Implementation Discount
                            </span>
                          </Lbl>
                          {quotes.map((q) => (
                            <HCell key={q.termKey} className="text-amber-700 font-semibold tabular-nums">
                              {q.implDiscount > 0 ? `−${fmt(q.implDiscount)}` : dash}
                            </HCell>
                          ))}
                        </div>
                      )}
                      <div className="flex pt-2.5 border-t border-stone-200/70 items-center">
                        <Lbl className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Subtotal</Lbl>
                        {quotes.map((q) => (
                          <HCell key={q.termKey} className="text-sm font-bold text-stone-900 tabular-nums">
                            {fmt(q.implSubtotal)}
                          </HCell>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SH HOSTING — teal band */}
                  {shEnabled && (
                    <div className="px-4 py-4 border-l-[5px] border-[#017E84] border-t border-stone-200/40" style={{ background: "linear-gradient(90deg, rgba(1,126,132,0.05) 0%, rgba(1,126,132,0.01) 100%)" }}>
                      <div className="flex mb-2.5 items-baseline">
                        <Lbl className="font-serif italic text-base text-stone-900">
                          Odoo SH Hosting
                          <span className="ml-1.5 text-[10px] not-italic font-medium text-stone-400 uppercase tracking-wider">
                            {shType} · {shWorkers}w
                          </span>
                        </Lbl>
                        {quotes.map((q) => (
                          <HCell key={q.termKey} className="text-sm font-medium text-stone-500 tabular-nums">
                            {q.shList > 0 ? fmt(q.shList) : dash}
                            {q.isMonthly && q.shList > 0 && <span className="text-[10px] text-stone-400">/mo</span>}
                          </HCell>
                        ))}
                      </div>
                      {quotes.some((q) => q.shMultiYear > 0) && (
                        <div className="flex text-xs mb-2.5 items-center">
                          <Lbl className="pl-4 text-stone-500">
                            <span className="inline-flex items-center gap-1">
                              <span className="w-1 h-1 rounded-full bg-[#017E84]" />
                              Multi-Year Discount
                            </span>
                          </Lbl>
                          {quotes.map((q) => (
                            <HCell key={q.termKey} className="text-[#017E84] font-semibold tabular-nums">
                              {q.shMultiYear > 0 ? `−${fmt(q.shMultiYear)}` : dash}
                            </HCell>
                          ))}
                        </div>
                      )}
                      <div className="flex pt-2.5 border-t border-stone-200/70 items-center">
                        <Lbl className="text-[11px] font-bold uppercase tracking-wider text-stone-700">Subtotal</Lbl>
                        {quotes.map((q) => (
                          <HCell key={q.termKey} className="text-sm font-bold text-stone-900 tabular-nums">
                            {fmt(q.shSubtotal)}
                          </HCell>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TOTAL CONTRACT — deep brand-purple band */}
                  <div
                    className={`flex items-center ${sectionPadX} py-5 text-white`}
                    style={{ background: "linear-gradient(135deg, #3D2A38 0%, #2D2030 100%)" }}
                  >
                    <Lbl>
                      <p className="text-[10px] font-bold tracking-[0.25em] text-amber-200/80 uppercase mb-0.5">
                        Total Contract
                      </p>
                      <p className="font-serif italic text-base text-white">All-in cost</p>
                    </Lbl>
                    {quotes.map((q) => (
                      <HCell key={q.termKey} className={`${totalSize} font-bold tabular-nums text-white`}>
                        {dense ? fmt0(q.totalContract) : fmt(q.totalContract)}
                      </HCell>
                    ))}
                  </div>

                  {/* PER-MONTH AMORTIZED */}
                  <div className="flex items-center px-4 py-3 bg-white border-t border-stone-100">
                    <Lbl>
                      <p className="text-[10px] font-bold tracking-[0.2em] text-stone-500 uppercase">
                        Per-Month Amortized
                      </p>
                    </Lbl>
                    {quotes.map((q) => (
                      <HCell key={q.termKey} className="text-sm font-semibold text-stone-700 tabular-nums">
                        {fmt0(q.perMonth)}<span className="text-[10px] text-stone-400 font-normal">/mo</span>
                      </HCell>
                    ))}
                  </div>

                  {/* SAVINGS — full-bleed teal gradient strip */}
                  <div className="flex items-center px-4 py-3.5 border-t border-stone-100" style={{ background: "linear-gradient(90deg, rgba(1,126,132,0.12) 0%, rgba(1,126,132,0.04) 100%)" }}>
                    <Lbl>
                      <div className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#017E84]" />
                        <p className="text-[10px] font-bold tracking-[0.2em] text-[#017E84] uppercase">
                          You Save vs Monthly
                        </p>
                      </div>
                    </Lbl>
                    {quotes.map((q) => (
                      <HCell key={q.termKey} className="text-base font-bold text-[#017E84] tabular-nums">
                        {q.savings > 0 ? fmt0(q.savings) : dash}
                      </HCell>
                    ))}
                  </div>
                </div>

                {/* ── INTERNAL · RECURRING REVENUE — standalone partner-only card ── */}
                {internalView && (
                  <div
                    className="mt-6 rounded-lg overflow-hidden shadow-md border"
                    style={{ background: "linear-gradient(135deg, #2D2030 0%, #1F1623 100%)", borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    <div className={`${sectionPadX} py-3 flex items-center justify-between border-b border-white/10`}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(252,211,77,0.15)" }}>
                          <Lock className="w-3.5 h-3.5 text-amber-300" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold tracking-[0.25em] text-amber-300 uppercase">
                            Internal · Recurring Revenue
                          </p>
                          <p className="text-[10px] text-stone-400 italic">
                            Partner share {Math.round(PARTNER_RECURRING_PCT * 100)}% · not visible to client
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full text-amber-200" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        Internal Only
                      </span>
                    </div>

                    <div className={`flex items-center ${sectionPadX} py-3 border-b border-white/5`}>
                      <Lbl>
                        <div className="flex items-center gap-1.5">
                          <Repeat className="w-3 h-3 text-amber-300" />
                          <p className="text-[11px] font-bold tracking-[0.2em] text-amber-300 uppercase">MRR</p>
                        </div>
                        <p className="text-[10px] text-stone-400 italic mt-0.5 ml-4">software + hosting / month</p>
                      </Lbl>
                      {quotes.map((q) => {
                        const mrr = (q.softwareSubtotal + q.shSubtotal) / q.months;
                        return (
                          <HCell key={q.termKey} className="text-sm font-bold text-white tabular-nums">
                            {fmt0(mrr)}<span className="text-[10px] text-stone-500 font-normal">/mo</span>
                          </HCell>
                        );
                      })}
                    </div>

                    <div className={`flex items-center ${sectionPadX} py-3`}>
                      <Lbl>
                        <div className="flex items-center gap-1.5">
                          <Wallet className="w-3 h-3 text-amber-300" />
                          <p className="text-[11px] font-bold tracking-[0.2em] text-amber-300 uppercase">NRR</p>
                        </div>
                        <p className="text-[10px] text-stone-400 italic mt-0.5 ml-4">net recurring · partner payout</p>
                      </Lbl>
                      {quotes.map((q) => {
                        const mrr = (q.softwareSubtotal + q.shSubtotal) / q.months;
                        const nrr = mrr * PARTNER_RECURRING_PCT;
                        return (
                          <HCell key={q.termKey} className="text-sm font-bold text-white tabular-nums">
                            {fmt0(nrr)}<span className="text-[10px] text-stone-500 font-normal">/mo</span>
                          </HCell>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── CATALYST FINANCE — calm cream card with purple accents ─── */}
                {quotes.some((q) => q.finLow > 0) && (
                  <div
                    className="mt-6 rounded-lg overflow-hidden border border-stone-200 shadow-sm"
                    style={{ background: "linear-gradient(135deg, #FAF7F1 0%, #F4EFE6 100%)" }}
                  >
                    <div className={`${sectionPadX} py-3 flex items-center justify-between border-b border-stone-200/70`}>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(113,75,103,0.1)" }}>
                          <CreditCard className="w-3.5 h-3.5 text-[#714B67]" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold tracking-[0.25em] text-[#714B67] uppercase">
                            Catalyst Finance
                          </p>
                          <p className="text-[10px] text-stone-500 italic">
                            Spread your investment · approved partners
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold tracking-wider text-stone-500 uppercase px-2 py-0.5 rounded-full bg-white border border-stone-200">
                        {APR_LOW * 100}–{APR_HIGH * 100}% APR
                      </span>
                    </div>

                    <div className={`flex items-center ${sectionPadX} py-3 border-b border-stone-200/50`}>
                      <Lbl>
                        <p className="text-[11px] font-semibold text-[#714B67]">Best Rate</p>
                        <p className="text-[10px] text-stone-500 italic">{APR_LOW * 100}% APR · qualified</p>
                      </Lbl>
                      {quotes.map((q) => (
                        <HCell key={q.termKey} className="text-sm font-bold text-stone-900 tabular-nums">
                          {q.finLow > 0 ? `${fmt0(q.finLow)}/mo` : dash}
                        </HCell>
                      ))}
                    </div>

                    <div className={`flex items-center ${sectionPadX} py-3`}>
                      <Lbl>
                        <p className="text-[11px] font-semibold text-stone-600">Standard Rate</p>
                        <p className="text-[10px] text-stone-500 italic">{APR_HIGH * 100}% APR</p>
                      </Lbl>
                      {quotes.map((q) => (
                        <HCell key={q.termKey} className="text-sm font-semibold text-stone-700 tabular-nums">
                          {q.finHigh > 0 ? `${fmt0(q.finHigh)}/mo` : dash}
                        </HCell>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── COMPACT FOOTNOTE ──────────────────────────── */}
                <p className="mt-6 text-[10px] text-stone-400 italic text-center tracking-wide">
                  Estimation only — final pricing subject to confirmation. Quote valid for 30 days.
                </p>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
