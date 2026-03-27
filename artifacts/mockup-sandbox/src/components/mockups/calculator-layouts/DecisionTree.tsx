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
  { key: 'monthly', label: 'Monthly', years: 0, short: 'Mo' },
  { key: '1year', label: '1 Year', years: 1, short: '1Y' },
  { key: '2year', label: '2 Years', years: 2, short: '2Y' },
  { key: '3year', label: '3 Years', years: 3, short: '3Y' },
  { key: '5year', label: '5 Years', years: 5, short: '5Y' },
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
  const monthlyBaseline = users * pricing.monthly.year1 * 12 + users * pricing.monthly.year2plus * (months - 12);
  const savings = (monthlyBaseline - software) + (implBase * implDisc / 100);
  const rf = total >= TIER2 ? RF3 : total >= TIER1 ? RF2 : RF1;
  const f = rf[termKey];
  const financing = f ? { low: total * f.low, high: total * f.high } : null;
  return { software, impl: implCost, total, monthly, savings, financing };
}

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

function Delta({ a, b, label }: { a: number; b: number; label: string }) {
  const diff = b - a;
  const pct = a !== 0 ? ((b - a) / Math.abs(a)) * 100 : 0;
  const positive = diff > 0;
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-semibold ${positive ? 'text-red-500' : 'text-emerald-500'}`}>
          {positive ? '+' : ''}{fmt(diff)}
        </span>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${positive ? 'bg-red-50 text-red-400' : 'bg-emerald-50 text-emerald-500'}`}>
          {positive ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

export function DecisionTree() {
  const [users, setUsers] = useState(25);
  const [plan, setPlan] = useState<'standard' | 'custom'>('standard');
  const [impl, setImpl] = useState('starter');
  const [planDisc, setPlanDisc] = useState(0);
  const [implDisc, setImplDisc] = useState(0);
  const [leftTerm, setLeftTerm] = useState('1year');
  const [rightTerm, setRightTerm] = useState('3year');

  const leftQ = calcQuote(users, plan, impl, leftTerm, planDisc, implDisc);
  const rightQ = calcQuote(users, plan, impl, rightTerm, planDisc, implDisc);
  const allQuotes = TERMS.map(t => ({ ...t, q: calcQuote(users, plan, impl, t.key, planDisc, implDisc) }));

  // Sensitivity: how does changing users by +5 affect the delta?
  const leftQ5 = calcQuote(users + 5, plan, impl, leftTerm, planDisc, implDisc);
  const rightQ5 = calcQuote(users + 5, plan, impl, rightTerm, planDisc, implDisc);
  const savingsGainPer5Users = (rightQ5.savings - rightQ.savings) - (leftQ5.savings - leftQ.savings);

  const rightIsBetter = rightQ.total < leftQ.total;
  const totalDiff = Math.abs(rightQ.total - leftQ.total);

  return (
    <div className="min-h-screen bg-[#FAFAFA]" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Config bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-2.5 flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: ODOO_PRIMARY }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: ODOO_PRIMARY }}>Odoo Estimator</span>
        </div>
        <div className="h-4 w-px bg-gray-200" />
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">Users</span>
          <input type="number" min="1" max="500" value={users}
            onChange={e => setUsers(parseInt(e.target.value) || 1)}
            className="w-14 border border-gray-200 rounded px-2 py-1 text-xs text-center font-mono text-gray-800 focus:outline-none bg-gray-50" />
        </div>
        <div className="flex rounded overflow-hidden border border-gray-200">
          {(['standard', 'custom'] as const).map(p => (
            <button key={p} onClick={() => setPlan(p)}
              className="px-3 py-1 text-xs font-medium transition-colors"
              style={plan === p ? { backgroundColor: ODOO_PRIMARY, color: 'white' } : { backgroundColor: 'white', color: '#9ca3af' }}>
              {p === 'standard' ? 'Std' : 'Custom'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">Impl</span>
          <select value={impl} onChange={e => setImpl(e.target.value)}
            className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 focus:outline-none bg-gray-50">
            {Object.entries(IMPLEMENTATIONS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">Plan%</span>
          <div className="relative">
            <input type="number" min="0" max="100" value={planDisc}
              onChange={e => setPlanDisc(parseFloat(e.target.value) || 0)}
              className="w-12 border border-gray-200 rounded px-1 py-1 text-xs text-right pr-4 focus:outline-none bg-gray-50 text-gray-800" />
            <span className="absolute right-1.5 top-1 text-gray-400 text-xs">%</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400">Impl%</span>
          <div className="relative">
            <input type="number" min="0" max="100" value={implDisc}
              onChange={e => setImplDisc(parseFloat(e.target.value) || 0)}
              className="w-12 border border-gray-200 rounded px-1 py-1 text-xs text-right pr-4 focus:outline-none bg-gray-50 text-gray-800" />
            <span className="absolute right-1.5 top-1 text-gray-400 text-xs">%</span>
          </div>
        </div>
      </div>

      <main className="px-6 py-6">
        {/* Mini sparkline of all terms */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
          <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">All Terms — Monthly Cost</div>
          <div className="flex items-end gap-3 h-20">
            {allQuotes.map(t => {
              const maxMonthly = Math.max(...allQuotes.map(q => q.q.monthly));
              const h = Math.max(16, (t.q.monthly / maxMonthly) * 72);
              const isLeft = t.key === leftTerm;
              const isRight = t.key === rightTerm;
              return (
                <div key={t.key} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] font-mono text-gray-400">{fmt(t.q.monthly).replace('$', '')}</div>
                  <div className="w-full rounded-t-md cursor-pointer transition-all relative"
                    style={{
                      height: h,
                      backgroundColor: isLeft ? ODOO_SECONDARY : isRight ? ODOO_PRIMARY : '#e5e7eb',
                      outline: (isLeft || isRight) ? `2px solid ${isLeft ? ODOO_SECONDARY : ODOO_PRIMARY}` : 'none'
                    }}
                    onClick={() => {
                      if (isLeft) setLeftTerm(t.key);
                      else if (isRight) setRightTerm(t.key);
                    }}>
                    {(isLeft || isRight) && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1 py-0.5 rounded"
                        style={{ backgroundColor: isLeft ? ODOO_SECONDARY : ODOO_PRIMARY, color: 'white' }}>
                        {isLeft ? 'A' : 'B'}
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] font-medium text-center" style={{ color: isLeft ? ODOO_SECONDARY : isRight ? ODOO_PRIMARY : '#9ca3af' }}>{t.short}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main comparison */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-5">
          {/* Left term */}
          {[{ term: leftTerm, setTerm: setLeftTerm, q: leftQ, label: 'A', color: ODOO_SECONDARY },
            { term: rightTerm, setTerm: setRightTerm, q: rightQ, label: 'B', color: ODOO_PRIMARY }].map(({ term, setTerm, q, label, color }, idx) => (
            <div key={label} className="bg-white rounded-2xl border overflow-hidden"
              style={{ borderColor: color + '40' }}>
              <div className="px-5 py-3 flex items-center justify-between border-b"
                style={{ borderColor: color + '20', backgroundColor: color + '08' }}>
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: color }}>{label}</span>
                  <select value={term} onChange={e => setTerm(e.target.value)}
                    className="text-sm font-semibold bg-transparent focus:outline-none cursor-pointer border-0"
                    style={{ color }}>
                    {TERMS.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
                  </select>
                </div>
                {q.savings > 0 && (
                  <span className="text-xs text-emerald-600 font-semibold">saves {fmt(q.savings)}</span>
                )}
              </div>

              <div className="px-5 py-4">
                <div className="text-3xl font-bold font-mono mb-0.5" style={{ color }}>
                  {fmt(q.monthly)}
                </div>
                <div className="text-xs text-gray-400 mb-4">/ month amortized</div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">Software</span>
                    <span className="font-mono text-gray-800">{fmt(q.software)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">Implementation</span>
                    <span className="font-mono text-gray-800">{fmt(q.impl)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-semibold" style={{ color }}>Total</span>
                    <span className="font-mono font-bold" style={{ color }}>{fmt(q.total)}</span>
                  </div>
                </div>

                {q.financing && (
                  <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-2">
                    <div className="bg-emerald-50 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-emerald-500 font-medium mb-0.5">Low Est.</div>
                      <div className="text-xs font-bold font-mono text-emerald-700">{fmt(q.financing.low)}/mo</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-2 text-center">
                      <div className="text-[10px] text-amber-500 font-medium mb-0.5">High Est.</div>
                      <div className="text-xs font-bold font-mono text-amber-700">{fmt(q.financing.high)}/mo</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Center delta column */}
          <div className="flex flex-col items-center justify-center w-36 gap-3">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">vs.</div>

            <div className="w-full rounded-xl p-3 text-center border"
              style={{
                borderColor: rightIsBetter ? `${ODOO_PRIMARY}40` : `${ODOO_SECONDARY}40`,
                backgroundColor: rightIsBetter ? `${ODOO_PRIMARY}08` : `${ODOO_SECONDARY}08`
              }}>
              <div className="text-[10px] text-gray-400 mb-1">
                {rightIsBetter ? 'B saves' : 'A saves'}
              </div>
              <div className="text-lg font-bold font-mono"
                style={{ color: rightIsBetter ? ODOO_PRIMARY : ODOO_SECONDARY }}>
                {fmt(totalDiff)}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">total</div>
            </div>

            <div className="w-full space-y-1 bg-white rounded-xl border border-gray-100 p-3">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">Deltas</div>
              <Delta a={leftQ.software} b={rightQ.software} label="Software" />
              <Delta a={leftQ.total} b={rightQ.total} label="Total" />
              <Delta a={leftQ.monthly} b={rightQ.monthly} label="Monthly" />
            </div>
          </div>
        </div>

        {/* Sensitivity strip */}
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3">Sensitivity — what changes if you add 5 users?</div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">{TERMS.find(t => t.key === leftTerm)?.label} total</div>
              <div className="font-mono text-sm font-bold" style={{ color: ODOO_SECONDARY }}>
                +{fmt(leftQ5.total - leftQ.total)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">{TERMS.find(t => t.key === rightTerm)?.label} total</div>
              <div className="font-mono text-sm font-bold" style={{ color: ODOO_PRIMARY }}>
                +{fmt(rightQ5.total - rightQ.total)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Savings gap shift</div>
              <div className={`font-mono text-sm font-bold ${savingsGainPer5Users >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {savingsGainPer5Users >= 0 ? '+' : ''}{fmt(savingsGainPer5Users)}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
