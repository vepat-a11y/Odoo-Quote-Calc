import React from "react";
import { Download, CheckCircle, ChevronDown, Users, Server, Globe, CreditCard, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

export function InvestmentLetterhead() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#FAFAF7] text-stone-900 selection:bg-[#714B67] selection:text-white pb-0">
      {/* TOP BAR */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src="/__mockup/images/odoo-brand/odoo_logo.png"
            alt="Odoo"
            className="h-6"
          />
          <div className="w-px h-6 bg-stone-200"></div>
          <span className="font-medium text-stone-600 tracking-wide text-sm uppercase">
            Investment Proposal
          </span>
        </div>
        <Button
          variant="outline"
          className="text-[#714B67] border-[#714B67] hover:bg-[#714B67] hover:text-white transition-colors"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden h-[calc(100vh-64px)]">
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
        <main className="flex-1 overflow-y-auto relative bg-[#FAFAF7] font-serif">
          {/* Sticky Chip Bar */}
          <div className="sticky top-0 z-20 bg-[#FAFAF7]/80 backdrop-blur-md px-12 py-4 font-sans">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-500 bg-white px-4 py-1.5 rounded-full border border-stone-200 shadow-sm">
                <Globe className="w-3.5 h-3.5" />
                <span>United States</span>
                <span className="text-stone-300">•</span>
                <Users className="w-3.5 h-3.5" />
                <span>25 users</span>
                <span className="text-stone-300">•</span>
                <span>Standard</span>
                <span className="text-stone-300">•</span>
                <span>Basic Implementation</span>
                <span className="text-stone-300">•</span>
                <Server className="w-3.5 h-3.5" />
                <span>Odoo SH Shared 3 workers</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-5xl mx-auto px-12 pb-16 pt-4 relative"
          >
            {/* Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <img src="/__mockup/images/odoo-brand/odoo_logo.png" alt="Odoo Watermark" className="w-2/3 opacity-[0.03] grayscale" />
            </div>

            <div className="relative z-10">
              {/* Letterhead block */}
              <div className="flex justify-between items-start mb-6">
                <img
                  src="/__mockup/images/odoo-brand/odoo_logo.png"
                  alt="Odoo"
                  className="h-10"
                />
                <div className="text-right text-sm text-stone-600 font-serif leading-relaxed">
                  <p>Acme Odoo Partners</p>
                  <p>1234 Market St, Suite 500</p>
                  <p>San Francisco, CA 94103 &middot; partners@acme.com</p>
                </div>
              </div>
              <div className="w-full h-px bg-[#714B67] mb-12"></div>

              {/* Proposal Header Restructure */}
              <div className="flex justify-between items-start mb-8 text-base">
                <div className="text-stone-800 leading-relaxed">
                  <p className="font-bold text-sm tracking-widest text-stone-500 uppercase mb-2">TO:</p>
                  <p className="font-bold">Acme Corporation</p>
                  <p>Attn: Procurement</p>
                  <p>456 Corporate Blvd</p>
                  <p>New York, NY 10001</p>
                </div>
                <div className="text-right text-stone-700 space-y-1">
                  <p><span className="font-bold">REF:</span> ODO-2026-0142</p>
                  <p><span className="font-bold">DATE:</span> {currentDate}</p>
                  <p><span className="font-bold">VALID UNTIL:</span> 30 days</p>
                </div>
              </div>

              {/* Subject Line */}
              <h1 className="text-xl font-bold text-stone-900 mb-8 pb-4 border-b border-stone-200">
                RE: Odoo ERP Investment Proposal — 25 Users, Standard Plan
              </h1>

              {/* Salutation */}
              <div className="mb-12 text-stone-700 text-lg leading-relaxed">
                <p className="mb-4">Dear Procurement Team,</p>
                <p>
                  Thank you for the opportunity to partner with Acme Corporation on your digital transformation journey. Please find our comprehensive investment proposal for the Odoo ERP deployment outlined below.
                </p>
              </div>

              {/* Comparison Table */}
              <div className="relative font-sans">
                {/* Highlight Backdrop for 3-Year */}
                <div className="absolute top-0 bottom-0 left-[50%] w-[25%] bg-stone-100/50 rounded-xl -z-10 border border-stone-200/60 shadow-sm"></div>

                {/* Table Header */}
                <div className="flex text-xs font-bold tracking-[0.15em] uppercase text-stone-400 pb-4 border-b border-stone-200">
                  <div className="w-[30%]">Cost Component</div>
                  <div className="w-[15%] text-right pr-4">Monthly</div>
                  <div className="w-[15%] text-right pr-4">1-Year</div>
                  <div className="w-[25%] text-right pr-4 text-[#714B67]">
                    3-Year
                  </div>
                  <div className="w-[15%] text-right pr-4">5-Year</div>
                </div>

                {/* SOFTWARE LICENSE */}
                <div className="py-8 border-b border-stone-200">
                  <div className="flex mb-4">
                    <div className="w-[30%] font-serif text-lg text-stone-800">
                      Software License
                    </div>
                    <div className="w-[15%] text-right pr-4 font-medium text-stone-400">
                      $777.50<span className="text-xs">/mo</span>
                    </div>
                    <div className="w-[15%] text-right pr-4 font-medium text-stone-400">
                      $9,330.00
                    </div>
                    <div className="w-[25%] text-right pr-4 font-medium text-stone-400">
                      $27,990.00
                    </div>
                    <div className="w-[15%] text-right pr-4 font-medium text-stone-400">
                      $46,650.00
                    </div>
                  </div>

                  <div className="flex text-sm text-stone-500 mb-2">
                    <div className="w-[30%] pl-4 flex items-center gap-2">
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

                  <div className="flex text-sm text-stone-500 mb-4">
                    <div className="w-[30%] pl-4 flex items-center gap-2">
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

                  <div className="flex font-semibold text-stone-900 border-t border-stone-200/50 pt-4">
                    <div className="w-[30%]">Software Subtotal</div>
                    <div className="w-[15%] text-right pr-4">$777.50</div>
                    <div className="w-[15%] text-right pr-4">$7,470.00</div>
                    <div className="w-[25%] text-right pr-4 text-[#714B67]">
                      $24,264.00
                    </div>
                    <div className="w-[15%] text-right pr-4">$41,058.00</div>
                  </div>
                </div>

                {/* IMPLEMENTATION */}
                <div className="py-8 border-b border-stone-200">
                  <div className="flex mb-4">
                    <div className="w-[30%] font-serif text-lg text-stone-800">
                      Implementation
                    </div>
                    <div className="w-[15%] text-right pr-4 font-medium text-stone-400">
                      $7,000.00
                    </div>
                    <div className="w-[15%] text-right pr-4 font-medium text-stone-400">
                      $7,000.00
                    </div>
                    <div className="w-[25%] text-right pr-4 font-medium text-stone-400">
                      $7,000.00
                    </div>
                    <div className="w-[15%] text-right pr-4 font-medium text-stone-400">
                      $7,000.00
                    </div>
                  </div>

                  <div className="flex text-sm text-stone-500 mb-4">
                    <div className="w-[30%] pl-4 flex items-center gap-2">
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

                  <div className="flex font-semibold text-stone-900 border-t border-stone-200/50 pt-4">
                    <div className="w-[30%]">Implementation Subtotal</div>
                    <div className="w-[15%] text-right pr-4">$6,650.00</div>
                    <div className="w-[15%] text-right pr-4">$6,650.00</div>
                    <div className="w-[25%] text-right pr-4 text-[#714B67]">
                      $6,650.00
                    </div>
                    <div className="w-[15%] text-right pr-4">$6,650.00</div>
                  </div>
                </div>

                {/* ODOO SH HOSTING */}
                <div className="py-8 border-b-2 border-stone-800">
                  <div className="flex mb-4">
                    <div className="w-[30%] font-serif text-lg text-stone-800">
                      Odoo SH Hosting
                    </div>
                    <div className="w-[15%] text-right pr-4 font-medium text-stone-400">
                      $216.00<span className="text-xs">/mo</span>
                    </div>
                    <div className="w-[15%] text-right pr-4 font-medium text-stone-400">
                      $2,073.60
                    </div>
                    <div className="w-[25%] text-right pr-4 font-medium text-stone-400">
                      $6,220.80
                    </div>
                    <div className="w-[15%] text-right pr-4 font-medium text-stone-400">
                      $10,368.00
                    </div>
                  </div>

                  <div className="flex text-sm text-stone-500 mb-4">
                    <div className="w-[30%] pl-4 flex items-center gap-2">
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

                  <div className="flex font-semibold text-stone-900 border-t border-stone-200/50 pt-4">
                    <div className="w-[30%]">Hosting Subtotal</div>
                    <div className="w-[15%] text-right pr-4">$216.00</div>
                    <div className="w-[15%] text-right pr-4">$2,073.60</div>
                    <div className="w-[25%] text-right pr-4 text-[#714B67]">
                      $5,806.08
                    </div>
                    <div className="w-[15%] text-right pr-4">$9,538.56</div>
                  </div>
                </div>

                {/* TOTALS */}
                <div className="py-8">
                  <div className="flex items-end mb-6">
                    <div className="w-[30%] font-serif text-2xl text-stone-900">
                      Total Contract
                    </div>
                    <div className="w-[15%] text-right pr-4 text-xl font-medium text-stone-600">
                      $7,993.50
                    </div>
                    <div className="w-[15%] text-right pr-4 text-xl font-medium text-stone-600">
                      $16,193.60
                    </div>
                    <div className="w-[25%] text-right pr-4 text-3xl font-serif text-[#714B67] font-bold">
                      $36,720.08
                    </div>
                    <div className="w-[15%] text-right pr-4 text-xl font-medium text-stone-600">
                      $57,246.56
                    </div>
                  </div>

                  <div className="flex items-center text-sm font-medium border-t border-stone-200 pt-6 mb-4">
                    <div className="w-[30%] text-stone-500 uppercase tracking-widest text-[10px]">
                      Per-Month Amortized
                    </div>
                    <div className="w-[15%] text-right pr-4 text-stone-400">
                      —
                    </div>
                    <div className="w-[15%] text-right pr-4 text-stone-600">
                      $1,349/mo
                    </div>
                    <div className="w-[25%] text-right pr-4 text-[#714B67] font-bold text-lg">
                      $1,020/mo
                    </div>
                    <div className="w-[15%] text-right pr-4 text-stone-600">
                      $954/mo
                    </div>
                  </div>

                  <div className="flex items-center text-sm font-medium border-t border-stone-200 pt-6 mb-4">
                    <div className="w-[30%] text-[#017E84] flex items-center gap-2 uppercase tracking-widest text-[10px]">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Savings vs Month-to-Month
                    </div>
                    <div className="w-[15%] text-right pr-4 text-stone-400">
                      —
                    </div>
                    <div className="w-[15%] text-right pr-4 text-stone-400">
                      $0
                    </div>
                    <div className="w-[25%] text-right pr-4 text-[#017E84] font-bold text-lg bg-[#017E84]/10 py-1 rounded-sm">
                      $13,066
                    </div>
                    <div className="w-[15%] text-right pr-4 text-[#017E84] font-bold text-lg">
                      $20,476
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendation Callout & Catalyst Finance */}
              <div className="mt-16 bg-white border border-[#714B67]/20 shadow-xl rounded-xl p-10 relative overflow-hidden mb-16 font-sans">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#714B67]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

                <div className="max-w-3xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-[#714B67] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                      Our Recommendation
                    </div>
                    <span className="text-[#017E84] font-medium text-sm">
                      Saves $13,066 vs month-to-month
                    </span>
                  </div>

                  <h3 className="text-3xl font-serif text-stone-900 mb-4">
                    Authorize this Investment
                  </h3>
                  <p className="text-stone-500 mb-10 text-lg">
                    By committing to the 3-Year term, you secure our best pricing
                    structure while spreading the cost of implementation over a
                    reasonable timeframe.
                  </p>

                  <div className="flex items-end gap-12 border-b border-stone-200 pb-8 mb-8">
                    <div className="flex-1 space-y-2">
                      <div className="border-b border-stone-300 border-dashed pb-1 w-full h-8"></div>
                      <p className="text-xs text-stone-400 uppercase tracking-widest font-bold">
                        Authorized Signature
                      </p>
                    </div>
                    <div className="w-48 space-y-2">
                      <div className="border-b border-stone-300 border-dashed pb-1 w-full h-8 text-stone-800 font-medium px-2 text-center">
                        {currentDate}
                      </div>
                      <p className="text-xs text-stone-400 uppercase tracking-widest font-bold text-center">
                        Date
                      </p>
                    </div>
                    <Button className="bg-[#714B67] hover:bg-[#5b3c53] text-white px-8 h-12 text-base shadow-sm">
                      Accept Proposal
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 bg-[#FAFAF7] p-5 rounded-lg border border-stone-200">
                    <div className="bg-[#017E84]/10 p-3 rounded-full text-[#017E84]">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg text-stone-900">
                        Catalyst Financing Available
                      </h4>
                      <p className="text-stone-500 text-sm">
                        Preserve your capital. Finance this entire 3-Year contract
                        for as low as{" "}
                        <strong className="text-[#017E84]">
                          $1,117/mo over 36 months
                        </strong>{" "}
                        (subject to credit approval).
                      </p>
                    </div>
                    <Button variant="outline" className="ml-auto bg-white border-stone-300 text-stone-700 hover:text-stone-900 hover:bg-stone-50">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </div>

              {/* Sign-off */}
              <div className="mt-8 text-stone-700 text-lg leading-relaxed font-sans">
                <p className="mb-8 font-serif">Sincerely,</p>
                <div className="w-64 border-b border-stone-800 mb-2"></div>
                <p className="font-bold">Odoo Advisors</p>
                <p className="text-stone-500 text-sm">Acme Odoo Partners</p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
