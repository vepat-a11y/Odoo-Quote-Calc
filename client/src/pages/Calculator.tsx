import { useState } from 'react';
import {
  Save,
  Info,
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

  const implData = currentImplementations[implementation as keyof typeof currentImplementations];
  const configSummary = `${users} users · ${plan === 'standard' ? 'Standard' : 'Custom'} · ${countryConfig.currency}${implementation !== 'none' && implData ? ` · ${implData.label}` : ''}${shEnabled ? ' · SH' : ''}`;

  return (
    <div className="h-screen flex flex-col" style={{ background: '#F4F3EF' }}>

      {/* ── Top Navigation ── */}
      <header className="flex-shrink-0 bg-white flex items-center px-5 lg:px-6 z-50" style={{ borderBottom: '1px solid #E6E3DC', height: '52px' }}>
        <div className="flex-1 flex items-center gap-4">
          <OdooLogo />
          <div style={{ width: '1px', height: '12px', background: '#E6E3DC' }} />
          <span className="text-[11px] font-bold hidden sm:block" style={{ color: '#714B67' }}>
            Quote Builder
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-md transition-colors hover:bg-gray-50"
            style={{ border: '1px solid #E6E3DC', color: '#6B6A65' }}
            data-testid="button-export-pdf"
          >
            <FileText className="w-3 h-3" />
            Export
          </button>
          <Button
            onClick={handleSaveQuote}
            isLoading={createQuote.isPending}
            className="text-[11px] font-bold px-3 py-1.5 rounded-md"
            data-testid="button-save-quote"
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
      </header>

      {/* ── Two-Panel Layout ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT: Controls Sidebar ── */}
        <aside className="w-[340px] lg:w-[380px] flex-shrink-0 bg-white overflow-y-auto" style={{ borderRight: '1px solid #E6E3DC' }}>
          <div className="p-5 space-y-1">

            {/* Currency */}
            <div className="flex items-center justify-between pb-4 mb-1" style={{ borderBottom: '1px solid #E6E3DC' }}>
              <span className="text-[9px] uppercase tracking-[0.24em] font-bold" style={{ color: '#B0ADA4' }}>Currency</span>
              <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid #E6E3DC' }}>
                {(['US', 'CA'] as const).map(c => (
                  <button
                    key={c}
                    onClick={() => handleCountryChange(c)}
                    className="px-3 py-1 text-[11px] font-bold transition-colors"
                    style={{
                      background: country === c ? '#714B67' : 'white',
                      color: country === c ? 'white' : '#B0ADA4',
                    }}
                    data-testid={`button-currency-${c.toLowerCase()}`}
                  >
                    {COUNTRY_CONFIG[c].currency}
                  </button>
                ))}
              </div>
            </div>

            {/* Users */}
            <div className="pb-4 mb-1" style={{ borderBottom: '1px solid #E6E3DC' }}>
              <div className="flex items-center justify-between">
                <div className="text-[9px] uppercase tracking-[0.24em] font-bold" style={{ color: '#B0ADA4' }}>Users</div>
                <input
                  type="number" min="1" value={users}
                  onChange={(e) => setUsers(parseInt(e.target.value) || 0)}
                  className="w-20 text-center text-[16px] font-black rounded-lg px-2 py-1.5 outline-none transition-colors"
                  style={{ border: '1px solid #E6E3DC', color: '#1A1915', fontVariantNumeric: 'tabular-nums' }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#714B67')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#E6E3DC')}
                  data-testid="input-users"
                />
              </div>
            </div>

            {/* Plan */}
            <div className="pb-4 mb-1" style={{ borderBottom: '1px solid #E6E3DC' }}>
              <div className="text-[9px] uppercase tracking-[0.24em] font-bold mb-3" style={{ color: '#B0ADA4' }}>Plan</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'standard' as const, label: 'Standard', accent: '#714B67' },
                  { key: 'custom' as const, label: 'Custom', accent: '#017E84' },
                ].map(({ key, label, accent }) => (
                  <button
                    key={key}
                    onClick={() => setPlan(key)}
                    data-testid={`button-plan-${key}`}
                    className="px-3 py-2.5 rounded-lg text-[12px] font-bold text-center transition-all duration-150"
                    style={{
                      border: plan === key ? `2px solid ${accent}` : '1px solid #E6E3DC',
                      background: plan === key ? `${accent}0A` : '#F9F8F5',
                      color: plan === key ? accent : '#B0ADA4',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Implementation */}
            <div className="pb-4 mb-1" style={{ borderBottom: '1px solid #E6E3DC' }}>
              <div className="text-[9px] uppercase tracking-[0.24em] font-bold mb-3" style={{ color: '#B0ADA4' }}>Implementation</div>
              <Select
                options={Object.entries(currentImplementations).map(([key, val]) => ({ value: key, label: val.label }))}
                value={implementation}
                onChange={(e) => setImplementation(e.target.value)}
                data-testid="select-implementation"
              />
              {implementation !== 'none' && (
                <>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] font-semibold" style={{ color: '#B0ADA4' }}>×</span>
                    <input
                      type="number" min="0.1" max="10" step="0.1"
                      value={implMultiplier}
                      onChange={(e) => setImplMultiplier(parseFloat(e.target.value) || 1)}
                      className="w-16 rounded-md px-2 py-1 text-[13px] font-bold text-center outline-none transition-colors"
                      style={{ border: '1px solid #E6E3DC', color: '#1A1915' }}
                      onFocus={e => (e.currentTarget.style.borderColor = '#714B67')}
                      onBlur={e => (e.currentTarget.style.borderColor = '#E6E3DC')}
                      data-testid="input-impl-multiplier"
                    />
                    <span className="text-[10px]" style={{ color: '#B0ADA4' }}>
                      = {((currentImplementations[implementation as keyof typeof currentImplementations]?.hours || 0) * implMultiplier).toFixed(0)} hrs
                    </span>
                    <span className="ml-auto text-[12px] font-black" style={{ color: '#017E84', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency((currentImplementations[implementation as keyof typeof currentImplementations]?.price || 0) * implMultiplier)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Odoo SH */}
            {country === 'US' && (
              <div className="pb-4 mb-1" style={{ borderBottom: '1px solid #E6E3DC' }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[9px] uppercase tracking-[0.24em] font-bold" style={{ color: '#B0ADA4' }}>Odoo SH Hosting</div>
                  <button
                    onClick={() => setShEnabled(!shEnabled)}
                    data-testid="button-toggle-sh"
                    className="relative rounded-full transition-colors duration-200 flex-shrink-0"
                    style={{ width: '36px', height: '20px', background: shEnabled ? '#714B67' : '#E6E3DC' }}
                  >
                    <span
                      className="absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200"
                      style={{ transform: shEnabled ? 'translateX(18px)' : 'translateX(2px)' }}
                    />
                  </button>
                </div>
                {shEnabled && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-3">
                    <div className="flex rounded-md overflow-hidden" style={{ border: '1px solid #E6E3DC' }}>
                      {(['shared', 'dedicated'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setShHostingType(type);
                            if (type === 'shared') { setShWorkers(Math.min(Math.max(shWorkers, 1), 8)); setShStorage(Math.min(shStorage, 512)); }
                            else setShWorkers(Math.max(shWorkers, 4));
                          }}
                          data-testid={`button-sh-${type}`}
                          className="flex-1 px-3 py-1.5 text-[11px] font-bold transition-colors"
                          style={{
                            background: shHostingType === type ? '#714B67' : 'white',
                            color: shHostingType === type ? 'white' : '#B0ADA4',
                          }}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Workers', value: shWorkers, min: shLimits.workerMin, max: shLimits.workerMax, set: (v: number) => setShWorkers(v), testid: 'input-sh-workers' },
                        { label: 'Storage', value: shStorage, min: shLimits.storageMin, max: shLimits.storageMax, set: (v: number) => setShStorage(v), testid: 'input-sh-storage' },
                        { label: 'Staging', value: shStaging, min: shLimits.stagingMin, max: shLimits.stagingMax, set: (v: number) => setShStaging(v), testid: 'input-sh-staging' },
                      ].map(({ label, value, min, max, set, testid }) => (
                        <div key={label}>
                          <div className="text-[8px] uppercase tracking-[0.15em] font-bold mb-1" style={{ color: '#B0ADA4' }}>{label}</div>
                          <input
                            type="number" min={min} max={max} value={value}
                            onChange={(e) => set(Math.min(Math.max(parseInt(e.target.value) || min, min), max))}
                            className="w-full rounded-md px-2 py-1.5 text-[13px] font-black text-center outline-none transition-colors"
                            style={{ border: '1px solid #E6E3DC', color: '#1A1915', fontVariantNumeric: 'tabular-nums' }}
                            onFocus={e => (e.currentTarget.style.borderColor = '#714B67')}
                            onBlur={e => (e.currentTarget.style.borderColor = '#E6E3DC')}
                            data-testid={testid}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="text-[10px] font-bold" style={{ color: '#714B67', fontVariantNumeric: 'tabular-nums' }}>
                      {formatCurrency(calculateShMonthlyCost(true))}/mo <span style={{ color: '#B0ADA4', fontWeight: 500 }}>annual</span>
                      {' · '}
                      {formatCurrency(calculateShMonthlyCost(false))}/mo <span style={{ color: '#B0ADA4', fontWeight: 500 }}>monthly</span>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Terms */}
            <div className="pb-4 mb-1" style={{ borderBottom: '1px solid #E6E3DC' }}>
              <div className="text-[9px] uppercase tracking-[0.24em] font-bold mb-3" style={{ color: '#B0ADA4' }}>Terms to Compare</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(selectedTerms).map((term) => (
                  <button
                    key={term}
                    onClick={() => setSelectedTerms(prev => ({ ...prev, [term]: !prev[term as TermKey] }))}
                    data-testid={`button-term-${term}`}
                    className="px-3 py-1.5 rounded-md text-[11px] font-bold transition-all duration-150"
                    style={{
                      border: selectedTerms[term as TermKey] ? '2px solid #714B67' : '1px solid #E6E3DC',
                      background: selectedTerms[term as TermKey] ? 'rgba(113,75,103,0.08)' : '#F9F8F5',
                      color: selectedTerms[term as TermKey] ? '#714B67' : '#B0ADA4',
                    }}
                  >
                    {term === 'monthly' ? 'Mo' : term.replace('year', 'Y')}
                  </button>
                ))}
              </div>
            </div>

            {/* Discounts table (only for active terms) */}
            {activeTerms.length > 0 && (
              <div className="pt-1">
                <div className="text-[9px] uppercase tracking-[0.24em] font-bold mb-3" style={{ color: '#B0ADA4' }}>Discounts</div>
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #E6E3DC' }}>
                  <table className="w-full" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9F8F5' }}>
                        <th className="text-left text-[8px] uppercase tracking-[0.15em] font-bold px-2.5 py-2" style={{ color: '#B0ADA4', borderBottom: '1px solid #E6E3DC' }}></th>
                        {activeTerms.map(term => (
                          <th key={term} className="text-center text-[9px] uppercase tracking-[0.1em] font-black px-1.5 py-2" style={{ color: '#714B67', borderBottom: '1px solid #E6E3DC', borderLeft: '1px solid #E6E3DC' }}>
                            {term === 'monthly' ? 'Mo' : term.replace('year', 'Y')}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { label: 'Plan %', key: 'plan' as const },
                        { label: 'Impl %', key: 'impl' as const },
                      ].map(({ label, key }, rowIdx) => (
                        <tr key={key} style={{ background: rowIdx % 2 === 0 ? 'white' : '#FDFCFB' }}>
                          <td className="text-[9px] font-semibold px-2.5 py-1.5 whitespace-nowrap" style={{ color: '#7A7770', borderBottom: rowIdx === 0 ? '1px solid #F0EEEA' : 'none' }}>
                            {label}
                          </td>
                          {activeTerms.map(term => (
                            <td key={term} className="px-1 py-1" style={{ borderLeft: '1px solid #E6E3DC', borderBottom: rowIdx === 0 ? '1px solid #F0EEEA' : 'none' }}>
                              <input
                                type="number" min="0" max="100"
                                value={termDiscounts[term]?.[key] || ''}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  setTermDiscounts(prev => ({ ...prev, [term]: { ...prev[term], [key]: val } }));
                                }}
                                className="w-full rounded px-1 py-1 text-[11px] font-bold text-center outline-none transition-colors"
                                style={{ border: '1px solid transparent', color: '#1A1915', background: 'transparent' }}
                                onFocus={e => { e.currentTarget.style.borderColor = '#714B67'; e.currentTarget.style.background = 'white'; }}
                                onBlur={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent'; }}
                                data-testid={`input-${key}-discount-${term}`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </aside>

        {/* ── RIGHT: Quote Cards ── */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#F4F3EF' }}>
          {/* Summary bar */}
          <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 py-3" style={{ borderBottom: '1px solid #E6E3DC' }}>
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-medium" style={{ color: '#6B6A65' }} data-testid="text-config-summary">
                {configSummary}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold" style={{ color: '#B0ADA4' }}>
                {activeTerms.length} {activeTerms.length === 1 ? 'term' : 'terms'}
              </span>
              <button
                data-testid="toggle-payout-view"
                onClick={() => setShowPayoutView(v => !v)}
                className="flex items-center justify-center rounded-md transition-all duration-150"
                style={{
                  width: '28px', height: '28px',
                  border: showPayoutView ? '2px solid #F59E0B' : '1px solid #E6E3DC',
                  background: showPayoutView ? '#F59E0B' : 'white',
                  color: showPayoutView ? 'white' : '#B0ADA4',
                }}
                title="Partner payout view"
              >
                <DollarSign className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quote comparison table */}
          <div className="p-6">
            {activeTerms.length > 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                {(() => {
                  const hasAnySH = allQuoteData.some(q => q.data.shTotalCost > 0);
                  const hasAnyImpl = allQuoteData.some(q => q.data.implementationCost > 0);
                  const hasAnyFinancing = allQuoteData.some(q => q.data.financingLow > 0);
                  const hasAnySavings = allQuoteData.some(q => q.data.totalSavings > 0);
                  const colCount = allQuoteData.length;

                  const lbl = "text-[12px] font-medium pl-5 pr-3 py-3.5 whitespace-nowrap";
                  const val = "text-[13px] font-semibold text-right pr-5 pl-3 py-3.5";
                  const colBorder: React.CSSProperties = { borderLeft: '1px solid rgba(113,75,103,0.06)' };

                  return (
                    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid #E0DDD6' }} data-testid="table-quote-comparison">
                      <table className="w-full" style={{ borderCollapse: 'collapse' }}>

                        {/* ── Header ── */}
                        <thead>
                          <tr>
                            <th className="text-left pl-5 pr-3 py-5" style={{ background: '#2D1B2E', minWidth: '170px' }}>
                              <div className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                Quote Breakdown
                              </div>
                            </th>
                            {allQuoteData.map(({ term, data }) => (
                              <th key={term} className="text-center px-5 py-5" style={{ background: '#2D1B2E', borderLeft: '1px solid rgba(255,255,255,0.06)', minWidth: '140px' }}>
                                <div className="text-[15px] font-black text-white tracking-tight">{data.termLabel}</div>
                                <div className="text-[9px] font-medium mt-1 uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.3)' }}>
                                  {term === 'monthly' ? 'Pay as you go' : `${data.years}yr commitment`}
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {/* Software License */}
                          <tr style={{ background: 'white' }}>
                            <td className={lbl} style={{ color: '#5A5750', borderBottom: '1px solid #F0EEEA' }}>
                              <div className="flex items-center gap-2.5">
                                <div className="w-[5px] h-[5px] rounded-full" style={{ background: '#714B67' }} />
                                Software License
                              </div>
                            </td>
                            {allQuoteData.map(({ term, data }) => (
                              <td key={term} className={val} style={{ ...colBorder, color: '#1A1915', borderBottom: '1px solid #F0EEEA', fontVariantNumeric: 'tabular-nums' }}>
                                {formatCurrency(data.totalSoftwareCost)}
                              </td>
                            ))}
                          </tr>

                          {/* Implementation */}
                          {hasAnyImpl && (
                            <tr style={{ background: '#FDFCFB' }}>
                              <td className={lbl} style={{ color: '#5A5750', borderBottom: '1px solid #F0EEEA' }}>
                                <div className="flex items-center gap-2.5">
                                  <div className="w-[5px] h-[5px] rounded-full" style={{ background: '#017E84' }} />
                                  Implementation
                                </div>
                              </td>
                              {allQuoteData.map(({ term, data }) => (
                                <td key={term} className={val} style={{ ...colBorder, color: '#1A1915', borderBottom: '1px solid #F0EEEA', fontVariantNumeric: 'tabular-nums' }}>
                                  {data.implementationCost > 0 ? formatCurrency(data.implementationCost) : <span style={{ color: '#D5D2CB' }}>—</span>}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* Odoo SH */}
                          {hasAnySH && (
                            <tr style={{ background: 'white' }}>
                              <td className={lbl} style={{ color: '#5A5750', borderBottom: '1px solid #F0EEEA' }}>
                                <div className="flex items-center gap-2.5">
                                  <div className="w-[5px] h-[5px] rounded-full" style={{ background: '#714B67' }} />
                                  Odoo SH Hosting
                                </div>
                              </td>
                              {allQuoteData.map(({ term, data }) => (
                                <td key={term} className={val} style={{ ...colBorder, color: '#1A1915', borderBottom: '1px solid #F0EEEA', fontVariantNumeric: 'tabular-nums' }}>
                                  {data.shTotalCost > 0 ? formatCurrency(data.shTotalCost) : <span style={{ color: '#D5D2CB' }}>—</span>}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* ── TOTAL CONTRACT ── */}
                          <tr style={{ background: '#F8F6F4' }}>
                            <td className="pl-5 pr-3 py-5" style={{ borderTop: '1px solid #D8D4CD', borderBottom: '1px solid #D8D4CD' }}>
                              <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: '#714B67' }}>Total Contract</div>
                            </td>
                            {allQuoteData.map(({ term, data }) => (
                              <td key={term} className="text-right pr-5 pl-3 py-5" style={{ ...colBorder, borderTop: '1px solid #D8D4CD', borderBottom: '1px solid #D8D4CD', fontVariantNumeric: 'tabular-nums' }}>
                                <span className="text-[17px] font-extrabold tracking-tight" style={{ color: '#2D1B2E' }}>
                                  {formatCurrency(data.totalCost)}
                                </span>
                              </td>
                            ))}
                          </tr>

                          {/* Amortized Monthly */}
                          <tr style={{ background: 'white' }}>
                            <td className={lbl} style={{ color: '#5A5750', borderBottom: '1px solid #F0EEEA' }}>
                              Effective Monthly
                            </td>
                            {allQuoteData.map(({ term, data }) => (
                              <td key={term} className={val} style={{ ...colBorder, color: '#714B67', borderBottom: '1px solid #F0EEEA', fontVariantNumeric: 'tabular-nums' }}>
                                {formatCurrency(data.amortizedMonthly)}<span className="text-[9px] font-normal" style={{ color: '#B0ADA4' }}> /mo</span>
                              </td>
                            ))}
                          </tr>

                          {/* ── SAVINGS ── */}
                          {hasAnySavings && (
                            <tr style={{ background: '#F0FDF4' }}>
                              <td className="pl-5 pr-3 py-5" style={{ borderBottom: '1px solid #BBF7D0' }}>
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#059669' }}>
                                    <TrendingUp className="w-3.5 h-3.5 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-[12px] font-extrabold" style={{ color: '#065f46' }}>You Save</div>
                                    <div className="text-[9px] font-medium" style={{ color: '#6ee7b7' }}>vs. monthly billing</div>
                                  </div>
                                </div>
                              </td>
                              {allQuoteData.map(({ term, data }) => (
                                <td key={term} className="text-right pr-5 pl-3 py-5" style={{ ...colBorder, borderColor: '#BBF7D0', borderBottom: '1px solid #BBF7D0', fontVariantNumeric: 'tabular-nums' }}>
                                  {data.totalSavings > 0 ? (
                                    <span className="text-[18px] font-extrabold tracking-tight" style={{ color: '#059669' }}>
                                      {formatCurrency(data.totalSavings)}
                                    </span>
                                  ) : (
                                    <span className="text-[12px] font-medium" style={{ color: '#a7f3d0' }}>—</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          )}

                          {/* ── FINANCING ── */}
                          {hasAnyFinancing && (
                            <>
                              <tr style={{ background: '#1B3A6B' }}>
                                <td colSpan={colCount + 1} className="px-5 py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
                                      <span className="text-white font-black text-[7px]">CF</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-white/90 uppercase tracking-[0.18em]">Catalyst Finance</span>
                                    <span className="text-[9px] font-medium ml-auto" style={{ color: 'rgba(147,197,253,0.6)' }}>{CATALYST_APR_LOW * 100}–{CATALYST_APR_HIGH * 100}% APR</span>
                                  </div>
                                </td>
                              </tr>
                              <tr style={{ background: '#F0F4FA' }}>
                                <td className={lbl} style={{ color: '#1B3A6B', borderBottom: '1px solid #E2E8F0' }}>
                                  Best Rate <span className="text-[9px] font-normal" style={{ color: '#93C5FD' }}>({CATALYST_APR_LOW * 100}%)</span>
                                </td>
                                {allQuoteData.map(({ term, data }) => (
                                  <td key={term} className={val} style={{ ...colBorder, borderColor: '#E2E8F0', color: '#1B3A6B', borderBottom: '1px solid #E2E8F0', fontVariantNumeric: 'tabular-nums' }}>
                                    {data.financingLow > 0 ? (
                                      <>{formatCurrency(data.financingLow)}<span className="text-[9px] font-normal" style={{ color: '#93C5FD' }}> /mo</span></>
                                    ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                                  </td>
                                ))}
                              </tr>
                              <tr style={{ background: '#F0F4FA' }}>
                                <td className={lbl} style={{ color: '#1B3A6B' }}>
                                  Standard <span className="text-[9px] font-normal" style={{ color: '#93C5FD' }}>({CATALYST_APR_HIGH * 100}%)</span>
                                </td>
                                {allQuoteData.map(({ term, data }) => (
                                  <td key={term} className={val} style={{ ...colBorder, borderColor: '#E2E8F0', color: '#1B3A6B', fontVariantNumeric: 'tabular-nums' }}>
                                    {data.financingHigh > 0 ? (
                                      <>{formatCurrency(data.financingHigh)}<span className="text-[9px] font-normal" style={{ color: '#93C5FD' }}> /mo</span></>
                                    ) : <span style={{ color: '#cbd5e1' }}>—</span>}
                                  </td>
                                ))}
                              </tr>
                            </>
                          )}

                          {/* ── PARTNER PAYOUT ── */}
                          {showPayoutView && (
                            <>
                              <tr style={{ background: '#92400e' }}>
                                <td colSpan={colCount + 1} className="px-5 py-2.5">
                                  <div className="flex items-center gap-2.5">
                                    <DollarSign className="w-3.5 h-3.5 text-amber-200" />
                                    <span className="text-[10px] font-bold text-amber-100 uppercase tracking-[0.18em]">Partner Payout</span>
                                    <span className="text-[8px] bg-white/15 text-amber-200 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ml-auto">Internal</span>
                                  </div>
                                </td>
                              </tr>
                              <tr style={{ background: '#FFFBEB' }}>
                                <td className={lbl} style={{ color: '#92400e', borderBottom: '1px solid #FDE68A' }}>
                                  MRR <span className="text-[9px] font-normal" style={{ color: '#FBBF24' }}>/mo</span>
                                </td>
                                {allQuoteData.map(({ term, data }) => {
                                  const isMonthly = term === 'monthly';
                                  const recurringBase = data.totalSoftwareCost + data.shTotalCost;
                                  const mrr = isMonthly ? recurringBase * 0.8 : recurringBase / 12;
                                  return (
                                    <td key={term} className={val} style={{ ...colBorder, borderColor: '#FDE68A', color: '#92400e', borderBottom: '1px solid #FDE68A', fontVariantNumeric: 'tabular-nums' }}>
                                      {formatCurrency(mrr)}
                                    </td>
                                  );
                                })}
                              </tr>
                              {hasAnyImpl && (
                                <tr style={{ background: '#FFFBEB' }}>
                                  <td className={lbl} style={{ color: '#92400e' }}>
                                    NRR <span className="text-[9px] font-normal" style={{ color: '#FBBF24' }}>one-time</span>
                                  </td>
                                  {allQuoteData.map(({ term, data }) => (
                                    <td key={term} className={val} style={{ ...colBorder, borderColor: '#FDE68A', color: '#92400e', fontVariantNumeric: 'tabular-nums' }}>
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
              <div className="h-[calc(100vh-160px)] flex flex-col items-center justify-center rounded-2xl" style={{ border: '2px dashed #E6E3DC' }}>
                <Info className="w-8 h-8 mb-3" style={{ color: '#D5D2CB' }} />
                <p className="text-[13px] font-medium" style={{ color: '#B0ADA4' }}>Select terms in the sidebar to generate quotes</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

