import React, { useEffect, useState, useCallback } from 'react'
import { ClipboardList, Users, FileText, ShieldCheck, Plus, ArrowRight, X, Package, Loader2 } from 'lucide-react'
import CreateServiceitemModal from './CreateServiceitemModal'
import { serviceItems } from '../../services/requests/ServiceItems'

const staticServices = [
  { title: 'Inspection service', description: 'Schedule and manage home safety inspections.', icon: ClipboardList },
  { title: 'Owner management', description: 'Manage property owners and their details.', icon: Users },
  { title: 'Reports & documents', description: 'Access inspection reports and evidence files.', icon: FileText },
  { title: 'Security package', description: 'Complete home protection and monitoring.', icon: ShieldCheck },
]

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
          <p className="text-slate-500 text-sm mt-1">HomeGuard inspection and management services</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition shadow-sm shadow-violet-500/25 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create package
        </button>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {staticServices.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md hover:border-violet-100 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm mb-4">{item.description}</p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-violet-600">
                  View <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">All packages</h2>
              <p className="text-slate-500 text-sm mt-0.5">{packages.length} {packages.length === 1 ? 'package' : 'packages'}</p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
            <p className="text-sm font-medium">Loading packages…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/70">
                  <th className="py-3.5 px-6 font-medium">Name</th>
                  <th className="py-3.5 px-6 font-medium">Description</th>
                  <th className="py-3.5 px-6 font-medium">Price</th>
                  <th className="py-3.5 px-6 font-medium w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {packages.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-900">{row.name}</td>
                    <td className="py-3.5 px-6 text-slate-600">{row.description}</td>
                    <td className="py-3.5 px-6 text-slate-600">{row.price}</td>
                    <td className="py-3.5 px-6">
                      <button
                        type="button"
                        onClick={() => setViewPackage(row)}
                        className="inline-flex items-center px-3 py-2 rounded-xl bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 transition"
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
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
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
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Name</span>
                <p className="font-medium text-slate-900 mt-0.5">{viewPackage.name}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Description</span>
                <p className="text-slate-700 text-sm mt-0.5">{viewPackage.description || '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Price</span>
                <p className="font-medium text-slate-900 mt-0.5">{viewPackage.price ?? '—'}</p>
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
