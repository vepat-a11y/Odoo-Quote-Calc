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
  Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard, Button, InputField, Select } from '@/components/ui-custom';
import { useCreateQuote } from '@/hooks/use-quotes';
import { useToast } from '@/hooks/use-toast';

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
      worker: 57.60,
      storage: 0.20,
      staging: 14.40,
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
  const [shBillingCycle, setShBillingCycle] = useState<'monthly' | 'annual'>('annual');
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
    '1year': true,
    '2year': false,
    '3year': false,
    '4year': false,
    '5year': false
  });

  // Get current pricing based on country
  const currentPricing = PRICING[country];
  const currentImplementations = IMPLEMENTATIONS[country];
  const countryConfig = COUNTRY_CONFIG[country];

  // Format currency based on country
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: countryConfig.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  // Calculate SH monthly cost (uses its own billing cycle, independent of plan term)
  const calculateShMonthlyCost = () => {
    if (!shEnabled || country !== 'US') return 0;
    const isAnnual = shBillingCycle === 'annual';
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

    // Odoo SH cost (USD only, no discounts, uses its own billing cycle)
    const shMonthlyCost = calculateShMonthlyCost();
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
    
    return {
      termLabel: isMonthly ? 'Monthly' : `${years} Year${years > 1 ? 's' : ''}`,
      totalSoftwareCost,
      implementationCost,
      shTotalCost,
      totalCost,
      amortizedMonthly,
      totalSavings,
      isBestValue: !isMonthly && years >= 3
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

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/5">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-primary/25">
              <CalcIcon className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Odoo Estimator
              </h1>
              <p className="text-xs text-white/40 font-medium tracking-wider uppercase">Enterprise Pricing Calculator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Country Selector */}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10">
              <Globe className="w-4 h-4 text-white/50" />
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value as Country)}
                className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer"
                data-testid="select-country"
              >
                <option value="US" className="bg-gray-900">🇺🇸 USD</option>
                <option value="CA" className="bg-gray-900">🇨🇦 CAD</option>
              </select>
            </div>
            
            <Button variant="secondary" onClick={() => window.print()} className="hidden md:flex">
              Export PDF
            </Button>
            <Button onClick={handleSaveQuote} isLoading={createQuote.isPending} className="shadow-primary/25">
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
            className="relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
              {/* Users Input */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Number of Users
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="500"
                    value={users}
                    onChange={(e) => setUsers(parseInt(e.target.value) || 0)}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                    data-testid="slider-users"
                  />
                  <div className="mt-4 flex items-center gap-4">
                    <InputField 
                      type="number" 
                      min="1" 
                      value={users} 
                      onChange={(e) => setUsers(parseInt(e.target.value) || 0)}
                      className="font-mono text-lg text-center"
                      data-testid="input-users"
                    />
                    <div className="text-xs text-white/40">
                      {users < 5 ? 'Small Team' : users < 50 ? 'Growing Business' : 'Enterprise'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Plan Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-fuchsia-400" /> Odoo Plan
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setPlan('standard')}
                    data-testid="button-plan-standard"
                    className={`p-4 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group ${
                      plan === 'standard' 
                        ? 'bg-primary/20 border-primary/50 text-white' 
                        : 'bg-black/20 border-white/10 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-semibold mb-1">Standard</div>
                    <div className="text-xs opacity-70">Core modules + Online</div>
                    {plan === 'standard' && <motion.div layoutId="plan-active" className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none" />}
                  </button>
                  <button
                    onClick={() => setPlan('custom')}
                    data-testid="button-plan-custom"
                    className={`p-4 rounded-xl border transition-all duration-200 text-left relative overflow-hidden group ${
                      plan === 'custom' 
                        ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-white' 
                        : 'bg-black/20 border-white/10 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <div className="font-semibold mb-1">Custom</div>
                    <div className="text-xs opacity-70">Odoo Studio + API</div>
                    {plan === 'custom' && <motion.div layoutId="plan-active" className="absolute inset-0 border-2 border-fuchsia-500 rounded-xl pointer-events-none" />}
                  </button>
                </div>
              </div>

              {/* Implementation Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" /> Implementation Pack
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
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-center focus:border-primary/50 outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                        data-testid="input-impl-multiplier"
                      />
                      <span className="absolute right-2 top-2.5 text-white/30 text-xs">x</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-white/40 px-1">
                  <span>
                    {implMultiplier !== 1 && implementation !== 'none' ? (
                      <>
                        {(currentImplementations[implementation as keyof typeof currentImplementations]?.hours || 0)} x {implMultiplier} = {' '}
                        <span className="text-cyan-400 font-medium">
                          {((currentImplementations[implementation as keyof typeof currentImplementations]?.hours || 0) * implMultiplier).toFixed(0)} hours
                        </span>
                      </>
                    ) : (
                      <>Includes {currentImplementations[implementation as keyof typeof currentImplementations]?.hours || 0} hours</>
                    )}
                  </span>
                  <span className="text-white/60 font-mono">
                    {implMultiplier !== 1 && implementation !== 'none' ? (
                      <span className="text-cyan-400">{formatCurrency((currentImplementations[implementation as keyof typeof currentImplementations]?.price || 0) * implMultiplier)}</span>
                    ) : (
                      formatCurrency(currentImplementations[implementation as keyof typeof currentImplementations]?.price || 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Odoo SH Section (USD Only) */}
              {country === 'US' && (
                <div className="md:col-span-3 mt-6 pt-6 border-t border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                      <Server className="w-4 h-4 text-orange-400" /> Odoo SH (Dedicated Hosting)
                    </label>
                    <button
                      onClick={() => setShEnabled(!shEnabled)}
                      data-testid="button-toggle-sh"
                      className={`relative w-12 h-6 rounded-full transition-colors ${shEnabled ? 'bg-orange-500' : 'bg-white/10'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${shEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                  
                  {shEnabled && (
                    <div className="space-y-4 bg-black/20 rounded-xl p-4 border border-orange-500/20">
                      {/* Billing Cycle Toggle */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-white/40">Billing:</span>
                        <div className="flex rounded-lg overflow-hidden border border-white/10">
                          <button
                            onClick={() => setShBillingCycle('monthly')}
                            data-testid="button-sh-billing-monthly"
                            className={`px-4 py-2 text-sm font-medium transition-colors ${shBillingCycle === 'monthly' ? 'bg-orange-500/30 text-orange-300' : 'bg-transparent text-white/50 hover:bg-white/5'}`}
                          >
                            Monthly
                          </button>
                          <button
                            onClick={() => setShBillingCycle('annual')}
                            data-testid="button-sh-billing-annual"
                            className={`px-4 py-2 text-sm font-medium transition-colors ${shBillingCycle === 'annual' ? 'bg-orange-500/30 text-orange-300' : 'bg-transparent text-white/50 hover:bg-white/5'}`}
                          >
                            Annual
                          </button>
                        </div>
                        <span className="text-xs text-white/40">
                          {shBillingCycle === 'annual' ? '(Save with yearly commitment)' : '(Pay as you go)'}
                        </span>
                      </div>

                      {/* Hosting Type Toggle */}
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-white/40">Hosting Type:</span>
                        <div className="flex rounded-lg overflow-hidden border border-white/10">
                          <button
                            onClick={() => {
                              setShHostingType('shared');
                              setShWorkers(Math.min(Math.max(shWorkers, 1), 8));
                              setShStorage(Math.min(shStorage, 512));
                            }}
                            data-testid="button-sh-shared"
                            className={`px-4 py-2 text-sm font-medium transition-colors ${shHostingType === 'shared' ? 'bg-orange-500/30 text-orange-300' : 'bg-transparent text-white/50 hover:bg-white/5'}`}
                          >
                            Shared
                          </button>
                          <button
                            onClick={() => {
                              setShHostingType('dedicated');
                              setShWorkers(Math.max(shWorkers, 4));
                            }}
                            data-testid="button-sh-dedicated"
                            className={`px-4 py-2 text-sm font-medium transition-colors ${shHostingType === 'dedicated' ? 'bg-orange-500/30 text-orange-300' : 'bg-transparent text-white/50 hover:bg-white/5'}`}
                          >
                            Dedicated
                          </button>
                        </div>
                        {shHostingType === 'dedicated' && (
                          <span className="text-xs text-orange-400">+${shBillingCycle === 'annual' ? '480' : '600'}/mo base</span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Workers */}
                        <div className="space-y-2">
                          <label className="text-xs text-white/40 flex items-center gap-1">
                            <Cpu className="w-3 h-3" /> Workers
                          </label>
                          <input
                            type="number"
                            min={shLimits.workerMin}
                            max={shLimits.workerMax}
                            value={shWorkers}
                            onChange={(e) => setShWorkers(Math.min(Math.max(parseInt(e.target.value) || shLimits.workerMin, shLimits.workerMin), shLimits.workerMax))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500/50 outline-none"
                            data-testid="input-sh-workers"
                          />
                          <div className="text-xs text-white/30">{shLimits.workerMin}-{shLimits.workerMax} workers</div>
                        </div>
                        
                        {/* Storage */}
                        <div className="space-y-2">
                          <label className="text-xs text-white/40 flex items-center gap-1">
                            <HardDrive className="w-3 h-3" /> Storage (GB)
                          </label>
                          <input
                            type="number"
                            min={shLimits.storageMin}
                            max={shLimits.storageMax}
                            value={shStorage}
                            onChange={(e) => setShStorage(Math.min(Math.max(parseInt(e.target.value) || shLimits.storageMin, shLimits.storageMin), shLimits.storageMax))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500/50 outline-none"
                            data-testid="input-sh-storage"
                          />
                          <div className="text-xs text-white/30">{shLimits.storageMin}-{shLimits.storageMax} GB</div>
                        </div>
                        
                        {/* Staging Environments */}
                        <div className="space-y-2">
                          <label className="text-xs text-white/40 flex items-center gap-1">
                            <Layers className="w-3 h-3" /> Staging Env.
                          </label>
                          <input
                            type="number"
                            min={shLimits.stagingMin}
                            max={shLimits.stagingMax}
                            value={shStaging}
                            onChange={(e) => setShStaging(Math.min(Math.max(parseInt(e.target.value) || 0, shLimits.stagingMin), shLimits.stagingMax))}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-orange-500/50 outline-none"
                            data-testid="input-sh-staging"
                          />
                          <div className="text-xs text-white/30">0-{shLimits.stagingMax} environments</div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-white/50 pt-2 border-t border-white/5">
                        Odoo SH ({shBillingCycle === 'annual' ? 'Annual' : 'Monthly'} billing): <span className="text-orange-400 font-mono">{formatCurrency(calculateShMonthlyCost())}/mo</span>
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
            className="overflow-visible"
          >
            <div className="space-y-6">
                    <div className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2">Select Terms to Display</div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {Object.keys(selectedTerms).map((term) => (
                        <button
                          key={term}
                          onClick={() => setSelectedTerms(prev => ({...prev, [term]: !prev[term as TermKey]}))}
                          data-testid={`button-term-${term}`}
                          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                            selectedTerms[term as TermKey]
                              ? 'bg-white/10 border-white/30 text-white'
                              : 'bg-transparent border-white/5 text-white/30 hover:border-white/20'
                          }`}
                        >
                          {term === 'monthly' ? 'Monthly' : term.replace('year', ' Year')}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                      {activeTerms.map((term) => (
                        <div key={term} className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3">
                          <div className="text-sm font-medium text-white/80 capitalize">
                            {term === 'monthly' ? 'Monthly' : term.replace('year', ' Year')}
                          </div>
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-white/40 block mb-1">Plan % Off</label>
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
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-right pr-7 focus:border-primary/50 outline-none"
                                  data-testid={`input-plan-discount-${term}`}
                                />
                                <span className="absolute right-2 top-2 text-white/30 text-sm">%</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-xs text-white/40 block mb-1">Impl % Off</label>
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
                                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-right pr-7 focus:border-primary/50 outline-none"
                                  data-testid={`input-impl-discount-${term}`}
                                />
                                <span className="absolute right-2 top-2 text-white/30 text-sm">%</span>
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
            <h2 className="text-xl font-bold text-white/90">Quote Comparison</h2>
            <div className="text-sm text-white/40">{activeTerms.length} terms selected</div>
          </div>
          
          {activeTerms.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeTerms.map((term, index) => {
                const data = calculateTermQuote(term, termDiscounts[term].plan, termDiscounts[term].impl);
                return (
                  <motion.div
                    key={term}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <QuoteCard data={data} termKey={term} formatCurrency={formatCurrency} />
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-white/30 border-2 border-dashed border-white/10 rounded-3xl">
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

  return (
    <div className={`relative group h-full ${data.isBestValue ? 'ring-2 ring-primary/50 shadow-2xl shadow-primary/10' : ''} rounded-2xl`}>
      {data.isBestValue && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-20 flex items-center gap-1">
          <Zap className="w-3 h-3" /> BEST VALUE
        </div>
      )}
      
      <GlassCard className="h-full hover:bg-white/[0.07] transition-colors relative overflow-hidden group" data-testid={`card-quote-${termKey}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="flex flex-col h-full relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-display font-bold text-white">{data.termLabel}</h3>
              <p className="text-sm text-white/50">{isMonthly ? 'Pay as you go' : 'Upfront Commitment'}</p>
            </div>
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-white/80">Software</span>
              </div>
              <span className="text-sm font-mono text-white/80">{formatCurrency(data.totalSoftwareCost)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span className="text-sm text-white/80">Implementation</span>
              </div>
              <span className="text-sm font-mono text-white/80">{formatCurrency(data.implementationCost)}</span>
            </div>

            {data.shTotalCost > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-white/80">Odoo SH</span>
                </div>
                <span className="text-sm font-mono text-white/80">{formatCurrency(data.shTotalCost)}</span>
              </div>
            )}

            {!isMonthly && data.totalSavings > 0 && (
              <div className="flex justify-between items-center py-2 bg-green-500/10 rounded-lg px-3 border border-green-500/20">
                <span className="text-xs font-bold text-green-400 uppercase tracking-wide">Savings</span>
                <span className="text-sm font-mono font-bold text-green-400">-{formatCurrency(data.totalSavings)}</span>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/10">
            <div className="text-xs text-white/40 mb-1">Total Contract</div>
            <div className="text-2xl font-bold font-mono text-white mb-4">
              {formatCurrency(data.totalCost)}
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-white/40 mb-1">Amortized Monthly</p>
                <div className="text-xl font-bold font-display text-gradient">
                  {formatCurrency(data.amortizedMonthly)}
                  <span className="text-sm font-normal text-white/30 ml-1">/mo</span>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <CheckCircle2 className="w-4 h-4 text-white/20 group-hover:text-white" />
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
