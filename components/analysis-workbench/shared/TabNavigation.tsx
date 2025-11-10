'use client'

import { Button } from '@/components/ui/button'

interface Tab {
  id: string
  label: string
  isVisible: boolean
}

interface TabNavigationProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

/**
 * Generic tab navigation component for switching between different content sections
 * Handles tab visibility and active state styling
 */
export function TabNavigation({ tabs, activeTab, onTabChange }: TabNavigationProps) {
  const visibleTabs = tabs.filter(tab => tab.isVisible)
  
  if (visibleTabs.length === 0) return null

  return (
    <div className="flex bg-muted p-1 rounded-lg">
      {visibleTabs.map(tab => (
        <Button
          key={tab.id}
          variant={activeTab === tab.id ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onTabChange(tab.id)}
          className="flex-1 h-8 text-xs"
        >
          {tab.label}
        </Button>
      ))}
    </div>
  )
}