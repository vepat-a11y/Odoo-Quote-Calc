import './_group.css';
import { useState } from 'react';

// TRADEOFF: Sacrifices density for clarity of interaction.
// Every control explicitly looks like a control. Inputs have visible fields with
// labels above them (not inline). Term toggles have checkmark icons.
// Column headers pulse on hover to invite exploration.
// The toolbar is taller and more structured — you know exactly what you can change.

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
  const pr = PRICING[plan]; const ib = IMPL[implKey]?.price || 0; const ic = ib * (1 - id / 100);
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

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      {children}
    </div>
  );
}

export function AffordanceFirst() {
  const [users, setUsers] = useState(25);
  const [plan, setPlan] = useState<'standard' | 'custom'>('standard');
  const [impl, setImpl] = useState('starter');
  const [pd, setPd] = useState(0);
  const [id, setId] = useState(0);
  const [active, setActive] = useState(new Set(['monthly', '1year', '2year', '3year', '5year']));
  const [hovered, setHovered] = useState<string | null>(null);

  const visible = TERMS.filter(t => active.has(t.key));
  const qs = Object.fromEntries(visible.map(t => [t.key, calc(users, plan, impl, t.key.replace('year', ''), pd, id)]));
  const best = visible.filter(t => t.key !== 'monthly').reduce<typeof TERMS[0] | null>((b, t) => (qs[t.key].savings > (b ? qs[b.key].savings : 0) ? t : b), null);

  const rows = [
    { label: 'Software License', key: 'sw' },
    { label: 'Implementation', key: 'ic' },
    { label: 'Total Contract', key: 'total', bold: true, accent: true },
    { label: 'Amortized / mo', key: 'monthly', bold: true },
    { label: 'Savings vs Monthly', key: 'savings', isGreen: true },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Structured control panel — two rows, clearly labeled sections */}
      <header className="bg-white border-b-2 border-gray-100 px-6 pt-4 pb-3 sticky top-0 z-10 shadow-sm">
        {/* Row 1: Identity + quote parameters */}
        <div className="flex items-end gap-6 mb-3">
          <div className="flex items-center gap-2 pb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: P }}>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <div className="text-sm font-bold" style={{ color: P }}>Odoo Estimator</div>
              <div className="text-[10px] text-gray-400">Enterprise Pricing</div>
            </div>
          </div>
          <div className="h-10 w-px bg-gray-100" />

          <FieldGroup label="Users">
            <div className="flex items-center gap-2">
              <button onClick={() => setUsers(u => Math.max(1, u - 1))}
                className="w-7 h-9 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 font-bold text-base hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center cursor-pointer">−</button>
              <input type="number" min="1" max="500" value={users} onChange={e => setUsers(+e.target.value || 1)}
                className="w-14 h-9 border border-gray-300 bg-white text-sm text-center font-mono font-semibold text-gray-800 focus:outline-none focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/20" />
              <button onClick={() => setUsers(u => Math.min(500, u + 1))}
                className="w-7 h-9 rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 text-gray-500 font-bold text-base hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center cursor-pointer">+</button>
            </div>
          </FieldGroup>

          <FieldGroup label="Odoo Plan">
            <div className="flex h-9 rounded-lg overflow-hidden border-2 border-gray-200">
              {(['standard', 'custom'] as const).map(p => (
                <button key={p} onClick={() => setPlan(p)}
                  className="px-4 text-sm font-semibold transition-all cursor-pointer"
                  style={plan === p ? { backgroundColor: P, color: 'white' } : { backgroundColor: 'white', color: '#6b7280' }}>
                  {p === 'standard' ? 'Standard' : 'Custom'}
                </button>
              ))}
            </div>
          </FieldGroup>

          <FieldGroup label="Implementation">
            <div className="relative h-9">
              <select value={impl} onChange={e => setImpl(e.target.value)}
                className="h-9 border-2 border-gray-200 rounded-lg pl-3 pr-8 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/20 appearance-none cursor-pointer">
                {Object.entries(IMPL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
              <svg className="absolute right-2 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </FieldGroup>

          {[['Plan Discount', pd, setPd], ['Impl Discount', id, setId]].map(([lbl, val, set]) => (
            <FieldGroup key={lbl as string} label={lbl as string}>
              <div className="relative h-9">
                <input type="number" min="0" max="100" value={val as number}
                  onChange={e => (set as Function)(parseFloat(e.target.value) || 0)}
                  className="h-9 w-20 border-2 border-gray-200 rounded-lg px-3 pr-7 text-sm text-right font-mono text-gray-800 bg-white focus:outline-none focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/20" />
                <span className="absolute right-3 top-2 text-gray-400 text-sm font-medium">%</span>
              </div>
            </FieldGroup>
          ))}
        </div>

        {/* Row 2: Term toggles — explicitly labeled, checkmark on active */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-1">Show Terms:</span>
          {TERMS.map(t => {
            const on = active.has(t.key);
            return (
              <button key={t.key}
                onClick={() => setActive(prev => { const n = new Set(prev); n.has(t.key) && n.size > 1 ? n.delete(t.key) : n.add(t.key); return n; })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all cursor-pointer"
                style={on ? { backgroundColor: `${P}12`, borderColor: P, color: P } : { backgroundColor: 'white', borderColor: '#e5e7eb', color: '#9ca3af' }}>
                <span className="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all"
                  style={on ? { backgroundColor: P, borderColor: P } : { borderColor: '#d1d5db' }}>
                  {on && <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Table */}
      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-48 text-left px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Line Item</span>
                </th>
                {visible.map(t => {
                  const isBest = t.key === best?.key;
                  const isHov = hovered === t.key;
                  return (
                    <th key={t.key}
                      onMouseEnter={() => setHovered(t.key)}
                      onMouseLeave={() => setHovered(null)}
                      className="px-4 py-3.5 text-center border-b border-gray-100 transition-all select-none"
                      style={{ backgroundColor: isHov ? `${P}10` : isBest ? `${P}06` : '#f9fafb', cursor: 'default' }}>
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold text-gray-700">{t.label}</span>
                        {isBest
                          ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: P, color: 'white' }}>★ Best Value</span>
                          : <span className="text-[10px] text-gray-300 select-none">·</span>}
                        {isHov && !isBest && <span className="text-[10px] text-gray-400">↕ hover to compare</span>}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={row.key} style={{ backgroundColor: row.accent ? `${P}05` : ri % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td className="px-5 py-3.5 text-sm border-b border-gray-50"
                    style={{ color: row.accent ? P : '#6b7280', fontWeight: row.bold ? 600 : 400 }}>
                    {row.label}
                  </td>
                  {visible.map(t => {
                    const val = qs[t.key][row.key as keyof ReturnType<typeof calc>] as number;
                    const isHov = hovered === t.key;
                    const isBest = t.key === best?.key;
                    return (
                      <td key={t.key}
                        onMouseEnter={() => setHovered(t.key)}
                        onMouseLeave={() => setHovered(null)}
                        className="px-4 py-3.5 text-center border-b border-gray-50 font-mono text-sm transition-all"
                        style={{
                          backgroundColor: isHov ? `${P}08` : isBest ? `${P}04` : 'transparent',
                          color: row.isGreen && val > 0 ? '#059669' : row.accent ? P : '#1f2937',
                          fontWeight: row.bold ? 700 : 400,
                          cursor: 'default'
                        }}>
                        {row.key === 'monthly'
                          ? <>{$(val)}<span className="text-gray-400 font-normal text-xs">/mo</span></>
                          : row.isGreen
                          ? val > 0 ? `−${$(val)}` : '—'
                          : val > 0 ? $(val) : '—'}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Financing */}
              <tr className="bg-gray-50">
                <td className="px-5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Financing Estimates</td>
                {visible.map(t => <td key={t.key} className="bg-gray-50" />)}
              </tr>
              {(['low', 'high'] as const).map(est => (
                <tr key={est} style={{ backgroundColor: est === 'low' ? 'rgba(236,253,245,0.5)' : 'rgba(255,251,235,0.5)' }}>
                  <td className="px-5 py-3 text-sm border-b border-gray-50 font-medium"
                    style={{ color: est === 'low' ? '#059669' : '#d97706' }}>
                    {est === 'low' ? '● Low Estimate' : '● High Estimate'}
                  </td>
                  {visible.map(t => {
                    const f = qs[t.key].fin;
                    const isHov = hovered === t.key;
                    const isBest = t.key === best?.key;
                    return (
                      <td key={t.key}
                        onMouseEnter={() => setHovered(t.key)}
                        onMouseLeave={() => setHovered(null)}
                        className="px-4 py-3 text-center border-b border-gray-50 font-mono text-sm transition-all"
                        style={{
                          backgroundColor: isHov ? `${P}06` : isBest ? `${P}03` : 'transparent',
                          color: est === 'low' ? '#059669' : '#d97706'
                        }}>
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
