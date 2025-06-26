'use client';

import Link from 'next/link';
import { 
  LogIn, ArrowRight, Share2, Linkedin, Facebook, Twitter, MessageCircle 
} from 'lucide-react';
import type { JobPostingInStore } from '@/types';
import { useAuthStore } from '@/stores/authStores';
import { useCVModalStore } from '@/stores/CVModalStores';
import { generateShareLinks } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface CompanyJobCardActionsProps {
  job: JobPostingInStore;
}

export default function CompanyJobCardActions({ job }: CompanyJobCardActionsProps) {
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useCVModalStore();

  const shareLinks = generateShareLinks(job.id, job.title);

  const handleApplyClick = () => {
    if (isAuthenticated) {
      openModal(job);
    }
  };

  if (!shareLinks) {
    return null; // Server-side rendering fallback
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-12 w-12" aria-label="Share job posting">
            <Share2 className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Share via</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
              <Linkedin className="mr-2 h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
              <Facebook className="mr-2 h-4 w-4" />
              <span>Facebook</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
              <Twitter className="mr-2 h-4 w-4" />
              <span>Twitter</span>
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="cursor-pointer">
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>WhatsApp</span>
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isAuthenticated ? (
        <Button
          onClick={handleApplyClick}
          className="shrink-0 group/btn h-12"
          size="lg"
        >
          Apply Now
          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
        </Button>
      ) : (
        <Button asChild variant="secondary" size="lg" className="shrink-0 group/btn h-12">
          <Link href="/auth/login">
            <LogIn className="mr-2 h-4 w-4 group-hover/btn:scale-110 transition-transform duration-300" />
            Sign In To Apply
          </Link>
        </Button>
      )}
    </div>
  );
}