import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Update user password
export async function PUT(req: NextRequest) {
  return isAuthenticated(req, async (req: NextRequest, user: any) => {
    try {
      const { currentPassword, newPassword } = await req.json();
      
      // Validate
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: "Current password and new password are required" },
          { status: 400 }
        );
      }
      
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters long" },
          { status: 400 }
        );
      }
      
      await connectToDatabase();
      
      // Get user with password hash
      const dbUser = await User.findById(user.id).select("+passwordHash");
      
      if (!dbUser) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }
      
      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: "Current password is incorrect" },
          { status: 400 }
        );
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);
      
      // Update user with new password
      await User.findByIdAndUpdate(user.id, { passwordHash: newPasswordHash });
      
      return NextResponse.json({
        success: true,
        message: "Password updated successfully"
      });
      
    } catch (error) {
      console.error("Error updating password:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update password" },
        { status: 500 }
      );
    }
  });
}
