'use client'

import { FeaturedJobCard } from '@/components/molecules/landing/FeaturedJobCard';
import { JobPostingFeatured } from '@/types'; 
import { motion } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Briefcase, TrendingUp, MapPin, Loader2, AlertTriangle, ListChecks, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button'; 
import { getCurrentDeviceLocation } from '@/lib/locationService';
import { cn } from '@/lib/utils';

interface FeaturedJobSectionProps {
  jobs: JobPostingFeatured[]; 
}

type Tab = 'latest' | 'nearest';

export function FeaturedJobSection({ jobs: latestJobs }: FeaturedJobSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('latest');
  const [nearestJobs, setNearestJobs] = useState<JobPostingFeatured[]>([]);
  const [isLoadingNearest, setIsLoadingNearest] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<{latitude: number, longitude: number} | null>(null);

  const isTabActive = (tab: Tab): boolean => activeTab === tab;

  const fetchNearestJobs = async () => {
    setIsLoadingNearest(true);
    setLocationError(null);
    setNearestJobs([]);

    const deviceLocation = await getCurrentDeviceLocation();
    if (!deviceLocation) {
      setLocationError("Could not get your location. Please enable location services or try again.");
      setIsLoadingNearest(false);
      return;
    }
    setUserCoordinates(deviceLocation);

    try {
      const params = new URLSearchParams({
        userLatitude: deviceLocation.latitude.toString(),
        userLongitude: deviceLocation.longitude.toString(),
        radiusKm: '50', 
        take: '15',    
      });

      console.log('Fetching nearest jobs with URL:', `/api/jobs?${params.toString()}`);
      
      const response = await fetch(`/api/jobs?${params.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch nearest jobs (Status: ${response.status})`);
      }
      
      const jobsData: JobPostingFeatured[] = await response.json();
      
      console.log('API Response (raw):', jobsData); 
      console.log('Total jobs received from API:', jobsData?.length || 0);

      if (jobsData && jobsData.length > 0) {
        const jobsToSet = jobsData.slice(0, 5);
        
        console.log('Jobs being set to state:', jobsToSet.map(j => ({ title: j.title, distance: j.distance })));
        
        setNearestJobs(jobsToSet);
      } else {
        console.log('No jobs found in API response');
        setNearestJobs([]); // No jobs found nearby
      }

    } catch (error: unknown) {
      console.error("Error fetching nearest jobs:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setLocationError(errorMessage);
    } finally {
      setIsLoadingNearest(false);
    }
  };

 useEffect(() => {
  if (activeTab === 'nearest' && nearestJobs.length === 0 && !userCoordinates && !locationError && !isLoadingNearest) {
    fetchNearestJobs();
  }
}, [activeTab, nearestJobs.length, userCoordinates, locationError, isLoadingNearest]);

const jobsToDisplay = useMemo(() => {
  return activeTab === 'latest' ? latestJobs : nearestJobs;
}, [activeTab, latestJobs, nearestJobs]);

  const duplicatedJobs = useMemo(() => {
     if (jobsToDisplay.length === 0) return [];
     const minRepetitions = Math.max(3, Math.ceil(5 / jobsToDisplay.length) * jobsToDisplay.length);
     const duplicated = [];
     for (let i = 0; i < minRepetitions; i++) {
        duplicated.push(...jobsToDisplay);
     }
     return duplicated;
  }, [jobsToDisplay]);

  const cardWidthWithGap = 344; 
  const animationDistance = jobsToDisplay.length * cardWidthWithGap;
  const animationDuration = jobsToDisplay.length * 8;

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
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Briefcase className="h-5 w-5" />
              <p>No job openings for &quot;Latest Jobs&quot; at the moment. Please check back later!</p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }
  
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
            style={{ [sparkle.top ? 'top' : 'bottom']: sparkle.top || sparkle.bottom, [sparkle.left ? 'left' : 'right']: sparkle.left || sparkle.right }}
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
          className="text-center mb-8" // Reduced bottom margin
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

        {/* Conditional Content for Nearest Tab */}
        {isTabActive('nearest') && (
          <div className="mb-8 text-center">
            {isLoadingNearest && (
              <div className="flex items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Finding jobs near you...</span>
              </div>
            )}
            {locationError && !isLoadingNearest && (
              <div className="flex items-center justify-center text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertTriangle className="mr-2 h-5 w-5" />
                <span>{locationError}</span>
              </div>
            )}
            {!isLoadingNearest && !locationError && nearestJobs.length === 0 && userCoordinates && (
               <div className="flex items-center justify-center text-muted-foreground">
                <MapPin className="mr-2 h-5 w-5" />
                <span>No jobs found within 50km of your location. Try expanding your search!</span>
              </div>
            )}
          </div>
        )}

        {/* Infinite Scrolling Carousel - Render only if jobs exist for the tab or latest jobs are loading */}
        {(jobsToDisplay.length > 0 || (isTabActive('latest') && latestJobs.length > 0)) && !locationError && (
          <div className="relative">
            <div 
              className="overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <motion.div
                key={activeTab} 
                className="flex" 
                animate={{
                  x: isHovered || jobsToDisplay.length <=1 ? 0 : `-${animationDistance}px`,
                }}
                transition={{
                  duration: isHovered || jobsToDisplay.length <=1 ? 0.5 : animationDuration,
                  ease: "linear",
                  repeat: isHovered || jobsToDisplay.length <=1 ? 0 : Infinity,
                  repeatType: "loop",
                }}
                style={{
                  width: `${duplicatedJobs.length * cardWidthWithGap}px`,
                }}
              >
                {duplicatedJobs.map((job, index) => (
                  <FeaturedJobCard
                    key={`${job.id}-${activeTab}-${Math.floor(index / jobsToDisplay.length)}`}
                    job={job}
                    index={index % jobsToDisplay.length} 
                  />
                ))}
              </motion.div>
            </div>

            {/* Gradient overlays for fade effect */}
            {jobsToDisplay.length > 1 && ( // Show gradients only if there's scrolling
                <>
                <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-background to-transparent dark:from-background dark:to-transparent pointer-events-none z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-background to-transparent dark:from-background dark:to-transparent pointer-events-none z-10"></div>
                </>
            )}
          </div>
        )}
        
        {jobsToDisplay.length > 1 && ( // Show hover instruction only if scrollable
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

        {/* Call to action for exploring ALL jobs - can link to your main jobs page */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button 
            asChild 
            size="lg"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-primary-foreground px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
       
          </Button>
        </motion.div>
      </div>
    </section>
  );
}