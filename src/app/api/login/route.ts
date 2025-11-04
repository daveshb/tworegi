import { NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Procesar datos del body aquí
    console.log("Received data:", body)

    const {email, pass} = body

    console.log(email, pass);

    return NextResponse.json(
      { message: "Data received successfully", data: body },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: `Bad Request ${error}` },
      { status: 400 }
    )
  }
}