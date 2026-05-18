import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Calendar, Clock, Bot, Loader2, Plus, X, ChevronRight } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { format, addDays } from 'date-fns'

export default function BookAppointmentPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [symptoms, setSymptoms] = useState([])
  const [symptomInput, setSymptomInput] = useState('')
  const [notes, setNotes] = useState('')
  const [type, setType] = useState('consultation')
  const [loading, setLoading] = useState(false)
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [slotsLoading, setSlotsLoading] = useState(false)

  useEffect(() => {
    api.get('/doctors').then(r => setDoctors(r.data.doctors || []))
  }, [])

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setSlotsLoading(true)
      api.get(`/appointments/available-slots/${selectedDoctor._id}?date=${selectedDate}`)
        .then(r => setAvailableSlots(r.data.available || []))
        .catch(console.error)
        .finally(() => setSlotsLoading(false))
    }
  }, [selectedDoctor, selectedDate])

  const addSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()])
      setSymptomInput('')
    }
  }

  const checkSymptoms = async () => {
    if (symptoms.length === 0) return toast.error('Add at least one symptom')
    setAiLoading(true)
    try {
      const res = await api.post('/ai/symptom-check', { symptoms })
      setAiResult(res.data.result)
      toast.success('AI analysis complete!')
    } catch (err) {
      toast.error('AI unavailable: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot)
      return toast.error('Please complete all required fields')
    setLoading(true)
    try {
      await api.post('/appointments', {
        doctorId: selectedDoctor._id,
        date: selectedDate,
        timeSlot: selectedSlot,
        type, symptoms, notes,
      })
      toast.success('Appointment booked successfully! 🎉')
      navigate('/appointments')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const urgencyColor = { low:'text-emerald-600 bg-emerald-50', medium:'text-amber-600 bg-amber-50', high:'text-orange-600 bg-orange-50', critical:'text-red-600 bg-red-50' }

  // Generate next 7 dates
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i + 1)
    return { value: format(d, 'yyyy-MM-dd'), label: format(d, 'EEE, MMM d') }
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-display font-bold text-slate-800">Book Appointment</h2>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          {[1,2,3].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${step === s ? 'bg-primary-600 text-white' : step > s ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {step > s ? '✓' : s}
              </div>
              {s < 3 && <div className={`w-8 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1 — Symptoms & AI */}
      {step === 1 && (
        <div className="card space-y-5">
          <h3 className="font-display font-bold text-slate-800 text-lg">Step 1: Describe Your Symptoms</h3>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Appointment Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['consultation','follow-up','checkup','emergency'].map(t => (
                <button key={t} onClick={() => setType(t)}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all capitalize
                    ${type === t ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Symptoms</label>
            <div className="flex gap-2">
              <input className="input flex-1" placeholder="e.g. headache, fever..." value={symptomInput}
                onChange={e => setSymptomInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSymptom()} />
              <button onClick={addSymptom} className="btn-secondary px-3"><Plus className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {symptoms.map((s, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-primary-50 text-primary-700 text-sm px-3 py-1 rounded-full">
                  {s}
                  <button onClick={() => setSymptoms(symptoms.filter((_, j) => j !== i))}><X className="w-3.5 h-3.5" /></button>
                </span>
              ))}
            </div>
          </div>

          {symptoms.length > 0 && (
            <button onClick={checkSymptoms} disabled={aiLoading}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all hover:shadow-md">
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
              {aiLoading ? 'Analyzing...' : 'Analyze with AI'}
            </button>
          )}

          {aiResult && (
            <div className="bg-slate-50 rounded-2xl p-5 space-y-4 border border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary-600" />
                <h4 className="font-semibold text-slate-800">AI Analysis Result</h4>
                <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${urgencyColor[aiResult.urgencyLevel]}`}>
                  {aiResult.urgencyLevel} urgency
                </span>
              </div>
              {aiResult.possibleConditions?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Possible Conditions</p>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.possibleConditions.map((c, i) => <span key={i} className="badge-blue">{c}</span>)}
                  </div>
                </div>
              )}
              {aiResult.recommendedTests?.length > 0 && (
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mb-2">Recommended Tests</p>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.recommendedTests.map((t, i) => <span key={i} className="badge-yellow">{t}</span>)}
                  </div>
                </div>
              )}
              {aiResult.generalAdvice && (
                <p className="text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100">{aiResult.generalAdvice}</p>
              )}
              <p className="text-xs text-slate-400 italic">⚕️ AI suggestions are preliminary. Always consult a doctor.</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Additional Notes</label>
            <textarea className="input resize-none" rows={3} placeholder="Any other information for the doctor..."
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <button onClick={() => setStep(2)} className="btn-primary flex items-center gap-2">
            Next: Choose Doctor <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 2 — Doctor & Date */}
      {step === 2 && (
        <div className="card space-y-5">
          <h3 className="font-display font-bold text-slate-800 text-lg">Step 2: Choose Doctor & Date</h3>

          <div className="space-y-3">
            {doctors.map((doc) => (
              <div key={doc._id} onClick={() => setSelectedDoctor(doc)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all
                  ${selectedDoctor?._id === doc._id ? 'border-primary-500 bg-primary-50' : 'border-slate-100 hover:border-slate-200'}`}>
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-500 rounded-xl flex items-center justify-center font-bold text-white text-lg">
                  {doc.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">Dr. {doc.name}</p>
                  <p className="text-sm text-slate-500">{doc.specialization} · {doc.experience} yrs exp</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800">₹{doc.consultationFee}</p>
                  <p className="text-xs text-slate-400">per visit</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {dates.map(d => (
                <button key={d.value} onClick={() => setSelectedDate(d.value)}
                  className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all
                    ${selectedDate === d.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {selectedDoctor && selectedDate && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Available Time Slots</label>
              {slotsLoading ? (
                <div className="grid grid-cols-4 gap-2">{[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl animate-pulse" />)}</div>
              ) : availableSlots.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">No slots available for this date</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {availableSlots.map(slot => (
                    <button key={slot} onClick={() => setSelectedSlot(slot)}
                      className={`py-2 text-sm rounded-xl border font-medium transition-all
                        ${selectedSlot === slot ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
            <button onClick={() => setStep(3)} disabled={!selectedDoctor || !selectedDate || !selectedSlot} className="btn-primary flex items-center gap-2">
              Review Booking <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Confirm */}
      {step === 3 && (
        <div className="card space-y-5">
          <h3 className="font-display font-bold text-slate-800 text-lg">Step 3: Confirm Appointment</h3>

          <div className="bg-slate-50 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-accent-500 rounded-2xl flex items-center justify-center font-bold text-white text-xl">
                {selectedDoctor?.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-lg">Dr. {selectedDoctor?.name}</p>
                <p className="text-slate-500">{selectedDoctor?.specialization}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white p-3 rounded-xl">
                <p className="text-slate-400 text-xs mb-1">Date</p>
                <p className="font-semibold">{format(new Date(selectedDate), 'EEEE, MMM d, yyyy')}</p>
              </div>
              <div className="bg-white p-3 rounded-xl">
                <p className="text-slate-400 text-xs mb-1">Time</p>
                <p className="font-semibold">{selectedSlot}</p>
              </div>
              <div className="bg-white p-3 rounded-xl">
                <p className="text-slate-400 text-xs mb-1">Type</p>
                <p className="font-semibold capitalize">{type}</p>
              </div>
              <div className="bg-white p-3 rounded-xl">
                <p className="text-slate-400 text-xs mb-1">Fee</p>
                <p className="font-semibold text-primary-600">₹{selectedDoctor?.consultationFee}</p>
              </div>
            </div>
            {symptoms.length > 0 && (
              <div>
                <p className="text-slate-400 text-xs mb-2">Symptoms</p>
                <div className="flex flex-wrap gap-1">
                  {symptoms.map((s, i) => <span key={i} className="badge-yellow">{s}</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Booking...' : 'Confirm Appointment ✓'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
