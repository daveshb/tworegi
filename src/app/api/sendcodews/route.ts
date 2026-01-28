import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { to, templateName, languageCode, otp } = await request.json();

    if (!to || !otp) {
      return NextResponse.json({ error: 'Missing required fields: to and otp' }, { status: 400 });
    }

    const phoneId = process.env.WHATSAPP_PHONE_ID;
    const token = process.env.WHATSAPP_TOKEN;
    const version = process.env.WHATSAPP_GRAPH_VERSION || 'v24.0';

    if (!phoneId || !token) {
      console.error('[sendcodews] Missing WHATSAPP_PHONE_ID or WHATSAPP_TOKEN env vars');
      return NextResponse.json({ error: 'Server not configured for WhatsApp' }, { status: 500 });
    }

    const graphUrl = `https://graph.facebook.com/${version}/${phoneId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: String(to),
      type: 'template',
      template: {
        name: templateName || process.env.WHATSAPP_TEMPLATE_NAME || 'otp',
        language: {
          code: languageCode || process.env.WHATSAPP_TEMPLATE_LANG || 'es_CO'
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: String(otp)
              }
            ]
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [
              {
                type: 'text',
                text: String(otp)
              }
            ]
          }
        ]
      }
    };

    console.log('[sendcodews] Enviando mensaje de WhatsApp a:', to);

    const res = await fetch(graphUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const resBody = await res.text();

    if (!res.ok) {
      console.error('[sendcodews] Graph API error:', res.status, resBody);
      return NextResponse.json({ error: 'Failed to send message', details: resBody }, { status: res.status });
    }

    console.log('[sendcodews] Mensaje enviado exitosamente');

    return NextResponse.json({ success: true, providerResponse: JSON.parse(resBody) }, { status: 200 });
  } catch (error) {
    console.error('[sendcodews] Error en sendcodews:', error);
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
