import { Link } from 'react-router-dom'
import { Shield, Calendar, FileText, CheckCircle2 } from 'lucide-react'

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EEE7FF] via-[#F8F5FF] to-[#EDE9FE] text-[#2D1B69]">

      {/* Header */}
      <header className="max-w-6xl mx-auto flex justify-between items-center px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#E9D5FF] rounded-xl flex items-center justify-center">
            <Shield className="text-[#6D28D9]" />
          </div>
          <span className="font-bold text-lg">HomeGuard</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="text-sm">Log in</Link>
          <Link className="bg-[#6D28D9] text-white px-4 py-2 rounded-lg text-sm">Register</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 items-center gap-12 py-16">
  
  {/* LEFT */}
  <div>
    <p className="text-[#7C3AED] font-semibold mb-3">
      Property inspection platform
    </p>

    <h1 className="text-5xl font-bold leading-tight mb-6">
      Secure property <br />
      inspections, simplified
    </h1>

    <p className="text-slate-600 mb-8">
      Schedule inspections, track reports, and protect your investment.
    </p>

    <div className="flex flex-wrap gap-3">
      <button className="bg-[#6D28D9] text-white px-6 py-3 rounded-xl shadow">
        Register as owner
      </button>
      <button className="bg-white px-6 py-3 rounded-xl shadow">
        Register as inspector
      </button>
      <button className="bg-white px-6 py-3 rounded-xl shadow">
        Log in
      </button>
    </div>
  </div>

  {/* RIGHT IMAGE */}
  <div className="flex justify-center relative">
    <img
      src="/hero.png"
      alt="inspection"
      className="w-full max-w-lg object-contain drop-shadow-2xl"
    />
  </div>

</section>

      {/* Feature Cards */}
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6 px-6 mt-6">
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

      {/* How it works */}
      <section className="text-center py-16">
        <h2 className="text-2xl font-bold mb-10">How It Works</h2>
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-6 px-6">
          {['Register','Add Property','Schedule Inspection','Get Report'].map((t,i)=>(
            <div key={i} className="bg-white/70 backdrop-blur p-6 rounded-xl shadow">
              <div className="text-[#6D28D9] font-bold mb-2">{i+1}</div>
              <p className="font-medium">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Built for both */}
      <section className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 px-6 pb-16">
        <div className="bg-white/80 p-6 rounded-2xl shadow">
          <h3 className="font-bold mb-4">For property owners</h3>
          <ul className="space-y-2">
            <li className="flex gap-2"><CheckCircle2 className="text-[#6D28D9]"/> Manage properties</li>
            <li className="flex gap-2"><CheckCircle2 className="text-[#6D28D9]"/> Schedule inspections</li>
            <li className="flex gap-2"><CheckCircle2 className="text-[#6D28D9]"/> View reports</li>
          </ul>
        </div>
        <div className="bg-white/80 p-6 rounded-2xl shadow">
          <h3 className="font-bold mb-4">For inspectors</h3>
          <ul className="space-y-2">
            <li className="flex gap-2"><CheckCircle2 className="text-[#6D28D9]"/> Get jobs</li>
            <li className="flex gap-2"><CheckCircle2 className="text-[#6D28D9]"/> Upload evidence</li>
            <li className="flex gap-2"><CheckCircle2 className="text-[#6D28D9]"/> Submit reports</li>
          </ul>
        </div>
      </section>

      {/* Testimonials */}
      <section className="text-center py-16 bg-gradient-to-b from-transparent to-[#EDE9FE]">
        <h2 className="text-2xl font-bold mb-10">What our users say</h2>
        <div className="flex justify-center gap-6 flex-wrap">
          {["Good thing","Very smooth experience","Excellent support"].map((t,i)=>(
            <div key={i} className="bg-white p-6 rounded-2xl shadow w-72">
              <div className="w-16 h-16 rounded-full bg-[#EDE9FE] mx-auto mb-4" />
              <p className="font-semibold mb-1">{t}</p>
              <span className="text-xs text-gray-500">AISHA</span>
            </div>
          ))}
        </div>
      </section>

    </div>
  )
}

export default LandingPage
