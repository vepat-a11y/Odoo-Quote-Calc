import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Printer, Check, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Decomposed() {
  const brandPurple = '#714B67';
  const brandTeal = '#017E84';
  const bgOffWhite = '#F4F3EF';

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatNoDecimals = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const ThCell = ({ children, isBestValue = false, className = '' }: any) => (
    <th className={`px-4 py-4 font-semibold text-right relative ${isBestValue ? 'bg-[#F9F8F6]' : ''} ${className}`}>
      {isBestValue && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-[#714B67]" />
      )}
      {children}
    </th>
  );

  const TdLabel = ({ children, indent = false, isBold = false, className = '' }: any) => (
    <td className={`px-4 py-3 text-left border-b border-gray-100 ${indent ? 'pl-8 text-gray-500' : 'text-gray-900'} ${isBold ? 'font-semibold' : ''} ${className}`}>
      {children}
    </td>
  );

  const TdValue = ({ val, isBestValue = false, isDeduction = false, isBold = false, className = '', isDash = false }: any) => (
    <td className={`px-4 py-3 text-right tabular-nums border-b border-gray-100 ${isBestValue ? 'bg-[#F9F8F6] border-x border-x-[#EAE8E1]' : ''} ${isDeduction ? 'text-red-600' : 'text-gray-900'} ${isBold ? 'font-semibold' : ''} ${className}`}>
      {isDash ? '—' : (isDeduction ? `-${formatCurrency(val)}` : formatCurrency(val))}
    </td>
  );

  return (
    <div className="min-h-screen font-sans text-gray-900" style={{ backgroundColor: bgOffWhite }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-6">
            <img src="/__mockup/images/odoo-brand/odoo_logo.png" alt="Odoo Logo" className="h-8" />
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">Quote Comparison</h1>
              <p className="text-sm text-gray-500 mt-1">United States · Standard · 25 users · Basic Implementation · Odoo SH Shared</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="h-9 gap-2 text-gray-600 border-gray-200">
              <Printer className="w-4 h-4" /> Print
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 text-gray-600 border-gray-200">
              <FileText className="w-4 h-4" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Document Table Container */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-4 text-left w-1/3"></th>
                  <ThCell>Monthly</ThCell>
                  <ThCell>1-Year</ThCell>
                  <ThCell isBestValue>
                    <div className="flex flex-col items-end">
                      <span className="inline-block bg-[#714B67] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-1">Best Value</span>
                      <span>3-Year</span>
                    </div>
                  </ThCell>
                  <ThCell>5-Year</ThCell>
                </tr>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                  <td className="px-4 py-2 font-medium">Per-user / month rate</td>
                  <td className="px-4 py-2 text-right tabular-nums">$31.10</td>
                  <td className="px-4 py-2 text-right tabular-nums">$24.90</td>
                  <td className="px-4 py-2 text-right tabular-nums bg-[#F9F8F6] border-x border-x-[#EAE8E1]">$27.99 <span className="text-gray-400 font-normal">(avg)</span></td>
                  <td className="px-4 py-2 text-right tabular-nums">$27.99 <span className="text-gray-400 font-normal">(avg)</span></td>
                </tr>
              </thead>
              <tbody>
                
                {/* SOFTWARE LICENSE */}
                <tr>
                  <td colSpan={5} className="px-4 pt-6 pb-2 font-bold text-xs uppercase tracking-wider text-[#714B67] bg-white">Software License</td>
                </tr>
                <tr>
                  <TdLabel indent>List price (yr2+ rate × term)</TdLabel>
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
                  <TdLabel indent>Multi-year discount (10%)</TdLabel>
                  <TdValue isDash />
                  <TdValue isDash />
                  <TdValue val={1866} isDeduction isBestValue />
                  <TdValue val={3732} isDeduction />
                </tr>
                <tr>
                  <TdLabel isBold>Software Subtotal</TdLabel>
                  <TdValue val={777.50} isBold />
                  <TdValue val={7470} isBold />
                  <TdValue val={24264} isBold isBestValue />
                  <TdValue val={41058} isBold />
                </tr>

                {/* IMPLEMENTATION */}
                <tr>
                  <td colSpan={5} className="px-4 pt-8 pb-2 font-bold text-xs uppercase tracking-wider text-[#714B67] bg-white border-t border-gray-100">Implementation <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(One-time)</span></td>
                </tr>
                <tr>
                  <TdLabel indent>Basic package list</TdLabel>
                  <TdValue val={7000} />
                  <TdValue val={7000} />
                  <TdValue val={7000} isBestValue />
                  <TdValue val={7000} />
                </tr>
                <tr>
                  <TdLabel indent>Implementation discount (5%)</TdLabel>
                  <TdValue val={350} isDeduction />
                  <TdValue val={350} isDeduction />
                  <TdValue val={350} isDeduction isBestValue />
                  <TdValue val={350} isDeduction />
                </tr>
                <tr>
                  <TdLabel isBold>Implementation Subtotal</TdLabel>
                  <TdValue val={6650} isBold />
                  <TdValue val={6650} isBold />
                  <TdValue val={6650} isBold isBestValue />
                  <TdValue val={6650} isBold />
                </tr>

                {/* HOSTING */}
                <tr>
                  <td colSpan={5} className="px-4 pt-8 pb-2 font-bold text-xs uppercase tracking-wider text-[#714B67] bg-white border-t border-gray-100">Odoo SH Hosting <span className="text-gray-400 font-normal normal-case tracking-normal ml-1">(Shared · 3 workers)</span></td>
                </tr>
                <tr>
                  <TdLabel indent>Hosting rate × term</TdLabel>
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
                <tr>
                  <TdLabel isBold>Hosting Subtotal</TdLabel>
                  <TdValue val={216} isBold />
                  <TdValue val={2073.60} isBold />
                  <TdValue val={5806.08} isBold isBestValue />
                  <TdValue val={9538.56} isBold />
                </tr>

                {/* HEAVY HR */}
                <tr>
                  <td colSpan={5} className="p-0"><div className="h-[2px] bg-gray-300 w-full" /></td>
                </tr>

                {/* TOTAL CONTRACT */}
                <tr className="bg-[#FAF9F8]">
                  <td className="px-4 py-5 text-left font-bold text-lg text-gray-900 border-b border-gray-200">
                    Total Contract
                  </td>
                  <td className="px-4 py-5 text-right tabular-nums font-bold text-lg text-gray-900 border-b border-gray-200">
                    {formatCurrency(7993.50)}
                  </td>
                  <td className="px-4 py-5 text-right tabular-nums font-bold text-lg text-gray-900 border-b border-gray-200">
                    {formatCurrency(16193.60)}
                  </td>
                  <td className="px-4 py-5 text-right tabular-nums font-bold text-lg text-[#714B67] border-b border-gray-200 bg-[#F4F1F3] border-x border-x-[#EAE8E1]">
                    {formatCurrency(36720.08)}
                  </td>
                  <td className="px-4 py-5 text-right tabular-nums font-bold text-lg text-gray-900 border-b border-gray-200">
                    {formatCurrency(57246.56)}
                  </td>
                </tr>

                {/* AMORTIZED */}
                <tr>
                  <td className="px-4 py-3 text-left font-medium text-gray-600 border-b border-gray-200">
                    Per month amortized
                  </td>
                  <TdValue val={7994} isDash={false} className="text-gray-500" />
                  <TdValue val={1349} isDash={false} className="text-gray-500" />
                  <TdValue val={1020} isDash={false} isBestValue className="font-semibold text-gray-900" />
                  <TdValue val={954} isDash={false} className="text-gray-500" />
                </tr>

                {/* FINANCING */}
                <tr>
                  <td className="px-4 py-3 text-left border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-600">Financing</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Catalyst</span>
                    </div>
                  </td>
                  <TdValue isDash className="text-gray-400" />
                  <TdValue isDash className="text-gray-400" />
                  <td className="px-4 py-3 text-right tabular-nums border-b border-gray-200 bg-[#F9F8F6] border-x border-x-[#EAE8E1]">
                    <div className="text-sm text-gray-900">As low as <span className="font-semibold">{formatNoDecimals(1117)}</span>/mo</div>
                    <div className="text-xs text-gray-400">up to {formatNoDecimals(1237)}/mo</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums border-b border-gray-200">
                    <div className="text-sm text-gray-900">As low as <span className="font-semibold">{formatNoDecimals(1107)}</span>/mo</div>
                    <div className="text-xs text-gray-400">up to {formatNoDecimals(1302)}/mo</div>
                  </td>
                </tr>

                {/* HEAVY HR */}
                <tr>
                  <td colSpan={5} className="p-0"><div className="h-[2px] bg-gray-300 w-full" /></td>
                </tr>

                {/* SAVINGS */}
                <tr className="bg-teal-50">
                  <td className="px-4 py-5 text-left font-bold text-[15px] text-teal-800">
                    You Save <span className="text-xs font-normal text-teal-600 ml-1">(vs monthly)</span>
                  </td>
                  <td className="px-4 py-5 text-right tabular-nums text-teal-700">
                    —
                  </td>
                  <td className="px-4 py-5 text-right tabular-nums text-teal-700">
                    $0
                  </td>
                  <td className="px-4 py-5 text-right tabular-nums font-bold text-[15px] text-teal-700 border-x border-teal-100 bg-teal-100/50">
                    {formatCurrency(13066)}
                  </td>
                  <td className="px-4 py-5 text-right tabular-nums font-bold text-[15px] text-teal-700">
                    {formatCurrency(20476)}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </motion.div>
        
        <div className="mt-8 text-center text-sm text-gray-400">
          This is an estimate and not a binding contract. Final pricing will be confirmed during checkout.
        </div>
      </div>
    </div>
  );
}
