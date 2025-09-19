import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { isAdmin } from "@/lib/auth";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

// Get a specific user by ID (Admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return isAdmin(req, async (req: NextRequest, user: any) => {
    try {
      const { id } = params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid user ID" },
          { status: 400 }
        );
      }
      
      await connectToDatabase();
      
      // Exclude password hash from the returned data
      const targetUser = await User.findById(id).select("-passwordHash");
      
      if (!targetUser) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        user: targetUser
      });
      
    } catch (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch user" },
        { status: 500 }
      );
    }
  });
}

// Update a user (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return isAdmin(req, async (req: NextRequest, user: any) => {
    try {
      const { id } = params;
      const { name, email, password, role } = await req.json();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid user ID" },
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
      
      const targetUser = await User.findById(id);
      
      if (!targetUser) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }
      
      // If email is changed, check if it's already in use
      if (email && email !== targetUser.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return NextResponse.json(
            { success: false, message: "Email already in use" },
            { status: 400 }
          );
        }
        targetUser.email = email;
      }
      
      // Update fields if provided
      if (name) targetUser.name = name;
      if (role) targetUser.role = role;
      
      // Update password if provided
      if (password) {
        if (password.length < 6) {
          return NextResponse.json(
            { success: false, message: "Password must be at least 6 characters" },
            { status: 400 }
          );
        }
        const salt = await bcrypt.genSalt(10);
        targetUser.passwordHash = await bcrypt.hash(password, salt);
      }
      
      await targetUser.save();
      
      return NextResponse.json({
        success: true,
        message: "User updated successfully",
        user: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
        }
      });
      
    } catch (error) {
      console.error("Error updating user:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update user" },
        { status: 500 }
      );
    }
  });
}

// Delete a user (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return isAdmin(req, async (req: NextRequest, user: any) => {
    try {
      const { id } = params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid user ID" },
          { status: 400 }
        );
      }
      
      // Prevent admin from deleting themselves
      if (id === user.id) {
        return NextResponse.json(
          { success: false, message: "You cannot delete your own account" },
          { status: 400 }
        );
      }
      
      await connectToDatabase();
      
      const deletedUser = await User.findByIdAndDelete(id);
      
      if (!deletedUser) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: "User deleted successfully"
      });
      
    } catch (error) {
      console.error("Error deleting user:", error);
      return NextResponse.json(
        { success: false, message: "Failed to delete user" },
        { status: 500 }
      );
    }
  });
}
