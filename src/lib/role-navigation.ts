const defaultRouteByRole: Record<string, string> = {
  USER: "/dashboard/registrations/new",
  ACCOUNTANT: "/dashboard/deposits/new",
  ADMIN: "/dashboard/return-room-tickets",
};

export function getDefaultRouteForRole(role?: string | null) {
  const normalizedRole = role?.toUpperCase() ?? "USER";
  return defaultRouteByRole[normalizedRole] ?? defaultRouteByRole.USER;
}
