'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Search, ArrowLeft, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <Card className="text-center">
          <CardContent className="p-8">
            {/* 404 Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-6"
            >
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <FileQuestion className="h-8 w-8 text-gray-400" />
              </div>
            </motion.div>

            {/* Error Message */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6"
            >
              <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
                404
              </h1>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Page Not Found
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild className="flex-1">
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/jobs">
                    <Search className="h-4 w-4 mr-2" />
                    Browse Jobs
                  </Link>
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="w-full text-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </motion.div>

            {/* Help Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Need help? <Link href="/contact" className="text-primary hover:underline">Contact support</Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}