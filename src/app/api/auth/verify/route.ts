import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: {
        uid: user.uid,
        email: user.email,
        name: user.name || user.display_name,
        email_verified: user.email_verified
      }
    });
  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}