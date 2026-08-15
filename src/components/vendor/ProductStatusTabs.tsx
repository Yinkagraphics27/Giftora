import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import type { ProductStatus } from "@/hooks/useSubscriptionLogic";

interface ProductStatusTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: {
    active: number;
    inactive: number;
    draft: number;
    pending_review: number;
    declined: number;
    closed: number;
    total: number;
  };
}

const tabs: { value: string; label: string; color: string }[] = [
  { value: "all", label: "All", color: "bg-muted text-muted-foreground" },
  { value: "active", label: "Active", color: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" },
  { value: "inactive", label: "Inactive", color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" },
  { value: "draft", label: "Draft", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" },
  { value: "pending_review", label: "Pending", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" },
  { value: "declined", label: "Declined", color: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" },
  { value: "closed", label: "Closed", color: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" },
];

export function ProductStatusTabs({ activeTab, onTabChange, counts }: ProductStatusTabsProps) {
  const getCount = (tab: string) => {
    if (tab === "all") return counts.total;
    return counts[tab as keyof typeof counts] || 0;
  };

  // Only show tabs with products (or "all" and "active" always)
  const visibleTabs = tabs.filter(tab => 
    tab.value === "all" || 
    tab.value === "active" || 
    getCount(tab.value) > 0
  );

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full flex-wrap h-auto gap-1 bg-transparent p-0">
        {visibleTabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-3 py-1.5 text-sm"
          >
            {tab.label}
            <Badge variant="secondary" className={`ml-1.5 h-5 min-w-[20px] px-1.5 text-xs ${tab.color}`}>
              {getCount(tab.value)}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export function getStatusBadgeProps(status: ProductStatus | string): { label: string; className: string } {
  switch (status) {
    case "active":
      return { label: "Active", className: "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300" };
    case "inactive":
      return { label: "Inactive", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
    case "draft":
      return { label: "Draft", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300" };
    case "pending_review":
      return { label: "Under Review", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300" };
    case "declined":
      return { label: "Declined", className: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300" };
    case "closed":
      return { label: "Closed", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" };
    default:
      return { label: status, className: "bg-muted text-muted-foreground" };
  }
}
