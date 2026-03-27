import './_group.css';
import { useState } from 'react';

// TRADEOFF: Sacrifices compactness for clear visual tiers.
// Primary info (monthly cost, total) is ~2x larger than secondary (line items).
// A thick ruled divider separates "what makes up the price" from "what you pay."
// The best-value column has a full-column accent, not just a small badge.

const P = '#714B67';
const S = '#017E84';

const PRICING = {
  standard: { monthly: { year1: 31.10, year2plus: 38.90 }, yearly: { year1: 24.90, year2plus: 31.10 } },
  custom: { monthly: { year1: 61.10, year2plus: 76.20 }, yearly: { year1: 49.00, year2plus: 61.00 } },
};
const IMPL: Record<string, { label: string; price: number }> = {
  none: { label: 'None', price: 0 }, express: { label: 'Express (4h)', price: 580 },
  starter: { label: 'Starter (25h)', price: 3600 }, basic: { label: 'Basic (50h)', price: 7000 },
  standard: { label: 'Standard (100h)', price: 12500 }, custom: { label: 'Custom (200h)', price: 25000 },
};
const TERMS = [
  { key: 'monthly', label: 'Monthly', years: 0 },
  { key: '1year', label: '1 Year', years: 1 },
  { key: '2year', label: '2 Years', years: 2 },
  { key: '3year', label: '3 Years', years: 3 },
  { key: '5year', label: '5 Years', years: 5 },
];
const RF: Record<string, Record<string, { low: number; high: number }>> = {
  t1: { '1year': { low: 0.090, high: 0.1023 }, '2year': { low: 0.0469, high: 0.0525 }, '3year': { low: 0.0325, high: 0.0369 }, '5year': { low: 0.022, high: 0.0246 } },
  t2: { '1year': { low: 0.09259, high: 0.10185 }, '2year': { low: 0.0455, high: 0.05245 }, '3year': { low: 0.03131, high: 0.03692 }, '5year': { low: 0.02022, high: 0.02461 } },
  t3: { '1year': { low: 0.088, high: 0.09975 }, '2year': { low: 0.0465, high: 0.0525 }, '3year': { low: 0.03233, high: 0.03693 }, '5year': { low: 0.02083, high: 0.02462 } },
};

function calc(users: number, plan: 'standard' | 'custom', implKey: string, term: string, pd: number, id: number) {
  const pr = PRICING[plan];
  const ib = IMPL[implKey]?.price || 0;
  const ic = ib * (1 - id / 100);
  if (term === 'monthly') { const sw = users * pr.monthly.year1; return { sw, ic, total: sw + ic, monthly: sw + ic, savings: 0, fin: null }; }
  const yrs = parseInt(term); const mos = yrs * 12;
  const full = users * pr.yearly.year2plus * 12 * yrs;
  const sw = full - full * (pd / 100) - users * (pr.yearly.year2plus - pr.yearly.year1) * 12;
  const total = sw + ic; const monthly = total / mos;
  const savings = (users * pr.monthly.year1 * 12 + users * pr.monthly.year2plus * (mos - 12) - sw) + ib * id / 100;
  const tier = total >= 25000 ? 't3' : total >= 15000 ? 't2' : 't1';
  const f = RF[tier][term];
  return { sw, ic, total, monthly, savings, fin: f ? { low: total * f.low, high: total * f.high } : null };
}

const $ = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

export function HierarchyFirst() {
  const [users, setUsers] = useState(25);
  const [plan, setPlan] = useState<'standard' | 'custom'>('standard');
  const [impl, setImpl] = useState('starter');
  const [pd, setPd] = useState(0);
  const [id, setId] = useState(0);
  const [active, setActive] = useState(new Set(['monthly', '1year', '2year', '3year', '5year']));

  const visible = TERMS.filter(t => active.has(t.key));
  const qs = Object.fromEntries(visible.map(t => [t.key, calc(users, plan, impl, t.key.replace('year', ''), pd, id)]));
  const best = visible.filter(t => t.key !== 'monthly').reduce<typeof TERMS[0] | null>((b, t) => (qs[t.key].savings > (b ? qs[b.key].savings : 0) ? t : b), null);

  return (
    <div className="min-h-screen bg-[#F5F4F6] flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header — compact, functional */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-5 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: P }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <span className="text-sm font-semibold" style={{ color: P }}>Odoo Estimator</span>
        </div>
        <div className="h-5 w-px bg-gray-200" />
        <div className="flex items-center gap-2"><label className="text-xs text-gray-500">Users</label>
          <input type="number" min="1" max="500" value={users} onChange={e => setUsers(+e.target.value || 1)}
            className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-center font-mono text-gray-800 focus:outline-none focus:border-[#714B67] bg-gray-50" /></div>
        <div className="flex rounded-lg overflow-hidden border border-gray-200">
          {(['standard', 'custom'] as const).map(p => (
            <button key={p} onClick={() => setPlan(p)} className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={plan === p ? { backgroundColor: P, color: 'white' } : { backgroundColor: 'white', color: '#6b7280' }}>
              {p === 'standard' ? 'Standard' : 'Custom'}</button>
          ))}
        </div>
        <div className="flex items-center gap-2"><label className="text-xs text-gray-500">Impl</label>
          <select value={impl} onChange={e => setImpl(e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 focus:outline-none bg-gray-50">
            {Object.entries(IMPL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
        {[['Plan %', pd, setPd], ['Impl %', id, setId]].map(([lbl, val, set]) => (
          <div key={lbl as string} className="flex items-center gap-2"><label className="text-xs text-gray-500">{lbl as string}</label>
            <div className="relative">
              <input type="number" min="0" max="100" value={val as number} onChange={e => (set as Function)(parseFloat(e.target.value) || 0)}
                className="w-14 border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-right pr-5 text-gray-800 focus:outline-none bg-gray-50" />
              <span className="absolute right-2 top-1.5 text-gray-400 text-xs">%</span></div></div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          {TERMS.map(t => (
            <button key={t.key} onClick={() => setActive(prev => { const n = new Set(prev); n.has(t.key) && n.size > 1 ? n.delete(t.key) : n.add(t.key); return n; })}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-colors border"
              style={active.has(t.key) ? { backgroundColor: `${P}15`, borderColor: P, color: P } : { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#9ca3af' }}>
              {t.label}</button>
          ))}
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {/* Label column header */}
                <th className="w-48 text-left px-5 py-4 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Cost Components</span>
                </th>
                {visible.map(t => {
                  const isBest = t.key === best?.key;
                  return (
                    <th key={t.key} className="px-4 py-0 text-center border-b border-gray-100 relative"
                      style={{ backgroundColor: isBest ? `${P}` : '#f9fafb' }}>
                      {/* Full-height accent for best column */}
                      <div className="py-4">
                        <div className={`text-sm font-bold ${isBest ? 'text-white' : 'text-gray-700'}`}>{t.label}</div>
                        {isBest && (
                          <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/80">★ Best Value</div>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* ── Tier 3: Secondary details (subdued) ── */}
              {[{ label: 'Software License', key: 'sw' }, { label: 'Implementation', key: 'ic' }].map((row, ri) => (
                <tr key={row.key} style={{ backgroundColor: ri % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td className="px-5 py-2.5 text-sm text-gray-400 border-b border-gray-50">{row.label}</td>
                  {visible.map(t => {
                    const val = qs[t.key][row.key as 'sw' | 'ic'] as number;
                    return (
                      <td key={t.key} className="px-4 py-2.5 text-center border-b border-gray-50 font-mono text-sm"
                        style={{ color: '#9ca3af', backgroundColor: t.key === best?.key ? `${P}05` : 'transparent' }}>
                        {val > 0 ? $(val) : <span className="text-gray-200">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* ── Visual divider — signals tier break ── */}
              <tr>
                <td colSpan={visible.length + 1} className="p-0">
                  <div className="h-[3px]" style={{ background: `linear-gradient(to right, ${P}40, ${P}10)` }} />
                </td>
              </tr>

              {/* ── Tier 1: Primary outcome — Total Contract ── */}
              <tr style={{ backgroundColor: `${P}06` }}>
                <td className="px-5 py-4 border-b border-gray-100">
                  <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: P }}>Total Contract</div>
                </td>
                {visible.map(t => (
                  <td key={t.key} className="px-4 py-4 text-center border-b border-gray-100"
                    style={{ backgroundColor: t.key === best?.key ? `${P}10` : 'transparent' }}>
                    <div className="font-mono font-bold text-xl" style={{ color: P }}>{$(qs[t.key].total)}</div>
                  </td>
                ))}
              </tr>

              {/* ── Tier 1: Primary outcome — Monthly cost ── */}
              <tr style={{ backgroundColor: `${P}04` }}>
                <td className="px-5 py-4 border-b border-gray-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Amortized Monthly</div>
                </td>
                {visible.map(t => (
                  <td key={t.key} className="px-4 py-4 text-center border-b border-gray-100"
                    style={{ backgroundColor: t.key === best?.key ? `${P}08` : 'transparent' }}>
                    <div className="font-mono font-bold text-2xl text-gray-900">{$(qs[t.key].monthly)}</div>
                    <div className="text-xs text-gray-400 mt-0.5">per month</div>
                  </td>
                ))}
              </tr>

              {/* ── Tier 2: Supporting signal — Savings ── */}
              <tr className="bg-emerald-50/60">
                <td className="px-5 py-3 border-b border-emerald-100">
                  <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Savings vs Monthly Billing</div>
                </td>
                {visible.map(t => {
                  const s = qs[t.key].savings;
                  return (
                    <td key={t.key} className="px-4 py-3 text-center border-b border-emerald-100"
                      style={{ backgroundColor: t.key === best?.key ? 'rgba(16,185,129,0.12)' : 'transparent' }}>
                      {s > 0
                        ? <div><span className="text-base font-bold font-mono text-emerald-700">−{$(s)}</span></div>
                        : <span className="text-sm text-gray-300">—</span>}
                    </td>
                  );
                })}
              </tr>

              {/* ── Tier 2: Financing ── */}
              <tr className="bg-gray-50">
                <td className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Financing Range</td>
                {visible.map(t => <td key={t.key} className="border-b border-gray-100 bg-gray-50" />)}
              </tr>
              {(['low', 'high'] as const).map(est => (
                <tr key={est}>
                  <td className="px-5 py-2.5 text-sm border-b border-gray-50" style={{ color: est === 'low' ? '#059669' : '#d97706' }}>
                    {est === 'low' ? 'Low Estimate' : 'High Estimate'}
                  </td>
                  {visible.map(t => {
                    const f = qs[t.key].fin;
                    return (
                      <td key={t.key} className="px-4 py-2.5 text-center border-b border-gray-50 font-mono text-sm"
                        style={{ color: est === 'low' ? '#059669' : '#d97706', backgroundColor: t.key === best?.key ? `${P}04` : 'transparent' }}>
                        {f ? <>{$(f[est])}<span className="text-xs opacity-60">/mo</span></> : <span className="text-gray-200">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
