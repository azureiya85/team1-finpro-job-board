'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Briefcase, MapPin, Building, Clock } from 'lucide-react';

export default function Loading() {
  // Skeleton job cards data
  const skeletonCards = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    delay: i * 0.1
  }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Simple Loading Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Jobs
          </h1>
          
          <p className="text-gray-600 dark:text-gray-400">
            Finding the best opportunities for you...
          </p>

          {/* Loading dots */}
          <div className="flex justify-center gap-1 mt-4">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Skeleton Job Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skeletonCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + card.delay, duration: 0.4 }}
            >
              <Card className="h-full">
                <CardContent className="p-6">
                  {/* Company info skeleton */}
                  <div className="flex items-start gap-3 mb-4">
                    <motion.div 
                      className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <div className="flex-1 space-y-2">
                      <motion.div 
                        className="h-5 bg-gray-200 dark:bg-gray-700 rounded"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}
                      />
                      <motion.div 
                        className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                      />
                    </div>
                  </div>

                  {/* Job details skeleton */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <motion.div 
                        className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <motion.div 
                        className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <motion.div 
                        className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <motion.div 
                        className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-14"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Loading tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center mt-8"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Use filters to refine your job search
          </p>
        </motion.div>
      </div>
    </div>
  );
}