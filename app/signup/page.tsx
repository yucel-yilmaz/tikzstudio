import { redirect } from "next/navigation";

import { AuthForm } from "@/features/auth/components/auth-form";
import { getServerSession } from "@/lib/session";

export default async function SignupPage() {
  const session = await getServerSession();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(200,85,61,0.14),transparent_24%),linear-gradient(180deg,rgba(255,250,242,0.92),rgba(244,239,231,0.96))] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center">
      <AuthForm mode="signup" />
      </div>
    </main>
  );
}
