import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Sparkles, 
  ShieldCheck, 
  Moon, 
  Sun, 
  BookOpen, 
  Utensils, 
  Heart, 
  MessageCircle, 
  CheckCircle2, 
  SlidersHorizontal,
  Send,
  X,
  Search
} from 'lucide-react';
import { RoommateProfile, UniversityHub, CurrencyCode } from '../types';
import { ROOMMATE_PROFILES } from '../data/mockData';
import { formatPrice } from '../utils/currency';
import { getStoredRoommatePreferences, saveStoredRoommatePreferences } from '../utils/storage';

interface RoommateMatcherProps {
  hub: UniversityHub;
  currency: CurrencyCode;
}

export const RoommateMatcher: React.FC<RoommateMatcherProps> = ({
  hub,
  currency,
}) => {
  const initialPrefs = getStoredRoommatePreferences();
  const [profiles, setProfiles] = useState<RoommateProfile[]>(ROOMMATE_PROFILES);
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>(initialPrefs.gender);
  const [selectedSleep, setSelectedSleep] = useState<'all' | 'early_bird' | 'night_owl'>(initialPrefs.sleepSchedule);
  const [selectedDiet, setSelectedDiet] = useState<'all' | 'veg' | 'non_veg' | 'vegan'>(initialPrefs.diet);
  const [chatModalProfile, setChatModalProfile] = useState<RoommateProfile | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: 'me' | 'them'; text: string; time: string }[]>([
    { sender: 'them', text: "Hey! I saw you're looking for housing near campus for the upcoming term. What's your move-in date?", time: '10:14 AM' }
  ]);
  const [inputText, setInputText] = useState('');

  useEffect(() => {
    saveStoredRoommatePreferences({
      gender: selectedGender,
      sleepSchedule: selectedSleep,
      diet: selectedDiet,
    });
  }, [selectedGender, selectedSleep, selectedDiet]);

  const filteredProfiles = profiles.filter(p => {
    if (selectedGender !== 'all' && p.gender !== selectedGender) return false;
    if (selectedSleep !== 'all' && p.sleepSchedule !== selectedSleep) return false;
    if (selectedDiet !== 'all' && p.dietPreference !== selectedDiet) return false;
    return true;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = { sender: 'me' as const, text: inputText, time: 'Just now' };
    setChatMessages(prev => [...prev, newMsg]);
    setInputText('');

    // Simulate reply after 1.5s
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { 
          sender: 'them', 
          text: "Awesome! Let's schedule a time to view the twin sharing rooms at The Scholar's Nest together!", 
          time: 'Just now' 
        }
      ]);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200 pb-12">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-indigo-300 text-xs font-bold border border-white/10">
            <Users className="w-3.5 h-3.5" />
            <span>AI Roommate Compatibility Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-['Outfit',sans-serif]">
            Find Your Ideal University Roommate
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Match with verified students from your campus based on sleep schedules, study focus, cleanliness habits, and budget.
          </p>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender:</span>
          <div className="flex gap-1">
            {['all', 'female', 'male'].map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGender(g as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedGender === g
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Schedule:</span>
          <div className="flex gap-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'early_bird', label: '🌅 Early Bird' },
              { id: 'night_owl', label: '🌙 Night Owl' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSleep(s.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedSleep === s.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Diet:</span>
          <div className="flex gap-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'veg', label: '🥦 Veg' },
              { id: 'non_veg', label: '🍗 Non-Veg' },
              { id: 'vegan', label: '🌱 Vegan' },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDiet(d.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedDiet === d.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProfiles.map((profile) => (
          <div
            key={profile.id}
            className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 p-5 flex flex-col justify-between space-y-4"
          >
            {/* Top Profile Header */}
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                    {profile.verifiedStudent && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-white">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">
                      {profile.name}, <span className="text-slate-500 font-normal">{profile.age}</span>
                    </h4>
                    <p className="text-xs font-semibold text-indigo-600">{profile.major}</p>
                    <p className="text-[11px] text-slate-400">{profile.university} • {profile.yearOfStudy}</p>
                  </div>
                </div>

                {/* Compatibility Badge */}
                {profile.matchScore && (
                  <div className="text-center bg-indigo-50 border border-indigo-100 rounded-xl p-1.5 px-2.5">
                    <span className="text-[10px] font-bold text-indigo-500 block uppercase">Match</span>
                    <span className="text-xs font-black text-indigo-700">{profile.matchScore}%</span>
                  </div>
                )}
              </div>

              {/* Bio snippet */}
              <p className="text-xs text-slate-600 mt-3 italic line-clamp-2 leading-relaxed">
                "{profile.bio}"
              </p>
            </div>

            {/* Lifestyle Badges Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Sleep Cycle</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  {profile.sleepSchedule === 'early_bird' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-500" />}
                  {profile.sleepSchedule === 'early_bird' ? 'Early Riser' : 'Night Owl'}
                </span>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Study Vibe</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                  <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                  {profile.studyVibe === 'silent' ? 'Silent Study' : 'Casual / Lo-Fi'}
                </span>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Diet</span>
                <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5 capitalize">
                  <Utensils className="w-3.5 h-3.5 text-emerald-500" />
                  {profile.dietPreference.replace('_', ' ')}
                </span>
              </div>

              <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Cleanliness</span>
                <span className="font-bold text-indigo-600 mt-0.5 block">
                  {'★'.repeat(profile.cleanlinessLevel)}{'☆'.repeat(5 - profile.cleanlinessLevel)}
                </span>
              </div>
            </div>

            {/* Hobbies Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.hobbies.map((h, idx) => (
                <span key={idx} className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                  {h}
                </span>
              ))}
            </div>

            {/* Bottom Budget & Chat Button */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Budget Target</span>
                <div className="text-sm font-extrabold text-slate-900">
                  {formatPrice(profile.budgetMonthly, currency)}
                  <span className="text-xs font-normal text-slate-400">/mo</span>
                </div>
              </div>

              <button
                onClick={() => setChatModalProfile(profile)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Simulated Roommate Direct Chat Modal */}
      {chatModalProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px]">
            
            {/* Chat Header */}
            <div className="p-4 bg-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={chatModalProfile.avatarUrl}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
                />
                <div>
                  <h4 className="font-bold text-sm">{chatModalProfile.name}</h4>
                  <p className="text-[11px] text-indigo-200">
                    {chatModalProfile.major} • Verified Student
                  </p>
                </div>
              </div>
              <button
                onClick={() => setChatModalProfile(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
              <div className="text-center">
                <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                  Connected via StayFind Campus Verified Network
                </span>
              </div>

              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${
                      msg.sender === 'me'
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1 ${
                        msg.sender === 'me' ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Send message to ${chatModalProfile.name}...`}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
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
      )}

    </div>
  );
};
