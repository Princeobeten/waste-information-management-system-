import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { isAuthenticated, isAdmin } from "@/lib/auth";
import Request from "@/models/Request";
import Notification from "@/models/Notification";
import User from "@/models/User";
import mongoose from "mongoose";

// Get all requests (Admin access or user's own requests)
export async function GET(req: NextRequest) {
  return isAuthenticated(req, async (req: NextRequest, user: any) => {
    try {
      await connectToDatabase();
      
      const searchParams = req.nextUrl.searchParams;
      const status = searchParams.get('status');
      const includeUserDetails = searchParams.get('includeUserDetails') === 'true';
      
      let query: any = {};
      
      // If not admin, limit to user's own requests
      if (user.role !== 'admin') {
        query.userId = user.id;
      }
      
      // Filter by status if provided
      if (status && ['pending', 'in-progress', 'completed', 'rejected'].includes(status)) {
        query.status = status;
      }
      
      let requests = await Request.find(query).sort({ createdAt: -1 });
      
      // For admin with includeUserDetails, add user information to each request
      if (user.role === 'admin' && includeUserDetails && requests.length > 0) {
        // Get unique user IDs from requests without using spread on Set
        const userIdsSet = new Set<string>();
        requests.forEach(req => userIdsSet.add(req.userId.toString()));
        const userIds = Array.from(userIdsSet);
        
        // Fetch all users in a single query
        const users = await User.find({ _id: { $in: userIds } }, 'name email');
        
        // Create a map for quick lookups
        const userMap = new Map();
        users.forEach(user => userMap.set(user._id.toString(), { name: user.name, email: user.email }));
        
        // Enhance requests with user details
        requests = requests.map(req => {
          const reqObj = req.toObject();
          const userInfo = userMap.get(reqObj.userId.toString()) || {};
          return {
            ...reqObj,
            userName: userInfo.name || 'Unknown User',
            userEmail: userInfo.email || 'No Email'
          };
        });
      }
      
      return NextResponse.json({
        success: true,
        requests
      });
      
    } catch (error) {
      console.error("Error fetching requests:", error);
      return NextResponse.json(
        { success: false, message: "Failed to fetch requests" },
        { status: 500 }
      );
    }
  });
}

// Create a new service request
export async function POST(req: NextRequest) {
  return isAuthenticated(req, async (req: NextRequest, user: any) => {
    try {
      const { serviceType, location, description } = await req.json();
      
      // Validation
      if (!serviceType || !location || !description) {
        return NextResponse.json(
          { success: false, message: "Service type, location, and description are required" },
          { status: 400 }
        );
      }
      
      await connectToDatabase();
      
      // Create new request
      const newRequest = await Request.create({
        userId: user.id,
        serviceType,
        location,
        description,
        status: 'pending'
      });
      
      // Create notification for admin
      await Notification.create({
        userId: user.id,
        requestId: newRequest._id,
        message: `New ${serviceType} service request submitted by ${user.name}`,
        read: false
      });
      
      return NextResponse.json({
        success: true,
        message: "Service request submitted successfully",
        request: newRequest
      }, { status: 201 });
      
    } catch (error) {
      console.error("Error creating request:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create service request" },
        { status: 500 }
      );
    }
  });
}
