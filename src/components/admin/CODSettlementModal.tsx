import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  AlertTriangle,
  Banknote,
  Calendar,
  FileText,
  Truck,
  Hash,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { Order } from '../../types.ts';

interface CODSettlementModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedOrder: Order) => void;
}

export const CODSettlementModal: React.FC<CODSettlementModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen || !order) return null;

  const expectedAmount = order.totalAmount ?? order.total ?? 0;
  const [settlementAmount, setSettlementAmount] = useState<string>(expectedAmount.toFixed(2));
  const [settlementDate, setSettlementDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [settlementReference, setSettlementReference] = useState<string>('');
  const [courierName, setCourierName] = useState<string>(order.courierName || 'Standard Express');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (order) {
      setSettlementAmount((order.settlementAmount ?? expectedAmount).toFixed(2));
      setSettlementReference(order.settlementReference || '');
      setCourierName(order.courierName || 'Standard Express');
      setSettlementDate(order.settlementDate ? order.settlementDate.slice(0, 10) : new Date().toISOString().slice(0, 10));
      setNotes(order.notes || '');
      setErrorMessage(null);
    }
  }, [order, expectedAmount]);

  const numericSettlement = parseFloat(settlementAmount) || 0;
  const discrepancy = Math.round((numericSettlement - expectedAmount) * 100) / 100;
  const hasDiscrepancy = Math.abs(discrepancy) > 0.01;
  const isShortage = discrepancy < -0.01;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementReference.trim()) {
      setErrorMessage('Please enter the courier settlement reference or bank UTR number.');
      return;
    }

    if (isNaN(numericSettlement) || numericSettlement < 0) {
      setErrorMessage('Please enter a valid non-negative settlement amount.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.recordCODSettlement(order.id, {
        settlementAmount: numericSettlement,
        settlementDate,
        settlementReference: settlementReference.trim(),
        courierName: courierName.trim(),
        notes: notes.trim(),
      });

      if (res.success && res.order) {
        onSuccess(res.order);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record COD settlement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-white/15 rounded-3xl max-w-lg w-full shadow-2xl text-stone-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-medium text-white">
                Record COD Courier Settlement
              </h3>
              <p className="text-xs text-stone-400 font-mono">
                Order #{order.orderId || order.id} &bull; {order.customerInformation?.fullName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Amount Comparison Box */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] text-stone-400 block uppercase tracking-wider font-semibold">
                Expected COD Amount
              </span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                ${expectedAmount.toFixed(2)}
              </span>
              <span className="text-[10px] text-stone-400">Order value due from customer</span>
            </div>

            <div>
              <span className="text-[11px] text-stone-400 block uppercase tracking-wider font-semibold">
                Courier Payout Status
              </span>
              <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider mt-1 ${
                order.paymentStatus === 'COD_COLLECTED'
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-800'
              }`}>
                {order.paymentStatus === 'COD_COLLECTED' ? 'Cash Collected' : 'Collection Pending'}
              </span>
            </div>
          </div>

          {/* Settlement Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Net Amount Remitted */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Banknote className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Remitted Amount ($) *</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={settlementAmount}
                onChange={(e) => setSettlementAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-sm font-mono focus:border-[#D4AF37] focus:outline-none"
                placeholder="0.00"
              />
            </div>

            {/* Settlement Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Settlement Date *</span>
              </label>
              <input
                type="date"
                required
                value={settlementDate}
                onChange={(e) => setSettlementDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-sm focus:border-[#D4AF37] focus:outline-none"
              />
            </div>
          </div>

          {/* Settlement Reference / UTR */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-stone-400" />
              <span>Courier Remittance Ref / Bank UTR Number *</span>
            </label>
            <input
              type="text"
              required
              value={settlementReference}
              onChange={(e) => setSettlementReference(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs font-mono placeholder:text-stone-500 focus:border-[#D4AF37] focus:outline-none"
              placeholder="e.g. UTR-2026-BD884920 or REMIT-DELH-9921"
            />
          </div>

          {/* Courier Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-stone-400" />
              <span>Courier / Fulfillment Partner</span>
            </label>
            <input
              type="text"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-black/40 text-white text-xs placeholder:text-stone-500 focus:border-[#D4AF37] focus:outline-none"
              placeholder="e.g. Blue Dart, Delhivery, FedEx"
            />
          </div>

          {/* Discrepancy Alert */}
          {hasDiscrepancy && (
            <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
              isShortage
                ? 'bg-amber-950/60 border-amber-600/60 text-amber-200'
                : 'bg-blue-950/60 border-blue-600/60 text-blue-200'
            }`}>
              <div className="flex items-center gap-2 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  {isShortage
                    ? `Remittance Shortfall: -$${Math.abs(discrepancy).toFixed(2)}`
                    : `Excess Remittance: +$${discrepancy.toFixed(2)}`}
                </span>
              </div>
              <p className="text-[11px] opacity-90 leading-relaxed">
                {isShortage
                  ? 'The remitted amount is lower than the order total. This typically reflects courier handling fees, COD charges, or partial deduction. This order will be flagged as "Reconciliation Required" unless noted.'
                  : 'The remitted amount exceeds the order total. Please confirm courier adjustments.'}
              </p>
            </div>
          )}

          {/* Notes / Reason */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>Settlement &amp; Reconciliation Notes</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-white/15 bg-black/40 text-white text-xs placeholder:text-stone-500 focus:border-[#D4AF37] focus:outline-none resize-none"
              placeholder="e.g. Courier deducted $2.50 COD handling fee; verified via weekly remittance statement."
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-stone-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Recording Settlement...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Confirm Settlement</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
