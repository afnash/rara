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
import { createClient } from '@/lib/supabase/client';


type Role = 'parent' | 'sitter' | 'admin';

type Pet = {
  id: string | number;
  type: string;
  name: string;
  dob: string;
  gender: string;
};

type Request = {
  id: string | number;
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

  // Supabase live states (initialized empty, populated strictly from Supabase DB)
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [enquiries, setEnquiries] = useState<PublicEnquiry[]>([]);
  const [sitters, setSitters] = useState<SitterSpot[]>([]);
  const [parents, setParents] = useState<ParentSpot[]>([]);

  // Modal active state
  const [activeModal, setActiveModal] = useState<{
    type: 'quote' | 'invoice' | 'create_quote';
    item?: Quotation | Invoice | null;
  } | null>(null);

  // Fetch live data strictly from Supabase tables
  useEffect(() => {
    async function loadSupabaseData() {
      try {
        const supabase = createClient();

        // 1. Fetch Enquiries from Supabase
        const { data: dbEnquiries } = await supabase
          .from('enquiries')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbEnquiries) {
          setEnquiries(
            dbEnquiries.map((e: any) => ({
              id: e.id,
              name: e.name,
              email: e.email,
              phone: e.phone || '',
              pin: e.postal_code,
              petType: e.pet_type || 'Pet',
              serviceRequested: e.service_requested || 'Care Service',
              message: e.message,
              status: e.status || 'new',
              createdAt: e.created_at,
            }))
          );
        }

        // 2. Fetch Quotations from Supabase
        const { data: dbQuotes } = await supabase
          .from('quotations')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbQuotes) {
          setQuotes(
            dbQuotes.map((q: any) => ({
              id: q.id,
              quoteNumber: q.quote_number,
              parentName: q.parent_id || 'Pet Parent',
              parentEmail: 'parent@rara.test',
              parentPin: q.postal_code || pin,
              sitterName: q.sitter_id || 'Verified Sitter',
              serviceName: q.service_name,
              distanceKm: q.distance_km || 1.0,
              baseAmount: parseFloat(q.base_amount || 0),
              travelFee: parseFloat(q.travel_fee || 0),
              taxAmount: parseFloat(q.tax_amount || 0),
              discountAmount: parseFloat(q.discount_amount || 0),
              totalAmount: parseFloat(q.total_amount || 0),
              notes: q.notes,
              validUntil: q.valid_until || '2026-12-31',
              status: q.status || 'sent',
              createdAt: q.created_at,
            }))
          );
        }

        // 3. Fetch Invoices from Supabase
        const { data: dbInvoices } = await supabase
          .from('invoices')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbInvoices) {
          setInvoices(
            dbInvoices.map((inv: any) => ({
              id: inv.id,
              invoiceNumber: inv.invoice_number,
              quoteNumber: inv.quotation_id || '',
              parentName: inv.parent_id || 'Pet Parent',
              parentPin: pin,
              sitterName: inv.sitter_id || 'Verified Sitter',
              serviceName: 'Care Service Invoice',
              subtotal: parseFloat(inv.subtotal || 0),
              taxAmount: parseFloat(inv.tax_amount || 0),
              totalAmount: parseFloat(inv.total_amount || 0),
              status: inv.status || 'unpaid',
              dueDate: inv.due_date,
              paidAt: inv.paid_at,
              paymentMethod: inv.payment_method,
              createdAt: inv.created_at,
            }))
          );
        }

        // 4. Fetch Profiles / Sitters / Parents from Supabase
        const { data: dbProfiles } = await supabase
          .from('profiles')
          .select('*, sitter_profiles(*)');

        if (dbProfiles) {
          const loadedSitters: SitterSpot[] = [];
          const loadedParents: ParentSpot[] = [];

          dbProfiles.forEach((p: any) => {
            if (p.role === 'sitter') {
              const sp = p.sitter_profiles || {};
              loadedSitters.push({
                id: p.id,
                name: p.full_name,
                pin: p.postal_code || '238201',
                hourlyRate: sp.hourly_rate || 25,
                rating: sp.rating || 4.9,
                yearsExp: sp.years_experience || 3,
                verified: sp.verified || true,
                bio: sp.bio || 'Verified local pet caregiver.',
                services: sp.services || ['Dog walking', 'Pet daycare'],
              });
            } else if (p.role === 'parent') {
              loadedParents.push({
                id: p.id,
                name: p.full_name,
                pin: p.postal_code || '238163',
                petsCount: 1,
                registeredDate: p.created_at ? p.created_at.slice(0, 10) : '2026-01-01',
              });
            }
          });

          setSitters(loadedSitters);
          setParents(loadedParents);
        }
      } catch (err) {
        console.warn('Supabase data load fallback:', err);
      }
    }

    loadSupabaseData();
  }, [pin]);

  function logout() {
    localStorage.removeItem('rara_dummy_session');
    location.href = '/login';
  }

  // Handlers for quote actions with real Supabase persistence
  async function handleAcceptQuote(quote: Quotation) {
    const updatedQuotes = quotes.map((q) => (q.id === quote.id ? { ...q, status: 'accepted' as const } : q));
    setQuotes(updatedQuotes);

    const newInvoiceNumber = 'INV-2026-' + Math.floor(100 + Math.random() * 900);
    const subtotal = quote.baseAmount + quote.travelFee - quote.discountAmount;

    // Persist to Supabase
    try {
      const supabase = createClient();
      await supabase.from('quotations').update({ status: 'accepted' }).eq('id', quote.id);
      await supabase.from('invoices').insert({
        invoice_number: newInvoiceNumber,
        quotation_id: quote.id,
        parent_id: quote.parentName,
        subtotal: subtotal,
        tax_amount: quote.taxAmount,
        total_amount: quote.totalAmount,
        status: 'unpaid',
        due_date: quote.validUntil,
      });
    } catch (err) {
      console.warn('Supabase invoice insert error:', err);
    }

    const newInvoice: Invoice = {
      id: 'inv_' + Date.now(),
      invoiceNumber: newInvoiceNumber,
      quoteNumber: quote.quoteNumber,
      parentName: quote.parentName,
      parentPin: quote.parentPin,
      sitterName: quote.sitterName,
      serviceName: quote.serviceName,
      subtotal: subtotal,
      taxAmount: quote.taxAmount,
      totalAmount: quote.totalAmount,
      status: 'unpaid',
      dueDate: quote.validUntil,
      createdAt: new Date().toISOString(),
    };

    setInvoices([newInvoice, ...invoices]);
  }

  async function handleDeclineQuote(quote: Quotation) {
    const updatedQuotes = quotes.map((q) => (q.id === quote.id ? { ...q, status: 'declined' as const } : q));
    setQuotes(updatedQuotes);

    try {
      const supabase = createClient();
      await supabase.from('quotations').update({ status: 'declined' }).eq('id', quote.id);
    } catch {}
  }

  async function handlePayInvoice(invoice: Invoice) {
    const paidTime = new Date().toISOString();
    const updatedInvoices = invoices.map((inv) =>
      inv.id === invoice.id
        ? {
            ...inv,
            status: 'paid' as const,
            paidAt: paidTime,
            paymentMethod: 'Credit Card / PayNow SG',
          }
        : inv
    );
    setInvoices(updatedInvoices);

    try {
      const supabase = createClient();
      await supabase
        .from('invoices')
        .update({ status: 'paid', paid_at: paidTime, payment_method: 'Credit Card / PayNow SG' })
        .eq('id', invoice.id);
    } catch {}
  }

  async function handleCreateQuote(newQuoteData: Omit<Quotation, 'id' | 'createdAt'>) {
    const quoteNumber = 'QUO-2026-' + Math.floor(100 + Math.random() * 900);

    try {
      const supabase = createClient();
      await supabase.from('quotations').insert({
        quote_number: quoteNumber,
        service_name: newQuoteData.serviceName,
        postal_code: newQuoteData.parentPin,
        distance_km: newQuoteData.distanceKm,
        base_amount: newQuoteData.baseAmount,
        travel_fee: newQuoteData.travelFee,
        tax_amount: newQuoteData.taxAmount,
        discount_amount: newQuoteData.discountAmount,
        total_amount: newQuoteData.totalAmount,
        notes: newQuoteData.notes,
        valid_until: newQuoteData.validUntil,
        status: 'sent',
      });
    } catch (err) {
      console.warn('Supabase quote insert error:', err);
    }

    const newQuote: Quotation = {
      ...newQuoteData,
      id: 'q_' + Date.now(),
      quoteNumber: quoteNumber,
      createdAt: new Date().toISOString(),
    };
    setQuotes([newQuote, ...quotes]);
  }

  async function handleConvertEnquiryToQuote(enquiry: PublicEnquiry) {
    setActiveModal({
      type: 'create_quote',
      item: null,
    });

    const updatedEnquiries = enquiries.map((e) => (e.id === enquiry.id ? { ...e, status: 'quoted' as const } : e));
    setEnquiries(updatedEnquiries);

    try {
      const supabase = createClient();
      await supabase.from('enquiries').update({ status: 'quoted' }).eq('id', enquiry.id);
    } catch {}
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
  const [pets, setPets] = useState<Pet[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [petForm, setPetForm] = useState(false);
  const [serviceForm, setServiceForm] = useState(false);

  useEffect(() => {
    async function loadPetsAndBookings() {
      try {
        const supabase = createClient();
        const { data: dbPets } = await supabase.from('pets').select('*');
        if (dbPets) {
          setPets(
            dbPets.map((p: any) => ({
              id: p.id,
              type: p.species || 'dog',
              name: p.name,
              dob: p.birth_date || '2023-01-01',
              gender: 'Pet',
            }))
          );
        }

        const { data: dbBookings } = await supabase.from('bookings').select('*');
        if (dbBookings) {
          setRequests(
            dbBookings.map((b: any) => ({
              id: b.id,
              from: b.starts_at,
              to: b.ends_at,
              type: 'Care Service',
              status: b.status || 'Requested',
            }))
          );
        }
      } catch (err) {
        console.warn('Supabase pets query error:', err);
      }
    }
    loadPetsAndBookings();
  }, []);

  async function handleAddPet(p: Omit<Pet, 'id'>) {
    const newPet: Pet = { ...p, id: 'pet_' + Date.now() };
    setPets((prev) => [...prev, newPet]);
    setPetForm(false);

    try {
      const supabase = createClient();
      const user = (await supabase.auth.getUser()).data.user;
      if (user) {
        await supabase.from('pets').insert({
          parent_id: user.id,
          name: p.name,
          species: p.type,
          birth_date: p.dob,
        });
      }
    } catch {}
  }

  async function handleAddRequest(r: Omit<Request, 'id' | 'status'>) {
    const newReq: Request = { ...r, id: 'req_' + Date.now(), status: 'Requested' };
    setRequests((prev) => [...prev, newReq]);
    setServiceForm(false);
  }


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
          <PetForm save={handleAddPet} />
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
          <ServiceForm save={handleAddRequest} />
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
  const paidRevenue = invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const pendingRevenue = invoices.filter((inv) => inv.status === 'unpaid').reduce((sum, inv) => sum + inv.totalAmount, 0);

  if (tab === 'Care requests') {
    return (
      <div className="list">
        {quotes.length ? (
          quotes.map((q) => (
            <article className="request-row" key={q.id}>
              <PawPrint />
              <div>
                <b>{q.serviceName} near PIN {q.parentPin} ({q.distanceKm}km away)</b>
                <span>Status: {q.status.toUpperCase()} · Valid: {q.validUntil}</span>
              </div>
              <button onClick={() => onOpenQuote(q)} style={{ padding: '6px 12px', background: '#00982d', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                View & Manage
              </button>
            </article>
          ))
        ) : (
          <Empty title="No active care requests" text="Care requests from nearby pet parents will appear here." />
        )}
      </div>
    );
  }

  if (tab === 'Quotations & Invoices') {
    return (
      <QuotationsInvoicesList
        userRole="sitter"
        quotes={quotes}
        invoices={invoices}
        onOpenQuote={onOpenQuote}
        onOpenInvoice={onOpenInvoice}
      />
    );
  }

  if (tab === 'My schedule') return <Empty title="Availability calendar" text="Add available dates to receive nearby care requests." />;
  if (tab === 'Earnings') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Overview
          role="sitter"
          counts={[
            ['Gross Paid Revenue', `$${paidRevenue.toFixed(2)}`],
            ['Pending Invoices', `$${pendingRevenue.toFixed(2)}`],
            ['Active Quotes', String(quotes.length)],
          ]}
        />
        <QuotationsInvoicesList
          userRole="sitter"
          quotes={quotes}
          invoices={invoices}
          onOpenQuote={onOpenQuote}
          onOpenInvoice={onOpenInvoice}
        />
      </div>
    );
  }

  if (tab === 'Messages') return <Empty title="Sitter messages" text="Parent conversations will appear after accepting a request." />;

  return (
    <Overview
      role="sitter"
      counts={[
        ['Active Quotes (DB)', String(quotes.length)],
        ['Issued Invoices (DB)', String(invoices.length)],
        ['Paid Revenue', `$${paidRevenue.toFixed(2)}`],
      ]}
    />
  );
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
  // Live computed metrics strictly from Supabase states
  const totalParents = parents.length;
  const totalSitters = sitters.length;
  const verifiedSitters = sitters.filter((s) => s.verified).length;
  const unverifiedSitters = sitters.filter((s) => !s.verified).length;
  const totalUsers = totalParents + totalSitters;

  const totalQuotes = quotes.length;
  const acceptedQuotes = quotes.filter((q) => q.status === 'accepted').length;
  const pendingQuotes = quotes.filter((q) => q.status === 'sent').length;

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidRevenue = invoices.filter((inv) => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0);
  const unpaidInvoices = invoices.filter((inv) => inv.status === 'unpaid').reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Toggle Sitter verification in Supabase
  async function toggleSitterApproval(sitterId: string, currentVerified: boolean) {
    try {
      const supabase = createClient();
      await supabase.from('sitter_profiles').update({ verified: !currentVerified }).eq('id', sitterId);
      location.reload();
    } catch (err) {
      console.warn('Failed to update sitter approval:', err);
    }
  }

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

  if (tab === 'Users') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Overview
          role="admin"
          counts={[
            ['Total Platform Users', String(totalUsers)],
            ['Registered Pet Parents', String(totalParents)],
            ['Registered Sitters', String(totalSitters)],
            ['Verified Sitters', String(verifiedSitters)],
          ]}
        />
        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '700' }}>Platform User Directory</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {parents.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: '8px' }}>
                <div>
                  <b style={{ fontSize: '14px' }}>{p.name}</b>
                  <span style={{ marginLeft: '10px', fontSize: '12px', color: '#6b7280' }}>Pet Parent · PIN {p.pin}</span>
                </div>
                <small style={{ color: '#9ca3af' }}>Registered {p.registeredDate}</small>
              </div>
            ))}
            {sitters.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px' }}>
                <div>
                  <b style={{ fontSize: '14px' }}>{s.name}</b>
                  <span style={{ marginLeft: '10px', fontSize: '12px', color: '#15803d' }}>Verified Sitter · PIN {s.pin} · ${s.hourlyRate}/hr</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: s.verified ? '#16a34a' : '#d97706' }}>
                  {s.verified ? 'APPROVED' : 'PENDING'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'Sitter approvals') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Overview
          role="admin"
          counts={[
            ['Awaiting Approval', String(unverifiedSitters)],
            ['Approved Sitters', String(verifiedSitters)],
            ['Total Registered Sitters', String(totalSitters)],
          ]}
        />
        <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '700' }}>Sitter Approval Queue</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sitters.length ? (
              sitters.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                  <div>
                    <b style={{ fontSize: '15px' }}>{s.name}</b> <span style={{ fontSize: '12px', color: '#6b7280' }}>(PIN {s.pin} · {s.yearsExp} yrs exp)</span>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#4b5563' }}>{s.bio}</p>
                  </div>
                  <button
                    onClick={() => toggleSitterApproval(s.id, s.verified)}
                    style={{
                      padding: '8px 14px',
                      background: s.verified ? '#ef4444' : '#00982d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {s.verified ? 'Revoke Approval' : 'Approve Sitter'}
                  </button>
                </div>
              ))
            ) : (
              <Empty title="No sitters registered" text="Sitter applications will appear here." />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (tab === 'All bookings') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Overview
          role="admin"
          counts={[
            ['Accepted Bookings', String(acceptedQuotes)],
            ['Pending Quotes', String(pendingQuotes)],
            ['Total Quotes Issued', String(totalQuotes)],
          ]}
        />
        <QuotationsInvoicesList
          userRole="admin"
          quotes={quotes}
          invoices={invoices}
          onOpenQuote={onOpenQuote}
          onOpenInvoice={onOpenInvoice}
        />
      </div>
    );
  }

  if (tab === 'Payments') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Overview
          role="admin"
          counts={[
            ['Gross Volume (Paid)', `$${paidRevenue.toFixed(2)}`],
            ['Unpaid Invoices', `$${unpaidInvoices.toFixed(2)}`],
            ['Total Billed Invoices', `$${totalInvoiced.toFixed(2)}`],
          ]}
        />
        <QuotationsInvoicesList
          userRole="admin"
          quotes={quotes}
          invoices={invoices}
          onOpenQuote={onOpenQuote}
          onOpenInvoice={onOpenInvoice}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Overview
        role="admin"
        counts={[
          ['Pet Parents (DB)', String(totalParents)],
          ['Active Sitters (DB)', String(totalSitters)],
          ['Visitor Enquiries', String(enquiries.length)],
          ['Gross Paid Volume', `$${paidRevenue.toFixed(2)}`],
        ]}
      />
      <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: '700' }}>Recent Platform Activity</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {enquiries.slice(0, 3).map((e) => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f9fafb', borderRadius: '8px' }}>
              <div>
                <b>New Visitor Enquiry</b> from {e.name} (PIN {e.pin})
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6b7280' }}>Requested {e.serviceRequested} for {e.petType}</p>
              </div>
              <small style={{ color: '#9ca3af' }}>{new Date(e.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
          {quotes.slice(0, 3).map((q) => (
            <div key={q.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', borderRadius: '8px' }}>
              <div>
                <b>Quotation Issued ({q.quoteNumber})</b> - ${q.totalAmount.toFixed(2)}
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#16a34a' }}>For {q.parentName} · Status: {q.status.toUpperCase()}</p>
              </div>
              <small style={{ color: '#9ca3af' }}>{new Date(q.createdAt).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
