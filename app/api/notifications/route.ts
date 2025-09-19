import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { isAuthenticated } from "@/lib/auth";
import Notification from "@/models/Notification";

// Get notifications for the current user
export async function GET(req: NextRequest) {
  return isAuthenticated(req, async (req: NextRequest, user: any) => {
    try {
      await connectToDatabase();
      
      // Get read status from query params
      const read = req.nextUrl.searchParams.get('read');
      const query: any = { userId: user.id };
      
      // Filter by read status if provided
      if (read === 'true') {
        query.read = true;
      } else if (read === 'false') {
        query.read = false;
      }
      
      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(50);
      
      return NextResponse.json({
        success: true,
        notifications
      });
      
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch notifications" },
        { status: 500 }
      );
    }
  });
}

// Mark notifications as read
export async function PUT(req: NextRequest) {
  return isAuthenticated(req, async (req: NextRequest, user: any) => {
    try {
      const { notificationIds } = await req.json();
      
      if (!notificationIds || !Array.isArray(notificationIds)) {
        return NextResponse.json(
          { success: false, message: "Notification IDs are required" },
          { status: 400 }
        );
      }
      
      await connectToDatabase();
      
      // Update notifications, ensuring they belong to the current user
      const result = await Notification.updateMany(
        { 
          _id: { $in: notificationIds },
          userId: user.id
        },
        { $set: { read: true } }
      );
      
      return NextResponse.json({
        success: true,
        message: `${result.modifiedCount} notifications marked as read`,
        modifiedCount: result.modifiedCount
      });
      
    } catch (error) {
      console.error("Error updating notifications:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update notifications" },
        { status: 500 }
      );
    }
  });
}
