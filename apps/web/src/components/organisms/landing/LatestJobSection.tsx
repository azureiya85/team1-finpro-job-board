'use client'

import { FeaturedJobCard } from '@/components/molecules/landing/FeaturedJobCard';
import { JobPostingFeatured } from '@/types';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Briefcase } from 'lucide-react';

interface LatestJobSectionProps {
  jobs: JobPostingFeatured[];
}

export function LatestJobSection({ jobs }: LatestJobSectionProps) {
  const [isHovered, setIsHovered] = useState(false);

  const duplicatedJobs = useMemo(() => {
    if (jobs.length === 0) return [];
    const minRepetitions = Math.max(3, Math.ceil(5 / jobs.length) * jobs.length);
    const duplicated = [];
    for (let i = 0; i < minRepetitions; i++) {
      duplicated.push(...jobs);
    }
    return duplicated;
  }, [jobs]);

  const cardWidthWithGap = 344;
  const animationDistance = jobs.length * cardWidthWithGap;
  const animationDuration = jobs.length * 8;

  // Show no jobs message if no jobs available
  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Briefcase className="h-5 w-5" />
          <p>No job openings for &quot;Latest Jobs&quot; at the moment. Please check back later!</p>
        </div>
      </div>
    );
  }

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
            x: isHovered || jobs.length <= 1 ? 0 : `-${animationDistance}px`,
          }}
          transition={{
            duration: isHovered || jobs.length <= 1 ? 0.5 : animationDuration,
            ease: "linear",
            repeat: isHovered || jobs.length <= 1 ? 0 : Infinity,
            repeatType: "loop",
          }}
          style={{
            width: `${duplicatedJobs.length * cardWidthWithGap}px`,
          }}
        >
          {duplicatedJobs.map((job, index) => (
            <FeaturedJobCard
              key={`${job.id}-latest-${Math.floor(index / jobs.length)}`}
              job={job}
              index={index % jobs.length} 
            />
          ))}
        </motion.div>
      </div>

      {/* Gradient overlays for fade effect */}
      {jobs.length > 1 && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-background to-transparent dark:from-background dark:to-transparent pointer-events-none z-10"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-background to-transparent dark:from-background dark:to-transparent pointer-events-none z-10"></div>
        </>
      )}
    </div>
  );
}