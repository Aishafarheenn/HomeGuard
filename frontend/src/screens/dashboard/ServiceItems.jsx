import React, { useEffect, useState, useCallback } from 'react'
import { Plus, X, Package, Loader2, ClipboardList, Trash2, Pencil } from 'lucide-react'
import CreateServiceitemModal from './CreateServiceitemModal'
import { serviceItems } from '../../services/requests/ServiceItems'
import { inspectionServices } from '../../services/requests/inspectionServices'

function ServiceItems() {
  const [modalOpen, setModalOpen] = useState(false)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [viewPackage, setViewPackage] = useState(null)
  const [checklistPackage, setChecklistPackage] = useState(null)
  const [checklistItems, setChecklistItems] = useState([])
  const [checklistLoading, setChecklistLoading] = useState(false)
  const [checklistError, setChecklistError] = useState('')
  const [newAreaName, setNewAreaName] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState('')
  const [deleteId, setDeleteId] = useState(null)

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

  const loadChecklistItems = useCallback(async (packageId) => {
    if (!packageId) return
    setChecklistLoading(true)
    setChecklistError('')
    try {
      const data = await inspectionServices.getChecklistItemsByPackage(packageId)
      setChecklistItems(Array.isArray(data) ? data : [])
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to load checklist'
      setChecklistError(Array.isArray(detail) ? detail.join(' ') : String(detail))
      setChecklistItems([])
    } finally {
      setChecklistLoading(false)
    }
  }, [])

  useEffect(() => {
    if (checklistPackage?.id) {
      loadChecklistItems(checklistPackage.id)
      setNewAreaName('')
      setEditingId(null)
      setEditDraft('')
    } else {
      setChecklistItems([])
    }
  }, [checklistPackage, loadChecklistItems])

  const handleAddChecklistItem = async (e) => {
    e.preventDefault()
    if (!checklistPackage?.id || !newAreaName.trim()) return
    setAddLoading(true)
    setChecklistError('')
    try {
      await inspectionServices.createChecklistItem({
        package_id: checklistPackage.id,
        area_name: newAreaName.trim(),
      })
      setNewAreaName('')
      await loadChecklistItems(checklistPackage.id)
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to add item'
      setChecklistError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setAddLoading(false)
    }
  }

  const handleSaveEdit = async (id) => {
    const name = editDraft.trim()
    if (!name) return
    setChecklistError('')
    try {
      await inspectionServices.updateChecklistItem(id, { area_name: name })
      setEditingId(null)
      await loadChecklistItems(checklistPackage.id)
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Failed to update'
      setChecklistError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    }
  }

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this checklist area? It must not be used in any inspection yet.')) return
    setDeleteId(id)
    setChecklistError('')
    try {
      await inspectionServices.deleteChecklistItem(id)
      await loadChecklistItems(checklistPackage.id)
    } catch (err) {
      const detail = err.response?.data?.detail ?? err.message ?? 'Delete failed'
      setChecklistError(Array.isArray(detail) ? detail.join(' ') : String(detail))
    } finally {
      setDeleteId(null)
    }
  }

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
                  <th className="py-4 px-6 w-52 text-right">Actions</th>
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
                      <div className="flex items-center justify-end gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setViewPackage(row)}
                          className="inline-flex items-center px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setChecklistPackage(row)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition"
                        >
                          <ClipboardList className="w-4 h-4" />
                          Checklist
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

      <CreateServiceitemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchPackage}
      />

      {checklistPackage && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setChecklistPackage(null)}
            aria-hidden
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900 truncate">Package checklist</h2>
                  <p className="text-sm text-slate-500 truncate">{checklistPackage.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChecklistPackage(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
              <p className="text-sm text-slate-600">
                Inspectors see these areas when they complete a job for this package. Add at least one area for a meaningful checklist.
              </p>
              {checklistError && (
                <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 px-4 py-3 text-sm">{checklistError}</div>
              )}
              <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                <input
                  type="text"
                  value={newAreaName}
                  onChange={(e) => setNewAreaName(e.target.value)}
                  placeholder="e.g. Kitchen, Roof, Electrical"
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
                />
                <button
                  type="submit"
                  disabled={addLoading || !newAreaName.trim()}
                  className="px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 shrink-0"
                >
                  {addLoading ? '…' : 'Add'}
                </button>
              </form>
              {checklistLoading ? (
                <div className="flex items-center justify-center py-8 text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
                </div>
              ) : checklistItems.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center border border-dashed border-slate-200 rounded-xl">
                  No checklist areas yet. Add items above.
                </p>
              ) : (
                <ul className="space-y-2">
                  {checklistItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50/80"
                    >
                      {editingId === item.id ? (
                        <>
                          <input
                            type="text"
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-slate-200 text-sm"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            disabled={!editDraft.trim()}
                            className="px-3 py-2 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null)
                              setEditDraft('')
                            }}
                            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm font-medium text-slate-900">{item.area_name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item.id)
                              setEditDraft(item.area_name)
                            }}
                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-violet-700"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            disabled={deleteId === item.id}
                            className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="px-6 pb-6 shrink-0 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setChecklistPackage(null)}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {viewPackage && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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
