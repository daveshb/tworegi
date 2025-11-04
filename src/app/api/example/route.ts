import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Ejemplo de endpoint GET
    console.log(request)
    const data = {
      message: "Hello from API",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: `Internal Server Error ${error}` },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Procesar datos del body aquí
    console.log("Received data:", body)

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