import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, CheckCircle2, DollarSign, TrendingUp, Calendar, ArrowRight } from "lucide-react";

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
  monthly: { id: "monthly", label: "Monthly", total: 7993.5, monthly: 7994, savings: 0, years: 1 }, 
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
    const yearSavings = isYear1 ? 1860 : (1866 + 414.72); // simplify year 2+ savings for display logic
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
        ? "Year 1: Promo rate locked — save $1,860" 
        : i === 2 
          ? `Year 2: Multi-year discount kicks in — save $${Math.round(yearSavings)} this year` 
          : `Year ${i}: Discount continues — save $${Math.round(yearSavings)} again`
    });
  }
  return data;
};

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

export function Storyboard() {
  const [selectedTerm, setSelectedTerm] = useState<Term>("3year");
  const data = terms[selectedTerm];
  const yearlyData = getYearlyData(selectedTerm);

  const maxYearTotal = 17000;
  const maxCumulativeSavings = Math.max(...yearlyData.map(d => d.cumulativeSavings), 1);

  return (
    <div className="min-h-screen bg-[#FAFAF7] font-sans text-stone-800 selection:bg-[#714B67] selection:text-white">
      {/* Top Navbar / Brand */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/__mockup/images/odoo-brand/odoo_logo.png" alt="Odoo" className="h-6" />
          <div className="h-5 w-px bg-stone-200"></div>
          <span className="text-sm font-semibold text-[#714B67] uppercase tracking-wider">Quote Explorer</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-stone-500">
          <div className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#017E84]" />
            <span>Standard Plan · 25 Users</span>
          </div>
          <div className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#017E84]" />
            <span>Basic Implementation</span>
          </div>
          <div className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#017E84]" />
            <span>Odoo SH Shared</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Term Selector */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">Financial Projection</h1>
            <p className="text-stone-500 text-sm">Visualize your investment and savings over time.</p>
          </div>
          
          <div className="bg-white p-1.5 rounded-xl shadow-sm border border-stone-200 flex gap-1">
            {(["monthly", "1year", "3year", "5year"] as Term[]).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTerm(t)}
                className={`relative px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  selectedTerm === t 
                    ? "text-white" 
                    : "text-stone-600 hover:bg-stone-50"
                }`}
              >
                {selectedTerm === t && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#714B67] rounded-lg"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {terms[t].label}
                  {t === "3year" && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                      selectedTerm === t ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                    }`}>
                      BEST VALUE
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
          className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 flex items-center justify-between mb-12"
        >
          <div className="flex gap-12">
            <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Total Contract</div>
              <div className="text-3xl font-bold text-stone-900">{formatCurrency(data.total)}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Monthly Average</div>
              <div className="text-3xl font-bold text-stone-900">{formatCurrency(data.monthly)}<span className="text-lg text-stone-400 font-medium">/mo</span></div>
            </div>
            {data.savings > 0 && (
              <div>
                <div className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-1">Total Savings</div>
                <div className="text-3xl font-bold text-teal-600">
                  {formatCurrency(data.savings)}
                </div>
              </div>
            )}
          </div>

          {data.financeLow && (
            <div className="bg-stone-50 border border-stone-100 rounded-xl p-4 flex items-center gap-4">
              <div className="h-10 w-10 bg-stone-100 text-[#017E84] rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-0.5">Finance with Catalyst</div>
                <div className="text-sm font-semibold text-stone-900">
                  As low as {formatCurrency(data.financeLow)}/mo
                </div>
              </div>
              <button className="ml-2 bg-white border border-stone-200 shadow-sm text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-stone-50 flex items-center gap-1">
                View Rates <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </motion.div>

        {/* Timeline Storyboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 mb-8 overflow-hidden">
          <h2 className="text-lg font-bold text-stone-900 mb-12 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#714B67]" /> 
            Cost Progression Over {data.label}
          </h2>

          <div className="relative">
            {/* Horizontal axis */}
            <div className="absolute bottom-[30px] left-0 right-0 h-px bg-stone-200"></div>

            {/* Savings Line SVG overlay */}
            <div className="absolute inset-0 pointer-events-none z-0">
               <svg className="w-full h-full" preserveAspectRatio="none">
                 {selectedTerm !== 'monthly' && selectedTerm !== '1year' && (
                    <polyline 
                      fill="none" 
                      stroke="#10b981" 
                      strokeWidth="2" 
                      strokeDasharray="4 4"
                      points={yearlyData.map((yd, i) => {
                        // Calculate X position: each column is flex-1.
                        // Assuming container is partitioned evenly
                        const numCols = yearlyData.length;
                        const segmentWidth = 100 / numCols;
                        const x = `${(i * segmentWidth) + (segmentWidth / 2)}%`;
                        
                        // Calculate Y position based on cumulative savings maxing out near the top
                        // Container is 350px tall + 30px pb. Let's make top savings at y=40px, bottom at y=330px
                        const range = 290;
                        const y = 330 - ((yd.cumulativeSavings / maxCumulativeSavings) * range);
                        
                        return `${i === 0 ? 50 : i * (100 / numCols) + (50 / numCols)}%,${y}`;
                        // We will just approximate points using inline styles if SVG is tricky, let's stick to simple
                      }).join(' ')}
                    />
                 )}
               </svg>
            </div>

            <div className="flex items-end justify-around gap-4 h-[350px] relative z-10 pb-[30px]">
              <AnimatePresence mode="popLayout">
                {yearlyData.map((yd, idx) => {
                  const totalYear = yd.software + yd.sh + yd.impl;
                  const softwarePct = (yd.software / totalYear) * 100;
                  const shPct = (yd.sh / totalYear) * 100;
                  const implPct = (yd.impl / totalYear) * 100;
                  
                  const barHeight = Math.max((totalYear / maxYearTotal) * 250, 40); // 250px max height

                  return (
                    <motion.div 
                      key={`year-${yd.year}-${selectedTerm}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                      className="flex-1 flex flex-col items-center group relative"
                    >
                      {/* Cumulative Savings Node */}
                      {yd.cumulativeSavings > 0 && selectedTerm !== '1year' && (
                         <div className="absolute w-full flex justify-center pointer-events-none" style={{
                           bottom: 330 - ((yd.cumulativeSavings / maxCumulativeSavings) * 290) - 30 + 'px'
                         }}>
                            <div className="bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border border-teal-200 -mt-3 transform -translate-y-full whitespace-nowrap">
                              Total Saved: {formatCurrency(yd.cumulativeSavings)}
                            </div>
                            <div className="w-3 h-3 bg-teal-500 rounded-full border-2 border-white shadow-sm mt-0.5"></div>
                         </div>
                      )}

                      {/* Annotation Callout */}
                      {yd.savings > 0 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + (idx * 0.1) }}
                          className="mb-6 text-center"
                        >
                          <div className="bg-teal-50 border border-teal-100 text-teal-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-sm relative mx-auto w-[180px]">
                            {yd.annotation}
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-teal-50 border-r border-b border-teal-100 rotate-45"></div>
                          </div>
                        </motion.div>
                      )}

                      {/* Stacked Bar */}
                      <div className="w-24 relative flex flex-col justify-end shadow-sm hover:shadow-md transition-shadow rounded-t-lg overflow-hidden" style={{ height: barHeight }}>
                        
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-stone-800 text-white text-xs font-medium px-3 py-2 rounded shadow-xl whitespace-nowrap z-20 flex flex-col gap-1">
                          <div className="flex justify-between gap-4">
                            <span className="text-stone-300">Software:</span>
                            <span>{formatCurrency(yd.software)}</span>
                          </div>
                          {yd.impl > 0 && (
                            <div className="flex justify-between gap-4">
                              <span className="text-stone-300">Implementation:</span>
                              <span>{formatCurrency(yd.impl)}</span>
                            </div>
                          )}
                          <div className="flex justify-between gap-4">
                            <span className="text-stone-300">Hosting:</span>
                            <span>{formatCurrency(yd.sh)}</span>
                          </div>
                          <div className="border-t border-stone-600 my-1"></div>
                          <div className="flex justify-between gap-4 font-bold">
                            <span>Year {yd.year} Total:</span>
                            <span>{formatCurrency(totalYear)}</span>
                          </div>
                        </div>

                        {yd.impl > 0 && (
                          <div 
                            className="w-full bg-amber-400 border-b border-white/20 transition-all" 
                            style={{ height: `${implPct}%` }}
                          />
                        )}
                        <div 
                          className="w-full bg-[#714B67] border-b border-white/20 transition-all" 
                          style={{ height: `${softwarePct}%` }}
                        />
                        <div 
                          className="w-full bg-[#017E84] transition-all" 
                          style={{ height: `${shPct}%` }}
                        />
                      </div>
                      
                      <div className="mt-4 font-bold text-stone-700">{yd.label}</div>
                      <div className="text-xs font-semibold text-stone-400 mt-1">{formatCurrency(totalYear)}</div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center gap-8 mt-6 pt-6 border-t border-stone-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#714B67]"></div>
              <span className="text-xs font-medium text-stone-600">Software License</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-[#017E84]"></div>
              <span className="text-xs font-medium text-stone-600">Odoo SH Hosting</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-amber-400"></div>
              <span className="text-xs font-medium text-stone-600">Implementation (One-time)</span>
            </div>
            {(selectedTerm === '3year' || selectedTerm === '5year') && (
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-full bg-teal-500 border-2 border-white shadow-sm"></div>
                 <span className="text-xs font-medium text-stone-600">Cumulative Savings</span>
               </div>
            )}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-3 gap-6">
          {/* Software Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#714B67]/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-[#714B67]"></div>
              </div>
              <h3 className="font-bold text-stone-900">Software License</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Standard Plan (25 users)</span>
                {selectedTerm === "monthly" ? <span>{formatCurrency(777.50)}</span> : 
                 selectedTerm === "1year" ? <span>{formatCurrency(7470)}</span> : 
                 selectedTerm === "3year" ? <span>{formatCurrency(27990)}</span> : 
                 <span>{formatCurrency(46650)}</span>}
              </div>
              
              {selectedTerm !== "monthly" && (
                <div className="flex justify-between text-teal-600 font-medium">
                  <span>Year-1 promo savings</span>
                  <span>-{formatCurrency(1860)}</span>
                </div>
              )}
              
              {(selectedTerm === "3year" || selectedTerm === "5year") && (
                <div className="flex justify-between text-teal-600 font-medium">
                  <span>Multi-year discount</span>
                  <span>-{formatCurrency(selectedTerm === "3year" ? 1866 : 3732)}</span>
                </div>
              )}
              
              <div className="pt-3 border-t border-stone-100 flex justify-between font-bold text-stone-900">
                <span>Software Subtotal</span>
                {selectedTerm === "monthly" ? <span>{formatCurrency(777.50)}</span> : 
                 selectedTerm === "1year" ? <span>{formatCurrency(7470)}</span> : 
                 selectedTerm === "3year" ? <span>{formatCurrency(24264)}</span> : 
                 <span>{formatCurrency(41058)}</span>}
              </div>
            </div>
          </div>

          {/* Hosting Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#017E84]/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-[#017E84]"></div>
              </div>
              <h3 className="font-bold text-stone-900">Odoo SH Hosting</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Shared · 3 workers</span>
                {selectedTerm === "monthly" ? <span>{formatCurrency(216)}</span> : 
                 selectedTerm === "1year" ? <span>{formatCurrency(2073.60)}</span> : 
                 selectedTerm === "3year" ? <span>{formatCurrency(6220.80)}</span> : 
                 <span>{formatCurrency(10368)}</span>}
              </div>
              
              {(selectedTerm === "3year" || selectedTerm === "5year") && (
                <div className="flex justify-between text-teal-600 font-medium">
                  <span>Multi-year discount</span>
                  <span>-{formatCurrency(selectedTerm === "3year" ? 414.72 : 829.44)}</span>
                </div>
              )}
              
              <div className="pt-3 border-t border-stone-100 flex justify-between font-bold text-stone-900">
                <span>Hosting Subtotal</span>
                {selectedTerm === "monthly" ? <span>{formatCurrency(216)}</span> : 
                 selectedTerm === "1year" ? <span>{formatCurrency(2073.60)}</span> : 
                 selectedTerm === "3year" ? <span>{formatCurrency(5806.08)}</span> : 
                 <span>{formatCurrency(9538.56)}</span>}
              </div>
            </div>
          </div>

          {/* Implementation Breakdown */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-sm bg-amber-400"></div>
              </div>
              <h3 className="font-bold text-stone-900">Implementation</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Basic Package (50h)</span>
                <span>{formatCurrency(7000)}</span>
              </div>
              
              <div className="flex justify-between text-teal-600 font-medium">
                <span>Implementation discount</span>
                <span>-{formatCurrency(350)}</span>
              </div>
              
              <div className="pt-3 border-t border-stone-100 flex justify-between font-bold text-stone-900">
                <span>Implementation Subtotal</span>
                <span>{formatCurrency(6650)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
