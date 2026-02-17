import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import PrimaryButton from "@/components/PrimaryButton";
import FormField from "@/components/FormField";
import { Heart } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "patient";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (role === "doctor") {
      navigate("/doctor/dashboard");
    } else {
      navigate("/patient/home");
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
                {role === "doctor" ? "Doctor Login" : "Patient Login"}
              </h1>
              <p className="text-muted-foreground">Sign in to your account</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
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
            <PrimaryButton onClick={handleLogin}>Sign In</PrimaryButton>
            <button className="text-center text-[13px] text-muted-foreground transition-colors hover:text-foreground">
              Forgot password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
