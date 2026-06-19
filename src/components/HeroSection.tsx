import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Flame, DollarSign, Gift, ArrowRight, Heart, Sparkles, CheckCircle, Copy, Check, X, Share2 } from 'lucide-react';
import { Donation } from '../types';

interface HeroSectionProps {
  totalMoney: number;
  onAddDonation: (name: string, amount: number, message: string) => void;
  eggPrice: number;
}

export default function HeroSection({ totalMoney, onAddDonation, eggPrice }: HeroSectionProps) {
  const [name, setName] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(25);
  const [message, setMessage] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [lastAmount, setLastAmount] = useState(0);

  // Countdown timer logic
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const totalEggs = Math.round(totalMoney / eggPrice);

  // Animated counting numbers state
  const [displayMoney, setDisplayMoney] = useState(totalMoney);
  const [displayEggs, setDisplayEggs] = useState(totalEggs);

  const prevMoneyRef = useRef(totalMoney);
  const prevEggsRef = useRef(totalEggs);

  // Ease-out quad function
  const easeOutQuad = (t: number) => t * (2 - t);

  useEffect(() => {
    const startVal = prevMoneyRef.current;
    const endVal = totalMoney;
    prevMoneyRef.current = totalMoney;

    if (startVal === endVal) return;

    const duration = 1200; // 1.2 seconds
    let startTime: number | null = null;
    let animId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeOutQuad(progress);
      const currentVal = startVal + (endVal - startVal) * easeProgress;
      setDisplayMoney(currentVal);

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setDisplayMoney(endVal);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [totalMoney]);

  useEffect(() => {
    const startVal = prevEggsRef.current;
    const endVal = totalEggs;
    prevEggsRef.current = totalEggs;

    if (startVal === endVal) return;

    const duration = 1.2 * 1000; // 1.2 seconds
    let startTime: number | null = null;
    let animId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = easeOutQuad(progress);
      const currentVal = startVal + (endVal - startVal) * easeProgress;
      setDisplayEggs(Math.round(currentVal));

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      } else {
        setDisplayEggs(endVal);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [totalEggs]);

  // Post-donation share card modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState({
    name: '',
    amount: 0,
    eggCount: 0,
    familiesCount: 0,
    message: ''
  });
  const [copied, setCopied] = useState(false);

  const handleCopyText = async () => {
    const shareText = `I just nourished ${shareData.familiesCount} ${shareData.familiesCount === 1 ? 'family' : 'families'} by contributing RM${shareData.amount} (${shareData.eggCount} fresh eggs) with EggGiver 🥚 Join the mission to nourish lives!`;
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  useEffect(() => {
    // Generate a fixed target date 3 days in the future relative to when the app starts
    // or load from localStorage so it stays coherent during session
    const storedTarget = localStorage.getItem('egg_donation_countdown_target');
    let targetTime = 0;
    
    if (storedTarget) {
      targetTime = parseInt(storedTarget, 10);
      // If the target has passed, renew it for another 3 days
      if (targetTime < Date.now()) {
        const newTarget = Date.now() + 3 * 24 * 60 * 60 * 1000;
        localStorage.setItem('egg_donation_countdown_target', newTarget.toString());
        targetTime = newTarget;
      }
    } else {
      const newTarget = Date.now() + 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000; // 3 days, 4 hours
      localStorage.setItem('egg_donation_countdown_target', newTarget.toString());
      targetTime = newTarget;
    }

    const timer = setInterval(() => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        // Reset countdown for a new event
        const newTarget = Date.now() + 3 * 24 * 60 * 60 * 1000;
        localStorage.setItem('egg_donation_countdown_target', newTarget.toString());
      } else {
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / 1000 / 60) % 60);
        const s = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days: d, hours: h, minutes: m, seconds: s });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const eggGoal = 1000000000; // Goal is 1,000,000,000 eggs
  const goalInMoney = eggGoal * eggPrice; // RM500,000,000
  const progressPercent = Math.min((totalMoney / goalInMoney) * 100, 100);

  const handleDonate = (e: React.FormEvent) => {
    e.preventDefault();
    const donationAmount = selectedAmount !== null ? selectedAmount : parseFloat(customAmount);
    
    if (!donationAmount || donationAmount <= 0) {
      alert('Please enter or select a valid donation amount.');
      return;
    }

    const donorName = name.trim() || 'Anonymous Supporter';
    const donorMessage = message.trim() || 'So happy to buy healthy meals!';

    onAddDonation(donorName, donationAmount, donorMessage);
    
    const calculatedEggs = Math.round(donationAmount / eggPrice);
    const familiesCount = Math.max(1, Math.round(calculatedEggs / 10));

    setLastAmount(donationAmount);
    setShowSuccessToast(true);

    // Setup share data and show share modal after transition delay
    setShareData({
      name: donorName,
      amount: donationAmount,
      eggCount: calculatedEggs,
      familiesCount: familiesCount,
      message: message.trim() ? donorMessage : ''
    });

    setTimeout(() => {
      setShowShareModal(true);
    }, 550);
    
    // Reset form fields
    setName('');
    setCustomAmount('');
    setMessage('');
    setSelectedAmount(25);

    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  };

  const selectPredefined = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomAmount(e.target.value);
    setSelectedAmount(null);
  };

  return (
    <div id="hero-section" className="relative bg-white pt-5 pb-12 md:pb-16 border-b border-slate-100 overflow-hidden">
      {/* Decorative Geometric elements */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-yellow-100/25 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-yellow-50/40 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-0 text-[16px]">
        
        {/* Top Header Alert - Centered */}
        <div className="flex justify-center mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-55 border border-yellow-250/50 rounded-full text-[11px] font-bold text-yellow-800 uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse shrink-0"></span>
            Fresh Farm Egg Distribution Mission #14 is Preparing
          </div>
        </div>

        {/* Hero Title & Description - Centered */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-6">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.08]">
            One Egg, <span className="text-yellow-500">One Smile.</span><br />
            Nourish Lives Together.
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed">
            We collect funding from kind hearts globally to buy fresh, protein-packed 
            eggs directly from micro-farmers, distributing them to local soup kitchens, 
            orphanages, and struggling elderly centers. Every RM1 buys exactly 2 fresh eggs!
          </p>
        </div>

        {/* Live Centered Mega Counter - Centerpiece of the page */}
        <div className="max-w-5xl mx-auto mb-8">
          <div className="bg-slate-50/75 rounded-[36px] p-5 sm:p-8 border border-slate-150 shadow-sm space-y-6 backdrop-blur-xs">
            
            {/* The Huge Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
              {/* Vertical divider line for md+ screens */}
              <div className="hidden md:block absolute left-1/2 top-2 bottom-2 w-px bg-slate-200" />
              
              <div className="text-center space-y-0.5">
                <div className="text-[10px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-widest">Total Funds Contributed</div>
                <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                  RM{displayMoney.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Live collective pool</p>
              </div>

              <div className="text-center space-y-0.5">
                <div className="text-[10px] sm:text-xs text-slate-400 font-extrabold uppercase tracking-widest">Nutritious Eggs Secured</div>
                <div className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-yellow-600 flex items-center justify-center gap-2 leading-tight">
                  <span className="scale-105 filter drop-shadow-sm animate-bounce">🥚</span> {displayEggs.toLocaleString()}
                </div>
                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Direct farm supply rate</p>
              </div>
            </div>

            {/* Giant Progress Bar */}
            <div className="space-y-2.5">
              <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-bold text-slate-700 gap-1.5">
                <span className="bg-white px-3 py-0.5 rounded-full border border-slate-150 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                  🚀 Progress towards 1 Billion Eggs
                </span>
                <span className="font-mono text-yellow-700 bg-yellow-50 px-2.5 py-0.5 rounded-full border border-yellow-101 font-extrabold text-[11px]">
                  {progressPercent.toFixed(4)}% limit achieved
                </span>
              </div>
              
              <div className="w-full h-12 bg-white rounded-2xl p-1.5 shadow-xs border border-slate-200/50 overflow-hidden relative flex items-center">
                <motion.div 
                  id="progress-bar-indicator"
                  className="h-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-xl shadow-xs"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
                
                {/* Visual marker inside progress road */}
                <div className="absolute right-4 text-[10px] text-slate-400 font-mono font-bold tracking-wider">
                  Goal: 1B Eggs
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono font-semibold px-1">
                <span>{displayEggs.toLocaleString()} Eggs Secured</span>
                <span>RM{(1000000000 * eggPrice).toLocaleString()} Needed</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Split Layout - adaptar countdown, highlights, and donation panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Block: Countdown, highlights & impact metrics */}
          <div className="lg:col-span-6 flex flex-col justify-start gap-4 h-full">
            
            {/* Countdown card */}
            <div className="bg-slate-50 rounded-[32px] p-5 border border-slate-150 shadow-xs flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-yellow-100 rounded-2xl border border-yellow-250 text-yellow-600 shrink-0">
                  <Flame className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-900">Bulk Egg Purchase Lockdown</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Structuring fresh supply chains with local farm partners</p>
                </div>
              </div>

              {/* Timer Block */}
              <div id="countdown-timer" className="flex items-center justify-between gap-1 text-center">
                <div className="bg-white rounded-2xl p-2.5 flex-1 border border-slate-150 shadow-sm">
                  <div className="font-mono text-lg sm:text-xl font-black text-slate-900">{String(timeLeft.days).padStart(2, '0')}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Days</div>
                </div>
                <span className="text-slate-300 font-black text-lg px-0.5">:</span>
                <div className="bg-white rounded-2xl p-2.5 flex-1 border border-slate-150 shadow-sm">
                  <div className="font-mono text-lg sm:text-xl font-black text-slate-900">{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Hrs</div>
                </div>
                <span className="text-slate-300 font-black text-lg px-0.5">:</span>
                <div className="bg-white rounded-2xl p-2.5 flex-1 border border-slate-150 shadow-sm">
                  <div className="font-mono text-lg sm:text-xl font-black text-slate-900">{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Min</div>
                </div>
                <span className="text-slate-300 font-black text-lg px-0.5">:</span>
                <div className="bg-white rounded-2xl p-2.5 flex-1 border border-slate-150 shadow-sm">
                  <div className="font-mono text-lg sm:text-xl font-black text-yellow-600">{String(timeLeft.seconds).padStart(2, '0')}</div>
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Sec</div>
                </div>
              </div>
            </div>

            {/* Impact Highlights Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 hover:bg-slate-100 transition-colors rounded-[24px] border border-slate-100 shadow-xs">
                <div className="font-display text-base sm:text-lg font-black text-slate-900">100%</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Organic</div>
              </div>
              <div className="p-3 bg-slate-50 hover:bg-slate-100 transition-colors rounded-[24px] border border-slate-100 shadow-xs">
                <div className="font-display text-base sm:text-lg font-black text-slate-900 font-sans">24</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Micro Farms</div>
              </div>
              <div className="p-3 bg-slate-50 hover:bg-slate-100 transition-colors rounded-[24px] border border-slate-100 shadow-xs">
                <div className="font-display text-base sm:text-lg font-black text-slate-900 font-sans">12.5K+</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">People Fed</div>
              </div>
            </div>

            {/* Confirmed Delivery Schedule Card */}
            <div className="bg-slate-50 rounded-[32px] p-5 border border-slate-150 shadow-xs space-y-3.5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-2xl border border-emerald-150 text-emerald-600 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Confirmed Egg Shipments</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Tracking direct micro-farm shipments routing tomorrow</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-slate-150/50 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                    <span className="text-[11px] font-extrabold text-slate-700">Perak Soup Kitchen</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">1,200 Eggs</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-slate-150/50 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                    <span className="text-[11px] font-extrabold text-slate-700">KL Oasis Orphanage</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-100">800 Eggs</span>
                </div>
                <div className="flex items-center justify-between p-2.5 bg-white rounded-2xl border border-slate-150/50 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-slate-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                    <span className="text-[11px] font-extrabold text-slate-700">Hope Feeding Initiative</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-500 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">1,500 Eggs</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-[24px] border border-yellow-101 shadow-xs flex items-start gap-3">
              <div className="p-2 bg-white text-yellow-600 rounded-xl border border-yellow-200 shrink-0">
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase text-yellow-850 tracking-wider">Mission Integrity Guarded</h4>
                <p className="text-[10.5px] text-yellow-850 leading-relaxed mt-0.5">
                  Sourcing protein-rich products directly from micro-farmers empowers local ecosystems.
                </p>
              </div>
            </div>

          </div>

          {/* Right Block: Secure donation protocol */}
          <div className="lg:col-span-6">
            <div className="bg-slate-50 rounded-[32px] p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-400" />
              
              <div>
                <div className="mb-6">
                  <div className="flex items-center gap-2 text-yellow-600 text-[10px] font-extrabold uppercase tracking-widest mb-1.5">
                    <Gift className="w-4 h-4 shrink-0" /> SECURE DONATION PROTOCOL
                  </div>
                  <h2 className="font-display text-2xl font-black text-slate-900 tracking-tight">
                    Nourish One Family Now
                  </h2>
                  <p className="text-xs text-slate-455 mt-1 leading-relaxed">
                    Support our mission to nourish families. Watch the local buy-rate react in real-time.
                  </p>
                </div>

                <form onSubmit={handleDonate} className="space-y-4">
                  
                  {/* Predefined values row */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">Select Donation Amount</label>
                    <div className="grid grid-cols-4 gap-2">
                       {[10, 25, 50, 100].map((amount) => {
                        const eggEquiv = amount / eggPrice;
                        return (
                          <button
                            key={amount}
                            id={`predefined-${amount}`}
                            type="button"
                            onClick={() => selectPredefined(amount)}
                            className={`py-2.5 px-1 text-center rounded-2xl border transition-all flex flex-col items-center justify-between cursor-pointer ${
                              selectedAmount === amount
                                ? 'bg-yellow-400 text-slate-900 border-yellow-400 shadow-sm font-black'
                                : 'bg-white hover:bg-slate-100 hover:border-slate-300 border-slate-200 text-slate-800 font-medium'
                            }`}
                          >
                            <span className="text-xs font-black">RM{amount}</span>
                            <span className={`text-[9px] mt-0.5 ${selectedAmount === amount ? 'text-yellow-905 font-bold' : 'text-slate-400'}`}>
                              {eggEquiv} Eggs
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Amount panel */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Or Enter Custom Amount (RM)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-extrabold text-xs">
                        RM
                      </div>
                      <input
                        id="custom-amount-input"
                        type="number"
                        min="1"
                        step="any"
                        placeholder="Other amount"
                        value={customAmount}
                        onChange={handleCustomChange}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 focus:bg-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-2xl text-sm transition-all text-slate-900 outline-none placeholder:text-slate-450"
                      />
                      {/* Real-time egg calculation */}
                      {(customAmount || selectedAmount) && (
                        <div className="absolute right-3 inset-y-0 flex items-center text-xs font-bold text-yellow-600 font-mono">
                          ≈ {Math.round((selectedAmount !== null ? selectedAmount : parseFloat(customAmount || '0')) / eggPrice)} Eggs!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profile detail */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Your Name</label>
                      <input
                        id="donor-name-input"
                        type="text"
                        placeholder="e.g. Sarah Jenkins"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 focus:bg-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-2xl text-sm text-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  {/* Optional lovely message */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Message of Support</label>
                    <textarea
                      id="donation-message-input"
                      rows={2}
                      placeholder="Wishes for the families! (Optional)"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-200 focus:bg-white focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 rounded-2xl text-sm text-slate-900 outline-none resize-none"
                    />
                  </div>

                  {/* Action button */}
                  <button
                    id="donate-submit-btn"
                    type="submit"
                    className="w-full bg-slate-900 text-white font-bold py-3.5 px-4 rounded-full shadow-sm hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                  >
                    <Heart className="w-4 h-4 fill-current group-hover:scale-105 transition-transform text-yellow-400" />
                    Complete Donation of RM{selectedAmount !== null ? selectedAmount : customAmount || '0'}
                  </button>

                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-450 mt-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Secure official channel. Warm gratitude for your instant support!</span>
                  </div>

                </form>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Floating Success Notification Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white border border-slate-800 rounded-3xl p-5 shadow-2xl max-w-sm flex gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900 font-extrabold shrink-0 shadow-sm">
              🥚
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs text-yellow-400 uppercase tracking-widest">Donation Received!</span>
                <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mt-1.5">
                You added <strong>RM{lastAmount}</strong> to the charity pool, adding <strong>{Math.round(lastAmount / eggPrice)} fresh eggs</strong> to our distribution stack. Warm blessings!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-Donation Share Card Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="bg-white rounded-[32px] p-6 sm:p-8 max-w-md w-full border border-slate-150 shadow-2xl relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-yellow-400" />
              
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-6 pt-4">
                {/* Badge Icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-50 border-4 border-yellow-105 shadow-sm">
                  <span className="text-3xl">🥚</span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-yellow-805 bg-yellow-50 px-2.5 py-1 rounded-full">
                    Official Share Card
                  </span>
                  <h3 className="font-display text-2xl font-black text-slate-900 tracking-tight">
                    Thank You, {shareData.name}!
                  </h3>
                </div>

                {/* Contribution details card */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-150 space-y-3">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Live contribution
                  </div>
                  <div className="font-display text-4xl font-black text-slate-900">
                    RM{shareData.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400 text-slate-900 font-extrabold text-xs rounded-full">
                    🥚 {shareData.eggCount.toLocaleString()} Fresh Eggs
                  </div>
                </div>

                {/* Tagline Box */}
                <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-2xl p-4 relative">
                  <p className="text-sm font-extrabold text-yellow-850 italic leading-relaxed">
                    "I just nourished {shareData.familiesCount} {shareData.familiesCount === 1 ? 'family' : 'families'} with EggGiver 🥚"
                  </p>
                </div>

                {/* Quote / Message if present */}
                {shareData.message && (
                  <p className="text-xs text-slate-500 italic max-w-xs mx-auto font-medium">
                    "{shareData.message}"
                  </p>
                )}

                {/* Action Buttons row */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCopyText}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Share Text
                      </>
                    )}
                  </button>

                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      `I just nourished ${shareData.familiesCount} ${shareData.familiesCount === 1 ? 'family' : 'families'} by contributing RM${shareData.amount} (${shareData.eggCount} fresh eggs) with EggGiver 🥚 Join the mission to nourish lives! #EggGiver`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-extrabold text-[10px] uppercase tracking-wider rounded-full transition-all cursor-pointer text-center"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Tweet on X
                  </a>
                </div>

                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Spread the warmth to nourish more souls!
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
