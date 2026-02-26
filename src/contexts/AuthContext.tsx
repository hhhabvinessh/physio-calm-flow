import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "doctor" | "patient" | null;

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole;
  loading: boolean;
  refreshRole: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .single();
      setRole((data?.role as AppRole) ?? null);
    } catch {
      setRole(null);
    }
  }, []);

  useEffect(() => {
    let initialised = false;

    // Set up auth listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Defer to avoid Supabase lock contention
          setTimeout(() => fetchRole(session.user.id), 0);
        } else {
          setRole(null);
        }
        initialised = true;
        setLoading(false);
      }
    );

    // Then check existing session with error handling
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        // Only update if onAuthStateChange hasn't fired yet
        if (!initialised) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchRole(session.user.id);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        // Session fetch failed (e.g. corrupt token) — clear state and stop loading
        if (!initialised) {
          setSession(null);
          setUser(null);
          setRole(null);
          setLoading(false);
        }
      });

    // Safety timeout: if nothing resolves in 5s, stop loading anyway
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth initialisation timed out — clearing session");
        setSession(null);
        setUser(null);
        setRole(null);
        setLoading(false);
        // Clear potentially corrupt tokens
        supabase.auth.signOut().catch(() => {});
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [fetchRole]);

  const refreshRole = useCallback(async () => {
    if (user) await fetchRole(user.id);
  }, [user, fetchRole]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, user, role, loading, refreshRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
