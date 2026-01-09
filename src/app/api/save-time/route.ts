export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/mangodb";
import Log from "@/models/Log";

export async function POST(req: Request) {
    try {
        const authObject = await auth();
        const userId = authObject.userId;

        if (!userId) {
            return NextResponse.json({ error: "ログインしてください" }, { status: 401 });
        }

        await dbConnect();

        const { duration } = await req.json();

        const newLog = await Log.create({
            userId: userId,
            duration: duration,
        });

        return NextResponse.json({ success: true, data: newLog });
    } catch (error: any) {
        console.error("MangoDB Save Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}