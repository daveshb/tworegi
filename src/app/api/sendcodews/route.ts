import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Respuesta de prueba
    return NextResponse.json(
      {
        success: true,
        message: 'Prueba exitosa',
        data: body,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error en sendcodews:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al procesar la solicitud',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 }
    );
  }
}
