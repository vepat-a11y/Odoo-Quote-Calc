import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, ChevronRight, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Investment() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen w-full bg-[#FAFAF7] font-sans text-[#333333] selection:bg-[#714B67] selection:text-white pb-24">
      {/* Top rule */}
      <div className="h-1.5 w-full bg-[#714B67]" />

      <div className="mx-auto max-w-5xl px-8 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Header */}
          <header className="flex justify-between items-start mb-20 border-b border-[#E5E5E5] pb-12">
            <div>
              <img
                src="/__mockup/images/odoo-brand/odoo_logo.png"
                alt="Odoo Logo"
                className="h-[32px] mb-8"
              />
              <h1 className="text-3xl font-medium tracking-tight text-[#1A1A1A]">
                Investment Proposal
              </h1>
              <p className="text-[#8F8F8F] mt-2 font-mono text-sm tracking-wide uppercase">
                Odoo Enterprise Deployment
              </p>
            </div>
            <div className="text-right text-sm">
              <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-left">
                <span className="text-[#8F8F8F] uppercase text-xs font-semibold tracking-wider">Date</span>
                <span className="font-medium text-[#1A1A1A] tabular-nums">{currentDate}</span>
                
                <span className="text-[#8F8F8F] uppercase text-xs font-semibold tracking-wider">Prepared For</span>
                <span className="font-medium text-[#1A1A1A]">Acme Corporation</span>
                
                <span className="text-[#8F8F8F] uppercase text-xs font-semibold tracking-wider">Prepared By</span>
                <span className="font-medium text-[#1A1A1A]">Odoo Advisors</span>
                
                <span className="text-[#8F8F8F] uppercase text-xs font-semibold tracking-wider">Configuration</span>
                <span className="font-medium text-[#1A1A1A]">Standard Plan · 25 Users</span>
              </div>
            </div>
          </header>

          <main className="space-y-16">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 pb-4 border-b-2 border-[#1A1A1A] text-sm uppercase tracking-wider font-semibold text-[#8F8F8F]">
              <div>Cost Components</div>
              <div className="text-right">Monthly</div>
              <div className="text-right">1-Year</div>
              <div className="text-right relative">
                <div className="absolute -top-7 -right-2 bg-[#714B67] text-white text-[10px] px-2 py-0.5 rounded-sm tracking-widest uppercase font-bold whitespace-nowrap">
                  Best Value
                </div>
                <span className="text-[#714B67]">3-Year</span>
              </div>
              <div className="text-right">5-Year</div>
            </div>

            {/* Software License */}
            <div className="space-y-3 border-b border-[#E5E5E5] pb-8">
              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4">
                <div className="font-medium text-lg text-[#1A1A1A]">Software License</div>
                <div className="col-start-2 col-end-6"></div>
              </div>
              
              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 text-sm tabular-nums">
                <div className="text-[#666666] pl-4">List Price</div>
                <div className="text-right text-[#666666]">$777.50</div>
                <div className="text-right text-[#666666]">$7,470.00</div>
                <div className="text-right text-[#666666]">$27,990.00</div>
                <div className="text-right text-[#666666]">$46,650.00</div>
              </div>

              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 text-sm tabular-nums">
                <div className="text-[#666666] pl-4">Year-1 Promo Savings</div>
                <div className="text-right text-[#666666]">—</div>
                <div className="text-right text-teal-700">–$1,860.00</div>
                <div className="text-right text-teal-700">–$1,860.00</div>
                <div className="text-right text-teal-700">–$1,860.00</div>
              </div>

              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 text-sm tabular-nums">
                <div className="text-[#666666] pl-4">Multi-Year Discount</div>
                <div className="text-right text-[#666666]">—</div>
                <div className="text-right text-[#666666]">—</div>
                <div className="text-right text-teal-700">–$1,866.00</div>
                <div className="text-right text-teal-700">–$3,732.00</div>
              </div>

              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 pt-3 font-medium tabular-nums border-t border-dashed border-[#CCCCCC]">
                <div className="text-[#1A1A1A] pl-4">License Subtotal</div>
                <div className="text-right text-[#1A1A1A]">$777.50</div>
                <div className="text-right text-[#1A1A1A]">$5,610.00</div>
                <div className="text-right text-[#1A1A1A]">$24,264.00</div>
                <div className="text-right text-[#1A1A1A]">$41,058.00</div>
              </div>
            </div>

            {/* Implementation */}
            <div className="space-y-3 border-b border-[#E5E5E5] pb-8">
              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4">
                <div className="font-medium text-lg text-[#1A1A1A]">Implementation <span className="text-sm font-normal text-[#8F8F8F] ml-2">(One-time, Basic 50h)</span></div>
                <div className="col-start-2 col-end-6"></div>
              </div>
              
              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 text-sm tabular-nums">
                <div className="text-[#666666] pl-4">List Price</div>
                <div className="text-right text-[#666666]">$7,000.00</div>
                <div className="text-right text-[#666666]">$7,000.00</div>
                <div className="text-right text-[#666666]">$7,000.00</div>
                <div className="text-right text-[#666666]">$7,000.00</div>
              </div>

              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 text-sm tabular-nums">
                <div className="text-[#666666] pl-4">Partner Discount</div>
                <div className="text-right text-teal-700">–$350.00</div>
                <div className="text-right text-teal-700">–$350.00</div>
                <div className="text-right text-teal-700">–$350.00</div>
                <div className="text-right text-teal-700">–$350.00</div>
              </div>

              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 pt-3 font-medium tabular-nums border-t border-dashed border-[#CCCCCC]">
                <div className="text-[#1A1A1A] pl-4">Implementation Subtotal</div>
                <div className="text-right text-[#1A1A1A]">$6,650.00</div>
                <div className="text-right text-[#1A1A1A]">$6,650.00</div>
                <div className="text-right text-[#1A1A1A]">$6,650.00</div>
                <div className="text-right text-[#1A1A1A]">$6,650.00</div>
              </div>
            </div>

            {/* Hosting */}
            <div className="space-y-3 pb-4">
              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4">
                <div className="font-medium text-lg text-[#1A1A1A]">Odoo SH Hosting <span className="text-sm font-normal text-[#8F8F8F] ml-2">(Shared · 3 Workers)</span></div>
                <div className="col-start-2 col-end-6"></div>
              </div>
              
              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 text-sm tabular-nums">
                <div className="text-[#666666] pl-4">List Price</div>
                <div className="text-right text-[#666666]">$216.00</div>
                <div className="text-right text-[#666666]">$2,073.60</div>
                <div className="text-right text-[#666666]">$6,220.80</div>
                <div className="text-right text-[#666666]">$10,368.00</div>
              </div>

              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 text-sm tabular-nums">
                <div className="text-[#666666] pl-4">Multi-Year Discount</div>
                <div className="text-right text-[#666666]">—</div>
                <div className="text-right text-[#666666]">—</div>
                <div className="text-right text-teal-700">–$414.72</div>
                <div className="text-right text-teal-700">–$829.44</div>
              </div>

              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 pt-3 font-medium tabular-nums border-t border-dashed border-[#CCCCCC]">
                <div className="text-[#1A1A1A] pl-4">Hosting Subtotal</div>
                <div className="text-right text-[#1A1A1A]">$216.00</div>
                <div className="text-right text-[#1A1A1A]">$2,073.60</div>
                <div className="text-right text-[#1A1A1A]">$5,806.08</div>
                <div className="text-right text-[#1A1A1A]">$9,538.56</div>
              </div>
            </div>

            {/* Total Section */}
            <div className="mt-8 pt-8 border-t-2 border-[#1A1A1A]">
              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 items-center">
                <div className="font-semibold text-xl text-[#1A1A1A]">Total Investment</div>
                <div className="text-right font-medium text-lg tabular-nums text-[#666666]">$7,993.50</div>
                <div className="text-right font-medium text-lg tabular-nums text-[#666666]">$16,193.60</div>
                <div className="text-right font-semibold text-2xl tabular-nums text-[#714B67]">$36,720.08</div>
                <div className="text-right font-medium text-lg tabular-nums text-[#666666]">$57,246.56</div>
              </div>

              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 items-center mt-6">
                <div className="text-sm font-medium text-[#8F8F8F] uppercase tracking-wider">Monthly Amortized Equivalent</div>
                <div className="text-right text-sm tabular-nums text-[#8F8F8F]">$7,994/mo</div>
                <div className="text-right text-sm tabular-nums text-[#8F8F8F]">$1,349/mo</div>
                <div className="text-right font-medium text-base tabular-nums text-[#714B67]">$1,020/mo</div>
                <div className="text-right text-sm tabular-nums text-[#8F8F8F]">$954/mo</div>
              </div>

              <div className="grid grid-cols-[1fr_140px_140px_140px_140px] gap-4 items-center mt-6 py-4 bg-[#F2F8F5] rounded-md -mx-4 px-4 border border-[#D1E7DD]">
                <div className="text-sm font-bold text-teal-800 uppercase tracking-wider">Savings vs Monthly Run-Rate</div>
                <div className="text-right text-sm tabular-nums text-teal-800 font-medium">—</div>
                <div className="text-right text-sm tabular-nums text-teal-800 font-medium">$0</div>
                <div className="text-right text-base tabular-nums text-teal-800 font-bold">$13,066</div>
                <div className="text-right text-sm tabular-nums text-teal-800 font-medium">$20,476</div>
              </div>
            </div>

            {/* Recommendation & Financing */}
            <div className="grid grid-cols-2 gap-12 pt-16 border-t border-[#E5E5E5] mt-16">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-4">Recommendation</h3>
                <div className="p-6 bg-white border border-[#E5E5E5] rounded-sm shadow-sm relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#714B67]" />
                  <p className="text-[#333333] leading-relaxed text-sm">
                    We recommend the <strong className="text-[#714B67]">3-Year Term</strong>. It provides the optimal balance of commitment and cost efficiency, locking in your licensing and hosting rates while securing <strong className="text-teal-700">$13,066 in hard savings</strong> over the contract life.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#1A1A1A] mb-4">Financing Options</h3>
                <div className="p-6 bg-[#F4F8FA] border border-[#E0EDF2] rounded-sm shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-[#017E84]">Catalyst Finance</span>
                    <span className="text-xs text-[#666666] font-mono">6% – 13% APR</span>
                  </div>
                  <p className="text-sm text-[#4A5A60] mb-4">Preserve working capital by financing the 3-Year contract.</p>
                  
                  <div className="flex items-end gap-3 border-t border-[#E0EDF2] pt-4">
                    <span className="text-[#333333] text-sm uppercase tracking-wide font-medium">As low as</span>
                    <span className="text-2xl font-semibold tabular-nums text-[#017E84]">$1,117</span>
                    <span className="text-[#666666] text-sm pb-1">/mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign-off */}
            <div className="pt-24 pb-12 flex justify-between items-end">
              <div className="w-80">
                <div className="border-b border-[#1A1A1A] mb-3 h-12" />
                <div className="text-sm text-[#8F8F8F] font-medium uppercase tracking-wider">Authorized Signature</div>
              </div>
              <Button className="bg-[#714B67] hover:bg-[#5A3C52] text-white px-8 py-6 text-base rounded-sm tracking-wide">
                Authorize Investment
              </Button>
            </div>
          </main>
        </motion.div>
      </div>
    </div>
  );
}
