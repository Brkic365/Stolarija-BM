import { withAuth } from "next-auth/middleware";
export default withAuth;

export const config = {
  // The owner-only slat-wall tool lives under /admin/lamele and uses the same login.
  matcher: ["/admin", "/admin/lamele/:path*"],
};
