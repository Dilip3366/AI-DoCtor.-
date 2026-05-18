import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import api from '../utils/api'
import useAuthStore from '../hooks/useAuthStore'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bloodGroup: user?.bloodGroup || '',
    dateOfBirth: user?.dateOfBirth?.split('T')[0] || '',
    consultationFee: user?.consultationFee || '',
    specialization: user?.specialization || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await api.put('/auth/update-profile', form)
      updateUser(res.data.user)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-display font-bold text-slate-800">Profile Settings</h2>

      <div className="card">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl flex items-center justify-center font-bold text-white text-3xl shadow-md">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-slate-800">{user?.name}</h3>
            <p className="text-slate-500 capitalize">{user?.role}</p>
            <p className="text-sm text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Phone', key: 'phone', type: 'tel' },
            ...(user?.role === 'patient' ? [
              { label: 'Date of Birth', key: 'dateOfBirth', type: 'date' },
              { label: 'Blood Group', key: 'bloodGroup', type: 'text', placeholder: 'O+, A-, B+...' },
            ] : []),
            ...(user?.role === 'doctor' ? [
              { label: 'Specialization', key: 'specialization', type: 'text' },
              { label: 'Consultation Fee (₹)', key: 'consultationFee', type: 'number' },
            ] : []),
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
              <input type={type} className="input" placeholder={placeholder}
                value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
        </div>

        <button onClick={handleSave} disabled={loading} className="btn-primary mt-6 flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      <div className="card bg-slate-50 border-slate-100">
        <h4 className="font-semibold text-slate-700 mb-2">Account Info</h4>
        <p className="text-sm text-slate-500">Email: {user?.email}</p>
        <p className="text-sm text-slate-500 capitalize">Role: {user?.role}</p>
        <p className="text-sm text-slate-500">ID: {user?.id}</p>
      </div>
    </div>
  )
}
