'use client';

import { useState } from 'react';
import { PawPrint, FileText, CheckCircle2, XCircle, Printer, DollarSign, Calendar, MapPin, Download, Send, Clock } from 'lucide-react';

export type Quotation = {
  id: string;
  quoteNumber: string;
  enquiryId?: string;
  bookingId?: string;
  parentName: string;
  parentEmail: string;
  parentPin: string;
  sitterName: string;
  serviceName: string;
  distanceKm: number;
  baseAmount: number;
  travelFee: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes?: string;
  validUntil: string;
  status: 'sent' | 'accepted' | 'declined' | 'expired';
  createdAt: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  quoteNumber?: string;
  parentName: string;
  parentPin: string;
  sitterName: string;
  serviceName: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  status: 'unpaid' | 'paid' | 'overdue';
  dueDate: string;
  paidAt?: string;
  paymentMethod?: string;
  createdAt: string;
};

interface QuotationInvoiceModalProps {
  type: 'quote' | 'invoice' | 'create_quote';
  item?: Quotation | Invoice | null;
  userRole: 'parent' | 'sitter' | 'admin';
  onClose: () => void;
  onAcceptQuote?: (quote: Quotation) => void;
  onDeclineQuote?: (quote: Quotation) => void;
  onPayInvoice?: (invoice: Invoice) => void;
  onCreateQuote?: (newQuote: Omit<Quotation, 'id' | 'createdAt'>) => void;
}

export default function QuotationInvoiceModal({
  type,
  item,
  userRole,
  onClose,
  onAcceptQuote,
  onDeclineQuote,
  onPayInvoice,
  onCreateQuote,
}: QuotationInvoiceModalProps) {
  const [createForm, setCreateForm] = useState({
    parentName: 'Priya Parent',
    parentEmail: 'parent@rara.test',
    parentPin: '238163',
    sitterName: 'Sam Sitter',
    serviceName: 'Dog Walking (1 hour) + Locality Visit',
    distanceKm: 0.8,
    baseAmount: 35.0,
    travelFee: 5.0,
    discountAmount: 0.0,
    notes: 'Includes 5km locality travel coverage and live updates.',
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const quote = type === 'quote' ? (item as Quotation) : null;
  const invoice = type === 'invoice' ? (item as Invoice) : null;

  function printDocument() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!onCreateQuote) return;
    const subtotal = createForm.baseAmount + createForm.travelFee - createForm.discountAmount;
    const taxAmount = Math.round(subtotal * 0.08 * 100) / 100; // 8% GST
    const totalAmount = subtotal + taxAmount;

    onCreateQuote({
      quoteNumber: 'QUO-2026-' + Math.floor(100 + Math.random() * 900),
      parentName: createForm.parentName,
      parentEmail: createForm.parentEmail,
      parentPin: createForm.parentPin,
      sitterName: createForm.sitterName,
      serviceName: createForm.serviceName,
      distanceKm: createForm.distanceKm,
      baseAmount: createForm.baseAmount,
      travelFee: createForm.travelFee,
      taxAmount: taxAmount,
      discountAmount: createForm.discountAmount,
      totalAmount: totalAmount,
      notes: createForm.notes,
      validUntil: createForm.validUntil,
      status: 'sent',
    });
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '650px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Create Quote View */}
        {type === 'create_quote' && (
          <form onSubmit={handleCreateSubmit} style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Issue Formal Quotation</h3>
              <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>
                Parent Name
                <input
                  type="text"
                  value={createForm.parentName}
                  onChange={(e) => setCreateForm({ ...createForm, parentName: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  required
                />
              </label>

              <label style={{ fontSize: '13px', fontWeight: '600' }}>
                Parent Email
                <input
                  type="email"
                  value={createForm.parentEmail}
                  onChange={(e) => setCreateForm({ ...createForm, parentEmail: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  required
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>
                Singapore Postal Code (PIN)
                <input
                  type="text"
                  value={createForm.parentPin}
                  onChange={(e) => setCreateForm({ ...createForm, parentPin: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  required
                />
              </label>

              <label style={{ fontSize: '13px', fontWeight: '600' }}>
                Assigned Sitter
                <input
                  type="text"
                  value={createForm.sitterName}
                  onChange={(e) => setCreateForm({ ...createForm, sitterName: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  required
                />
              </label>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>
                Service Name & Description
                <input
                  type="text"
                  value={createForm.serviceName}
                  onChange={(e) => setCreateForm({ ...createForm, serviceName: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  required
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>
                Base Price ($)
                <input
                  type="number"
                  step="0.5"
                  value={createForm.baseAmount}
                  onChange={(e) => setCreateForm({ ...createForm, baseAmount: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                  required
                />
              </label>

              <label style={{ fontSize: '13px', fontWeight: '600' }}>
                Travel Fee ($)
                <input
                  type="number"
                  step="0.5"
                  value={createForm.travelFee}
                  onChange={(e) => setCreateForm({ ...createForm, travelFee: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </label>

              <label style={{ fontSize: '13px', fontWeight: '600' }}>
                Distance (km)
                <input
                  type="number"
                  step="0.1"
                  value={createForm.distanceKm}
                  onChange={(e) => setCreateForm({ ...createForm, distanceKm: parseFloat(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }}
                />
              </label>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600' }}>
                Quotation Notes / Terms
                <textarea
                  rows={2}
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px', fontFamily: 'inherit' }}
                />
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button type="button" onClick={onClose} style={{ padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ padding: '8px 16px', background: '#00982d', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Issue Quotation</button>
            </div>
          </form>
        )}

        {/* Printable Quotation View */}
        {type === 'quote' && quote && (
          <div style={{ padding: '32px' }} className="printable-doc">
            {/* Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #00982d', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00982d', fontWeight: '800', fontSize: '22px' }}>
                  <PawPrint /> RaRa Pet Care
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Locality PIN Matching & Verified Sitters · Singapore
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '20px', letterSpacing: '0.05em' }}>OFFICIAL QUOTATION</h2>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#00982d' }}>{quote.quoteNumber}</span>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Date: {new Date(quote.createdAt).toLocaleDateString()}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Valid Until: {quote.validUntil}</p>
              </div>
            </div>

            {/* Parties Info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', background: '#f8fafc', padding: '16px', borderRadius: '10px' }}>
              <div>
                <small style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>CUSTOMER / PARENT</small>
                <h4 style={{ margin: '4px 0 2px', fontSize: '15px', fontWeight: '700' }}>{quote.parentName}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>PIN Code: {quote.parentPin}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>Email: {quote.parentEmail}</p>
              </div>

              <div>
                <small style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>SERVICE PROVIDER</small>
                <h4 style={{ margin: '4px 0 2px', fontSize: '15px', fontWeight: '700' }}>{quote.sitterName}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>Matched Locality Distance: {quote.distanceKm} km</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#00982d', fontWeight: '600' }}>Status: {quote.status.toUpperCase()}</p>
              </div>
            </div>

            {/* Line Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }}>Description</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontSize: '12px' }}>Amount ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontSize: '13px' }}>{quote.serviceName}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>${quote.baseAmount.toFixed(2)}</td>
                </tr>
                {quote.travelFee > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontSize: '13px', color: '#475569' }}>
                      Locality Travel Surcharge ({quote.distanceKm}km distance)
                    </td>
                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px' }}>${quote.travelFee.toFixed(2)}</td>
                  </tr>
                )}
                {quote.discountAmount > 0 && (
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontSize: '13px', color: '#16a34a' }}>Special Promotional Discount</td>
                    <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#16a34a' }}>-${quote.discountAmount.toFixed(2)}</td>
                  </tr>
                )}
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontSize: '13px', color: '#64748b' }}>Estimated GST / Tax (8%)</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>${quote.taxAmount.toFixed(2)}</td>
                </tr>
                <tr style={{ background: '#f8fafc', fontWeight: '800' }}>
                  <td style={{ padding: '12px', fontSize: '15px' }}>Total Amount Payable</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '16px', color: '#00982d' }}>${quote.totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {quote.notes && (
              <div style={{ background: '#fffbe3', borderLeft: '4px solid #f59e0b', padding: '10px 14px', borderRadius: '4px', fontSize: '12px', marginBottom: '24px' }}>
                <b>Notes & Care Conditions:</b> {quote.notes}
              </div>
            )}

            {/* Action Bar */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button onClick={printDocument} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <Printer size={16} /> Print / Save PDF
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {userRole === 'parent' && quote.status === 'sent' && onAcceptQuote && (
                  <button
                    onClick={() => {
                      onAcceptQuote(quote);
                      onClose();
                    }}
                    style={{ padding: '8px 20px', background: '#00982d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
                  >
                    <CheckCircle2 size={16} /> Accept & Generate Invoice
                  </button>
                )}
                {userRole === 'parent' && quote.status === 'sent' && onDeclineQuote && (
                  <button
                    onClick={() => {
                      onDeclineQuote(quote);
                      onClose();
                    }}
                    style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                  >
                    Decline
                  </button>
                )}
                <button onClick={onClose} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Printable Invoice View */}
        {type === 'invoice' && invoice && (
          <div style={{ padding: '32px' }} className="printable-doc">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: '800', fontSize: '22px' }}>
                  <PawPrint /> RaRa Pet Care
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                  Official Tax Invoice · Singapore
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <h2 style={{ margin: 0, color: '#0f172a', fontSize: '22px', letterSpacing: '0.05em' }}>TAX INVOICE</h2>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{invoice.invoiceNumber}</span>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Issued: {new Date(invoice.createdAt).toLocaleDateString()}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Due Date: {invoice.dueDate}</p>
              </div>
            </div>

            {/* Status & Parties */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: invoice.status === 'paid' ? '#f0fdf4' : '#fff1f2', padding: '12px 16px', borderRadius: '8px', border: `1px solid ${invoice.status === 'paid' ? '#bbf7d0' : '#fecdd3'}` }}>
              <div>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>PAYMENT STATUS</span>
                <h4 style={{ margin: '2px 0 0', fontSize: '16px', fontWeight: '800', color: invoice.status === 'paid' ? '#16a34a' : '#dc2626' }}>
                  {invoice.status === 'paid' ? '✓ PAID IN FULL' : '⚠ UNPAID / DUE'}
                </h4>
              </div>

              {invoice.paidAt && (
                <div style={{ textAlign: 'right', fontSize: '12px', color: '#16a34a' }}>
                  Paid on: {new Date(invoice.paidAt).toLocaleDateString()}<br />
                  Method: {invoice.paymentMethod || 'Credit Card / PayNow'}
                </div>
              )}
            </div>

            {/* Itemized Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '10px', textAlign: 'left', fontSize: '12px' }}>Service Item</th>
                  <th style={{ padding: '10px', textAlign: 'right', fontSize: '12px' }}>Amount ($)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontSize: '13px' }}>
                    {invoice.serviceName}<br />
                    <small style={{ color: '#64748b' }}>Sitter: {invoice.sitterName} · Parent PIN: {invoice.parentPin}</small>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontWeight: '600' }}>${invoice.subtotal.toFixed(2)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontSize: '13px', color: '#64748b' }}>GST (8%)</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', color: '#64748b' }}>${invoice.taxAmount.toFixed(2)}</td>
                </tr>
                <tr style={{ background: '#f8fafc', fontWeight: '800' }}>
                  <td style={{ padding: '12px', fontSize: '15px' }}>Total Billed</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontSize: '16px', color: '#0f172a' }}>${invoice.totalAmount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>

            {/* Actions */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button onClick={printDocument} style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                <Printer size={16} /> Print / Save Invoice
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {userRole === 'parent' && invoice.status === 'unpaid' && onPayInvoice && (
                  <button
                    onClick={() => {
                      onPayInvoice(invoice);
                      onClose();
                    }}
                    style={{ padding: '8px 20px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}
                  >
                    <DollarSign size={16} /> Pay ${invoice.totalAmount.toFixed(2)} Now
                  </button>
                )}
                <button onClick={onClose} style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
