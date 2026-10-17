/**
-- ==============================================================================
-- FOOTAZIX — Client Portal: Invoices & Billing
-- File: src/components/clients/ClientInvoices.tsx
-- ==============================================================================
*/

import React, { useState } from 'react';
import { ClientInvoice, InvoicePaymentStatus } from '../../types/clientPortal';
import {
  Receipt,
  Download,
  Calendar,
  Layers,
  ChevronDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';

interface ClientInvoicesProps {
  invoices: ClientInvoice[];
}

export const ClientInvoices: React.FC<ClientInvoicesProps> = ({ invoices }) => {
  const [expandedId, setExpandedId] = useState<string | null>(invoices[0]?.id || null);

  const getStatusBadge = (status: InvoicePaymentStatus) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-400" />
            <span>PAID</span>
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span>OVERDUE</span>
          </span>
        );
      case 'ISSUED':
      case 'PARTIALLY PAID':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>PENDING PAYMENT</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-zinc-800 text-zinc-400 border border-white/10">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
            Invoices & Billing
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            Itemized invoices, retainer billings, payment history, and downloadable PDF receipts.
          </p>
        </div>

        <div className="text-xs font-mono text-zinc-400 bg-[#0e0e18] px-3.5 py-1.5 rounded-xl border border-white/5 self-start sm:self-auto">
          {invoices.length} Invoice{invoices.length === 1 ? '' : 's'}
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#090910] border border-white/5 space-y-3">
          <Receipt className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-300">No invoices issued</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Invoices and billing statements issued to your account will be listed here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {invoices.map((inv) => {
            const isExpanded = expandedId === inv.id;

            return (
              <div
                key={inv.id}
                className="rounded-3xl bg-[#090910] border border-white/10 overflow-hidden transition-all"
              >
                {/* Header row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                  className="p-5 sm:p-6 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                      <Receipt className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-white">
                          #{inv.invoice_number}
                        </span>
                        {getStatusBadge(inv.payment_status)}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-500 font-mono">
                        <span>Issued: {inv.issue_date}</span>
                        <span>Due: {inv.due_date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-bold text-white font-mono">
                        {inv.currency || '$'} {Number(inv.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-zinc-500 uppercase font-mono">
                        Total Amount
                      </div>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 transition-transform ${
                        isExpanded ? 'rotate-180 text-white' : ''
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Expanded Itemized Breakdown */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-white/5 bg-[#050508] space-y-6">
                    {/* Line Items Table */}
                    <div className="rounded-2xl border border-white/5 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0e0e18] text-zinc-400 text-[10px] font-mono uppercase border-b border-white/5">
                          <tr>
                            <th className="py-3 px-4">Description</th>
                            <th className="py-3 px-4 text-center">Qty</th>
                            <th className="py-3 px-4 text-right">Unit Price</th>
                            <th className="py-3 px-4 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-[#090910]">
                          {inv.line_items && inv.line_items.length > 0 ? (
                            inv.line_items.map((item, idx) => (
                              <tr key={idx} className="hover:bg-white/[0.01]">
                                <td className="py-3 px-4 text-zinc-200 font-medium">
                                  {item.description}
                                </td>
                                <td className="py-3 px-4 text-center font-mono text-zinc-400">
                                  {item.quantity}
                                </td>
                                <td className="py-3 px-4 text-right font-mono text-zinc-400">
                                  {inv.currency || '$'}{Number(item.unit_price).toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-right font-mono text-white font-semibold">
                                  {inv.currency || '$'}{Number(item.total).toFixed(2)}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-4 px-4 text-center text-zinc-500">
                                Standard Retainer Deliverable Package
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals Summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                      <div className="text-xs text-zinc-400 space-y-1">
                        {inv.notes && (
                          <p className="p-3 rounded-xl bg-[#0e0e18] border border-white/5 max-w-md">
                            <strong className="text-zinc-300">Notes: </strong> {inv.notes}
                          </p>
                        )}
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Payment handled via direct wire / agency account.
                        </p>
                      </div>

                      <div className="space-y-1.5 min-w-[200px] text-right font-mono text-xs">
                        {inv.subtotal > 0 && (
                          <div className="flex justify-between text-zinc-400">
                            <span>Subtotal:</span>
                            <span>{inv.currency || '$'}{Number(inv.subtotal).toFixed(2)}</span>
                          </div>
                        )}
                        {inv.tax > 0 && (
                          <div className="flex justify-between text-zinc-400">
                            <span>Tax:</span>
                            <span>{inv.currency || '$'}{Number(inv.tax).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-white/10">
                          <span>Total:</span>
                          <span className="text-blue-400">
                            {inv.currency || '$'}{Number(inv.total_amount).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* PDF Download Button */}
                    {inv.pdf_url && (
                      <div className="pt-2 border-t border-white/5 flex justify-end">
                        <a
                          href={inv.pdf_url}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Invoice PDF</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
