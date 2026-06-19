import React, { useState } from 'react';
import { Play, Tv, Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoData {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  views: string;
  thumbnail: string;
}

export default function VideoGallery() {
  const [activeVideoIndex, setActiveVideoIndex] = useState<number | null>(null);

  const videos: VideoData[] = [
    {
      id: "v1",
      youtubeId: "96S8SgswYQY", // A standard charity/donation related video
      title: "Our Micro-Farm Partnership: Sourcing Farm-Fresh Eggs",
      description: "Take a walk through our organic free-range partner farm in the countryside. We secure high-quality, calcium-rich eggs directly at wholesale prices, directly helping both local family farms and urban soup kitchens.",
      duration: "4:12",
      category: "Sourcing & Farms",
      views: "1,420 vlogs",
      thumbnail: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "v2",
      youtubeId: "g7w_T0W8pI8", // Inspiring community support video
      title: "Distribution Day Vlog: Securing 5,000 Eggs for Elder Centers",
      description: "Follow our volunteers on our monthly dispatch mission! This video captures the raw smiles, loading trucks, and final handovers to grandmother shelter kitchens who rely heavily on our nutrient donations.",
      duration: "7:45",
      category: "Distribution Missions",
      views: "4,890 vlogs",
      thumbnail: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=600"
    },
    {
      id: "v3",
      youtubeId: "E1X7_4mizXU", // Hunger relief vlogs
      title: "Nourishment Spotlight: Why Eggs Make the Perfect Giving Asset",
      description: "Hear from certified dieticians and social workers on why eggs are chosen by our charity above any other grocery. High protein, long shelf life, and extreme flexibility make them a superfood for the underprivileged.",
      duration: "3:30",
      category: "Educational",
      views: "2,104 vlogs",
      thumbnail: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&q=80&w=600"
    }
  ];

  return (
    <section id="videos-section" className="bg-white py-20 text-slate-800 relative overflow-hidden border-b border-slate-150">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-yellow-100/10 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="text-left max-w-2xl mb-16 space-y-3">
          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-750 text-[10px] font-black rounded-full uppercase tracking-wider">
            Direct Field Documentation
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
            See Your Donations in Real Action
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            Transparency is our golden rule. Watch our team transport, package, and hand over eggs directly to community kitchens—all without leaving this page.
          </p>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {videos.map((vid, index) => (
            <div 
              key={vid.id}
              className="bg-slate-50/50 rounded-3xl border border-slate-150 hover:border-yellow-400 hover:bg-slate-50 transition-all duration-300 overflow-hidden flex flex-col group h-full shadow-sm"
            >
              {/* Thumbnail / Active Frame Box */}
              <div className="relative aspect-video w-full bg-slate-905 overflow-hidden shrink-0">
                {activeVideoIndex === index ? (
                  /* YouTube Embed Frame - Plays directly in the page! */
                  <iframe
                    title={vid.title}
                    src={`https://www.youtube.com/embed/${vid.youtubeId}?autoplay=1&rel=0`}
                    className="absolute inset-0 w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  /* Static Thumbnail Card with play overlay */
                  <div className="relative w-full h-full">
                    <img 
                      src={vid.thumbnail} 
                      alt={vid.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Dark gradient filter */}
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/20 transition-all" />
                    
                    {/* Floating Info Pill */}
                    <div className="absolute top-3 left-3 px-2.5 py-0.5 bg-slate-950/90 rounded-full text-[9px] font-black uppercase tracking-widest text-yellow-400">
                      {vid.category}
                    </div>

                    <div className="absolute bottom-3 right-3 px-2 py-0.5 bg-slate-950/90 rounded-full text-[10px] font-bold font-mono text-slate-300">
                      {vid.duration}
                    </div>

                    {/* Play Button Overlay */}
                    <button
                      id={`play-video-${vid.id}`}
                      onClick={() => setActiveVideoIndex(index)}
                      className="absolute inset-0 flex items-center justify-center m-auto w-14 h-14 rounded-full bg-yellow-400 text-slate-900 hover:bg-yellow-550 hover:scale-105 shadow-md transition-all cursor-pointer"
                    >
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Text metadata */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-display text-base font-extrabold text-slate-900 group-hover:text-yellow-650 transition-colors line-clamp-2">
                    {vid.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium">
                    {vid.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-150 text-[11px] text-slate-400 font-bold">
                  <span className="flex items-center gap-1 text-slate-400 uppercase tracking-widest font-mono">
                    <Layers className="w-3.5 h-3.5 text-slate-300" />
                    YouTube Embed
                  </span>
                  {activeVideoIndex === index && (
                    <button 
                      onClick={() => setActiveVideoIndex(null)}
                      className="text-yellow-605 hover:text-yellow-700 font-extrabold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3 animate-spin text-yellow-500" /> Stop Player
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Helpful Tip Box */}
        <div className="mt-12 p-5 bg-slate-50 border border-slate-155 rounded-3xl max-w-2xl mx-auto flex items-center gap-3.5 text-xs text-slate-500 shadow-sm leading-relaxed">
          <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
          <p>
            By playing vlogs directly inside our inline container, you bypass extra external tabs, save device memory, and stay directly aligned with the live interactive charts.
          </p>
        </div>

      </div>
    </section>
  );
}
