/**
 * Auth utilities and role-based access control.
 * User types: fellow, studio, admin, stakeholder (stakeholder kept for DB compat)
 */

export type UserRole = "fellow" | "studio" | "admin" | "stakeholder";

/** Roles that can access Studio OS (/studio) */
export const STUDIO_ROLES: UserRole[] = ["admin", "studio"];

/** Roles that can access Admin (/admin) */
export const ADMIN_ROLES: UserRole[] = ["admin"];

export function isStudioOrAdmin(role: string | null): boolean {
  return role === "admin" || role === "studio";
}

export function isAdmin(role: string | null): boolean {
  return role === "admin";
}

/** Default redirect path after login by role */
export function getDefaultRedirect(role: string | null): string {
  if (role === "admin" || role === "studio") return "/studio";
  return "/dashboard";
}
