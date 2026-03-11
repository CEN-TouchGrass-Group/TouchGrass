import { NextResponse } from "next/server";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const { username, password } = await request.json();

    const db = mongoose.connection.db!;
    const user = await db.collection("login").findOne({ username, password });

    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}