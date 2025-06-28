'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const TabsContext = React.createContext<{
  selectedTab: string
  setSelectedTab: (value: string) => void
} | null>(null)

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string 
  value?: string 
  onValueChange?: (value: string) => void 
  children: React.ReactNode
}

export function Tabs({
  defaultValue,
  value,
  onValueChange,
  children,
  className,
  ...props
}: TabsProps) {
  // Use internal state for uncontrolled mode
  const [internalSelectedTab, setInternalSelectedTab] = React.useState(defaultValue || '');

  // Determine if the component is controlled
  const isControlled = value !== undefined;

  // The currently active tab is either the controlled `value` or the internal state
  const selectedTab = isControlled ? value : internalSelectedTab;

  // The function to change the tab
  const handleTabChange = (newValue: string) => {
    if (!isControlled) {
      setInternalSelectedTab(newValue);
    }
    // Always call the onValueChange callback if it's provided
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ selectedTab: selectedTab, setSelectedTab: handleTabChange }}>
      <div className={cn('space-y-4', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function TabsTrigger({ value, children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')

  const { selectedTab, setSelectedTab } = context

  return (
    <button
      onClick={() => setSelectedTab(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        selectedTab === value && 'bg-background text-foreground shadow',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function TabsContent({ value, children, className, ...props }: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')

  const { selectedTab } = context

  return selectedTab === value ? (
    <div
      className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}
      {...props}
    >
      {children}
    </div>
  ) : null;
}