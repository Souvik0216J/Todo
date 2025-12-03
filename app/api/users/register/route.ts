import { connect } from '@/dbConfig/dbConfig'
import User from '@/models/userModel'
import { NextRequest, NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'

export async function POST(request: NextRequest) {
    await connect() // wait for connection
    try {
        const reqBody = await request.json()
        const { name, email, password } = reqBody

        // cheak if user already exists
        const user = await User.findOne({ email })
        if (user) {
            return NextResponse.json({ error: "User already exists" },
                { status: 400 })
        }

        //hash password
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)

        // Create timestamp in IST format
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

        const istTime = date.toLocaleString('en-IN', options);
        const lastLogin = "null"
        
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            createdAt: istTime,
            lastLogin: lastLogin,
        })

        const savedUser = await newUser.save()
        
        return NextResponse.json({
            message: "User created",
            success: true,
            savedUser
        }, { status: 201 })


    } catch (error: any) {
        return NextResponse.json({ error: error.message })
    }
}