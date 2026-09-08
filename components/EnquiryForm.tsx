'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, PawPrint, MessageSquare } from 'lucide-react';

export type PublicEnquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  pin: string;
  petType: string;
  serviceRequested: string;
  message: string;
  status: 'new' | 'quoted' | 'reviewed';
  createdAt: string;
};

export default function EnquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);

    const form = new FormData(e.currentTarget);
    const enquiry: PublicEnquiry = {
      id: 'ENQ-' + Date.now().toString().slice(-6),
      name: String(form.get('name')).trim(),
      email: String(form.get('email')).trim().toLowerCase(),
      phone: String(form.get('phone')).trim(),
      pin: String(form.get('pin')).trim(),
      petType: String(form.get('petType')),
      serviceRequested: String(form.get('serviceRequested')),
      message: String(form.get('message')).trim(),
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    try {
      const existing: PublicEnquiry[] = JSON.parse(localStorage.getItem('rara_public_enquiries') || '[]');
      localStorage.setItem('rara_public_enquiries', JSON.stringify([enquiry, ...existing]));
    } catch {
      // Storage fallback
    }

    setTimeout(() => {
      setBusy(false);
      setSubmitted(true);
    }, 400);
  }

  return (
    <section id="enquiry" className="section" style={{ background: '#f8fafc', padding: '64px 20px', borderRadius: '24px', margin: '40px auto', maxWidth: '1100px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }} className="enquiry-grid-responsive">
        {/* Left Callout Text */}
        <div>
          <p className="eyebrow" style={{ color: '#00982d', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '12px' }}>
            HAVE QUESTIONS OR NEED CUSTOM CARE?
          </p>
          <h2 style={{ fontSize: '32px', fontWeight: '800', lineHeight: '1.2', margin: '0 0 16px', color: '#0f172a' }}>
            Get a instant quote matched to your locality.
          </h2>
          <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
            Not ready to create an account yet? Send us an inquiry with your Singapore 6-digit postal code.
            Our team and nearby verified sitters will review your request and get back to you with custom quote options!
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#334155' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e6f4ea', color: '#00982d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} />
              </div>
              <span><b>PIN Locality Matching</b> — We locate sitters within 5km of your postal code.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#334155' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e6f4ea', color: '#00982d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={18} />
              </div>
              <span><b>Transparent Quotations</b> — Clear breakdown with no hidden fees or extra charges.</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#334155' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e6f4ea', color: '#00982d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PawPrint size={18} />
              </div>
              <span><b>Custom Care Plans</b> — For dogs, cats, senior pets, and pets with medical needs.</span>
            </div>
          </div>
        </div>

        {/* Right Form Box */}
        <div style={{ background: '#ffffff', padding: '32px', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 12px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#e6f4ea', color: '#00982d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 8px', color: '#0f172a' }}>
                Enquiry Submitted!
              </h3>
              <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.5', margin: '0 0 20px' }}>
                Thank you for reaching out. Our team and nearby verified sitters will review your details and send a quotation to your email shortly.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="button"
                style={{ background: '#00982d', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', fontWeight: '600', cursor: 'pointer' }}
              >
                Send Another Enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 4px', color: '#0f172a' }}>
                Public Care Inquiry
              </h3>
              <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b' }}>
                Fill out the form below to receive care availability and quotation details.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  Full Name *
                  <input
                    name="name"
                    required
                    placeholder="e.g. Sarah Tan"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  Email Address *
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="sarah@example.com"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  Phone Number
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+65 9123 4567"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  Postal Code (Singapore) *
                  <input
                    name="pin"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    placeholder="6-digit PIN e.g. 238163"
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                  />
                </label>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  Pet Type
                  <select name="petType" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff' }}>
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Bird">Bird</option>
                    <option value="Rabbit/Small Pet">Rabbit / Small Pet</option>
                    <option value="Multiple Pets">Multiple Pets</option>
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                  Requested Service
                  <select name="serviceRequested" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', background: '#fff' }}>
                    <option value="Dog Walking">Dog Walking</option>
                    <option value="Pet Daycare">Pet Daycare</option>
                    <option value="Home Boarding">Home Boarding</option>
                    <option value="Home Stayover">Home Stayover</option>
                    <option value="Pet Transport">Pet Transport</option>
                  </select>
                </label>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                Your Message / Care Requirements *
                <textarea
                  name="message"
                  required
                  rows={3}
                  placeholder="Tell us about dates, specific care instructions, or any questions..."
                  style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontFamily: 'inherit' }}
                />
              </label>

              <button
                disabled={busy}
                className="button"
                style={{
                  background: '#00982d',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: busy ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px',
                }}
              >
                {busy ? 'Submitting...' : 'Send Inquiry & Get Quote'} <Send size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
