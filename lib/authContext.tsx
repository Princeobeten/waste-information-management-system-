import { 
  createContext, 
  useContext, 
  ReactNode, 
  useState, 
  useEffect
} from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (session?.user) {
      setUser(session.user as User);
    } else {
      setUser(null);
    }
  }, [session]);

  const isLoading = status === "loading";
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  const login = async (email: string, password: string) => {
    try {
      console.log("Starting login process");
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      
      console.log("SignIn result:", result);
      
      if (result?.error) {
        console.error("Login error:", result.error);
        throw new Error(result.error);
      }
      
      if (result?.ok) {
        console.log("Login successful, redirecting to dashboard");
        // Force a hard navigation to dashboard instead of client-side routing
        window.location.href = "/dashboard";
      } else {
        console.error("Login failed with no error message");
        throw new Error("Authentication failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log("Starting registration process");
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();
      console.log("Registration response:", data);
      
      if (!response.ok) {
        console.error("Registration API error:", data);
        throw new Error(data.message || "Registration failed");
      }
      
      console.log("Registration successful, proceeding to auto-login");
      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const value = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
