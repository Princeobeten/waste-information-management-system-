import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  return isAuthenticated(req, async (req: NextRequest, user: any) => {
    try {
      await connectToDatabase();
      
      // Get user details from database (to get the most up-to-date info)
      const dbUser = await User.findById(user.id).select("-passwordHash");
      
      if (!dbUser) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        user: {
          id: dbUser._id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role,
        },
      });
      
    } catch (error) {
      console.error("Error fetching user:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch user details" },
        { status: 500 }
      );
    }
  });
}

// Update user profile
export async function PUT(req: NextRequest) {
  return isAuthenticated(req, async (req: NextRequest, user: any) => {
    try {
      const { name } = await req.json();
      
      // Validate
      if (!name || name.trim() === '') {
        return NextResponse.json(
          { success: false, message: "Name cannot be empty" },
          { status: 400 }
        );
      }
      
      await connectToDatabase();
      
      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        user.id,
        { name },
        { new: true }
      ).select("-passwordHash");
      
      if (!updatedUser) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        }
      });
      
    } catch (error) {
      console.error("Error updating user profile:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update profile" },
        { status: 500 }
      );
    }
  });
}
