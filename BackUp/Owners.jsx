import React, { useState, useEffect } from 'react'
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react'
import CreateOwnerModal from './CreateOwnerModal'
import EditOwnerModal from './EditOwnerModal'
import { ownerServices } from '../../services/requests/ownerServices'

function Owners() {
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [owners, setOwners] = useState([])
  const [deletingId, setDeletingId] = useState(null)

  const fetchOwners = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await ownerServices.getOwners()
      setOwners(Array.isArray(data) ? data : [])
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to load owners'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
      setOwners([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOwners()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this owner? This may affect linked properties.')) return
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
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Owners</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage property owners and their details</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A78BFA] text-white font-medium hover:bg-[#9333EA] transition shadow-sm shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Add owner
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-[#1F2937]">All owners</h2>
          <p className="text-slate-500 text-sm mt-0.5">Registered property owners</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-6 font-medium">Name</th>
                  <th className="py-3 px-6 font-medium">Email</th>
                  <th className="py-3 px-6 font-medium">Phone</th>
                  <th className="py-3 px-6 font-medium">Country</th>
                  <th className="py-3 px-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {owners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 px-6 text-center text-slate-500">
                      No owners yet. Add an owner to get started.
                    </td>
                  </tr>
                ) : (
                  owners.map((row) => (
                    <tr key={row.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="py-3 px-6 font-medium text-[#1F2937]">{row.full_name}</td>
                      <td className="py-3 px-6 text-slate-600">{row.email}</td>
                      <td className="py-3 px-6 text-slate-600">{row.phone || '—'}</td>
                      <td className="py-3 px-6 text-slate-600">{row.country}</td>
                      <td className="py-3 px-6">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditId(row.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#7C3AED]"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(row.id)}
                            disabled={deletingId === row.id}
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateOwnerModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onSuccess={fetchOwners} />
      <EditOwnerModal isOpen={!!editId} onClose={() => setEditId(null)} onSuccess={fetchOwners} ownerId={editId} />
    </div>
  )
}

export default Owners
