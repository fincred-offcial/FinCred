import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Sparkles } from 'lucide-react';
import { Banner } from '../types.js';
import { fetchActiveBanners, DEFAULT_BANNERS } from '../services/api.js';

interface PromotionalBannersProps {
  className?: string;
  compact?: boolean;
}

export const PromotionalBanners: React.FC<PromotionalBannersProps> = ({ className, compact = false }) => {
  const [banners, setBanners] = useState<Banner[]>(() => 
    [...DEFAULT_BANNERS].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Mobile Touch Swipe State
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    fetchActiveBanners()
      .then(data => {
        if (mounted && Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
          setBanners(sorted);
          setLoading(false);
        }
      })
      .catch(err => {
        console.warn('Could not refresh dynamic banners, retaining default banners:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleNext = useCallback(() => {
    setBanners(curr => {
      if (curr.length <= 1) return curr;
      setCurrentIndex(prev => (prev + 1) % curr.length);
      return curr;
    });
  }, []);

  const handlePrev = useCallback(() => {
    setBanners(curr => {
      if (curr.length <= 1) return curr;
      setCurrentIndex(prev => (prev === 0 ? curr.length - 1 : prev - 1));
      return curr;
    });
  }, []);

  // Auto-scroll rotating between banners every 5 seconds (pauses on hover or touch)
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length, isPaused, handleNext]);

  // Touch Swipe Handlers for Mobile (Android & iPhone)
  const onTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchEndXRef.current = null;
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const distance = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Banner
      handleNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Previous Banner
      handlePrev();
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 my-6">
        <div className="w-full aspect-[16/9] sm:aspect-[2.4/1] rounded-2xl sm:rounded-3xl bg-slate-200 animate-pulse border border-slate-300" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div 
      className={className || "w-full max-w-6xl mx-auto px-4 sm:px-6 my-6 sm:my-10"} 
      id="promotional-banner-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className={`relative group overflow-hidden rounded-2xl ${compact ? 'border border-slate-300/80 shadow-md' : 'sm:rounded-3xl border border-slate-200/80 shadow-xl'} bg-[#080d1e] select-none`}>
        
        {/* Banner Aspect-Ratio Carousel Container */}
        <div className={`relative w-full ${compact ? 'aspect-[16/11] sm:aspect-[16/9]' : 'aspect-[16/10] sm:aspect-[21/9] lg:aspect-[2.6/1]'} overflow-hidden`}>
          {banners.map((banner, idx) => {
            const isActive = idx === currentIndex;
            return (
              <div
                key={banner.bannerId || `banner-${idx}`}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  isActive 
                    ? 'opacity-100 scale-100 z-10 pointer-events-auto' 
                    : 'opacity-0 scale-[1.02] z-0 pointer-events-none'
                }`}
                aria-hidden={!isActive}
              >
                {/* Photo with aspect preservation and gentle zoom on hover */}
                {banner.imageUrl ? (
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-1000"
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
                )}

                {/* Dark Gradient Overlay for optimal contrast, readability & trust */}
                <div className={`absolute inset-0 bg-gradient-to-t from-[#060a17] via-[#060a17]/85 to-transparent sm:bg-gradient-to-r sm:from-[#060a17] sm:via-[#060a17]/90 sm:to-transparent/20 flex flex-col justify-end sm:justify-center ${compact ? 'p-4 sm:p-6' : 'p-5 sm:p-8 md:p-12'}`}>
                  <div className="max-w-xl space-y-1.5 sm:space-y-3">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 backdrop-blur-xs">
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                      <span>{compact ? 'Partner Offer' : 'Promotional Lending Partner Offer'}</span>
                    </div>

                    {/* Banner Title */}
                    <h3 className={`${compact ? 'text-base sm:text-lg' : 'text-lg sm:text-2xl md:text-3xl'} font-extrabold text-white leading-tight font-['Outfit',sans-serif] drop-shadow-sm`}>
                      {banner.title}
                    </h3>

                    {/* Banner Description */}
                    {banner.description && (
                      <p className={`text-[11px] ${compact ? 'sm:text-xs line-clamp-2' : 'sm:text-sm line-clamp-2 sm:line-clamp-3'} text-slate-300 font-normal max-w-lg leading-relaxed`}>
                        {banner.description}
                      </p>
                    )}

                    {/* CTA Button & Partner Info */}
                    <div className={`${compact ? 'pt-1.5' : 'pt-2 sm:pt-3'}`}>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <a
                          href={banner.destinationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          id={`banner-cta-btn-${banner.bannerId}`}
                          className={`inline-flex items-center gap-2 ${compact ? 'px-4 py-2 text-xs' : 'px-5 py-2.5 sm:px-6 sm:py-3 text-xs sm:text-sm'} rounded-xl font-bold bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/50 hover:shadow-blue-600/40 transform active:scale-95 transition-all cursor-pointer`}
                        >
                          <span>{banner.buttonText || 'Check Eligibility'}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                      <p className="mt-1.5 text-[9px] sm:text-[10px] text-slate-400">
                        Check loan eligibility. Subject to lender assessment & terms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Navigation Arrow Controls */}
        {banners.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Banner"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 border border-slate-700/80 text-white flex items-center justify-center opacity-85 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-900 shadow-md cursor-pointer active:scale-90"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Banner"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-950/70 border border-slate-700/80 text-white flex items-center justify-center opacity-85 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-900 shadow-md cursor-pointer active:scale-90"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slide Index Counter Badge & Indicator Dots */}
            <div className="absolute bottom-2.5 sm:bottom-4 right-4 z-20 flex items-center gap-2.5">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-300/80 bg-slate-950/50 px-2 py-0.5 rounded-full border border-slate-700/50">
                0{currentIndex + 1} / 0{banners.length}
              </span>
              
              <div className="flex items-center gap-1.5">
                {banners.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentIndex(dotIdx)}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      dotIdx === currentIndex 
                        ? 'w-6 sm:w-7 bg-amber-400' 
                        : 'w-2 bg-slate-500/70 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
