import React, { useEffect, useState, useCallback } from 'react'
import { Users, Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { ownerServices } from '../../services/requests/ownerServices'
import CreateOwnerModal from './CreateOwnerModal'
import EditOwnerModal from './EditOwnerModal'

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
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" /> Create owner
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">All owners</h2>
              <p className="text-slate-500 text-sm mt-0.5">{owners.length} registered {owners.length === 1 ? 'owner' : 'owners'}</p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
            <p className="text-sm font-medium">Loading owners…</p>
          </div>
        ) : owners.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <span className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-slate-400" />
            </span>
            <p className="font-semibold text-slate-700">No owners yet</p>
            <p className="text-sm mt-1 text-slate-500">Create an owner to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Phone</th>
                  <th className="py-4 px-6">Country</th>
                  <th className="py-4 px-6 w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {owners.map((row) => (
                  <tr key={row.id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">{row.full_name}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{row.email}</td>
                    <td className="py-4 px-6 text-slate-600">{row.phone || '—'}</td>
                    <td className="py-4 px-6 text-slate-600">{row.country}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditOwnerId(row.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
                        >
                          <Edit className="w-4 h-4" /> Edit
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
