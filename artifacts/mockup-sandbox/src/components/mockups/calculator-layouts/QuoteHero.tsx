import './_group.css';
import { useState } from 'react';

const ODOO_PRIMARY = '#714B67';
const ODOO_SECONDARY = '#017E84';

const PRICING = {
  standard: { monthly: { year1: 31.10, year2plus: 38.90 }, yearly: { year1: 24.90, year2plus: 31.10 } },
  custom: { monthly: { year1: 61.10, year2plus: 76.20 }, yearly: { year1: 49.00, year2plus: 61.00 } }
};

const IMPLEMENTATIONS: Record<string, { label: string; price: number }> = {
  none: { label: 'None', price: 0 },
  express: { label: 'Express (4h)', price: 580 },
  starter: { label: 'Starter (25h)', price: 3600 },
  basic: { label: 'Basic (50h)', price: 7000 },
  standard: { label: 'Standard (100h)', price: 12500 },
  custom: { label: 'Custom (200h)', price: 25000 },
};

const TERMS = [
  { key: 'monthly', label: 'Monthly', years: 0 },
  { key: '1year', label: '1 Year', years: 1 },
  { key: '2year', label: '2 Years', years: 2 },
  { key: '3year', label: '3 Years', years: 3 },
  { key: '5year', label: '5 Years', years: 5 },
];

const TIER1 = 15000, TIER2 = 25000;
const RF1: Record<string, { low: number; high: number }> = {
  '1year': { low: 0.090, high: 0.1023 }, '2year': { low: 0.0469, high: 0.0525 },
  '3year': { low: 0.0325, high: 0.0369 }, '5year': { low: 0.022, high: 0.0246 },
};
const RF2: Record<string, { low: number; high: number }> = {
  '1year': { low: 0.09259, high: 0.10185 }, '2year': { low: 0.0455, high: 0.05245 },
  '3year': { low: 0.03131, high: 0.03692 }, '5year': { low: 0.02022, high: 0.02461 },
};
const RF3: Record<string, { low: number; high: number }> = {
  '1year': { low: 0.088, high: 0.09975 }, '2year': { low: 0.0465, high: 0.0525 },
  '3year': { low: 0.03233, high: 0.03693 }, '5year': { low: 0.02083, high: 0.02462 },
};

function calcQuote(users: number, plan: 'standard' | 'custom', implKey: string, termKey: string, planDisc: number, implDisc: number) {
  const pricing = PRICING[plan];
  const implBase = IMPLEMENTATIONS[implKey]?.price || 0;
  const implCost = implBase * (1 - implDisc / 100);

  if (termKey === 'monthly') {
    const software = users * pricing.monthly.year1;
    const total = software + implCost;
    return { software, impl: implCost, total, monthly: total, savings: 0, financing: null };
  }

  const years = parseInt(termKey.replace('year', ''));
  const months = years * 12;
  const fullTermAtYear2 = users * pricing.yearly.year2plus * 12 * years;
  const discAmount = fullTermAtYear2 * (planDisc / 100);
  const year1Benefit = users * (pricing.yearly.year2plus - pricing.yearly.year1) * 12;
  const software = fullTermAtYear2 - discAmount - year1Benefit;
  const total = software + implCost;
  const monthly = total / months;
  const monthlyBaseline = pricing.monthly.year2plus * months * users;
  const savings = (monthlyBaseline - software) + (implBase * implDisc / 100);

  const rf = total >= TIER2 ? RF3 : total >= TIER1 ? RF2 : RF1;
  const f = rf[termKey];
  const financing = f ? { low: total * f.low, high: total * f.high } : null;

  return { software, impl: implCost, total, monthly, savings, financing };
}

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);
const fmtShort = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

export function QuoteHero() {
  const [users, setUsers] = useState(25);
  const [plan, setPlan] = useState<'standard' | 'custom'>('standard');
  const [impl, setImpl] = useState('starter');
  const [planDisc, setPlanDisc] = useState(0);
  const [implDisc, setImplDisc] = useState(0);
  const [activeTerm, setActiveTerm] = useState('3year');

  const q = calcQuote(users, plan, impl, activeTerm, planDisc, implDisc);
  const monthlyQ = calcQuote(users, plan, impl, 'monthly', planDisc, implDisc);

  const termData = TERMS.map(t => ({ ...t, quote: calcQuote(users, plan, impl, t.key, planDisc, implDisc) }));
  const bestTerm = termData.filter(t => t.key !== 'monthly').reduce((b, t) => (t.quote.savings > (b?.quote.savings || 0) ? t : b), termData[1]);
  const isMonthly = activeTerm === 'monthly';

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Compact config strip */}
      <div className="bg-white border-b border-gray-100 px-8 py-2.5 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: ODOO_PRIMARY }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: ODOO_PRIMARY }}>Odoo Estimator</span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-5 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">Users</span>
            <input type="number" min="1" max="500" value={users}
              onChange={e => setUsers(parseInt(e.target.value) || 1)}
              className="w-14 border border-gray-200 rounded px-2 py-1 text-xs text-center font-mono text-gray-800 focus:outline-none focus:border-[#714B67] bg-gray-50" />
          </div>
          <div className="flex rounded overflow-hidden border border-gray-200">
            {(['standard', 'custom'] as const).map(p => (
              <button key={p} onClick={() => setPlan(p)}
                className="px-3 py-1 text-xs font-medium transition-colors"
                style={plan === p ? { backgroundColor: ODOO_PRIMARY, color: 'white' } : { backgroundColor: 'white', color: '#9ca3af' }}>
                {p === 'standard' ? 'Standard' : 'Custom'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-xs">Impl</span>
            <select value={impl} onChange={e => setImpl(e.target.value)}
              className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none bg-gray-50">
              {Object.entries(IMPLEMENTATIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-xs">Plan%</span>
            <div className="relative">
              <input type="number" min="0" max="100" value={planDisc}
                onChange={e => setPlanDisc(parseFloat(e.target.value) || 0)}
                className="w-12 border border-gray-200 rounded px-1 py-1 text-xs text-right pr-4 focus:outline-none bg-gray-50 text-gray-800" />
              <span className="absolute right-1.5 top-1 text-gray-400 text-xs">%</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-400 text-xs">Impl%</span>
            <div className="relative">
              <input type="number" min="0" max="100" value={implDisc}
                onChange={e => setImplDisc(parseFloat(e.target.value) || 0)}
                className="w-12 border border-gray-200 rounded px-1 py-1 text-xs text-right pr-4 focus:outline-none bg-gray-50 text-gray-800" />
              <span className="absolute right-1.5 top-1 text-gray-400 text-xs">%</span>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-8 py-8">
        {/* Term selector tabs */}
        <div className="flex gap-2 mb-8">
          {TERMS.map(t => {
            const tq = termData.find(td => td.key === t.key)?.quote;
            const isBest = t.key === bestTerm.key;
            const isActive = t.key === activeTerm;
            return (
              <button key={t.key} onClick={() => setActiveTerm(t.key)}
                className="flex-1 py-3 px-3 rounded-xl border text-center transition-all relative"
                style={{
                  borderColor: isActive ? ODOO_PRIMARY : isBest ? `${ODOO_PRIMARY}60` : '#e5e7eb',
                  backgroundColor: isActive ? ODOO_PRIMARY : isBest ? `${ODOO_PRIMARY}08` : 'white',
                  color: isActive ? 'white' : isActive ? 'white' : '#374151'
                }}>
                <div className="text-sm font-semibold">{t.label}</div>
                {tq && tq.monthly > 0 && (
                  <div className="text-xs mt-0.5 font-mono opacity-80">{fmtShort(tq.monthly)}/mo</div>
                )}
                {isBest && !isActive && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: ODOO_PRIMARY, color: 'white' }}>
                    Best
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Hero quote panel */}
        <div className="rounded-2xl border-2 overflow-hidden mb-6"
          style={{ borderColor: ODOO_PRIMARY }}>

          {/* Hero top section */}
          <div className="px-8 py-7 flex items-center justify-between"
            style={{ background: `linear-gradient(135deg, ${ODOO_PRIMARY}12 0%, ${ODOO_SECONDARY}08 100%)` }}>
            <div>
              <p className="text-sm text-gray-500 mb-1">
                {isMonthly ? 'Monthly billing, cancel anytime' : `${TERMS.find(t => t.key === activeTerm)?.years}-year commitment, billed annually`}
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold font-mono" style={{ color: ODOO_PRIMARY }}>
                  {fmt(q.monthly)}
                </span>
                <span className="text-lg text-gray-400">/mo</span>
              </div>
              {!isMonthly && (
                <p className="text-sm text-gray-500 mt-1">
                  {fmt(q.total)} total contract
                </p>
              )}
            </div>

            {!isMonthly && q.savings > 0 && (
              <div className="text-right">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Saves vs monthly</div>
                <div className="text-3xl font-bold text-emerald-600">{fmt(q.savings)}</div>
                <div className="text-xs text-emerald-500 mt-0.5">over the full term</div>
              </div>
            )}
          </div>

          {/* Line item breakdown */}
          <div className="bg-white divide-y divide-gray-50">
            <div className="px-8 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ODOO_PRIMARY}15` }}>
                  <svg className="w-4 h-4" style={{ color: ODOO_PRIMARY }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Software License</div>
                  <div className="text-xs text-gray-400">{users} users · {plan === 'standard' ? 'Standard' : 'Custom'} plan</div>
                </div>
              </div>
              <span className="font-mono text-sm font-medium text-gray-800">{fmt(q.software)}</span>
            </div>
            {q.impl > 0 && (
              <div className="px-8 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${ODOO_SECONDARY}15` }}>
                    <svg className="w-4 h-4" style={{ color: ODOO_SECONDARY }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-700">Implementation</div>
                    <div className="text-xs text-gray-400">{IMPLEMENTATIONS[impl]?.label}</div>
                  </div>
                </div>
                <span className="font-mono text-sm font-medium text-gray-800">{fmt(q.impl)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Financing + comparison strip */}
        {!isMonthly && q.financing && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
              <div className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-1.5">Financing — Low Estimate</div>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {fmt(q.financing.low)}<span className="text-sm font-normal text-emerald-500">/mo</span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <div className="text-xs text-amber-600 font-semibold uppercase tracking-wide mb-1.5">Financing — High Estimate</div>
              <div className="text-2xl font-bold font-mono text-amber-700">
                {fmt(q.financing.high)}<span className="text-sm font-normal text-amber-500">/mo</span>
              </div>
            </div>
          </div>
        )}

        {/* vs Monthly comparison */}
        {!isMonthly && (
          <div className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">vs. paying monthly</div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-0.5">Monthly rate</div>
                <div className="font-mono text-sm text-gray-500 line-through">{fmt(monthlyQ.monthly)}/mo</div>
              </div>
              <div className="text-emerald-500 font-bold text-lg">→</div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-0.5">This deal</div>
                <div className="font-mono text-sm font-bold" style={{ color: ODOO_PRIMARY }}>{fmt(q.monthly)}/mo</div>
              </div>
              <div className="text-center bg-emerald-50 rounded-lg px-3 py-1.5">
                <div className="text-xs text-emerald-600 mb-0.5">You save</div>
                <div className="font-mono text-sm font-bold text-emerald-600">{fmt(q.savings)}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
