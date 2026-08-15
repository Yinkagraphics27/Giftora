import { AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface VendorStatusBannerProps {
  status: string;
}

export function VendorStatusBanner({ status }: VendorStatusBannerProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      title: "Application Pending Review",
      description: "Your vendor application is being reviewed. This typically takes 24-48 hours. You'll be notified once approved.",
      bgClass: "bg-amber-50 dark:bg-amber-950/30",
      borderClass: "border-amber-200 dark:border-amber-800",
      iconClass: "text-amber-500",
      titleClass: "text-amber-800 dark:text-amber-200",
      descClass: "text-amber-700 dark:text-amber-300",
    },
    approved: {
      icon: CheckCircle2,
      title: "Account Approved",
      description: "Your vendor account is approved! Activate your subscription to start publishing products and receiving leads.",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/30",
      borderClass: "border-emerald-200 dark:border-emerald-800",
      iconClass: "text-emerald-500",
      titleClass: "text-emerald-800 dark:text-emerald-200",
      descClass: "text-emerald-700 dark:text-emerald-300",
    },
    suspended: {
      icon: XCircle,
      title: "Account Suspended",
      description: "Your account has been suspended. Please contact support for more information.",
      bgClass: "bg-red-50 dark:bg-red-950/30",
      borderClass: "border-red-200 dark:border-red-800",
      iconClass: "text-red-500",
      titleClass: "text-red-800 dark:text-red-200",
      descClass: "text-red-700 dark:text-red-300",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 ${config.bgClass} ${config.borderClass}`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${config.iconClass}`} />
        <div>
          <h3 className={`font-semibold ${config.titleClass}`}>{config.title}</h3>
          <p className={`mt-1 text-sm ${config.descClass}`}>{config.description}</p>
        </div>
      </div>
    </motion.div>
  );
}
