import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, CheckCircle2, DollarSign, TrendingUp, Calendar, ArrowRight, Download, Share2, ChevronDown, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Types
type Term = "monthly" | "1year" | "3year" | "5year";

interface TermData {
  id: Term;
  label: string;
  total: number;
  monthly: number;
  savings: number;
  financeLow?: number;
  financeHigh?: number;
  years: number;
}

const terms: Record<Term, TermData> = {
  monthly: { id: "monthly", label: "Monthly", total: 7993.5, monthly: 7993.5, savings: 0, years: 1 }, 
  "1year": { id: "1year", label: "1-Year", total: 16193.6, monthly: 1349, savings: 0, years: 1 },
  "3year": { id: "3year", label: "3-Year", total: 36720.08, monthly: 1020, savings: 13066, financeLow: 1117, financeHigh: 1237, years: 3 },
  "5year": { id: "5year", label: "5-Year", total: 57246.56, monthly: 954, savings: 20476, financeLow: 1107, financeHigh: 1302, years: 5 }
};

const getYearlyData = (term: Term) => {
  const years = terms[term].years;
  const data = [];
  
  if (term === "monthly") {
    data.push({
      year: 1,
      label: "Month 1",
      software: 777.5,
      sh: 216,
      impl: 6650,
      savings: 0,
      cumulativeSavings: 0,
      annotation: "Month-to-month commitment"
    });
    return data;
  }

  let cumulativeSavings = 0;

  for (let i = 1; i <= years; i++) {
    const isYear1 = i === 1;
    // year 2+ savings = promo vs list logic? Actually, we just need hardcoded dollar amounts.
    // list price for yr2+ = 31.10, multi-year discount is 10%, so 27.99
    // difference is 3.11 * 25 * 12 = 933
    // Year-1 promo savings = (31.10 - 24.90) * 25 * 12 = 1860
    const yearSavings = isYear1 ? 1860 : 933; // rough approx for software only to match screenshot requests
    cumulativeSavings += yearSavings;

    data.push({
      year: i,
      label: `Year ${i}`,
      software: isYear1 ? 7470 : 8397,
      sh: isYear1 ? 2073.6 : 1866.24,
      impl: isYear1 ? 6650 : 0,
      savings: yearSavings,
      cumulativeSavings: cumulativeSavings,
      annotation: isYear1 
        ? "Year 1: Promo rate locked — saved $1,860" 
        : i === 2 
          ? "Year 2: Multi-year discount kicks in — saved $933 this year"
          : "Year 3: Discount continues — saved $933 again"
    });
  }
  return data;
};

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
const formatCurrencyDecimals = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);

export function Storyboard() {
  const [selectedTerm, setSelectedTerm] = useState<Term>("3year");
  const data = terms[selectedTerm];
  const yearlyData = getYearlyData(selectedTerm);

  const maxYearTotal = 17000;
  const maxCumulativeSavings = Math.max(...yearlyData.map(d => d.cumulativeSavings), 1);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] font-sans text-stone-800">
      {/* Top Navbar / Brand */}
      <header className="h-[52px] bg-white border-b border-stone-200 flex items-center justify-between px-5 shrink-0 z-50 shadow-sm relative">
        <div className="flex items-center gap-3">
          <img src="/__mockup/images/odoo-brand/odoo_logo.png" alt="Odoo" className="h-[22px]" />
          <div className="w-[1px] h-4 bg-stone-300" />
          <span className="text-[13px] font-semibold text-[#714B67] tracking-tight">Quote Builder</span>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs bg-white border-stone-200 text-stone-600 hover:bg-stone-50">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export PDF
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Config */}
        <aside className="w-[340px] bg-white border-r border-stone-200 flex flex-col overflow-y-auto shrink-0 z-10 shadow-[2px_0_12px_rgba(0,0,0,0.02)]">
          <div className="p-5 space-y-7">
            
            {/* 1. Country / Currency */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Country / Currency</label>
              <div className="flex p-1 bg-stone-100/80 rounded-lg border border-stone-200/50">
                <button className="flex-1 text-[13px] font-semibold py-1.5 rounded-md bg-white shadow-sm border border-stone-200/50 text-stone-900">USD</button>
                <button className="flex-1 text-[13px] font-medium py-1.5 rounded-md text-stone-500 hover:text-stone-700 transition-colors">CAD</button>
              </div>
            </div>

            {/* 2. Users */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Users</label>
              <Input type="number" defaultValue={25} className="h-9 text-sm font-medium border-stone-200 focus-visible:ring-[#714B67]" />
            </div>

            {/* 3. Plan */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Plan</label>
              <div className="flex p-1 bg-stone-100/80 rounded-lg border border-stone-200/50">
                <button className="flex-1 text-[13px] font-semibold py-1.5 rounded-md bg-white shadow-sm border border-stone-200/50 text-stone-900">Standard</button>
                <button className="flex-1 text-[13px] font-medium py-1.5 rounded-md text-stone-500 hover:text-stone-700 transition-colors">Custom</button>
              </div>
            </div>

            {/* 4. Implementation */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Implementation</label>
              <div className="h-9 px-3 flex items-center justify-between border border-stone-200 rounded-lg bg-white shadow-sm cursor-pointer hover:border-stone-300 transition-colors">
                <span className="text-sm font-medium text-stone-800">Basic (50h) — $7,000</span>
                <ChevronDown className="w-4 h-4 text-stone-400" />
              </div>
            </div>

            {/* 5. Odoo SH Hosting */}
            <div className="space-y-4 pt-5 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Odoo SH Hosting</label>
                <Switch checked={true} className="data-[state=checked]:bg-[#017E84]" />
              </div>
              <div className="space-y-3.5 pl-3 border-l-2 border-[#017E84]/20 py-1">
                <div className="flex p-1 bg-stone-100/80 rounded-lg border border-stone-200/50">
                  <button className="flex-1 text-[12px] font-semibold py-1.5 rounded-md bg-white shadow-sm border border-stone-200/50 text-stone-900">Shared</button>
                  <button className="flex-1 text-[12px] font-medium py-1.5 rounded-md text-stone-500 hover:text-stone-700 transition-colors">Dedicated</button>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-stone-600">Workers</span>
                  <Input type="number" defaultValue={3} className="w-16 h-8 text-xs font-semibold text-center border-stone-200" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-stone-600">Storage GB</span>
                  <Input type="number" defaultValue={1} className="w-16 h-8 text-xs font-semibold text-center border-stone-200" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-stone-600">Staging branches</span>
                  <Input type="number" defaultValue={0} className="w-16 h-8 text-xs font-semibold text-center border-stone-200" />
                </div>
                <div className="bg-[#017E84]/5 border border-[#017E84]/10 rounded-md px-3 py-2 mt-2 flex items-start gap-2">
                  <Monitor className="w-3.5 h-3.5 text-[#017E84] mt-0.5 shrink-0" />
                  <p className="text-[11px] text-[#017E84] font-medium leading-tight tracking-wide">
                    $172.80/mo annual<br/>
                    <span className="opacity-80">$216/mo monthly</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Terms to Compare */}
            <div className="space-y-3.5 pt-5 border-t border-stone-100">
              <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase">Terms to Compare</label>
              <div className="flex flex-wrap gap-2">
                {['Mo', '1Y', '2Y', '3Y', '4Y', '5Y'].map(t => {
                  const isActive = ['Mo', '1Y', '3Y', '5Y'].includes(t);
                  return (
                    <button
                      key={t}
                      className={`h-8 px-3.5 text-xs font-bold rounded-full border transition-all ${
                        isActive 
                          ? 'border-[#714B67] bg-[#714B67] text-white shadow-sm' 
                          : 'border-stone-200 bg-white text-stone-400 hover:border-stone-300 hover:text-stone-600'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Discounts */}
            <div className="space-y-3.5 pt-5 border-t border-stone-100 pb-6">
              <label className="text-[10px] font-bold tracking-widest text-stone-400 uppercase flex justify-between">
                <span>Discounts (%)</span>
              </label>
              <div className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-sm text-xs">
                <div className="grid grid-cols-5 bg-stone-50 border-b border-stone-200 text-[10px] font-bold text-stone-500 tracking-wider">
                  <div className="p-2 pl-3"></div>
                  <div className="p-2 text-center border-l border-stone-200/50">Mo</div>
                  <div className="p-2 text-center border-l border-stone-200/50">1Y</div>
                  <div className="p-2 text-center border-l border-stone-200/50">3Y</div>
                  <div className="p-2 text-center border-l border-stone-200/50">5Y</div>
                </div>
                <div className="grid grid-cols-5 border-b border-stone-100 items-center">
                  <div className="p-2 pl-3 text-stone-500 font-semibold">Plan</div>
                  <div className="p-2 text-center text-stone-300 border-l border-stone-100 bg-stone-50/50">—</div>
                  <div className="p-2 text-center text-stone-300 border-l border-stone-100 bg-stone-50/50">—</div>
                  <div className="p-2 text-center font-bold text-[#017E84] border-l border-stone-100 bg-[#017E84]/5">10</div>
                  <div className="p-2 text-center font-bold text-[#017E84] border-l border-stone-100 bg-[#017E84]/5">10</div>
                </div>
                <div className="grid grid-cols-5 items-center">
                  <div className="p-2 pl-3 text-stone-500 font-semibold">Impl</div>
                  <div className="p-2 text-center font-bold text-[#E4A900] border-l border-stone-100 bg-[#E4A900]/5">5</div>
                  <div className="p-2 text-center font-bold text-[#E4A900] border-l border-stone-100 bg-[#E4A900]/5">5</div>
                  <div className="p-2 text-center font-bold text-[#E4A900] border-l border-stone-100 bg-[#E4A900]/5">5</div>
                  <div className="p-2 text-center font-bold text-[#E4A900] border-l border-stone-100 bg-[#E4A900]/5">5</div>
                </div>
              </div>
            </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-stone-50/50 relative">
          
          <div className="max-w-5xl mx-auto px-10 py-10">
            {/* Sticky Summary Chip */}
            <div className="sticky top-0 z-20 flex justify-center mb-8 pointer-events-none">
              <div className="bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-sm px-4 py-2 rounded-full text-xs font-medium text-stone-600 flex gap-2 items-center pointer-events-auto">
                <span className="text-stone-900 font-semibold">United States</span><span className="text-stone-300">·</span>
                <span>25 users</span><span className="text-stone-300">·</span>
                <span>Standard</span><span className="text-stone-300">·</span>
                <span>Basic Implementation</span><span className="text-stone-300">·</span>
                <span>Odoo SH Shared 3 workers</span>
              </div>
            </div>

            {/* Term Selector Tabs */}
            <div className="flex justify-center mb-8">
              <div className="bg-white p-1.5 rounded-xl shadow-sm border border-stone-200 flex gap-1 relative z-10">
                {(["monthly", "1year", "3year", "5year"] as Term[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTerm(t)}
                    className={`relative px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                      selectedTerm === t 
                        ? "text-white" 
                        : "text-stone-500 hover:bg-stone-50 hover:text-stone-700"
                    }`}
                  >
                    {selectedTerm === t && (
                      <motion.div 
                        layoutId="activeTabStoryboard"
                        className="absolute inset-0 bg-[#714B67] rounded-lg shadow-md"
                        style={{ zIndex: -1 }}
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {terms[t].label}
                      {t === "3year" && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wide flex-shrink-0 ${
                          selectedTerm === t ? "bg-white/25 text-white shadow-sm" : "bg-[#E4A900]/10 text-[#E4A900]"
                        }`}>
                          Best Value
                        </span>
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hero Strip */}
            <motion.div 
              key={selectedTerm}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 flex items-center justify-between mb-10"
            >
              <div className="flex gap-16">
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#714B67]" /> Total Contract
                  </div>
                  <div className="text-4xl font-bold text-stone-900 tracking-tight">{formatCurrencyDecimals(data.total)}</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-stone-300" /> Monthly Average
                  </div>
                  <div className="text-4xl font-bold text-stone-900 tracking-tight">{formatCurrency(data.monthly)}<span className="text-lg text-stone-400 font-medium ml-1 tracking-normal">/mo</span></div>
                </div>
                {data.savings > 0 && (
                  <div>
                    <div className="text-xs font-bold text-[#017E84] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#017E84]" /> You Save
                    </div>
                    <div className="text-4xl font-bold text-[#017E84] tracking-tight bg-[#017E84]/5 px-4 py-1 -ml-4 rounded-xl">
                      {formatCurrency(data.savings)}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Timeline Storyboard (Main Visual) */}
            {selectedTerm !== "monthly" && selectedTerm !== "1year" && (
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-10 mb-10 overflow-visible relative">
                <h2 className="text-xl font-bold text-[#714B67] mb-2 text-center">Investment Timeline</h2>
                <p className="text-stone-500 text-sm text-center mb-16 font-medium">How your multi-year discount compounds over {data.years} years</p>

                <div className="relative w-full h-[320px] max-w-3xl mx-auto mt-10">
                  
                  {/* Axis line */}
                  <div className="absolute bottom-[20px] left-0 right-0 h-[2px] bg-stone-100 rounded-full" />
                  
                  {/* Savings line connecting nodes */}
                  <div className="absolute inset-0 z-0 pointer-events-none" style={{ bottom: '20px' }}>
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <polyline 
                        fill="none" 
                        stroke="#017E84" 
                        strokeWidth="2.5" 
                        strokeDasharray="6 4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={yearlyData.map((yd, i) => {
                          const numCols = yearlyData.length;
                          const x = `${(i * (100 / numCols)) + (50 / numCols)}%`;
                          const yRange = 220; // available height for line chart
                          const y = 280 - ((yd.cumulativeSavings / maxCumulativeSavings) * yRange);
                          return `${i * (100/numCols) + (50/numCols)},${y}`; // SVG points don't perfectly map to CSS %, but close enough for conceptual
                        }).join(' ')}
                        style={{ transform: 'scale(1, 1)', transformOrigin: 'bottom' }}
                        className="opacity-40"
                      />
                    </svg>
                  </div>

                  <div className="flex items-end justify-around gap-6 h-full relative z-10">
                    <AnimatePresence mode="popLayout">
                      {yearlyData.map((yd, idx) => {
                        const totalYear = yd.software + yd.sh + yd.impl;
                        // Bar heights relative to max
                        const barHeight = Math.max((totalYear / maxYearTotal) * 200, 40);
                        
                        const swPct = (yd.software / totalYear) * 100;
                        const shPct = (yd.sh / totalYear) * 100;
                        const implPct = (yd.impl / totalYear) * 100;

                        return (
                          <motion.div 
                            key={`bar-${yd.year}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.15, type: "spring", stiffness: 200, damping: 20 }}
                            className="flex-1 flex flex-col items-center relative group"
                          >
                            
                            {/* Cumulative Savings Node & Callout */}
                            <div className="absolute w-full flex justify-center pointer-events-none" style={{
                                bottom: 20 + ((yd.cumulativeSavings / maxCumulativeSavings) * 220) + 'px'
                            }}>
                              <div className="w-3.5 h-3.5 bg-[#017E84] rounded-full border-[2.5px] border-white shadow-md z-20 transform translate-y-1.5" />
                              <div className="absolute -top-7 whitespace-nowrap bg-teal-50 border border-teal-100 text-[#017E84] text-[10px] font-bold px-2.5 py-1 rounded shadow-sm">
                                Total Saved: {formatCurrency(yd.cumulativeSavings)}
                              </div>
                            </div>

                            {/* Annotation Box pointing down */}
                            {yd.savings > 0 && (
                              <div className="absolute -top-10 z-20 text-center w-[180px] pointer-events-none">
                                <div className="bg-white border border-stone-200 text-stone-600 text-xs font-semibold px-3 py-2 rounded-lg shadow-xl relative mx-auto inline-block text-center leading-snug">
                                  {yd.annotation.split('—').map((part, i) => (
                                    <React.Fragment key={i}>
                                      {i === 1 ? <span className="block text-[#017E84] mt-0.5">{part.trim()}</span> : <span>{part.trim()}</span>}
                                    </React.Fragment>
                                  ))}
                                  {/* Pointy arrow */}
                                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-stone-200 rotate-45 shadow-[2px_2px_2px_rgba(0,0,0,0.02)]" />
                                </div>
                                {/* Connecting line to bar */}
                                <div className="w-px h-8 bg-stone-300 mx-auto mt-1" />
                              </div>
                            )}

                            {/* The Stacked Bar */}
                            <div className="w-[88px] relative flex flex-col justify-end shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 rounded-t-xl overflow-hidden cursor-crosshair z-10" style={{ height: barHeight }}>
                               {yd.impl > 0 && (
                                <div className="w-full bg-[#E4A900] border-b border-white/25 flex items-center justify-center relative overflow-hidden" style={{ height: `${implPct}%` }}>
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                                </div>
                               )}
                               <div className="w-full bg-[#714B67] border-b border-white/25 flex items-center justify-center relative overflow-hidden" style={{ height: `${swPct}%` }}>
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                               </div>
                               <div className="w-full bg-[#017E84] flex items-center justify-center relative overflow-hidden" style={{ height: `${shPct}%` }}>
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                               </div>
                            </div>
                            
                            <div className="mt-6 mb-1 font-bold text-stone-900 tracking-tight">{yd.label}</div>
                            <div className="text-[11px] font-bold text-stone-400 bg-white px-2 py-0.5 rounded border border-stone-100">{formatCurrencyDecimals(totalYear)}</div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-8 mt-12 pt-6 border-t border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-[#714B67] shadow-inner" />
                    <span className="text-xs font-semibold text-stone-600">Software</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-[#017E84] shadow-inner" />
                    <span className="text-xs font-semibold text-stone-600">Odoo SH</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded bg-[#E4A900] shadow-inner" />
                    <span className="text-xs font-semibold text-stone-600">Implementation</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-stone-200 pl-8">
                    <div className="w-3.5 h-3.5 rounded-full bg-white border-[2.5px] border-[#017E84] shadow-sm" />
                    <span className="text-xs font-semibold text-[#017E84]">Cumulative Savings</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Breakdown & Financing */}
            <div className="grid grid-cols-5 gap-6">
              
              {/* Detailed Breakdown */}
              <div className="col-span-3 bg-white rounded-2xl shadow-sm border border-stone-200 p-8 flex flex-col">
                <h3 className="text-sm font-bold text-stone-900 mb-6 uppercase tracking-widest flex justify-between items-center">
                  Cost Breakdown <span className="text-stone-400 font-medium tracking-normal capitalize">{data.label} total</span>
                </h3>
                
                <div className="space-y-0 flex-1">
                  <div className="flex justify-between items-center py-4 border-b border-stone-100 group hover:bg-stone-50/50 px-2 rounded-lg transition-colors -mx-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#714B67]" />
                      <span className="text-sm font-semibold text-stone-700">Software License</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-stone-900">{formatCurrencyDecimals(data.years === 3 ? 24264 : data.years === 5 ? 41058 : data.years === 1 ? 7470 : 777.50)}</span>
                      {data.years > 1 && (
                        <div className="text-[10px] font-medium text-[#017E84] mt-0.5">Includes {formatCurrency(data.years === 3 ? 3726 : data.years === 5 ? 5592 : 1860)} saved vs list</div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-stone-100 group hover:bg-stone-50/50 px-2 rounded-lg transition-colors -mx-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#E4A900]" />
                      <span className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                        Implementation
                        <Badge variant="outline" className="text-[9px] h-4.5 px-1.5 py-0 font-bold uppercase tracking-wider text-[#E4A900] border-[#E4A900]/20 bg-[#E4A900]/5">One-time</Badge>
                      </span>
                    </div>
                    <span className="text-sm font-bold text-stone-900">{formatCurrencyDecimals(6650)}</span>
                  </div>

                  <div className="flex justify-between items-center py-4 border-b border-stone-100 group hover:bg-stone-50/50 px-2 rounded-lg transition-colors -mx-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#017E84]" />
                      <span className="text-sm font-semibold text-stone-700">Odoo SH Hosting</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-stone-900">{formatCurrencyDecimals(data.years === 3 ? 5806.08 : data.years === 5 ? 9538.56 : data.years === 1 ? 2073.60 : 216)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6">
                  <div className="bg-stone-50 rounded-xl p-5 border border-stone-200/50 flex justify-between items-center">
                    <span className="text-sm font-bold text-stone-800 uppercase tracking-widest">Total Contract</span>
                    <span className="text-2xl font-bold text-stone-900">{formatCurrencyDecimals(data.total)}</span>
                  </div>
                </div>
              </div>

              {/* Catalyst Financing */}
              <div className="col-span-2 bg-[#714B67] rounded-2xl shadow-lg border border-[#5C3D55] p-8 text-white relative overflow-hidden flex flex-col justify-between group">
                {/* Decorative BG */}
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:scale-110 group-hover:opacity-10 transition-all duration-700">
                  <TrendingUp className="w-40 h-40" />
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-stone-700 to-teal-400" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="bg-white text-[#714B67] p-1.5 rounded-lg shadow-sm">
                      <DollarSign className="w-4 h-4" strokeWidth={3} />
                    </div>
                    <h4 className="text-sm font-bold text-stone-100 uppercase tracking-widest">Catalyst Finance</h4>
                  </div>
                  
                  {data.financeLow ? (
                    <>
                      <p className="text-sm text-stone-300 leading-relaxed font-medium mb-8">
                        Preserve your working capital. Finance software, hosting, and implementation in one predictable monthly payment.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="bg-[#5C3D55]/50 rounded-xl p-5 border border-stone-700/20 backdrop-blur-sm">
                          <div className="text-xs text-stone-300 font-bold tracking-wider uppercase mb-2">Estimated Payment</div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xs text-stone-300 font-medium">From</span>
                            <span className="text-4xl font-bold text-white tracking-tight">{formatCurrency(data.financeLow)}</span>
                            <span className="text-sm font-medium text-stone-300">/mo</span>
                          </div>
                          <div className="text-[11px] font-medium text-stone-300 mt-2 flex items-center justify-between">
                            <span>6% APR (Best Rate)</span>
                            <span>Up to {formatCurrency(data.financeHigh)}/mo</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col justify-center py-10">
                      <p className="text-sm text-stone-300 leading-relaxed font-medium mb-4 text-center">
                        Financing is available for multi-year contracts.
                      </p>
                      <div className="text-center">
                        <span className="inline-block px-3 py-1 bg-[#5C3D55] rounded-full text-xs font-bold text-stone-300 border border-stone-700/20">
                          Select 3-Year or 5-Year
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Button 
                  disabled={!data.financeLow}
                  className="w-full mt-6 bg-stone-700 hover:bg-stone-700 text-white font-bold h-11 border-0 shadow-[0_4px_14px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  Apply for Financing <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
