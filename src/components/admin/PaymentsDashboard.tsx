import React, { useState, useEffect, useMemo } from 'react';
import {
  Banknote,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Search,
  Filter,
  Download,
  Eye,
  Check,
  Truck,
  Printer,
  Calendar,
  DollarSign,
  ArrowUpDown,
  RefreshCw,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { CODSettlementModal } from './CODSettlementModal.tsx';
import { OrderPaymentDetailsModal } from './OrderPaymentDetailsModal.tsx';
import type { Order, PaymentSummary } from '../../types.ts';

interface PaymentsDashboardProps {
  orders: Order[];
  onRefreshOrders: () => void;
}

export const PaymentsDashboard: React.FC<PaymentsDashboardProps> = ({
  orders,
  onRefreshOrders,
}) => {
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [settlementFilter, setSettlementFilter] = useState<string>('ALL');
  const [courierFilter, setCourierFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'all' | 'reconciliation' | 'courier_report'>('all');

  // Modals
  const [settlementOrder, setSettlementOrder] = useState<Order | null>(null);
  const [dossierOrder, setDossierOrder] = useState<Order | null>(null);

  // Direct quick action loading
  const [quickActionLoadingId, setQuickActionLoadingId] = useState<string | null>(null);

  const loadSummary = async () => {
    try {
      setLoadingSummary(true);
      const res = await api.getPaymentSummary();
      setSummary(res.summary);
    } catch (err) {
      console.error('Failed to load payment summary', err);
    } finally {
      setLoadingSummary(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [orders]);

  // Extract unique couriers for filter dropdown
  const uniqueCouriers = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      if (o.courierName && o.courierName.trim()) {
        set.add(o.courierName.trim());
      }
    });
    return Array.from(set);
  }, [orders]);

  // Filtered COD orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Must be COD or payment relevant
      const isCod = !o.paymentMethod ||
        o.paymentMethod.toUpperCase().includes('COD') ||
        o.paymentMethod.toUpperCase().includes('CASH');

      if (!isCod) return false;

      // View mode filter
      if (viewMode === 'reconciliation') {
        const needsRecon = o.settlementStatus === 'RECONCILIATION_REQUIRED' ||
          (o.paymentStatus === 'COD_COLLECTED' && o.settlementStatus !== 'SETTLED');
        if (!needsRecon) return false;
      }

      // Settlement Status Filter
      if (settlementFilter !== 'ALL') {
        if (o.settlementStatus !== settlementFilter) return false;
      }

      // Courier Filter
      if (courierFilter !== 'ALL') {
        const orderCourier = (o.courierName || 'Standard Express').toLowerCase();
        if (orderCourier !== courierFilter.toLowerCase()) return false;
      }

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch = (o.orderId || o.id).toLowerCase().includes(q);
        const nameMatch = (o.customerInformation?.fullName || '').toLowerCase().includes(q);
        const cityMatch = (o.customerInformation?.city || '').toLowerCase().includes(q);
        const trackingMatch = (o.trackingNumber || '').toLowerCase().includes(q);
        const refMatch = (o.settlementReference || '').toLowerCase().includes(q);
        const courierMatch = (o.courierName || '').toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !cityMatch && !trackingMatch && !refMatch && !courierMatch) {
          return false;
        }
      }

      return true;
    });
  }, [orders, viewMode, settlementFilter, courierFilter, searchQuery]);

  // Grouped Courier Remittance Data for Report
  const courierReports = useMemo(() => {
    const map = new Map<string, {
      courierName: string;
      totalOrders: number;
      totalExpected: number;
      totalCollected: number;
      totalSettled: number;
      pendingSettlement: number;
      discrepancyAmount: number;
    }>();

    orders.forEach((o) => {
      const isCod = !o.paymentMethod ||
        o.paymentMethod.toUpperCase().includes('COD') ||
        o.paymentMethod.toUpperCase().includes('CASH');
      if (!isCod) return;

      const courier = o.courierName?.trim() || 'Standard Express';
      if (!map.has(courier)) {
        map.set(courier, {
          courierName: courier,
          totalOrders: 0,
          totalExpected: 0,
          totalCollected: 0,
          totalSettled: 0,
          pendingSettlement: 0,
          discrepancyAmount: 0,
        });
      }

      const entry = map.get(courier)!;
      const val = o.totalAmount ?? o.total ?? 0;
      entry.totalOrders += 1;
      entry.totalExpected += val;

      if (o.paymentStatus === 'COD_COLLECTED' || o.paymentStatus === 'PAID') {
        entry.totalCollected += val;
      }

      if (o.settlementStatus === 'SETTLED') {
        entry.totalSettled += (o.settlementAmount ?? val);
      } else if (o.paymentStatus === 'COD_COLLECTED') {
        entry.pendingSettlement += val;
      }

      if (o.settlementStatus === 'RECONCILIATION_REQUIRED' || (o.settlementAmount !== undefined && o.settlementAmount < val)) {
        entry.discrepancyAmount += Math.max(0, val - (o.settlementAmount ?? 0));
      }
    });

    return Array.from(map.values());
  }, [orders]);

  // Export CSV for Remittance & Settlement
  const handleExportRemittanceCSV = () => {
    if (filteredOrders.length === 0) return;

    const headers = [
      'Order ID',
      'Order Date',
      'Customer Name',
      'Customer Phone',
      'City',
      'State',
      'Courier Partner',
      'Tracking Number',
      'Order Amount ($)',
      'Payment Status',
      'Settlement Status',
      'Settlement Reference / UTR',
      'Settlement Date',
      'Remitted Amount ($)',
      'Discrepancy / Deductions ($)',
      'Reconciliation Notes',
    ];

    const rows = filteredOrders.map((o) => {
      const expected = o.totalAmount ?? o.total ?? 0;
      const remitted = o.settlementAmount ?? (o.settlementStatus === 'SETTLED' ? expected : 0);
      const diff = o.settlementStatus === 'SETTLED' ? Math.max(0, expected - remitted) : 0;

      return [
        `"${(o.orderId || o.id).replace(/"/g, '""')}"`,
        `"${new Date(o.createdAt).toISOString().slice(0, 10)}"`,
        `"${(o.customerInformation?.fullName || '').replace(/"/g, '""')}"`,
        `"${(o.customerInformation?.phone || '').replace(/"/g, '""')}"`,
        `"${(o.customerInformation?.city || '').replace(/"/g, '""')}"`,
        `"${(o.customerInformation?.state || '').replace(/"/g, '""')}"`,
        `"${(o.courierName || 'Standard Express').replace(/"/g, '""')}"`,
        `"${(o.trackingNumber || '').replace(/"/g, '""')}"`,
        expected.toFixed(2),
        `"${o.paymentStatus || 'COD_PENDING'}"`,
        `"${o.settlementStatus || 'PENDING_COLLECTION'}"`,
        `"${(o.settlementReference || '').replace(/"/g, '""')}"`,
        `"${o.settlementDate ? o.settlementDate.slice(0, 10) : ''}"`,
        remitted.toFixed(2),
        diff.toFixed(2),
        `"${(o.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `kitchease-cod-remittances-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Quick Record Collection
  const handleQuickCollection = async (orderId: string) => {
    setQuickActionLoadingId(orderId);
    try {
      await api.recordCODCollection(orderId);
      onRefreshOrders();
      loadSummary();
    } catch (err) {
      console.error(err);
    } finally {
      setQuickActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
              Financial Logistics &amp; COD Operations
            </span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] font-mono text-stone-300">
              Server Authoritative
            </span>
          </div>
          <h2 className="font-display text-2xl font-normal text-white mt-0.5">
            Cash on Delivery &amp; Courier Remittances
          </h2>
          <p className="text-xs text-stone-400 font-light mt-0.5">
            Track doorstep cash collection by courier partners, monitor bank remittance settlements, and reconcile discrepancies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              loadSummary();
              onRefreshOrders();
            }}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>

          <button
            onClick={handleExportRemittanceCSV}
            className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#E5C158] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors shadow-md cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Remittance Report</span>
          </button>
        </div>
      </div>

      {/* 2. Key COD Payment Metrics (Section 4 Requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Total COD Orders */}
        <div className="bg-[#151515] p-5 rounded-2xl border border-white/10 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold">
              Total COD Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-stone-300">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            ${summary ? summary.totalCODAmount.toFixed(2) : '0.00'}
          </div>
          <div className="text-xs text-stone-400">
            {summary ? summary.totalCODOrders : 0} orders registered
          </div>
        </div>

        {/* Pending Collection */}
        <div className="bg-[#151515] p-5 rounded-2xl border border-white/10 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
              Pending Collection
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            ${summary ? summary.pendingCollectionAmount.toFixed(2) : '0.00'}
          </div>
          <div className="text-xs text-amber-300/70">
            {summary ? summary.pendingCollectionOrders : 0} with delivery agents
          </div>
        </div>

        {/* Collected by Courier (Awaiting Bank Remit) */}
        <div className="bg-[#151515] p-5 rounded-2xl border border-white/10 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-blue-400 font-semibold">
              Collected by Courier
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-950/40 border border-blue-800/40 flex items-center justify-center text-blue-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-blue-300">
            ${summary ? summary.collectedByCourierAmount.toFixed(2) : '0.00'}
          </div>
          <div className="text-xs text-blue-300/70">
            {summary ? summary.collectedByCourierOrders : 0} awaiting payout
          </div>
        </div>

        {/* Settled in Bank */}
        <div className="bg-[#151515] p-5 rounded-2xl border border-white/10 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
              Settled in Bank
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300">
            ${summary ? summary.settledAmount.toFixed(2) : '0.00'}
          </div>
          <div className="text-xs text-emerald-300/70">
            {summary ? summary.settledOrders : 0} remitted &amp; verified
          </div>
        </div>

        {/* Reconciliation Required */}
        <div className="bg-[#151515] p-5 rounded-2xl border border-white/10 shadow-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-red-400 font-semibold">
              Reconciliation Alert
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-red-300">
            ${summary ? summary.reconciliationRequiredAmount.toFixed(2) : '0.00'}
          </div>
          <div className="text-xs text-red-300/70">
            {summary ? summary.reconciliationRequiredOrders : 0} with discrepancies
          </div>
        </div>

      </div>

      {/* 3. Sub-View Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setViewMode('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
            viewMode === 'all'
              ? 'bg-[#D4AF37] text-black font-bold shadow-sm'
              : 'text-stone-300 hover:bg-white/5'
          }`}
        >
          All COD Orders &amp; Settlements ({filteredOrders.length})
        </button>

        <button
          onClick={() => setViewMode('reconciliation')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
            viewMode === 'reconciliation'
              ? 'bg-[#D4AF37] text-black font-bold shadow-sm'
              : 'text-stone-300 hover:bg-white/5'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>COD Reconciliation Queue</span>
        </button>

        <button
          onClick={() => setViewMode('courier_report')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
            viewMode === 'courier_report'
              ? 'bg-[#D4AF37] text-black font-bold shadow-sm'
              : 'text-stone-300 hover:bg-white/5'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-stone-400" />
          <span>Courier Remittance Summary</span>
        </button>
      </div>

      {/* 4. Filter Bar */}
      {viewMode !== 'courier_report' && (
        <div className="p-4 rounded-2xl bg-[#151515] border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Order ID, Customer, Courier, UTR..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-white/15 bg-black/40 text-xs text-white placeholder:text-stone-500 focus:border-[#D4AF37] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-stone-300">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <span>Status:</span>
              <select
                value={settlementFilter}
                onChange={(e) => setSettlementFilter(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-black/40 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING_COLLECTION">Pending Collection</option>
                <option value="COD_COLLECTED">Collected by Courier</option>
                <option value="SETTLED">Settled in Bank</option>
                <option value="RECONCILIATION_REQUIRED">Reconciliation Required</option>
              </select>
            </div>

            {/* Courier Filter */}
            {uniqueCouriers.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-stone-300">
                <Truck className="w-3.5 h-3.5 text-stone-400" />
                <span>Courier:</span>
                <select
                  value={courierFilter}
                  onChange={(e) => setCourierFilter(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-white/15 bg-black/40 text-xs text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="ALL">All Couriers</option>
                  {uniqueCouriers.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

        </div>
      )}

      {/* 5. Main View: Table OR Courier Summary Report */}
      {viewMode === 'courier_report' ? (
        /* Courier Remittance Summary View (Section 11) */
        <div className="bg-[#151515] rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-6 space-y-6">
          <div>
            <h3 className="font-display text-lg font-medium text-white">
              Courier Partner Remittance Analysis
            </h3>
            <p className="text-xs text-stone-400 font-light">
              Aggregated financial breakdown by logistics provider. Identifies total collections, completed bank payouts, and deduction rates.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-300">
              <thead className="bg-black/50 text-[10px] uppercase font-semibold text-stone-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Courier Partner</th>
                  <th className="py-3.5 px-4 text-center">COD Orders</th>
                  <th className="py-3.5 px-4 text-right">Total Order Value</th>
                  <th className="py-3.5 px-4 text-right">Cash Collected</th>
                  <th className="py-3.5 px-4 text-right">Remitted to Bank</th>
                  <th className="py-3.5 px-4 text-right">Pending Payout</th>
                  <th className="py-3.5 px-4 text-right">Deductions / Discrepancies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {courierReports.map((report) => (
                  <tr key={report.courierName} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#D4AF37]" />
                        <span>{report.courierName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center font-mono">
                      {report.totalOrders}
                    </td>
                    <td className="py-4 px-4 text-right font-mono font-bold text-white">
                      ${report.totalExpected.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-emerald-400">
                      ${report.totalCollected.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-emerald-300 font-bold">
                      ${report.totalSettled.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-amber-300">
                      ${report.pendingSettlement.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-red-300">
                      ${report.discrepancyAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Orders & Settlements Table (Sections 4, 9, 10) */
        <div className="bg-[#151515] rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-stone-500 space-y-2">
              <Banknote className="w-8 h-8 text-stone-600 mx-auto" />
              <p className="text-sm font-medium text-stone-400">No COD orders found matching the filter criteria.</p>
              <p className="text-xs font-light">Try resetting the status or courier search filters above.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-black/50 text-[10px] uppercase font-semibold text-stone-400 border-b border-white/10">
                  <tr>
                    <th className="py-3.5 px-4">Order ID &amp; Date</th>
                    <th className="py-3.5 px-4">Customer &amp; Destination</th>
                    <th className="py-3.5 px-4">Courier &amp; Tracking</th>
                    <th className="py-3.5 px-4 text-right">Order Amount</th>
                    <th className="py-3.5 px-4 text-center">Collection Status</th>
                    <th className="py-3.5 px-4 text-center">Courier Settlement</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((ord) => {
                    const orderId = ord.orderId || ord.id;
                    const isCollected = ord.paymentStatus === 'COD_COLLECTED' || ord.paymentStatus === 'PAID';
                    const isSettled = ord.settlementStatus === 'SETTLED';
                    const isReconNeeded = ord.settlementStatus === 'RECONCILIATION_REQUIRED';
                    const amount = ord.totalAmount ?? ord.total ?? 0;

                    return (
                      <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                        
                        {/* 1. Order ID & Date */}
                        <td className="py-4 px-4 font-mono">
                          <button
                            onClick={() => setDossierOrder(ord)}
                            className="font-bold text-[#D4AF37] hover:underline block text-left cursor-pointer"
                          >
                            #{orderId}
                          </button>
                          <span className="text-[10px] text-stone-500 block">
                            {new Date(ord.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </td>

                        {/* 2. Customer & City */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-white truncate max-w-[150px]">
                            {ord.customerInformation?.fullName}
                          </div>
                          <div className="text-[10px] text-stone-400">
                            {ord.customerInformation?.city}, {ord.customerInformation?.state}
                          </div>
                        </td>

                        {/* 3. Courier & Tracking */}
                        <td className="py-4 px-4">
                          <div className="text-stone-300 font-medium truncate max-w-[130px]">
                            {ord.courierName || 'Standard Express'}
                          </div>
                          {ord.trackingNumber ? (
                            <span className="font-mono text-[10px] text-stone-400 block truncate max-w-[130px]">
                              {ord.trackingNumber}
                            </span>
                          ) : (
                            <span className="text-[10px] text-stone-500 italic">No waybill</span>
                          )}
                        </td>

                        {/* 4. Order Amount */}
                        <td className="py-4 px-4 text-right font-mono font-bold text-white">
                          ${amount.toFixed(2)}
                          {ord.settlementAmount !== undefined && ord.settlementAmount !== amount && (
                            <span className="block text-[10px] text-stone-400 font-light">
                              Remitted: ${ord.settlementAmount.toFixed(2)}
                            </span>
                          )}
                        </td>

                        {/* 5. Doorstep Collection Status */}
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isCollected
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950/70 text-amber-300 border border-amber-800'
                          }`}>
                            {isCollected ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>Collected</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Pending</span>
                              </>
                            )}
                          </span>
                        </td>

                        {/* 6. Courier Settlement Status */}
                        <td className="py-4 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isSettled
                              ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800'
                              : isReconNeeded
                              ? 'bg-red-950/70 text-red-300 border border-red-800'
                              : isCollected
                              ? 'bg-blue-950/70 text-blue-300 border border-blue-800'
                              : 'bg-stone-800 text-stone-400 border border-stone-700'
                          }`}>
                            {isSettled ? (
                              <>
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                                <span>Settled</span>
                              </>
                            ) : isReconNeeded ? (
                              <>
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                                <span>Discrepancy</span>
                              </>
                            ) : isCollected ? (
                              <>
                                <Clock className="w-3 h-3 text-blue-400" />
                                <span>Awaiting Remit</span>
                              </>
                            ) : (
                              <span>Pending Delivery</span>
                            )}
                          </span>
                        </td>

                        {/* 7. Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Quick Record Collection button */}
                            {!isCollected && (
                              <button
                                onClick={() => handleQuickCollection(ord.id)}
                                disabled={quickActionLoadingId === ord.id}
                                className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                                title="Mark as Collected by Courier"
                              >
                                {quickActionLoadingId === ord.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin inline" />
                                ) : (
                                  'Record Collection'
                                )}
                              </button>
                            )}

                            {/* Mark Settled Button */}
                            {isCollected && !isSettled && (
                              <button
                                onClick={() => setSettlementOrder(ord)}
                                className="px-2.5 py-1 rounded-lg bg-[#D4AF37] hover:bg-[#E5C158] text-black text-[10px] font-bold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                              >
                                Mark Settled
                              </button>
                            )}

                            {/* View Dossier Button */}
                            <button
                              onClick={() => setDossierOrder(ord)}
                              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                              title="View Payment Dossier &amp; Audit Trail"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Print Label Button */}
                            <a
                              href={`/api/shipping/label/${encodeURIComponent(ord.trackingNumber || ord.orderId || ord.id)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-stone-300 hover:text-white transition-colors cursor-pointer"
                              title="Print Shipping Label"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </a>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CODSettlementModal */}
      <CODSettlementModal
        order={settlementOrder}
        isOpen={!!settlementOrder}
        onClose={() => setSettlementOrder(null)}
        onSuccess={(_updated) => {
          onRefreshOrders();
          loadSummary();
        }}
      />

      {/* OrderPaymentDetailsModal */}
      <OrderPaymentDetailsModal
        order={dossierOrder}
        isOpen={!!dossierOrder}
        onClose={() => setDossierOrder(null)}
        onRefresh={() => {
          onRefreshOrders();
          loadSummary();
        }}
        onOpenSettlement={(ord) => {
          setDossierOrder(null);
          setSettlementOrder(ord);
        }}
      />

    </div>
  );
};
