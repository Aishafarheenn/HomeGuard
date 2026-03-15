import React, { useEffect, useState, useCallback } from 'react'
import { Plus, X, Package, Loader2 } from 'lucide-react'
import CreateServiceitemModal from './CreateServiceitemModal'
import { serviceItems } from '../../services/requests/ServiceItems'

function ServiceItems() {
  const [modalOpen, setModalOpen] = useState(false)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewPackage, setViewPackage] = useState(null)

  const fetchPackage = useCallback(async () => {
    setLoading(true)
    try {
      const response = await serviceItems.getPackage()
      const packageData = response ?? []
      setPackages(Array.isArray(packageData) ? packageData : [])
    } catch (err) {
      console.error('Failed to load packages:', err?.response?.data ?? err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPackage()
  }, [fetchPackage])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Services</h1>
          <p className="text-slate-500 text-sm mt-1">Inspection packages — Basic and Deep Check options</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Create package
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">All packages</h2>
              <p className="text-slate-500 text-sm mt-0.5">{packages.length} {packages.length === 1 ? 'package' : 'packages'}</p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
            <p className="text-sm font-medium">Loading packages…</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <span className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-slate-400" />
            </span>
            <p className="font-semibold text-slate-700">No packages yet</p>
            <p className="text-sm mt-1 text-slate-500">Create a package to offer Basic or Deep Check inspections.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Description</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6 w-28 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((row) => (
                  <tr key={row.id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">{row.name}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm max-w-md">{row.description}</td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-violet-700">₹{Number(row.price ?? 0).toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setViewPackage(row)}
                        className="inline-flex items-center px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateServiceitemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchPackage}
      />

      {viewPackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setViewPackage(null)}
            aria-hidden
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-900">Package details</h2>
              <button
                type="button"
                onClick={() => setViewPackage(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-violet-50/50 border border-violet-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</span>
                <p className="font-semibold text-slate-900 mt-1">{viewPackage.name}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</span>
                <p className="text-slate-700 text-sm mt-1">{viewPackage.description || '—'}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Price</span>
                <p className="font-semibold text-violet-700 mt-1">₹{Number(viewPackage.price ?? 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="px-6 pb-6">
              <button
                type="button"
                onClick={() => setViewPackage(null)}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ServiceItems
