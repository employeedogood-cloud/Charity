import React from 'react';
import { Heart, UploadCloud, Smile, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { DonorPhoto } from '../types';

interface DonationWallProps {
  customDonorPhotos: DonorPhoto[];
}

export default function DonationWall({ customDonorPhotos }: DonationWallProps) {
  
  // Default high-quality realistic static mock photos
  const defaultDonors: DonorPhoto[] = [
    {
      id: "d1",
      name: "Marcus Vance",
      location: "East Boston Shelter",
      eggCount: 250,
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500",
      message: "It warms my heart to know these fresh eggs provide vital daily nourishment directly to local shelter circles.",
      date: "Yesterday"
    },
    {
      id: "d2",
      name: "Elena Rostova",
      location: "Sunnyvale Elderly Center",
      eggCount: 150,
      imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=500",
      message: "Fresh breakfast eggs should be accessible to all. So proud to join the mission as a monthly sponsor!",
      date: "2 days ago"
    },
    {
      id: "d3",
      name: "The Miller Family",
      location: "North End Soup Kitchen",
      eggCount: 500,
      imageUrl: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=600",
      message: "We donated 500 eggs in honor of our grandma's birthday. Eggs brought so much food security to families nearby.",
      date: "4 days ago"
    },
    {
      id: "d4",
      name: "Kenji Sato",
      location: "Youth Center Brunch Program",
      eggCount: 100,
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500",
      message: "An amazing, streamlined charity. High impact, simple direct reports from local farms that deliver.",
      date: "Last week"
    },
    {
      id: "d5",
      name: "The Givers Club",
      location: "Central Food Bank Dispatch",
      eggCount: 1200,
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=500",
      message: "Bulk purchased 1,200 eggs directly from family co-ops. Nourishing the children is our civic responsibility.",
      date: "Last week"
    },
    {
      id: "d6",
      name: "Clara & Friends",
      location: "St. Jude Breakfast Union",
      eggCount: 300,
      imageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=500",
      message: "Super healthy, clean eggs buy-rate is unmatched. Let's hit the 1B goal by next lockdown!",
      date: "2 weeks ago"
    }
  ];

  // Combine default with user uploaded ones (latest first)
  const allDonors = [...customDonorPhotos, ...defaultDonors];

  return (
    <section id="gallery-section" className="py-20 bg-slate-50 border-t border-b border-slate-150">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Grid Intro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
          <div className="lg:col-span-8 space-y-3">
            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-750 text-[10px] font-black rounded-full uppercase tracking-wider">
              Human Impact Gallery
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Smiling Donors & Nourished Smiles
            </h2>
            <p className="text-sm text-slate-500 max-w-3xl leading-relaxed">
              Every card below is a real testament to nourishing lives. We capture smiles of supporters, volunteers, and the wonderful recipients who receive fresh daily eggs. Fresh eggs mean energy, growth, and security.
            </p>
          </div>
          
          <div className="lg:col-span-4 lg:text-right">
            <a
              id="request-featuring-btn"
              href="https://wa.me/601119602980"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-full shadow-xs cursor-pointer transition-all hover:scale-[1.02] text-xs uppercase tracking-wider"
            >
              <MessageCircle className="w-4 h-4 text-white fill-current shrink-0" />
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Dynamic Image Grid */}
        <div id="donor-photos-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {allDonors.map((donor, idx) => (
            <motion.div
              key={donor.id}
              initial={idx < 3 ? { opacity: 0, y: 30 } : false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl border border-slate-150 hover:border-yellow-400 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group relative"
            >
              {/* Image Frame */}
              <div className="relative aspect-square sm:aspect-[4/3] w-full bg-slate-105 overflow-hidden">
                <img
                  src={donor.imageUrl}
                  alt={donor.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Custom User Badge */}
                {donor.id.startsWith('custom-') && (
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white font-bold text-[9px] px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    Just Added
                  </div>
                )}

                {/* Egg Count Flag */}
                <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md text-white px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border border-slate-700/50">
                  <span>🥚 {donor.eggCount} Eggs</span>
                </div>
              </div>

              {/* Text info */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-display font-extrabold text-slate-900 text-base tracking-tight">{donor.name}</h4>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0">{donor.date}</span>
                  </div>
                  <p className="text-[11px] text-slate-450 font-bold uppercase tracking-wider flex items-center gap-1">
                    📍 {donor.location}
                  </p>
                  {donor.message && (
                    <blockquote className="text-xs text-slate-500 italic bg-slate-50 border border-slate-100 p-4 rounded-2xl relative leading-relaxed mt-2 font-medium">
                      "{donor.message}"
                    </blockquote>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 text-[9px] text-slate-450 uppercase tracking-widest font-black font-mono">
                  <span>Authorized Donor Profile</span>
                  <span className="text-yellow-605 font-sans tracking-normal flex items-center gap-1">
                    <Heart className="w-3 h-3 fill-current text-yellow-500" /> Verified impact
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Feature Invitation Slate block */}
        <div className="mt-16 bg-slate-900 text-white rounded-3xl p-8 md:p-12 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Decorative outline circles */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
          
          <div className="space-y-4 max-w-2xl relative z-10">
            <h3 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-snug">
              Want Your Face Featured Above?
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              If you have recently supported us or volunteered to hand out egg crates in your local neighborhood soup kitchens and want your face/group photo added live to our gallery, we make it seamless! Connect with us on WhatsApp to send over your info.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold text-slate-400 pt-1">
              <span className="flex items-center gap-1.5"><span className="text-yellow-400">✓</span> Send photo via WhatsApp</span>
              <span className="flex items-center gap-1.5"><span className="text-yellow-400">✓</span> Instant custom review</span>
              <span className="flex items-center gap-1.5"><span className="text-yellow-400">✓</span> High impact visibility</span>
            </div>
          </div>
          
          <a
            id="open-chat-promo-btn"
            href="https://wa.me/601119602980"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-full shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer whitespace-nowrap text-xs uppercase tracking-wider shrink-0 flex items-center gap-2"
          >
            <MessageCircle className="w-4 h-4 fill-current text-white" />
            WhatsApp Us
          </a>
        </div>

      </div>
    </section>
  );
}
