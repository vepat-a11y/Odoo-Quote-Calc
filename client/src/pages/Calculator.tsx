import { useState } from 'react';
import {
  Code,
  Cpu,
  Save,
  Info,
  Globe,
  Server,
  HardDrive,
  Layers,
  FileText,
  TrendingUp,
  DollarSign
} from 'lucide-react';
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

// Odoo SH Pricing (USD only)
const ODOO_SH_PRICING = {
  shared: {
    yearly: {
      worker: 57.60,
      storage: 0.20,
      staging: 14.40,
      base: 0
    },
    monthly: {
      worker: 72.00,
      storage: 0.25,
      staging: 18.00,
      base: 0
    },
    limits: {
      workerMin: 1,
      workerMax: 8,
      storageMin: 1,
      storageMax: 512,
      stagingMin: 0,
      stagingMax: 20
    }
  },
  dedicated: {
    yearly: {
      worker: 57.60,
      storage: 0.20,
      staging: 14.40,
      base: 480.00
    },
    monthly: {
      worker: 72.00,
      storage: 0.25,
      staging: 18.00,
      base: 600.00
    },
    limits: {
      workerMin: 4,
      workerMax: 256,
      storageMin: 1,
      storageMax: 4096,
      stagingMin: 0,
      stagingMax: 20
    }
  }
};

// Catalyst Finance APR range (Burlington, ON Canada)
const CATALYST_APR_LOW = 0.06;   // 6% best rate
const CATALYST_APR_HIGH = 0.13;  // 13% standard rate

// Standard amortization (PMT) formula
// Monthly Payment = P × r(1+r)^n / ((1+r)^n − 1)
function pmtCalc(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualRate / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

// Calculate monthly financing payment using APR-based amortization
function calculateFinancingPayment(
  totalAmount: number,
  termKey: string
): { low: number; high: number } {
  if (totalAmount <= 0) return { low: 0, high: 0 };

  const years = parseInt(termKey.replace('year', ''));
  if (!years || years <= 0) return { low: 0, high: 0 };
  const months = years * 12;

  return {
    low:  pmtCalc(totalAmount, CATALYST_APR_LOW,  months),
    high: pmtCalc(totalAmount, CATALYST_APR_HIGH, months),
  };
}

type TermKey = 'monthly' | '1year' | '2year' | '3year' | '4year' | '5year';
type ShHostingType = 'shared' | 'dedicated';

interface TermDiscounts {
  [key: string]: { plan: number; impl: number };
}

interface SelectedTerms {
  [key: string]: boolean;
}

// Odoo wordmark logo — matches odoo.com visual identity
function OdooLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Odoo brand mark: three interlocking circles */}
      <svg width="38" height="20" viewBox="0 0 38 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="9" fill="#714B67" />
        <circle cx="10" cy="10" r="4.5" fill="white" />
        <circle cx="26" cy="10" r="9" fill="#714B67" />
        <circle cx="26" cy="10" r="4.5" fill="white" />
      </svg>
      {/* Wordmark */}
      <span style={{
        fontFamily: '"Roboto", "Inter", sans-serif',
        fontWeight: 900,
        fontSize: '22px',
        color: '#714B67',
        letterSpacing: '-0.5px',
        lineHeight: 1,
      }}>
        odoo
      </span>
    </div>
  );
}

export default function Calculator() {
  const { toast } = useToast();
  const createQuote = useCreateQuote();

  // State
  const [showPayoutView, setShowPayoutView] = useState(false);
  const [country, setCountry] = useState<Country>('US');
  const [users, setUsers] = useState(10);
  const [plan, setPlan] = useState<'standard' | 'custom'>('standard');
  const [implementation, setImplementation] = useState<string>('none');
  const [implMultiplier, setImplMultiplier] = useState<number>(1);

  // Odoo SH State (USD only)
  const [shEnabled, setShEnabled] = useState(false);
  const [shHostingType, setShHostingType] = useState<ShHostingType>('shared');
  const [shWorkers, setShWorkers] = useState(1);
  const [shStorage, setShStorage] = useState(1);
  const [shStaging, setShStaging] = useState(0);

  const [termDiscounts, setTermDiscounts] = useState<TermDiscounts>({
    monthly: { plan: 0, impl: 0 },
    '1year': { plan: 0, impl: 0 },
    '2year': { plan: 0, impl: 0 },
    '3year': { plan: 0, impl: 0 },
    '4year': { plan: 0, impl: 0 },
    '5year': { plan: 0, impl: 0 }
  });

  const [selectedTerms, setSelectedTerms] = useState<SelectedTerms>({
    monthly: true,
    '1year': false,
    '2year': false,
    '3year': false,
    '4year': false,
    '5year': false
  });

  // Get current pricing based on country
  const currentPricing = PRICING[country];
  const currentImplementations = IMPLEMENTATIONS[country];
  const countryConfig = COUNTRY_CONFIG[country];

  // Format currency based on country (2 decimal places for precision)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: countryConfig.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Reset implementation and SH when country changes
  const handleCountryChange = (newCountry: Country) => {
    setCountry(newCountry);
    setImplementation('none');
    // Disable SH for Canada (only available for US)
    if (newCountry === 'CA') {
      setShEnabled(false);
    }
  };

  // Get SH limits based on hosting type
  const shLimits = ODOO_SH_PRICING[shHostingType].limits;

  // Calculate SH monthly cost (aligns with term type: monthly quote = monthly SH, annual quotes = annual SH)
  const calculateShMonthlyCost = (isAnnual: boolean) => {
    if (!shEnabled || country !== 'US') return 0;
    const pricing = isAnnual ? ODOO_SH_PRICING[shHostingType].yearly : ODOO_SH_PRICING[shHostingType].monthly;
    const workerCost = shWorkers * pricing.worker;
    const storageCost = shStorage * pricing.storage;
    const stagingCost = shStaging * pricing.staging;
    const baseCost = pricing.base;
    return baseCost + workerCost + storageCost + stagingCost;
  };

  // Calculation Logic
  const calculateTermQuote = (termKey: TermKey, planDiscount: number, implDiscount: number) => {
    const isMonthly = termKey === 'monthly';
    const years = isMonthly ? 1 : parseInt(termKey.replace('year', ''));
    const months = isMonthly ? 1 : years * 12;

    // Get pricing rates
    const monthlyPlanYear1 = currentPricing[plan].monthly.year1;
    const monthlyPlanYear2Plus = currentPricing[plan].monthly.year2plus;
    const yearlyPlanYear1 = currentPricing[plan].yearly.year1;
    const yearlyPlanYear2Plus = currentPricing[plan].yearly.year2plus;

    // Calculate software cost based on term type
    let totalSoftwareCost = 0;
    let softwareCostBeforeDiscount = 0;
    
    if (isMonthly) {
      // Monthly: use monthly rates
      // Year 1 at year1 rate (no discount applies to year 1)
      const year1Cost = users * monthlyPlanYear1 * 1;
      // Plan discount only applies to Year 2+ pricing, but monthly is per-month
      // So no discount applies to the monthly quote (it's just 1 month at a time)
      softwareCostBeforeDiscount = year1Cost;
      totalSoftwareCost = year1Cost; // No plan discount on monthly Year 1 rate
    } else {
      // Yearly terms:
      // Step 1: Calculate the full term cost with ALL years at Year 2+ rate
      const fullTermAtYear2Rate = users * yearlyPlanYear2Plus * 12 * years;
      
      // Step 2: Apply plan discount to the ENTIRE term (not just Year 2+)
      const planDiscountAmount = fullTermAtYear2Rate * (planDiscount / 100);
      
      // Step 3: Subtract Year 1 benefit (year1 rate is lower than year2+ rate)
      const year1Benefit = users * (yearlyPlanYear2Plus - yearlyPlanYear1) * 12;
      
      // softwareCostBeforeDiscount = natural price (all years at year2+ minus year1 benefit)
      softwareCostBeforeDiscount = fullTermAtYear2Rate - year1Benefit;
      // totalSoftwareCost = apply plan % discount to full year2+ baseline, then subtract year1 benefit
      totalSoftwareCost = fullTermAtYear2Rate - planDiscountAmount - year1Benefit;
    }

    // Implementation cost
    const implData = currentImplementations[implementation as keyof typeof currentImplementations];
    const implCostBeforeDiscount = (implData?.price || 0) * implMultiplier;
    const implementationCost = implCostBeforeDiscount * (1 - implDiscount / 100);

    // Odoo SH cost (USD only, no discounts, aligns with term type)
    const shMonthlyCost = calculateShMonthlyCost(!isMonthly);
    const shTotalCost = shMonthlyCost * months;

    const totalCost = totalSoftwareCost + implementationCost + shTotalCost;
    const amortizedMonthly = totalCost / months;

    // === SAVINGS CALCULATION ===
    // Plan savings = (Monthly Year2+ rate - Yearly rate) across term
    // Implementation savings = impl price * discount %
    // Total savings = Plan savings + Implementation discount savings
    let totalSavings = 0;

    if (isMonthly) {
      // Monthly: savings only come from discounts applied
      const planDiscountSavings = softwareCostBeforeDiscount * (planDiscount / 100);
      const implDiscountSavings = implCostBeforeDiscount * (implDiscount / 100);
      totalSavings = planDiscountSavings + implDiscountSavings;
    } else {
      // Savings = what they'd pay on full monthly billing vs what they're actually paying
      // For 1-year term: no Year 2+ exists, so baseline is Year 1 monthly rate × 12 months only
      // For 2+ year terms: customer would hit Year 2+ pricing anyway, so use Year2+ monthly rate × all months
      let fullMonthlyTotal: number;
      if (years === 1) {
        fullMonthlyTotal = users * monthlyPlanYear1 * 12;
      } else {
        fullMonthlyTotal = users * monthlyPlanYear2Plus * months;
      }
      
      // Implementation discount savings
      const implDiscountSavings = implCostBeforeDiscount * (implDiscount / 100);
      
      // Total savings = (monthly baseline - yearly software cost) + impl discount savings
      totalSavings = (fullMonthlyTotal - totalSoftwareCost) + implDiscountSavings;
    }
    
    // Calculate financing estimates using Catalyst Finance APR (only for yearly terms)
    let financingLow = 0;
    let financingHigh = 0;

    if (!isMonthly) {
      const financing = calculateFinancingPayment(totalCost, termKey);
      financingLow  = financing.low;
      financingHigh = financing.high;
    }

    return {
      termLabel: isMonthly ? 'Monthly' : `${years} Year${years > 1 ? 's' : ''}`,
      termKey,
      years,
      totalSoftwareCost,
      implementationCost,
      shTotalCost,
      totalCost,
      amortizedMonthly,
      totalSavings,
      financingLow,
      financingHigh,
    };
  };

  const handleSaveQuote = () => {
    createQuote.mutate({
      users,
      plan,
      implementation,
      termDiscounts,
      selectedTerms
    }, {
      onSuccess: () => {
        toast({
          title: "Quote Saved",
          description: "Your configuration has been saved successfully.",
        });
      },
      onError: (err) => {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        });
      }
    });
  };

  const activeTerms = Object.keys(selectedTerms).filter(k => selectedTerms[k as TermKey]) as TermKey[];

  // Compute all quote data once for active terms
  const allQuoteData = activeTerms.map(term => ({
    term,
    data: calculateTermQuote(term, termDiscounts[term].plan, termDiscounts[term].impl)
  }));

  // Clean PDF Export with proper table design
  const handleExportPDF = () => {
    const doc = new jsPDF('portrait');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    // Use precomputed quote data
    const quoteData = allQuoteData.map(({ data }) => data);
    
    const numTerms = quoteData.length;
    if (numTerms === 0) {
      toast({
        title: "No Terms Selected",
        description: "Please select at least one term to export.",
        variant: "destructive"
      });
      return;
    }

    // Header
    doc.setFillColor(113, 75, 103);
    doc.rect(0, 0, pageWidth, 3, 'F');
    
    let y = 22;
    
    // Title
    doc.setTextColor(113, 75, 103);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Odoo Quote Comparison', margin, y);
    
    // Date
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(130, 130, 130);
    doc.text(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), pageWidth - margin, y, { align: 'right' });
    
    y += 12;

    // Configuration row
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(margin, y - 4, pageWidth - (margin * 2), 16, 2, 2, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const configs = [
      `Users: ${users}`,
      `Plan: ${plan === 'standard' ? 'Standard' : 'Custom'}`,
      `Currency: ${countryConfig.currency}`,
      `Impl: ${currentImplementations[implementation as keyof typeof currentImplementations]?.label || 'None'}`
    ];
    doc.text(configs.join('   •   '), margin + 6, y + 5);
    
    y += 22;

    // Table setup
    const tableWidth = pageWidth - (margin * 2);
    const labelColWidth = 48;
    const termColWidth = (tableWidth - labelColWidth) / numTerms;
    const rowHeight = 10;

    // Check what rows to show
    const hasAnySH = quoteData.some(d => d.shTotalCost > 0);
    const hasAnySavings = quoteData.some(d => d.totalSavings > 0);
    const hasAnyFinancing = quoteData.some(d => d.financingLow > 0);

    // Draw table header row
    doc.setFillColor(113, 75, 103);
    doc.rect(margin, y, tableWidth, rowHeight + 2, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('', margin + 4, y + 7);
    
    quoteData.forEach((data, i) => {
      const colX = margin + labelColWidth + (i * termColWidth) + (termColWidth / 2);
      doc.text(data.termLabel, colX, y + 7, { align: 'center' });
    });
    
    y += rowHeight + 2;

    // Define data rows
    interface DataRow {
      label: string;
      key: string;
      isGreen?: boolean;
    }
    
    const dataRows: DataRow[] = [
      { label: 'Software License', key: 'totalSoftwareCost' },
      { label: 'Implementation', key: 'implementationCost' },
      ...(hasAnySH ? [{ label: 'Odoo SH Hosting', key: 'shTotalCost' }] : []),
      ...(hasAnySavings ? [{ label: 'Savings', key: 'totalSavings', isGreen: true }] : []),
    ];

    // Draw data rows with borders
    dataRows.forEach((row, rowIdx) => {
      // Row background
      if (rowIdx % 2 === 0) {
        doc.setFillColor(252, 252, 252);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(margin, y, tableWidth, rowHeight, 'F');
      
      // Draw cell borders
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, tableWidth, rowHeight);
      doc.line(margin + labelColWidth, y, margin + labelColWidth, y + rowHeight);
      
      for (let i = 1; i < numTerms; i++) {
        const lineX = margin + labelColWidth + (i * termColWidth);
        doc.line(lineX, y, lineX, y + rowHeight);
      }
      
      // Row label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(80, 80, 80);
      doc.text(row.label, margin + 4, y + 6.5);
      
      // Values
      quoteData.forEach((data, i) => {
        const colX = margin + labelColWidth + (i * termColWidth) + (termColWidth / 2);
        const numValue = data[row.key as keyof typeof data] as number;
        
        doc.setFont('helvetica', 'normal');
        if (row.isGreen && numValue > 0) {
          doc.setTextColor(22, 163, 74);
          doc.text('-' + formatCurrency(numValue), colX, y + 6.5, { align: 'center' });
        } else {
          doc.setTextColor(50, 50, 50);
          doc.text(numValue > 0 ? formatCurrency(numValue) : '—', colX, y + 6.5, { align: 'center' });
        }
      });
      
      y += rowHeight;
    });

    // Total row - highlighted
    doc.setFillColor(113, 75, 103);
    doc.rect(margin, y, tableWidth, rowHeight + 2, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('Total Contract', margin + 4, y + 7);
    
    quoteData.forEach((data, i) => {
      const colX = margin + labelColWidth + (i * termColWidth) + (termColWidth / 2);
      doc.text(formatCurrency(data.totalCost), colX, y + 7, { align: 'center' });
    });
    
    y += rowHeight + 2;

    // Amortized monthly row
    doc.setFillColor(248, 245, 247);
    doc.rect(margin, y, tableWidth, rowHeight, 'F');
    doc.setDrawColor(220, 220, 220);
    doc.rect(margin, y, tableWidth, rowHeight);
    doc.line(margin + labelColWidth, y, margin + labelColWidth, y + rowHeight);
    
    for (let i = 1; i < numTerms; i++) {
      const lineX = margin + labelColWidth + (i * termColWidth);
      doc.line(lineX, y, lineX, y + rowHeight);
    }
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(113, 75, 103);
    doc.text('Monthly Cost', margin + 4, y + 6.5);
    
    doc.setFont('helvetica', 'bold');
    quoteData.forEach((data, i) => {
      const colX = margin + labelColWidth + (i * termColWidth) + (termColWidth / 2);
      doc.text(formatCurrency(data.amortizedMonthly) + '/mo', colX, y + 6.5, { align: 'center' });
    });
    
    y += rowHeight + 8;

    // Financing section (if applicable) - simplified with just amounts
    if (hasAnyFinancing) {
      y += 4;
      
      // Section header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text('Financing Estimates', margin, y);
      y += 6;
      
      // Low estimate row - green tones
      doc.setFillColor(236, 253, 245); // emerald-50
      doc.rect(margin, y, tableWidth, rowHeight, 'F');
      doc.setDrawColor(167, 243, 208); // emerald-200
      doc.rect(margin, y, tableWidth, rowHeight);
      doc.line(margin + labelColWidth, y, margin + labelColWidth, y + rowHeight);
      
      for (let i = 1; i < numTerms; i++) {
        const lineX = margin + labelColWidth + (i * termColWidth);
        doc.line(lineX, y, lineX, y + rowHeight);
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(4, 120, 87); // emerald-700
      doc.text('Low Estimate', margin + 4, y + 6.5);
      
      quoteData.forEach((data, i) => {
        const colX = margin + labelColWidth + (i * termColWidth) + (termColWidth / 2);
        if (data.financingLow > 0) {
          doc.setTextColor(4, 120, 87);
          doc.text(`${formatCurrency(data.financingLow)}/mo`, colX, y + 6.5, { align: 'center' });
        } else {
          doc.setTextColor(180, 180, 180);
          doc.text('—', colX, y + 6.5, { align: 'center' });
        }
      });
      
      y += rowHeight;

      // High estimate row - amber tones
      doc.setFillColor(255, 251, 235); // amber-50
      doc.rect(margin, y, tableWidth, rowHeight, 'F');
      doc.setDrawColor(253, 230, 138); // amber-200
      doc.rect(margin, y, tableWidth, rowHeight);
      doc.line(margin + labelColWidth, y, margin + labelColWidth, y + rowHeight);
      
      for (let i = 1; i < numTerms; i++) {
        const lineX = margin + labelColWidth + (i * termColWidth);
        doc.line(lineX, y, lineX, y + rowHeight);
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text('High Estimate', margin + 4, y + 6.5);
      
      quoteData.forEach((data, i) => {
        const colX = margin + labelColWidth + (i * termColWidth) + (termColWidth / 2);
        if (data.financingHigh > 0) {
          doc.setTextColor(180, 83, 9);
          doc.text(`${formatCurrency(data.financingHigh)}/mo`, colX, y + 6.5, { align: 'center' });
        } else {
          doc.setTextColor(180, 180, 180);
          doc.text('—', colX, y + 6.5, { align: 'center' });
        }
      });
    }

    // Footer
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text('This quote is for estimation purposes only. Final pricing may vary.', margin, pageHeight - 10);
    doc.text('Odoo Enterprise Pricing Calculator', pageWidth - margin, pageHeight - 10, { align: 'right' });

    // Save the PDF
    doc.save(`odoo-quote-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Your quote has been exported.",
    });
  };

  return (
    <div className="min-h-screen" style={{ background: '#F4F3EF' }}>

      {/* ── Navigation ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white flex items-center px-6 lg:px-12" style={{ borderBottom: '1px solid #E6E3DC', height: '56px' }}>
        <div className="flex-1 flex items-center gap-5">
          <OdooLogo />
          <div style={{ width: '1px', height: '14px', background: '#E6E3DC' }} />
          <span className="text-[10px] uppercase tracking-[0.22em] font-semibold hidden sm:block" style={{ color: '#B0ADA4' }}>
            Pricing Calculator
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ border: '1px solid #E6E3DC' }}>
            <Globe className="w-3.5 h-3.5" style={{ color: '#B0ADA4' }} />
            <select
              value={country}
              onChange={(e) => handleCountryChange(e.target.value as Country)}
              className="bg-transparent text-[13px] font-semibold outline-none cursor-pointer"
              style={{ color: '#1A1915' }}
              data-testid="select-country"
            >
              <option value="US">USD</option>
              <option value="CA">CAD</option>
            </select>
          </div>
          <button
            onClick={handleExportPDF}
            className="hidden md:flex items-center gap-2 px-4 py-1.5 text-[12px] font-semibold rounded-lg transition-colors"
            style={{ border: '1px solid #E6E3DC', color: '#5A5750', background: 'white' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#F4F3EF')}
            onMouseLeave={e => (e.currentTarget.style.background = 'white')}
            data-testid="button-export-pdf"
          >
            <FileText className="w-3.5 h-3.5" />
            Export PDF
          </button>
          <Button
            onClick={handleSaveQuote}
            isLoading={createQuote.isPending}
            className="text-[12px] font-bold px-5 py-1.5 rounded-lg"
            style={{ background: '#714B67', color: 'white' }}
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            Save
          </Button>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="pt-[56px]">
        <div className="px-6 lg:px-12 pt-14 pb-12 bg-white" style={{ borderBottom: '1px solid #E6E3DC' }}>
          <p className="text-[10px] uppercase tracking-[0.32em] font-bold mb-6" style={{ color: '#714B67' }}>
            Odoo Enterprise · Partner Pricing Tool
          </p>
          <div className="flex items-end justify-between gap-8 flex-wrap">
            <h1 className="font-black leading-none" style={{ fontSize: 'clamp(44px, 7vw, 80px)', color: '#1A1915', letterSpacing: '-0.03em', lineHeight: 0.9 }}>
              Quote<br />
              <span style={{ color: '#714B67' }}>Builder</span>
            </h1>
            <div className="pb-1 space-y-1 hidden md:block">
              <div className="text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: '#B0ADA4' }}>Markets Supported</div>
              <div className="text-[16px] font-bold" style={{ color: '#1A1915' }}>United States · Canada</div>
              <div className="text-[12px]" style={{ color: '#B0ADA4' }}>USD · CAD · Prices in {countryConfig.currency}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main ── */}
      <main className="px-6 lg:px-12 py-14 space-y-14 pb-28">

        {/* ── 01 Configure ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <div className="flex items-center gap-5 mb-8">
            <span className="text-[10px] uppercase tracking-[0.28em] font-black" style={{ color: '#714B67' }}>01</span>
            <div style={{ flex: 1, height: '1px', background: '#E6E3DC' }} />
            <span className="text-[10px] uppercase tracking-[0.28em] font-semibold" style={{ color: '#B0ADA4' }}>Configure</span>
          </div>

          <div className="bg-white rounded-2xl p-8 lg:p-10" style={{ border: '1px solid #E6E3DC' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

              {/* Users */}
              <div className="space-y-5">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.24em] font-bold mb-2" style={{ color: '#B0ADA4' }}>Number of Users</div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-black" style={{ fontSize: '36px', color: '#1A1915', letterSpacing: '-0.03em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{users}</span>
                    <span className="text-[14px] font-medium" style={{ color: '#B0ADA4' }}>users</span>
                  </div>
                  <div className="text-[11px] font-semibold mt-1" style={{ color: users < 5 ? '#017E84' : users < 50 ? '#714B67' : '#1A1915' }}>
                    {users < 5 ? 'Small Team' : users < 50 ? 'Growing Business' : 'Enterprise'}
                  </div>
                </div>
                <input
                  type="range" min="1" max="500" value={users}
                  onChange={(e) => setUsers(parseInt(e.target.value) || 0)}
                  className="w-full appearance-none cursor-pointer"
                  style={{ height: '2px', accentColor: '#714B67' }}
                  data-testid="slider-users"
                />
                <input
                  type="number" min="1" value={users}
                  onChange={(e) => setUsers(parseInt(e.target.value) || 0)}
                  className="w-28 text-center text-[15px] font-bold rounded-xl px-3 py-2.5 outline-none transition-colors"
                  style={{ border: '1px solid #E6E3DC', color: '#1A1915', background: '#F9F8F5', fontVariantNumeric: 'tabular-nums' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#714B67')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E6E3DC')}
                  data-testid="input-users"
                />
              </div>

              {/* Plan */}
              <div className="space-y-4">
                <div className="text-[9px] uppercase tracking-[0.24em] font-bold" style={{ color: '#B0ADA4' }}>Odoo Plan</div>
                <div className="space-y-2">
                  {[
                    { key: 'standard' as const, label: 'Standard', sub: 'Core modules · Online', accent: '#714B67' },
                    { key: 'custom' as const, label: 'Custom', sub: 'Odoo Studio · API access', accent: '#017E84' },
                  ].map(({ key, label, sub, accent }) => (
                    <button
                      key={key}
                      onClick={() => setPlan(key)}
                      data-testid={`button-plan-${key}`}
                      className="w-full p-4 rounded-xl text-left transition-all duration-150"
                      style={{
                        border: plan === key ? `2px solid ${accent}` : '1px solid #E6E3DC',
                        background: plan === key ? `${accent}08` : '#F9F8F5',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[14px] font-bold" style={{ color: '#1A1915' }}>{label}</div>
                          <div className="text-[11px] mt-0.5" style={{ color: '#B0ADA4' }}>{sub}</div>
                        </div>
                        {plan === key && <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: accent }} />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Implementation */}
              <div className="space-y-4">
                <div className="text-[9px] uppercase tracking-[0.24em] font-bold" style={{ color: '#B0ADA4' }}>Implementation Pack</div>
                <Select
                  options={Object.entries(currentImplementations).map(([key, val]) => ({ value: key, label: val.label }))}
                  value={implementation}
                  onChange={(e) => setImplementation(e.target.value)}
                  data-testid="select-implementation"
                />
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-medium" style={{ color: '#B0ADA4' }}>Multiplier</span>
                  <div className="relative flex-1">
                    <input
                      type="number" min="0.1" max="10" step="0.1"
                      value={implMultiplier}
                      onChange={(e) => setImplMultiplier(parseFloat(e.target.value) || 1)}
                      disabled={implementation === 'none'}
                      className="w-full rounded-xl px-3 py-2.5 text-[14px] font-bold text-center outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ border: '1px solid #E6E3DC', color: '#1A1915', background: '#F9F8F5', paddingRight: '24px' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#714B67')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E6E3DC')}
                      data-testid="input-impl-multiplier"
                    />
                    <span className="absolute right-3 top-2.5 text-[12px]" style={{ color: '#B0ADA4' }}>×</span>
                  </div>
                </div>
                {implementation !== 'none' && (
                  <div className="flex justify-between items-center pt-1" style={{ borderTop: '1px solid #E6E3DC' }}>
                    <span className="text-[11px]" style={{ color: '#B0ADA4' }}>
                      {((currentImplementations[implementation as keyof typeof currentImplementations]?.hours || 0) * implMultiplier).toFixed(0)} hours
                    </span>
                    <span className="text-[14px] font-black" style={{ color: '#017E84', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency((currentImplementations[implementation as keyof typeof currentImplementations]?.price || 0) * implMultiplier)}
                    </span>
                  </div>
                )}
              </div>

            </div>

            {/* Odoo SH */}
            {country === 'US' && (
              <div className="mt-10 pt-8" style={{ borderTop: '1px solid #E6E3DC' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.24em] font-bold mb-0.5" style={{ color: '#B0ADA4' }}>Odoo SH Hosting</div>
                    <div className="text-[14px] font-bold" style={{ color: '#1A1915' }}>Dedicated Cloud Infrastructure</div>
                  </div>
                  <button
                    onClick={() => setShEnabled(!shEnabled)}
                    data-testid="button-toggle-sh"
                    className="relative rounded-full transition-colors duration-200 flex-shrink-0"
                    style={{ width: '44px', height: '24px', background: shEnabled ? '#714B67' : '#E6E3DC' }}
                  >
                    <span
                      className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                      style={{ transform: shEnabled ? 'translateX(22px)' : 'translateX(4px)' }}
                    />
                  </button>
                </div>

                {shEnabled && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-6 space-y-5" style={{ background: '#F4F3EF', border: '1px solid #E6E3DC' }}>
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="text-[11px] font-semibold" style={{ color: '#7A7770' }}>Hosting Type</span>
                      <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #E6E3DC' }}>
                        {(['shared', 'dedicated'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setShHostingType(type);
                              if (type === 'shared') { setShWorkers(Math.min(Math.max(shWorkers, 1), 8)); setShStorage(Math.min(shStorage, 512)); }
                              else setShWorkers(Math.max(shWorkers, 4));
                            }}
                            data-testid={`button-sh-${type}`}
                            className="px-4 py-1.5 text-[12px] font-semibold transition-colors"
                            style={{
                              background: shHostingType === type ? '#714B67' : 'white',
                              color: shHostingType === type ? 'white' : '#7A7770',
                            }}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </button>
                        ))}
                      </div>
                      {shHostingType === 'dedicated' && (
                        <span className="text-[11px] font-semibold" style={{ color: '#714B67' }}>+$480/mo annual · +$600/mo monthly</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Workers', icon: <Cpu className="w-3 h-3" />, value: shWorkers, min: shLimits.workerMin, max: shLimits.workerMax, set: (v: number) => setShWorkers(v), testid: 'input-sh-workers', hint: `${shLimits.workerMin}–${shLimits.workerMax}` },
                        { label: 'Storage (GB)', icon: <HardDrive className="w-3 h-3" />, value: shStorage, min: shLimits.storageMin, max: shLimits.storageMax, set: (v: number) => setShStorage(v), testid: 'input-sh-storage', hint: `${shLimits.storageMin}–${shLimits.storageMax} GB` },
                        { label: 'Staging Env.', icon: <Layers className="w-3 h-3" />, value: shStaging, min: shLimits.stagingMin, max: shLimits.stagingMax, set: (v: number) => setShStaging(v), testid: 'input-sh-staging', hint: `0–${shLimits.stagingMax} envs` },
                      ].map(({ label, icon, value, min, max, set, testid, hint }) => (
                        <div key={label} className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.18em] font-bold" style={{ color: '#B0ADA4' }}>
                            {icon} {label}
                          </div>
                          <input
                            type="number" min={min} max={max} value={value}
                            onChange={(e) => set(Math.min(Math.max(parseInt(e.target.value) || min, min), max))}
                            className="w-full rounded-xl px-3 py-2.5 text-[15px] font-black text-center outline-none transition-colors"
                            style={{ border: '1px solid #E6E3DC', background: 'white', color: '#1A1915', fontVariantNumeric: 'tabular-nums' }}
                            onFocus={e => (e.currentTarget.style.borderColor = '#714B67')}
                            onBlur={e => (e.currentTarget.style.borderColor = '#E6E3DC')}
                            data-testid={testid}
                          />
                          <div className="text-[10px]" style={{ color: '#B0ADA4' }}>{hint}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 pt-3 flex-wrap" style={{ borderTop: '1px solid #E6E3DC' }}>
                      <span className="text-[11px] font-medium" style={{ color: '#B0ADA4' }}>Odoo SH estimate:</span>
                      <span className="text-[12px] font-black" style={{ color: '#714B67', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(calculateShMonthlyCost(true))}/mo</span>
                      <span className="text-[11px]" style={{ color: '#B0ADA4' }}>annual ·</span>
                      <span className="text-[12px] font-black" style={{ color: '#714B67', fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(calculateShMonthlyCost(false))}/mo</span>
                      <span className="text-[11px]" style={{ color: '#B0ADA4' }}>monthly</span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </motion.section>

        {/* ── 02 Terms & Discounts ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }}>
          <div className="flex items-center gap-5 mb-8">
            <span className="text-[10px] uppercase tracking-[0.28em] font-black" style={{ color: '#017E84' }}>02</span>
            <div style={{ flex: 1, height: '1px', background: '#E6E3DC' }} />
            <span className="text-[10px] uppercase tracking-[0.28em] font-semibold" style={{ color: '#B0ADA4' }}>Terms & Discounts</span>
          </div>

          <div className="bg-white rounded-2xl p-8 lg:p-10" style={{ border: '1px solid #E6E3DC' }}>
            <div className="mb-6">
              <div className="text-[9px] uppercase tracking-[0.24em] font-bold mb-4" style={{ color: '#B0ADA4' }}>Select Terms to Display</div>
              <div className="flex flex-wrap gap-2">
                {Object.keys(selectedTerms).map((term) => (
                  <button
                    key={term}
                    onClick={() => setSelectedTerms(prev => ({ ...prev, [term]: !prev[term as TermKey] }))}
                    data-testid={`button-term-${term}`}
                    className="px-4 py-2 rounded-lg text-[12px] font-semibold transition-all duration-150"
                    style={{
                      border: selectedTerms[term as TermKey] ? '2px solid #714B67' : '1px solid #E6E3DC',
                      background: selectedTerms[term as TermKey] ? 'rgba(113,75,103,0.07)' : '#F9F8F5',
                      color: selectedTerms[term as TermKey] ? '#714B67' : '#B0ADA4',
                    }}
                  >
                    {term === 'monthly' ? 'Monthly' : term.replace('year', ' Yr')}
                  </button>
                ))}
              </div>
            </div>

            {activeTerms.length > 0 && (
              <>
                <div style={{ height: '1px', background: '#E6E3DC', margin: '24px 0' }} />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {activeTerms.map((term) => (
                    <div key={term} className="rounded-xl p-4 space-y-3" style={{ background: '#F4F3EF', border: '1px solid #E6E3DC' }}>
                      <div className="text-[10px] uppercase tracking-[0.2em] font-black" style={{ color: '#714B67' }}>
                        {term === 'monthly' ? 'Monthly' : term.replace('year', ' Year')}
                      </div>
                      <div className="space-y-2">
                        {[
                          { label: 'Plan % Off', key: 'plan', testid: `input-plan-discount-${term}` },
                          { label: 'Impl % Off', key: 'impl', testid: `input-impl-discount-${term}` },
                        ].map(({ label, key, testid }) => (
                          <div key={key}>
                            <div className="text-[9px] uppercase tracking-[0.15em] font-semibold mb-1" style={{ color: '#B0ADA4' }}>{label}</div>
                            <div className="relative">
                              <input
                                type="number" min="0" max="100"
                                value={termDiscounts[term]?.[key as 'plan' | 'impl'] || ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setTermDiscounts(prev => ({ ...prev, [term]: { ...prev[term], [key]: val } }));
                                }}
                                className="w-full rounded-lg px-3 py-2 text-[13px] font-semibold text-right outline-none transition-colors"
                                style={{ border: '1px solid #E6E3DC', background: 'white', color: '#1A1915', paddingRight: '22px' }}
                                onFocus={e => (e.currentTarget.style.borderColor = '#714B67')}
                                onBlur={e => (e.currentTarget.style.borderColor = '#E6E3DC')}
                                data-testid={testid}
                              />
                              <span className="absolute right-2.5 top-2 text-[11px]" style={{ color: '#B0ADA4' }}>%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.section>

        {/* ── 03 Quote Comparison ── */}
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}>
          <div className="flex items-center gap-5 mb-8">
            <span className="text-[10px] uppercase tracking-[0.28em] font-black" style={{ color: '#1A1915' }}>03</span>
            <div style={{ flex: 1, height: '1px', background: '#E6E3DC' }} />
            <div className="flex items-center gap-4">
              <span className="text-[10px] uppercase tracking-[0.28em] font-semibold" style={{ color: '#B0ADA4' }}>
                {activeTerms.length} {activeTerms.length === 1 ? 'Term' : 'Terms'}
              </span>
              <button
                data-testid="toggle-payout-view"
                onClick={() => setShowPayoutView(v => !v)}
                className="flex items-center justify-center rounded-lg transition-all duration-150"
                style={{
                  width: '30px', height: '30px',
                  border: showPayoutView ? '2px solid #F59E0B' : '1px solid #E6E3DC',
                  background: showPayoutView ? '#F59E0B' : 'white',
                  color: showPayoutView ? 'white' : '#B0ADA4',
                }}
                title="Partner payout view (internal only)"
              >
                <DollarSign className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {activeTerms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {allQuoteData.map(({ term, data }, index) => (
                <motion.div
                  key={term}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                >
                  <QuoteCard data={data} termKey={term} formatCurrency={formatCurrency} showPayoutView={showPayoutView} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center rounded-2xl" style={{ border: '2px dashed #E6E3DC' }}>
              <Info className="w-7 h-7 mb-3" style={{ color: '#D5D2CB' }} />
              <p className="text-[13px] font-medium" style={{ color: '#B0ADA4' }}>Select terms above to generate quotes</p>
            </div>
          )}
        </motion.section>

      </main>
    </div>
  );
}

// === QUOTE CARD COMPONENT ===

function QuoteCard({ data, termKey, formatCurrency, showPayoutView }: {
  data: any;
  termKey: string;
  formatCurrency: (n: number) => string;
  showPayoutView: boolean;
}) {
  const isMonthly = termKey === 'monthly';
  const hasFinancing = !isMonthly && data.financingLow > 0;
  const hasSavings = !isMonthly && data.totalSavings > 0;

  // MRR = (total license cost + total SH cost over term) × 80% for monthly
  //       (total license cost + total SH cost over term) ÷ 12  for 1+ year terms
  const recurringBase = data.totalSoftwareCost + data.shTotalCost;
  const mrr = isMonthly ? recurringBase * 0.8 : recurringBase / 12;
  const nrr = data.implementationCost;

  return (
    <div className="relative h-full rounded-2xl" data-testid={`card-quote-${termKey}`}>
      <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-white">

        {/* ── Card Header ── */}
        <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4a2347 0%, #714B67 50%, #8B5A7A 100%)' }}>
          {/* Subtle grid texture */}
          <div className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />

          <div className="relative px-5 pt-5 pb-5">
            {/* Term type label + savings pill */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-[0.18em]">
                {isMonthly ? 'Pay as you go' : 'Annual Commitment'}
              </span>
              {hasSavings && (
                <span className="inline-flex items-center gap-1 bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-2.5 h-2.5" />
                  Save {formatCurrency(data.totalSavings)}
                </span>
              )}
            </div>

            {/* Term title */}
            <h3 className="text-[22px] font-black text-white leading-none tracking-tight mb-5">
              {data.termLabel}
            </h3>

            {/* Hero monthly number */}
            <div className="border-t border-white/10 pt-4">
              <p className="text-[9px] font-semibold text-white/40 uppercase tracking-[0.2em] mb-1.5">
                {isMonthly ? 'Monthly' : 'Amortized / mo'}
              </p>
              <div className="flex items-end gap-1.5">
                <span className="text-[38px] font-black text-white leading-none tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(data.amortizedMonthly)}
                </span>
                <span className="text-sm text-white/40 font-medium mb-1">/mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Cost Breakdown ── */}
        <div className="px-5 pt-5 pb-4 flex-1 flex flex-col">
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[0.18em] mb-3">Breakdown</p>

          <div className="space-y-0 flex-1">
            <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(113,75,103,0.08)' }}>
                  <Code className="w-3 h-3 text-[#714B67]" />
                </div>
                <span className="text-[13px] text-gray-500 font-medium">Software License</span>
              </div>
              <span className="text-[13px] font-semibold font-mono text-gray-700">{formatCurrency(data.totalSoftwareCost)}</span>
            </div>

            <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(1,126,132,0.08)' }}>
                  <Cpu className="w-3 h-3 text-[#017E84]" />
                </div>
                <span className="text-[13px] text-gray-500 font-medium">Implementation</span>
              </div>
              <span className="text-[13px] font-semibold font-mono text-gray-700">{formatCurrency(data.implementationCost)}</span>
            </div>

            {data.shTotalCost > 0 && (
              <div className="flex justify-between items-center py-2.5 border-b border-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(113,75,103,0.08)' }}>
                    <Server className="w-3 h-3 text-[#714B67]" />
                  </div>
                  <span className="text-[13px] text-gray-500 font-medium">Odoo SH Hosting</span>
                </div>
                <span className="text-[13px] font-semibold font-mono text-gray-700">{formatCurrency(data.shTotalCost)}</span>
              </div>
            )}
          </div>

          {/* Total Contract — hero row */}
          <div className="mt-4 rounded-xl px-4 py-3.5 flex justify-between items-center" style={{ background: 'linear-gradient(135deg, #f7f4f6 0%, #f0eaee 100%)', border: '1px solid rgba(113,75,103,0.12)' }}>
            <div>
              <p className="text-[9px] font-bold text-[#714B67]/50 uppercase tracking-[0.16em] mb-0.5">Total Contract</p>
              <p className="text-[11px] text-gray-400 font-medium">
                {isMonthly ? 'Per month' : `Over ${data.termLabel.toLowerCase()}`}
              </p>
            </div>
            <span className="text-[22px] font-black font-mono text-[#4a2347] tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(data.totalCost)}
            </span>
          </div>
        </div>

        {/* ── Catalyst Finance ── */}
        {hasFinancing && (
          <div className="mx-4 mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid rgba(27,58,107,0.15)' }}>
            <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: '#1B3A6B' }}>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3 h-3 text-blue-300" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.15em]">Finance This</span>
              </div>
              <span className="text-[9px] text-blue-300/70 font-medium">{CATALYST_APR_LOW * 100}–{CATALYST_APR_HIGH * 100}% APR</span>
            </div>
            <div className="px-4 py-3 space-y-2.5" style={{ background: '#f4f7fc' }}>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-2.5 text-center" style={{ border: '1px solid rgba(27,58,107,0.08)' }}>
                  <div className="text-[8px] text-[#1B3A6B]/40 font-bold uppercase tracking-wider mb-1">Best Rate</div>
                  <div className="text-[15px] font-black text-[#1B3A6B]" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(data.financingLow)}</div>
                  <div className="text-[8px] text-[#1B3A6B]/40 mt-0.5">/mo · {CATALYST_APR_LOW * 100}% APR</div>
                </div>
                <div className="bg-white rounded-lg p-2.5 text-center" style={{ border: '1px solid rgba(27,58,107,0.08)' }}>
                  <div className="text-[8px] text-[#1B3A6B]/40 font-bold uppercase tracking-wider mb-1">Standard</div>
                  <div className="text-[15px] font-black text-[#1B3A6B]" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(data.financingHigh)}</div>
                  <div className="text-[8px] text-[#1B3A6B]/40 mt-0.5">/mo · {CATALYST_APR_HIGH * 100}% APR</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-3.5 h-3.5 rounded-sm bg-[#1B3A6B] flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-black text-[6px]">CF</span>
                </div>
                <span className="text-[8px] text-gray-400">Financing by <strong className="text-[#1B3A6B]">Catalyst Finance</strong> · Burlington, ON</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Partner Payout (internal) ── */}
        {showPayoutView && (
          <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-amber-200">
            <div className="bg-amber-500 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3 h-3 text-white" />
                <span className="text-[10px] font-bold text-white uppercase tracking-[0.15em]">Partner Payout</span>
              </div>
              <span className="text-[8px] bg-amber-700/40 text-amber-100 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">Internal</span>
            </div>
            <div className="bg-amber-50 px-4 py-3 space-y-2">
              <div className="flex justify-between items-center bg-white border border-amber-100 rounded-lg px-3 py-2.5">
                <div>
                  <div className="text-[9px] font-bold text-amber-800 uppercase tracking-wider">MRR</div>
                  <div className="text-[8px] text-amber-400 mt-0.5">{isMonthly ? '(License + SH) × 80%' : '(License + SH total) ÷ 12'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[15px] font-black text-amber-700" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(mrr)}</div>
                  <div className="text-[8px] text-amber-400">/mo</div>
                </div>
              </div>
              {nrr > 0 && (
                <div className="flex justify-between items-center bg-white border border-amber-100 rounded-lg px-3 py-2.5">
                  <div>
                    <div className="text-[9px] font-bold text-amber-800 uppercase tracking-wider">NRR</div>
                    <div className="text-[8px] text-amber-400 mt-0.5">One-time implementation</div>
                  </div>
                  <div className="text-[15px] font-black text-amber-700" style={{ fontVariantNumeric: 'tabular-nums' }}>{formatCurrency(nrr)}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
