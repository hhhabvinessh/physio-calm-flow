/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "doctor" | "patient" | null;

interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  role: AppRole;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: AppRole;
  profile: Profile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, phone, role")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setProfile(null);
        setRole(null);
        return;
      }

      const userRole = (data?.role as AppRole) ?? null;
      setProfile({
        id: data.id,
        name: data.name ?? null,
        phone: data.phone ?? null,
        role: userRole,
      });
      setRole(userRole);
    } catch (err) {
      console.error("Fetch profile error:", err);
      setProfile(null);
      setRole(null);
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser) {
        await fetchProfile(authUser.id);
      } else {
        setProfile(null);
        setRole(null);
      }

      setLoading(false);
    });

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        const authUser = session?.user ?? null;
        setUser(authUser);

        if (authUser) {
          fetchProfile(authUser.id);
        } else {
          setProfile(null);
          setRole(null);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error initializing session:", err);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        return { error: error as Error };
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setRole(null);
    setProfile(null);
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        role,
        profile,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
