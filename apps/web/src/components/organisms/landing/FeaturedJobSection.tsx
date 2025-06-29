'use client'

import { JobPostingFeatured } from '@/types';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ListChecks, LocateFixed, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useFeaturedJobsStore } from '@/stores/featuredJobsStore';
import { LatestJobSection } from './LatestJobSection';
import { NearestJobSection } from './NearestJobSection';

interface FeaturedJobSectionProps {
  jobs: JobPostingFeatured[];
}

export function FeaturedJobSection({ jobs: latestJobs }: FeaturedJobSectionProps) {
  const { 
    activeTab, 
    setActiveTab, 
    isLoadingNearest, 
    nearestJobs, 
    userCoordinates 
  } = useFeaturedJobsStore();

  const isTabActive = (tab: 'latest' | 'nearest'): boolean => activeTab === tab;

  // Early return if no jobs for initial "Latest Jobs" tab
  if (isTabActive('latest') && (!latestJobs || latestJobs.length === 0) && !isLoadingNearest) {
    return (
      <section className="py-12 md:py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="mb-4 text-3xl font-bold tracking-tight font-heading md:text-4xl text-foreground">
              Job Opportunities
            </h2>
            {/* Tab Buttons */}
            <div className="flex justify-center gap-4 mb-8">
              <Button
                variant={isTabActive('latest') ? 'default' : 'outline'}
                onClick={() => setActiveTab('latest')}
                className="gap-2"
              >
                <ListChecks className="h-4 w-4" /> Latest Jobs
              </Button>
              <Button
                variant={isTabActive('nearest') ? 'default' : 'outline'}
                onClick={() => setActiveTab('nearest')}
                className="gap-2"
              >
                <LocateFixed className="h-4 w-4" /> Nearest Jobs
              </Button>
            </div>
            <LatestJobSection jobs={latestJobs} />
          </motion.div>
        </div>
      </section>
    );
  }

  // Get jobs to display based on active tab
  const jobsToDisplay = activeTab === 'latest' ? latestJobs : nearestJobs;

  return (
    <section 
      id="featured-jobs" 
      className="py-16 md:py-24 bg-gradient-to-br from-surface-500 via-background to-surface-300 dark:from-secondary-800 dark:via-background dark:to-secondary-900 relative overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl"></div>
        {[
          { top: '10%', left: '10%', delay: 0 },
          { top: '20%', right: '20%', delay: 1 },
          { bottom: '30%', left: '15%', delay: 2 },
          { bottom: '20%', right: '10%', delay: 0.5 },
          { top: '60%', left: '60%', delay: 1.5 },
        ].map((sparkle, i) => (
          <motion.div 
            key={i}
            className="absolute"
            style={{ 
              [sparkle.top ? 'top' : 'bottom']: sparkle.top || sparkle.bottom, 
              [sparkle.left ? 'left' : 'right']: sparkle.left || sparkle.right 
            }}
            animate={{ 
              opacity: [0.3, 0.7, 0.3], 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: sparkle.delay,
              ease: "easeInOut" 
            }}
          >
            <Sparkles className="h-4 w-4 text-primary/30" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <TrendingUp className="h-4 w-4" />
            Hot Opportunities
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-heading mb-4 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            {isTabActive('latest') ? 'Latest Job Openings' : 'Jobs Near You'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {isTabActive('latest') 
              ? "Discover exciting career opportunities from top companies. Fresh listings updated daily."
              : userCoordinates 
                ? `Showing top jobs near your current location. (Lat: ${userCoordinates.latitude.toFixed(2)}, Lon: ${userCoordinates.longitude.toFixed(2)})`
                : "Find relevant jobs based on your proximity."
            }
          </p>
        </motion.div>

        {/* Tab Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center gap-3 md:gap-4 mb-10 md:mb-12"
        >
          <Button
            size="lg"
            variant={isTabActive('latest') ? 'default' : 'outline'}
            onClick={() => setActiveTab('latest')}
            className={cn(
              "transition-all duration-300 ease-in-out transform hover:scale-105",
              isTabActive('latest') ? "shadow-lg" : "hover:bg-primary/10"
            )}
          >
            <ListChecks className="mr-2 h-5 w-5" /> Latest Jobs
          </Button>
          <Button
            size="lg"
            variant={isTabActive('nearest') ? 'default' : 'outline'}
            onClick={() => setActiveTab('nearest')}
            disabled={isLoadingNearest}
            className={cn(
              "transition-all duration-300 ease-in-out transform hover:scale-105",
              isTabActive('nearest') ? "shadow-lg" : "hover:bg-primary/10"
            )}
          >
            {isLoadingNearest ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <LocateFixed className="mr-2 h-5 w-5" />
            )}
            Nearest Jobs
          </Button>
        </motion.div>

        {/* Tab Content */}
        {isTabActive('latest') ? (
          <LatestJobSection jobs={latestJobs} />
        ) : (
          <NearestJobSection />
        )}
        
        {/* Hover instruction */}
        {jobsToDisplay.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-muted-foreground/70 flex items-center justify-center gap-2">
              <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>✨</motion.span>
              Hover to pause and explore
              <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity, delay: 1 }}>✨</motion.span>
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}