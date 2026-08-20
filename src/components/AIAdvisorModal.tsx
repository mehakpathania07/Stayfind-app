import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Footprints, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  Zap,
  DollarSign
} from 'lucide-react';
import { Property, UniversityHub, CurrencyCode } from '../types';
import { formatPrice } from '../utils/currency';

interface AIAdvisorModalProps {
  onClose: () => void;
  hub: UniversityHub;
  properties: Property[];
  currency: CurrencyCode;
  onSelectProperty: (property: Property) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  suggestedProperties?: Property[];
  timestamp: string;
}

export const AIAdvisorModal: React.FC<AIAdvisorModalProps> = ({
  onClose,
  hub,
  properties,
  currency,
  onSelectProperty,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Hello! I'm your StayFind Campus Living Advisor for ${hub.name}. I can help you find verified PGs within walking distance, evaluate hidden electricity/meal charges, or calculate your true semester budget. How can I assist you today?`,
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const samplePrompts = [
    "Find me a single room under $900 with meals within 10 mins walk",
    "What hidden charges should I watch out for in private PGs?",
    "Which PG has the fastest Wi-Fi for CS/Engineering students?",
    "Explain how TrueCost™ calculates AC electricity usage"
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    // AI smart synthesis based on query keywords
    setTimeout(() => {
      let reply = '';
      let matches: Property[] = [];
      const lower = query.toLowerCase();

      if (lower.includes('single') || lower.includes('under') || lower.includes('budget') || lower.includes('walk')) {
        matches = properties.filter(p => p.commuteOptions[0]?.durationMin <= 10).slice(0, 2);
        reply = `Based on your request, I recommend looking at **${matches[0]?.name || "The Scholar's Nest"}**! It is located only ${matches[0]?.commuteOptions[0]?.durationMin || 6} minutes walk from campus, includes high-speed fiber Wi-Fi, and offers healthy meal plans with zero brokerage.`;
      } else if (lower.includes('hidden') || lower.includes('charges') || lower.includes('fees')) {
        reply = `Here is the essential student checklist for hidden accommodation costs:\n\n1. **Electricity Sub-Meters**: Standard rent often excludes AC units (averaging $30–$50/mo during peak months).\n2. **Security Deposit Lock-in**: StayFind verifies 100% refundable escrow, whereas unverified landlords often deduct arbitrary cleaning fees.\n3. **Meal Caps**: Check if weekend meals and evening tea are included or billed separately.\n4. **Brokerage Fees**: StayFind charges $0 student commission.`;
      } else if (lower.includes('wifi') || lower.includes('engineering') || lower.includes('speed')) {
        matches = properties.filter(p => p.wifiSpeedMbps >= 300).slice(0, 2);
        reply = `For heavy computational and engineering coursework, **${matches[0]?.name || "The Scholar's Nest"}** features dedicated 350+ Mbps dual-band fiber with 100% power backup generators and a soundproof 24/7 study lounge.`;
      } else {
        matches = properties.slice(0, 2);
        reply = `I have analyzed the verified stays around ${hub.name}. Here are the top-rated student accommodations matching verified security standards, transparent meal plans, and low transit times!`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        suggestedProperties: matches.length > 0 ? matches : undefined,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 border border-white/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base">StayFind AI Advisor</h3>
                <span className="text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-sm border border-amber-400/30">
                  Campus Guide
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Context-aware housing insights for {hub.shortName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-xs'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`space-y-2 max-w-[85%] ${m.sender === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-tl-xs whitespace-pre-line text-left'
                  }`}
                >
                  {m.text}
                </div>

                {/* Suggested Property Cards within chat */}
                {m.suggestedProperties && m.suggestedProperties.length > 0 && (
                  <div className="space-y-2 pt-1">
                    {m.suggestedProperties.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onClose();
                          onSelectProperty(p);
                        }}
                        className="bg-white hover:bg-indigo-50/50 rounded-xl p-3 border border-slate-200 shadow-xs transition-colors flex items-center justify-between gap-3 cursor-pointer group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <img src={p.coverImage} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          <div>
                            <h5 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">
                              {p.name}
                            </h5>
                            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                              <Footprints className="w-3 h-3" />
                              <span>{p.commuteOptions[0]?.durationMin}m walk to campus</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-slate-900 block">
                            {formatPrice(Math.min(...p.roomOptions.map(r => r.nominalMonthlyRent)), currency)}/mo
                          </span>
                          <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-0.5 justify-end">
                            View Room <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
              <span>StayFind Advisor is typing...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="p-3 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-none">
          {samplePrompts.map((sp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sp)}
              className="text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-3 py-1.5 rounded-full whitespace-nowrap transition-colors shrink-0"
            >
              {sp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask anything about student stays near ${hub.shortName}...`}
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
          />
          <button
            type="submit"
            className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
