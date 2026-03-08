import React, { useEffect, useState, useCallback } from 'react'
import { Users, Plus, Edit, Trash2, ClipboardList, FileText, Loader2 } from 'lucide-react'
import { ownerServices } from '../../services/requests/ownerServices'
import CreateOwnerModal from './CreateOwnerModal'
import EditOwnerModal from './EditOwnerModal'

const features = [
  { title: 'View owners', description: 'See all registered property owners.', icon: Users },
  { title: 'Update owner', description: 'Edit existing owner details.', icon: Edit },
  { title: 'Delete owner', description: 'Remove an owner from the system.', icon: Trash2 },
  { title: 'Owner inspections', description: 'View inspections assigned to owners.', icon: ClipboardList },
  { title: 'Owner reports', description: 'Access inspection reports of owners.', icon: FileText },
]

function Owners() {
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editOwnerId, setEditOwnerId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const fetchOwners = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await ownerServices.getOwners()
      setOwners(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Failed to load owners')
      setOwners([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOwners()
  }, [fetchOwners])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this owner?')) return
    setDeletingId(id)
    try {
      await ownerServices.deleteOwner(id)
      setOwners((prev) => prev.filter((o) => o.id !== id))
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Delete failed'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Owners</h1>
          <p className="text-slate-500 text-sm mt-1">Manage property owners and their details</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition shadow-sm shadow-violet-500/25 shrink-0"
        >
          <Plus className="w-4 h-4" /> Create owner
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.title}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-violet-100 transition"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5" />
              </div>
              <h2 className="font-semibold text-slate-900 mb-1">{item.title}</h2>
              <p className="text-slate-500 text-sm mb-4">{item.description}</p>
              <button className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-violet-50 hover:border-violet-200 transition">
                Open
              </button>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900">All owners</h2>
              <p className="text-slate-500 text-sm mt-0.5">{owners.length} registered {owners.length === 1 ? 'owner' : 'owners'}</p>
            </div>
          </div>
        </div>
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
            <p className="text-sm font-medium">Loading owners…</p>
          </div>
        )}
        {error && !loading && (
          <div className="p-6 rounded-xl mx-4 mt-4 bg-red-50 border border-red-100 text-red-700 text-sm">{error}</div>
        )}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/70">
                  <th className="py-3.5 px-6 font-medium">Name</th>
                  <th className="py-3.5 px-6 font-medium">Email</th>
                  <th className="py-3.5 px-6 font-medium">Phone</th>
                  <th className="py-3.5 px-6 font-medium">Country</th>
                  <th className="py-3.5 px-6 font-medium w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((row) => (
                  <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-slate-900">{row.full_name}</td>
                    <td className="py-3.5 px-6 text-slate-600">{row.email}</td>
                    <td className="py-3.5 px-6 text-slate-600">{row.phone}</td>
                    <td className="py-3.5 px-6 text-slate-600">{row.country}</td>
                    <td className="py-3.5 px-6">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditOwnerId(row.id)}
                          className="inline-flex items-center px-3 py-2 rounded-xl bg-violet-50 text-violet-700 text-sm font-medium hover:bg-violet-100 transition"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(row.id)}
                          disabled={deletingId === row.id}
                          className="p-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50 transition"
                          title="Delete"
                        >
                          {deletingId === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateOwnerModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false)
          fetchOwners()
        }}
      />
      <EditOwnerModal
        isOpen={!!editOwnerId}
        onClose={() => setEditOwnerId(null)}
        onSuccess={() => {
          setEditOwnerId(null)
          fetchOwners()
        }}
        ownerId={editOwnerId}
      />
    </div>
  )
}

export default Owners
