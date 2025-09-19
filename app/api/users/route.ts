import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Get all users (Admin only)
export async function GET(req: NextRequest) {
  return isAdmin(req, async (req: NextRequest, user: any) => {
    try {
      await connectToDatabase();
      
      // Exclude password hash from the returned data
      const users = await User.find().select("-passwordHash");
      
      return NextResponse.json({
        success: true,
        users
      });
      
    } catch (error) {
      console.error("Error fetching users:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch users" },
        { status: 500 }
      );
    }
  });
}

// Create a new user (Admin only)
export async function POST(req: NextRequest) {
  return isAdmin(req, async (req: NextRequest, user: any) => {
    try {
      const { name, email, password, role } = await req.json();
      
      // Validation
      if (!name || !email || !password) {
        return NextResponse.json(
          { success: false, message: "Name, email and password are required" },
          { status: 400 }
        );
      }
      
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, message: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      
      // Validate role if provided
      if (role && !['user', 'admin'].includes(role)) {
        return NextResponse.json(
          { success: false, message: "Role must be either 'user' or 'admin'" },
          { status: 400 }
        );
      }
      
      await connectToDatabase();
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "Email already in use" },
          { status: 400 }
        );
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      // Create new user
      const newUser = await User.create({
        name,
        email,
        passwordHash,
        role: role || 'user', // Default to 'user' if not specified
      });
      
      return NextResponse.json({
        success: true,
        message: "User created successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        }
      }, { status: 201 });
      
    } catch (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create user" },
        { status: 500 }
      );
    }
  });
}
