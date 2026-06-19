import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Egg, Sparkles, MessageCircle, RefreshCw, Star, Info, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react';
import { DonorPhoto, Donation } from './types';
import HeroSection from './components/HeroSection';
import VideoGallery from './components/VideoGallery';
import DonationWall from './components/DonationWall';
import { 
  isFirebaseActive, 
  subscribeToStats, 
  subscribeToDonations, 
  addRealDonation,
  testFirestoreConnection 
} from './firebase';

export default function App() {
  const [totalMoney, setTotalMoney] = useState<number>(12450.00);
  const [customDonorPhotos, setCustomDonorPhotos] = useState<DonorPhoto[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);

  const EGG_PRICE = 0.50; // RM0.50 per egg

  // Loading persisted states from localStorage or subscribing to live Firestore updates
  useEffect(() => {
    if (isFirebaseActive) {
      // Test and validate Firestore live connections
      testFirestoreConnection();

      // Subscribe to real-time totals (Person A's donation is instantly visible to Person B)
      const unsubscribeStats = subscribeToStats((stats) => {
        setTotalMoney(stats.totalMoney);
      });

      // Subscribe to real-time donation livefeed
      const unsubscribeDonations = subscribeToDonations((donations) => {
        // If there are real-time donations available, use them; otherwise, fallback to hardcoded list
        if (donations.length > 0) {
          setRecentDonations(donations);
        } else {
          setRecentDonations([
            { id: '1', name: 'Liam Porter', amount: 100, eggs: 500, timestamp: '1 hour ago', message: 'Eggs represent healthy futures!' },
            { id: '2', name: 'Sophia Wright', amount: 25, eggs: 125, timestamp: '3 hours ago', message: 'Happy to support Mission #14!' },
            { id: '3', name: 'Jackson Blake', amount: 50, eggs: 250, timestamp: '5 hours ago' }
          ]);
        }
      });

      // Load curated custom photos
      const savedDonors = localStorage.getItem('charity_egg_custom_donors');
      if (savedDonors) {
        try {
          setCustomDonorPhotos(JSON.parse(savedDonors));
        } catch (e) {
          console.error("Error parsing saved donors", e);
        }
      }

      return () => {
        unsubscribeStats();
        unsubscribeDonations();
      };
    } else {
      // LocalStorage Fallback Flow (Sandbox Mode)
      const savedMoney = localStorage.getItem('charity_egg_money_total');
      if (savedMoney) {
        setTotalMoney(parseFloat(savedMoney));
      }

      const savedRecent = localStorage.getItem('charity_egg_recent_donations');
      if (savedRecent) {
        try {
          setRecentDonations(JSON.parse(savedRecent));
        } catch (e) {
          console.error("Error parsing saved donations", e);
        }
      } else {
        // Default initial recent activity data
        const defaultRecent: Donation[] = [
          { id: '1', name: 'Liam Porter', amount: 100, eggs: 500, timestamp: '1 hour ago', message: 'Eggs represent healthy futures!' },
          { id: '2', name: 'Sophia Wright', amount: 25, eggs: 125, timestamp: '3 hours ago', message: 'Happy to support Mission #14!' },
          { id: '3', name: 'Jackson Blake', amount: 50, eggs: 250, timestamp: '5 hours ago' }
        ];
        setRecentDonations(defaultRecent);
      }

      const savedDonors = localStorage.getItem('charity_egg_custom_donors');
      if (savedDonors) {
        try {
          setCustomDonorPhotos(JSON.parse(savedDonors));
        } catch (e) {
          console.error("Error parsing saved donors", e);
        }
      }
    }
  }, []);

  // Update total money
  const handleAddDonation = async (name: string, amount: number, message: string) => {
    const calculatedEggs = Math.round(amount / EGG_PRICE);

    if (isFirebaseActive) {
      // Direct live submission to Firestore - triggers real-time stream updates to all users instantly!
      await addRealDonation(name, amount, calculatedEggs, message);
    } else {
      // Local fallback flow
      const updatedMoney = totalMoney + amount;
      setTotalMoney(updatedMoney);
      localStorage.setItem('charity_egg_money_total', updatedMoney.toString());

      const newDonation: Donation = {
        id: `don-${Date.now()}`,
        name,
        amount,
        eggs: calculatedEggs,
        timestamp: 'Just Now',
        message
      };

      const updatedRecent = [newDonation, ...recentDonations].slice(0, 6);
      setRecentDonations(updatedRecent);
      localStorage.setItem('charity_egg_recent_donations', JSON.stringify(updatedRecent));
    }
  };

  // Add custom donor photos dynamically from messenger (kept for local state typing)
  const handleAddDonorPhoto = (newPhoto: DonorPhoto) => {
    const updatedDonors = [newPhoto, ...customDonorPhotos];
    setCustomDonorPhotos(updatedDonors);
    localStorage.setItem('charity_egg_custom_donors', JSON.stringify(updatedDonors));
    
    // Add amount calculation based on the eggs they selected
    const mockAmount = newPhoto.eggCount * EGG_PRICE;
    const updatedMoney = totalMoney + mockAmount;
    setTotalMoney(updatedMoney);
    localStorage.setItem('charity_egg_money_total', updatedMoney.toString());
  };

  const handleResetDefaults = () => {
    if (window.confirm("Would you like to reset the application counters to default values?")) {
      localStorage.removeItem('charity_egg_money_total');
      localStorage.removeItem('charity_egg_custom_donors');
      localStorage.removeItem('charity_egg_recent_donations');
      localStorage.removeItem('egg_donation_countdown_target');
      
      setTotalMoney(12450.00);
      setCustomDonorPhotos([]);
      setRecentDonations([
        { id: '1', name: 'Liam Porter', amount: 100, eggs: 500, timestamp: '1 hour ago', message: 'Eggs represent healthy futures!' },
        { id: '2', name: 'Sophia Wright', amount: 25, eggs: 125, timestamp: '3 hours ago', message: 'Happy to support Mission #14!' },
        { id: '3', name: 'Jackson Blake', amount: 50, eggs: 250, timestamp: '5 hours ago' }
      ]);
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-800 flex flex-col justify-between selection:bg-yellow-200 selection:text-slate-900 font-sans selection:rounded-md">
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center transition-all">
          
          {/* Logo Brand */}
          <a href="#hero-section" className="flex items-center gap-3 px-1 focus:outline-none focus:ring-2 focus:ring-yellow-400 rounded-lg group">
            <div className="w-8 h-10 bg-yellow-400 rounded-full flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
              <div className="w-4 h-6 bg-white rounded-full opacity-60"></div>
            </div>
            <div>
              <span className="font-display font-black text-slate-900 tracking-tight text-lg line-clamp-1">EGG GIVER</span>
              <span className="text-[9px] text-yellow-600 block font-bold font-mono tracking-widest uppercase -mt-0.5">Charity Org</span>
            </div>
          </a>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <a href="#hero-section" className="hover:text-yellow-600 transition-colors">Donation Index</a>
            <a href="#videos-section" className="hover:text-yellow-600 transition-colors">Video Vlogs</a>
            <a href="#gallery-section" className="hover:text-yellow-600 transition-colors">Smiling Donors</a>
            <a href="#recent-section" className="hover:text-yellow-600 transition-colors">Live Feed</a>
          </nav>

          {/* WhatsApp Direct Button */}
          <div className="flex items-center gap-3">
            <button
              id="reset-defaults-btn"
              onClick={handleResetDefaults}
              title="Reset Counters"
              className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 rounded-full transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <a
              id="header-open-chat-btn"
              href="https://wa.me/601119602980"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-full text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <MessageCircle className="w-4 h-4 text-white fill-current shrink-0" />
              WhatsApp Us
            </a>
          </div>

        </div>
      </header>

      {/* Main Pages Flow */}
      <main className="flex-grow">
        
        {/* Section 1: Hero Header & Progress & Simulator */}
        <HeroSection 
          totalMoney={totalMoney} 
          onAddDonation={handleAddDonation}
          eggPrice={EGG_PRICE}
        />

        {/* Section 2: Real-time Live Activity Stream / Highlights */}
        <section id="recent-section" className="bg-slate-50 border-b border-slate-100 py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
              <div>
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black rounded-full mb-3 uppercase tracking-widest">
                  Live Activity Stream
                </span>
                <h3 className="font-display font-extrabold text-3xl text-slate-900 tracking-tight">
                  Recent Heartwarming Actions
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold bg-white px-3 py-1.5 rounded-full border border-slate-150 shadow-sm">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0" />
                Live Feed Active
              </div>
            </div>

            {/* List horizontal sliding */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentDonations.map((don) => (
                <div 
                  key={don.id}
                  className="bg-white rounded-3xl border border-slate-100 hover:border-yellow-400 p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 relative flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-900 text-sm tracking-tight">{don.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono font-medium uppercase tracking-wider">{don.timestamp}</p>
                      </div>
                      <span className="bg-yellow-50 border border-yellow-250/50 text-yellow-700 px-3 py-1 rounded-full text-xs font-black shrink-0">
                        RM{don.amount}
                      </span>
                    </div>
                    
                    <div className="p-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                      <p className="text-xs text-slate-600 italic leading-relaxed">
                        "{don.message || 'Wishes continuous health and joy to all recipient families!'}"
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono font-bold text-slate-500 flex items-center gap-1.5 pt-3 border-t border-slate-100">
                    <span className="text-yellow-500 text-sm">🥚</span> Provides ≈ {don.eggs} fresh farm eggs
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Embed Vlog Showcases (YouTube Direct in-page) */}
        <VideoGallery />

        {/* Section 4: Photo Gallery Grid */}
        <DonationWall 
          customDonorPhotos={customDonorPhotos}
        />

        {/* Section 5: Trust and Operational Integrity Badge */}
        <section className="bg-white py-16 border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-10 h-10" />
              </div>
            </div>
            <h3 className="font-display text-2xl font-bold text-slate-900 tracking-tight">
              Operational Quality & Nutrition Standards
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              We focus purely on fresh supply chain execution. Eggs are gathered from humanely-run family co-ops in protective, heat-insulated cartons and hand-delivered directly inside refrigerated transport cars within 24 hours of dispatch. No long-storage powders—just natural, wholesome food.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">🥦 Farm Direct Sourcing</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">📦 Carbon-Compensated Logistics</span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5">📃 Real Settlement Receipts Available</span>
            </div>
          </div>
        </section>

      </main>

      {/* Embedded WhatsApp float target placeholder or empty */}

      {/* Elegant Standard footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-850 text-xs py-12 shrink-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <div className="w-3 h-5 bg-white rounded-full opacity-60"></div>
                </div>
                <span className="font-display font-black text-white text-base tracking-tight">EGG GIVER</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Empowering communities with high-quality protein, direct farm-to-family logistics, and 100% transparent funding audits.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px] font-mono">Mission Chapters</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#hero-section" className="hover:text-yellow-400">Boston Central Kitchen</a></li>
                <li><a href="#hero-section" className="hover:text-yellow-400">Chicago Southside Union</a></li>
                <li><a href="#hero-section" className="hover:text-yellow-400">San Francisco Elder Bank</a></li>
                <li><a href="#hero-section" className="hover:text-yellow-400">Texas Rural Food Network</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px] font-mono">Direct Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a 
                    href="https://wa.me/601119602980" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:text-yellow-400 text-left cursor-pointer transition-colors"
                  >
                    WhatsApp Support
                  </a>
                </li>
                <li><a href="#videos-section" className="hover:text-yellow-400">Video audit archives</a></li>
                <li><a href="#hero-section" className="hover:text-yellow-400">Micro-farm application</a></li>
                <li><a href="#hero-section" className="hover:text-yellow-400">Volunteer logistics signup</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px] font-mono">Headquarters Contacts</h4>
              <ul className="space-y-2.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>500 Homestead Parkway, Suite 12B, Boston, MA</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>giving@charityeggsplace.org</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>+1 (800) 555-EGGS</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <div>
              &copy; {new Date().getFullYear()} EGG GIVER Charity Organization Inc. All rights reserved.
            </div>
            
            <div className="flex gap-4">
              <span>Verified Contribution Channel</span>
              <span>•</span>
              <span>Direct Link Policy</span>
              <span>•</span>
              <span>Public Audits</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
