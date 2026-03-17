import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

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

    const SMTP_HOST = import.meta.env.SMTP_HOST;
    const SMTP_PORT = import.meta.env.SMTP_PORT || "465";
    const SMTP_USER = import.meta.env.SMTP_USER;
    const SMTP_PASS = import.meta.env.SMTP_PASS;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.error('SMTP credentials are not fully defined in Environment Variables.');
      return new Response(
        JSON.stringify({
          message: 'Email service not configured',
        }),
        { status: 500 }
      );
    }

    // Create a Nodemailer transporter using SMTP
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, // true for 465, false for other ports
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Send the email
    const info = await transporter.sendMail({
      from: `"Website Contact Form" <${SMTP_USER}>`, // Sender address must often match the authenticated user
      to: 'info@boerderijvoorste-eng.nl', // Receiver
      subject: `Nieuw contactformulier bericht van ${name}`,
      replyTo: email as string,
      text: `Nieuw bericht van de website\n\nNaam: ${name}\nE-mail: ${email}\nBericht:\n${message}`,
      html: `
        <h3>Nieuw bericht van de website</h3>
        <p><strong>Naam:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Bericht:</strong></p>
        <p>${message}</p>
      `,
    });

    console.log('Message sent: %s', info.messageId);

    return new Response(
      JSON.stringify({
        message: 'Success!',
      }),
      { status: 200 }
    );
    
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
