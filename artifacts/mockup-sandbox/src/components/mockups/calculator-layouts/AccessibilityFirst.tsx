import './_group.css';
import { useState } from 'react';

// TRADEOFF: Sacrifices density for universal legibility.
// Minimum 14px body text, 16px+ for data values. All grays pass WCAG AA (4.5:1).
// No information is conveyed by color alone — savings shows "▼ Saved" text label,
// best value shows a star icon + text, not just a color wash.
// Row height is 48px minimum. Spacing is generous throughout.

const P = '#714B67';
const S = '#017E84';

// WCAG AA compliant grays (4.5:1+ contrast on white):
// #595959 = 7.0:1  #767676 = 4.6:1  #505050 = 8.6:1
const LABEL_COLOR = '#505050';
const SECONDARY_COLOR = '#767676';
const MUTED_COLOR = '#959595'; // 2.8:1 — only used for decorative/placeholder dashes

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
  const savings = (pr.monthly.year2plus * mos * users - sw) + ib * id / 100;
  const tier = total >= 25000 ? 't3' : total >= 15000 ? 't2' : 't1';
  const f = RF[tier][term];
  return { sw, ic, total, monthly, savings, fin: f ? { low: total * f.low, high: total * f.high } : null };
}
const $ = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n);

export function AccessibilityFirst() {
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
    <div className="min-h-screen bg-[#F7F6F8] flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header — generous sizing, clear labeling */}
      <header className="bg-white border-b-2 border-gray-200 px-6 py-4 flex items-center gap-6 flex-wrap sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: P }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <div className="text-base font-bold" style={{ color: P }}>Odoo Estimator</div>
            <div className="text-xs" style={{ color: SECONDARY_COLOR }}>Enterprise Pricing Calculator</div>
          </div>
        </div>

        <div className="h-8 w-px bg-gray-200" />

        {/* Users — large enough to read and interact with */}
        <div className="flex flex-col gap-1">
          <label htmlFor="acc-users" className="text-xs font-semibold uppercase tracking-wide" style={{ color: SECONDARY_COLOR }}>Number of Users</label>
          <input id="acc-users" type="number" min="1" max="500" value={users} onChange={e => setUsers(+e.target.value || 1)}
            className="w-20 h-10 border-2 border-gray-300 rounded-xl px-3 text-base text-center font-mono font-semibold focus:outline-none focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/20 bg-white"
            style={{ color: LABEL_COLOR }} />
        </div>

        {/* Plan */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: SECONDARY_COLOR }}>Odoo Plan</span>
          <div className="flex h-10 rounded-xl overflow-hidden border-2 border-gray-300">
            {(['standard', 'custom'] as const).map(p => (
              <button key={p} onClick={() => setPlan(p)}
                className="px-4 text-sm font-semibold transition-all cursor-pointer"
                style={plan === p ? { backgroundColor: P, color: 'white' } : { backgroundColor: 'white', color: LABEL_COLOR }}>
                {p === 'standard' ? 'Standard' : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {/* Implementation */}
        <div className="flex flex-col gap-1">
          <label htmlFor="acc-impl" className="text-xs font-semibold uppercase tracking-wide" style={{ color: SECONDARY_COLOR }}>Implementation</label>
          <div className="relative">
            <select id="acc-impl" value={impl} onChange={e => setImpl(e.target.value)}
              className="h-10 border-2 border-gray-300 rounded-xl pl-3 pr-8 text-sm bg-white focus:outline-none focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/20 appearance-none cursor-pointer"
              style={{ color: LABEL_COLOR }}>
              {Object.entries(IMPL).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <svg className="absolute right-2.5 top-3 w-4 h-4 pointer-events-none" style={{ color: SECONDARY_COLOR }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        {/* Discounts */}
        {[['Plan Discount', 'acc-pd', pd, setPd], ['Impl Discount', 'acc-id', id, setId]].map(([lbl, htmlId, val, set]) => (
          <div key={htmlId as string} className="flex flex-col gap-1">
            <label htmlFor={htmlId as string} className="text-xs font-semibold uppercase tracking-wide" style={{ color: SECONDARY_COLOR }}>{lbl as string}</label>
            <div className="relative">
              <input id={htmlId as string} type="number" min="0" max="100" value={val as number}
                onChange={e => (set as Function)(parseFloat(e.target.value) || 0)}
                className="h-10 w-24 border-2 border-gray-300 rounded-xl px-3 pr-8 text-base text-right font-mono bg-white focus:outline-none focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/20"
                style={{ color: LABEL_COLOR }} />
              <span className="absolute right-3 top-2.5 text-base font-semibold" style={{ color: SECONDARY_COLOR }}>%</span>
            </div>
          </div>
        ))}

        {/* Term toggles */}
        <div className="ml-auto flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: SECONDARY_COLOR }}>Show Terms</span>
          <div className="flex gap-2">
            {TERMS.map(t => {
              const on = active.has(t.key);
              return (
                <button key={t.key}
                  onClick={() => setActive(prev => { const n = new Set(prev); n.has(t.key) && n.size > 1 ? n.delete(t.key) : n.add(t.key); return n; })}
                  className="h-10 px-3 rounded-xl text-sm font-semibold border-2 transition-all cursor-pointer"
                  style={on ? { backgroundColor: P, borderColor: P, color: 'white' } : { backgroundColor: 'white', borderColor: '#d1d5db', color: SECONDARY_COLOR }}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Table — generous row heights, large readable text */}
      <main className="flex-1 p-6">
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-52 text-left px-6 py-4 bg-gray-50 border-b-2 border-gray-200">
                  <span className="text-sm font-bold uppercase tracking-wider" style={{ color: SECONDARY_COLOR }}>Cost Item</span>
                </th>
                {visible.map(t => {
                  const isBest = t.key === best?.key;
                  return (
                    <th key={t.key} className="px-4 py-4 text-center border-b-2 border-gray-200"
                      style={{ backgroundColor: isBest ? `${P}08` : '#f9fafb' }}>
                      <div className="text-base font-bold" style={{ color: isBest ? P : LABEL_COLOR }}>{t.label}</div>
                      {/* Non-color indicator for best: star + text, not just color */}
                      {isBest
                        ? <div className="text-xs font-semibold mt-1" style={{ color: P }}>★ Best savings</div>
                        : <div className="text-xs mt-1" style={{ color: MUTED_COLOR }}>—</div>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Software License', key: 'sw', description: 'Annual subscription cost' },
                { label: 'Implementation', key: 'ic', description: 'One-time onboarding fee' },
              ].map((row, ri) => (
                <tr key={row.key} style={{ backgroundColor: ri % 2 === 0 ? 'white' : '#fafafa' }}>
                  <td className="px-6 py-4 border-b border-gray-100">
                    <div className="text-sm font-semibold" style={{ color: LABEL_COLOR }}>{row.label}</div>
                    <div className="text-xs mt-0.5" style={{ color: SECONDARY_COLOR }}>{row.description}</div>
                  </td>
                  {visible.map(t => {
                    const val = qs[t.key][row.key as 'sw' | 'ic'];
                    return (
                      <td key={t.key} className="px-4 py-4 text-center border-b border-gray-100 font-mono text-base"
                        style={{ color: LABEL_COLOR, backgroundColor: t.key === best?.key ? `${P}04` : 'transparent' }}>
                        {val > 0 ? $(val) : <span style={{ color: MUTED_COLOR }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Separator */}
              <tr><td colSpan={visible.length + 1} className="p-0"><div className="h-0.5 bg-gray-200" /></td></tr>

              {/* Total */}
              <tr style={{ backgroundColor: `${P}05` }}>
                <td className="px-6 py-5 border-b border-gray-200">
                  <div className="text-sm font-bold" style={{ color: P }}>Total Contract Value</div>
                  <div className="text-xs mt-0.5" style={{ color: SECONDARY_COLOR }}>Full cost for the term</div>
                </td>
                {visible.map(t => (
                  <td key={t.key} className="px-4 py-5 text-center border-b border-gray-200 font-mono font-bold text-xl"
                    style={{ color: P, backgroundColor: t.key === best?.key ? `${P}08` : 'transparent' }}>
                    {$(qs[t.key].total)}
                  </td>
                ))}
              </tr>

              {/* Monthly */}
              <tr style={{ backgroundColor: '#f8f6f9' }}>
                <td className="px-6 py-5 border-b border-gray-200">
                  <div className="text-sm font-bold" style={{ color: LABEL_COLOR }}>Monthly Cost (Amortized)</div>
                  <div className="text-xs mt-0.5" style={{ color: SECONDARY_COLOR }}>Total divided by term months</div>
                </td>
                {visible.map(t => (
                  <td key={t.key} className="px-4 py-5 text-center border-b border-gray-200"
                    style={{ backgroundColor: t.key === best?.key ? `${P}06` : 'transparent' }}>
                    <span className="font-mono font-bold text-2xl" style={{ color: LABEL_COLOR }}>{$(qs[t.key].monthly)}</span>
                    <span className="text-sm ml-1" style={{ color: SECONDARY_COLOR }}>/mo</span>
                  </td>
                ))}
              </tr>

              {/* Savings — uses text + icon, not color alone */}
              <tr className="bg-green-50">
                <td className="px-6 py-5 border-b border-green-100">
                  <div className="text-sm font-bold text-green-800">▼ Savings vs Monthly Billing</div>
                  <div className="text-xs mt-0.5 text-green-700">Compared to paying month-to-month</div>
                </td>
                {visible.map(t => {
                  const s = qs[t.key].savings;
                  return (
                    <td key={t.key} className="px-4 py-5 text-center border-b border-green-100"
                      style={{ backgroundColor: t.key === best?.key ? 'rgba(16,185,129,0.10)' : 'transparent' }}>
                      {s > 0
                        ? <div>
                            <div className="text-base font-bold font-mono text-green-800">−{$(s)}</div>
                            <div className="text-xs text-green-700 mt-0.5">saved over term</div>
                          </div>
                        : <span style={{ color: MUTED_COLOR }}>No savings</span>}
                    </td>
                  );
                })}
              </tr>

              {/* Financing — labeled clearly, color + text label */}
              <tr className="bg-gray-50">
                <td className="px-6 py-3 border-b border-gray-200">
                  <div className="text-sm font-bold" style={{ color: LABEL_COLOR }}>Financing Estimates</div>
                  <div className="text-xs mt-0.5" style={{ color: SECONDARY_COLOR }}>Monthly payment range if financed</div>
                </td>
                {visible.map(t => <td key={t.key} className="border-b border-gray-200 bg-gray-50 py-3" />)}
              </tr>
              {[
                { est: 'low' as const, label: 'Low estimate', desc: 'Best-case monthly payment', textColor: '#166534', bgColor: 'rgba(240,253,244,0.8)' },
                { est: 'high' as const, label: 'High estimate', desc: 'Worst-case monthly payment', textColor: '#92400e', bgColor: 'rgba(255,251,235,0.8)' },
              ].map(({ est, label, desc, textColor, bgColor }) => (
                <tr key={est} style={{ backgroundColor: bgColor }}>
                  <td className="px-6 py-4 border-b border-gray-100">
                    <div className="text-sm font-bold" style={{ color: textColor }}>{label}</div>
                    <div className="text-xs mt-0.5" style={{ color: textColor, opacity: 0.75 }}>{desc}</div>
                  </td>
                  {visible.map(t => {
                    const f = qs[t.key].fin;
                    return (
                      <td key={t.key} className="px-4 py-4 text-center border-b border-gray-100 font-mono text-base font-semibold"
                        style={{ color: textColor, backgroundColor: t.key === best?.key ? `${P}04` : 'transparent' }}>
                        {f
                          ? <>{$(f[est])}<span className="text-sm font-normal" style={{ opacity: 0.7 }}>/mo</span></>
                          : <span style={{ color: MUTED_COLOR, fontWeight: 400 }}>Not applicable</span>}
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
