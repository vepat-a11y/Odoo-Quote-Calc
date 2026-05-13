import React from "react";
import { Download, CheckCircle, ChevronDown, Users, Server, Globe, CreditCard, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export function InvestmentCompact() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAF7] text-stone-900 selection:bg-[#714B67] selection:text-white pb-0">
      {/* TOP BAR */}
      <header className="flex-shrink-0 h-14 bg-white border-b border-stone-200 px-6 flex items-center justify-between z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src="/__mockup/images/odoo-brand/odoo_logo.png"
            alt="Odoo"
            className="h-5"
          />
          <div className="w-px h-5 bg-stone-200"></div>
          <span className="font-medium text-stone-600 tracking-wide text-xs uppercase">
            Investment Proposal
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-[#714B67] border-[#714B67] hover:bg-[#714B67] hover:text-white transition-colors h-8 text-xs"
        >
          <Download className="w-3.5 h-3.5 mr-2" />
          Export PDF
        </Button>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-56px)]">
        {/* LEFT SIDEBAR */}
        <aside className="w-[340px] bg-white border-r border-stone-200 overflow-y-auto flex-shrink-0 flex flex-col z-10 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
          <div className="p-6">
            <h2 className="text-xs font-bold tracking-[0.2em] text-stone-400 uppercase mb-6">
              Configuration Sheet
            </h2>

            <div className="flex flex-col gap-0">
              {/* 1. Country / Currency */}
              <div className="py-4 border-b border-stone-100">
                <label className="block text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-3">
                  Country / Currency
                </label>
                <div className="flex p-1 bg-stone-100 rounded-md">
                  <button className="flex-1 py-1.5 text-xs font-semibold bg-white rounded shadow-sm text-stone-800">
                    USD
                  </button>
                  <button className="flex-1 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-800">
                    CAD
                  </button>
                </div>
              </div>

              {/* 2. Users */}
              <div className="py-4 border-b border-stone-100">
                <label className="block text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-3">
                  Users
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    defaultValue={25}
                    className="pl-9 bg-stone-50 border-stone-200 focus-visible:ring-[#714B67]"
                  />
                  <Users className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* 3. Plan */}
              <div className="py-4 border-b border-stone-100">
                <label className="block text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-3">
                  Plan
                </label>
                <div className="flex p-1 bg-stone-100 rounded-md">
                  <button className="flex-1 py-1.5 text-xs font-semibold bg-white rounded shadow-sm text-stone-800">
                    Standard
                  </button>
                  <button className="flex-1 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-800">
                    Custom
                  </button>
                </div>
              </div>

              {/* 4. Implementation */}
              <div className="py-4 border-b border-stone-100">
                <label className="block text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-3">
                  Implementation
                </label>
                <div className="relative bg-stone-50 border border-stone-200 rounded-md px-3 py-2 flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-stone-800">
                    Basic (50h) — $7,000
                  </span>
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                </div>
              </div>

              {/* 5. Odoo SH Hosting */}
              <div className="py-4 border-b border-stone-100">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                    Odoo SH Hosting
                  </label>
                  <Switch
                    checked={true}
                    className="data-[state=checked]:bg-[#714B67]"
                  />
                </div>
                <div className="bg-stone-50 border border-stone-100 rounded-md p-4 space-y-4">
                  <div className="flex p-1 bg-stone-200/50 rounded-md">
                    <button className="flex-1 py-1 text-xs font-semibold bg-white rounded shadow-sm text-stone-800">
                      Shared
                    </button>
                    <button className="flex-1 py-1 text-xs font-medium text-stone-500 hover:text-stone-800">
                      Dedicated
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-500">Workers</span>
                      <span className="text-sm font-medium">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-500">Storage GB</span>
                      <span className="text-sm font-medium">1</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-stone-500">
                        Staging branches
                      </span>
                      <span className="text-sm font-medium">0</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-stone-200 text-center">
                    <span className="text-[10px] font-medium text-stone-500">
                      $172.80/mo annual · $216/mo monthly
                    </span>
                  </div>
                </div>
              </div>

              {/* 6. Terms to Compare */}
              <div className="py-4 border-b border-stone-100">
                <label className="block text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-3">
                  Terms to Compare
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Mo", "1Y", "2Y", "3Y", "4Y", "5Y"].map((term) => {
                    const isActive = ["Mo", "1Y", "3Y", "5Y"].includes(term);
                    return (
                      <button
                        key={term}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          isActive
                            ? "bg-stone-800 text-white border-stone-800 font-medium shadow-sm"
                            : "bg-white text-stone-400 border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        {term}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7. Discounts */}
              <div className="py-4">
                <label className="block text-[10px] font-bold tracking-widest text-stone-400 uppercase mb-3">
                  Discounts Applied
                </label>
                <div className="bg-stone-50 border border-stone-100 rounded-md overflow-hidden text-xs">
                  <table className="w-full text-center">
                    <thead>
                      <tr className="bg-stone-100/50 text-stone-500 border-b border-stone-100">
                        <th className="font-normal py-1.5 px-2 text-left">
                          Type
                        </th>
                        <th className="font-normal py-1.5 px-2">Mo</th>
                        <th className="font-normal py-1.5 px-2">1Y</th>
                        <th className="font-normal py-1.5 px-2">3Y</th>
                        <th className="font-normal py-1.5 px-2">5Y</th>
                      </tr>
                    </thead>
                    <tbody className="text-stone-700 font-medium">
                      <tr className="border-b border-stone-100">
                        <td className="py-2 px-2 text-left font-normal text-stone-500">
                          Plan %
                        </td>
                        <td className="py-2 px-2 text-stone-300">—</td>
                        <td className="py-2 px-2 text-stone-300">—</td>
                        <td className="py-2 px-2">10</td>
                        <td className="py-2 px-2">10</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2 text-left font-normal text-stone-500">
                          Impl %
                        </td>
                        <td className="py-2 px-2">5</td>
                        <td className="py-2 px-2">5</td>
                        <td className="py-2 px-2">5</td>
                        <td className="py-2 px-2">5</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN PANEL */}
        <main className="flex-1 overflow-y-auto relative bg-[#FAFAF7]">
          {/* Sticky Chip Bar */}
          <div className="sticky top-0 z-20 bg-[#FAFAF7] border-b border-stone-200 px-8 py-2">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-[11px] font-medium text-stone-500">
                <Globe className="w-3 h-3" />
                <span>United States</span>
                <span className="text-stone-300">•</span>
                <Users className="w-3 h-3" />
                <span>25 users</span>
                <span className="text-stone-300">•</span>
                <span>Standard</span>
                <span className="text-stone-300">•</span>
                <span>Basic Implementation</span>
                <span className="text-stone-300">•</span>
                <Server className="w-3 h-3" />
                <span>Odoo SH Shared 3 workers</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-4xl mx-auto px-8 py-8"
          >
            {/* Header */}
            <div className="mb-8 pb-4 border-b-2 border-stone-800 flex justify-between items-end">
              <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                Investment Proposal
              </h1>
              <div className="flex gap-6 text-sm text-stone-600 font-medium">
                <p>
                  Prepared for: <span className="text-stone-900">Acme Corporation</span>
                </p>
                <p>
                  By: <span className="text-stone-900">Odoo Advisors</span>
                </p>
                <p>{currentDate}</p>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="relative">
              {/* Highlight Backdrop for 3-Year */}
              <div className="absolute top-0 bottom-0 left-[50%] w-[25%] bg-[#714B67]/[0.03] -z-10 border-x border-[#714B67]/10"></div>

              {/* Table Header */}
              <div className="flex text-[10px] font-bold tracking-[0.15em] uppercase text-stone-400 pb-2 border-b border-stone-200">
                <div className="w-[30%]">Cost Component</div>
                <div className="w-[15%] text-right pr-4">Monthly</div>
                <div className="w-[15%] text-right pr-4">1-Year</div>
                <div className="w-[25%] text-right pr-4 text-[#714B67]">
                  3-Year
                </div>
                <div className="w-[15%] text-right pr-4">5-Year</div>
              </div>

              {/* SOFTWARE LICENSE */}
              <div className="py-4 border-b border-stone-200 bg-stone-50/30">
                <div className="flex mb-2">
                  <div className="w-[30%] font-semibold text-base text-stone-800 pl-2">
                    Software License
                  </div>
                  <div className="w-[15%] text-right pr-4 font-medium text-stone-500 text-sm">
                    $777.50<span className="text-[10px]">/mo</span>
                  </div>
                  <div className="w-[15%] text-right pr-4 font-medium text-stone-500 text-sm">
                    $9,330.00
                  </div>
                  <div className="w-[25%] text-right pr-4 font-medium text-stone-500 text-sm">
                    $27,990.00
                  </div>
                  <div className="w-[15%] text-right pr-4 font-medium text-stone-500 text-sm">
                    $46,650.00
                  </div>
                </div>

                <div className="flex text-xs text-stone-500 mb-1">
                  <div className="w-[30%] pl-6 flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#017E84]" />
                    Year-1 Promo Savings
                  </div>
                  <div className="w-[15%] text-right pr-4">—</div>
                  <div className="w-[15%] text-right pr-4 text-[#017E84]">
                    -$1,860.00
                  </div>
                  <div className="w-[25%] text-right pr-4 text-[#017E84]">
                    -$1,860.00
                  </div>
                  <div className="w-[15%] text-right pr-4 text-[#017E84]">
                    -$1,860.00
                  </div>
                </div>

                <div className="flex text-xs text-stone-500 mb-2">
                  <div className="w-[30%] pl-6 flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#017E84]" />
                    Multi-Year Discount
                  </div>
                  <div className="w-[15%] text-right pr-4">—</div>
                  <div className="w-[15%] text-right pr-4">—</div>
                  <div className="w-[25%] text-right pr-4 text-[#017E84]">
                    -$1,866.00
                  </div>
                  <div className="w-[15%] text-right pr-4 text-[#017E84]">
                    -$3,732.00
                  </div>
                </div>

                <div className="flex font-semibold text-stone-900 border-t border-stone-200 pt-2 text-sm">
                  <div className="w-[30%] pl-2 text-stone-600">Software Subtotal</div>
                  <div className="w-[15%] text-right pr-4">$777.50</div>
                  <div className="w-[15%] text-right pr-4">$7,470.00</div>
                  <div className="w-[25%] text-right pr-4 text-[#714B67]">
                    $24,264.00
                  </div>
                  <div className="w-[15%] text-right pr-4">$41,058.00</div>
                </div>
              </div>

              {/* IMPLEMENTATION */}
              <div className="py-4 border-b border-stone-200">
                <div className="flex mb-2">
                  <div className="w-[30%] font-semibold text-base text-stone-800 pl-2">
                    Implementation
                  </div>
                  <div className="w-[15%] text-right pr-4 font-medium text-stone-500 text-sm">
                    $7,000.00
                  </div>
                  <div className="w-[15%] text-right pr-4 font-medium text-stone-500 text-sm">
                    $7,000.00
                  </div>
                  <div className="w-[25%] text-right pr-4 font-medium text-stone-500 text-sm">
                    $7,000.00
                  </div>
                  <div className="w-[15%] text-right pr-4 font-medium text-stone-500 text-sm">
                    $7,000.00
                  </div>
                </div>

                <div className="flex text-xs text-stone-500 mb-2">
                  <div className="w-[30%] pl-6 flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-amber-500" />
                    Implementation Discount
                  </div>
                  <div className="w-[15%] text-right pr-4 text-amber-600">
                    -$350.00
                  </div>
                  <div className="w-[15%] text-right pr-4 text-amber-600">
                    -$350.00
                  </div>
                  <div className="w-[25%] text-right pr-4 text-amber-600">
                    -$350.00
                  </div>
                  <div className="w-[15%] text-right pr-4 text-amber-600">
                    -$350.00
                  </div>
                </div>

                <div className="flex font-semibold text-stone-900 border-t border-stone-200 pt-2 text-sm">
                  <div className="w-[30%] pl-2 text-stone-600">Implementation Subtotal</div>
                  <div className="w-[15%] text-right pr-4">$6,650.00</div>
                  <div className="w-[15%] text-right pr-4">$6,650.00</div>
                  <div className="w-[25%] text-right pr-4 text-[#714B67]">
                    $6,650.00
                  </div>
                  <div className="w-[15%] text-right pr-4">$6,650.00</div>
                </div>
              </div>

              {/* ODOO SH HOSTING */}
              <div className="py-4 border-b-2 border-stone-800 bg-stone-50/30">
                <div className="flex mb-2">
                  <div className="w-[30%] font-semibold text-base text-stone-800 pl-2">
                    Odoo SH Hosting
                  </div>
                  <div className="w-[15%] text-right pr-4 font-medium text-stone-500 text-sm">
                    $216.00<span className="text-[10px]">/mo</span>
                  </div>
                  <div className="w-[15%] text-right pr-4 font-medium text-stone-500 text-sm">
                    $2,073.60
                  </div>
                  <div className="w-[25%] text-right pr-4 font-medium text-stone-500 text-sm">
                    $6,220.80
                  </div>
                  <div className="w-[15%] text-right pr-4 font-medium text-stone-500 text-sm">
                    $10,368.00
                  </div>
                </div>

                <div className="flex text-xs text-stone-500 mb-2">
                  <div className="w-[30%] pl-6 flex items-center gap-1.5">
                    <ChevronRight className="w-3 h-3 text-[#017E84]" />
                    Multi-Year Discount
                  </div>
                  <div className="w-[15%] text-right pr-4">—</div>
                  <div className="w-[15%] text-right pr-4">—</div>
                  <div className="w-[25%] text-right pr-4 text-[#017E84]">
                    -$414.72
                  </div>
                  <div className="w-[15%] text-right pr-4 text-[#017E84]">
                    -$829.44
                  </div>
                </div>

                <div className="flex font-semibold text-stone-900 border-t border-stone-200 pt-2 text-sm">
                  <div className="w-[30%] pl-2 text-stone-600">Hosting Subtotal</div>
                  <div className="w-[15%] text-right pr-4">$216.00</div>
                  <div className="w-[15%] text-right pr-4">$2,073.60</div>
                  <div className="w-[25%] text-right pr-4 text-[#714B67]">
                    $5,806.08
                  </div>
                  <div className="w-[15%] text-right pr-4">$9,538.56</div>
                </div>
              </div>

              {/* TOTALS */}
              <div className="py-6">
                <div className="flex items-end mb-4 pl-2">
                  <div className="w-[30%] font-bold text-lg text-stone-900">
                    Total Contract
                  </div>
                  <div className="w-[15%] text-right pr-4 text-base font-semibold text-stone-700">
                    $7,993.50
                  </div>
                  <div className="w-[15%] text-right pr-4 text-base font-semibold text-stone-700">
                    $16,193.60
                  </div>
                  <div className="w-[25%] text-right pr-4 text-2xl text-[#714B67] font-bold">
                    $36,720.08
                  </div>
                  <div className="w-[15%] text-right pr-4 text-base font-semibold text-stone-700">
                    $57,246.56
                  </div>
                </div>

                <div className="flex items-center text-xs font-semibold border-t border-stone-200 pt-4 mb-3 pl-2">
                  <div className="w-[30%] text-stone-500 uppercase tracking-widest text-[10px]">
                    Per-Month Amortized
                  </div>
                  <div className="w-[15%] text-right pr-4 text-stone-400">
                    —
                  </div>
                  <div className="w-[15%] text-right pr-4 text-stone-600">
                    $1,349/mo
                  </div>
                  <div className="w-[25%] text-right pr-4 text-[#714B67] text-base">
                    $1,020/mo
                  </div>
                  <div className="w-[15%] text-right pr-4 text-stone-600">
                    $954/mo
                  </div>
                </div>

                <div className="flex items-center text-xs font-semibold border-t border-stone-200 pt-4 pl-2">
                  <div className="w-[30%] text-[#017E84] flex items-center gap-1.5 uppercase tracking-widest text-[10px]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Savings vs Month-to-Month
                  </div>
                  <div className="w-[15%] text-right pr-4 text-stone-400">
                    —
                  </div>
                  <div className="w-[15%] text-right pr-4 text-stone-400">
                    $0
                  </div>
                  <div className="w-[25%] text-right pr-4 text-[#017E84] text-base">
                    $13,066
                  </div>
                  <div className="w-[15%] text-right pr-4 text-[#017E84] text-base">
                    $20,476
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Recommendation & Catalyst Finance */}
            <div className="mt-8 bg-white border border-stone-200 shadow-sm rounded flex items-center divide-x divide-stone-200">
              <div className="flex-1 p-4 flex items-center gap-4">
                <div className="bg-[#714B67] text-white text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded">
                  Recommendation
                </div>
                <div className="text-sm font-medium text-stone-800">
                  Select the 3-Year term to save <span className="text-[#017E84] font-bold">$13,066</span> vs month-to-month.
                </div>
              </div>
              <div className="flex-1 p-4 flex items-center gap-3 bg-[#FAFAF7]">
                <CreditCard className="w-5 h-5 text-[#017E84]" />
                <div className="text-xs text-stone-600">
                  <span className="font-semibold text-stone-900 block mb-0.5">Catalyst Financing</span>
                  As low as <strong className="text-[#017E84]">$1,117/mo</strong> (36 mo)
                </div>
                <Button variant="outline" size="sm" className="ml-auto h-8 text-xs bg-white">
                  Apply
                </Button>
              </div>
            </div>

            {/* Compact Signature */}
            <div className="mt-12 pt-8 border-t border-stone-200 flex justify-end gap-16">
               <div className="w-64 border-b border-stone-300 pb-1 text-center font-medium text-stone-800 relative">
                 <span className="absolute top-6 left-0 right-0 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">Authorized By</span>
               </div>
               <div className="w-48 border-b border-stone-300 pb-1 text-center font-medium text-stone-800 relative">
                 {currentDate}
                 <span className="absolute top-6 left-0 right-0 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">Date</span>
               </div>
            </div>
            
          </motion.div>
        </main>
      </div>
    </div>
  );
}
