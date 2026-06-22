import { useRouter } from "next/navigation";
import { useAuth } from "../lib/authContext";
import { useEffect } from "react";

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (allowedRoles && !allowedRoles?.includes(user.role)) {
      router.push("/unauthorized");
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
};
