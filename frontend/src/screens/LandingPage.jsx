import React from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  Home,
  ClipboardCheck,
  Lock,
  UserCog,
  Users,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Building2,
  BarChart3,
} from 'lucide-react'

function LandingPage() {
  const features = [
    {
      icon: Home,
      title: 'Property oversight',
      description: 'Register properties, track inspection schedules, and keep all details in one secure dashboard.',
    },
    {
      icon: ClipboardCheck,
      title: 'Clear reports',
      description: 'Get detailed inspection reports with evidence, photos, and actionable findings for your records.',
    },
    {
      icon: Lock,
      title: 'Secure & reliable',
      description: 'Your data is protected with modern authentication, encryption, and role-based access control.',
    },
    {
      icon: UserCog,
      title: 'Verified inspectors',
      description: 'All inspectors are vetted and approved by admins before they can access the platform.',
    },
    {
      icon: FileText,
      title: 'Evidence & documentation',
      description: 'Attach evidence, red flags, and inspection notes to build a complete audit trail.',
    },
    {
      icon: Calendar,
      title: 'Scheduling & job tickets',
      description: 'Schedule inspections, assign job tickets to inspectors, and track status from start to finish.',
    },
  ]

  const steps = [
    { step: 1, title: 'Register', body: 'Sign up as a property owner or apply as an inspector. Inspectors wait for admin approval.', icon: Users },
    { step: 2, title: 'Add properties or get assigned', body: 'Owners add properties; admins assign inspections and job tickets to approved inspectors.', icon: Building2 },
    { step: 3, title: 'Complete inspections', body: 'Inspectors carry out checks, upload evidence, and submit reports through the platform.', icon: ClipboardCheck },
    { step: 4, title: 'Review & act', body: 'Owners and admins review reports, evidence, and red flags to make informed decisions.', icon: BarChart3 },
  ]

  const forOwners = [
    'Register and manage multiple properties',
    'Request and schedule inspections',
    'View inspection reports and evidence',
    'Track red flags and follow-up actions',
  ]

  const forInspectors = [
    'Apply to join; get approved by admin',
    'Receive assigned job tickets',
    'Complete inspections and upload evidence',
    'Submit reports and update status',
  ]

  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F3FF] via-white to-[#F5F3FF]" />
      <div className="absolute top-0 left-0 right-0 h-[28rem] bg-[#EDE9FE]/50 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-[#E9D5FF] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#7C3AED]" strokeWidth={2} />
          </span>
          <span className="text-xl font-bold tracking-tight text-[#1F2937]">HomeGuard</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/login" className="text-slate-600 hover:text-[#7C3AED] transition font-medium">
            Log in
          </Link>
          <Link
            to="/register/owner"
            className="px-4 py-2.5 rounded-xl bg-[#A78BFA] text-white font-semibold hover:bg-[#9333EA] transition shadow-sm"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto pt-10 pb-20">
          <p className="text-[#7C3AED] font-semibold text-sm uppercase tracking-wider mb-4">
            Property inspection platform
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-[#1F2937]">
            Secure property inspections,{' '}
            <span className="text-[#7C3AED]">simplified</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10">
            Schedule inspections, track reports, and protect your investment with a trusted platform
            for property owners and vetted inspectors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 flex-wrap">
            <Link
              to="/register/owner"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#A78BFA] text-white font-semibold hover:bg-[#9333EA] transition shadow-md shadow-[#C4B5FD]/30"
            >
              Register as owner
            </Link>
            <Link
              to="/register/inspector"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-[#C4B5FD] text-[#7C3AED] font-semibold hover:bg-[#F5F3FF] transition"
            >
              Register as inspector
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition"
            >
              Log in
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-16 border-t border-slate-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] text-center mb-4">
            How it works
          </h2>
          <p className="text-slate-600 text-center max-w-xl mx-auto mb-12">
            From registration to report review — a simple flow for owners, inspectors, and admins.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="relative">
                  <div className="flex items-start gap-4">
                    <span className="w-10 h-10 rounded-xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center shrink-0 font-bold">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="font-semibold text-[#1F2937] mb-1">{item.title}</h3>
                      <p className="text-slate-600 text-sm">{item.body}</p>
                    </div>
                  </div>
                  {item.step < steps.length && (
                    <div className="hidden lg:block absolute top-5 left-[4.5rem] w-[calc(100%-3rem)] border-t border-dashed border-slate-200 -z-10" />
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* Features grid */}
        <section id="features" className="py-16 border-t border-slate-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] text-center mb-4">
            Everything you need
          </h2>
          <p className="text-slate-600 text-center max-w-xl mx-auto mb-12">
            One platform for property management, inspections, and compliance.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#DDD6FE] transition"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-[#7C3AED]" />
                  </div>
                  <h3 className="font-semibold text-lg text-[#1F2937] mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* For owners vs For inspectors */}
        <section className="py-16 border-t border-slate-100">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] text-center mb-12">
            Built for both sides
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="p-8 rounded-2xl bg-[#F5F3FF] border border-[#EDE9FE]">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-12 h-12 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                  <Home className="w-6 h-6 text-[#7C3AED]" />
                </span>
                <h3 className="text-xl font-bold text-[#1F2937]">For property owners</h3>
              </div>
              <ul className="space-y-3">
                {forOwners.map((text) => (
                  <li key={text} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-[#7C3AED] shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register/owner"
                className="mt-6 inline-flex items-center gap-2 text-[#7C3AED] font-semibold hover:underline"
              >
                Register as owner <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-12 h-12 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                  <UserCog className="w-6 h-6 text-[#7C3AED]" />
                </span>
                <h3 className="text-xl font-bold text-[#1F2937]">For inspectors</h3>
              </div>
              <ul className="space-y-3">
                {forInspectors.map((text) => (
                  <li key={text} className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-[#7C3AED] shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/register/inspector"
                className="mt-6 inline-flex items-center gap-2 text-[#7C3AED] font-semibold hover:underline"
              >
                Apply as inspector <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-slate-100">
          <div className="max-w-2xl mx-auto text-center p-10 rounded-3xl bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] border border-[#C4B5FD]">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] mb-3">
              Ready to get started?
            </h2>
            <p className="text-slate-600 mb-8">
              Join HomeGuard as an owner or apply as an inspector. Secure, simple, and built for trust.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register/owner"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#7C3AED] text-white font-semibold hover:bg-[#6D28D9] transition shadow-lg"
              >
                Register as owner
              </Link>
              <Link
                to="/register/inspector"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-[#7C3AED] font-semibold border-2 border-[#7C3AED] hover:bg-[#F5F3FF] transition"
              >
                Apply as inspector
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-9 h-9 rounded-lg bg-[#EDE9FE] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-[#7C3AED]" strokeWidth={2} />
                </span>
                <span className="font-bold text-[#1F2937]">HomeGuard</span>
              </div>
              <p className="text-slate-500 text-sm">
                Secure property inspection system for owners and inspectors.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#1F2937] mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/register/owner" className="hover:text-[#7C3AED]">For owners</Link></li>
                <li><Link to="/register/inspector" className="hover:text-[#7C3AED]">For inspectors</Link></li>
                <li><Link to="/login" className="hover:text-[#7C3AED]">Log in</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#1F2937] mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#how-it-works" className="hover:text-[#7C3AED]">How it works</a></li>
                <li><a href="#features" className="hover:text-[#7C3AED]">Features</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-[#1F2937] mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-[#7C3AED]">Terms of service</a></li>
                <li><a href="#" className="hover:text-[#7C3AED]">Privacy policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} HomeGuard. Secure Property Inspection System.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
