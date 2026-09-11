import React, { useState, useEffect } from 'react';
import {
  X,
  Banknote,
  Truck,
  Calendar,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Printer,
  Copy,
  Check,
  History,
  ShieldCheck,
  Clock,
  ArrowRight,
  Loader2,
  ExternalLink,
  Edit2,
  Save,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { Order, AuditLogItem } from '../../types.ts';

interface OrderPaymentDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onOpenSettlement: (order: Order) => void;
}

export const OrderPaymentDetailsModal: React.FC<OrderPaymentDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onRefresh,
  onOpenSettlement,
}) => {
  if (!isOpen || !order) return null;

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState<boolean>(true);
  const [copiedTracking, setCopiedTracking] = useState<boolean>(false);
  const [isRecordingCollection, setIsRecordingCollection] = useState<boolean>(false);
  const [collectionSuccess, setCollectionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Edit Courier Section
  const [isEditingCourier, setIsEditingCourier] = useState<boolean>(false);
  const [courierNameInput, setCourierNameInput] = useState<string>(order.courierName || '');
  const [trackingNumberInput, setTrackingNumberInput] = useState<string>(order.trackingNumber || '');
  const [shipmentStatusInput, setShipmentStatusInput] = useState<string>(order.shipmentStatus || 'NOT_DISPATCHED');
  const [isSavingCourier, setIsSavingCourier] = useState<boolean>(false);

  useEffect(() => {
    if (order) {
      setCourierNameInput(order.courierName || '');
      setTrackingNumberInput(order.trackingNumber || '');
      setShipmentStatusInput(order.shipmentStatus || 'NOT_DISPATCHED');
      loadAuditLogs(order.id);
    }
  }, [order]);

  const loadAuditLogs = async (orderId: string) => {
    try {
      setLoadingLogs(true);
      const res = await api.getOrderAuditLogs(orderId);
      setAuditLogs(res.auditLogs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleRecordCollection = async () => {
    if (!order) return;
    setIsRecordingCollection(true);
    setActionError(null);
    try {
      const res = await api.recordCODCollection(order.id);
      if (res.success) {
        setCollectionSuccess('COD Collection recorded successfully from courier partner.');
        setTimeout(() => setCollectionSuccess(null), 3500);
        onRefresh();
        loadAuditLogs(order.id);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to record COD collection.');
    } finally {
      setIsRecordingCollection(false);
    }
  };

  const handleSaveCourierDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsSavingCourier(true);
    setActionError(null);
    try {
      const res = await api.updateCourierDetails(order.id, {
        courierName: courierNameInput.trim(),
        trackingNumber: trackingNumberInput.trim(),
        shipmentStatus: shipmentStatusInput,
      });
      if (res.success) {
        setIsEditingCourier(false);
        onRefresh();
        loadAuditLogs(order.id);
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to update courier details.');
    } finally {
      setIsSavingCourier(false);
    }
  };

  const handleCopyTracking = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const isCOD = !order.paymentMethod ||
    order.paymentMethod.toUpperCase().includes('COD') ||
    order.paymentMethod.toUpperCase().includes('CASH');

  const totalAmount = order.totalAmount ?? order.total ?? 0;
  const isCollected = order.paymentStatus === 'COD_COLLECTED' || order.paymentStatus === 'PAID';
  const isSettled = order.settlementStatus === 'SETTLED';
  const isReconNeeded = order.settlementStatus === 'RECONCILIATION_REQUIRED';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#161616] border border-white/15 rounded-3xl max-w-2xl w-full shadow-2xl text-stone-100 max-h-[92vh] flex flex-col overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-[#1A1A1A]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center font-bold">
              <Banknote className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">
                  Payment &amp; Fulfillment Dossier
                </span>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/10 text-white">
                  #{order.orderId || order.id}
                </span>
              </div>
              <h3 className="font-display text-xl font-medium text-white mt-0.5">
                {order.customerInformation?.fullName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/shipping/label/${encodeURIComponent(order.trackingNumber || order.orderId || order.id)}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Courier Shipping Label & Dispatch Slip"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">Print Label</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {actionError && (
            <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{actionError}</span>
            </div>
          )}

          {collectionSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{collectionSuccess}</span>
            </div>
          )}

          {/* 1. Status Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Payment Method & Collection */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                Payment Method
              </span>
              <div className="flex items-center gap-1.5">
                <Banknote className="w-4 h-4 text-[#D4AF37]" />
                <strong className="text-white text-sm">
                  {order.paymentMethod || 'CASH ON DELIVERY'}
                </strong>
              </div>
              <div className="pt-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                  isCollected
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950/70 text-amber-300 border border-amber-800'
                }`}>
                  {isCollected ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{isCOD ? 'COD Collected' : 'Paid'}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{isCOD ? 'COD Pending' : 'Pending'}</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Courier Settlement Status */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                Courier Settlement
              </span>
              <div className="text-white text-sm font-semibold">
                {order.settlementStatus?.replace(/_/g, ' ') || 'PENDING COLLECTION'}
              </div>
              <div className="pt-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                  isSettled
                    ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                    : isReconNeeded
                    ? 'bg-red-950/70 text-red-300 border border-red-800'
                    : order.settlementStatus === 'COD_COLLECTED'
                    ? 'bg-blue-950/70 text-blue-300 border border-blue-800'
                    : 'bg-stone-800 text-stone-300 border border-stone-700'
                }`}>
                  {isSettled ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Remitted &amp; Settled</span>
                    </>
                  ) : isReconNeeded ? (
                    <>
                      <AlertTriangle className="w-3 h-3 text-red-400" />
                      <span>Recon Required</span>
                    </>
                  ) : order.settlementStatus === 'COD_COLLECTED' ? (
                    <>
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>Awaiting Courier Remit</span>
                    </>
                  ) : (
                    <span>Pending Delivery</span>
                  )}
                </span>
              </div>
            </div>

            {/* Financial Total */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold block">
                Order Value Due
              </span>
              <div className="text-2xl font-bold font-mono text-[#D4AF37]">
                ${totalAmount.toFixed(2)}
              </div>
              <div className="text-[11px] text-stone-400">
                Qty: {order.quantity} &bull; Free Shipping
              </div>
            </div>

          </div>

          {/* 2. Settlement Details Card (if settled or discrepancy) */}
          {(order.settlementReference || isSettled || isReconNeeded) && (
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>Courier Settlement Record</span>
                </span>
                <span className="text-xs font-mono text-stone-400">
                  Ref: {order.settlementReference || 'N/A'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Remitted Amount</span>
                  <strong className="text-white text-sm font-mono">
                    ${(order.settlementAmount ?? totalAmount).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Settlement Date</span>
                  <span className="text-stone-200">
                    {order.settlementDate
                      ? new Date(order.settlementDate).toLocaleDateString()
                      : 'Pending'}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Courier Partner</span>
                  <span className="text-stone-200">{order.courierName || 'Standard Express'}</span>
                </div>

                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Settlement Status</span>
                  <span className="font-semibold text-emerald-400">{order.settlementStatus}</span>
                </div>
              </div>

              {order.notes && (
                <div className="p-2.5 rounded-xl bg-white/5 text-[11px] text-stone-300 border border-white/5">
                  <span className="text-stone-400 font-semibold">Remarks: </span>
                  {order.notes}
                </div>
              )}
            </div>
          )}

          {/* 3. Action Bar: Record Collection & Mark Settled */}
          <div className="p-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                Payment Lifecycle Actions
              </h4>
              <p className="text-xs text-stone-300 mt-0.5">
                {isSettled
                  ? 'This COD order has been remitted by the courier and fully reconciled.'
                  : !isCollected
                  ? 'Step 1: Confirm courier collected cash from customer at doorstep.'
                  : 'Step 2: Courier has collected cash. Record bank remittance and settle.'}
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {!isCollected && isCOD && (
                <button
                  onClick={handleRecordCollection}
                  disabled={isRecordingCollection}
                  className="px-4 py-2 rounded-xl bg-[#2A4B3C] hover:bg-[#386652] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isRecordingCollection ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Record Customer Collection</span>
                </button>
              )}

              {isCollected && !isSettled && (
                <button
                  onClick={() => onOpenSettlement(order)}
                  className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black text-xs font-bold uppercase tracking-wider transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Banknote className="w-3.5 h-3.5" />
                  <span>Reconcile &amp; Mark Settled</span>
                </button>
              )}

              {isSettled && (
                <button
                  onClick={() => onOpenSettlement(order)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-stone-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Update Settlement
                </button>
              )}
            </div>
          </div>

          {/* 4. Courier & Fulfillment Management */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#D4AF37]" />
                <span>Courier Logistics &amp; Waybill</span>
              </span>
              <button
                onClick={() => setIsEditingCourier(!isEditingCourier)}
                className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>{isEditingCourier ? 'Cancel' : 'Edit Courier'}</span>
              </button>
            </div>

            {isEditingCourier ? (
              <form onSubmit={handleSaveCourierDetails} className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-400 font-semibold block">Courier Name</label>
                    <input
                      type="text"
                      value={courierNameInput}
                      onChange={(e) => setCourierNameInput(e.target.value)}
                      placeholder="e.g. Blue Dart, Delhivery"
                      className="w-full px-3 py-2 rounded-xl border border-white/15 bg-black/40 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-400 font-semibold block">Waybill / Tracking #</label>
                    <input
                      type="text"
                      value={trackingNumberInput}
                      onChange={(e) => setTrackingNumberInput(e.target.value)}
                      placeholder="e.g. BD-98234110"
                      className="w-full px-3 py-2 rounded-xl border border-white/15 bg-black/40 text-xs font-mono text-white focus:border-[#D4AF37] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-stone-400 font-semibold block">Shipment Status</label>
                    <select
                      value={shipmentStatusInput}
                      onChange={(e) => setShipmentStatusInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-white/15 bg-black/40 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="NOT_DISPATCHED">NOT DISPATCHED</option>
                      <option value="MANIFEST_CREATED">MANIFEST CREATED</option>
                      <option value="PICKED_UP">PICKED UP</option>
                      <option value="IN_TRANSIT">IN TRANSIT</option>
                      <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="RTO_INITIATED">RTO INITIATED</option>
                      <option value="RETURNED">RETURNED</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSavingCourier}
                    className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingCourier ? 'Saving...' : 'Save Courier Details'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Partner</span>
                  <strong className="text-white text-sm">
                    {order.courierName || 'Standard Express'}
                  </strong>
                </div>

                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Waybill / Tracking #</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <strong className="text-stone-200 font-mono text-xs">
                      {order.trackingNumber || 'Unassigned'}
                    </strong>
                    {order.trackingNumber && (
                      <button
                        onClick={() => handleCopyTracking(order.trackingNumber!)}
                        className="p-1 text-stone-400 hover:text-white"
                        title="Copy Waybill Number"
                      >
                        {copiedTracking ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-stone-400 block text-[10px] uppercase">Shipment Status</span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-white font-mono text-[11px] inline-block mt-0.5">
                    {order.shipmentStatus?.replace(/_/g, ' ') || 'NOT DISPATCHED'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 5. Customer Delivery Address (Full Address visible to Authenticated Admin) */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300 block">
              Customer Shipping Information (Admin Unmasked)
            </span>
            <div className="space-y-0.5 text-stone-200">
              <div className="font-semibold text-white text-sm">
                {order.customerInformation?.fullName}
              </div>
              <div>{order.customerInformation?.address}</div>
              <div>
                {order.customerInformation?.city}, {order.customerInformation?.state} -{' '}
                <span className="font-mono font-bold text-white">
                  {order.customerInformation?.postalCode}
                </span>
              </div>
              <div className="pt-1 text-stone-400 font-mono">
                Phone: <strong className="text-stone-200">{order.customerInformation?.phone}</strong> &bull; Email:{' '}
                <strong className="text-stone-200">{order.customerInformation?.email}</strong>
              </div>
            </div>
          </div>

          {/* 6. Immutable Audit Trail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#D4AF37]" />
                <span>Security Audit Trail &amp; Status Logs</span>
              </span>
              <span className="text-[10px] text-stone-400">Server-Authoritative Ledger</span>
            </div>

            {loadingLogs ? (
              <div className="py-6 text-center text-xs text-stone-400 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                <span>Loading audit trail...</span>
              </div>
            ) : auditLogs.length === 0 ? (
              <div className="py-4 text-center text-xs text-stone-500 font-light">
                No state change logs recorded yet for this order.
              </div>
            ) : (
              <div className="space-y-2 border-l-2 border-white/15 pl-4 ml-1">
                {auditLogs.map((log, index) => (
                  <div key={log.id || index} className="relative text-xs space-y-0.5 pb-2">
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#D4AF37]" />
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-white uppercase text-[11px] tracking-wider">
                        {log.action?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {log.performedByName && (
                      <div className="text-[10px] text-stone-400">
                        Admin: <span className="text-stone-200">{log.performedByName}</span>
                      </div>
                    )}
                    {log.notes && (
                      <p className="text-[11px] text-stone-300 font-light leading-relaxed">
                        {log.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 flex justify-end bg-[#1A1A1A]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
