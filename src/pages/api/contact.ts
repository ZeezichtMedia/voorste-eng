import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({
          message: 'Missing required fields',
        }),
        { status: 400 }
      );
    }

    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not defined');
      return new Response(
        JSON.stringify({
          message: 'Email service not configured',
        }),
        { status: 500 }
      );
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Contactformulier <onboarding@resend.dev>', // Resend default for unverified domains
        to: 'info@boerderijvoorste-eng.nl',
        subject: `Nieuw contactformulier bericht van ${name}`,
        reply_to: email,
        html: `
          <h3>Nieuw bericht van de website</h3>
          <p><strong>Naam:</strong> ${name}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Bericht:</strong></p>
          <p>${message}</p>
        `,
      }),
    });

    if (response.ok) {
      return new Response(
        JSON.stringify({
          message: 'Success!',
        }),
        { status: 200 }
      );
    } else {
      const data = await response.json();
      console.error('Resend error:', data);
      return new Response(
        JSON.stringify({
          message: 'Error sending email',
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({
        message: 'Internal server error',
      }),
      { status: 500 }
    );
  }
};
