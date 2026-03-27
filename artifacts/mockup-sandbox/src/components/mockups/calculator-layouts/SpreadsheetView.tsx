import './_group.css';
import { useState } from 'react';

const ODOO_PRIMARY = '#714B67';
const ODOO_SECONDARY = '#017E84';

const PRICING = {
  US: {
    standard: { monthly: { year1: 31.10, year2plus: 38.90 }, yearly: { year1: 24.90, year2plus: 31.10 } },
    custom: { monthly: { year1: 61.10, year2plus: 76.20 }, yearly: { year1: 49.00, year2plus: 61.00 } }
  }
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
  { key: 'monthly', label: 'Monthly' },
  { key: '1year', label: '1 Year', years: 1 },
  { key: '2year', label: '2 Years', years: 2 },
  { key: '3year', label: '3 Years', years: 3 },
  { key: '5year', label: '5 Years', years: 5 },
];

const TIER1_THRESHOLD = 15000;
const TIER2_THRESHOLD = 25000;

const RATE_FACTORS_TIER1: Record<string, { low: number; high: number }> = {
  '1year': { low: 0.09000, high: 0.10230 },
  '2year': { low: 0.04690, high: 0.05250 },
  '3year': { low: 0.03250, high: 0.03690 },
  '5year': { low: 0.02200, high: 0.02460 },
};
const RATE_FACTORS_TIER2: Record<string, { low: number; high: number }> = {
  '1year': { low: 0.09259, high: 0.10185 },
  '2year': { low: 0.04550, high: 0.05245 },
  '3year': { low: 0.03131, high: 0.03692 },
  '5year': { low: 0.02022, high: 0.02461 },
};
const RATE_FACTORS_TIER3: Record<string, { low: number; high: number }> = {
  '1year': { low: 0.08800, high: 0.09975 },
  '2year': { low: 0.04650, high: 0.05250 },
  '3year': { low: 0.03233, high: 0.03693 },
  '5year': { low: 0.02083, high: 0.02462 },
};

function getFinancing(total: number, termKey: string) {
  if (termKey === 'monthly') return null;
  const factors = total >= TIER2_THRESHOLD ? RATE_FACTORS_TIER3 : total >= TIER1_THRESHOLD ? RATE_FACTORS_TIER2 : RATE_FACTORS_TIER1;
  const f = factors[termKey];
  if (!f) return null;
  return { low: total * f.low, high: total * f.high };
}

function calcQuote(users: number, plan: 'standard' | 'custom', implKey: string, termKey: string, planDisc: number, implDisc: number) {
  const pricing = PRICING.US[plan];
  const implPrice = (IMPLEMENTATIONS[implKey]?.price || 0) * (1 - implDisc / 100);
  const implBase = IMPLEMENTATIONS[implKey]?.price || 0;

  if (termKey === 'monthly') {
    const software = users * pricing.monthly.year1;
    const total = software + implPrice;
    return { software, impl: implPrice, sh: 0, total, monthly: total, savings: 0, financing: null };
  }

  const years = parseInt(termKey.replace('year', ''));
  const months = years * 12;
  const fullTermAtYear2 = users * pricing.yearly.year2plus * 12 * years;
  const discAmount = fullTermAtYear2 * (planDisc / 100);
  const year1Benefit = users * (pricing.yearly.year2plus - pricing.yearly.year1) * 12;
  const software = fullTermAtYear2 - discAmount - year1Benefit;
  const total = software + implPrice;
  const monthly = total / months;
  const monthlyBaseline = users * pricing.monthly.year1 * 12 + users * pricing.monthly.year2plus * (months - 12);
  const savings = (monthlyBaseline - software) + (implBase * implDisc / 100);
  const financing = getFinancing(total, termKey);

  return { software, impl: implPrice, sh: 0, total, monthly, savings, financing };
}

const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

export function SpreadsheetView() {
  const [users, setUsers] = useState(25);
  const [plan, setPlan] = useState<'standard' | 'custom'>('standard');
  const [impl, setImpl] = useState('starter');
  const [planDisc, setPlanDisc] = useState(0);
  const [implDisc, setImplDisc] = useState(0);
  const [activeTerms, setActiveTerms] = useState(new Set(['monthly', '1year', '2year', '3year', '5year']));
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  const visibleTerms = TERMS.filter(t => activeTerms.has(t.key));
  const quotes = Object.fromEntries(visibleTerms.map(t => [t.key, calcQuote(users, plan, impl, t.key, planDisc, implDisc)]));

  const bestTerm = visibleTerms.filter(t => t.key !== 'monthly').reduce((best, t) => {
    if (!best) return t;
    return (quotes[t.key]?.savings || 0) > (quotes[best.key]?.savings || 0) ? t : best;
  }, null as typeof TERMS[0] | null);

  const toggleTerm = (key: string) => {
    setActiveTerms(prev => {
      const next = new Set(prev);
      if (next.has(key) && next.size > 1) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const rows = [
    { label: 'Software License', key: 'software', color: 'text-gray-800' },
    { label: 'Implementation', key: 'impl', color: 'text-gray-800' },
    { label: 'Total Contract', key: 'total', color: `text-[${ODOO_PRIMARY}]`, bold: true, highlight: true },
    { label: 'Amortized / mo', key: 'monthly', color: 'text-gray-800', mono: true },
    { label: 'Est. Savings vs Monthly', key: 'savings', color: 'text-emerald-600', bold: true, prefix: '-' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Slim Config Toolbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-6 flex-wrap sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: ODOO_PRIMARY }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <span className="font-semibold text-sm" style={{ color: ODOO_PRIMARY }}>Odoo Estimator</span>
        </div>

        <div className="h-5 w-px bg-gray-200" />

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium whitespace-nowrap">Users</label>
          <input
            type="number" min="1" max="500" value={users}
            onChange={e => setUsers(parseInt(e.target.value) || 1)}
            className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center font-mono text-gray-800 focus:outline-none focus:border-[#714B67] bg-gray-50"
          />
        </div>

        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          {(['standard', 'custom'] as const).map(p => (
            <button key={p} onClick={() => setPlan(p)}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={plan === p ? { backgroundColor: ODOO_PRIMARY, color: 'white' } : { backgroundColor: 'white', color: '#6b7280' }}>
              {p === 'standard' ? 'Standard' : 'Custom'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500 font-medium">Impl</label>
          <select value={impl} onChange={e => setImpl(e.target.value)}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-[#714B67] bg-gray-50">
            {Object.entries(IMPLEMENTATIONS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Plan %</label>
          <div className="relative">
            <input type="number" min="0" max="100" value={planDisc}
              onChange={e => setPlanDisc(parseFloat(e.target.value) || 0)}
              className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right pr-5 text-gray-800 focus:outline-none focus:border-[#714B67] bg-gray-50" />
            <span className="absolute right-2 top-1.5 text-gray-400 text-xs">%</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Impl %</label>
          <div className="relative">
            <input type="number" min="0" max="100" value={implDisc}
              onChange={e => setImplDisc(parseFloat(e.target.value) || 0)}
              className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right pr-5 text-gray-800 focus:outline-none focus:border-[#714B67] bg-gray-50" />
            <span className="absolute right-2 top-1.5 text-gray-400 text-xs">%</span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {TERMS.map(t => (
            <button key={t.key} onClick={() => toggleTerm(t.key)}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors border"
              style={activeTerms.has(t.key)
                ? { backgroundColor: `${ODOO_PRIMARY}15`, borderColor: ODOO_PRIMARY, color: ODOO_PRIMARY }
                : { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#9ca3af' }}>
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main: Spreadsheet Matrix */}
      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-44 text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 bg-gray-50">
                  Line Item
                </th>
                {visibleTerms.map(t => (
                  <th key={t.key}
                    onMouseEnter={() => setHoveredCol(t.key)}
                    onMouseLeave={() => setHoveredCol(null)}
                    className="px-4 py-3 text-center border-b border-gray-100 transition-colors cursor-default"
                    style={{ backgroundColor: hoveredCol === t.key ? `${ODOO_PRIMARY}08` : t.key === bestTerm?.key ? `${ODOO_PRIMARY}05` : '#f9fafb' }}>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-semibold text-gray-700">{t.label}</span>
                      {t.key === bestTerm?.key && (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${ODOO_PRIMARY}20`, color: ODOO_PRIMARY }}>
                          Best Value
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={row.key}
                  className="transition-colors"
                  style={{ backgroundColor: row.highlight ? `${ODOO_PRIMARY}05` : ri % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td className="px-5 py-3.5 text-sm border-b border-gray-50"
                    style={{ color: row.highlight ? ODOO_PRIMARY : '#6b7280', fontWeight: row.bold ? 600 : 400 }}>
                    {row.label}
                  </td>
                  {visibleTerms.map(t => {
                    const q = quotes[t.key];
                    const val = q?.[row.key as keyof typeof q] as number;
                    const isBest = t.key === bestTerm?.key;
                    const isHovered = t.key === hoveredCol;
                    return (
                      <td key={t.key}
                        onMouseEnter={() => setHoveredCol(t.key)}
                        onMouseLeave={() => setHoveredCol(null)}
                        className="px-4 py-3.5 text-center border-b border-gray-50 font-mono text-sm transition-colors"
                        style={{
                          backgroundColor: isHovered ? `${ODOO_PRIMARY}08` : isBest ? `${ODOO_PRIMARY}05` : 'transparent',
                          color: row.key === 'savings' && val > 0 ? '#059669' : row.highlight ? ODOO_PRIMARY : '#1f2937',
                          fontWeight: row.bold ? 700 : 400
                        }}>
                        {row.key === 'savings'
                          ? val > 0 ? `−${fmt(val)}` : '—'
                          : val > 0 ? (row.key === 'monthly' ? <>{fmt(val)}<span className="text-gray-400 font-normal text-xs">/mo</span></> : fmt(val)) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Financing rows */}
              <tr>
                <td className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 border-b border-gray-50 bg-gray-50">
                  Financing Est.
                </td>
                {visibleTerms.map(t => (
                  <td key={t.key} className="px-4 py-2 border-b border-gray-50 bg-gray-50"
                    onMouseEnter={() => setHoveredCol(t.key)}
                    onMouseLeave={() => setHoveredCol(null)} />
                ))}
              </tr>
              {['low', 'high'].map(est => (
                <tr key={est}>
                  <td className="px-5 py-3 text-sm border-b border-gray-50"
                    style={{ color: est === 'low' ? '#059669' : '#d97706', fontWeight: 500 }}>
                    {est === 'low' ? 'Low Estimate' : 'High Estimate'}
                  </td>
                  {visibleTerms.map(t => {
                    const q = quotes[t.key];
                    const f = q?.financing as { low: number; high: number } | null;
                    const val = f ? f[est as 'low' | 'high'] : null;
                    return (
                      <td key={t.key}
                        onMouseEnter={() => setHoveredCol(t.key)}
                        onMouseLeave={() => setHoveredCol(null)}
                        className="px-4 py-3 text-center border-b border-gray-50 font-mono text-sm transition-colors"
                        style={{
                          backgroundColor: hoveredCol === t.key ? `${ODOO_PRIMARY}08` : t.key === bestTerm?.key ? `${ODOO_PRIMARY}05` : 'transparent',
                          color: est === 'low' ? '#059669' : '#d97706'
                        }}>
                        {val ? <>{fmt(val)}<span className="text-xs font-normal opacity-70">/mo</span></> : <span className="text-gray-300">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary strip */}
        <div className="mt-4 flex gap-4">
          {visibleTerms.filter(t => t.key !== 'monthly').map(t => {
            const q = quotes[t.key];
            const isBest = t.key === bestTerm?.key;
            return (
              <div key={t.key} className="flex-1 rounded-xl p-3 border transition-all"
                style={{
                  borderColor: isBest ? ODOO_PRIMARY : '#e5e7eb',
                  backgroundColor: isBest ? `${ODOO_PRIMARY}08` : 'white'
                }}>
                <div className="text-xs text-gray-500 mb-1">{t.label}</div>
                <div className="text-base font-bold font-mono" style={{ color: ODOO_PRIMARY }}>
                  {fmt(q?.monthly || 0)}<span className="text-xs font-normal text-gray-400">/mo</span>
                </div>
                {(q?.savings || 0) > 0 && (
                  <div className="text-xs text-emerald-600 font-medium mt-0.5">saves {fmt(q?.savings || 0)}</div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
