import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2, User, Sparkles } from 'lucide-react'
import api from '../utils/api'
import useAuthStore from '../hooks/useAuthStore'

export default function AIAssistantPage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0]}! I'm Maya, your AI clinic assistant. 👋\n\nI can help you with:\n• Appointment booking guidance\n• Symptom information\n• Clinic timings & doctor availability\n• General health questions\n\nHow can I assist you today?`
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
      const res = await api.post('/ai/chat', { message: userMsg, conversationHistory: history })
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I'm temporarily unavailable. Please check that your OpenAI API key is configured. Error: ${err.message}`
      }])
    } finally {
      setLoading(false)
    }
  }

  const suggestions = ['What are the clinic timings?', 'How do I book an appointment?', 'What should I do for a headache?', 'Tell me about available doctors']

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-130px)]">
      {/* Header */}
      <div className="card mb-4 flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-sm">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-display font-bold text-slate-800 text-lg">Maya — AI Receptionist</h2>
          <div className="flex items-center gap-1.5 text-sm text-emerald-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Online
          </div>
        </div>
        <div className="ml-auto">
          <span className="badge-blue flex items-center gap-1"><Sparkles className="w-3 h-3" />Powered by GPT-4</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line
              ${msg.role === 'user'
                ? 'bg-primary-600 text-white rounded-br-sm'
                : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-sm'
              }`}>
              {msg.content}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center shrink-0 mt-1 font-bold text-white text-xs">
                {user?.name?.charAt(0)}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 rounded-bl-sm">
              <div className="flex gap-1">
                {[0,1,2].map(i => <div key={i} className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{animationDelay:`${i*0.15}s`}} />)}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && (
        <div className="flex flex-wrap gap-2 my-3">
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => setInput(s)}
              className="text-xs px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-full hover:bg-slate-50 hover:border-primary-300 transition-all">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          className="input flex-1"
          placeholder="Type your message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-primary px-4">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}
