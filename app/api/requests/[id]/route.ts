import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { isAuthenticated, isAdmin } from "@/lib/auth";
import Request from "@/models/Request";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

// Get a specific request by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return isAuthenticated(req, async (req: NextRequest, user: any) => {
    try {
      const { id } = params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid request ID" },
          { status: 400 }
        );
      }
      
      await connectToDatabase();
      
      const request = await Request.findById(id);
      
      if (!request) {
        return NextResponse.json(
          { success: false, message: "Request not found" },
          { status: 404 }
        );
      }
      
      // Check if user is authorized to view this request
      if (user.role !== 'admin' && request.userId.toString() !== user.id) {
        return NextResponse.json(
          { success: false, message: "Not authorized to view this request" },
          { status: 403 }
        );
      }
      
      return NextResponse.json({
        success: true,
        request
      });
      
    } catch (error) {
      console.error("Error fetching request:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch request" },
        { status: 500 }
      );
    }
  });
}

// Update a request status (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return isAdmin(req, async (req: NextRequest, user: any) => {
    try {
      const { id } = params;
      const { status } = await req.json();
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid request ID" },
          { status: 400 }
        );
      }
      
      if (!status || !['pending', 'in-progress', 'completed', 'rejected'].includes(status)) {
        return NextResponse.json(
          { success: false, message: "Valid status is required" },
          { status: 400 }
        );
      }
      
      await connectToDatabase();
      
      const request = await Request.findById(id);
      
      if (!request) {
        return NextResponse.json(
          { success: false, message: "Request not found" },
          { status: 404 }
        );
      }
      
      // Update request status
      request.status = status;
      await request.save();
      
      // Create notification for the user who made the request
      await Notification.create({
        userId: request.userId,
        requestId: request._id,
        message: `Your service request has been updated to: ${status}`,
        read: false
      });
      
      return NextResponse.json({
        success: true,
        message: "Request status updated successfully",
        request
      });
      
    } catch (error) {
      console.error("Error updating request:", error);
      return NextResponse.json(
        { success: false, message: "Failed to update request" },
        { status: 500 }
      );
    }
  });
}

// Delete a request (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  return isAdmin(req, async (req: NextRequest, user: any) => {
    try {
      const { id } = params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, message: "Invalid request ID" },
          { status: 400 }
        );
      }
      
      await connectToDatabase();
      
      const request = await Request.findByIdAndDelete(id);
      
      if (!request) {
        return NextResponse.json(
          { success: false, message: "Request not found" },
          { status: 404 }
        );
      }
      
      // Delete related notifications
      await Notification.deleteMany({ requestId: id });
      
      return NextResponse.json({
        success: true,
        message: "Request deleted successfully"
      });
      
    } catch (error) {
      console.error("Error deleting request:", error);
      return NextResponse.json(
        { success: false, message: "Failed to delete request" },
        { status: 500 }
      );
    }
  });
}
