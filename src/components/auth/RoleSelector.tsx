import { ShoppingBag, Store } from "lucide-react";
import { motion } from "framer-motion";

export type PublicRole = "user" | "vendor";

interface RoleSelectorProps {
  value: PublicRole;
  onChange: (role: PublicRole) => void;
}

const OPTIONS: { value: PublicRole; label: string; icon: any }[] = [
  { value: "user", label: "Buyer", icon: ShoppingBag },
  { value: "vendor", label: "Vendor", icon: Store },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div
      role="tablist"
      aria-label="Choose account type"
      className="grid grid-cols-2 gap-1 rounded-xl border border-canvas-200 bg-canvas-100 p-1"
    >
      {OPTIONS.map((option) => {
        const active = value === option.value;
        const Icon = option.icon;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`relative flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              active
                ? "text-navy-900"
                : "text-navy-500 hover:text-navy-700"
            }`}
          >
            {active && (
              <motion.div
                layoutId="roleSelectorPill"
                className="absolute inset-0 rounded-lg bg-gold-500 shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}