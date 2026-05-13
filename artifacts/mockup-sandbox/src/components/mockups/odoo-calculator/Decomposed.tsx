import React from 'react';
import { Download, Share2, Info, Printer, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export function Decomposed() {
  const formatCurrency = (val: number | string, noDecimals = false) => {
    if (typeof val === 'string') return val;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: noDecimals ? 0 : 2,
      maximumFractionDigits: noDecimals ? 0 : 2,
    }).format(val);
  };

  const ThCell = ({ children, isBestValue = false, className = '' }: any) => (
    <th className={`px-4 py-5 font-semibold text-center relative align-bottom ${isBestValue ? 'bg-[#714B67]/[0.02] border-x border-[#714B67]/30' : ''} ${className}`}>
      {isBestValue && (
        <div className="absolute top-0 left-0 right-0 flex justify-center -mt-[14px]">
          <span className="bg-[#714B67] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
            BEST VALUE
          </span>
        </div>
      )}
      {children}
    </th>
  );

  const TdLabel = ({ children, indent = false, isBold = false, className = '' }: any) => (
    <td className={`px-4 py-3 text-left border-b border-stone-100 ${indent ? 'pl-8 text-stone-500' : 'text-stone-900'} ${isBold ? 'font-semibold text-stone-900' : ''} ${className}`}>
      {children}
    </td>
  );

  const TdValue = ({ val, isBestValue = false, isDeduction = false, isBold = false, className = '', isDash = false, noDecimals = false }: any) => (
    <td className={`px-4 py-3 text-right tabular-nums border-b border-stone-100 ${isBestValue ? 'bg-[#714B67]/[0.02] border-x border-[#714B67]/30' : ''} ${isDeduction ? 'text-red-600' : 'text-stone-900'} ${isBold ? 'font-semibold text-stone-900' : ''} ${className}`}>
      {isDash ? <span className="text-stone-300">—</span> : (isDeduction ? `−${formatCurrency(val, noDecimals)}` : formatCurrency(val, noDecimals))}
    </td>
  );

  return (
    <div className="h-screen w-full flex flex-col bg-[#F4F3EF] font-sans text-stone-900 overflow-hidden">
      {/* TOP BAR */}
      <header className="flex-shrink-0 h-[60px] bg-white border-b border-stone-200 flex items-center justify-between px-6 z-20 shadow-sm relative">
        <div className="flex items-center gap-4">
          <img src="/__mockup/images/odoo-brand/odoo_logo.png" alt="Odoo" className="h-6" />
          <div className="w-px h-6 bg-stone-300"></div>
          <span className="font-semibold text-[#714B67] text-lg">Quote Builder</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-9 px-4 text-stone-600 border-stone-300 hover:bg-stone-50 bg-white">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button className="h-9 bg-[#714B67] hover:bg-[#5b3c53] text-white">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* LEFT SIDEBAR */}
        <aside className="w-[340px] bg-white border-r border-stone-200 flex flex-col overflow-y-auto z-10 shrink-0 shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
          <div className="p-6 space-y-8">
            {/* 1. Country / Currency */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Country / Currency</label>
              <div className="flex p-1 bg-stone-100 rounded-md border border-stone-200">
                <button className="flex-1 py-1.5 text-sm font-medium bg-white rounded shadow-sm text-stone-900 border border-stone-200/50">USD</button>
                <button className="flex-1 py-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors">CAD</button>
              </div>
            </div>

            {/* 2. Users */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Users</label>
              <Input type="number" defaultValue={25} className="bg-white border-stone-300 h-10 font-medium shadow-sm" />
            </div>

            {/* 3. Plan */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Plan</label>
              <div className="flex p-1 bg-stone-100 rounded-md border border-stone-200">
                <button className="flex-1 py-1.5 text-sm font-medium bg-white rounded shadow-sm text-stone-900 border border-stone-200/50">Standard</button>
                <button className="flex-1 py-1.5 text-sm font-medium text-stone-500 hover:text-stone-700 transition-colors">Custom</button>
              </div>
            </div>

            {/* 4. Implementation */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Implementation</label>
              <Select defaultValue="basic">
                <SelectTrigger className="w-full h-10 bg-white border-stone-300 font-medium text-stone-900 shadow-sm">
                  <SelectValue placeholder="Select implementation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (50h) — $7,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 5. Odoo SH Hosting */}
            <div className="space-y-4 pt-6 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-stone-800">Odoo SH Hosting</label>
                <Switch checked={true} className="data-[state=checked]:bg-[#017E84]" />
              </div>
              <div className="space-y-4 pl-3 border-l-2 border-[#714B67] ml-1">
                <div className="flex p-1 bg-stone-100 rounded-md border border-stone-200">
                  <button className="flex-1 py-1.5 text-xs font-medium bg-white rounded shadow-sm text-stone-900 border border-stone-200/50">Shared</button>
                  <button className="flex-1 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors">Dedicated</button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">Workers</label>
                    <Input type="number" defaultValue={3} className="h-8 text-sm border-stone-300" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">Storage GB</label>
                    <Input type="number" defaultValue={1} className="h-8 text-sm border-stone-300" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-stone-500 uppercase tracking-wide">Staging Branches</label>
                  <Input type="number" defaultValue={0} className="h-8 text-sm border-stone-300" />
                </div>
                <div className="p-3 bg-[#017E84]/5 rounded text-xs text-stone-700 flex items-start gap-2 border border-[#017E84]/10">
                  <Info className="w-4 h-4 text-[#017E84] shrink-0 mt-0.5" />
                  <p className="font-medium">$172.80/mo annual · $216/mo monthly</p>
                </div>
              </div>
            </div>

            {/* 6. Terms to Compare */}
            <div className="space-y-3 pt-6 border-t border-stone-200">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Terms to Compare</label>
              <div className="flex flex-wrap gap-2">
                {['Mo', '1Y', '2Y', '3Y', '4Y', '5Y'].map((term) => {
                  const isActive = ['Mo', '1Y', '3Y', '5Y'].includes(term);
                  return (
                    <button
                      key={term}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors shadow-sm
                        ${isActive 
                          ? 'bg-[#714B67] text-white border-[#714B67]' 
                          : 'bg-white text-stone-500 border-stone-300 hover:bg-stone-50 hover:text-stone-700'}`}
                    >
                      {term}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Discounts */}
            <div className="space-y-3 pt-6 border-t border-stone-200 pb-8">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Discounts</label>
              </div>
              <div className="border border-stone-200 rounded-lg overflow-hidden shadow-sm">
                <table className="w-full text-xs text-center tabular-nums">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3 text-left font-bold text-stone-500 w-1/3">Item</th>
                      <th className="py-2.5 px-1 font-bold text-stone-500">Mo</th>
                      <th className="py-2.5 px-1 font-bold text-stone-500">1Y</th>
                      <th className="py-2.5 px-1 font-bold text-[#714B67]">3Y</th>
                      <th className="py-2.5 px-1 font-bold text-stone-500">5Y</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    <tr>
                      <td className="py-2.5 px-3 text-left font-medium text-stone-600 bg-stone-50/50">Plan %</td>
                      <td className="py-2.5 px-1 text-stone-300 font-medium">—</td>
                      <td className="py-2.5 px-1 text-stone-300 font-medium">—</td>
                      <td className="py-2.5 px-1 font-bold text-[#017E84] bg-[#017E84]/5">10</td>
                      <td className="py-2.5 px-1 font-bold text-[#017E84]">10</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 text-left font-medium text-stone-600 bg-stone-50/50">Impl %</td>
                      <td className="py-2.5 px-1 font-bold text-[#E4A900]">5</td>
                      <td className="py-2.5 px-1 font-bold text-[#E4A900]">5</td>
                      <td className="py-2.5 px-1 font-bold text-[#E4A900] bg-[#E4A900]/5">5</td>
                      <td className="py-2.5 px-1 font-bold text-[#E4A900]">5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN PANEL */}
        <main className="flex-1 overflow-y-auto bg-[#F4F3EF] p-6 lg:p-10 relative">
          <div className="max-w-5xl mx-auto space-y-6 pb-20">
            
            {/* Sticky summary bar */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border border-stone-200 shadow-sm rounded-xl p-3 flex items-center justify-between transition-all">
              <div className="flex items-center flex-wrap gap-2 text-sm text-stone-600">
                <Badge variant="secondary" className="bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium border border-stone-200">United States</Badge>
                <span className="text-stone-300 font-bold">•</span>
                <Badge variant="secondary" className="bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium border border-stone-200">25 users</Badge>
                <span className="text-stone-300 font-bold">•</span>
                <Badge variant="secondary" className="bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium border border-stone-200">Standard Plan</Badge>
                <span className="text-stone-300 font-bold">•</span>
                <Badge variant="secondary" className="bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium border border-stone-200">Basic Implementation</Badge>
                <span className="text-stone-300 font-bold">•</span>
                <Badge variant="secondary" className="bg-stone-100 text-stone-700 hover:bg-stone-200 font-medium border border-stone-200">SH Shared (3 workers)</Badge>
              </div>
            </div>

            {/* Decomposed Breakdown Table */}
            <div className="bg-white border border-stone-200 rounded-xl shadow-md overflow-hidden relative">
              <div className="w-full overflow-x-auto">
                <table className="w-full text-[13px] whitespace-nowrap tabular-nums">
                  <thead>
                    <tr>
                      <th className="w-[28%] min-w-[200px]"></th>
                      <ThCell>
                        <div className="text-center font-bold text-lg text-stone-900">Monthly</div>
                        <div className="text-center text-xs text-stone-500 font-medium mt-1">Pay as you go</div>
                      </ThCell>
                      <ThCell>
                        <div className="text-center font-bold text-lg text-stone-900">1-Year</div>
                        <div className="text-center text-xs text-stone-500 font-medium mt-1">Annual commitment</div>
                      </ThCell>
                      <ThCell isBestValue>
                        <div className="text-center font-bold text-lg text-[#714B67] mt-3">3-Year</div>
                        <div className="text-center text-xs text-[#714B67]/70 font-medium mt-1">Maximum savings</div>
                      </ThCell>
                      <ThCell>
                        <div className="text-center font-bold text-lg text-stone-900">5-Year</div>
                        <div className="text-center text-xs text-stone-500 font-medium mt-1">Long-term lock</div>
                      </ThCell>
                    </tr>
                    {/* Per user/month rate row */}
                    <tr className="bg-stone-50 border-y border-stone-200 text-stone-600 text-xs">
                      <td className="py-3 px-6 font-bold text-stone-500 uppercase tracking-wider text-left border-r border-stone-100">Per-user / month rate</td>
                      <td className="py-3 px-4 text-center border-r border-stone-100 font-medium">$31.10</td>
                      <td className="py-3 px-4 text-center border-r border-stone-100 font-medium">$24.90</td>
                      <td className="py-3 px-4 text-center border-r border-[#714B67]/30 font-semibold text-[#714B67] bg-[#714B67]/[0.05] shadow-[inset_1px_0_0_rgba(113,75,103,0.3),inset_-1px_0_0_rgba(113,75,103,0.3)]">$24.90 <span className="text-stone-400 font-normal ml-1">yr1</span></td>
                      <td className="py-3 px-4 text-center font-medium">$24.90 <span className="text-stone-400 font-normal ml-1">yr1</span></td>
                    </tr>
                  </thead>
                  <tbody>
                    
                    {/* SECTION: SOFTWARE LICENSE */}
                    <tr>
                      <td colSpan={5} className="bg-stone-100/60 py-3.5 px-6 text-xs font-bold text-[#714B67] uppercase tracking-wider border-b border-stone-200">
                        Software License
                      </td>
                    </tr>
                    <tr>
                      <TdLabel indent>List price (yr2+ rate × full term)</TdLabel>
                      <TdValue val={777.50} />
                      <TdValue val={7470} />
                      <TdValue val={27990} isBestValue />
                      <TdValue val={46650} />
                    </tr>
                    <tr>
                      <TdLabel indent>Year-1 promo savings</TdLabel>
                      <TdValue isDash />
                      <TdValue val={1860} isDeduction />
                      <TdValue val={1860} isDeduction isBestValue />
                      <TdValue val={1860} isDeduction />
                    </tr>
                    <tr>
                      <TdLabel indent>Multi-year discount</TdLabel>
                      <TdValue isDash />
                      <TdValue isDash />
                      <TdValue val={1866} isDeduction isBestValue />
                      <TdValue val={3732} isDeduction />
                    </tr>
                    <tr className="bg-stone-50/50">
                      <TdLabel isBold className="py-4">Software Subtotal</TdLabel>
                      <TdValue val={777.50} isBold className="py-4" />
                      <TdValue val={7470} isBold className="py-4" />
                      <TdValue val={24264} isBold isBestValue className="py-4 text-[#714B67]" />
                      <TdValue val={41058} isBold className="py-4" />
                    </tr>

                    {/* SECTION: IMPLEMENTATION */}
                    <tr>
                      <td colSpan={5} className="bg-stone-100/60 py-3.5 px-6 text-xs font-bold text-[#714B67] uppercase tracking-wider border-y border-stone-200">
                        Implementation <span className="text-stone-500 font-medium lowercase tracking-normal normal-case ml-1">(One-time)</span>
                      </td>
                    </tr>
                    <tr>
                      <TdLabel indent>Basic package list</TdLabel>
                      <TdValue val={7000} />
                      <TdValue val={7000} />
                      <TdValue val={7000} isBestValue />
                      <TdValue val={7000} />
                    </tr>
                    <tr>
                      <TdLabel indent>Implementation discount</TdLabel>
                      <TdValue val={350} isDeduction />
                      <TdValue val={350} isDeduction />
                      <TdValue val={350} isDeduction isBestValue />
                      <TdValue val={350} isDeduction />
                    </tr>
                    <tr className="bg-stone-50/50">
                      <TdLabel isBold className="py-4">Implementation Subtotal</TdLabel>
                      <TdValue val={6650} isBold className="py-4" />
                      <TdValue val={6650} isBold className="py-4" />
                      <TdValue val={6650} isBold isBestValue className="py-4 text-[#714B67]" />
                      <TdValue val={6650} isBold className="py-4" />
                    </tr>

                    {/* SECTION: ODOO SH HOSTING */}
                    <tr>
                      <td colSpan={5} className="bg-stone-100/60 py-3.5 px-6 text-xs font-bold text-[#714B67] uppercase tracking-wider border-y border-stone-200">
                        Odoo SH Hosting <span className="text-stone-500 font-medium lowercase tracking-normal normal-case ml-1">(Shared · 3 workers)</span>
                      </td>
                    </tr>
                    <tr>
                      <TdLabel indent>Yearly hosting rate × term</TdLabel>
                      <TdValue val={216} />
                      <TdValue val={2073.60} />
                      <TdValue val={6220.80} isBestValue />
                      <TdValue val={10368} />
                    </tr>
                    <tr>
                      <TdLabel indent>Multi-year discount</TdLabel>
                      <TdValue isDash />
                      <TdValue isDash />
                      <TdValue val={414.72} isDeduction isBestValue />
                      <TdValue val={829.44} isDeduction />
                    </tr>
                    <tr className="bg-stone-50/50">
                      <TdLabel isBold className="py-4 border-b-0">Hosting Subtotal</TdLabel>
                      <TdValue val={216} isBold className="py-4 border-b-0" />
                      <TdValue val={2073.60} isBold className="py-4 border-b-0" />
                      <TdValue val={5806.08} isBold isBestValue className="py-4 border-b-0 text-[#714B67]" />
                      <TdValue val={9538.56} isBold className="py-4 border-b-0" />
                    </tr>

                    {/* HEAVY HR */}
                    <tr>
                      <td colSpan={5} className="p-0 border-none h-0">
                        <div className="h-[3px] bg-stone-300 w-full" />
                      </td>
                    </tr>

                    {/* TOTAL CONTRACT */}
                    <tr className="bg-stone-50">
                      <td className="px-6 py-6 text-left font-bold text-lg text-stone-900 border-b border-stone-200">
                        Total Contract
                      </td>
                      <td className="px-4 py-6 text-right tabular-nums font-bold text-[17px] text-stone-900 border-b border-stone-200">
                        {formatCurrency(7993.50)}
                      </td>
                      <td className="px-4 py-6 text-right tabular-nums font-bold text-[17px] text-stone-900 border-b border-stone-200">
                        {formatCurrency(16193.60)}
                      </td>
                      <td className="px-4 py-6 text-right tabular-nums font-bold text-[19px] text-[#714B67] border-b border-stone-200 bg-[#714B67]/[0.08] shadow-[inset_1px_0_0_rgba(113,75,103,0.3),inset_-1px_0_0_rgba(113,75,103,0.3)]">
                        {formatCurrency(36720.08)}
                      </td>
                      <td className="px-4 py-6 text-right tabular-nums font-bold text-[17px] text-stone-900 border-b border-stone-200">
                        {formatCurrency(57246.56)}
                      </td>
                    </tr>
                    
                    <tr className="bg-white">
                      <td className="px-6 py-4 text-left font-semibold text-stone-600 border-b border-stone-200">
                        Per-Month Amortized
                      </td>
                      <TdValue isDash className="text-stone-400 font-medium bg-stone-50/30" />
                      <TdValue val={1349} noDecimals className="font-semibold text-stone-800 bg-stone-50/30" valSuffix="/mo" />
                      <td className="px-4 py-4 text-right tabular-nums font-bold text-[#714B67] border-b border-stone-200 bg-[#714B67]/[0.04] shadow-[inset_1px_0_0_rgba(113,75,103,0.3),inset_-1px_0_0_rgba(113,75,103,0.3)] text-[15px]">
                        {formatCurrency(1020, true)}/mo
                      </td>
                      <TdValue val={954} noDecimals className="font-semibold text-stone-800 bg-stone-50/30" valSuffix="/mo" />
                    </tr>

                    {/* CATALYST FINANCE */}
                    <tr>
                      <td className="px-6 py-4 text-left border-b border-stone-100 bg-white">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#017E84]">Catalyst Finance</span>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold border-[#017E84]/30 text-[#017E84] h-5 px-1.5 rounded-sm">Low APR</Badge>
                        </div>
                      </td>
                      <TdValue isDash className="text-stone-400 bg-white" />
                      <TdValue isDash className="text-stone-400 bg-white" />
                      <td className="px-4 py-4 text-right tabular-nums border-b border-stone-100 bg-[#714B67]/[0.02] shadow-[inset_1px_0_0_rgba(113,75,103,0.3),inset_-1px_0_0_rgba(113,75,103,0.3)]">
                        <div className="text-sm font-semibold text-[#017E84]">as low as {formatCurrency(1117, true)}/mo</div>
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums border-b border-stone-100 bg-white">
                        <div className="text-sm font-semibold text-[#017E84]">as low as {formatCurrency(1107, true)}/mo</div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-3 text-left border-b border-stone-200 bg-white pl-10">
                        <span className="font-medium text-stone-500 text-[13px]">Standard Rate</span>
                      </td>
                      <TdValue isDash className="text-stone-400 bg-white" />
                      <TdValue isDash className="text-stone-400 bg-white" />
                      <td className="px-4 py-3 text-right tabular-nums border-b border-stone-200 bg-[#714B67]/[0.02] shadow-[inset_1px_0_0_rgba(113,75,103,0.3),inset_-1px_0_0_rgba(113,75,103,0.3)]">
                        <div className="text-[13px] text-stone-500 font-medium">up to {formatCurrency(1237, true)}/mo</div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums border-b border-stone-200 bg-white">
                        <div className="text-[13px] text-stone-500 font-medium">up to {formatCurrency(1302, true)}/mo</div>
                      </td>
                    </tr>

                    {/* HEAVY HR */}
                    <tr>
                      <td colSpan={5} className="p-0 border-none h-0">
                        <div className="h-[3px] bg-[#017E84]/20 w-full" />
                      </td>
                    </tr>

                    {/* SAVINGS */}
                    <tr className="bg-[#017E84]/[0.04]">
                      <td className="px-6 py-6 text-left font-bold text-[16px] text-[#017E84]">
                        You Save <span className="text-sm font-medium text-[#017E84]/70 ml-1.5">(vs paying monthly)</span>
                      </td>
                      <td className="px-4 py-6 text-right tabular-nums font-bold text-stone-400">
                        —
                      </td>
                      <td className="px-4 py-6 text-right tabular-nums font-bold text-stone-400">
                        $0
                      </td>
                      <td className="px-4 py-6 text-right tabular-nums font-bold text-[18px] text-[#017E84] bg-white relative shadow-[inset_1px_0_0_rgba(113,75,103,0.3),inset_-1px_0_0_rgba(113,75,103,0.3)]">
                        <div className="absolute inset-0 bg-[#017E84]/[0.08]"></div>
                        <span className="relative z-10">{formatCurrency(13066, true)}</span>
                      </td>
                      <td className="px-4 py-6 text-right tabular-nums font-bold text-[18px] text-[#017E84]">
                        {formatCurrency(20476, true)}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
               <div className="flex items-center gap-2.5 text-xs text-stone-500 font-semibold bg-white px-4 py-2 rounded-md border border-stone-200 shadow-sm">
                 <img src="/__mockup/images/odoo-brand/odoo_gold_partner.png" className="h-4 object-contain opacity-90" alt="Odoo Gold Partner" />
                 <span>Official Estimate</span>
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
