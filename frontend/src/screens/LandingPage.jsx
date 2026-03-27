import { Link } from 'react-router-dom'
import React, { useEffect, useState } from 'react'
import { Shield, Calendar, FileText, CheckCircle2, Star, BadgeCheck, Wallet, Clock3 } from 'lucide-react'
import { feedbackService } from '../services/requests/feedbackService'

function LandingPage() {
  const [publicFeedback, setPublicFeedback] = useState([])
  const [feedbackLoading, setFeedbackLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function loadPublicFeedback() {
      try {
        setFeedbackLoading(true)
        const rows = await feedbackService.getPublicFeedback(3)
        if (!cancelled) setPublicFeedback(Array.isArray(rows) ? rows : [])
      } catch {
        if (!cancelled) setPublicFeedback([])
      } finally {
        if (!cancelled) setFeedbackLoading(false)
      }
    }
    loadPublicFeedback()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEE7FF] via-[#F8F5FF] to-[#EDE9FE] text-[#2D1B69]">
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-violet-100/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src="/logo.svg" alt="HomeGuard" width={40} height={40} className="h-10 w-10 rounded-xl" />
          <span className="font-bold text-lg">HomeGuard</span>
        </Link>
        <div className="flex gap-2 sm:gap-3">
          <Link to="/login" className="text-sm px-3 py-2 rounded-lg hover:bg-violet-50">Log in</Link>
          <Link to="/register/owner" className="bg-[#6D28D9] text-white px-4 py-2 rounded-lg text-sm hover:bg-violet-800 transition">Register</Link>
        </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 items-center gap-12 py-16">
        <div>
          <p className="text-[#7C3AED] font-semibold mb-3">Property inspection platform</p>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Secure property <br />
            inspections, simplified
          </h1>
          <p className="text-slate-600 mb-8">
            Schedule inspections, track reports, and protect your investment.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register/owner" className="bg-[#6D28D9] text-white px-6 py-3 rounded-xl shadow">
              Register as owner
            </Link>
            <Link to="/register/inspector" className="bg-white px-6 py-3 rounded-xl shadow">
              Register as inspector
            </Link>
            <Link to="/login" className="bg-white px-6 py-3 rounded-xl shadow">
              Log in
            </Link>
          </div>
        </div>

        <div className="flex justify-center relative">
          <img
            src="/hero.svg"
            alt="inspection"
            width={480}
            height={360}
            className="w-full max-w-lg object-contain drop-shadow-2xl"
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active owners', value: '500+', icon: BadgeCheck },
            { label: 'Inspections completed', value: '2,000+', icon: Shield },
            { label: 'Avg. assignment time', value: '< 15 min', icon: Clock3 },
            { label: 'Payment tracking', value: 'Manual + Verified', icon: Wallet },
          ].map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className="bg-white/85 border border-violet-100 rounded-2xl p-4 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-xl font-bold text-slate-900">{item.value}</p>
                <p className="text-xs text-slate-500 mt-1">{item.label}</p>
              </div>
            )
          })}
        </div>
      </section>

      <div id="features" className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 px-6 mt-6">
        {[
          { icon: Calendar, title: 'Easy Scheduling', text: 'Book and manage inspections with ease.' },
          { icon: Shield, title: 'Vetted Inspectors', text: 'Qualified professionals you can trust.' },
          { icon: FileText, title: 'Detailed Reports', text: 'Comprehensive inspection reports.' },
        ].map((f, i) => {
          const Icon = f.icon
          return (
            <div key={i} className="bg-white/80 backdrop-blur p-6 rounded-2xl shadow-lg border border-white">
              <div className="w-12 h-12 bg-[#EDE9FE] rounded-xl flex items-center justify-center mb-4">
                <Icon className="text-[#6D28D9]" />
              </div>
              <h3 className="font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.text}</p>
            </div>
          )
        })}
      </div>

      <section id="how-it-works" className="text-center py-16">
        <h2 className="text-2xl font-bold mb-10">How It Works</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6 px-6">
          {['Register', 'Add Property', 'Schedule Inspection', 'Get Report'].map((t, i) => (
            <div key={i} className="bg-white/70 backdrop-blur p-6 rounded-xl shadow">
              <div className="text-[#6D28D9] font-bold mb-2">{i + 1}</div>
              <p className="font-medium">{t}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="roles" className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 px-6 pb-16">
        <div className="bg-white/80 p-6 rounded-2xl shadow">
          <h3 className="font-bold mb-4">For property owners</h3>
          <ul className="space-y-2">
            <li className="flex gap-2"><CheckCircle2 className="text-[#6D28D9]" /> Manage properties</li>
            <li className="flex gap-2"><CheckCircle2 className="text-[#6D28D9]" /> Schedule inspections</li>
            <li className="flex gap-2"><CheckCircle2 className="text-[#6D28D9]" /> View reports</li>
          </ul>
        </div>
        <div className="bg-white/80 p-6 rounded-2xl shadow">
          <h3 className="font-bold mb-4">For inspectors</h3>
          <ul className="space-y-2">
            <li className="flex gap-2"><CheckCircle2 className="text-[#6D28D9]" /> Get jobs</li>
            <li className="flex gap-2"><CheckCircle2 className="text-[#6D28D9]" /> Upload evidence</li>
            <li className="flex gap-2"><CheckCircle2 className="text-[#6D28D9]" /> Submit reports</li>
          </ul>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-white/85 border border-violet-100 rounded-3xl p-6 md:p-8 shadow">
          <h2 className="text-2xl font-bold text-center mb-8">What HomeGuard includes</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-slate-200 p-5 bg-white">
              <h3 className="font-semibold text-slate-900 mb-2">Scheduling & assignment</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-700 mt-0.5" /> Owner can schedule inspection jobs</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-700 mt-0.5" /> Admin assigns/reassigns inspectors</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-700 mt-0.5" /> Job status visible in real time</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5 bg-white">
              <h3 className="font-semibold text-slate-900 mb-2">Inspections & evidence</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-700 mt-0.5" /> Inspectors follow package checklist</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-700 mt-0.5" /> Photo/video evidence upload support</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-700 mt-0.5" /> Completed inspection details for owners</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 p-5 bg-white">
              <h3 className="font-semibold text-slate-900 mb-2">Payments & feedback</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-700 mt-0.5" /> Manual payment with admin verification</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-700 mt-0.5" /> Assignment allowed after payment verification</li>
                <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-violet-700 mt-0.5" /> Owner ratings for inspector performance</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="feedback" className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">What users say</h2>
          <p className="text-slate-600 mt-2">Trusted by owners and inspectors for day-to-day operations.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {(publicFeedback.length > 0
            ? publicFeedback.map((item) => ({
                name: item.name,
                text: item.comment,
                rating: item.rating,
              }))
            : feedbackLoading
              ? [{ name: 'Loading...', text: 'Fetching recent feedback...', rating: 5 }]
              : [
                  {
                    name: 'Aisha',
                    text: 'Very smooth workflow. I can track schedule, payment, and inspection updates in one place.',
                    rating: 5,
                  },
                  {
                    name: 'Rahul',
                    text: 'Checklist and evidence upload are simple. Job details are clear before I start work.',
                    rating: 5,
                  },
                  {
                    name: 'Naveen',
                    text: 'Reports are detailed and easy to understand. It helped me resolve issues quickly.',
                    rating: 5,
                  },
                ]
          ).map((item, idx) => (
            <div key={idx} className="bg-white/90 border border-white rounded-2xl p-6 shadow">
              <div className="flex items-center gap-1 text-amber-500 mb-3">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} className={`w-4 h-4 ${n <= Number(item.rating || 0) ? 'fill-current' : ''}`} />
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{item.text}</p>
              <p className="mt-4 text-sm font-semibold text-violet-700">{item.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Who can create inspections?',
              a: 'Only assigned inspectors can start and update inspections, while owners can track progress.',
            },
            {
              q: 'When is payment required?',
              a: 'Payment is submitted after schedule creation and must be verified before admin assigns an inspector.',
            },
            {
              q: 'Can owners view package details before booking?',
              a: 'Yes. Owners can view package name, price, description, and checklist coverage from dashboard sections.',
            },
          ].map((faq) => (
            <details key={faq.q} className="group bg-white border border-slate-200 rounded-2xl p-5">
              <summary className="cursor-pointer list-none font-semibold text-slate-900 flex items-center justify-between">
                {faq.q}
                <span className="text-violet-700 group-open:rotate-45 transition">+</span>
              </summary>
              <p className="text-sm text-slate-600 mt-3">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="border-t border-violet-100/80 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link to="/" className="inline-flex items-center gap-3">
                <img src="/logo.svg" alt="HomeGuard" width={40} height={40} className="h-10 w-10 rounded-xl" />
                <span className="font-bold text-lg text-slate-900">HomeGuard</span>
              </Link>
              <p className="mt-4 text-sm text-slate-600 max-w-md">
                HomeGuard helps owners, inspectors, and admins manage the complete inspection workflow with clear status, evidence, and reports.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Quick links</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#features" className="hover:text-violet-700">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-violet-700">How it works</a></li>
                <li><a href="#feedback" className="hover:text-violet-700">Feedback</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Get started</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/register/owner" className="hover:text-violet-700">Register as owner</Link></li>
                <li><Link to="/register/inspector" className="hover:text-violet-700">Register as inspector</Link></li>
                <li><Link to="/login" className="hover:text-violet-700">Log in</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} HomeGuard. All rights reserved.</p>
            <p>Built for safer property inspections.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
