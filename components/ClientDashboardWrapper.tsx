"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientDashboardWrapper({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth");
        if (res.ok) {
          setLoading(false);
        } else {
          router.push("/login_disek");
        }
      } catch (err) {
        router.push("/login_disek");
      }
    };
    checkAuth();
  }, []);

  //if (loading) return <p>Loading...</p>;
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900"><div className="w-12 h-12 border-4 border-blue-500 border-dashed rounded-full animate-spin mx-auto"></div></div>;

  return <>{children}</>;
}