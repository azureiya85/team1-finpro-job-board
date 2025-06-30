'use client'

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDown, Users, Briefcase, TrendingUp } from 'lucide-react';
import Image from 'next/image';

export function HeroSection() {
  const scrollToJobs = () => {
    window.scrollBy({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="mt-16 md:mt-12 relative min-h-[50vh] bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-primary-foreground overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10 min-h-[50vh] flex items-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
          
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex mt-4 items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full text-sm font-medium"
            >
              <TrendingUp className="h-4 w-4" />
              #1 Job Portal in Indonesia
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight"
            >
              Discover A Vault Full Of{' '}
              <span className="text-amber-200 font-black border-b-4 border-amber-200 pb-1">
                Career
              </span>{' '}
              Opportunities
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-lg md:text-xl text-primary-foreground/90 font-body leading-relaxed max-w-xl mx-auto lg:mx-0"
            >
              Join hundreds of partners and thousands of satisfied job seekers. 
              <span className="font-semibold text-white"> Level up your career today.</span>
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap justify-center lg:justify-start gap-8 text-center"
            >
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xl font-bold">10K+</div>
                  <div className="text-sm text-primary-foreground/70">Job Seekers</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/10 rounded-lg">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xl font-bold">500+</div>
                  <div className="text-sm text-primary-foreground/70">Companies</div>
                </div>
              </div>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="pt-2"
            >
              <Button
                size="lg"
                onClick={scrollToJobs}
                className="bg-white text-primary hover:bg-white/90 font-semibold px-8 py-4 text-base rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                Explore Opportunities
                <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-0.5 transition-transform duration-200" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Right Column - Images */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative h-[300px] md:h-[400px] lg:h-[450px]"
          >
            {/* Background decorative boxes - hidden on mobile */}
            <div className="absolute inset-0 hidden md:block">
              <div className="absolute top-8 left-4 w-24 h-24 bg-white/8 backdrop-blur-sm rounded-xl border border-white/10" />
              <div className="absolute bottom-12 right-8 w-20 h-32 bg-white/8 backdrop-blur-sm rounded-xl border border-white/10" />
              <div className="absolute top-20 right-2 w-20 h-20 bg-white/8 backdrop-blur-sm rounded-full border border-white/10" />
            </div>

            {/* Image Cards - Responsive */}
            {/* Large 16:9 Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="absolute top-2 left-2 w-56 h-36 md:top-4 md:left-4 md:w-80 md:h-52 bg-white rounded-xl shadow-xl overflow-hidden border-2 border-white z-10 hover:shadow-2xl transition-shadow duration-300"
            >
              <Image
                src="https://i.pinimg.com/1200x/01/49/bf/0149bf3f43afa7d258ec377eb1cc72c1.jpg"
                alt="Professional workplace"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Tall 3:4 Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="absolute top-20 right-4 w-32 h-44 md:top-40 md:right-8 md:w-48 md:h-64 bg-white rounded-xl shadow-xl overflow-hidden border-2 border-white z-10 hover:shadow-2xl transition-shadow duration-300"
            >
              <Image
                src="https://i.pinimg.com/1200x/5c/1a/1c/5c1a1c8ac126433c1c8588f0afaf456d.jpg"
                alt="Career growth"
                fill
                className="object-cover"
              />
            </motion.div>

            {/* Square Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute bottom-4 left-8 w-28 h-28 md:bottom-2 md:left-16 md:w-44 md:h-44 bg-white rounded-xl shadow-xl overflow-hidden border-2 border-white z-10 hover:shadow-2xl transition-shadow duration-300"
            >
              <Image
                src="https://i.pinimg.com/1200x/01/c7/77/01c77745d903f0c95e824be985cd89b8.jpg"
                alt="Team collaboration"
                fill
                className="object-cover"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Simple scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
      >
        <div className="text-white/50 text-center cursor-pointer text-sm" onClick={scrollToJobs}>
          Scroll to explore
        </div>
      </motion.div>
    </section>
  );
}