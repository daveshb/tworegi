import { NextRequest, NextResponse } from "next/server";
import dbConnection from "@/lib/database";
import User from "@/database/models/users";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, pass } = body;

    await dbConnection();

    const user = await User.findOne({ email, pass }).lean() as { _id: string; email: string; name: string } | null;
    if (!user) {
      return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    const res = NextResponse.json({ message: 'Authenticated', token, user: { name: user.name, email: user.email } }, { status: 200 });
    // Establecer cookie para protecciones del lado del servidor (si se usa middleware)
    res.cookies.set({ name: 'tworegi_token', value: token, httpOnly: true, path: '/', maxAge: 60 * 60 * 24 });

    return res;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}