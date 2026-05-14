// OA PROPOSAL GENERATOR — ProposalApp.jsx
// BUILD PHASE SHELL — V1 architecture in place, UI ready for Jade's design iteration
//
// Two modes:
// ADMIN — internal OA team (Jade, Tyler, Carlie) — compose, manage, preview proposals
// CLIENT — external client via tokenized URL — view, interact, approve, pay
//
// Today's shell has:
// - Admin: proposal list, + New Proposal button, proposal composer scaffold
// - Client: proposal viewer scaffold with correct layout zones
// Both are ready for Jade to iterate the UI on her branch

import { useState, useEffect } from 'react'

// ── SHARED CONSTANTS ─────────────────────────────────────────
const BRAND = {
  gold: '#9e8959',
  cream: '#c5b798',
  offwhite: '#faf8f5',
  black: '#1a1a1a',
  charcoal: '#2c2c2c',
  border: '#e8e2d9',
  muted: '#8a8070',
  mutedLight: '#c5b798',
}

const s = {
  label: { display: 'block', fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: BRAND.muted, textTransform: 'uppercase', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.625rem 0.75rem', border: `1px solid ${BRAND.border}`, borderRadius: '3px', fontSize: '14px', fontFamily: 'DM Sans', outline: 'none', color: BRAND.black, background: '#fff' },
  btnGold: { padding: '0.625rem 1.5rem', background: BRAND.gold, color: '#fff', border: 'none', borderRadius: '3px', fontSize: '12px', fontFamily: 'DM Sans', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' },
  btnOutline: { padding: '0.5rem 1rem', background: 'transparent', color: BRAND.gold, border: `1px solid ${BRAND.gold}`, borderRadius: '3px', fontSize: '12px', fontFamily: 'DM Sans', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' },
  card: { background: '#fff', border: `1px solid ${BRAND.border}`, borderRadius: '4px', padding: '1.5rem', marginBottom: '1rem' },
}

// ── PROPOSAL TYPES ────────────────────────────────────────────
const PROPOSAL_TYPES = {
  popcorn: { label: 'Popcorn', desc: 'Simple itemized quote — fast turnaround', color: '#8a8070', bg: '#f5f5f0' },
  refresh: { label: 'Refresh', desc: 'Mid-complexity — optional mood board', color: '#7a6a5a', bg: '#faf3e8' },
  large_design: { label: 'Large Design', desc: 'Full proposal — mood board, room-by-room', color: '#9e8959', bg: '#fdf8ef' },
}

// ── BUILD STATUS BANNER ───────────────────────────────────────
// Shows the current state of each section — helps Jade see what's wired vs scaffolded
const BuildStatusBanner = ({ items }) => (
  <div style={{ background: '#1a1a1a', borderRadius: '4px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
    <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: BRAND.gold, textTransform: 'uppercase', marginBottom: '0.625rem' }}>
      Build Status — Branch: {window.location.hostname.includes('netlify') ? 'main' : 'local'}
    </p>
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.status === 'live' ? '#10b981' : item.status === 'scaffold' ? '#f59e0b' : '#6b7280' }} />
          <span style={{ fontSize: '11px', color: item.status === 'live' ? '#10b981' : item.status === 'scaffold' ? '#f59e0b' : '#6b7280' }}>{item.label}</span>
        </div>
      ))}
    </div>
  </div>
)

// ── ADMIN VIEW ────────────────────────────────────────────────
const AdminView = ({ supabase, userProfile }) => {
  const [activePanel, setActivePanel] = useState('dashboard') // dashboard | composer | preview
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [newProposal, setNewProposal] = useState({
    project_name: '',
    client_name: '',
    client_email: '',
    proposal_type: 'refresh',
    sales_rep: userProfile?.display_name || '',
    notes: ''
  })

  // Load proposals from Supabase (table created when we build V1 properly)
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('proposals').select('*').order('created_at', { ascending: false })
        setProposals(data || [])
      } catch (e) {
        // proposals table not created yet — scaffold mode
        setProposals([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [supabase])

  const buildStatus = [
    { label: 'Auth', status: 'live' },
    { label: 'Admin shell', status: 'live' },
    { label: 'Proposal composer', status: 'scaffold' },
    { label: 'DPL parser', status: 'pending' },
    { label: 'Fabric/finish dropdowns', status: 'pending' },
    { label: 'Client viewer', status: 'scaffold' },
    { label: 'Approval flow', status: 'scaffold' },
    { label: 'QBO Payments', status: 'pending' },
    { label: 'Notifications', status: 'pending' },
  ]

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: 240, background: '#fff', borderRight: `1px solid ${BRAND.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '1.25rem 1rem', borderBottom: `1px solid ${BRAND.border}` }}>
          <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: BRAND.muted, textTransform: 'uppercase', marginBottom: '0.75rem' }}>Proposal Studio</p>
          <button onClick={() => setActivePanel('composer')} style={{ ...s.btnGold, width: '100%', fontSize: '11px' }}>
            + New Proposal
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '⌂' },
            { id: 'composer', label: 'Proposal Composer', icon: '✏' },
            { id: 'preview', label: 'Client Preview', icon: '◎' },
          ].map(item => (
            <button key={item.id} onClick={() => setActivePanel(item.id)} style={{
              width: '100%', padding: '0.625rem 1rem', background: activePanel === item.id ? BRAND.offwhite : 'transparent',
              borderLeft: activePanel === item.id ? `3px solid ${BRAND.gold}` : '3px solid transparent',
              border: 'none', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.625rem',
              fontSize: '13px', color: activePanel === item.id ? BRAND.black : BRAND.muted, fontFamily: 'DM Sans',
              transition: 'all 0.15s'
            }}>
              <span style={{ fontSize: '14px' }}>{item.icon}</span> {item.label}
            </button>
          ))}

          <div style={{ padding: '1rem', borderTop: `1px solid ${BRAND.border}`, marginTop: '1rem' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: BRAND.muted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Recent</p>
            {loading ? (
              <p style={{ fontSize: '12px', color: BRAND.mutedLight }}>Loading…</p>
            ) : proposals.length === 0 ? (
              <p style={{ fontSize: '12px', color: BRAND.mutedLight, lineHeight: 1.5 }}>No proposals yet. Create your first one.</p>
            ) : proposals.slice(0, 5).map(p => (
              <div key={p.id} style={{ padding: '0.5rem 0', borderBottom: `1px solid ${BRAND.border}`, cursor: 'pointer' }}>
                <p style={{ fontSize: '12px', fontWeight: 500, color: BRAND.black }}>{p.project_name}</p>
                <p style={{ fontSize: '11px', color: BRAND.muted }}>{p.client_name} · {p.proposal_type}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '2rem', background: BRAND.offwhite }}>
        {activePanel === 'dashboard' && (
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 400, marginBottom: '0.5rem' }}>Proposal Studio</h2>
            <p style={{ fontSize: '13px', color: BRAND.muted, marginBottom: '2rem' }}>Custom Home Interiors — Internal proposal management</p>

            <BuildStatusBanner items={buildStatus} />

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { label: 'Total Proposals', value: proposals.length, sub: 'All time' },
                { label: 'Awaiting Approval', value: proposals.filter(p => p.status === 'sent').length, sub: 'Sent to clients' },
                { label: 'Approved', value: proposals.filter(p => p.status === 'approved').length, sub: 'This month' },
                { label: 'In Progress', value: proposals.filter(p => p.status === 'draft').length, sub: 'Drafts' },
              ].map((stat, i) => (
                <div key={i} style={s.card}>
                  <p style={{ fontSize: '11px', color: BRAND.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{stat.label}</p>
                  <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '36px', fontWeight: 400, color: BRAND.black, marginBottom: '0.25rem' }}>{stat.value}</p>
                  <p style={{ fontSize: '12px', color: BRAND.mutedLight }}>{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Proposal types */}
            <div style={s.card}>
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 500, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `1px solid ${BRAND.border}` }}>
                Proposal Types
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {Object.entries(PROPOSAL_TYPES).map(([key, type]) => (
                  <div key={key} onClick={() => { setNewProposal(f => ({ ...f, proposal_type: key })); setActivePanel('composer') }}
                    style={{ padding: '1.25rem', borderRadius: '4px', background: type.bg, border: `1px solid ${BRAND.border}`, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 500, color: type.color, marginBottom: '0.375rem' }}>{type.label}</p>
                    <p style={{ fontSize: '12px', color: BRAND.muted, lineHeight: 1.5 }}>{type.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Design notes for Jade */}
            <div style={{ ...s.card, borderLeft: `3px solid ${BRAND.gold}`, background: '#fffdf9' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', fontWeight: 500, marginBottom: '0.75rem', color: BRAND.black }}>
                For Jade — Design Notes
              </h3>
              <p style={{ fontSize: '13px', color: '#5a5248', lineHeight: 1.8, marginBottom: '0.75rem' }}>
                This is the real Proposal Generator codebase. Your branch is your sandbox — push freely and Netlify will build you a live preview URL automatically within 2 minutes. Nothing reaches production until Tyler reviews and merges your PR.
              </p>
              <p style={{ fontSize: '13px', color: '#5a5248', lineHeight: 1.8, marginBottom: '0.75rem' }}>
                <strong>Today's session will finalize the design spec for V1.</strong> As we make decisions, Tyler will build them here. Your job is to push UI iterations on your branch and flag what works vs what needs refinement.
              </p>
              <p style={{ fontSize: '13px', color: '#5a5248', lineHeight: 1.8 }}>
                <strong>The Proposal Composer and Client Preview are scaffolded</strong> — the layout zones are in place, the data connections are wired, but the visual design is waiting for your decisions today. Start there.
              </p>
            </div>
          </div>
        )}

        {activePanel === 'composer' && (
          <div style={{ maxWidth: 720 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 400, marginBottom: '0.25rem' }}>New Proposal</h2>
                <p style={{ fontSize: '13px', color: BRAND.muted }}>Fill in the project details to create a proposal</p>
              </div>
            </div>

            {/* Proposal type selector */}
            <div style={s.card}>
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', fontWeight: 500, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `1px solid ${BRAND.border}` }}>Proposal Type</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {Object.entries(PROPOSAL_TYPES).map(([key, type]) => (
                  <button key={key} onClick={() => setNewProposal(f => ({ ...f, proposal_type: key }))} style={{
                    padding: '0.875rem', borderRadius: '3px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    background: newProposal.proposal_type === key ? BRAND.gold : type.bg,
                    border: `1px solid ${newProposal.proposal_type === key ? BRAND.gold : BRAND.border}`,
                    color: newProposal.proposal_type === key ? '#fff' : type.color,
                    fontFamily: 'DM Sans'
                  }}>
                    <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '17px', fontWeight: 500, marginBottom: '0.25rem' }}>{type.label}</p>
                    <p style={{ fontSize: '11px', opacity: 0.8, lineHeight: 1.4 }}>{type.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Project details */}
            <div style={s.card}>
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', fontWeight: 500, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `1px solid ${BRAND.border}` }}>Project Details</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={s.label}>Project Name *</label>
                  <input style={s.input} value={newProposal.project_name} onChange={e => setNewProposal(f => ({ ...f, project_name: e.target.value }))} placeholder="e.g. Riverstone Retirement — Phase 2" />
                </div>
                <div>
                  <label style={s.label}>Client Name *</label>
                  <input style={s.input} value={newProposal.client_name} onChange={e => setNewProposal(f => ({ ...f, client_name: e.target.value }))} placeholder="e.g. Patricia Vanderloo" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={s.label}>Client Email</label>
                  <input style={s.input} type="email" value={newProposal.client_email} onChange={e => setNewProposal(f => ({ ...f, client_email: e.target.value }))} placeholder="client@company.com" />
                </div>
                <div>
                  <label style={s.label}>Sales Rep</label>
                  <input style={s.input} value={newProposal.sales_rep} onChange={e => setNewProposal(f => ({ ...f, sales_rep: e.target.value }))} placeholder="e.g. Jade Scatliffe" />
                </div>
              </div>
            </div>

            {/* DPL Upload — scaffold */}
            <div style={{ ...s.card, borderStyle: 'dashed', borderColor: BRAND.border }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', fontWeight: 500, marginBottom: '0.5rem' }}>DPL Upload</h3>
              <p style={{ fontSize: '12px', color: BRAND.muted, marginBottom: '1rem', lineHeight: 1.6 }}>
                The DPL parser will read your Excel file and auto-generate line items. Fabric/finish dropdowns will populate from the Sample Library for upholstered items.
              </p>
              <div style={{ border: `2px dashed ${BRAND.border}`, borderRadius: '4px', padding: '2rem', textAlign: 'center', background: BRAND.offwhite }}>
                <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', color: BRAND.mutedLight, marginBottom: '0.5rem' }}>DPL Parser — Coming in V1 Build</p>
                <p style={{ fontSize: '12px', color: BRAND.muted }}>Drop your DPL Excel file here to auto-generate line items</p>
              </div>
            </div>

            {/* Content blocks — scaffold */}
            <div style={s.card}>
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', fontWeight: 500, marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: `1px solid ${BRAND.border}` }}>
                Content Blocks
              </h3>
              <p style={{ fontSize: '12px', color: BRAND.muted, marginBottom: '1rem', lineHeight: 1.6 }}>
                These blocks are turned on/off based on proposal type. Jade's session today will finalize what's required vs optional for each type.
              </p>
              {[
                { name: 'Cover Page', status: 'live', required: true },
                { name: 'Scope Summary', status: 'scaffold', required: true },
                { name: 'Room Renders', status: 'scaffold', required: false },
                { name: 'Line Items + Fabric/Finish', status: 'scaffold', required: true },
                { name: 'Mood Board', status: 'pending', required: false },
                { name: 'Designer Notes', status: 'pending', required: false },
                { name: 'iGuide 3D Tour', status: 'pending', required: false },
                { name: 'Embedded Video', status: 'pending', required: false },
                { name: 'Payment Terms', status: 'scaffold', required: true },
                { name: 'Approval + Signature', status: 'scaffold', required: true },
              ].map((block, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: i < 9 ? `1px solid ${BRAND.border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: block.status === 'live' ? '#10b981' : block.status === 'scaffold' ? '#f59e0b' : '#6b7280', flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', color: BRAND.black }}>{block.name}</span>
                    {block.required && <span style={{ fontSize: '9px', fontWeight: 600, padding: '1px 5px', background: '#f0ece6', color: BRAND.muted, borderRadius: '2px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Required</span>}
                  </div>
                  <span style={{ fontSize: '10px', color: block.status === 'live' ? '#10b981' : block.status === 'scaffold' ? '#f59e0b' : '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {block.status}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setActivePanel('preview')} style={s.btnOutline}>Preview</button>
              <button style={{ ...s.btnGold, opacity: 0.5, cursor: 'not-allowed' }} disabled>
                Generate Proposal — Coming in V1 Build
              </button>
            </div>
          </div>
        )}

        {activePanel === 'preview' && (
          <ClientProposalPreview mode="admin" />
        )}
      </div>
    </div>
  )
}

// ── CLIENT PROPOSAL VIEWER ────────────────────────────────────
// This is what clients see at /proposal/:token
// Currently a scaffold — layout zones in place, ready for Jade's design iteration
const ClientProposalPreview = ({ mode = 'client', token }) => {
  const [approved, setApproved] = useState(false)
  const [approverName, setApproverName] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('eft')
  const [showApproval, setShowApproval] = useState(false)
  const [selectedFinish, setSelectedFinish] = useState('default')

  // Hardcoded demo data — will be loaded from Supabase by token in V1
  const proposal = {
    project_name: 'Riverstone Retirement',
    subtitle: 'Model Suite — Phase 2 Lounge Furniture',
    client_name: 'Patricia Vanderloo',
    client_org: 'Riverstone Management Group',
    rep_name: 'Jade Scatliffe',
    rep_email: 'jade@obviousadvantage.ca',
    number: '26-RIV-04',
    date: 'May 15, 2026',
    valid_days: 30,
    rooms: [
      {
        name: 'Main Lounge',
        items: [
          { code: 'S-01', name: 'Lounge Sofa', vendor: 'Palette', desc: 'Three-seater, solid wood frame, COM upholstery', dims: '87"W × 34"D × 30"H', qty: 4, unit: 2840, hasFinish: true },
          { code: 'C-01', name: 'Accent Chair', vendor: 'ISA International', desc: 'Curved back, tapered leg, COM upholstery', dims: '28"W × 30"D × 33"H', qty: 8, unit: 1240, hasFinish: true },
          { code: 'T-01', name: 'Coffee Table', vendor: 'Sunpan', desc: 'Smoked oak top, matte black metal base', dims: '48"W × 26"D × 16"H', qty: 4, unit: 960, hasFinish: false },
          { code: 'T-02', name: 'Console Table', vendor: 'Sunpan', desc: 'Walnut veneer, brass hairpin legs', dims: '60"W × 14"D × 30"H', qty: 2, unit: 1320, hasFinish: false },
        ]
      }
    ],
    finishOptions: [
      { id: 'default', label: 'Ennis Challenger Charcoal', code: 'FB-ENS-01', delta: 0 },
      { id: 'opt2', label: 'Momentum Beaufille Dune', code: 'FB-MOM-01', delta: 85 },
      { id: 'opt3', label: 'Mayer Sanctuary Navy', code: 'FB-MAY-01', delta: 140 },
    ]
  }

  const subtotal = proposal.rooms.flatMap(r => r.items).reduce((sum, item) => sum + item.qty * item.unit, 0)
  const finishDelta = proposal.finishOptions.find(f => f.id === selectedFinish)?.delta || 0
  const adjustedSubtotal = subtotal + (finishDelta * proposal.rooms.flatMap(r => r.items).filter(i => i.hasFinish).reduce((sum, i) => sum + i.qty, 0))
  const total = Math.round(adjustedSubtotal * 1.13)
  const deposit = Math.round(total * 0.5)

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', paddingBottom: '4rem' }}>
      {mode === 'admin' && (
        <div style={{ background: '#1a1a1a', borderRadius: '4px', padding: '0.75rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ fontSize: '12px', color: '#8a8070' }}>Admin preview — this is what the client sees at their proposal URL</span>
          <span style={{ marginLeft: 'auto', fontSize: '11px', color: BRAND.gold }}>proposals.obviousadvantage.ca/proposal/[token]</span>
        </div>
      )}

      {/* Proposal header */}
      <div style={{ background: '#1a1a1a', borderRadius: '6px 6px 0 0', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, width: 220, height: '100%', background: 'linear-gradient(135deg, transparent 40%, #9e895912)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '10px', letterSpacing: '0.2em', color: BRAND.gold, textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 500 }}>
              Custom Home Interiors · An Obvious Advantage Company
            </div>
            <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '40px', fontWeight: 300, color: '#fff', marginBottom: '0.25rem' }}>
              {proposal.project_name}
            </h1>
            <p style={{ fontFamily: 'Cormorant Garamond', fontSize: '22px', fontWeight: 300, color: BRAND.cream }}>
              {proposal.subtitle}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#8a8070', marginBottom: '0.25rem' }}>#{proposal.number}</div>
            <div style={{ fontSize: '11px', color: '#8a8070', marginBottom: '0.25rem' }}>{proposal.date}</div>
            <div style={{ fontSize: '11px', color: '#8a8070' }}>Valid {proposal.valid_days} days</div>
          </div>
        </div>
        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #2a2a2a', display: 'flex', gap: '2.5rem' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#8a8070', letterSpacing: '0.1em', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Client</div>
            <div style={{ fontSize: '14px', color: '#fff' }}>{proposal.client_name}</div>
            <div style={{ fontSize: '12px', color: '#8a8070' }}>{proposal.client_org}</div>
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#8a8070', letterSpacing: '0.1em', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Prepared By</div>
            <div style={{ fontSize: '14px', color: '#fff' }}>{proposal.rep_name}</div>
            <div style={{ fontSize: '12px', color: '#8a8070' }}>{proposal.rep_email}</div>
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${BRAND.gold}, ${BRAND.cream}, ${BRAND.gold})` }} />
      </div>

      {/* Rooms */}
      <div style={{ background: '#fff', border: `1px solid ${BRAND.border}`, borderTop: 'none' }}>
        {proposal.rooms.map((room, ri) => (
          <div key={ri}>
            <div style={{ padding: '1rem 2rem', borderBottom: `1px solid #f0ece6`, display: 'flex', alignItems: 'center', gap: '1rem', background: BRAND.offwhite }}>
              <div style={{ width: 3, height: 20, background: BRAND.gold, borderRadius: '2px' }} />
              <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 500 }}>{room.name}</span>
              <span style={{ fontSize: '11px', color: BRAND.muted, marginLeft: 'auto' }}>{room.items.length} items</span>
            </div>
            {room.items.map((item, ii) => (
              <div key={item.code} style={{ padding: '1.5rem 2rem', borderBottom: ii < room.items.length - 1 ? `1px solid #f0ece6` : 'none', display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '1.25rem', alignItems: 'start' }}>
                <div style={{ width: 80, height: 80, background: '#f0ece6', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '10px', color: BRAND.mutedLight, fontFamily: 'monospace' }}>{item.code}</span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '18px', fontWeight: 500 }}>{item.name}</span>
                    <span style={{ fontSize: '11px', color: BRAND.gold, fontWeight: 500 }}>{item.vendor}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#5a5248', marginBottom: '0.25rem', lineHeight: 1.5 }}>{item.desc}</p>
                  <p style={{ fontSize: '11px', color: BRAND.muted, marginBottom: item.hasFinish ? '0.75rem' : 0 }}>{item.dims} · Qty: {item.qty}</p>
                  {item.hasFinish && (
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', color: BRAND.muted, textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                        Fabric / Finish Selection
                      </div>
                      <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {proposal.finishOptions.map(opt => (
                          <button key={opt.id} onClick={() => setSelectedFinish(opt.id)} style={{
                            padding: '0.3rem 0.75rem', borderRadius: '3px', fontSize: '12px', fontFamily: 'DM Sans', cursor: 'pointer',
                            background: selectedFinish === opt.id ? BRAND.gold : '#f0ece6',
                            color: selectedFinish === opt.id ? '#fff' : '#5a5248',
                            border: `1px solid ${selectedFinish === opt.id ? BRAND.gold : '#d4cdc4'}`,
                            transition: 'all 0.15s'
                          }}>
                            {opt.label}
                            {opt.delta > 0 && <span style={{ marginLeft: '0.375rem', opacity: 0.8 }}>+${opt.delta}/unit</span>}
                          </button>
                        ))}
                      </div>
                      <p style={{ fontSize: '11px', color: '#065f46', marginTop: '0.375rem' }}>
                        Selected: <strong>{proposal.finishOptions.find(f => f.id === selectedFinish)?.code}</strong>
                      </p>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', minWidth: 120 }}>
                  <div style={{ fontSize: '13px', color: BRAND.muted, marginBottom: '2px' }}>${item.unit.toLocaleString()} /unit</div>
                  <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 500 }}>${(item.qty * item.unit).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Totals */}
        <div style={{ padding: '1.5rem 2rem', borderTop: `2px solid ${BRAND.border}`, background: BRAND.offwhite }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 300 }}>
              {finishDelta > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '12px', color: BRAND.gold }}>
                  <span>Fabric upgrade</span>
                  <span>+${(finishDelta * proposal.rooms.flatMap(r => r.items).filter(i => i.hasFinish).reduce((s, i) => s + i.qty, 0)).toLocaleString()}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '13px', color: '#5a5248' }}>
                <span>Subtotal (delivered & installed)</span>
                <span>${adjustedSubtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem', fontSize: '13px', color: '#5a5248' }}>
                <span>HST (13%)</span>
                <span>${Math.round(adjustedSubtotal * 0.13).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: `1px solid ${BRAND.border}`, margin: '0.5rem 0' }}>
                <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 500 }}>Total</span>
                <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', fontWeight: 500 }}>${total.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: BRAND.muted }}>
                <span>50% Deposit to Approve</span>
                <span style={{ fontWeight: 600 }}>${deposit.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Approve + Pay */}
        {!approved ? (
          <div style={{ padding: '2rem', borderTop: `1px solid ${BRAND.border}`, textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#5a5248', marginBottom: '1.25rem', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 1.25rem' }}>
              All prices valid for {proposal.valid_days} days. By approving you confirm authority to commit to this purchase. A 50% deposit is required to begin.
            </p>
            <button onClick={() => setShowApproval(true)} style={{
              padding: '1rem 3rem', background: BRAND.gold, color: '#fff', border: 'none', borderRadius: '3px',
              fontFamily: 'Cormorant Garamond', fontSize: '20px', letterSpacing: '0.05em', cursor: 'pointer'
            }}>
              Approve & Pay Deposit
            </button>
          </div>
        ) : (
          <div style={{ padding: '2rem', borderTop: `1px solid ${BRAND.border}`, textAlign: 'center', background: '#f0fdf4' }}>
            <div style={{ fontFamily: 'Cormorant Garamond', fontSize: '30px', color: '#065f46', marginBottom: '0.5rem' }}>✓ Welcome to your project</div>
            <p style={{ fontSize: '14px', color: '#065f46' }}>Approved by {approverName} · Your project room is being prepared</p>
          </div>
        )}
      </div>

      {/* Approval modal */}
      {showApproval && !approved && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ background: '#fff', borderRadius: '6px', maxWidth: 520, width: '100%', padding: '2.5rem' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', fontWeight: 400, marginBottom: '0.5rem' }}>You're approving this project</h2>
            <p style={{ fontSize: '14px', color: '#5a5248', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {proposal.project_name} · ${total.toLocaleString()} total · 50% deposit ${deposit.toLocaleString()}
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={s.label}>Your full name (legal signature)</label>
              <input style={s.input} value={approverName} onChange={e => setApproverName(e.target.value)} placeholder="Type your full name" autoFocus />
            </div>
            <div style={{ padding: '0.75rem', background: BRAND.offwhite, border: `1px solid ${BRAND.border}`, borderRadius: '3px', fontSize: '12px', color: '#5a5248', marginBottom: '1.25rem', lineHeight: 1.7 }}>
              ☐ I confirm authority to approve this purchase on behalf of {proposal.client_org}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.12em', color: BRAND.muted, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                Deposit — ${deposit.toLocaleString()}
              </div>
              {[
                { id: 'eft', label: 'EFT / Bank Transfer', sub: "Most cost-effective — we'll send instructions", badge: 'Recommended' },
                { id: 'etransfer', label: 'E-Transfer', sub: 'Send to payments@obviousadvantage.ca' },
                { id: 'cc', label: 'Credit Card', sub: '3% processing fee applies' },
                { id: 'po', label: 'Cheque / PO', sub: 'For corporate AP — we\'ll email details' },
              ].map(opt => (
                <div key={opt.id} onClick={() => setPaymentMethod(opt.id)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem',
                  border: `1px solid ${paymentMethod === opt.id ? BRAND.gold : BRAND.border}`,
                  borderRadius: '3px', marginBottom: '0.5rem', cursor: 'pointer',
                  background: paymentMethod === opt.id ? '#fffdf9' : '#fff'
                }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${BRAND.gold}`, background: paymentMethod === opt.id ? BRAND.gold : 'transparent', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{opt.label}</div>
                    <div style={{ fontSize: '12px', color: BRAND.muted }}>{opt.sub}</div>
                  </div>
                  {opt.badge && <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', background: '#d1fae5', color: '#065f46', borderRadius: '2px' }}>{opt.badge}</span>}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowApproval(false)} style={{ ...s.btnOutline, flex: 1 }}>Cancel</button>
              <button
                onClick={() => { if (approverName.trim().length > 2) { setApproved(true); setShowApproval(false) } }}
                disabled={approverName.trim().length < 3}
                style={{ ...s.btnGold, flex: 2, padding: '0.875rem', fontSize: '14px', opacity: approverName.trim().length < 3 ? 0.5 : 1 }}>
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── MAIN APP ──────────────────────────────────────────────────
export default function ProposalApp({ supabase, userProfile, mode, token }) {
  if (mode === 'client' && token) {
    return (
      <div style={{ minHeight: '100vh', background: BRAND.offwhite, padding: '2rem 1rem' }}>
        <ClientProposalPreview mode="client" token={token} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      {/* Top bar */}
      <div style={{ height: 56, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: 28, height: 28, background: BRAND.gold, borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '13px', color: '#fff', fontWeight: 600 }}>OA</span>
          </div>
          <span style={{ fontFamily: 'Cormorant Garamond', fontSize: '17px', fontWeight: 300, color: '#fff', letterSpacing: '0.08em' }}>PROPOSAL STUDIO</span>
          <span style={{ fontSize: '10px', color: BRAND.gold, border: `1px solid ${BRAND.gold}`, padding: '1px 6px', borderRadius: '2px', letterSpacing: '0.08em' }}>BUILD PHASE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '12px', color: '#8a8070' }}>{userProfile?.display_name || userProfile?.email}</span>
          <button onClick={() => supabase.auth.signOut()} style={{ fontSize: '11px', color: '#8a8070', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans' }}>Sign out</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden' }}>
        <AdminView supabase={supabase} userProfile={userProfile} />
      </div>
    </div>
  )
}
