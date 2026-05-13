import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Share2,
  Check,
  ChevronDown,
  Server,
  Users,
  Calendar,
  Globe,
  Database,
  ArrowRight,
  TrendingDown,
  Minus,
  Plus
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SideBySide() {
  const [savingsCount, setSavingsCount] = useState(0);

  useEffect(() => {
    const target = 13066;
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    const increment = target / steps;
    
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setSavingsCount(target);
        clearInterval(timer);
      } else {
        setSavingsCount(Math.floor(current));
      }
    }, stepTime);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#F3F2EE] text-stone-900 font-sans selection:bg-[#714B67] selection:text-white">
      {/* Top Header */}
      <header className="h-[52px] bg-white border-b border-[#E5E2DB] flex items-center justify-between px-5 shrink-0 z-10 sticky top-0 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="flex items-center gap-3">
          <img
            src="/__mockup/images/odoo-brand/odoo_logo.png"
            alt="Odoo"
            className="h-[26px] object-contain"
          />
          <div className="h-4 w-px bg-[#E5E2DB]"></div>
          <h1 className="font-bold text-[#714B67] text-[12px] tracking-[-0.01em]">
            Quote Builder <span className="text-stone-400 font-normal ml-1 hidden sm:inline">/ Side-by-Side</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-[28px] text-[11px] font-semibold text-stone-600 border-[#E5E2DB] hover:bg-stone-50">
            <Share2 className="w-3.5 h-3.5 mr-1.5" />
            Share
          </Button>
          <Button size="sm" className="h-[28px] text-[11px] font-semibold bg-[#714B67] hover:bg-[#5a3c52] text-white shadow-none">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Export PDF
          </Button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-52px)]">
        {/* Left Sidebar (Configuration) */}
        <aside className="w-[340px] bg-white border-r border-[#E5E2DB] overflow-y-auto flex-shrink-0 flex flex-col custom-scrollbar relative z-0">
          <div className="p-5 flex flex-col gap-6">
            
            {/* Country / Currency */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.18em] flex items-center gap-2">
                <Globe className="w-3 h-3" />
                Region
              </label>
              <div className="flex bg-stone-100/80 p-0.5 rounded-md border border-stone-200">
                <div className="flex-1 bg-white shadow-sm rounded-[4px] py-1.5 text-center text-xs font-bold text-[#714B67]">
                  USD
                </div>
                <div className="flex-1 py-1.5 text-center text-xs font-medium text-stone-500">
                  CAD
                </div>
              </div>
            </div>

            {/* Users */}
            <div className="space-y-2.5 pt-4 border-t border-[#E5E2DB]">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.18em] flex items-center gap-2">
                <Users className="w-3 h-3" />
                Users
              </label>
              <div className="flex items-center">
                <button className="w-9 h-9 flex items-center justify-center border border-stone-200 rounded-l-md bg-stone-50 text-stone-600 hover:bg-stone-100">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 h-9 flex items-center justify-center border-y border-stone-200 font-bold text-[15px] text-stone-900 bg-white">
                  25
                </div>
                <button className="w-9 h-9 flex items-center justify-center border border-stone-200 rounded-r-md bg-stone-50 text-stone-600 hover:bg-stone-100">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Plan */}
            <div className="space-y-2.5 pt-4 border-t border-[#E5E2DB]">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.18em] flex items-center gap-2">
                <FileText className="w-3 h-3" />
                Plan
              </label>
              <div className="flex bg-stone-100/80 p-0.5 rounded-md border border-stone-200">
                <div className="flex-1 bg-white shadow-sm rounded-[4px] py-1.5 text-center text-xs font-bold text-[#714B67]">
                  Standard
                </div>
                <div className="flex-1 py-1.5 text-center text-xs font-medium text-stone-500">
                  Custom
                </div>
              </div>
            </div>

            {/* Implementation */}
            <div className="space-y-2.5 pt-4 border-t border-[#E5E2DB]">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.18em] flex items-center gap-2">
                <Database className="w-3 h-3" />
                Implementation
              </label>
              <div className="relative">
                <select className="w-full appearance-none h-9 bg-white border border-stone-200 rounded-md pl-3 pr-8 text-[13px] font-medium text-stone-800 focus:outline-none focus:border-[#714B67]">
                  <option>Basic (50h) — $7,000</option>
                  <option>Standard (100h) — $12,500</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-[10px] pointer-events-none" />
              </div>
            </div>

            {/* Odoo SH Hosting */}
            <div className="space-y-3 pt-4 border-t border-[#E5E2DB]">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.18em] flex items-center gap-2">
                  <Server className="w-3 h-3" />
                  Odoo SH Hosting
                </label>
                <Switch checked={true} className="data-[state=checked]:bg-[#017E84]" />
              </div>
              
              <div className="bg-stone-50/50 border border-stone-200 rounded-lg p-3 space-y-3">
                <div className="flex bg-stone-200/50 p-0.5 rounded-md">
                  <div className="flex-1 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] rounded-[4px] py-1 text-center text-[11px] font-bold text-[#714B67]">
                    Shared
                  </div>
                  <div className="flex-1 py-1 text-center text-[11px] font-medium text-stone-500">
                    Dedicated
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block text-center">Workers</label>
                    <div className="h-7 bg-white border border-stone-200 rounded flex items-center justify-center text-[13px] font-bold text-stone-700 shadow-sm">3</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block text-center">Storage GB</label>
                    <div className="h-7 bg-white border border-stone-200 rounded flex items-center justify-center text-[13px] font-bold text-stone-700 shadow-sm">1</div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-stone-400 uppercase tracking-widest block text-center">Staging</label>
                    <div className="h-7 bg-white border border-stone-200 rounded flex items-center justify-center text-[13px] font-bold text-stone-400 shadow-sm">0</div>
                  </div>
                </div>
                
                <div className="text-[10px] text-center text-[#714B67] bg-[#714B67]/5 py-1.5 rounded-[4px] font-semibold border border-[#714B67]/10">
                  $172.80/mo annual · $216/mo monthly
                </div>
              </div>
            </div>

            {/* Terms to Compare */}
            <div className="space-y-3 pt-4 border-t border-[#E5E2DB]">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.18em] flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                Terms to Compare
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {['Mo', '1Y', '2Y', '3Y', '4Y', '5Y'].map((t) => {
                  const isActive = ['Mo', '1Y', '3Y', '5Y'].includes(t);
                  return (
                    <div 
                      key={t}
                      className={`h-7 flex items-center justify-center text-[11px] font-bold rounded-[4px] border cursor-pointer transition-all
                        ${isActive 
                          ? 'bg-[#714B67] text-white border-[#714B67] shadow-sm' 
                          : 'bg-white text-stone-400 border-stone-200 hover:bg-stone-50'}`}
                    >
                      {t}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-[#017E84] font-semibold flex items-center gap-1.5">
                <Check className="w-3 h-3" /> 3-Year is selected for primary view
              </p>
            </div>

            {/* Discounts */}
            <div className="space-y-2.5 pt-4 border-t border-[#E5E2DB] pb-4">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.18em] flex items-center gap-2">
                <TrendingDown className="w-3 h-3" />
                Discounts (%)
              </label>
              <div className="border border-stone-200 rounded-md overflow-hidden bg-white shadow-sm">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500">
                      <th className="font-semibold text-left p-1.5 border-r border-stone-200 pl-3">Type</th>
                      <th className="font-semibold text-center p-1.5">Mo</th>
                      <th className="font-semibold text-center p-1.5">1Y</th>
                      <th className="font-bold text-center p-1.5 text-[#714B67] bg-[#714B67]/5">3Y</th>
                      <th className="font-semibold text-center p-1.5">5Y</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-stone-100">
                      <td className="font-medium text-stone-600 p-1.5 border-r border-stone-200 bg-stone-50/30 pl-3">Plan %</td>
                      <td className="text-center p-1.5 text-stone-300">—</td>
                      <td className="text-center p-1.5 text-stone-300">—</td>
                      <td className="text-center p-1.5 font-bold text-[#714B67] bg-[#714B67]/5">10</td>
                      <td className="text-center p-1.5 font-semibold text-stone-800">10</td>
                    </tr>
                    <tr>
                      <td className="font-medium text-stone-600 p-1.5 border-r border-stone-200 bg-stone-50/30 pl-3">Impl %</td>
                      <td className="text-center p-1.5 font-semibold text-stone-800">5</td>
                      <td className="text-center p-1.5 font-semibold text-stone-800">5</td>
                      <td className="text-center p-1.5 font-bold text-[#714B67] bg-[#714B67]/5">5</td>
                      <td className="text-center p-1.5 font-semibold text-stone-800">5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Panel */}
        <main className="flex-1 flex flex-col overflow-y-auto relative custom-scrollbar bg-[#FAF9F7]">
          
          {/* Sticky Summary Bar */}
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-[#E5E2DB] px-6 py-2.5 flex items-center justify-center shadow-sm">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-500 bg-stone-100/50 border border-stone-200 rounded-full px-4 py-1">
              <span className="text-stone-800 font-semibold">United States</span>
              <span className="w-1 h-1 rounded-full bg-stone-300 mx-1"></span>
              <span className="text-stone-800 font-semibold">25 users</span>
              <span className="w-1 h-1 rounded-full bg-stone-300 mx-1"></span>
              <span className="text-stone-800 font-semibold">Standard</span>
              <span className="w-1 h-1 rounded-full bg-stone-300 mx-1"></span>
              <span className="text-stone-800 font-semibold">Basic Implementation</span>
              <span className="w-1 h-1 rounded-full bg-stone-300 mx-1"></span>
              <span className="text-stone-800 font-semibold">Odoo SH Shared 3 workers</span>
            </div>
          </div>

          <div className="p-8 max-w-6xl mx-auto w-full flex flex-col pb-20">
            
            {/* Term Selector */}
            <div className="flex justify-center mb-10 mt-4">
              <div className="inline-flex bg-white p-1 rounded-full shadow-sm border border-[#E5E2DB] relative items-center">
                <button className="px-6 py-2 rounded-full text-[13px] font-semibold text-stone-500 hover:text-stone-800 transition-colors">Monthly</button>
                <button className="px-6 py-2 rounded-full text-[13px] font-semibold text-stone-500 hover:text-stone-800 transition-colors">1-Year</button>
                <button className="px-6 py-2 rounded-full text-[13px] font-bold bg-[#714B67] text-white shadow-md flex items-center gap-1.5 relative overflow-hidden">
                  3-Year 
                </button>
                <button className="px-6 py-2 rounded-full text-[13px] font-semibold text-stone-500 hover:text-stone-800 transition-colors">5-Year</button>
              </div>
            </div>

            {/* Dramatic Before/After */}
            <div className="relative mt-8">
              
              {/* Giant Savings Reveal (Center Overlay) */}
              <div className="absolute top-[80px] left-1/2 transform -translate-x-1/2 z-10 flex flex-col items-center pointer-events-none">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                  className="bg-white rounded-2xl shadow-[0_12px_40px_rgba(1,126,132,0.2)] border border-[#017E84]/30 py-4 px-8 text-center flex flex-col items-center min-w-[280px]"
                >
                  <div className="text-[#017E84] font-bold text-[11px] uppercase tracking-[0.2em] mb-1">Total Savings</div>
                  <div className="text-4xl lg:text-5xl font-extrabold text-[#017E84] tabular-nums tracking-tighter">
                    ${savingsCount.toLocaleString()}
                  </div>
                  <div className="mt-2 text-[11px] text-stone-500 font-semibold bg-stone-50 border border-stone-100 px-3 py-1 rounded-full uppercase tracking-wider">
                    vs. month-to-month
                  </div>
                </motion.div>
                
                {/* Arrow connecting the two sides */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-6 flex items-center justify-center gap-3 text-[#E5E2DB]"
                >
                  <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#E5E2DB]"></div>
                  <ArrowRight className="w-5 h-5 text-stone-300" />
                  <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#714B67]/30"></div>
                </motion.div>
              </div>

              {/* Two Columns */}
              <div className="grid grid-cols-2 gap-8 lg:gap-16 relative items-stretch">
                
                {/* LEFT: Without Commitment (Muted) */}
                <div className="bg-stone-100/70 rounded-3xl p-8 border border-stone-200 pt-10 pb-12 opacity-80 filter grayscale-[0.1] h-full flex flex-col relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-stone-50/50 to-transparent"></div>
                  <div className="relative z-10 flex-1 flex flex-col">
                    <h3 className="text-stone-500 font-bold text-center mb-10 uppercase tracking-widest text-xs h-8 flex items-center justify-center">
                      If you paid month-to-month
                    </h3>
                    
                    <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
                      <div>
                        <div className="text-stone-400 text-[11px] uppercase tracking-wider font-bold mb-1.5">Total Over 3 Years</div>
                        <div className="text-4xl font-bold text-stone-700 line-through decoration-stone-400/50 decoration-2">
                          $49,786
                        </div>
                      </div>
                      
                      <div className="pt-8 border-t border-stone-200/80 mx-12">
                        <div className="text-stone-400 text-[11px] uppercase tracking-wider font-bold mb-1.5">Monthly Payment</div>
                        <div className="text-2xl font-bold text-stone-500">
                          $1,383<span className="text-lg font-medium text-stone-400">/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: 3-Year Quote (Full Color) */}
                <div className="bg-white rounded-3xl p-8 border-2 border-[#714B67] shadow-[0_8px_30px_rgba(113,75,103,0.12)] pt-10 pb-12 relative overflow-hidden h-full flex flex-col">
                  <div className="absolute top-0 right-0 bg-[#E4A900] text-white text-[10px] font-bold px-4 py-1.5 rounded-bl-xl uppercase tracking-widest shadow-sm flex items-center gap-1 z-20">
                    Best Value
                  </div>
                  
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#714B67]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  
                  <div className="relative z-10 flex-1 flex flex-col">
                    <h3 className="text-[#714B67] font-bold text-center mb-10 uppercase tracking-widest text-xs h-8 flex items-center justify-center">
                      Your 3-Year Quote
                    </h3>
                    
                    <div className="text-center space-y-6 flex-1 flex flex-col justify-center">
                      <div>
                        <div className="text-[#714B67]/70 text-[11px] uppercase tracking-wider font-bold mb-1.5">Total Contract</div>
                        <div className="text-5xl font-extrabold text-[#714B67] tracking-tight">
                          $36,720<span className="text-3xl text-[#714B67]/60">.08</span>
                        </div>
                      </div>
                      
                      <div className="pt-8 border-t border-[#714B67]/10 mx-12">
                        <div className="text-[#714B67]/70 text-[11px] uppercase tracking-wider font-bold mb-1.5">Amortized Cost</div>
                        <div className="text-3xl font-bold text-stone-900">
                          $1,020<span className="text-xl font-semibold text-stone-400">/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown Strip */}
            <div className="mt-14 bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch overflow-hidden divide-y md:divide-y-0 md:divide-x divide-stone-100">
              <div className="flex-1 flex flex-col p-5 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-stone-400" /> Software
                  </div>
                  <div className="text-lg font-bold text-stone-800">$24,264</div>
                </div>
                <div className="space-y-1.5 mt-auto pt-3 border-t border-stone-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Yr-1 Promo</span>
                    <span className="font-semibold text-[#017E84]">-$1,860</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Multi-year discount</span>
                    <span className="font-semibold text-[#017E84]">-$1,866</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col p-5 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-stone-400" /> Implementation
                  </div>
                  <div className="text-lg font-bold text-stone-800">$6,650</div>
                </div>
                <div className="space-y-1.5 mt-auto pt-3 border-t border-stone-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Partner discount</span>
                    <span className="font-semibold text-[#017E84]">-$350</span>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 flex flex-col p-5 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-stone-400" /> Hosting
                  </div>
                  <div className="text-lg font-bold text-stone-800">$5,806.08</div>
                </div>
                <div className="space-y-1.5 mt-auto pt-3 border-t border-stone-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500">Multi-year discount</span>
                    <span className="font-semibold text-[#017E84]">-$414.72</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Catalyst Finance Banner */}
            <div className="mt-8 bg-gradient-to-r from-[#714B67] to-[#5a3c52] rounded-xl text-white p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
              
              <div className="flex items-center gap-5 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-[17px] mb-0.5">Prefer to spread it out?</h4>
                  <p className="text-white/80 text-[13px] font-medium">Finance your contract with Catalyst Finance</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 relative z-10 bg-black/20 px-6 py-4 rounded-xl border border-white/10 w-full md:w-auto">
                <div className="text-right flex-1 md:flex-none">
                  <div className="text-[10px] text-white/70 font-bold uppercase tracking-widest mb-0.5">As low as</div>
                  <div className="text-2xl font-bold tracking-tight">$1,117<span className="text-sm text-white/60 font-medium">/mo</span></div>
                </div>
                <div className="h-10 w-px bg-white/20 hidden md:block"></div>
                <Button className="bg-white text-[#714B67] hover:bg-stone-100 font-bold text-[13px] shadow-sm hidden md:flex h-9 px-5">
                  Apply Now
                </Button>
              </div>
            </div>

            {/* See All Terms Mini-Table */}
            <div className="mt-16 flex flex-col items-center">
              <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <span className="h-px w-10 bg-[#E5E2DB]"></span>
                Compare All Terms
                <span className="h-px w-10 bg-[#E5E2DB]"></span>
              </h4>
              
              <div className="bg-white border border-[#E5E2DB] rounded-xl overflow-hidden shadow-sm w-full max-w-4xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-stone-50/80 border-b border-[#E5E2DB]">
                      <th className="text-left font-bold text-stone-500 p-4 text-xs uppercase tracking-wider">Term</th>
                      <th className="text-right font-bold text-stone-500 p-4 text-xs uppercase tracking-wider">Total Contract</th>
                      <th className="text-right font-bold text-stone-500 p-4 text-xs uppercase tracking-wider">Amortized Monthly</th>
                      <th className="text-right font-bold text-[#017E84] p-4 text-xs uppercase tracking-wider">Total Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E2DB]">
                    <tr className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4 font-semibold text-stone-700">Monthly <span className="text-stone-400 font-normal ml-1">(Pay as you go)</span></td>
                      <td className="p-4 text-right text-stone-600 font-medium">$7,993.50</td>
                      <td className="p-4 text-right text-stone-600 font-medium">$7,994/mo</td>
                      <td className="p-4 text-right text-stone-400 font-medium">—</td>
                    </tr>
                    <tr className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4 font-semibold text-stone-700">1-Year</td>
                      <td className="p-4 text-right text-stone-600 font-medium">$16,193.60</td>
                      <td className="p-4 text-right text-stone-600 font-medium">$1,349/mo</td>
                      <td className="p-4 text-right text-stone-400 font-medium">$0</td>
                    </tr>
                    <tr className="bg-[#714B67]/[0.03] border-l-4 border-l-[#714B67] hover:bg-[#714B67]/[0.05] transition-colors relative">
                      <td className="p-4 font-bold text-[#714B67] flex items-center gap-2">
                        3-Year 
                        <Badge className="bg-[#714B67] hover:bg-[#714B67] text-white text-[9px] px-1.5 py-0 rounded-sm font-bold tracking-wider">BEST VALUE</Badge>
                      </td>
                      <td className="p-4 text-right text-[#714B67] font-bold">$36,720.08</td>
                      <td className="p-4 text-right text-[#714B67] font-bold">$1,020/mo</td>
                      <td className="p-4 text-right text-[#017E84] font-bold">$13,066</td>
                    </tr>
                    <tr className="hover:bg-stone-50/50 transition-colors">
                      <td className="p-4 font-semibold text-stone-700">5-Year</td>
                      <td className="p-4 text-right text-stone-600 font-medium">$57,246.56</td>
                      <td className="p-4 text-right text-stone-600 font-medium">$954/mo</td>
                      <td className="p-4 text-right text-[#017E84] font-semibold">$20,476</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
