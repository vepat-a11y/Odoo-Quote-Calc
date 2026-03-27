import { useState } from 'react';
import { 
  Users, 
  Package, 
  Zap, 
  Code,
  Cpu, 
  Save,
  Info,
  Globe,
  Server,
  HardDrive,
  Layers,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard, Button, InputField, Select } from '@/components/ui-custom';
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

// 3-Tier Rate Factors for Financing
// Tier 1 (Micro Ticket): Total Amount < $15,000
// Tier 2 (Mid Ticket): $15,000 <= Total Amount < $25,000
// Tier 3 (Standard Ticket): Total Amount >= $25,000
const TIER1_THRESHOLD = 15000;
const TIER2_THRESHOLD = 25000;

// Tier 1: Micro Ticket (< $15,000) - Higher rates
const RATE_FACTORS_TIER1: { [key: string]: { low: number; high: number } } = {
  '1year': { low: 0.09000, high: 0.10230 },  // 12 months
  '2year': { low: 0.04690, high: 0.05250 },  // 24 months
  '3year': { low: 0.03250, high: 0.03690 },  // 36 months
  '4year': { low: 0.02590, high: 0.02920 },  // 48 months
  '5year': { low: 0.02200, high: 0.02460 }   // 60 months
};

// Tier 2: Mid Ticket ($15,000 - $24,999) - Matches $16,416 screenshot exactly
const RATE_FACTORS_TIER2: { [key: string]: { low: number; high: number } } = {
  '1year': { low: 0.09259, high: 0.10185 },  // 12 months
  '2year': { low: 0.04550, high: 0.05245 },  // 24 months
  '3year': { low: 0.03131, high: 0.03692 },  // 36 months
  '4year': { low: 0.02449, high: 0.02924 },  // 48 months
  '5year': { low: 0.02022, high: 0.02461 }   // 60 months
};

// Tier 3: Standard Ticket ($25,000+) - Standard factors
const RATE_FACTORS_TIER3: { [key: string]: { low: number; high: number } } = {
  '1year': { low: 0.08800, high: 0.09975 },  // 12 months
  '2year': { low: 0.04650, high: 0.05250 },  // 24 months
  '3year': { low: 0.03233, high: 0.03693 },  // 36 months
  '4year': { low: 0.02480, high: 0.02922 },  // 48 months
  '5year': { low: 0.02083, high: 0.02462 }   // 60 months
};

// Calculate monthly financing payment using Rate Factor formula
// Monthly Payment = Total Quote Amount × Rate Factor
function calculateFinancingPayment(totalAmount: number, termKey: string): { low: number; high: number } {
  if (totalAmount <= 0) return { low: 0, high: 0 };
  
  // Select tier based on total amount (3-tier system)
  let rateFactors: { [key: string]: { low: number; high: number } };
  if (totalAmount >= TIER2_THRESHOLD) {
    rateFactors = RATE_FACTORS_TIER3;  // Standard Ticket: $25,000+
  } else if (totalAmount >= TIER1_THRESHOLD) {
    rateFactors = RATE_FACTORS_TIER2;  // Mid Ticket: $15,000 - $24,999
  } else {
    rateFactors = RATE_FACTORS_TIER1;  // Micro Ticket: < $15,000
  }
  
  const factors = rateFactors[termKey];
  if (!factors) return { low: 0, high: 0 };
  
  return {
    low: totalAmount * factors.low,
    high: totalAmount * factors.high
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
      // Baseline = Year 1 monthly rate × first 12 months + Year2+ monthly rate × remaining months
      // This avoids counting the Year1→Year2+ monthly rate increase as savings (double-entry)
      const fullMonthlyTotal = users * monthlyPlanYear1 * 12 + users * monthlyPlanYear2Plus * (months - 12);
      
      // Implementation discount savings
      const implDiscountSavings = implCostBeforeDiscount * (implDiscount / 100);
      
      // Total savings = (monthly baseline - yearly software cost) + impl discount savings
      totalSavings = (fullMonthlyTotal - totalSoftwareCost) + implDiscountSavings;
    }
    
    // Calculate financing estimates using tiered rate factors (only for yearly terms)
    let financingLow = 0;
    let financingHigh = 0;
    
    if (!isMonthly) {
      const financing = calculateFinancingPayment(totalCost, termKey);
      financingLow = financing.low;
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
      financingHigh
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
    <div className="min-h-screen pb-20 bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <OdooLogo />
            <div className="h-5 w-px bg-gray-200" />
            <span className="text-sm text-gray-500 font-medium hidden sm:block">Pricing Calculator</span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Country Selector */}
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
              <Globe className="w-4 h-4 text-gray-400" />
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value as Country)}
                className="bg-transparent text-gray-700 text-sm font-medium outline-none cursor-pointer"
                data-testid="select-country"
              >
                <option value="US">USD</option>
                <option value="CA">CAD</option>
              </select>
            </div>
            
            <Button variant="secondary" onClick={handleExportPDF} className="hidden md:flex text-gray-600 bg-gray-100 hover:bg-gray-200 border-0" data-testid="button-export-pdf">
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={handleSaveQuote} isLoading={createQuote.isPending} className="bg-[#714B67] hover:bg-[#5d3d55] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Quote
            </Button>
          </div>
        </div>
      </header>

      <main className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Section 1: Configuration - Full Width */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard 
            title="Configuration" 
            description={`Set your user count and plan details • Prices in ${countryConfig.currency}`}
            className="relative overflow-hidden bg-white"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {/* Users Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#714B67]" /> Number of Users
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="500"
                    value={users}
                    onChange={(e) => setUsers(parseInt(e.target.value) || 0)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#714B67]"
                    data-testid="slider-users"
                  />
                  <div className="mt-4 flex items-center gap-4">
                    <InputField 
                      type="number" 
                      min="1" 
                      value={users} 
                      onChange={(e) => setUsers(parseInt(e.target.value) || 0)}
                      className="font-mono text-lg text-center bg-gray-50 border-gray-200 text-gray-800"
                      data-testid="input-users"
                    />
                    <div className="text-xs text-gray-500">
                      {users < 5 ? 'Small Team' : users < 50 ? 'Growing Business' : 'Enterprise'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#017E84]" /> Odoo Plan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPlan('standard')}
                    data-testid="button-plan-standard"
                    className={`p-4 rounded-xl border transition-all duration-200 text-left relative overflow-hidden ${
                      plan === 'standard' 
                        ? 'bg-[#714B67]/10 border-[#714B67] text-gray-800' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-semibold mb-1">Standard</div>
                    <div className="text-xs opacity-70">Core modules + Online</div>
                    {plan === 'standard' && <motion.div layoutId="plan-active" className="absolute inset-0 border-2 border-[#714B67] rounded-xl pointer-events-none" />}
                  </button>
                  <button
                    onClick={() => setPlan('custom')}
                    data-testid="button-plan-custom"
                    className={`p-4 rounded-xl border transition-all duration-200 text-left relative overflow-hidden ${
                      plan === 'custom' 
                        ? 'bg-[#017E84]/10 border-[#017E84] text-gray-800' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-semibold mb-1">Custom</div>
                    <div className="text-xs opacity-70">Odoo Studio + API</div>
                    {plan === 'custom' && <motion.div layoutId="plan-active" className="absolute inset-0 border-2 border-[#017E84] rounded-xl pointer-events-none" />}
                  </button>
                </div>
              </div>

              {/* Implementation Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#017E84]" /> Implementation Pack
                </label>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Select
                      options={Object.entries(currentImplementations).map(([key, val]) => ({
                        value: key,
                        label: val.label
                      }))}
                      value={implementation}
                      onChange={(e) => setImplementation(e.target.value)}
                      data-testid="select-implementation"
                    />
                  </div>
                  <div className="w-24">
                    <div className="relative">
                      <input
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={implMultiplier}
                        onChange={(e) => setImplMultiplier(parseFloat(e.target.value) || 1)}
                        disabled={implementation === 'none'}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center text-gray-800 focus:border-[#714B67] outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                        data-testid="input-impl-multiplier"
                      />
                      <span className="absolute right-2 top-2.5 text-gray-400 text-xs">x</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                  <span>
                    {implMultiplier !== 1 && implementation !== 'none' ? (
                      <>
                        {(currentImplementations[implementation as keyof typeof currentImplementations]?.hours || 0)} x {implMultiplier} = {' '}
                        <span className="text-[#017E84] font-medium">
                          {((currentImplementations[implementation as keyof typeof currentImplementations]?.hours || 0) * implMultiplier).toFixed(0)} hours
                        </span>
                      </>
                    ) : (
                      <>Includes {currentImplementations[implementation as keyof typeof currentImplementations]?.hours || 0} hours</>
                    )}
                  </span>
                  <span className="text-gray-700 font-mono">
                    {implMultiplier !== 1 && implementation !== 'none' ? (
                      <span className="text-[#017E84]">{formatCurrency((currentImplementations[implementation as keyof typeof currentImplementations]?.price || 0) * implMultiplier)}</span>
                    ) : (
                      formatCurrency(currentImplementations[implementation as keyof typeof currentImplementations]?.price || 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Odoo SH Section (USD Only) */}
              {country === 'US' && (
                <div className="md:col-span-3 mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Server className="w-4 h-4 text-[#714B67]" /> Odoo SH (Dedicated Hosting)
                    </label>
                    <button
                      onClick={() => setShEnabled(!shEnabled)}
                      data-testid="button-toggle-sh"
                      className={`relative w-12 h-6 rounded-full transition-colors ${shEnabled ? 'bg-[#714B67]' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${shEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  
                  {shEnabled && (
                    <div className="space-y-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                      {/* Hosting Type Toggle */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">Hosting Type:</span>
                        <div className="flex rounded-lg overflow-hidden border border-gray-200">
                          <button
                            onClick={() => {
                              setShHostingType('shared');
                              setShWorkers(Math.min(Math.max(shWorkers, 1), 8));
                              setShStorage(Math.min(shStorage, 512));
                            }}
                            data-testid="button-sh-shared"
                            className={`px-4 py-2 text-sm font-medium transition-colors ${shHostingType === 'shared' ? 'bg-[#714B67] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                          >
                            Shared
                          </button>
                          <button
                            onClick={() => {
                              setShHostingType('dedicated');
                              setShWorkers(Math.max(shWorkers, 4));
                            }}
                            data-testid="button-sh-dedicated"
                            className={`px-4 py-2 text-sm font-medium transition-colors ${shHostingType === 'dedicated' ? 'bg-[#714B67] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                          >
                            Dedicated
                          </button>
                        </div>
                        {shHostingType === 'dedicated' && (
                          <span className="text-xs text-[#714B67]">+$480/mo (annual) or +$600/mo (monthly)</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Workers */}
                        <div className="space-y-2">
                          <label className="text-xs text-gray-500 flex items-center gap-1">
                            <Cpu className="w-3 h-3" /> Workers
                          </label>
                          <input
                            type="number"
                            min={shLimits.workerMin}
                            max={shLimits.workerMax}
                            value={shWorkers}
                            onChange={(e) => setShWorkers(Math.min(Math.max(parseInt(e.target.value) || shLimits.workerMin, shLimits.workerMin), shLimits.workerMax))}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-[#714B67] outline-none"
                            data-testid="input-sh-workers"
                          />
                          <div className="text-xs text-gray-400">{shLimits.workerMin}-{shLimits.workerMax} workers</div>
                        </div>
                        
                        {/* Storage */}
                        <div className="space-y-2">
                          <label className="text-xs text-gray-500 flex items-center gap-1">
                            <HardDrive className="w-3 h-3" /> Storage (GB)
                          </label>
                          <input
                            type="number"
                            min={shLimits.storageMin}
                            max={shLimits.storageMax}
                            value={shStorage}
                            onChange={(e) => setShStorage(Math.min(Math.max(parseInt(e.target.value) || shLimits.storageMin, shLimits.storageMin), shLimits.storageMax))}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-[#714B67] outline-none"
                            data-testid="input-sh-storage"
                          />
                          <div className="text-xs text-gray-400">{shLimits.storageMin}-{shLimits.storageMax} GB</div>
                        </div>
                        
                        {/* Staging Environments */}
                        <div className="space-y-2">
                          <label className="text-xs text-gray-500 flex items-center gap-1">
                            <Layers className="w-3 h-3" /> Staging Env.
                          </label>
                          <input
                            type="number"
                            min={shLimits.stagingMin}
                            max={shLimits.stagingMax}
                            value={shStaging}
                            onChange={(e) => setShStaging(Math.min(Math.max(parseInt(e.target.value) || 0, shLimits.stagingMin), shLimits.stagingMax))}
                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:border-[#714B67] outline-none"
                            data-testid="input-sh-staging"
                          />
                          <div className="text-xs text-gray-400">0-{shLimits.stagingMax} environments</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                        Odoo SH: <span className="text-[#714B67] font-mono font-medium">{formatCurrency(calculateShMonthlyCost(true))}/mo</span> (annual) | <span className="text-[#714B67] font-mono font-medium">{formatCurrency(calculateShMonthlyCost(false))}/mo</span> (monthly)
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        </motion.section>

        {/* Section 2: Advanced Pricing & Discounts - Full Width (Always Visible) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <GlassCard 
            title="Advanced Pricing & Discounts"
            description="Configure term visibility and optional discounts"
            className="overflow-visible bg-white"
          >
            <div className="space-y-6">
                    <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">Select Terms to Display</div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {Object.keys(selectedTerms).map((term) => (
                        <button
                          key={term}
                          onClick={() => setSelectedTerms(prev => ({...prev, [term]: !prev[term as TermKey]}))}
                          data-testid={`button-term-${term}`}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                            selectedTerms[term as TermKey]
                              ? 'bg-[#714B67] border-[#714B67] text-white'
                              : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {term === 'monthly' ? 'Monthly' : term.replace('year', ' Year')}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                      {activeTerms.map((term) => (
                        <div key={term} className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                          <div className="text-sm font-medium text-gray-700 capitalize">
                            {term === 'monthly' ? 'Monthly' : term.replace('year', ' Year')}
                          </div>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Plan % Off</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={termDiscounts[term]?.plan || ''}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setTermDiscounts(prev => ({
                                      ...prev,
                                      [term]: { ...prev[term], plan: val }
                                    }));
                                  }}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-right pr-7 text-gray-800 focus:border-[#714B67] outline-none"
                                  data-testid={`input-plan-discount-${term}`}
                                />
                                <span className="absolute right-2 top-2 text-gray-400 text-sm">%</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">Impl % Off</label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={termDiscounts[term]?.impl || ''}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setTermDiscounts(prev => ({
                                      ...prev,
                                      [term]: { ...prev[term], impl: val }
                                    }));
                                  }}
                                  className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-right pr-7 text-gray-800 focus:border-[#714B67] outline-none"
                                  data-testid={`input-impl-discount-${term}`}
                                />
                                <span className="absolute right-2 top-2 text-gray-400 text-sm">%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
            </div>
          </GlassCard>
        </motion.section>

        {/* Section 3: Quote Cards - Full Width Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#714B67', letterSpacing: '0.08em' }}>Quote Comparison</h2>
            <div className="text-sm text-gray-500">{activeTerms.length} terms selected</div>
          </div>
          
          {activeTerms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allQuoteData.map(({ term, data }, index) => (
                <motion.div
                  key={term}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <QuoteCard data={data} termKey={term} formatCurrency={formatCurrency} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
              <Info className="w-12 h-12 mb-4 opacity-50" />
              <p>Select terms from the Discounts section to view quotes</p>
            </div>
          )}
        </motion.section>

      </main>
    </div>
  );
}

// === QUOTE CARD COMPONENT ===

function QuoteCard({ data, termKey, formatCurrency }: { data: any, termKey: string, formatCurrency: (n: number) => string }) {
  const isMonthly = termKey === 'monthly';
  const hasFinancing = !isMonthly && data.financingLow > 0;

  return (
    <div className="relative group h-full rounded-2xl">
      
      <GlassCard className="h-full bg-white hover:shadow-md transition-all relative overflow-hidden group" data-testid={`card-quote-${termKey}`}>
        <div className="flex flex-col h-full relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-semibold text-gray-800">{data.termLabel}</h3>
              <p className="text-sm text-gray-500">{isMonthly ? 'Pay as you go' : 'Upfront Commitment'}</p>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#714B67]" />
                <span className="text-sm text-gray-600">Software</span>
              </div>
              <span className="text-sm font-mono text-gray-800">{formatCurrency(data.totalSoftwareCost)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#017E84]" />
                <span className="text-sm text-gray-600">Implementation</span>
              </div>
              <span className="text-sm font-mono text-gray-800">{formatCurrency(data.implementationCost)}</span>
            </div>

            {data.shTotalCost > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#714B67]" />
                  <span className="text-sm text-gray-600">Odoo SH</span>
                </div>
                <span className="text-sm font-mono text-gray-800">{formatCurrency(data.shTotalCost)}</span>
              </div>
            )}

            {!isMonthly && data.totalSavings > 0 && (
              <div className="flex justify-between items-center py-2 bg-green-50 rounded-lg px-3 border border-green-200">
                <span className="text-xs font-bold text-green-600 uppercase tracking-wide">Savings</span>
                <span className="text-sm font-mono font-bold text-green-600">-{formatCurrency(data.totalSavings)}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Total Contract</div>
            <div className="text-2xl font-bold font-mono text-gray-900 mb-4">
              {formatCurrency(data.totalCost)}
            </div>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Amortized Monthly</p>
              <div className="text-xl font-bold text-[#714B67]">
                {formatCurrency(data.amortizedMonthly)}
                <span className="text-sm font-normal text-gray-400 ml-1">/mo</span>
              </div>
            </div>

            {hasFinancing && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-[#017E84]" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Financing Estimate</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-emerald-600 font-medium uppercase mb-1">Low Estimate</div>
                    <div className="text-base font-bold text-emerald-700">{formatCurrency(data.financingLow)}<span className="text-xs font-normal">/mo</span></div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                    <div className="text-[10px] text-amber-600 font-medium uppercase mb-1">High Estimate</div>
                    <div className="text-base font-bold text-amber-700">{formatCurrency(data.financingHigh)}<span className="text-xs font-normal">/mo</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
