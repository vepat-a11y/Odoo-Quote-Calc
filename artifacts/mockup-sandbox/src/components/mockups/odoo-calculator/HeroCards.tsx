import React from 'react';
import { motion } from 'framer-motion';
import { Check, Info, ShieldCheck, ChevronRight, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function HeroCards() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F3EF] font-sans text-stone-900 pb-20 selection:bg-[#714B67] selection:text-white">
      {/* Navbar */}
      <header className="px-6 py-4 bg-white border-b border-stone-200 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/__mockup/images/odoo-brand/odoo_logo.png" alt="Odoo" className="h-6" />
          <div className="w-px h-5 bg-stone-300"></div>
          <span className="font-semibold text-stone-600 text-sm tracking-tight">Enterprise Quote</span>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="text-[#714B67] border-[#714B67] hover:bg-[#714B67]/5">Share</Button>
          <Button className="bg-[#714B67] hover:bg-[#5b3c53] text-white">Approve Quote</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Configuration Summary */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 mb-4">Choose your term</h1>
          <div className="inline-flex flex-wrap justify-center items-center gap-2 text-sm text-stone-600 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm">
            <span className="font-medium text-stone-900">United States</span>
            <span className="text-stone-300">•</span>
            <span>Standard, 25 users</span>
            <span className="text-stone-300">•</span>
            <span>Basic Implementation</span>
            <span className="text-stone-300">•</span>
            <span>Odoo SH Shared (3 workers)</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Monthly Card */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col relative h-full">
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-lg font-medium text-stone-500 mb-2">Monthly</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold tracking-tight text-stone-900">$7,994</span>
                <span className="text-stone-500 font-medium">/mo</span>
              </div>
              <div className="h-7 mb-6"></div> {/* Spacer for save pill */}

              <div className="space-y-4 mb-8 flex-grow">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">Software License</span>
                    <span className="font-semibold">$777.50</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">Implementation</span>
                    <span className="font-semibold">$6,650.00</span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">SH Hosting</span>
                    <span className="font-semibold">$216.00</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 mt-auto">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-stone-500 text-sm">Total Contract</span>
                  <span className="font-bold text-lg text-stone-900">$7,993.50</span>
                </div>
                <div className="text-xs text-stone-400 text-right">1 month only</div>
                <div className="h-10 mt-3"></div> {/* Spacer for finance line */}
                <Button className="w-full mt-4 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50" variant="outline">Select Monthly</Button>
              </div>
            </div>
          </motion.div>

          {/* 1-Year Card */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col relative h-full">
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-lg font-medium text-[#714B67] mb-2">1-Year</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold tracking-tight text-stone-900">$1,349</span>
                <span className="text-stone-500 font-medium">/mo</span>
              </div>
              <div className="h-7 mb-6"></div> {/* Spacer for save pill */}

              <div className="space-y-4 mb-8 flex-grow">
                <div className="pb-3 border-b border-stone-50 border-dashed">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">Software License</span>
                    <span className="font-semibold">$7,470.00</span>
                  </div>
                  <div className="text-xs text-[#017E84] flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3" /> Includes $1,860 yr-1 promo savings
                  </div>
                </div>
                <div className="pb-3 border-b border-stone-50 border-dashed">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">Implementation</span>
                    <span className="font-semibold">$6,650.00</span>
                  </div>
                  <div className="text-xs text-[#017E84] flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3" /> Saved $350
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">SH Hosting</span>
                    <span className="font-semibold">$2,073.60</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 mt-auto">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-stone-500 text-sm">Total Contract</span>
                  <span className="font-bold text-lg text-stone-900">$16,193.60</span>
                </div>
                <div className="text-xs text-stone-400 text-right">Billed annually</div>
                <div className="h-10 mt-3"></div> {/* Spacer for finance line */}
                <Button className="w-full mt-4 bg-white border border-stone-300 text-stone-700 hover:bg-stone-50" variant="outline">Select 1-Year</Button>
              </div>
            </div>
          </motion.div>

          {/* 3-Year Card - BEST VALUE */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl border-2 border-[#714B67] shadow-xl overflow-hidden flex flex-col relative transform md:-translate-y-2 z-10 h-[calc(100%+16px)]">
            <div className="bg-[#714B67] text-white text-center py-1.5 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1">
              <Zap className="w-3 h-3 fill-current" /> Best Value
            </div>
            <div className="p-6 flex-grow flex flex-col bg-gradient-to-b from-[#714B67]/5 to-white">
              <h3 className="text-lg font-semibold text-[#714B67] mb-2">3-Year</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-5xl font-extrabold tracking-tight text-stone-900">$1,020</span>
                <span className="text-stone-500 font-medium">/mo</span>
              </div>
              <div className="mb-6 inline-flex items-center gap-1.5 bg-[#017E84]/10 text-[#017E84] px-2.5 py-1 rounded-full text-xs font-bold h-7">
                Save $13,066 total
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="pb-3 border-b border-stone-100 border-dashed">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-700 font-medium">Software License</span>
                    <span className="font-bold text-stone-900">$24,264.00</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-stone-500 line-through decoration-stone-300">$27,990 list</span>
                    <span className="text-[#017E84] font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Saved $3,726
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-400 mt-1 pl-4 border-l-2 border-stone-100">
                    $1,860 yr-1 promo + $1,866 multi-year discount
                  </div>
                </div>
                <div className="pb-3 border-b border-stone-100 border-dashed">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-700 font-medium">Implementation</span>
                    <span className="font-bold text-stone-900">$6,650.00</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-stone-500 line-through decoration-stone-300">$7,000 list</span>
                    <span className="text-[#017E84] font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Saved $350
                    </span>
                  </div>
                </div>
                <div className="pb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-700 font-medium">SH Hosting</span>
                    <span className="font-bold text-stone-900">$5,806.08</span>
                  </div>
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-stone-500 line-through decoration-stone-300">$6,220 list</span>
                    <span className="text-[#017E84] font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Saved $414.72
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 mt-auto">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <div className="text-stone-500 text-xs font-medium mb-1">Total Contract</div>
                    <div className="text-xs text-stone-400">Billed annually</div>
                  </div>
                  <div className="font-bold text-xl text-stone-900">$36,720.08</div>
                </div>
                
                <div className="bg-stone-50 rounded-lg p-2.5 mb-4 border border-stone-100 flex justify-between items-center h-10">
                  <span className="text-xs font-medium text-stone-600">With Catalyst Finance</span>
                  <span className="text-xs font-bold text-[#017E84]">As low as $1,117/mo</span>
                </div>

                <Button className="w-full bg-[#714B67] hover:bg-[#5b3c53] text-white shadow-md shadow-[#714B67]/20 transition-all h-11 text-base font-semibold">
                  Select 3-Year
                </Button>
                <div className="mt-4 flex justify-center">
                  <img src="/__mockup/images/odoo-brand/odoo_gold_partner.png" alt="Odoo Gold Partner" className="h-6 opacity-90 mix-blend-multiply" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 5-Year Card */}
          <motion.div variants={cardVariants} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col relative h-full">
            <div className="p-6 flex-grow flex flex-col">
              <h3 className="text-lg font-medium text-[#714B67] mb-2">5-Year</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold tracking-tight text-stone-900">$954</span>
                <span className="text-stone-500 font-medium">/mo</span>
              </div>
              <div className="mb-6 inline-flex items-center gap-1.5 bg-[#017E84]/5 text-[#017E84] px-2.5 py-1 rounded-full text-xs font-bold h-7">
                Save $20,476 total
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="pb-3 border-b border-stone-50 border-dashed">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">Software License</span>
                    <span className="font-semibold">$41,058.00</span>
                  </div>
                  <div className="text-xs text-[#017E84] flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3" /> Saved $5,592
                  </div>
                </div>
                <div className="pb-3 border-b border-stone-50 border-dashed">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">Implementation</span>
                    <span className="font-semibold">$6,650.00</span>
                  </div>
                  <div className="text-xs text-[#017E84] flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3" /> Saved $350
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-600">SH Hosting</span>
                    <span className="font-semibold">$9,538.56</span>
                  </div>
                  <div className="text-xs text-[#017E84] flex items-center gap-1 mt-1">
                    <Check className="w-3 h-3" /> Saved $829.44
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 mt-auto">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-stone-500 text-sm">Total Contract</span>
                  <span className="font-bold text-lg text-stone-900">$57,246.56</span>
                </div>
                <div className="text-xs text-stone-400 text-right mb-3">Billed annually</div>
                
                <div className="bg-stone-50 rounded-lg p-2.5 mb-4 border border-stone-100 flex justify-between items-center h-10">
                  <span className="text-xs font-medium text-stone-600">With Finance</span>
                  <span className="text-xs font-bold text-[#017E84]">$1,107/mo</span>
                </div>

                <Button className="w-full bg-white border border-[#714B67] text-[#714B67] hover:bg-[#714B67]/5" variant="outline">Select 5-Year</Button>
              </div>
            </div>
          </motion.div>

        </motion.div>
        
        {/* Footer note */}
        <div className="mt-12 text-center text-sm text-stone-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#017E84]" />
          This is an estimate. Final pricing subject to formal agreement and financing approval.
        </div>
      </main>
    </div>
  );
}
