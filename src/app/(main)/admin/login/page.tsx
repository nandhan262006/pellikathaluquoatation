"use client";

import { useState } from "react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const result = await signIn("credentials", {
        password: form.get("password"),
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid password");
        setLoading(false);
      } else {
        router.push("/admin");
      }
    } catch {
      toast.error("Sign-in failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-muted/30">
      <div className="w-full max-w-sm mx-auto px-4">
        <div className="border rounded-lg bg-background p-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.webp"
              alt="Pellikathalu"
              width={378}
              height={60}
              loading="eager"
              className="h-14 w-auto"
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter admin password"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
