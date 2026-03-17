import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

const translations = {
  nl: {
    subject: 'Bevestiging van uw bericht - Boerderij Voorste Eng',
    title: 'Bedankt voor uw bericht',
    greeting: 'Beste',
    body: 'We hebben uw bericht in goede orde ontvangen. We streven ernaar om zo snel mogelijk, maar uiterlijk binnen 2 werkdagen, contact met u op te nemen.',
    details: 'Hieronder vindt u een kopie van uw bericht:',
    footer: 'Met vriendelijke groet,<br>Boerderij Voorste Eng',
  },
  en: {
    subject: 'Confirmation of your message - Boerderij Voorste Eng',
    title: 'Thank you for your message',
    greeting: 'Dear',
    body: 'We have received your message in good order. We aim to contact you as soon as possible, but at the latest within 2 working days.',
    details: 'Below you will find a copy of your message:',
    footer: 'Kind regards,<br>Boerderij Voorste Eng',
  },
  de: {
    subject: 'Bestätigung Ihrer Nachricht - Boerderij Voorste Eng',
    title: 'Vielen Dank für Ihre Nachricht',
    greeting: 'Liebe(r)',
    body: 'Wir haben Ihre Nachricht in gutem Zustand erhalten. Wir bemühen uns, Sie so schnell wie möglich, spätestens jedoch innerhalb von 2 Werktagen zu kontaktieren.',
    details: 'Unten finden Sie eine Kopie Ihrer Nachricht:',
    footer: 'Mit freundlichen Grüßen,<br>Boerderij Voorste Eng',
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const message = formData.get('message') as string;
    const language = (formData.get('language') as string) || 'nl';

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

    const t = translations[language as keyof typeof translations] || translations.nl;

    // 1. Send Admin Notification Email (Always Dutch)
    await transporter.sendMail({
      from: `"Website Contact Form" <${SMTP_USER}>`, 
      to: 'info@boerderijvoorste-eng.nl', // Admin Receiver
      subject: `Nieuw contactformulier bericht van ${name} (${language.toUpperCase()})`,
      replyTo: email,
      text: `Nieuw bericht van de website\n\nTaal: ${language.toUpperCase()}\nNaam: ${name}\nE-mail: ${email}\nBericht:\n${message}`,
      html: `
        <h3>Nieuw bericht van de website</h3>
        <p><strong>Taal website:</strong> ${language.toUpperCase()}</p>
        <p><strong>Naam:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Bericht:</strong></p>
        <p>${message}</p>
      `,
    });

    // 2. Send Client Confirmation Email (Localized based on their selected language)
    await transporter.sendMail({
      from: `"Boerderij Voorste Eng" <${SMTP_USER}>`, 
      to: email, // Client Receiver
      subject: t.subject,
      replyTo: 'info@boerderijvoorste-eng.nl',
      text: `${t.title}\n\n${t.greeting} ${name},\n\n${t.body}\n\n${t.details}\n${message}\n\n${t.footer.replace('<br>', '\n')}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <h2>${t.title}</h2>
          <p>${t.greeting} ${name},</p>
          <p>${t.body}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>${t.details}</strong></p>
          <blockquote style="margin: 0; padding: 10px 20px; background-color: #f9f9f9; border-left: 4px solid #732A29;">
            ${message.replace(/\n/g, '<br>')}
          </blockquote>
          <br>
          <p>${t.footer}</p>
        </div>
      `,
    });

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
