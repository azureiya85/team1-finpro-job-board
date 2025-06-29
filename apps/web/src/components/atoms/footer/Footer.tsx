import Link from 'next/link';
import { Cog } from 'lucide-react';
import { motion } from 'framer-motion';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="max-w-full bg-primary-600 text-gray-100">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          
          {/* Left Side: Logo and Company Name */}
          <motion.div whileHover={{ scale: 1.05 }} className="mb-4 sm:mb-0">
            <Link href="/" className="flex items-center space-x-3 text-white font-semibold text-lg group">
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-accent transition-colors">
                <Cog className="h-5 w-5 text-white" />
              </div>
              <span>Work Vault</span>
            </Link>
          </motion.div>

          {/* Right Side: Links and Copyright */}
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 text-sm">
            <p className="text-center sm:text-left">
              © {currentYear} Work Vault. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <motion.div whileHover={{ y: -2 }}>
                <Link href="/about" className="hover:text-accent hover:underline cursr-pointer transition-colors">
                  About Us
                </Link>
              </motion.div>
              <motion.div whileHover={{ y: -2 }}>
                <Link href="/privacy-policy" className="hover:text-accent hover:underline cursr-pointer transition-colors">
                  Privacy Policy
                </Link>
              </motion.div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}