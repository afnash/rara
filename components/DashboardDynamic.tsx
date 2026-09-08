'use client';

import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Cat,
  Dog,
  Home,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  PawPrint,
  Plus,
  ShieldCheck,
  Users,
  Wallet,
  X,
  FileText,
  HelpCircle,
  CheckCircle2,
  DollarSign,
  Send,
  Eye,
  Check,
  AlertCircle,
  Filter,
} from 'lucide-react';
import HotspotMap, { SitterSpot, ParentSpot } from './HotspotMap';
import QuotationInvoiceModal, { Quotation, Invoice } from './QuotationInvoiceModal';
import { PublicEnquiry } from './EnquiryForm';

type Role = 'parent' | 'sitter' | 'admin';

type Pet = {
  id: number;
  type: string;
  name: string;
  dob: string;
  gender: string;
};

type Request = {
  id: number;
  from: string;
  to: string;
  type: string;
  status: string;
  pin?: string;
};

const NAV: Record<Role, string[]> = {
  parent: ['Overview', 'Nearby Sitters (5km Map)', 'My pets', 'Services', 'Quotations & Invoices', 'Bookings', 'Messages'],
  sitter: ['Overview', 'My schedule', 'Care requests', 'Quotations & Invoices', 'Earnings', 'Messages'],
  admin: ['Overview', 'Locality Hotspots (Map)', 'Visitor Enquiries', 'Quotations & Invoices', 'Users', 'Sitter approvals', 'All bookings', 'Payments'],
};

const ICONS = [Home, MapPin, PawPrint, FileText, FileText, CalendarDays, MessageSquare, Users];

// Initial seed data
const SEED_SITTERS: SitterSpot[] = [
  {
    id: 'sit_1',
    name: 'Sam Sitter',
    pin: '238201',
    hourlyRate: 25,
    rating: 4.9,
    yearsExp: 4,
    verified: true,
    bio: 'Experienced dog walker & pet sitter in River Valley area.',
    services: ['Dog walking', 'Pet daycare'],
  },
  {
    id: 'sit_2',
    name: 'Alyssa Tan',
    pin: '168732',
    hourlyRate: 30,
    rating: 5.0,
    yearsExp: 6,
    verified: true,
    bio: 'Certified veterinary nurse & home stayover sitter.',
    services: ['Home stayover', 'Home boarding', 'Pet transport'],
  },
  {
    id: 'sit_3',
    name: 'David Chen',
    pin: '098585',
    hourlyRate: 28,
    rating: 4.8,
    yearsExp: 3,
    verified: true,
    bio: 'Cat specialist and active pet transport driver near Harbourfront.',
    services: ['Pet transport', 'Cat daycare'],
  },
  {
    id: 'sit_4',
    name: 'Marcus Lim',
    pin: '520101',
    hourlyRate: 22,
    rating: 4.7,
    yearsExp: 2,
    verified: true,
    bio: 'Pet lover with spacious home daycare garden in Tampines.',
    services: ['Home boarding', 'Dog walking'],
  },
];

const SEED_PARENTS: ParentSpot[] = [
  { id: 'par_1', name: 'Priya Parent', pin: '238163', petsCount: 2, registeredDate: '2026-01-10' },
  { id: 'par_2', name: 'Rachel Wong', pin: '168800', petsCount: 1, registeredDate: '2026-02-15' },
  { id: 'par_3', name: 'Kenneth Lee', pin: '098590', petsCount: 1, registeredDate: '2026-03-01' },
];

const SEED_QUOTES: Quotation[] = [
  {
    id: 'q_1',
    quoteNumber: 'QUO-2026-001',
    parentName: 'Priya Parent',
    parentEmail: 'parent@rara.test',
    parentPin: '238163',
    sitterName: 'Sam Sitter',
    serviceName: 'Dog Walking (1 hour) + Locality Visit',
    distanceKm: 0.8,
    baseAmount: 35.0,
    travelFee: 5.0,
    taxAmount: 3.2,
    discountAmount: 0,
    totalAmount: 43.2,
    notes: 'Includes 5km locality travel coverage and live photo updates.',
    validUntil: '2026-09-20',
    status: 'sent',
    createdAt: '2026-09-07T10:00:00Z',
  },
  {
    id: 'q_2',
    quoteNumber: 'QUO-2026-002',
    parentName: 'Rachel Wong',
    parentEmail: 'rachel@example.com',
    parentPin: '168800',
    sitterName: 'Alyssa Tan',
    serviceName: 'Weekend Home Stayover (2 nights)',
    distanceKm: 2.1,
    baseAmount: 140.0,
    travelFee: 10.0,
    taxAmount: 12.0,
    discountAmount: 0,
    totalAmount: 162.0,
    notes: '2 nights overnight care with 24/7 accompaniment.',
    validUntil: '2026-09-18',
    status: 'accepted',
    createdAt: '2026-09-06T14:30:00Z',
  },
];

const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2026-001',
    quoteNumber: 'QUO-2026-002',
    parentName: 'Rachel Wong',
    parentPin: '168800',
    sitterName: 'Alyssa Tan',
    serviceName: 'Weekend Home Stayover (2 nights)',
    subtotal: 150.0,
    taxAmount: 12.0,
    totalAmount: 162.0,
    status: 'paid',
    dueDate: '2026-09-15',
    paidAt: '2026-09-07T16:00:00Z',
    paymentMethod: 'PayNow SG',
    createdAt: '2026-09-06T15:00:00Z',
  },
  {
    id: 'inv_2',
    invoiceNumber: 'INV-2026-002',
    parentName: 'Priya Parent',
    parentPin: '238163',
    sitterName: 'Sam Sitter',
    serviceName: 'Pet Transport (River Valley to Vet Clinic)',
    subtotal: 30.0,
    taxAmount: 2.4,
    totalAmount: 32.4,
    status: 'unpaid',
    dueDate: '2026-09-18',
    createdAt: '2026-09-08T09:00:00Z',
  },
];

const SEED_ENQUIRIES: PublicEnquiry[] = [
  {
    id: 'ENQ-10492',
    name: 'Sarah Tan',
    email: 'sarah.tan@example.com',
    phone: '+65 9876 5432',
    pin: '238190',
    petType: 'Dog',
    serviceRequested: 'Dog Walking',
    message: 'Looking for daily 1-hour walks for my Beagle near River Valley PIN 238190.',
    status: 'new',
    createdAt: '2026-09-07T11:20:00Z',
  },
  {
    id: 'ENQ-10493',
    name: 'Jason Tay',
    email: 'jason.t@example.com',
    phone: '+65 9123 8899',
    pin: '168740',
    petType: 'Cat',
    serviceRequested: 'Home Boarding',
    message: 'Need boarding for 3 nights for 2 indoor cats in Tiong Bahru area.',
    status: 'new',
    createdAt: '2026-09-08T08:15:00Z',
  },
];

export default function DashboardDynamic({
  role,
  name,
  pin,
}: {
  role: Role;
  name: string;
  pin: string;
}) {
  const [tab, setTab] = useState('Overview');
  const [menu, setMenu] = useState(false);

  // Storage states
  const [quotes, setQuotes] = useStored<Quotation[]>('rara_quotations', SEED_QUOTES);
  const [invoices, setInvoices] = useStored<Invoice[]>('rara_invoices', SEED_INVOICES);
  const [enquiries, setEnquiries] = useStored<PublicEnquiry[]>('rara_public_enquiries', SEED_ENQUIRIES);
  const [sitters] = useState<SitterSpot[]>(SEED_SITTERS);
  const [parents] = useState<ParentSpot[]>(SEED_PARENTS);

  // Modal active state
  const [activeModal, setActiveModal] = useState<{
    type: 'quote' | 'invoice' | 'create_quote';
    item?: Quotation | Invoice | null;
  } | null>(null);

  function logout() {
    localStorage.removeItem('rara_dummy_session');
    location.href = '/login';
  }

  // Handlers for quote actions
  function handleAcceptQuote(quote: Quotation) {
    const updatedQuotes = quotes.map((q) => (q.id === quote.id ? { ...q, status: 'accepted' as const } : q));
    setQuotes(updatedQuotes);

    // Auto-generate invoice
    const newInvoice: Invoice = {
      id: 'inv_' + Date.now(),
      invoiceNumber: 'INV-2026-' + Math.floor(100 + Math.random() * 900),
      quoteNumber: quote.quoteNumber,
      parentName: quote.parentName,
      parentPin: quote.parentPin,
      sitterName: quote.sitterName,
      serviceName: quote.serviceName,
      subtotal: quote.baseAmount + quote.travelFee - quote.discountAmount,
      taxAmount: quote.taxAmount,
      totalAmount: quote.totalAmount,
      status: 'unpaid',
      dueDate: quote.validUntil,
      createdAt: new Date().toISOString(),
    };

    setInvoices([newInvoice, ...invoices]);
  }

  function handleDeclineQuote(quote: Quotation) {
    const updatedQuotes = quotes.map((q) => (q.id === quote.id ? { ...q, status: 'declined' as const } : q));
    setQuotes(updatedQuotes);
  }

  function handlePayInvoice(invoice: Invoice) {
    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoice.id
        ? {
            ...inv,
            status: 'paid' as const,
            paidAt: new Date().toISOString(),
            paymentMethod: 'Credit Card / PayNow',
          }
        : inv
    );
    setInvoices(updatedInvoices);
  }

  function handleCreateQuote(newQuoteData: Omit<Quotation, 'id' | 'createdAt'>) {
    const newQuote: Quotation = {
      ...newQuoteData,
      id: 'q_' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setQuotes([newQuote, ...quotes]);
  }

  function handleConvertEnquiryToQuote(enquiry: PublicEnquiry) {
    setActiveModal({
      type: 'create_quote',
      item: null,
    });

    // Mark enquiry as quoted
    const updatedEnquiries = enquiries.map((e) => (e.id === enquiry.id ? { ...e, status: 'quoted' as const } : e));
    setEnquiries(updatedEnquiries);
  }

  return (
    <div className="dashboard">
      <aside className={menu ? 'show' : ''}>
        <div className="dashbrand">
          <PawPrint /> RaRa
        </div>
        <button className="aside-close" onClick={() => setMenu(false)}>
          <X />
        </button>
        <p className="role">{role === 'parent' ? 'PET PARENT' : role === 'sitter' ? 'PET SITTER' : 'ADMINISTRATOR'}</p>

        {NAV[role].map((label, i) => {
          const Icon = ICONS[i] || Home;
          return (
            <button key={label} className={tab === label ? 'active' : ''} onClick={() => { setTab(label); setMenu(false); }}>
              <Icon />
              {label}
            </button>
          );
        })}

        <button className="logout" onClick={logout}>
          <LogOut /> Sign out
        </button>
      </aside>

      <main className="dashmain">
        <header className="dashhead">
          <button className="dashmenu" onClick={() => setMenu(true)}>
            <Menu />
          </button>
          <div>
            <small>{role.toUpperCase()} WORKSPACE</small>
            <h1>{name}</h1>
          </div>
          <span className="location">
            <MapPin /> Singapore PIN {pin}
          </span>
          <div className="avatar">{name[0]}</div>
        </header>

        <section className="dashbody">
          <div className="dash-title">
            <div>
              <p className="eyebrow">{role === 'admin' ? 'PLATFORM MANAGEMENT' : `LOCATION MATCHING · PIN ${pin}`}</p>
              <h2>{tab}</h2>
            </div>

            {(role === 'admin' || role === 'sitter') && (
              <button
                className="button"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#00982d', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                onClick={() => setActiveModal({ type: 'create_quote' })}
              >
                <Plus size={16} /> Issue Quotation
              </button>
            )}
          </div>

          {/* Render content by role & tab */}
          {role === 'parent' ? (
            <ParentContent
              tab={tab}
              pin={pin}
              name={name}
              sitters={sitters}
              quotes={quotes}
              invoices={invoices}
              onOpenQuote={(q) => setActiveModal({ type: 'quote', item: q })}
              onOpenInvoice={(inv) => setActiveModal({ type: 'invoice', item: inv })}
              onRequestQuoteSitter={(sitter) => {
                setActiveModal({ type: 'create_quote' });
              }}
            />
          ) : role === 'sitter' ? (
            <SitterContent
              tab={tab}
              pin={pin}
              quotes={quotes}
              invoices={invoices}
              onOpenQuote={(q) => setActiveModal({ type: 'quote', item: q })}
              onOpenInvoice={(inv) => setActiveModal({ type: 'invoice', item: inv })}
            />
          ) : (
            <AdminContent
              tab={tab}
              pin={pin}
              sitters={sitters}
              parents={parents}
              enquiries={enquiries}
              quotes={quotes}
              invoices={invoices}
              onOpenQuote={(q) => setActiveModal({ type: 'quote', item: q })}
              onOpenInvoice={(inv) => setActiveModal({ type: 'invoice', item: inv })}
              onConvertEnquiry={handleConvertEnquiryToQuote}
            />
          )}
        </section>
      </main>

      {/* Modal Dialog */}
      {activeModal && (
        <QuotationInvoiceModal
          type={activeModal.type}
          item={activeModal.item}
          userRole={role}
          onClose={() => setActiveModal(null)}
          onAcceptQuote={handleAcceptQuote}
          onDeclineQuote={handleDeclineQuote}
          onPayInvoice={handlePayInvoice}
          onCreateQuote={handleCreateQuote}
        />
      )}
    </div>
  );
}

/* =========================================================================
   PARENT CONTENT VIEW
   ========================================================================= */
function ParentContent({
  tab,
  pin,
  name,
  sitters,
  quotes,
  invoices,
  onOpenQuote,
  onOpenInvoice,
  onRequestQuoteSitter,
}: {
  tab: string;
  pin: string;
  name: string;
  sitters: SitterSpot[];
  quotes: Quotation[];
  invoices: Invoice[];
  onOpenQuote: (q: Quotation) => void;
  onOpenInvoice: (inv: Invoice) => void;
  onRequestQuoteSitter: (sitter: SitterSpot) => void;
}) {
  const [pets, setPets] = useStored<Pet[]>('rara_pets', [
    { id: 1, type: 'dog', name: 'Milo', dob: '2022-04-12', gender: 'Male' },
    { id: 2, type: 'cat', name: 'Coco', dob: '2023-01-20', gender: 'Female' },
  ]);
  const [requests, setRequests] = useStored<Request[]>('rara_requests', []);
  const [petForm, setPetForm] = useState(false);
  const [serviceForm, setServiceForm] = useState(false);

  if (tab === 'Nearby Sitters (5km Map)') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
          Explore verified pet sitters located within a <b>5km radius</b> of your PIN code (<b>{pin}</b>).
          Click on any sitter card or map pin to request a direct quotation.
        </p>
        <HotspotMap
          userRole="parent"
          userPin={pin}
          sitters={sitters}
          onRequestQuote={onRequestQuoteSitter}
        />
      </div>
    );
  }

  if (tab === 'My pets') {
    return (
      <>
        <div className="toolbar">
          <p>Add each pet once, then select them when requesting care.</p>
          <button className="button" onClick={() => setPetForm(!petForm)}>
            <Plus /> Add pet
          </button>
        </div>
        {petForm && (
          <PetForm
            save={(p) => {
              setPets([...pets, { ...p, id: Date.now() }]);
              setPetForm(false);
            }}
          />
        )}
        <div className="item-grid">
          {pets.length ? (
            pets.map((p) => (
              <article className="item-card" key={p.id}>
                {p.type === 'cat' ? <Cat /> : <Dog />}
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.type} · {p.gender}</p>
                  <small>Born {formatDate(p.dob)}</small>
                </div>
                <button onClick={() => setPets(pets.filter((x) => x.id !== p.id))}>Remove</button>
              </article>
            ))
          ) : (
            <Empty title="No pets added yet" text="Add your first pet to begin requesting care." />
          )}
        </div>
      </>
    );
  }

  if (tab === 'Services') {
    return (
      <>
        <div className="toolbar">
          <p>Request trusted care matched around your PIN code.</p>
          <button className="button" onClick={() => setServiceForm(!serviceForm)}>
            <Plus /> Request service
          </button>
        </div>
        {serviceForm && (
          <ServiceForm
            save={(r) => {
              setRequests([...requests, { ...r, id: Date.now(), status: 'Requested' }]);
              setServiceForm(false);
            }}
          />
        )}
        <RequestList requests={requests} />
      </>
    );
  }

  if (tab === 'Quotations & Invoices') {
    return (
      <QuotationsInvoicesList
        userRole="parent"
        quotes={quotes.filter((q) => q.parentName === name || q.parentEmail.includes('parent'))}
        invoices={invoices.filter((inv) => inv.parentName === name || inv.parentName.includes('Priya'))}
        onOpenQuote={onOpenQuote}
        onOpenInvoice={onOpenInvoice}
      />
    );
  }

  if (tab === 'Bookings') return <RequestList requests={requests} />;
  if (tab === 'Messages') return <Empty title="Your messages" text="Conversations with confirmed sitters will appear here." />;

  return (
    <Overview
      role="parent"
      counts={[
        ['My pets', String(pets.length)],
        ['Service requests', String(requests.length)],
        ['Open Quotes', String(quotes.filter((q) => q.status === 'sent').length)],
        ['Unpaid Invoices', String(invoices.filter((inv) => inv.status === 'unpaid').length)],
      ]}
    />
  );
}

/* =========================================================================
   SITTER CONTENT VIEW
   ========================================================================= */
function SitterContent({
  tab,
  pin,
  quotes,
  invoices,
  onOpenQuote,
  onOpenInvoice,
}: {
  tab: string;
  pin: string;
  quotes: Quotation[];
  invoices: Invoice[];
  onOpenQuote: (q: Quotation) => void;
  onOpenInvoice: (inv: Invoice) => void;
}) {
  if (tab === 'Care requests') {
    return (
      <div className="list">
        <article className="request-row">
          <PawPrint />
          <div>
            <b>Dog Walk request near PIN {pin} (0.8km away)</b>
            <span>Tomorrow · 1 hour · Milo (Beagle)</span>
          </div>
          <i>Review & Quote</i>
        </article>
      </div>
    );
  }

  if (tab === 'Quotations & Invoices') {
    return (
      <QuotationsInvoicesList
        userRole="sitter"
        quotes={quotes.filter((q) => q.sitterName.includes('Sam') || q.sitterName.includes('Sitter'))}
        invoices={invoices.filter((inv) => inv.sitterName.includes('Sam') || inv.sitterName.includes('Sitter'))}
        onOpenQuote={onOpenQuote}
        onOpenInvoice={onOpenInvoice}
      />
    );
  }

  if (tab === 'My schedule') return <Empty title="Availability calendar" text="Add available dates to receive nearby care requests." />;
  if (tab === 'Earnings') return <Overview role="sitter" counts={[['This month', '$1,240'], ['Pending payouts', '$180'], ['Completed jobs', '24']]} />;
  if (tab === 'Messages') return <Empty title="Sitter messages" text="Parent conversations will appear after accepting a request." />;

  return <Overview role="sitter" counts={[['Nearby requests within 5km', '4'], ['Active Quotes', String(quotes.length)], ['Rating', '4.9']]} />;
}

/* =========================================================================
   ADMIN CONTENT VIEW
   ========================================================================= */
function AdminContent({
  tab,
  pin,
  sitters,
  parents,
  enquiries,
  quotes,
  invoices,
  onOpenQuote,
  onOpenInvoice,
  onConvertEnquiry,
}: {
  tab: string;
  pin: string;
  sitters: SitterSpot[];
  parents: ParentSpot[];
  enquiries: PublicEnquiry[];
  quotes: Quotation[];
  invoices: Invoice[];
  onOpenQuote: (q: Quotation) => void;
  onOpenInvoice: (inv: Invoice) => void;
  onConvertEnquiry: (enquiry: PublicEnquiry) => void;
}) {
  if (tab === 'Locality Hotspots (Map)') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
          Platform-wide view of Sitter and Parent density across Singapore postal sectors.
          Inspect 5km radius coverage around any postal code center.
        </p>
        <HotspotMap
          userRole="admin"
          userPin={pin}
          sitters={sitters}
          parents={parents}
        />
      </div>
    );
  }

  if (tab === 'Visitor Enquiries') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
          Public inquiries submitted by visitors from the website. Review details and convert them into formal quotations.
        </p>

        <div className="list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {enquiries.length ? (
            enquiries.map((enq) => (
              <article
                key={enq.id}
                style={{
                  background: '#fff',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{enq.name}</h3>
                    <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                      PIN {enq.pin}
                    </span>
                    <span style={{ background: enq.status === 'quoted' ? '#dcfce7' : '#fef3c7', color: enq.status === 'quoted' ? '#15803d' : '#b45309', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                      {enq.status.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#4b5563' }}>
                    Requested: <b>{enq.serviceRequested}</b> for {enq.petType} · Email: {enq.email} {enq.phone && `· Phone: ${enq.phone}`}
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#1f2937', background: '#f9fafb', padding: '8px 12px', borderRadius: '6px', fontStyle: 'italic' }}>
                    "{enq.message}"
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px', alignItems: 'flex-end' }}>
                  <small style={{ fontSize: '11px', color: '#9ca3af' }}>{new Date(enq.createdAt).toLocaleDateString()}</small>
                  {enq.status !== 'quoted' ? (
                    <button
                      onClick={() => onConvertEnquiry(enq)}
                      style={{
                        padding: '8px 14px',
                        background: '#00982d',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Send size={14} /> Create Quote
                    </button>
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={14} /> Quote Issued
                    </span>
                  )}
                </div>
              </article>
            ))
          ) : (
            <Empty title="No visitor inquiries" text="Public inquiries submitted on the home page will appear here." />
          )}
        </div>
      </div>
    );
  }

  if (tab === 'Quotations & Invoices') {
    return (
      <QuotationsInvoicesList
        userRole="admin"
        quotes={quotes}
        invoices={invoices}
        onOpenQuote={onOpenQuote}
        onOpenInvoice={onOpenInvoice}
      />
    );
  }

  const data: Record<string, [string, string][]> = {
    Users: [['Pet parents', '612'], ['Active sitters', '230']],
    'Sitter approvals': [['Awaiting review', '12'], ['Approved this week', '8']],
    'All bookings': [['Active bookings', '86'], ['Completed this month', '326']],
    Payments: [['Gross volume', '$18,420'], ['Pending payouts', '$3,280']],
  };

  return <Overview role="admin" counts={data[tab] || [['Total users', '842'], ['Pending sitters', '12'], ['Monthly bookings', '326'], ['Total Invoiced', '$12,450']]} />;
}

/* =========================================================================
   SHARED QUOTATION & INVOICE LIST COMPONENT
   ========================================================================= */
function QuotationsInvoicesList({
  userRole,
  quotes,
  invoices,
  onOpenQuote,
  onOpenInvoice,
}: {
  userRole: 'parent' | 'sitter' | 'admin';
  quotes: Quotation[];
  invoices: Invoice[];
  onOpenQuote: (q: Quotation) => void;
  onOpenInvoice: (inv: Invoice) => void;
}) {
  const [subTab, setSubTab] = useState<'quotes' | 'invoices'>('quotes');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Subtab buttons */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '2px solid #e5e7eb', paddingBottom: '8px' }}>
        <button
          onClick={() => setSubTab('quotes')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '14px',
            background: subTab === 'quotes' ? '#00982d' : '#f3f4f6',
            color: subTab === 'quotes' ? 'white' : '#374151',
            cursor: 'pointer',
          }}
        >
          Quotations ({quotes.length})
        </button>

        <button
          onClick={() => setSubTab('invoices')}
          style={{
            padding: '8px 16px',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '14px',
            background: subTab === 'invoices' ? '#00982d' : '#f3f4f6',
            color: subTab === 'invoices' ? 'white' : '#374151',
            cursor: 'pointer',
          }}
        >
          Invoices ({invoices.length})
        </button>
      </div>

      {/* Render Quotes List */}
      {subTab === 'quotes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {quotes.length ? (
            quotes.map((q) => (
              <div
                key={q.id}
                style={{
                  background: '#fff',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '800', color: '#00982d', fontSize: '15px' }}>{q.quoteNumber}</span>
                    <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px' }}>
                      PIN {q.parentPin} ({q.distanceKm}km away)
                    </span>
                    <span
                      style={{
                        background: q.status === 'accepted' ? '#dcfce7' : q.status === 'sent' ? '#e0f2fe' : '#fee2e2',
                        color: q.status === 'accepted' ? '#15803d' : q.status === 'sent' ? '#0369a1' : '#b91c1c',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}
                    >
                      {q.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>{q.serviceName}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    Customer: {q.parentName} · Sitter: {q.sitterName} · Valid until: {q.validUntil}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <small style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>TOTAL AMOUNT</small>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>${q.totalAmount.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => onOpenQuote(q)}
                    style={{
                      padding: '8px 14px',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Eye size={14} /> View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <Empty title="No quotations found" text="Issued or received quotations will be displayed here." />
          )}
        </div>
      )}

      {/* Render Invoices List */}
      {subTab === 'invoices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {invoices.length ? (
            invoices.map((inv) => (
              <div
                key={inv.id}
                style={{
                  background: '#fff',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>{inv.invoiceNumber}</span>
                    <span
                      style={{
                        background: inv.status === 'paid' ? '#dcfce7' : '#fee2e2',
                        color: inv.status === 'paid' ? '#15803d' : '#b91c1c',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '12px',
                      }}
                    >
                      {inv.status === 'paid' ? 'PAID' : 'UNPAID'}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700' }}>{inv.serviceName}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    Billed to: {inv.parentName} (PIN {inv.parentPin}) · Sitter: {inv.sitterName} · Due: {inv.dueDate}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <small style={{ fontSize: '11px', color: '#9ca3af', display: 'block' }}>BILLED AMOUNT</small>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a' }}>${inv.totalAmount.toFixed(2)}</span>
                  </div>

                  <button
                    onClick={() => onOpenInvoice(inv)}
                    style={{
                      padding: '8px 14px',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Eye size={14} /> View Invoice
                  </button>
                </div>
              </div>
            ))
          ) : (
            <Empty title="No invoices found" text="Tax invoices will be generated when quotes are accepted or bookings completed." />
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   FORM HELPERS & OVERVIEW
   ========================================================================= */
function PetForm({ save }: { save: (p: Omit<Pet, 'id'>) => void }) {
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    save({
      type: String(f.get('type')),
      name: String(f.get('name')),
      dob: String(f.get('dob')),
      gender: String(f.get('gender')),
    });
  }
  return (
    <form className="dash-form" onSubmit={submit}>
      <h3>Add a pet</h3>
      <div className="form-grid">
        <label>
          Type
          <select name="type" required>
            <option value="dog">Dog</option>
            <option value="cat">Cat</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label>
          Pet name
          <input name="name" required placeholder="Pet's name" />
        </label>
        <label>
          Pet DOB
          <input name="dob" type="date" required max={new Date().toISOString().slice(0, 10)} />
        </label>
        <label>
          Pet gender
          <select name="gender" required>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Unknown">Unknown</option>
          </select>
        </label>
      </div>
      <button className="button">Save pet</button>
    </form>
  );
}

function ServiceForm({ save }: { save: (r: Omit<Request, 'id' | 'status'>) => void }) {
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    save({
      from: String(f.get('from')),
      to: String(f.get('to')),
      type: String(f.get('type')),
    });
  }
  return (
    <form className="dash-form" onSubmit={submit}>
      <h3>Request a service</h3>
      <div className="form-grid">
        <label>
          Service date and time from
          <input name="from" type="datetime-local" required />
        </label>
        <label>
          Service date and time to
          <input name="to" type="datetime-local" required />
        </label>
        <label className="span2">
          Service type
          <select name="type" required>
            <option>Walk (1 hour visit)</option>
            <option>Daycare (few hours)</option>
            <option>Boarding (pet stays at sitter's house)</option>
            <option>Stay-over (sitter stays at your home)</option>
          </select>
        </label>
      </div>
      <button className="button">Submit request</button>
    </form>
  );
}

function RequestList({ requests }: { requests: Request[] }) {
  return (
    <div className="list">
      {requests.length ? (
        requests.map((r) => (
          <article className="request-row" key={r.id}>
            <CalendarDays />
            <div>
              <b>{r.type}</b>
              <span>
                {formatDate(r.from)} to {formatDate(r.to)}
              </span>
            </div>
            <i>{r.status}</i>
          </article>
        ))
      ) : (
        <Empty title="No service requests" text="New service requests and booking updates will appear here." />
      )}
    </div>
  );
}

function Overview({ counts }: { role: Role; counts: [string, string][] }) {
  return (
    <div className="stats">
      {counts.map((x) => (
        <article key={x[0]}>
          <span>{x[0]}</span>
          <b>{x[1]}</b>
          <small>Updated now</small>
        </article>
      ))}
    </div>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <PawPrint />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function formatDate(x: string) {
  if (!x) return '';
  return new Date(x).toLocaleString('en-SG', {
    dateStyle: 'medium',
    timeStyle: x.includes('T') ? 'short' : undefined,
  });
}

function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    try {
      const v = localStorage.getItem(key);
      if (v) setValue(JSON.parse(v));
    } catch {}
  }, [key]);

  function save(v: T) {
    setValue(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  }

  return [value, save] as const;
}
