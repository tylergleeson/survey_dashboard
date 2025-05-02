"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the token and type from URL parameters
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const next = searchParams.get('next') || '/dashboard';

        if (token_hash && type) {
          // First verify the email
          const { error: verifyError } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
          });

          if (verifyError) throw verifyError;

          // After verification, get the session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) throw sessionError;

          if (session) {
            // Successfully verified and logged in
            router.push(next);
          } else {
            // If no session, try to refresh
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) throw refreshError;
            
            // Check session again after refresh
            const { data: { session: refreshedSession } } = await supabase.auth.getSession();
            if (refreshedSession) {
              router.push(next);
            } else {
              throw new Error("Could not establish session after verification");
            }
          }
        } else {
          throw new Error("Missing confirmation parameters");
        }
      } catch (error: any) {
        console.error('Error confirming email:', error);
        setError(error.message || "An error occurred during email confirmation");
        // Wait a bit before redirecting to login on error
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleEmailConfirmation();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>
            {error ? "Confirmation Failed" : "Confirming your email"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="space-y-4">
              <p className="text-red-500">
                {error}
              </p>
              <p className="text-gray-500">
                Redirecting you to login...
              </p>
            </div>
          ) : (
            <p className="text-gray-500">
              Please wait while we confirm your email address...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 