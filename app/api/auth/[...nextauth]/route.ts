import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth-options";

// Create the handler using the auth options
const handler = NextAuth(authOptions);

// Export the handler as GET and POST methods
export { handler as GET, handler as POST };
