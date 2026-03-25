import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { paymentServices } from '../../services/requests/paymentServices'
import { inspectionServices } from '../../services/requests/inspectionServices'
import { endpoint } from '../../services/endpoints'
import { createJobticketApi } from '../../services/requests/CreateJobticket'
import { inspectorServices } from '../../services/requests/inspectorServices'
import { ClipboardList, Loader2, ShieldCheck, X, CreditCard, Lock, UserCheck } from 'lucide-react'

function Payments() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isOwner = user?.role === 'owner'

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const scheduleIdParam = searchParams.get('schedule_id')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [myJobs, setMyJobs] = useState([])
  const [myPayments, setMyPayments] = useState([])
  const [allPayments, setAllPayments] = useState([])

  // Owner submission state
  const eligibleJobs = useMemo(() => {
    if (!Array.isArray(myJobs)) return []
    return myJobs
  }, [myJobs])

  const selectedJob = useMemo(() => {
    if (!scheduleIdParam) return null
    return eligibleJobs.find((j) => String(j.schedule_id) === String(scheduleIdParam)) ?? null
  }, [eligibleJobs, scheduleIdParam])

  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [form, setForm] = useState({
    amount: '',
    method: 'card',
    cardNumber: '',
    cvv: '',
    expMonth: '',
    expYear: '',
    dynamicPassword: '',
    currency: 'INR',
  })

  const [submitting, setSubmitting] = useState(false)

  // Admin verify/reject state
  const [rejectModal, setRejectModal] = useState(null) // {payment}
  const [rejectNotes, setRejectNotes] = useState('')
  const [adminBusy, setAdminBusy] = useState(false)

  // Admin assign-from-payment state
  const [assignModal, setAssignModal] = useState(null) // {payment}
  const [assignInspectors, setAssignInspectors] = useState([])
  const [assignInspectorId, setAssignInspectorId] = useState('')
  const [assignBusy, setAssignBusy] = useState(false)
  const [assignError, setAssignError] = useState('')

  const paymentBadge = (status) => {
    const s = (status ?? '').toLowerCase()
    if (!s || s === 'unpaid') return <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Unpaid</span>
    if (s === 'pending') return <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pending verification</span>
    if (s === 'verified') return <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Verified</span>
    if (s === 'rejected') return <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejected</span>
    return <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">{status}</span>
  }

  const fetchOwnerData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const jobs = await inspectionServices.getMyJobs()
      setMyJobs(Array.isArray(jobs) ? jobs : [])
      const pays = await paymentServices.getMyPayments()
      setMyPayments(Array.isArray(pays) ? pays : [])
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to load payments'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
      setMyJobs([])
      setMyPayments([])
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAdminData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const pays = await paymentServices.getAllPayments()
      setAllPayments(Array.isArray(pays) ? pays : [])
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to load all payments'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
      setAllPayments([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOwner) fetchOwnerData()
    if (isAdmin) fetchAdminData()
  }, [isOwner, isAdmin, fetchOwnerData, fetchAdminData])

  useEffect(() => {
    // Initialize selected schedule when query param exists.
    if (!isOwner) return
    if (scheduleIdParam) {
      setSelectedScheduleId(scheduleIdParam)
      const job = eligibleJobs.find((j) => String(j.schedule_id) === String(scheduleIdParam))
      const suggested = job?.package_price != null ? String(job.package_price) : ''
      setForm((prev) => ({
        ...prev,
        amount: suggested,
      }))
    }
  }, [isOwner, scheduleIdParam, eligibleJobs])

  const resetError = () => setError('')

  const canSubmit = useMemo(() => {
    const amountNum = Number(form.amount)
    const digitsOnly = (s) => String(s ?? '').replace(/\D/g, '')
    const card = digitsOnly(form.cardNumber)
    const cvv = digitsOnly(form.cvv)
    const month = digitsOnly(form.expMonth)
    const year = digitsOnly(form.expYear)
    const passOk = String(form.dynamicPassword ?? '').trim().length >= 4
    return (
      !!selectedScheduleId &&
      Number.isFinite(amountNum) &&
      amountNum > 0 &&
      card.length >= 12 &&
      cvv.length >= 3 &&
      Number(month) >= 1 &&
      Number(month) <= 12 &&
      year.length >= 2 &&
      passOk
    )
  }, [selectedScheduleId, form.amount, form.cardNumber, form.cvv, form.expMonth, form.expYear, form.dynamicPassword])

  const submit = async (e) => {
    e.preventDefault()
    resetError()
    if (!canSubmit) {
      setError('Please select a schedule and enter a valid payment amount.')
      return
    }
    setSubmitting(true)
    try {
      const cardDigits = String(form.cardNumber ?? '').replace(/\D/g, '')
      const last4 = cardDigits.slice(-4)
      await paymentServices.submitPayment({
        schedule_id: selectedScheduleId,
        amount: Number(form.amount),
        currency: form.currency ?? 'INR',
        method: 'card',
        reference_no: last4 ? `CARD-${last4}` : null,
        notes: form.dynamicPassword?.trim() || null,
        proof_file: null,
      })
      await fetchOwnerData()
      setForm((prev) => ({
        ...prev,
        cardNumber: '',
        cvv: '',
        expMonth: '',
        expYear: '',
        dynamicPassword: '',
        reference_no: undefined,
        notes: undefined,
        proof_file: undefined,
      }))
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to submit payment'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setSubmitting(false)
    }
  }

  const cardDigits = String(form.cardNumber ?? '').replace(/\D/g, '')
  const last4 = cardDigits.slice(-4)
  const maskedCardNumber = last4 ? `•••• •••• •••• ${last4}` : '•••• •••• •••• ••••'

  const doVerify = async (payment) => {
    setAdminBusy(true)
    setError('')
    try {
      await paymentServices.verifyPayment(payment.id, {})
      await fetchAdminData()
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to verify payment'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setAdminBusy(false)
    }
  }

  const doReject = async () => {
    if (!rejectModal?.payment) return
    setAdminBusy(true)
    setError('')
    try {
      await paymentServices.rejectPayment(rejectModal.payment.id, { notes: rejectNotes })
      setRejectModal(null)
      setRejectNotes('')
      await fetchAdminData()
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to reject payment'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setAdminBusy(false)
    }
  }

  const openAssign = async (payment) => {
    const mode = payment?.assigned_inspector_name ? 'reassign' : 'assign'
    setAssignModal({ payment, mode })
    setAssignInspectorId('')
    setAssignError('')
    setAssignInspectors([])
    try {
      const res = await inspectorServices.getInspectors().catch(() => [])
      const list = Array.isArray(res) ? res : []
      setAssignInspectors(list.filter((i) => (i.status ?? '').toLowerCase() === 'approved'))
    } catch {
      setAssignInspectors([])
    }
  }

  const submitAssign = async () => {
    if (!assignModal?.payment) return
    setAssignError('')
    const scheduleId = assignModal.payment.schedule_id
    if (!scheduleId) {
      setAssignError('This payment has no schedule to assign.')
      return
    }
    if (!assignInspectorId) {
      setAssignError('Choose an approved inspector.')
      return
    }
    setAssignBusy(true)
    try {
      await createJobticketApi.createJobticket({
        schedule_id: scheduleId,
        inspector_id: assignInspectorId,
        status: 'assigned',
      })
      await fetchAdminData()
      setAssignModal(null)
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to assign inspector'
      setAssignError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setAssignBusy(false)
    }
  }

  if (loading && (isAdmin || isOwner)) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center min-h-[240px] text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
          <p className="text-sm font-medium">Loading payments…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Payments {isAdmin ? '(admin)' : isOwner ? '(owner)' : ''}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {isAdmin
            ? 'Verify owner payments before inspector assignment.'
            : 'Submit manual payment proof for your scheduled jobs.'}
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {isOwner && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3 mb-1">
              <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                <ClipboardList className="w-6 h-6" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900 text-lg">Submit manual payment</h2>
                <p className="text-slate-500 text-sm">Payment must be verified before admin can assign an inspector.</p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <form onSubmit={submit}>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Schedule</label>
                  <select
                    value={selectedScheduleId}
                    onChange={(e) => {
                      const v = e.target.value
                      setSelectedScheduleId(v)
                      const job = eligibleJobs.find((j) => String(j.schedule_id) === String(v))
                      setForm((prev) => ({
                        ...prev,
                        amount: job?.package_price != null ? String(job.package_price) : prev.amount,
                      }))
                    }}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
                    required
                  >
                    <option value="">Select a schedule</option>
                    {eligibleJobs.map((j) => (
                      <option key={j.schedule_id} value={j.schedule_id}>
                        {j.property_address} - {j.package_name} ({j.payment_status ?? 'unpaid'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                      <h2 className="font-semibold text-slate-900">Card details</h2>
                      <p className="text-sm text-slate-500 mt-0.5">Enter card number, CVV, expiry and dynamic password.</p>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter the 16-digit card number"
                          value={form.cardNumber}
                          onChange={(e) => {
                            const v = e.target.value
                            setForm((p) => ({ ...p, cardNumber: v }))
                          }}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
                          required
                        />
                        {last4 && (
                          <p className="text-xs text-slate-500 mt-2">Card preview: •••• •••• •••• {last4}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-slate-700 mb-2">CVV</label>
                          <input
                            type="password"
                            inputMode="numeric"
                            placeholder="3-4 digits"
                            value={form.cvv}
                            onChange={(e) => setForm((p) => ({ ...p, cvv: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
                            required
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Month</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="MM"
                            value={form.expMonth}
                            onChange={(e) => setForm((p) => ({ ...p, expMonth: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
                            required
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Year</label>
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="YY"
                            value={form.expYear}
                            onChange={(e) => setForm((p) => ({ ...p, expYear: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                          <Lock className="w-4 h-4 text-slate-400" />
                          Dynamic Password
                        </label>
                        <input
                          type="password"
                          inputMode="numeric"
                          placeholder="Enter your dynamic password"
                          value={form.dynamicPassword}
                          onChange={(e) => setForm((p) => ({ ...p, dynamicPassword: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-violet-50/60 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-white/70">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center">
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Company</p>
                            <p className="font-semibold text-slate-900">HomeGuard</p>
                          </div>
                        </div>
                        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {selectedJob?.payment_status ?? 'unpaid'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 space-y-4">
                      <div className="rounded-2xl bg-white border border-slate-100 p-4">
                        <p className="text-xs text-slate-500 uppercase tracking-wide">Card number</p>
                        <p className="mt-1 font-mono text-slate-900 text-sm">{maskedCardNumber}</p>
                        <div className="mt-3 flex items-center justify-between text-sm">
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Expiry</p>
                            <p className="font-medium text-slate-900">
                              {form.expMonth && form.expYear ? `${form.expMonth}/${form.expYear}` : '—'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Dynamic pass</p>
                            <p className="font-medium text-slate-900">{form.dynamicPassword ? '••••••' : '—'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-slate-900 text-white p-5">
                        <p className="text-xs text-white/70 uppercase tracking-wide">You have to Pay</p>
                        <p className="mt-2 text-3xl font-bold">
                          ₹{Number(form.amount ?? 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-white/70 mt-2">
                          {selectedJob?.package_name ?? 'Package'} · {selectedJob?.property_address ?? 'Property'}
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || !canSubmit}
                        className="w-full py-3 rounded-xl bg-[#0B5CFF] text-white font-semibold hover:bg-[#0A55E6] disabled:opacity-50 transition"
                      >
                        {submitting ? 'Processing…' : 'Pay Now'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                    onClick={() => {
                      if (scheduleIdParam) navigate(`/dashboard/payments?schedule_id=${scheduleIdParam}`)
                      else navigate('/dashboard/payments')
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </form>

            <div className="border-t border-slate-200/80 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-semibold text-slate-800">Your payment status</p>
              </div>

              {myPayments.length === 0 ? (
                <p className="text-sm text-slate-500">No payments submitted yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                        <th className="py-4 px-6">Schedule</th>
                        <th className="py-4 px-6">Amount</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 w-52 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {myPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-violet-50/30 transition-colors">
                          <td className="py-4 px-6 text-slate-700">
                            <div className="font-medium">{p.property_address ?? '—'}</div>
                            <div className="text-xs text-slate-500">{p.package_name ?? ''}</div>
                          </td>
                          <td className="py-4 px-6 text-slate-700">₹{Number(p.amount ?? 0).toLocaleString()}</td>
                          <td className="py-4 px-6">{paymentBadge(p.status)}</td>
                          <td className="py-4 px-6 text-right">
                            {p.proof_url ? (
                              <a
                                href={`${endpoint.BASE_URL}${p.proof_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-end px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-violet-700 hover:bg-slate-50"
                              >
                                View proof
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400">No proof</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-900 text-lg">Verify owner payments</h2>
            <p className="text-slate-500 text-sm mt-1">Verified payments unlock inspector assignment.</p>
          </div>

          <div className="p-6">
            {allPayments.length === 0 ? (
              <p className="text-sm text-slate-500">No payments yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                      <th className="py-4 px-6">Owner / Property</th>
                      <th className="py-4 px-6">Package</th>
                      <th className="py-4 px-6">Amount</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 w-72 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {allPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-violet-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-800">
                            {p.owner_name ?? 'Owner'} - {p.property_address ?? '—'}
                          </div>
                          <div className="text-xs text-slate-500">
                            Submitted: {p.submitted_at ? new Date(p.submitted_at).toLocaleString() : '—'}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-700">{p.package_name ?? '—'}</td>
                        <td className="py-4 px-6 text-slate-700">₹{Number(p.amount ?? 0).toLocaleString()}</td>
                        <td className="py-4 px-6">{paymentBadge(p.status)}</td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {p.proof_url && (
                              <a
                                href={`${endpoint.BASE_URL}${p.proof_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm font-medium text-violet-700 hover:bg-slate-50"
                              >
                                Proof
                              </a>
                            )}
                            {p.status !== 'verified' && (
                              <>
                                <button
                                  type="button"
                                  disabled={adminBusy || p.status !== 'pending'}
                                  onClick={() => doVerify(p)}
                                  className="px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                                >
                                  Verify
                                </button>
                                <button
                                  type="button"
                                  disabled={adminBusy || p.status !== 'pending'}
                                  onClick={() => {
                                    setRejectModal({ payment: p })
                                    setRejectNotes('')
                                  }}
                                  className="px-3 py-2 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {p.status === 'verified' && (
                              <button
                                type="button"
                                disabled={assignBusy}
                                onClick={() => openAssign(p)}
                                className="px-3 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                              >
                                <UserCheck className="w-4 h-4" />{' '}
                                {p.assigned_inspector_name ? 'Change assign' : 'Assign inspector'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => !adminBusy && setRejectModal(null)} aria-hidden />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Reject payment</h2>
              <button
                type="button"
                onClick={() => !adminBusy && setRejectModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              {rejectModal.payment.property_address ?? '—'} - {rejectModal.payment.package_name ?? ''}
            </p>
            <label className="block text-sm font-medium text-slate-700 mb-2">Rejection notes (optional)</label>
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
            />
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => !adminBusy && setRejectModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                disabled={adminBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doReject}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                disabled={adminBusy}
              >
                {adminBusy ? 'Rejecting…' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {assignModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => !assignBusy && setAssignModal(null)} aria-hidden />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    {assignModal.mode === 'reassign' ? 'Change assigned inspector' : 'Assign inspector'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                    {assignModal.payment.property_address ?? '—'} · {assignModal.payment.package_name ?? '—'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !assignBusy && setAssignModal(null)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {assignError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">{assignError}</div>
              )}

              <div>
                <label htmlFor="assign-inspector-modal" className="block text-sm font-medium text-slate-700 mb-2">
                  Inspector
                </label>
                <select
                  id="assign-inspector-modal"
                  value={assignInspectorId}
                  onChange={(e) => {
                    setAssignError('')
                    setAssignInspectorId(e.target.value)
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 text-sm focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
                  required
                >
                  <option value="">Select an approved inspector</option>
                  {assignInspectors.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.full_name}
                      {i.email ? ` (${i.email})` : ''}
                    </option>
                  ))}
                </select>
                {assignInspectors.length === 0 && (
                  <p className="text-xs text-amber-600 mt-2">
                    No approved inspectors available. Approve inspectors first.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => !assignBusy && setAssignModal(null)}
                  disabled={assignBusy}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitAssign}
                  disabled={assignBusy || !assignInspectorId || assignInspectors.length === 0}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                >
                  {assignBusy ? 'Processing…' : assignModal.mode === 'reassign' ? 'Change assign' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payments

