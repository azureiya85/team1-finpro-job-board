'use client'

import { FeaturedJobCard } from '@/components/molecules/landing/FeaturedJobCard';
import { motion } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { useFeaturedJobsStore } from '@/stores/featuredJobsStore';

export function NearestJobSection() {
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    nearestJobs,
    isLoadingNearest,
    locationError,
    userCoordinates,
    fetchNearestJobs
  } = useFeaturedJobsStore();

  // Fetch nearest jobs when component mounts (if not already loaded)
  useEffect(() => {
    if (nearestJobs.length === 0 && !userCoordinates && !locationError && !isLoadingNearest) {
      fetchNearestJobs();
    }
  }, [nearestJobs.length, userCoordinates, locationError, isLoadingNearest, fetchNearestJobs]);

  const duplicatedJobs = useMemo(() => {
    if (nearestJobs.length === 0) return [];
    const minRepetitions = Math.max(3, Math.ceil(5 / nearestJobs.length) * nearestJobs.length);
    const duplicated = [];
    for (let i = 0; i < minRepetitions; i++) {
      duplicated.push(...nearestJobs);
    }
    return duplicated;
  }, [nearestJobs]);

  const cardWidthWithGap = 344;
  const animationDistance = nearestJobs.length * cardWidthWithGap;
  const animationDuration = nearestJobs.length * 8;

  // Loading state
  if (isLoadingNearest) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          <span>Finding jobs near you...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (locationError) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center text-destructive bg-destructive/10 p-3 rounded-md">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>{locationError}</span>
        </div>
      </div>
    );
  }

  // No jobs found state
  if (!isLoadingNearest && nearestJobs.length === 0 && userCoordinates) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center text-muted-foreground">
          <MapPin className="mr-2 h-5 w-5" />
          <span>No jobs found within 50km of your location. Try expanding your search!</span>
        </div>
      </div>
    );
  }

  // Jobs found - render carousel
  if (nearestJobs.length > 0) {
    return (
      <div className="relative">
        <div 
          className="overflow-hidden"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            className="flex" 
            animate={{
              x: isHovered || nearestJobs.length <= 1 ? 0 : `-${animationDistance}px`,
            }}
            transition={{
              duration: isHovered || nearestJobs.length <= 1 ? 0.5 : animationDuration,
              ease: "linear",
              repeat: isHovered || nearestJobs.length <= 1 ? 0 : Infinity,
              repeatType: "loop",
            }}
            style={{
              width: `${duplicatedJobs.length * cardWidthWithGap}px`,
            }}
          >
            {duplicatedJobs.map((job, index) => (
              <FeaturedJobCard
                key={`${job.id}-nearest-${Math.floor(index / nearestJobs.length)}`}
                job={job}
                index={index % nearestJobs.length} 
              />
            ))}
          </motion.div>
        </div>

        {/* Gradient overlays for fade effect */}
        {nearestJobs.length > 1 && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-background to-transparent dark:from-background dark:to-transparent pointer-events-none z-10"></div>
            <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-background to-transparent dark:from-background dark:to-transparent pointer-events-none z-10"></div>
          </>
        )}
      </div>
    );
  }

  // Fallback - should not reach here normally
  return null;
}