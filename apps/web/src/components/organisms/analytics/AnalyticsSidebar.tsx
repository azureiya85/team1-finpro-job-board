'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import cn from 'classnames';

const items = [
  { label: 'Salary Trends', path: 'salary' },
  { label: 'Demographics', path: 'demographics' },
  { label: 'Interests', path: 'interests' },
  { label: 'Location', path: 'location' },
  { label: 'Applications', path: 'applications' },
];

export default function AnalyticsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full sm:w-80 bg-white dark:bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-4">Analytics Menu</h2>
      <nav className="mb-6 space-y-2">
        {items.map((item) => {
          const isActive = pathname.includes(`/analytics/${item.path}`);
          return (
            <Link
              key={item.path}
              href={`/analytics/${item.path}`}
              className={cn(
                'block px-4 py-2 rounded-md text-sm font-medium',
                isActive
                  ? 'bg-green-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
