import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Check, Info, ShieldCheck, ArrowRight, Zap, TrendingDown, ArrowDownToLine, Clock, HelpCircle, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

// --- Animated Number Component ---
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number, prefix?: string, suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    let startTime: number;
    const duration = 1500;
    
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      // easeOutExpo
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(ease * value));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString('en-US')}{suffix}</span>;
}

export function SideBySide() {
  const [selectedTerm, setSelectedTerm] = useState('3-Year');
  
  const terms = ['Monthly', '1-Year', '3-Year', '5-Year'];

  return (
    <div className="min-h-screen font-sans text-[#1A1A1A] bg-[#FAFAF7] overflow-x-hidden selection:bg-[#714B67] selection:text-white pb-24">
      {/* Header / Nav */}
      <header className="px-6 py-5 border-b border-[#E5E2DB] bg-white flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/__mockup/images/odoo-brand/odoo_logo.png" alt="Odoo" className="h-6" />
          <div className="h-4 w-[1px] bg-[#E5E2DB]" />
          <span className="text-[13px] font-medium tracking-tight text-[#8F8F8F]">Quote Presentation</span>
        </div>
        <div className="flex items-center gap-3 text-[13px]">
          <span className="text-[#8F8F8F] hidden md:inline-flex">United States · Standard Plan (25 users)</span>
          <img src="/__mockup/images/odoo-brand/odoo_gold_partner.png" alt="Gold Partner" className="h-6 ml-4" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        
        {/* Term Selector */}
        <div className="flex flex-col items-center mb-16">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[#1A1A1A] mb-8 text-center">
            Choose your commitment term
          </h1>
          
          <div className="inline-flex p-1.5 bg-white border border-[#E5E2DB] rounded-full shadow-sm relative">
            {terms.map((term) => (
              <button
                key={term}
                onClick={() => setSelectedTerm(term)}
                className={`relative px-6 py-2.5 text-sm font-medium rounded-full transition-colors duration-200 z-10 ${
                  selectedTerm === term ? 'text-white' : 'text-[#5C5A55] hover:text-[#1A1A1A]'
                }`}
              >
                {selectedTerm === term && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-[#714B67] rounded-full shadow-md"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {term}
                {term === '3-Year' && (
                  <span className={`ml-2 text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-sm ${
                    selectedTerm === term ? 'bg-white/20 text-white' : 'bg-[#017E84]/10 text-[#017E84]'
                  }`}>
                    Best Value
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* The Dramatic Contrast */}
        <div className="relative mb-16">
          
          {/* Giant Savings Reveal Center Badge */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="bg-white rounded-full p-2 shadow-2xl border border-[#E5E2DB]"
            >
              <div className="bg-[#017E84] text-white rounded-full h-32 w-32 flex flex-col items-center justify-center border-4 border-white shadow-inner">
                <span className="text-[11px] uppercase tracking-widest font-bold opacity-80 mb-1">You Save</span>
                <span className="text-2xl font-bold tracking-tight">
                  $<AnimatedNumber value={13066} />
                </span>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-0 relative">
            
            {/* LEFT: Without Commitment */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white md:rounded-l-3xl rounded-3xl md:rounded-r-none border border-[#E5E2DB] md:border-r-0 p-8 md:p-12 relative overflow-hidden group grayscale-[40%] hover:grayscale-0 transition-all duration-500 opacity-90"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Clock className="w-48 h-48" />
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 text-[#8F8F8F] font-medium text-sm mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#8F8F8F]" />
                  Month-to-Month
                </div>
                <h2 className="text-2xl font-medium text-[#5C5A55] mb-2">If you paid monthly for 3 years</h2>
                <p className="text-[#8F8F8F] mb-12 text-sm leading-relaxed max-w-[280px]">
                  Without a contract, you pay full list price and miss out on long-term promotional rates.
                </p>

                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-medium text-[#8F8F8F] mb-1">Total Estimated Cost (3 Yrs)</div>
                    <div className="text-4xl font-semibold text-[#5C5A55] strike-through relative inline-block">
                      $49,786
                      <div className="absolute top-1/2 left-0 w-full h-[2px] bg-[#5C5A55]/30 -rotate-2" />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#8F8F8F] mb-1">Average Per Month</div>
                    <div className="text-2xl font-medium text-[#5C5A55]">$1,383 <span className="text-sm text-[#8F8F8F] font-normal">/mo</span></div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* RIGHT: Your Quote */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl border-2 border-[#714B67] p-8 md:p-12 shadow-[0_20px_60px_-15px_rgba(113,75,103,0.2)] relative overflow-hidden z-10"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#714B67]/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 text-[#714B67] font-bold text-sm mb-4 tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-[#714B67] animate-pulse" />
                  Your 3-Year Quote
                </div>
                <h2 className="text-3xl font-semibold text-[#1A1A1A] mb-2 tracking-tight">Locked in savings.</h2>
                <p className="text-[#5C5A55] mb-12 text-sm leading-relaxed max-w-[280px]">
                  Secure promotional rates and multi-year discounts by committing to your success with Odoo.
                </p>

                <div className="space-y-6">
                  <div>
                    <div className="text-sm font-medium text-[#5C5A55] mb-1">Total Contract (3 Yrs)</div>
                    <div className="text-5xl font-bold text-[#1A1A1A] tracking-tight">
                      $36,720
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#5C5A55] mb-1">Average Per Month</div>
                    <div className="text-3xl font-semibold text-[#714B67]">$1,020 <span className="text-base text-[#5C5A55] font-normal">/mo</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Savings Breakdown Strip */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-[#E5E2DB] rounded-2xl p-6 md:p-8 mb-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#1A1A1A]">Where your savings come from</h3>
            <div className="text-[#017E84] font-semibold text-lg flex items-center gap-2 bg-[#017E84]/5 px-3 py-1 rounded-lg">
              <TrendingDown className="w-5 h-5" />
              $13,066 Total Saved
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#E5E2DB]">
            <div className="md:pr-6 pt-4 md:pt-0">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-[#1A1A1A]">Software License</div>
                <div className="text-[#017E84] font-semibold">-$3,726</div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-[#5C5A55]">
                  <span>Yr-1 promo savings</span>
                  <span>-$1,860</span>
                </div>
                <div className="flex justify-between text-sm text-[#5C5A55]">
                  <span>Multi-year discount</span>
                  <span>-$1,866</span>
                </div>
              </div>
            </div>

            <div className="md:px-6 pt-4 md:pt-0">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-[#1A1A1A]">Implementation</div>
                <div className="text-[#017E84] font-semibold">-$350</div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-[#5C5A55]">
                  <span>Partner discount</span>
                  <span>-$350</span>
                </div>
              </div>
            </div>

            <div className="md:pl-6 pt-4 md:pt-0">
              <div className="flex justify-between items-start mb-2">
                <div className="font-medium text-[#1A1A1A]">Odoo SH Hosting</div>
                <div className="text-[#017E84] font-semibold">-$414.72</div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm text-[#5C5A55]">
                  <span>Multi-year discount</span>
                  <span>-$414.72</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Finance Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-[#714B67] to-[#4A2D42] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg mb-16 text-white"
        >
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-1">Prefer to pay monthly?</h4>
              <p className="text-white/80 text-sm max-w-md">
                Finance your 3-year contract through Catalyst and lock in your savings while preserving cash flow.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end md:items-end w-full md:w-auto">
            <div className="text-white/80 text-sm font-medium mb-1">As low as</div>
            <div className="text-3xl font-bold mb-4 tracking-tight">$1,117 <span className="text-lg font-normal text-white/70">/mo</span></div>
            <button className="bg-white text-[#714B67] px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#F4F3EF] transition-colors flex items-center gap-2 w-full md:w-auto justify-center">
              Apply for Financing
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Small "See all terms" Table */}
        <div className="max-w-4xl mx-auto">
          <h4 className="text-sm font-bold text-[#8F8F8F] uppercase tracking-wider mb-6 text-center">Compare All Terms</h4>
          <div className="bg-white rounded-xl border border-[#E5E2DB] overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#FAFAF7] border-b border-[#E5E2DB]">
                <tr>
                  <th className="px-6 py-4 text-left font-medium text-[#5C5A55]">Term</th>
                  <th className="px-6 py-4 text-right font-medium text-[#5C5A55]">Total Contract</th>
                  <th className="px-6 py-4 text-right font-medium text-[#5C5A55]">Avg. Per Month</th>
                  <th className="px-6 py-4 text-right font-medium text-[#5C5A55]">Total Savings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2DB]">
                <tr className="group hover:bg-[#FAFAF7] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#1A1A1A]">Monthly</td>
                  <td className="px-6 py-4 text-right text-[#5C5A55]">$7,993.50<span className="text-[#8F8F8F] ml-1 block text-xs">(1 mo)</span></td>
                  <td className="px-6 py-4 text-right text-[#1A1A1A] font-medium">$7,994/mo</td>
                  <td className="px-6 py-4 text-right text-[#8F8F8F]">—</td>
                </tr>
                <tr className="group hover:bg-[#FAFAF7] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#1A1A1A]">1-Year</td>
                  <td className="px-6 py-4 text-right text-[#5C5A55]">$16,193.60</td>
                  <td className="px-6 py-4 text-right text-[#1A1A1A] font-medium">$1,349/mo</td>
                  <td className="px-6 py-4 text-right text-[#8F8F8F]">—</td>
                </tr>
                <tr className="bg-[#714B67]/5 border-l-4 border-l-[#714B67] group hover:bg-[#714B67]/10 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#714B67] flex items-center gap-2">
                    3-Year <Badge className="bg-[#714B67] hover:bg-[#714B67] text-white text-[10px] px-1.5 py-0">BEST VALUE</Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-[#714B67]">$36,720.08</td>
                  <td className="px-6 py-4 text-right font-bold text-[#714B67]">$1,020/mo</td>
                  <td className="px-6 py-4 text-right font-semibold text-[#017E84]">$13,066</td>
                </tr>
                <tr className="group hover:bg-[#FAFAF7] transition-colors">
                  <td className="px-6 py-4 font-medium text-[#1A1A1A]">5-Year</td>
                  <td className="px-6 py-4 text-right text-[#5C5A55]">$57,246.56</td>
                  <td className="px-6 py-4 text-right text-[#1A1A1A] font-medium">$954/mo</td>
                  <td className="px-6 py-4 text-right font-medium text-[#017E84]">$20,476</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
