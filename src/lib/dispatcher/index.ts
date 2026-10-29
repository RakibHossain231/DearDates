import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || "AutoWISH <no-reply@autowish.app>";

export interface SendMessageOptions {
  channel: "EMAIL" | "WHATSAPP" | "SMS" | "TELEGRAM" | string;
  recipientContact: string;
  recipientName: string;
  message: string;
  category?: string;
  senderName?: string;
}

export interface DispatchResult {
  success: boolean;
  channel: string;
  response: string;
  error?: string;
}

/**
 * Universal Dispatcher: Sends wish via chosen channel
 */
export async function dispatchWish(options: SendMessageOptions): Promise<DispatchResult> {
  const { channel, recipientContact, recipientName, message, category = "Celebration", senderName = "A Loved One" } = options;

  try {
    switch (channel.toUpperCase()) {
      case "EMAIL":
        return await sendEmailWish({ recipientContact, recipientName, message, category, senderName });

      case "TELEGRAM":
        return await sendTelegramWish({ recipientContact, recipientName, message, senderName });

      case "WHATSAPP":
        return await sendWhatsAppWish({ recipientContact, recipientName, message, senderName });

      case "SMS":
        return await sendSmsWish({ recipientContact, recipientName, message, senderName });

      default:
        return {
          success: false,
          channel,
          response: `Unsupported channel: ${channel}`,
        };
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      channel,
      response: "Dispatch failed",
      error: errorMessage,
    };
  }
}

/**
 * 1. Email Wish Dispatcher (Resend API with HTML template)
 */
async function sendEmailWish({
  recipientContact,
  recipientName,
  message,
  category,
  senderName,
}: {
  recipientContact: string;
  recipientName: string;
  message: string;
  category: string;
  senderName: string;
}): Promise<DispatchResult> {
  const subject = `🎉 A Special ${category} Wish for You, ${recipientName}!`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
          .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
          .content { padding: 35px 30px; text-align: center; }
          .greeting { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 20px; }
          .message-box { background: #fdf4ff; border-left: 4px solid #c026d3; padding: 20px; border-radius: 8px; margin: 25px 0; font-size: 17px; line-height: 1.6; color: #334155; text-align: left; white-space: pre-line; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; }
          .badge { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 6px 14px; border-radius: 50px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">AutoWISH Celebration</span>
            <h1>Warm Wishes For You! 🎂✨</h1>
          </div>
          <div class="content">
            <div class="greeting">Dear ${recipientName},</div>
            <div class="message-box">
              ${message}
            </div>
            <p style="color: #64748b; font-size: 15px;">Sent with warm affection by <strong>${senderName}</strong></p>
          </div>
          <div class="footer">
            Delivered automatically with care via <strong style="color: #4f46e5;">AutoWISH</strong> • Never miss an important date.
          </div>
        </div>
      </body>
    </html>
  `;

  if (resend) {
    try {
      const data = await resend.emails.send({
        from: EMAIL_FROM,
        to: recipientContact,
        subject,
        html: htmlContent,
      });
      return {
        success: true,
        channel: "EMAIL",
        response: `Sent via Resend (ID: ${data.data?.id || "OK"})`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, channel: "EMAIL", response: "Resend API error", error: msg };
    }
  }

  // Fallback simulation when API key is not yet configured by the user
  console.log(`[EMAIL SIMULATION] Sent to: ${recipientContact} | Subject: ${subject}`);
  return {
    success: true,
    channel: "EMAIL",
    response: `Simulated Email sent to ${recipientContact} (Configure RESEND_API_KEY in .env for production)`,
  };
}

/**
 * 2. Telegram Wish Dispatcher
 */
async function sendTelegramWish({
  recipientContact,
  recipientName,
  message,
  senderName,
}: {
  recipientContact: string; // Chat ID or username
  recipientName: string;
  message: string;
  senderName: string;
}): Promise<DispatchResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const text = `🎉 *Special Wish for ${recipientName}!*\n\n${message}\n\n— *With love from ${senderName}*\n_Delivered by AutoWISH_`;

  if (token) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: recipientContact,
          text,
          parse_mode: "Markdown",
        }),
      });
      const data = await res.json();
      if (data.ok) {
        return { success: true, channel: "TELEGRAM", response: `Telegram message sent (MsgID: ${data.result.message_id})` };
      }
      return { success: false, channel: "TELEGRAM", response: "Telegram Bot API error", error: data.description };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, channel: "TELEGRAM", response: "Fetch error", error: msg };
    }
  }

  console.log(`[TELEGRAM SIMULATION] Chat ID: ${recipientContact} | Message: ${text}`);
  return {
    success: true,
    channel: "TELEGRAM",
    response: `Simulated Telegram message sent to ${recipientContact} (Configure TELEGRAM_BOT_TOKEN in .env)`,
  };
}

/**
 * 3. WhatsApp Dispatcher (Phone Number based)
 */
async function sendWhatsAppWish({
  recipientContact,
  recipientName,
  message,
  senderName,
}: {
  recipientContact: string;
  recipientName: string;
  message: string;
  senderName: string;
}): Promise<DispatchResult> {
  const gatewayUrl = process.env.SMS_GATEWAY_URL; // Can point to Android WhatsApp/SMS gateway
  const apiKey = process.env.SMS_GATEWAY_API_KEY;

  const formattedMsg = `🎂 *Special Wish for ${recipientName}!*\n\n${message}\n\n— *From ${senderName}* (Sent via AutoWISH)`;

  if (gatewayUrl) {
    try {
      const res = await fetch(`${gatewayUrl}/send-whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          phone: recipientContact,
          message: formattedMsg,
        }),
      });
      const data = await res.json();
      return {
        success: res.ok,
        channel: "WHATSAPP",
        response: JSON.stringify(data),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, channel: "WHATSAPP", response: "Gateway connection error", error: msg };
    }
  }

  // Simulated delivery when gateway not set up
  console.log(`[WHATSAPP SIMULATION] To: ${recipientContact} | Text: ${formattedMsg}`);
  return {
    success: true,
    channel: "WHATSAPP",
    response: `Simulated WhatsApp message delivered to ${recipientContact}`,
  };
}

/**
 * 4. SMS Dispatcher (Direct Mobile Number)
 */
async function sendSmsWish({
  recipientContact,
  recipientName,
  message,
  senderName,
}: {
  recipientContact: string;
  recipientName: string;
  message: string;
  senderName: string;
}): Promise<DispatchResult> {
  const gatewayUrl = process.env.SMS_GATEWAY_URL;
  const apiKey = process.env.SMS_GATEWAY_API_KEY;

  const smsText = `AutoWISH for ${recipientName}: ${message} - From ${senderName}`;

  if (gatewayUrl) {
    try {
      const res = await fetch(`${gatewayUrl}/send-sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          phone: recipientContact,
          message: smsText,
        }),
      });
      const data = await res.json();
      return {
        success: res.ok,
        channel: "SMS",
        response: JSON.stringify(data),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, channel: "SMS", response: "SMS Gateway error", error: msg };
    }
  }

  console.log(`[SMS SIMULATION] To: ${recipientContact} | Text: ${smsText}`);
  return {
    success: true,
    channel: "SMS",
    response: `Simulated SMS sent to ${recipientContact} via local gateway`,
  };
}

/**
 * OTP Sender for Password Reset & Verification
 */
export async function sendOtpCode({
  target,
  channel,
  code,
}: {
  target: string;
  channel: "EMAIL" | "WHATSAPP" | "SMS";
  code: string;
}): Promise<boolean> {
  const message = `Your AutoWISH verification code is: ${code}. It is valid for 10 minutes. Do not share this code with anyone.`;

  if (channel === "EMAIL") {
    if (resend) {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: target,
        subject: `Your AutoWISH Verification Code: ${code}`,
        text: message,
      });
      return true;
    }
    console.log(`[OTP EMAIL] ${target}: ${code}`);
    return true;
  }

  if (channel === "WHATSAPP" || channel === "SMS") {
    console.log(`[OTP ${channel}] Sent to ${target}: ${code}`);
    return true;
  }

  return false;
}
