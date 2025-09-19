import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { NextRequest, NextResponse } from "next/server";

export const getSession = async () => {
  return await getServerSession(authOptions);
};

export const getCurrentUser = async () => {
  const session = await getSession();
  return session?.user;
};

// Middleware to check if user is authenticated
export const isAuthenticated = async (req: NextRequest, handler: Function) => {
  const session = await getSession();
  
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }
  
  return handler(req, session.user);
};

// Middleware to check if user is admin
export const isAdmin = async (req: NextRequest, handler: Function) => {
  const session = await getSession();
  
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }
  
  if (session.user.role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Admin access required" },
      { status: 403 }
    );
  }
  
  return handler(req, session.user);
};
