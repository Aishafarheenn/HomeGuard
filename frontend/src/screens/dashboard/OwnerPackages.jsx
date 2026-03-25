import React, { useEffect, useState, useCallback } from 'react'
import { Package, Loader2, ClipboardList } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { inspectionServices } from '../../services/requests/inspectionServices'

function OwnerPackages() {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const [packages, setPackages] = useState([])
  const [checklistsById, setChecklistsById] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!isOwner) return
    setLoading(true)
    setError('')
    try {
      const list = await inspectionServices.getPackages()
      const arr = Array.isArray(list) ? list : []
      setPackages(arr)
      const entries = await Promise.all(
        arr.map(async (p) => {
          try {
            const items = await inspectionServices.getChecklistItemsByPackage(p.id)
            return [p.id, Array.isArray(items) ? items : []]
          } catch {
            return [p.id, []]
          }
        })
      )
      setChecklistsById(Object.fromEntries(entries))
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to load packages'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
      setPackages([])
      setChecklistsById({})
    } finally {
      setLoading(false)
    }
  }, [isOwner])

  useEffect(() => {
    load()
  }, [load])

  if (!isOwner) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Packages</h1>
        <p className="text-slate-500 text-sm">This page is only available to property owners.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inspection packages</h1>
        <p className="text-slate-500 text-sm mt-1">
          Compare what each plan includes before you schedule an inspection on My Jobs.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
          <p className="text-sm font-medium">Loading packages…</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 py-16 text-center text-slate-500 text-sm">
          No inspection packages are available yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {packages.map((p) => {
            const items = checklistsById[p.id] ?? []
            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
              >
                <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white flex items-start gap-3">
                  <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                    <Package className="w-6 h-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-slate-900 text-lg">{p.name}</h2>
                    <p className="text-2xl font-bold text-violet-700 mt-1">
                      ₹{Number(p.price ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-5 flex-1 flex flex-col gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Description</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{p.description}</p>
                  </div>
                  <div className="border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-slate-800 font-medium text-sm mb-2">
                      <ClipboardList className="w-4 h-4 text-violet-600" />
                      What inspectors cover
                    </div>
                    {items.length === 0 ? (
                      <p className="text-sm text-slate-500">Areas will be listed here when configured by admin.</p>
                    ) : (
                      <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
                        {items.map((c) => (
                          <li key={c.id}>{c.area_name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OwnerPackages
