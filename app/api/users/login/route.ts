import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
    try {
        await connect()

        const reqBody = await request.json()
        const { email, password, rememberMe } = reqBody;

        //check if user exists
        const user = await User.findOne({ email: email })

        if (!user) {
            return NextResponse.json({ error: "User does not exist" }, { status: 400 })
        }

        //check if password is correct
        const validPassword = await bcryptjs.compare(password, user.password)
        if (!validPassword) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 })
        }

        //create token data
        const tokenData = {
            id: user._id,
            email: user.email
        }
        //create token
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: rememberMe ? "30d" : "1d" })

        const date = new Date();

        const options: Intl.DateTimeFormatOptions = {
            timeZone: 'Asia/Kolkata',
            hour12: false,
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }

        const loginTime = date.toLocaleString('en-IN', options);

        await User.findByIdAndUpdate(
            user._id,
            { $set: { lastLogin: loginTime } },
            { new: true }
        )

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
        })
        response.cookies.set("token", token, {
            httpOnly: true, maxAge: rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60
        })
        return response;

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}