import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Home, ClipboardCheck, Lock } from 'lucide-react'

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 overflow-hidden">
      {/* Soft lavender background strip */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F3FF] via-white to-[#F5F3FF]" />
      <div className="absolute top-0 left-0 right-0 h-96 bg-[#EDE9FE]/50" />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-[#E9D5FF] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#7C3AED]" strokeWidth={2} />
          </span>
          <span className="text-xl font-bold tracking-tight text-[#1F2937]">HomeGuard</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-slate-600 hover:text-[#7C3AED] transition font-medium"
          >
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

      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24">
        <section className="text-center max-w-3xl mx-auto mb-24">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 text-[#1F2937]">
            Secure property inspections,{' '}
            <span className="text-[#7C3AED]">simplified</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10">
            Schedule inspections, track reports, and protect your investment with
            a trusted inspection platform for owners and inspectors.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register/owner"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#A78BFA] text-white font-semibold hover:bg-[#9333EA] transition shadow-md shadow-[#C4B5FD]/30"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-[#C4B5FD] text-[#7C3AED] font-medium hover:bg-[#F5F3FF] transition"
            >
              Log in
            </Link>
          </div>
        </section>

        <section className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#DDD6FE] transition">
            <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] flex items-center justify-center mb-4">
              <Home className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <h3 className="font-semibold text-lg text-[#1F2937] mb-2">Property oversight</h3>
            <p className="text-slate-600 text-sm">
              Manage properties and inspection schedules in one place.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#DDD6FE] transition">
            <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] flex items-center justify-center mb-4">
              <ClipboardCheck className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <h3 className="font-semibold text-lg text-[#1F2937] mb-2">Clear reports</h3>
            <p className="text-slate-600 text-sm">
              Get detailed inspection reports and evidence for your records.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-[#DDD6FE] transition">
            <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-[#7C3AED]" />
            </div>
            <h3 className="font-semibold text-lg text-[#1F2937] mb-2">Secure & reliable</h3>
            <p className="text-slate-600 text-sm">
              Your data is protected with modern auth and encryption.
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-200 py-6 text-center text-slate-500 text-sm bg-white">
        HomeGuard — Secure Property Inspection System
      </footer>
    </div>
  )
}

export default LandingPage
