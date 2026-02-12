/**
 * Auth utilities and role-based access control.
 * User types: fellow, studio, stakeholder
 */

export type UserRole = "fellow" | "studio" | "admin" | "stakeholder";

/** Roles that can access Studio OS (/studio) */
export const STUDIO_ROLES: UserRole[] = ["admin", "studio"];

/** Roles that can access Admin (/admin) */
export const ADMIN_ROLES: UserRole[] = ["admin"];

/** Roles that can access Stakeholder Portfolio (/portfolio) */
export const STAKEHOLDER_ROLES: UserRole[] = ["stakeholder"];

export function isStudioOrAdmin(role: string | null): boolean {
  return role === "admin" || role === "studio";
}

export function isAdmin(role: string | null): boolean {
  return role === "admin";
}

export function isStakeholder(role: string | null): boolean {
  return role === "stakeholder";
}

/** Default redirect path after login by role */
export function getDefaultRedirect(role: string | null): string {
  if (role === "stakeholder") return "/portfolio";
  if (role === "admin" || role === "studio") return "/studio";
  return "/dashboard";
}
