import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Settings, 
  Server, 
  Users, 
  Globe, 
  Check, 
  TrendingUp,
  Award
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

export function HeroCards() {
  const [country, setCountry] = useState('usd');
  const [plan, setPlan] = useState('standard');
  
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF7] text-stone-900 font-sans">
      {/* HEADER */}
      <header className="flex-shrink-0 h-14 bg-white border-b border-stone-200 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img 
            src="/__mockup/images/odoo-brand/odoo_logo.png" 
            alt="Odoo" 
            className="h-6"
            onError={(e) => {
              e.currentTarget.src = "https://odoocdn.com/openerp_website/static/src/img/assets/png/odoo_logo.png";
            }}
          />
          <div className="w-px h-6 bg-stone-200" />
          <span className="font-semibold text-[#714B67] text-sm">Quote Builder</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="h-8 gap-2 text-stone-600 border-stone-200">
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-[340px] flex-shrink-0 bg-white border-r border-stone-200 overflow-y-auto">
          <div className="p-6 space-y-8">
            
            {/* 1. Country / Currency */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" /> Country / Currency
              </label>
              <div className="flex p-1 bg-stone-100 rounded-lg">
                <button 
                  onClick={() => setCountry('usd')}
                  className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${country === 'usd' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  USD
                </button>
                <button 
                  onClick={() => setCountry('cad')}
                  className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${country === 'cad' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  CAD
                </button>
              </div>
            </div>

            {/* 2. Users */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4" /> Users
              </label>
              <Input type="number" defaultValue={25} className="bg-stone-50 border-stone-200 font-medium" />
            </div>

            {/* 3. Plan */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4" /> Plan
              </label>
              <div className="flex p-1 bg-stone-100 rounded-lg">
                <button 
                  onClick={() => setPlan('standard')}
                  className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${plan === 'standard' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  Standard
                </button>
                <button 
                  onClick={() => setPlan('custom')}
                  className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${plan === 'custom' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
                >
                  Custom
                </button>
              </div>
            </div>

            {/* 4. Implementation */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                <Check className="w-4 h-4" /> Implementation
              </label>
              <Select defaultValue="basic">
                <SelectTrigger className="bg-stone-50 border-stone-200">
                  <SelectValue placeholder="Select implementation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (50h) — $7,000</SelectItem>
                  <SelectItem value="standard">Standard (100h) — $12,500</SelectItem>
                  <SelectItem value="custom">Custom (200h) — $25,000</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 5. Odoo SH Hosting */}
            <div className="space-y-4 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4" /> Odoo SH Hosting
                </label>
                <Switch checked={true} />
              </div>
              
              <div className="pl-6 space-y-4">
                <div className="flex p-1 bg-stone-100 rounded-lg">
                  <button className="flex-1 text-xs font-medium py-1.5 bg-white text-stone-900 rounded-md shadow-sm">Shared</button>
                  <button className="flex-1 text-xs font-medium py-1.5 text-stone-500">Dedicated</button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-stone-500">Workers</label>
                    <Input type="number" defaultValue={3} className="h-8 text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-stone-500">Storage GB</label>
                    <Input type="number" defaultValue={1} className="h-8 text-sm" />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-stone-500">Staging branches</label>
                  <Input type="number" defaultValue={0} className="h-8 text-sm" />
                </div>
                
                <div className="bg-stone-50 p-2.5 rounded border border-stone-100 text-center">
                  <span className="text-[11px] font-medium text-[#714B67]">$172.80/mo annual · $216/mo monthly</span>
                </div>
              </div>
            </div>

            {/* 6. Terms to Compare */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Terms to Compare
              </label>
              <div className="flex flex-wrap gap-2">
                {['Mo', '1Y', '2Y', '3Y', '4Y', '5Y'].map(term => {
                  const isActive = ['Mo', '1Y', '3Y', '5Y'].includes(term);
                  return (
                    <button
                      key={term}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#714B67] text-white' 
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      {term}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 7. Discounts */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Discounts
              </label>
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-center">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200">
                      <th className="py-2 px-2 font-medium text-stone-500 text-left">Type</th>
                      <th className="py-2 px-2 font-medium text-stone-500">Mo</th>
                      <th className="py-2 px-2 font-medium text-stone-500">1Y</th>
                      <th className="py-2 px-2 font-medium text-stone-500">3Y</th>
                      <th className="py-2 px-2 font-medium text-stone-500">5Y</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="py-2 px-2 font-medium text-stone-600 text-left">Plan %</td>
                      <td className="py-2 px-2 text-stone-400">—</td>
                      <td className="py-2 px-2 text-stone-400">—</td>
                      <td className="py-2 px-2 font-semibold text-stone-900">10</td>
                      <td className="py-2 px-2 font-semibold text-stone-900">10</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 font-medium text-stone-600 text-left">Impl %</td>
                      <td className="py-2 px-2 font-semibold text-stone-900">5</td>
                      <td className="py-2 px-2 font-semibold text-stone-900">5</td>
                      <td className="py-2 px-2 font-semibold text-stone-900">5</td>
                      <td className="py-2 px-2 font-semibold text-stone-900">5</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </aside>

        {/* MAIN PANEL */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1200px] mx-auto space-y-8">
            
            {/* Sticky summary bar */}
            <div className="sticky top-0 z-40 bg-white border border-stone-200 rounded-full py-2.5 px-6 shadow-sm flex items-center justify-center">
              <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-stone-600 font-medium">
                <span>United States</span>
                <span className="text-stone-300">•</span>
                <span>25 users</span>
                <span className="text-stone-300">•</span>
                <span>Standard</span>
                <span className="text-stone-300">•</span>
                <span>Basic Implementation</span>
                <span className="text-stone-300">•</span>
                <span>Odoo SH Shared 3 workers</span>
              </div>
            </div>

            {/* Hero Cards Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start mt-10">
              
              {/* Monthly Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0 }}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-full"
              >
                <div className="p-6 border-b border-stone-100 flex-1">
                  <h3 className="text-lg font-bold text-stone-800 mb-4">Monthly</h3>
                  <div className="mb-6">
                    <span className="text-3xl lg:text-4xl font-bold tracking-tight text-stone-900">$7,993.50</span>
                    <span className="text-stone-500 font-medium ml-1">/mo</span>
                  </div>
                  
                  <div className="h-7 mb-6"></div> {/* Spacer for alignment */}

                  <div className="space-y-5 text-sm">
                    <div>
                      <div className="flex justify-between font-medium text-stone-700 mb-1">
                        <span>Software</span>
                        <span>$777.50</span>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between font-medium text-stone-700 mb-1">
                        <span>Implementation</span>
                        <span>$6,650.00</span>
                      </div>
                      <div className="text-xs text-stone-500 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#E4A900]" /> Includes 5% discount
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-stone-700 mb-1">
                        <span>Odoo SH Hosting</span>
                        <span>$216.00</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-stone-50 border-t border-stone-200 mt-auto">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-stone-900">Total Contract</span>
                    <span className="text-lg font-bold text-stone-900">$7,993.50</span>
                  </div>
                  <div className="text-xs text-stone-500 text-right mt-1">Single month</div>
                </div>
              </motion.div>

              {/* 1-Year Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-full"
              >
                <div className="p-6 border-b border-stone-100 flex-1">
                  <h3 className="text-lg font-bold text-stone-800 mb-4">1-Year Term</h3>
                  <div className="mb-6">
                    <span className="text-3xl lg:text-4xl font-bold tracking-tight text-stone-900">$1,349</span>
                    <span className="text-stone-500 font-medium ml-1">/mo</span>
                  </div>
                  
                  <div className="h-7 mb-6"></div> {/* Spacer for alignment */}

                  <div className="space-y-5 text-sm">
                    <div>
                      <div className="flex justify-between font-medium text-stone-700 mb-1">
                        <span>Software</span>
                        <span>$7,470.00</span>
                      </div>
                      <div className="text-xs text-stone-500 font-medium">
                        Year-1 promo applied
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between font-medium text-stone-700 mb-1">
                        <span>Implementation</span>
                        <span>$6,650.00</span>
                      </div>
                      <div className="text-xs text-stone-500 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#E4A900]" /> Includes 5% discount
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-stone-700 mb-1">
                        <span>Odoo SH Hosting</span>
                        <span>$2,073.60</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-stone-50 border-t border-stone-200 mt-auto">
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-stone-900">Total Contract</span>
                    <span className="text-lg font-bold text-stone-900">$16,193.60</span>
                  </div>
                  <div className="text-xs text-stone-500 text-right mt-1">Billed annually</div>
                </div>
              </motion.div>

              {/* 3-Year Card (BEST VALUE) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-[#FAFAF7] rounded-2xl border-2 border-[#714B67] shadow-xl overflow-hidden flex flex-col h-[calc(100%+1.5rem)] relative -mt-3 z-10"
              >
                <div className="bg-[#714B67] text-white text-center py-2 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 shadow-sm">
                  <Award className="w-3.5 h-3.5" /> Best Value
                </div>
                <div className="p-6 border-b border-stone-200 flex-1 bg-white">
                  <h3 className="text-lg font-bold text-[#714B67] mb-4">3-Year Term</h3>
                  <div className="mb-6">
                    <span className="text-3xl lg:text-4xl font-extrabold tracking-tight text-[#714B67]">$1,020</span>
                    <span className="text-stone-500 font-medium ml-1">/mo</span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#017E84]/10 text-[#017E84]">
                      Save $13,066 total
                    </span>
                  </div>

                  <div className="space-y-5 text-sm">
                    <div>
                      <div className="flex justify-between font-medium text-stone-900 mb-1">
                        <span>Software</span>
                        <span>$24,264.00</span>
                      </div>
                      <div className="text-xs text-stone-500 font-medium leading-relaxed">
                        Year-1 promo $1,860 + multi-year discount $1,866
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between font-medium text-stone-900 mb-1">
                        <span>Implementation</span>
                        <span>$6,650.00</span>
                      </div>
                      <div className="text-xs text-stone-500 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#E4A900]" /> Includes 5% discount
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-stone-900 mb-1">
                        <span>Odoo SH Hosting</span>
                        <span>$5,806.08</span>
                      </div>
                      <div className="text-xs text-stone-500 font-medium">
                        Multi-year discount applied
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-[#714B67]/[0.02] border-t border-stone-200 mt-auto">
                  <div className="flex justify-between items-end mb-4">
                    <span className="font-bold text-stone-900">Total Contract</span>
                    <span className="text-xl font-bold text-[#714B67]">$36,720.08</span>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-[#017E84]/20 flex items-start gap-3 shadow-sm">
                    <div className="bg-[#017E84] p-1.5 rounded text-white mt-0.5 shadow-sm">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-stone-900 leading-none mb-1.5">Catalyst Finance</div>
                      <div className="text-xs text-[#017E84] font-medium leading-none">As low as $1,117/mo</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* 5-Year Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-full"
              >
                <div className="p-6 border-b border-stone-100 flex-1">
                  <h3 className="text-lg font-bold text-stone-800 mb-4">5-Year Term</h3>
                  <div className="mb-6">
                    <span className="text-3xl lg:text-4xl font-bold tracking-tight text-stone-900">$954</span>
                    <span className="text-stone-500 font-medium ml-1">/mo</span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[#017E84]/10 text-[#017E84]">
                      Save $20,476 total
                    </span>
                  </div>

                  <div className="space-y-5 text-sm">
                    <div>
                      <div className="flex justify-between font-medium text-stone-700 mb-1">
                        <span>Software</span>
                        <span>$41,058.00</span>
                      </div>
                      <div className="text-xs text-stone-500 font-medium leading-relaxed">
                        Year-1 promo $1,860 + multi-year discount $3,732
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between font-medium text-stone-700 mb-1">
                        <span>Implementation</span>
                        <span>$6,650.00</span>
                      </div>
                      <div className="text-xs text-stone-500 font-medium flex items-center gap-1">
                        <Check className="w-3 h-3 text-[#E4A900]" /> Includes 5% discount
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-medium text-stone-700 mb-1">
                        <span>Odoo SH Hosting</span>
                        <span>$9,538.56</span>
                      </div>
                      <div className="text-xs text-stone-500 font-medium">
                        Multi-year discount applied
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-stone-50 border-t border-stone-200 mt-auto">
                  <div className="flex justify-between items-end mb-4">
                    <span className="font-bold text-stone-900">Total Contract</span>
                    <span className="text-lg font-bold text-stone-900">$57,246.56</span>
                  </div>
                  
                  <div className="bg-white rounded-lg p-3 border border-stone-200 flex items-start gap-3 shadow-sm">
                    <div className="bg-stone-200 p-1.5 rounded text-stone-600 mt-0.5">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-stone-900 leading-none mb-1.5">Catalyst Finance</div>
                      <div className="text-xs font-medium text-stone-600 leading-none">As low as $1,107/mo</div>
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </main>

      </div>
    </div>
  );
}
