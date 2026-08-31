"use client";

import { AuthProvider } from "@/lib/auth-context";
import { ProfileProvider } from "@/lib/profile-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProfileProvider>{children}</ProfileProvider>
    </AuthProvider>
  );
}
