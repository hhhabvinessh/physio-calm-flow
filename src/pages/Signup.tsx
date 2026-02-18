import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import PrimaryButton from "@/components/PrimaryButton";
import FormField from "@/components/FormField";
import { Heart } from "lucide-react";
import { toast } from "sonner";

const Signup = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const role = (searchParams.get("role") as "doctor" | "patient") || "patient";
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName, role);
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Check your email to verify, then sign in.");
      navigate(`/login?role=${role}`);
    }
  };

  return (
    <div className="min-h-screen bg-background page-transition">
      <div className="app-container flex min-h-screen flex-col">
        <PageHeader title="" showBack />

        <div className="flex flex-1 flex-col justify-center gap-8 pb-12">
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Heart className="text-primary" size={24} />
            </div>
            <div className="text-center">
              <h1 className="mb-1">
                {role === "doctor" ? "Doctor Sign Up" : "Patient Sign Up"}
              </h1>
              <p className="text-muted-foreground">Create your account</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <FormField
              label="Full Name"
              id="fullName"
              placeholder="Dr. Jane Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
            <FormField
              label="Email"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <FormField
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            <PrimaryButton onClick={handleSignup} disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </PrimaryButton>
            <button
              onClick={() => navigate(`/login?role=${role}`)}
              className="text-center text-[13px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
