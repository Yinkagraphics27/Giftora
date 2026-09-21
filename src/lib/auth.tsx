import { supabase } from "@/integrations/supabase/client";

export type UserRole = "admin" | "vendor" | "user";

/**
 * Fetches the user's role from the user_roles table.
 * Falls back to "user" (buyer) if no role is assigned.
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[auth] Error fetching role:", error);
      return "user";
    }

    if (!data?.role) return "user";

    return data.role as UserRole;
  } catch (err) {
    console.error("[auth] Unexpected error fetching role:", err);
    return "user";
  }
}

/**
 * Returns the correct landing route for a given role.
 */
export function getRoleLandingPath(role: UserRole): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "vendor":
      return "/dashboard";
    case "user":
    default:
      return "/my-orders";
  }
}

/**
 * Human-readable label for a role.
 */
export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "vendor":
      return "Vendor";
    case "user":
    default:
      return "Buyer";
  }
}