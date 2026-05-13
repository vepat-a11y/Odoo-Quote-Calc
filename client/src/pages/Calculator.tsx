import { useState } from 'react';
import { Save, FileText, TrendingUp, DollarSign, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button, Select } from '@/components/ui-custom';
import { useCreateQuote } from '@/hooks/use-quotes';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

// === CONSTANTS & TYPES ===

type Country = 'US' | 'CA';

const COUNTRY_CONFIG = {
  US: { label: 'United States', currency: 'USD', symbol: '$', flag: '🇺🇸' },
  CA: { label: 'Canada', currency: 'CAD', symbol: '$', flag: '🇨🇦' }
};

const PRICING = {
  US: {
    standard: {
      monthly: { year1: 31.10, year2plus: 38.90 },
      yearly: { year1: 24.90, year2plus: 31.10 }
    },
    custom: {
      monthly: { year1: 61.10, year2plus: 76.20 },
      yearly: { year1: 49.00, year2plus: 61.00 }
    }
  },
  CA: {
    standard: {
      monthly: { year1: 43.70, year2plus: 54.70 },
      yearly: { year1: 35.00, year2plus: 43.70 }
    },
    custom: {
      monthly: { year1: 68.70, year2plus: 85.70 },
      yearly: { year1: 55.00, year2plus: 68.70 }
    }
  }
};

const IMPLEMENTATIONS = {
  US: {
    none: { label: 'None (Self-Service)', hours: 0, price: 0 },
    express: { label: 'Express (4h)', hours: 4, price: 580 },
    starter: { label: 'Starter (25h)', hours: 25, price: 3600 },
    basic: { label: 'Basic (50h)', hours: 50, price: 7000 },
    standard: { label: 'Standard (100h)', hours: 100, price: 12500 },
    custom: { label: 'Custom (200h)', hours: 200, price: 25000 }
  },
  CA: {
    none: { label: 'None (Self-Service)', hours: 0, price: 0 },
    starter: { label: 'Starter (4h)', hours: 4, price: 850 },
    basic: { label: 'Basic (25h)', hours: 25, price: 5250 },
    standard: { label: 'Standard (50h)', hours: 50, price: 10300 },
    custom: { label: 'Custom (100h)', hours: 100, price: 18250 },
    pro: { label: 'Pro (200h)', hours: 200, price: 36500 }
  }
};

const ODOO_SH_PRICING = {
  US: {
    shared: {
      yearly: { worker: 57.60, storage: 0.20, staging: 14.40, base: 0 },
      monthly: { worker: 72.00, storage: 0.25, staging: 18.00, base: 0 },
      limits: { workerMin: 1, workerMax: 8, storageMin: 1, storageMax: 512, stagingMin: 0, stagingMax: 20 }
    },
    dedicated: {
      yearly: { worker: 57.60, storage: 0.20, staging: 14.40, base: 480.00 },
      monthly: { worker: 72.00, storage: 0.25, staging: 18.00, base: 600.00 },
      limits: { workerMin: 4, workerMax: 256, storageMin: 1, storageMax: 4096, stagingMin: 0, stagingMax: 20 }
    }
  },
  CA: {
    shared: {
      yearly: { worker: 108.00 * 0.80, storage: 0.32, staging: 21.60, base: 0 },
      monthly: { worker: 108.00, storage: 0.40, staging: 27.00, base: 0 },
      limits: { workerMin: 1, workerMax: 8, storageMin: 1, storageMax: 512, stagingMin: 0, stagingMax: 20 }
    },
    dedicated: {
      yearly: { worker: 108.00 * 0.80, storage: 0.32, staging: 21.60, base: 653.00 },
      monthly: { worker: 108.00, storage: 0.40, staging: 27.00, base: 816.00 },
      limits: { workerMin: 4, workerMax: 256, storageMin: 1, storageMax: 4096, stagingMin: 0, stagingMax: 20 }
    }
  }
};

const CATALYST_APR_LOW = 0.06;
const CATALYST_APR_HIGH = 0.13;

function pmtCalc(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

function calculateFinancingPayment(totalAmount: number, termKey: string): { low: number; high: number } {
  if (totalAmount <= 0) return { low: 0, high: 0 };
  const years = parseInt(termKey.replace('year', ''));
  if (!years || years <= 0) return { low: 0, high: 0 };
  const months = years * 12;
  return {
    low: pmtCalc(totalAmount, CATALYST_APR_LOW, months),
    high: pmtCalc(totalAmount, CATALYST_APR_HIGH, months),
  };
}

type TermKey = 'monthly' | '1year' | '2year' | '3year' | '4year' | '5year';
type ShHostingType = 'shared' | 'dedicated';

interface TermDiscounts { [key: string]: { plan: number; impl: number }; }
interface SelectedTerms { [key: string]: boolean; }

// ── Sidebar section wrapper ──
function Field({ label, children, last = false }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div style={{ borderBottom: last ? 'none' : '1px solid #EDEAE3', paddingBottom: last ? 0 : 16, marginBottom: last ? 0 : 16 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#B0ADA4', marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// ── Segmented control ──
function Segmented<T extends string>({ options, value, onChange, testPrefix }: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  testPrefix?: string;
}) {
  return (
    <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E2DB' }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          data-testid={testPrefix ? `${testPrefix}-${o.value.toLowerCase()}` : undefined}
          style={{
            flex: 1, padding: '6px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s',
            background: value === o.value ? '#714B67' : 'white',
            color: value === o.value ? 'white' : '#78716C',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Calculator() {
  const { toast } = useToast();
  const createQuote = useCreateQuote();

  const [showPayoutView, setShowPayoutView] = useState(false);
  const [country, setCountry] = useState<Country>('US');
  const [users, setUsers] = useState(10);
  const [plan, setPlan] = useState<'standard' | 'custom'>('standard');
  const [implementation, setImplementation] = useState<string>('none');
  const [implMultiplier, setImplMultiplier] = useState<number>(1);

  const [shEnabled, setShEnabled] = useState(false);
  const [shHostingType, setShHostingType] = useState<ShHostingType>('shared');
  const [shWorkers, setShWorkers] = useState(1);
  const [shStorage, setShStorage] = useState(1);
  const [shStaging, setShStaging] = useState(0);

  const [termDiscounts, setTermDiscounts] = useState<TermDiscounts>({
    monthly: { plan: 0, impl: 0 }, '1year': { plan: 0, impl: 0 }, '2year': { plan: 0, impl: 0 },
    '3year': { plan: 0, impl: 0 }, '4year': { plan: 0, impl: 0 }, '5year': { plan: 0, impl: 0 }
  });
  const [selectedTerms, setSelectedTerms] = useState<SelectedTerms>({
    monthly: true, '1year': false, '2year': false, '3year': false, '4year': false, '5year': false
  });

  const currentPricing = PRICING[country];
  const currentImplementations = IMPLEMENTATIONS[country];
  const countryConfig = COUNTRY_CONFIG[country];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: countryConfig.currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

  const handleCountryChange = (newCountry: Country) => {
    setCountry(newCountry);
    setImplementation('none');
  };

  const shLimits = ODOO_SH_PRICING[country][shHostingType].limits;

  const calculateShMonthlyCost = (isAnnual: boolean) => {
    if (!shEnabled) return 0;
    const p = isAnnual ? ODOO_SH_PRICING[country][shHostingType].yearly : ODOO_SH_PRICING[country][shHostingType].monthly;
    return p.base + shWorkers * p.worker + shStorage * p.storage + shStaging * p.staging;
  };

  const calculateTermQuote = (termKey: TermKey, planDiscount: number, implDiscount: number) => {
    const isMonthly = termKey === 'monthly';
    const years = isMonthly ? 1 : parseInt(termKey.replace('year', ''));
    const months = isMonthly ? 1 : years * 12;

    const monthlyPlanYear1 = currentPricing[plan].monthly.year1;
    const monthlyPlanYear2Plus = currentPricing[plan].monthly.year2plus;
    const yearlyPlanYear1 = currentPricing[plan].yearly.year1;
    const yearlyPlanYear2Plus = currentPricing[plan].yearly.year2plus;

    let totalSoftwareCost = 0;
    let softwareCostBeforeDiscount = 0;

    if (isMonthly) {
      const year1Cost = users * monthlyPlanYear1 * 1;
      softwareCostBeforeDiscount = year1Cost;
      totalSoftwareCost = year1Cost;
    } else {
      const fullTermAtYear2Rate = users * yearlyPlanYear2Plus * 12 * years;
      const planDiscountAmount = fullTermAtYear2Rate * (planDiscount / 100);
      const year1Benefit = users * (yearlyPlanYear2Plus - yearlyPlanYear1) * 12;
      softwareCostBeforeDiscount = fullTermAtYear2Rate - year1Benefit;
      totalSoftwareCost = fullTermAtYear2Rate - planDiscountAmount - year1Benefit;
    }

    const implData = currentImplementations[implementation as keyof typeof currentImplementations];
    const implCostBeforeDiscount = (implData?.price || 0) * implMultiplier;
    const implementationCost = implCostBeforeDiscount * (1 - implDiscount / 100);

    const shMonthlyCost = calculateShMonthlyCost(!isMonthly);
    const shTotalCost = shMonthlyCost * months;

    const totalCost = totalSoftwareCost + implementationCost + shTotalCost;
    const amortizedMonthly = totalCost / months;

    let totalSavings = 0;
    if (isMonthly) {
      totalSavings = softwareCostBeforeDiscount * (planDiscount / 100) + implCostBeforeDiscount * (implDiscount / 100);
    } else {
      const fullMonthlyTotal = years === 1
        ? users * monthlyPlanYear1 * 12
        : users * monthlyPlanYear2Plus * months;
      totalSavings = (fullMonthlyTotal - totalSoftwareCost) + implCostBeforeDiscount * (implDiscount / 100);
    }

    let financingLow = 0, financingHigh = 0;
    if (!isMonthly) {
      const f = calculateFinancingPayment(totalCost, termKey);
      financingLow = f.low; financingHigh = f.high;
    }

    return {
      termLabel: isMonthly ? 'Monthly' : `${years} Year${years > 1 ? 's' : ''}`,
      termKey, years, totalSoftwareCost, implementationCost, shTotalCost,
      totalCost, amortizedMonthly, totalSavings, financingLow, financingHigh,
    };
  };

  const handleSaveQuote = () => {
    createQuote.mutate({ users, plan, implementation, termDiscounts, selectedTerms }, {
      onSuccess: () => toast({ title: 'Quote Saved', description: 'Configuration saved successfully.' }),
      onError: (err) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
    });
  };

  const activeTerms = Object.keys(selectedTerms).filter(k => selectedTerms[k as TermKey]) as TermKey[];
  const allQuoteData = activeTerms.map(term => ({ term, data: calculateTermQuote(term, termDiscounts[term].plan, termDiscounts[term].impl) }));

  // ── PDF Export ──
  const handleExportPDF = () => {
    const doc = new jsPDF('portrait');
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const m = 18;

    const qd = allQuoteData.map(({ data }) => data);
    if (qd.length === 0) {
      toast({ title: 'No Terms Selected', description: 'Select at least one term to export.', variant: 'destructive' });
      return;
    }

    const n = qd.length;

    // Header bar
    doc.setFillColor(113, 75, 103);
    doc.rect(0, 0, pageW, 34, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('odoo', m, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(210, 190, 205);
    doc.text('Enterprise Quote', m + 29, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('QUOTE COMPARISON', pageW - m, 20, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(210, 190, 205);
    doc.text(new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), pageW - m, 28, { align: 'right' });

    let y = 46;

    // Config summary
    doc.setFillColor(248, 246, 243);
    doc.roundedRect(m, y - 6, pageW - m * 2, 20, 2, 2, 'F');
    doc.setDrawColor(230, 226, 218);
    doc.setLineWidth(0.3);
    doc.roundedRect(m, y - 6, pageW - m * 2, 20, 2, 2, 'S');

    const implLabel = currentImplementations[implementation as keyof typeof currentImplementations]?.label || 'None';
    const cfgItems = [
      { k: 'USERS', v: String(users) },
      { k: 'PLAN', v: plan === 'standard' ? 'Standard' : 'Custom' },
      { k: 'CURRENCY', v: countryConfig.currency },
      { k: 'IMPLEMENTATION', v: implLabel },
      ...(shEnabled ? [{ k: 'SH HOSTING', v: shHostingType === 'dedicated' ? 'Dedicated' : 'Shared' }] : []),
    ];
    const iw = (pageW - m * 2 - 10) / cfgItems.length;
    cfgItems.forEach((item, i) => {
      const x = m + 5 + i * iw;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(155, 153, 148);
      doc.text(item.k, x, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(26, 25, 21);
      doc.text(item.v, x, y + 9);
    });

    y += 26;

    // Table layout
    const tW = pageW - m * 2;
    const lblW = 52;
    const colW = (tW - lblW) / n;
    const rH = 10.5;

    const hasSH = qd.some(d => d.shTotalCost > 0);
    const hasSav = qd.some(d => d.totalSavings > 0);
    const hasFin = qd.some(d => d.financingLow > 0);
    const hasImpl = qd.some(d => d.implementationCost > 0);

    const vsep = (ry: number, rh: number) => {
      doc.setDrawColor(235, 231, 225);
      doc.setLineWidth(0.2);
      doc.line(m + lblW, ry, m + lblW, ry + rh);
      for (let i = 1; i < n; i++) doc.line(m + lblW + i * colW, ry, m + lblW + i * colW, ry + rh);
    };

    // Table header
    doc.setFillColor(113, 75, 103);
    doc.roundedRect(m, y, tW, rH + 4, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text('LINE ITEM', m + 4, y + 9);
    qd.forEach((d, i) => {
      const cx = m + lblW + i * colW + colW / 2;
      doc.setFontSize(9);
      doc.text(d.termLabel.toUpperCase(), cx, y + 7, { align: 'center' });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(220, 200, 215);
      doc.text(d.termKey === 'monthly' ? 'pay as you go' : `${d.years}yr term`, cx, y + 12, { align: 'center' });
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
    });
    y += rH + 4;

    // Data rows helper
    const drawRow = (label: string, getValue: (d: typeof qd[0]) => string, rowIdx: number, bold = false) => {
      doc.setFillColor(rowIdx % 2 === 0 ? 255 : 252, rowIdx % 2 === 0 ? 255 : 251, rowIdx % 2 === 0 ? 255 : 249);
      doc.rect(m, y, tW, rH, 'F');
      doc.setDrawColor(235, 231, 225);
      doc.setLineWidth(0.2);
      doc.rect(m, y, tW, rH);
      vsep(y, rH);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(8);
      doc.setTextColor(87, 83, 78);
      doc.text(label, m + 4, y + 7);
      qd.forEach((d, i) => {
        const cx = m + lblW + i * colW + colW / 2;
        doc.setFont('helvetica', bold ? 'bold' : 'normal');
        doc.setTextColor(26, 25, 21);
        doc.text(getValue(d), cx, y + 7, { align: 'center' });
      });
      y += rH;
    };

    drawRow('Software License', d => formatCurrency(d.totalSoftwareCost), 0);
    if (hasImpl) drawRow('Implementation', d => d.implementationCost > 0 ? formatCurrency(d.implementationCost) : '—', 1);
    if (hasSH) drawRow('Odoo SH Hosting', d => d.shTotalCost > 0 ? formatCurrency(d.shTotalCost) : '—', hasImpl ? 2 : 1);

    // Total row
    doc.setFillColor(113, 75, 103);
    doc.rect(m, y, tW, rH + 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('Total Contract', m + 4, y + 9);
    qd.forEach((d, i) => {
      const cx = m + lblW + i * colW + colW / 2;
      doc.setFontSize(10);
      doc.text(formatCurrency(d.totalCost), cx, y + 9, { align: 'center' });
    });
    y += rH + 3;

    // Savings row
    if (hasSav) {
      doc.setFillColor(240, 253, 244);
      doc.rect(m, y, tW, rH, 'F');
      doc.setDrawColor(209, 250, 229);
      doc.setLineWidth(0.2);
      doc.rect(m, y, tW, rH);
      vsep(y, rH);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(22, 163, 74);
      doc.text('You Save', m + 4, y + 7);
      qd.forEach((d, i) => {
        const cx = m + lblW + i * colW + colW / 2;
        doc.setTextColor(d.totalSavings > 0 ? 22 : 187, d.totalSavings > 0 ? 163 : 247, d.totalSavings > 0 ? 74 : 208);
        doc.text(d.totalSavings > 0 ? formatCurrency(d.totalSavings) : '—', cx, y + 7, { align: 'center' });
      });
      y += rH;
    }

    // Monthly amortized
    doc.setFillColor(248, 246, 243);
    doc.rect(m, y, tW, rH, 'F');
    doc.setDrawColor(230, 226, 218);
    doc.setLineWidth(0.2);
    doc.rect(m, y, tW, rH);
    vsep(y, rH);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 75, 103);
    doc.text('Monthly Amortized', m + 4, y + 7);
    doc.setFont('helvetica', 'bold');
    qd.forEach((d, i) => {
      const cx = m + lblW + i * colW + colW / 2;
      doc.setTextColor(113, 75, 103);
      doc.text(formatCurrency(d.amortizedMonthly) + '/mo', cx, y + 7, { align: 'center' });
    });
    y += rH + 8;

    // Financing
    if (hasFin) {
      doc.setFillColor(30, 58, 95);
      doc.roundedRect(m, y, tW, 9, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(255, 255, 255);
      doc.text('CATALYST FINANCE', m + 4, y + 6.5);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(147, 197, 253);
      doc.text(`${CATALYST_APR_LOW * 100}–${CATALYST_APR_HIGH * 100}% APR`, pageW - m - 4, y + 6.5, { align: 'right' });
      y += 9;

      [
        { label: `Best Rate (${CATALYST_APR_LOW * 100}%)`, key: 'financingLow' as const },
        { label: `Standard (${CATALYST_APR_HIGH * 100}%)`, key: 'financingHigh' as const },
      ].forEach((row, ri) => {
        doc.setFillColor(239, 246, 255);
        doc.rect(m, y, tW, rH, 'F');
        doc.setDrawColor(219, 234, 254);
        doc.setLineWidth(0.2);
        doc.rect(m, y, tW, rH);
        vsep(y, rH);
        doc.setFont('helvetica', ri === 0 ? 'bold' : 'normal');
        doc.setFontSize(8);
        doc.setTextColor(30, 64, 175);
        doc.text(row.label, m + 4, y + 7);
        qd.forEach((d, i) => {
          const cx = m + lblW + i * colW + colW / 2;
          const v = d[row.key];
          doc.setTextColor(v > 0 ? 30 : 191, v > 0 ? 64 : 219, v > 0 ? 175 : 254);
          doc.text(v > 0 ? `${formatCurrency(v)}/mo` : '—', cx, y + 7, { align: 'center' });
        });
        y += rH;
      });
    }

    // Footer bar
    doc.setFillColor(113, 75, 103);
    doc.rect(0, pageH - 11, pageW, 11, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(210, 190, 205);
    doc.text('Estimation only — final pricing subject to confirmation.', m, pageH - 4);
    doc.text('Odoo Enterprise Quote Builder', pageW - m, pageH - 4, { align: 'right' });

    doc.save(`odoo-quote-${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: 'PDF Exported', description: 'Quote saved as PDF.' });
  };

  const implData = currentImplementations[implementation as keyof typeof currentImplementations];
  const configSummary = [
    `${users} users`,
    plan === 'standard' ? 'Standard' : 'Custom',
    countryConfig.currency,
    implementation !== 'none' && implData ? implData.label : null,
    shEnabled ? 'Odoo SH' : null,
  ].filter(Boolean).join(' · ');

  const TERM_LABELS: Record<string, string> = {
    monthly: 'Mo', '1year': '1Y', '2year': '2Y', '3year': '3Y', '4year': '4Y', '5year': '5Y'
  };

  // Reusable style atoms for the comparison table
  const ROW_H = 'py-3.5';
  const LBL = `text-[12.5px] font-medium pl-5 pr-3 ${ROW_H} whitespace-nowrap`;
  const VAL = `text-[13px] font-semibold text-right pr-5 pl-3 ${ROW_H}`;
  const COL_BORDER: React.CSSProperties = { borderLeft: '1px solid rgba(0,0,0,0.04)' };
  const COL_MIN: React.CSSProperties = { minWidth: 148 };

  return (
    <div className="h-screen flex flex-col" style={{ background: '#F3F2EE' }}>

      {/* ── Header ── */}
      <header
        className="flex-shrink-0 bg-white flex items-center justify-between z-50"
        style={{ height: 52, padding: '0 20px', borderBottom: '1px solid #E5E2DB', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}
      >
        <div className="flex items-center gap-3">
          <img
            src="https://odoocdn.com/openerp_website/static/src/img/assets/png/odoo_logo.png"
            alt="Odoo" style={{ height: 26 }}
          />
          <span style={{ width: 1, height: 16, background: '#E5E2DB', display: 'block' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#714B67', letterSpacing: '-0.01em' }}>Quote Builder</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={handleExportPDF}
            data-testid="button-export-pdf"
            style={{
              display: 'none',
              alignItems: 'center', gap: 6, padding: '6px 12px',
              fontSize: 11, fontWeight: 600, borderRadius: 6, cursor: 'pointer',
              border: '1px solid #E5E2DB', background: 'white', color: '#5C5A55', transition: 'background 0.15s',
            }}
            className="md:!flex"
            onMouseEnter={e => (e.currentTarget.style.background = '#F7F6F2')}
            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
          >
            <FileText style={{ width: 13, height: 13 }} />
            Export PDF
          </button>
          <Button
            onClick={handleSaveQuote}
            isLoading={createQuote.isPending}
            className="text-[11px] font-bold px-3 py-1.5 rounded-md"
            data-testid="button-save-quote"
          >
            <Save style={{ width: 12, height: 12, marginRight: 5 }} />
            Save Quote
          </Button>
        </div>
      </header>

      {/* ── Two-panel ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Sidebar ── */}
        <aside
          style={{ width: 320, flexShrink: 0, background: 'white', borderRight: '1px solid #E5E2DB', overflowY: 'auto' }}
        >
          <div style={{ padding: '20px 18px' }}>

            {/* Currency */}
            <Field label="Currency">
              <Segmented
                options={[{ value: 'US' as Country, label: 'USD' }, { value: 'CA' as Country, label: 'CAD' }]}
                value={country}
                onChange={handleCountryChange}
                testPrefix="button-currency"
              />
            </Field>

            {/* Users */}
            <Field label="Users">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setUsers(Math.max(1, users - 1))}
                  style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #E5E2DB', background: 'white', fontSize: 18, cursor: 'pointer', color: '#5C5A55', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >−</button>
                <input
                  type="number" min="1" value={users}
                  onChange={e => setUsers(parseInt(e.target.value) || 1)}
                  data-testid="input-users"
                  style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: 800, border: '1px solid #E5E2DB', borderRadius: 7, padding: '5px 8px', outline: 'none', color: '#1A1915', fontVariantNumeric: 'tabular-nums', transition: 'border-color 0.15s' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#714B67')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E5E2DB')}
                />
                <button
                  onClick={() => setUsers(users + 1)}
                  style={{ width: 32, height: 32, borderRadius: 6, border: '1px solid #E5E2DB', background: 'white', fontSize: 18, cursor: 'pointer', color: '#5C5A55', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >+</button>
              </div>
            </Field>

            {/* Plan */}
            <Field label="Plan">
              <Segmented
                options={[{ value: 'standard' as const, label: 'Standard' }, { value: 'custom' as const, label: 'Custom' }]}
                value={plan}
                onChange={setPlan}
                testPrefix="button-plan"
              />
            </Field>

            {/* Implementation */}
            <Field label="Implementation">
              <Select
                options={Object.entries(currentImplementations).map(([k, v]) => ({ value: k, label: v.label }))}
                value={implementation}
                onChange={e => setImplementation(e.target.value)}
                data-testid="select-implementation"
              />
              {implementation !== 'none' && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#F7F6F2', borderRadius: 8 }}>
                  <span style={{ fontSize: 11, color: '#9B9994' }}>×</span>
                  <input
                    type="number" min="0.1" max="10" step="0.1"
                    value={implMultiplier}
                    onChange={e => setImplMultiplier(parseFloat(e.target.value) || 1)}
                    data-testid="input-impl-multiplier"
                    style={{ width: 54, textAlign: 'center', fontSize: 13, fontWeight: 700, border: '1px solid #E5E2DB', borderRadius: 6, padding: '4px 6px', outline: 'none', background: 'white', color: '#1A1915', transition: 'border-color 0.15s' }}
                    onFocus={e => (e.currentTarget.style.borderColor = '#714B67')}
                    onBlur={e => (e.currentTarget.style.borderColor = '#E5E2DB')}
                  />
                  <span style={{ fontSize: 11, color: '#9B9994' }}>
                    = {((currentImplementations[implementation as keyof typeof currentImplementations]?.hours || 0) * implMultiplier).toFixed(0)} hrs
                  </span>
                  <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 800, color: '#017E84', fontVariantNumeric: 'tabular-nums' }}>
                    {formatCurrency((currentImplementations[implementation as keyof typeof currentImplementations]?.price || 0) * implMultiplier)}
                  </span>
                </div>
              )}
            </Field>

            {/* Odoo SH */}
            <Field label="Odoo SH Hosting">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: shEnabled ? 12 : 0 }}>
                <span style={{ fontSize: 12, color: '#5C5A55' }}>
                  {shEnabled ? (shHostingType === 'dedicated' ? 'Dedicated' : 'Shared') : 'Disabled'}
                </span>
                <button
                  onClick={() => setShEnabled(!shEnabled)}
                  data-testid="button-toggle-sh"
                  style={{ width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', position: 'relative', background: shEnabled ? '#714B67' : '#D5D2CA', transition: 'background 0.2s', flexShrink: 0 }}
                >
                  <span style={{ position: 'absolute', top: 2, left: 2, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.15)', transition: 'transform 0.2s', transform: shEnabled ? 'translateX(18px)' : 'translateX(0)' }} />
                </button>
              </div>
              {shEnabled && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ overflow: 'hidden' }}>
                  <Segmented
                    options={[{ value: 'shared' as ShHostingType, label: 'Shared' }, { value: 'dedicated' as ShHostingType, label: 'Dedicated' }]}
                    value={shHostingType}
                    onChange={v => {
                      setShHostingType(v);
                      if (v === 'shared') { setShWorkers(Math.min(Math.max(shWorkers, 1), 8)); setShStorage(Math.min(shStorage, 512)); }
                      else setShWorkers(Math.max(shWorkers, 4));
                    }}
                    testPrefix="button-sh"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
                    {[
                      { label: 'Workers', value: shWorkers, min: shLimits.workerMin, max: shLimits.workerMax, set: setShWorkers, id: 'input-sh-workers' },
                      { label: 'Storage', value: shStorage, min: shLimits.storageMin, max: shLimits.storageMax, set: setShStorage, id: 'input-sh-storage' },
                      { label: 'Staging', value: shStaging, min: shLimits.stagingMin, max: shLimits.stagingMax, set: setShStaging, id: 'input-sh-staging' },
                    ].map(({ label, value, min, max, set, id }) => (
                      <div key={label}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: '#9B9994', marginBottom: 5 }}>{label}</div>
                        <input
                          type="number" min={min} max={max} value={value}
                          onChange={e => set(Math.min(Math.max(parseInt(e.target.value) || min, min), max))}
                          data-testid={id}
                          style={{ width: '100%', textAlign: 'center', fontSize: 14, fontWeight: 800, border: '1px solid #E5E2DB', borderRadius: 7, padding: '5px 4px', outline: 'none', background: 'white', color: '#1A1915', boxSizing: 'border-box', fontVariantNumeric: 'tabular-nums', transition: 'border-color 0.15s' }}
                          onFocus={e => (e.currentTarget.style.borderColor = '#714B67')}
                          onBlur={e => (e.currentTarget.style.borderColor = '#E5E2DB')}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 11, color: '#714B67', fontVariantNumeric: 'tabular-nums', display: 'flex', gap: 10 }}>
                    <span>{formatCurrency(calculateShMonthlyCost(true))}<span style={{ color: '#9B9994', fontWeight: 400 }}>/mo annual</span></span>
                    <span style={{ color: '#D5D2CA' }}>·</span>
                    <span>{formatCurrency(calculateShMonthlyCost(false))}<span style={{ color: '#9B9994', fontWeight: 400 }}>/mo monthly</span></span>
                  </div>
                </motion.div>
              )}
            </Field>

            {/* Terms */}
            <Field label="Terms to Compare">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Object.keys(selectedTerms).map(term => (
                  <button
                    key={term}
                    onClick={() => setSelectedTerms(prev => ({ ...prev, [term]: !prev[term as TermKey] }))}
                    data-testid={`button-term-${term}`}
                    style={{
                      padding: '5px 11px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.12s',
                      border: selectedTerms[term as TermKey] ? '1.5px solid #714B67' : '1px solid #E5E2DB',
                      background: selectedTerms[term as TermKey] ? 'rgba(113,75,103,0.07)' : 'white',
                      color: selectedTerms[term as TermKey] ? '#714B67' : '#78716C',
                    }}
                  >
                    {TERM_LABELS[term]}
                  </button>
                ))}
              </div>
            </Field>

            {/* Discounts */}
            {activeTerms.length > 0 && (
              <Field label="Discounts" last>
                <div style={{ border: '1px solid #E5E2DB', borderRadius: 8, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F7F6F2' }}>
                        <th style={{ textAlign: 'left', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#9B9994', padding: '7px 10px', borderBottom: '1px solid #E5E2DB', textTransform: 'uppercase' }} />
                        {activeTerms.map(t => (
                          <th key={t} style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, color: '#714B67', padding: '7px 6px', borderBottom: '1px solid #E5E2DB', borderLeft: '1px solid #E5E2DB' }}>
                            {TERM_LABELS[t]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[{ label: 'Plan %', key: 'plan' as const }, { label: 'Impl %', key: 'impl' as const }].map(({ label, key }, ri) => (
                        <tr key={key} style={{ background: ri % 2 === 0 ? 'white' : '#FDFDFC' }}>
                          <td style={{ fontSize: 11, fontWeight: 600, color: '#78716C', padding: '5px 10px', borderBottom: ri === 0 ? '1px solid #EDEAE3' : 'none' }}>{label}</td>
                          {activeTerms.map(t => (
                            <td key={t} style={{ padding: '3px 4px', borderLeft: '1px solid #E5E2DB', borderBottom: ri === 0 ? '1px solid #EDEAE3' : 'none' }}>
                              <input
                                type="number" min="0" max="100"
                                value={termDiscounts[t]?.[key] || ''}
                                onChange={e => setTermDiscounts(prev => ({ ...prev, [t]: { ...prev[t], [key]: parseFloat(e.target.value) || 0 } }))}
                                data-testid={`input-${key}-discount-${t}`}
                                style={{ width: '100%', textAlign: 'center', fontSize: 12, fontWeight: 700, border: '1px solid transparent', borderRadius: 4, padding: '4px 2px', outline: 'none', color: '#1A1915', background: 'transparent', transition: 'all 0.12s' }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#714B67'; e.currentTarget.style.background = 'white'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Field>
            )}

          </div>
        </aside>

        {/* ── Main content ── */}
        <main style={{ flex: 1, overflowY: 'auto', background: '#F3F2EE' }}>

          {/* Summary + payout toggle */}
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', borderBottom: '1px solid #E5E2DB', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span data-testid="text-config-summary" style={{ fontSize: 12, color: '#78716C', fontWeight: 500 }}>{configSummary}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: '#9B9994' }}>
                {activeTerms.length} {activeTerms.length === 1 ? 'term' : 'terms'}
              </span>
              <button
                data-testid="toggle-payout-view"
                onClick={() => setShowPayoutView(v => !v)}
                title="Toggle partner payout view"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
                  border: showPayoutView ? '1.5px solid #D97706' : '1px solid #E5E2DB',
                  background: showPayoutView ? '#FEF3C7' : 'white',
                  color: showPayoutView ? '#92400E' : '#78716C',
                }}
              >
                <DollarSign style={{ width: 13, height: 13 }} />
                Payouts
              </button>
            </div>
          </div>

          {/* Quote area */}
          <div style={{ padding: 20 }}>
            {activeTerms.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                {(() => {
                  const hasAnySH = allQuoteData.some(q => q.data.shTotalCost > 0);
                  const hasAnyImpl = allQuoteData.some(q => q.data.implementationCost > 0);
                  const hasAnyFinancing = allQuoteData.some(q => q.data.financingLow > 0);
                  const hasAnySavings = allQuoteData.some(q => q.data.totalSavings > 0);
                  const colCount = allQuoteData.length;

                  return (
                    /* ── KEY: overflow-x: auto so table scrolls instead of clipping ── */
                    <div
                      data-testid="table-quote-comparison"
                      style={{ borderRadius: 14, border: '1px solid #DEDBD3', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', overflowX: 'auto' }}
                    >
                      <table style={{ borderCollapse: 'collapse', minWidth: '100%' }}>

                        {/* Header */}
                        <thead>
                          <tr>
                            <th className={`text-left pl-5 pr-3 py-4`} style={{ background: '#714B67', minWidth: 170, ...COL_MIN }}>
                              <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.45)' }}>Breakdown</div>
                            </th>
                            {allQuoteData.map(({ term, data }) => (
                              <th key={term} className="text-center px-4 py-4" style={{ background: '#714B67', borderLeft: '1px solid rgba(255,255,255,0.08)', ...COL_MIN }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{data.termLabel}</div>
                                <div style={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                  {term === 'monthly' ? 'Pay as you go' : `${data.years}yr commitment`}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>

                          {/* Software License */}
                          <tr style={{ background: 'white' }}>
                            <td className={LBL} style={{ color: '#5C5A55', borderBottom: '1px solid #F0EDE7' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#714B67', flexShrink: 0, display: 'inline-block' }} />
                                Software License
                              </span>
                            </td>
                            {allQuoteData.map(({ term, data }) => (
                              <td key={term} className={VAL} style={{ ...COL_BORDER, color: '#1A1915', borderBottom: '1px solid #F0EDE7', fontVariantNumeric: 'tabular-nums' }}>
                                {formatCurrency(data.totalSoftwareCost)}
                              </td>
                            ))}
                          </tr>

                          {/* Implementation */}
                          {hasAnyImpl && (
                            <tr style={{ background: '#FDFCFB' }}>
                              <td className={LBL} style={{ color: '#5C5A55', borderBottom: '1px solid #F0EDE7' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#017E84', flexShrink: 0, display: 'inline-block' }} />
                                  Implementation
                                </span>
                              </td>
                              {allQuoteData.map(({ term, data }) => (
                                <td key={term} className={VAL} style={{ ...COL_BORDER, color: '#1A1915', borderBottom: '1px solid #F0EDE7', fontVariantNumeric: 'tabular-nums' }}>
                                  {data.implementationCost > 0 ? formatCurrency(data.implementationCost) : <span style={{ color: '#CCCAC4' }}>—</span>}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* Odoo SH */}
                          {hasAnySH && (
                            <tr style={{ background: 'white' }}>
                              <td className={LBL} style={{ color: '#5C5A55', borderBottom: '1px solid #F0EDE7' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#714B67', flexShrink: 0, display: 'inline-block' }} />
                                  Odoo SH Hosting
                                </span>
                              </td>
                              {allQuoteData.map(({ term, data }) => (
                                <td key={term} className={VAL} style={{ ...COL_BORDER, color: '#1A1915', borderBottom: '1px solid #F0EDE7', fontVariantNumeric: 'tabular-nums' }}>
                                  {data.shTotalCost > 0 ? formatCurrency(data.shTotalCost) : <span style={{ color: '#CCCAC4' }}>—</span>}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* Total Contract */}
                          <tr style={{ background: '#F9F8F5' }}>
                            <td className="pl-5 pr-3 py-4" style={{ borderTop: '1.5px solid #DEDBD3', borderBottom: '1.5px solid #DEDBD3' }}>
                              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#714B67' }}>Total Contract</span>
                            </td>
                            {allQuoteData.map(({ term, data }) => (
                              <td key={term} className="text-right pr-5 pl-3 py-4" style={{ ...COL_BORDER, borderTop: '1.5px solid #DEDBD3', borderBottom: '1.5px solid #DEDBD3', fontVariantNumeric: 'tabular-nums' }}>
                                <span style={{ fontSize: 18, fontWeight: 900, color: '#1A1915', letterSpacing: '-0.02em' }}>
                                  {formatCurrency(data.totalCost)}
                                </span>
                              </td>
                            ))}
                          </tr>

                          {/* Savings */}
                          {hasAnySavings && (
                            <tr style={{ background: '#F4FDF7' }}>
                              <td className={LBL} style={{ color: '#16A34A', borderBottom: '1px solid #DCFCE7' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                                  <TrendingUp style={{ width: 13, height: 13 }} />
                                  You Save
                                </span>
                              </td>
                              {allQuoteData.map(({ term, data }) => (
                                <td key={term} className={VAL} style={{ ...COL_BORDER, borderBottom: '1px solid #DCFCE7', fontVariantNumeric: 'tabular-nums' }}>
                                  {data.totalSavings > 0
                                    ? <span style={{ fontSize: 13, fontWeight: 700, color: '#16A34A' }}>{formatCurrency(data.totalSavings)}</span>
                                    : <span style={{ color: '#CCCAC4' }}>—</span>}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* Monthly Amortized */}
                          <tr style={{ background: 'white' }}>
                            <td className={LBL} style={{ color: '#5C5A55', borderBottom: '1px solid #F0EDE7' }}>Monthly Amortized</td>
                            {allQuoteData.map(({ term, data }) => (
                              <td key={term} className={VAL} style={{ ...COL_BORDER, color: '#714B67', borderBottom: '1px solid #F0EDE7', fontVariantNumeric: 'tabular-nums' }}>
                                {formatCurrency(data.amortizedMonthly)}<span style={{ fontSize: 10, fontWeight: 400, color: '#9B9994' }}> /mo</span>
                              </td>
                            ))}
                          </tr>

                          {/* Catalyst Finance */}
                          {hasAnyFinancing && (
                            <>
                              <tr style={{ background: '#1B3A6B' }}>
                                <td colSpan={colCount + 1} style={{ padding: '9px 20px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <span style={{ width: 22, height: 22, borderRadius: 5, background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7, fontWeight: 900, color: 'white', flexShrink: 0 }}>CF</span>
                                    <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Catalyst Finance</span>
                                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'rgba(147,197,253,0.65)' }}>{CATALYST_APR_LOW * 100}–{CATALYST_APR_HIGH * 100}% APR</span>
                                  </div>
                                </td>
                              </tr>
                              <tr style={{ background: '#EEF4FF' }}>
                                <td className={LBL} style={{ color: '#1D4ED8', borderBottom: '1px solid #DBEAFE' }}>
                                  Best Rate <span style={{ fontSize: 10, fontWeight: 400, color: '#93C5FD' }}>({CATALYST_APR_LOW * 100}%)</span>
                                </td>
                                {allQuoteData.map(({ term, data }) => (
                                  <td key={term} className={VAL} style={{ ...COL_BORDER, color: '#1D4ED8', borderBottom: '1px solid #DBEAFE', fontVariantNumeric: 'tabular-nums', borderLeftColor: '#DBEAFE' }}>
                                    {data.financingLow > 0 ? <>{formatCurrency(data.financingLow)}<span style={{ fontSize: 10, fontWeight: 400, color: '#93C5FD' }}> /mo</span></> : <span style={{ color: '#BFDBFE' }}>—</span>}
                                  </td>
                                ))}
                              </tr>
                              <tr style={{ background: '#EEF4FF' }}>
                                <td className={LBL} style={{ color: '#1D4ED8' }}>
                                  Standard <span style={{ fontSize: 10, fontWeight: 400, color: '#93C5FD' }}>({CATALYST_APR_HIGH * 100}%)</span>
                                </td>
                                {allQuoteData.map(({ term, data }) => (
                                  <td key={term} className={VAL} style={{ ...COL_BORDER, color: '#1D4ED8', fontVariantNumeric: 'tabular-nums', borderLeftColor: '#DBEAFE' }}>
                                    {data.financingHigh > 0 ? <>{formatCurrency(data.financingHigh)}<span style={{ fontSize: 10, fontWeight: 400, color: '#93C5FD' }}> /mo</span></> : <span style={{ color: '#BFDBFE' }}>—</span>}
                                  </td>
                                ))}
                              </tr>
                            </>
                          )}

                          {/* Partner Payouts */}
                          {showPayoutView && (
                            <>
                              <tr style={{ background: '#7C2D12' }}>
                                <td colSpan={colCount + 1} style={{ padding: '9px 20px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <DollarSign style={{ width: 14, height: 14, color: '#FCD34D' }} />
                                    <span style={{ fontSize: 10, fontWeight: 700, color: '#FEF3C7', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Partner Payouts</span>
                                    <span style={{ marginLeft: 'auto', fontSize: 9, background: 'rgba(255,255,255,0.12)', color: '#FDE68A', padding: '2px 8px', borderRadius: 99, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Internal</span>
                                  </div>
                                </td>
                              </tr>
                              <tr style={{ background: '#FFFBEB' }}>
                                <td className={LBL} style={{ color: '#78350F', borderBottom: '1px solid #FDE68A' }}>MRR</td>
                                {allQuoteData.map(({ term, data }) => {
                                  const recurringBase = data.totalSoftwareCost + data.shTotalCost;
                                  const mrr = term === 'monthly' ? recurringBase * 0.8 : recurringBase / 12;
                                  return (
                                    <td key={term} className={VAL} style={{ ...COL_BORDER, color: '#78350F', borderBottom: '1px solid #FDE68A', borderLeftColor: '#FDE68A', fontVariantNumeric: 'tabular-nums' }}>
                                      {formatCurrency(mrr)}
                                    </td>
                                  );
                                })}
                              </tr>
                              {hasAnyImpl && (
                                <tr style={{ background: '#FFFBEB' }}>
                                  <td className={LBL} style={{ color: '#78350F' }}>NRR</td>
                                  {allQuoteData.map(({ term, data }) => (
                                    <td key={term} className={VAL} style={{ ...COL_BORDER, color: '#78350F', borderLeftColor: '#FDE68A', fontVariantNumeric: 'tabular-nums' }}>
                                      {data.implementationCost > 0 ? formatCurrency(data.implementationCost) : <span style={{ color: '#FDE68A' }}>—</span>}
                                    </td>
                                  ))}
                                </tr>
                              )}
                            </>
                          )}

                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </motion.div>
            ) : (
              /* Empty state */
              <div style={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #DDD9D0', borderRadius: 16, background: 'white' }}>
                <Info style={{ width: 32, height: 32, color: '#D5D2CB', marginBottom: 14 }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: '#78716C', marginBottom: 4 }}>No terms selected</p>
                <p style={{ fontSize: 12, color: '#9B9994' }}>Select one or more terms in the sidebar to generate a quote</p>
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
