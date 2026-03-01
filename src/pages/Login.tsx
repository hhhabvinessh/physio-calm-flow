import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import PrimaryButton from "@/components/PrimaryButton";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const { signInWithGoogle } = useAuth();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);

    setLoading(true);
    const { error } = await signInWithGoogle();

    if (error) {
      setLoading(false);
      const msg = error.message || "Google sign-in failed. Please try again.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container flex min-h-screen flex-col">
        <PageHeader title="" showBack />

        <div className="flex flex-1 flex-col justify-center gap-6 pb-12">
          {/* Header */}
          <div className="flex flex-col items-center gap-3">
            <div className="text-center">
              <h1 className="mb-2 text-3xl font-bold">Welcome back 💚</h1>
              <p className="text-muted-foreground text-sm">
                Continue securely with your Google account
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <PrimaryButton onClick={handleGoogleSignIn} disabled={loading} className="h-12 gap-2">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#4285F4]">
                G
              </span>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Redirecting..." : "Continue with Google"}
            </PrimaryButton>

            {errorMessage && (
              <div className="flex items-center justify-center gap-1 text-xs text-red-500">
                <AlertCircle size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
              You’ll be redirected to Google to complete sign-in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
