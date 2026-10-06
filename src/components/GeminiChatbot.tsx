import React, { useState, useRef, useEffect } from 'react';
import { useBloodchain } from '../context/BloodchainContext';
import { 
  Bot, 
  Send, 
  Search, 
  MapPin, 
  Zap, 
  Sparkles, 
  ExternalLink, 
  RotateCcw, 
  User, 
  AlertCircle,
  HelpCircle,
  Stethoscope,
  Compass
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  searchSources?: { title?: string; uri?: string }[];
  mapSources?: { title?: string; uri?: string; address?: string }[];
}

export const GeminiChatbot: React.FC = () => {
  const { activeRole, units, requests } = useBloodchain();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am the Bloodchain Intelligence Assistant. How can I assist you with blood donation eligibility, cold-chain monitoring, transfusion compatibility, or live blood drive locations?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.5-flash'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'general' | 'fast' | 'complex' | 'search' | 'maps'>('search');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: 51.5074,
    longitude: -0.1278
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-detect geolocation if available for Google Maps grounding
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        _err => {
          // Default to London metro
        }
      );
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      // Role-specific system instruction
      const systemInstruction = `You are Bloodchain Intelligence, the clinical and operations assistant for the National Bloodchain system.
Current Active User Role: ${activeRole}.
Current Network Status: ${units.length} total units registered, ${requests.length} hospital requisitions logged.
Guidelines:
- If asked about blood compatibility, refer strictly to standard ABO/Rh matching (O- is universal RBC donor, AB+ is universal RBC recipient).
- If Search Grounding is enabled, pull up-to-date blood bank research and current recommendations.
- If Maps Grounding is enabled, locate donor centers, hospital blood banks, and transit hubs near the user coordinates (${userLocation.latitude}, ${userLocation.longitude}).
- Be concise, professional, clinically accurate, and formatting with clean bullet points.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          mode,
          userLocation,
          systemInstruction
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server returned an error');
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        searchSources: data.searchSources,
        mapSources: data.mapSources
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${err.message || 'Unable to connect to Gemini API. Please ensure GEMINI_API_KEY is configured.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: 'Conversation history cleared. How can I assist you today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash'
      }
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-red-600 tracking-wider uppercase mb-1">
            <span>Gemini AI Intelligence & Multi-Turn Assistant</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Bloodchain Copilot
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Multi-turn assistant equipped with Google Search Grounding, Google Maps Grounding, and specialized reasoning models.
          </p>
        </div>

        <button
          onClick={handleClearHistory}
          className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-slate-50 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Thread</span>
        </button>
      </div>

      {/* Mode / Capability Selector Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-bold text-slate-700 whitespace-nowrap hidden sm:inline mr-2">
            Active Mode:
          </span>

          <div className="flex items-center gap-2">
            {/* Google Search Grounding */}
            <button
              onClick={() => setMode('search')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                mode === 'search'
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search Grounding (gemini-3.5-flash)</span>
            </button>

            {/* Google Maps Grounding */}
            <button
              onClick={() => setMode('maps')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                mode === 'maps'
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Maps Grounding (gemini-3.5-flash)</span>
            </button>

            {/* Fast Mode */}
            <button
              onClick={() => setMode('fast')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                mode === 'fast'
                  ? 'bg-amber-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Fast Concierge (gemini-3.1-flash-lite)</span>
            </button>

            {/* Complex Mode */}
            <button
              onClick={() => setMode('complex')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                mode === 'complex'
                  ? 'bg-purple-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Clinical Deep Reasoning (gemini-3.1-pro-preview)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-500 font-medium">Quick prompts:</span>
        {[
          { text: 'Where can I donate blood nearby?', targetMode: 'maps' },
          { text: 'What are the current national blood shortage guidelines?', targetMode: 'search' },
          { text: 'Can O- packed red blood cells be transfused into an A+ patient?', targetMode: 'fast' },
          { text: 'What is the massive transfusion protocol for acute trauma?', targetMode: 'complex' }
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => {
              setInputValue(prompt.text);
              setMode(prompt.targetMode as any);
            }}
            className="text-xs bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-2.5 py-1 rounded-full transition-colors"
          >
            {prompt.text}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[520px]">
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white ${
                  msg.role === 'user' ? 'bg-slate-900' : 'bg-red-600'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Model badge and timestamp */}
                <div
                  className={`flex items-center justify-between gap-4 text-[10px] pt-1 border-t ${
                    msg.role === 'user'
                      ? 'border-slate-800 text-slate-400'
                      : 'border-slate-200 text-slate-400'
                  }`}
                >
                  <span className="font-mono">{msg.modelUsed || ''}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Google Search Grounding Sources */}
                {msg.searchSources && msg.searchSources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                      <Search className="w-3 h-3 text-blue-600" />
                      <span>Search Sources:</span>
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.searchSources.map((src, idx) => (
                        <a
                          key={idx}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] bg-white text-blue-700 hover:text-blue-900 px-2 py-0.5 rounded border border-blue-200 truncate max-w-[240px]"
                        >
                          <span className="truncate">{src.title || src.uri}</span>
                          <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Maps Grounding Sources */}
                {msg.mapSources && msg.mapSources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200">
                    <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      <span>Google Maps Locations:</span>
                    </p>
                    <div className="space-y-1">
                      {msg.mapSources.map((place, idx) => (
                        <a
                          key={idx}
                          href={place.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between text-[11px] bg-white hover:bg-emerald-50 text-slate-800 p-2 rounded border border-emerald-200 transition-colors"
                        >
                          <div>
                            <p className="font-semibold text-emerald-900">{place.title}</p>
                            {place.address && <p className="text-[10px] text-slate-500">{place.address}</p>}
                          </div>
                          <ExternalLink className="w-3 h-3 text-emerald-700 shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-500 border border-slate-200 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Thinking with {mode === 'fast' ? 'gemini-3.1-flash-lite' : mode === 'complex' ? 'gemini-3.1-pro-preview' : 'gemini-3.5-flash'}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={
              mode === 'search'
                ? 'Ask with Google Search Grounding...'
                : mode === 'maps'
                ? 'Search donation centers & blood banks with Google Maps Grounding...'
                : mode === 'fast'
                ? 'Fast eligibility question...'
                : 'Ask complex clinical transfusion protocol...'
            }
            className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="px-4 py-2.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
