import { Navigate, useSearchParams } from "react-router-dom";

// Signup is no longer needed — redirect to login with Google
const Signup = () => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "patient";
  return <Navigate to={`/login?role=${role}`} replace />;
};

export default Signup;
