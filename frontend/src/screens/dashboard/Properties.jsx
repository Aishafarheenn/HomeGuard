import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Loader2, MapPin, User, Inbox } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import CreatePropertyModal from './CreatePropertyModal'
import EditPropertyModal from './EditPropertyModal'
import PropertiesMap from '../../components/PropertiesMap'
import { propertyServices } from '../../services/requests/propertyServices'

function Properties() {
  const { user } = useAuth()
  const isOwner = user?.role === 'owner'
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [properties, setProperties] = useState([])
  const [deletingId, setDeletingId] = useState(null)

  const fetchProperties = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await propertyServices.getProperties()
      setProperties(Array.isArray(data) ? data : [])
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to load properties'
      setError(Array.isArray(detail) ? detail.join(' ') : String(detail))
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property?')) return
    setDeletingId(id)
    try {
      await propertyServices.deleteProperty(id)
      setProperties((prev) => prev.filter((p) => p.id !== id))
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Properties</h1>
          <p className="text-slate-500 text-sm mt-1">
            {isOwner ? 'Manage your properties and create inspection jobs' : 'View all registered properties'}
          </p>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition shadow-sm shadow-violet-500/25 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add property
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">{error}</div>
      )}

      {!loading && properties.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-semibold text-slate-900 text-lg">Map view</h2>
            <p className="text-slate-500 text-sm mt-0.5">Properties with latitude and longitude are shown on the map.</p>
          </div>
          <div className="p-4">
            <PropertiesMap properties={properties} />
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 text-lg">All properties</h2>
              <p className="text-slate-500 text-sm mt-0.5">{properties.length} {properties.length === 1 ? 'property' : 'properties'}</p>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-10 h-10 animate-spin text-violet-500 mb-3" />
            <p className="text-sm font-medium">Loading properties…</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500">
            <span className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Inbox className="w-10 h-10 text-slate-400" />
            </span>
            <p className="font-semibold text-slate-700">No properties yet</p>
            <p className="text-sm mt-1 text-slate-500">{isOwner ? 'Add a property to get started.' : 'No properties registered.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 bg-slate-50">
                  <th className="py-4 px-6">Address</th>
                  <th className="py-4 px-6">Owner</th>
                  <th className="py-4 px-6">Latitude</th>
                  <th className="py-4 px-6">Longitude</th>
                  <th className="py-4 px-6 w-36 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((row) => (
                  <tr key={row.id} className="hover:bg-violet-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <MapPin className="w-4 h-4" />
                        </span>
                        <span className="font-medium text-slate-900">{row.address}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{row.owner?.full_name ?? row.owner_id ?? '—'}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{row.latitude != null ? row.latitude : '—'}</td>
                    <td className="py-4 px-6 text-slate-600 text-sm">{row.longitude != null ? row.longitude : '—'}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditId(row.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
                          title="Edit"
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

      <CreatePropertyModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSuccess={fetchProperties} />
      <EditPropertyModal isOpen={!!editId} onClose={() => setEditId(null)} onSuccess={fetchProperties} propertyId={editId} />
    </div>
  )
}

export default Properties
