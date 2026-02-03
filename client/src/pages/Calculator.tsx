import { useState } from 'react';
import { 
  Calculator as CalcIcon, 
  Users, 
  Package, 
  Zap, 
  DollarSign, 
  Code, 
  Cpu, 
  CheckCircle2,
  Save,
  Info,
  Globe,
  Server,
  HardDrive,
  Layers,
  TrendingUp,
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

// Financing Interest Rates by Term Length
const FINANCING_RATES: { [key: string]: { low: number; high: number } } = {
  '1year': { low: 14.9, high: 41.0 },
  '2year': { low: 11.9, high: 23.9 },
  '3year': { low: 10.4, high: 19.9 },
  '4year': { low: 11.3, high: 17.9 },
  '5year': { low: 11.6, high: 16.4 }
};

// Calculate monthly financing payment using standard loan amortization formula
function calculateFinancingPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || termYears <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  const numPayments = termYears * 12;
  if (monthlyRate === 0) return principal / numPayments;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  return payment;
}

type TermKey = 'monthly' | '1year' | '2year' | '3year' | '4year' | '5year';
type ShHostingType = 'shared' | 'dedicated';

interface TermDiscounts {
  [key: string]: { plan: number; impl: number };
}

interface SelectedTerms {
  [key: string]: boolean;
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
      // Yearly terms: use yearly rates
      // Year 1 at year1 rate (no discount - already discounted)
      const year1Cost = users * yearlyPlanYear1 * 12;
      
      // Year 2+ (if applicable) - plan discount ONLY applies here
      let year2PlusCost = 0;
      let year2PlusCostBeforeDiscount = 0;
      if (years > 1) {
        const remainingYears = years - 1;
        year2PlusCostBeforeDiscount = users * yearlyPlanYear2Plus * 12 * remainingYears;
        year2PlusCost = year2PlusCostBeforeDiscount * (1 - planDiscount / 100);
      }
      
      softwareCostBeforeDiscount = year1Cost + year2PlusCostBeforeDiscount;
      totalSoftwareCost = year1Cost + year2PlusCost;
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
      // Plan savings: compare monthly Year2+ rate (full price) to yearly rates
      // Full monthly cost = Year 2+ monthly rate * total months * users
      const fullMonthlyTotal = monthlyPlanYear2Plus * months * users;
      
      // Yearly software cost
      const yearlyYear1Cost = yearlyPlanYear1 * 12 * users;
      const yearlyYear2PlusCost = years > 1 ? yearlyPlanYear2Plus * 12 * (years - 1) * users : 0;
      const yearlyTotalSoftware = yearlyYear1Cost + yearlyYear2PlusCost;
      
      // Plan savings = difference between monthly and yearly rates
      const planSavings = fullMonthlyTotal - yearlyTotalSoftware;
      
      // Add any plan discount savings (only on Year 2+ portion)
      const year2PlusCostForDiscount = years > 1 ? yearlyPlanYear2Plus * 12 * (years - 1) * users : 0;
      const planDiscountSavings = year2PlusCostForDiscount * (planDiscount / 100);
      
      // Implementation discount savings (simple: impl price * discount %)
      const implDiscountSavings = implCostBeforeDiscount * (implDiscount / 100);
      
      // Total savings = plan rate savings + plan discount + impl discount
      totalSavings = planSavings + planDiscountSavings + implDiscountSavings;
    }
    
    // Calculate financing estimates (only for yearly terms)
    let financingLow = 0;
    let financingHigh = 0;
    let financingRates = { low: 0, high: 0 };
    
    if (!isMonthly && FINANCING_RATES[termKey]) {
      financingRates = FINANCING_RATES[termKey];
      financingLow = calculateFinancingPayment(totalCost, financingRates.low, years);
      financingHigh = calculateFinancingPayment(totalCost, financingRates.high, years);
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
      financingRates
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

  // Compute best value term - the one with the lowest amortized monthly cost (excluding monthly)
  // Tie-breaker: if costs are equal, prefer the longer term (better commitment value)
  const getBestValueTerm = (): TermKey | null => {
    const yearlyQuotes = allQuoteData.filter(q => q.term !== 'monthly');
    if (yearlyQuotes.length === 0) return null;
    
    let bestTerm: TermKey | null = null;
    let lowestAmortized = Infinity;
    let longestYears = 0;
    
    yearlyQuotes.forEach(({ term, data }) => {
      const years = data.years;
      // Strictly lower wins, or same cost but longer term wins (tie-breaker)
      if (data.amortizedMonthly < lowestAmortized || 
          (data.amortizedMonthly === lowestAmortized && years > longestYears)) {
        lowestAmortized = data.amortizedMonthly;
        bestTerm = term;
        longestYears = years;
      }
    });
    
    return bestTerm;
  };
  
  const bestValueTerm = getBestValueTerm();

  // Modern Minimalist PDF Export Function
  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Use precomputed quote data with best value flag
    const quoteData = allQuoteData.map(({ term, data }) => ({
      ...data,
      isBestValue: term === bestValueTerm
    }));
    
    const numTerms = quoteData.length;
    if (numTerms === 0) {
      toast({
        title: "No Terms Selected",
        description: "Please select at least one term to export.",
        variant: "destructive"
      });
      return;
    }

    // Minimalist Header - thin accent line only
    doc.setFillColor(113, 75, 103);
    doc.rect(0, 0, pageWidth, 4, 'F');
    
    // Title
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Quote Comparison', margin, 25);
    
    // Subtitle with config
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    const configText = `${users} Users  ·  ${plan === 'standard' ? 'Standard' : 'Custom'}  ·  ${countryConfig.currency}  ·  ${currentImplementations[implementation as keyof typeof currentImplementations]?.label || 'Self-Service'}`;
    doc.text(configText, margin, 33);
    
    // Date
    doc.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), pageWidth - margin, 25, { align: 'right' });

    // Table setup
    const tableTop = 48;
    const tableWidth = pageWidth - (margin * 2);
    const labelColWidth = 55;
    const termColWidth = (tableWidth - labelColWidth) / numTerms;
    const rowHeight = 14;
    let y = tableTop;

    // Check what rows to show
    const hasAnySH = quoteData.some(d => d.shTotalCost > 0);
    const hasAnySavings = quoteData.some(d => d.totalSavings > 0);
    const hasAnyFinancing = quoteData.some(d => d.financingLow > 0);

    // Column headers with term labels
    doc.setFillColor(252, 252, 252);
    doc.rect(margin, y, tableWidth, rowHeight + 2, 'F');
    
    // Thin top border
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + tableWidth, y);
    
    y += 10;
    
    quoteData.forEach((data, i) => {
      const colX = margin + labelColWidth + (i * termColWidth) + (termColWidth / 2);
      
      // Best value indicator - subtle underline
      if (data.isBestValue) {
        doc.setFillColor(1, 126, 132);
        doc.rect(colX - 18, y + 3, 36, 1.5, 'F');
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(data.isBestValue ? 1 : 70, data.isBestValue ? 126 : 70, data.isBestValue ? 132 : 70);
      doc.text(data.termLabel, colX, y, { align: 'center' });
      
      if (data.isBestValue) {
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text('BEST VALUE', colX, y + 9, { align: 'center' });
      }
    });
    
    y += 18;

    // Data rows
    const dataRows = [
      { label: 'Software', key: 'totalSoftwareCost' },
      { label: 'Implementation', key: 'implementationCost' },
      ...(hasAnySH ? [{ label: 'Odoo SH', key: 'shTotalCost' }] : []),
      ...(hasAnySavings ? [{ label: 'Savings', key: 'totalSavings', isGreen: true }] : []),
    ];

    dataRows.forEach((row, rowIdx) => {
      // Alternating row background
      if (rowIdx % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, y - 8, tableWidth, rowHeight, 'F');
      }
      
      // Row label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(row.label, margin + 4, y);
      
      // Values
      quoteData.forEach((data, i) => {
        const colX = margin + labelColWidth + (i * termColWidth) + (termColWidth / 2);
        const numValue = data[row.key as keyof typeof data] as number;
        
        if (row.isGreen && numValue > 0) {
          doc.setTextColor(22, 163, 74);
          doc.text('-' + formatCurrency(numValue), colX, y, { align: 'center' });
        } else {
          doc.setTextColor(60, 60, 60);
          doc.text(numValue > 0 ? formatCurrency(numValue) : '—', colX, y, { align: 'center' });
        }
      });
      
      y += rowHeight;
    });

    // Divider line
    y += 2;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, y, margin + tableWidth, y);
    y += 12;

    // Total row - highlighted
    doc.setFillColor(113, 75, 103, 0.08);
    doc.setFillColor(248, 246, 247);
    doc.rect(margin, y - 8, tableWidth, rowHeight + 4, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(70, 70, 70);
    doc.text('Total Contract', margin + 4, y);
    
    quoteData.forEach((data, i) => {
      const colX = margin + labelColWidth + (i * termColWidth) + (termColWidth / 2);
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text(formatCurrency(data.totalCost), colX, y, { align: 'center' });
    });
    
    y += rowHeight + 4;

    // Amortized monthly row
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text('Amortized Monthly', margin + 4, y);
    
    quoteData.forEach((data, i) => {
      const colX = margin + labelColWidth + (i * termColWidth) + (termColWidth / 2);
      doc.setTextColor(113, 75, 103);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(data.amortizedMonthly) + '/mo', colX, y, { align: 'center' });
    });
    
    y += rowHeight + 8;

    // Financing section (if applicable)
    if (hasAnyFinancing) {
      doc.setDrawColor(230, 230, 230);
      doc.line(margin, y - 4, margin + tableWidth, y - 4);
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(1, 126, 132);
      doc.text('FINANCING OPTIONS', margin + 4, y + 4);
      y += 14;
      
      // Low APR row
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Low APR', margin + 4, y);
      
      quoteData.forEach((data, i) => {
        const colX = margin + labelColWidth + (i * termColWidth) + (termColWidth / 2);
        if (data.financingLow > 0) {
          doc.setTextColor(60, 60, 60);
          doc.text(`${formatCurrency(data.financingLow)}/mo`, colX - 10, y, { align: 'center' });
          doc.setTextColor(140, 140, 140);
          doc.setFontSize(7);
          doc.text(`${data.financingRates?.low}%`, colX + 20, y, { align: 'center' });
          doc.setFontSize(8);
        } else {
          doc.setTextColor(180, 180, 180);
          doc.text('—', colX, y, { align: 'center' });
        }
      });
      
      y += 10;
      
      // High APR row
      doc.setTextColor(100, 100, 100);
      doc.text('High APR', margin + 4, y);
      
      quoteData.forEach((data, i) => {
        const colX = margin + labelColWidth + (i * termColWidth) + (termColWidth / 2);
        if (data.financingHigh > 0) {
          doc.setTextColor(60, 60, 60);
          doc.text(`${formatCurrency(data.financingHigh)}/mo`, colX - 10, y, { align: 'center' });
          doc.setTextColor(140, 140, 140);
          doc.setFontSize(7);
          doc.text(`${data.financingRates?.high}%`, colX + 20, y, { align: 'center' });
          doc.setFontSize(8);
        } else {
          doc.setTextColor(180, 180, 180);
          doc.text('—', colX, y, { align: 'center' });
        }
      });
    }

    // Footer - minimal
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text('Estimates only. Final pricing may vary.', margin, pageHeight - 8);
    doc.text('Odoo Enterprise', pageWidth - margin, pageHeight - 8, { align: 'right' });

    // Save the PDF
    doc.save(`odoo-quote-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "PDF Generated",
      description: "Your quote comparison has been exported.",
    });
  };

  return (
    <div className="min-h-screen pb-20 bg-[#FAFAFA]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#714B67] flex items-center justify-center">
              <CalcIcon className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#714B67]">
                Odoo Estimator
              </h1>
              <p className="text-xs text-gray-500 font-medium">Enterprise Pricing Calculator</p>
            </div>
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
            <h2 className="text-xl font-semibold text-gray-800">Quote Comparison</h2>
            <div className="text-sm text-gray-500">{activeTerms.length} terms selected</div>
          </div>
          
          {activeTerms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allQuoteData.map(({ term, data }, index) => {
                const isBestValue = term === bestValueTerm;
                return (
                  <motion.div
                    key={term}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <QuoteCard data={data} termKey={term} formatCurrency={formatCurrency} isBestValue={isBestValue} />
                  </motion.div>
                );
              })}
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

function QuoteCard({ data, termKey, formatCurrency, isBestValue }: { data: any, termKey: string, formatCurrency: (n: number) => string, isBestValue: boolean }) {
  const isMonthly = termKey === 'monthly';
  const hasFinancing = !isMonthly && data.financingLow > 0;

  return (
    <div className={`relative group h-full ${isBestValue ? 'ring-2 ring-[#017E84] shadow-lg' : ''} rounded-2xl`}>
      {isBestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#017E84] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-20 flex items-center gap-1">
          <Zap className="w-3 h-3" /> BEST VALUE
        </div>
      )}
      
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
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#017E84]" />
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Financing Estimate</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Low ({data.financingRates.low}% APR)</span>
                    <span className="text-sm font-mono font-medium text-gray-700">{formatCurrency(data.financingLow)}/mo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">High ({data.financingRates.high}% APR)</span>
                    <span className="text-sm font-mono font-medium text-gray-700">{formatCurrency(data.financingHigh)}/mo</span>
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
