import { Resend } from "resend";
import nodemailer from "nodemailer";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const EMAIL_FROM = process.env.EMAIL_FROM || "DearDates <onboarding@resend.dev>";

export interface SendMessageOptions {
  channel: "EMAIL" | "WHATSAPP" | "SMS" | "TELEGRAM" | string;
  recipientContact: string;
  recipientName: string;
  message: string;
  category?: string;
  senderName?: string;
  senderEmail?: string | null;
  senderPhone?: string | null;
  deliveryMode?: string; // "DEFAULT" or "PERSONAL_GMAIL"
  smtpEmail?: string | null;
  smtpPassword?: string | null;
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
  const {
    channel,
    recipientContact,
    recipientName,
    message,
    category = "Celebration",
    senderName = "A Loved One",
    senderEmail,
    senderPhone,
    deliveryMode = "DEFAULT",
    smtpEmail,
    smtpPassword,
  } = options;

  try {
    switch (channel.toUpperCase()) {
      case "EMAIL":
        return await sendEmailWish({
          recipientContact,
          recipientName,
          message,
          category,
          senderName,
          senderEmail,
          senderPhone,
          deliveryMode,
          smtpEmail,
          smtpPassword,
        });

      case "TELEGRAM":
        return await sendTelegramWish({
          recipientContact,
          recipientName,
          message,
          senderName,
          senderEmail,
          senderPhone,
        });

      case "WHATSAPP":
        return await sendWhatsAppWish({
          recipientContact,
          recipientName,
          message,
          senderName,
          senderEmail,
          senderPhone,
        });

      case "SMS":
        return await sendSmsWish({
          recipientContact,
          recipientName,
          message,
          senderName,
          senderEmail,
          senderPhone,
        });

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
 * 1. Email Wish Dispatcher (Personal Gmail SMTP or DearDates Cloud via Resend)
 */
async function sendEmailWish({
  recipientContact,
  recipientName,
  message,
  category,
  senderName,
  senderEmail,
  senderPhone,
  deliveryMode = "DEFAULT",
  smtpEmail,
  smtpPassword,
}: {
  recipientContact: string;
  recipientName: string;
  message: string;
  category: string;
  senderName: string;
  senderEmail?: string | null;
  senderPhone?: string | null;
  deliveryMode?: string;
  smtpEmail?: string | null;
  smtpPassword?: string | null;
}): Promise<DispatchResult> {
  const subject = `🎉 A Special ${category} Wish for You, ${recipientName}!`;

  // Build clean sender contact badge for display inside the email
  const senderContactList: string[] = [];
  if (senderEmail) {
    senderContactList.push(`<span>📧 Email: <a href="mailto:${senderEmail}" style="color: #4f46e5; text-decoration: none; font-weight: 500;">${senderEmail}</a></span>`);
  }
  if (senderPhone) {
    senderContactList.push(`<span>📱 Phone / WhatsApp: <a href="tel:${senderPhone}" style="color: #4f46e5; text-decoration: none; font-weight: 500;">${senderPhone}</a></span>`);
  }

  const senderContactHtml = senderContactList.length > 0
    ? `<div style="margin-top: 6px; font-size: 13px; color: #64748b; line-height: 1.6;">${senderContactList.join("<br>")}</div>`
    : "";

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
          .message-box { background: #fdf4ff; border-left: 4px solid #c026d3; padding: 22px; border-radius: 12px; margin: 25px 0; font-size: 17px; line-height: 1.6; color: #334155; text-align: left; white-space: pre-line; }
          .sender-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-top: 25px; text-align: left; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #64748b; }
          .badge { display: inline-block; background: #e0e7ff; color: #4338ca; padding: 6px 14px; border-radius: 50px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="badge">DearDates Celebration</span>
            <h1>Warm Wishes For You! 🎂✨</h1>
          </div>
          <div class="content">
            <div class="greeting">Dear ${recipientName},</div>
            <div class="message-box">
              ${message}
            </div>

            <!-- Clear Sender Identification Card -->
            <div class="sender-card">
              <div style="font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">
                💝 Delivered on behalf of
              </div>
              <div style="font-size: 16px; font-weight: 700; color: #1e293b; margin-top: 4px;">
                ${senderName}
              </div>
              ${senderContactHtml}
            </div>
          </div>
          <div class="footer">
            Delivered automatically with care via <strong style="color: #4f46e5;">DearDates</strong> • Never miss an important date.
          </div>
        </div>
      </body>
    </html>
  `;

  // Option A: Use User's own Gmail SMTP if requested or configured
  const wantsPersonalGmail = deliveryMode === "PERSONAL_GMAIL" || (smtpEmail && smtpPassword && deliveryMode !== "DEFAULT");
  if (wantsPersonalGmail && smtpEmail && smtpPassword && smtpEmail.trim() !== "" && smtpPassword.trim() !== "") {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpEmail.trim(),
          pass: smtpPassword.trim(),
        },
      });

      const info = await transporter.sendMail({
        from: `"${senderName}" <${smtpEmail.trim()}>`,
        to: recipientContact.trim(),
        replyTo: senderEmail || smtpEmail.trim(),
        subject,
        html: htmlContent,
      });

      return {
        success: true,
        channel: "EMAIL",
        response: `Sent directly from your personal Gmail (${smtpEmail}) - MsgID: ${info.messageId}`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Gmail SMTP failed for ${smtpEmail}: ${msg}. Falling back to DearDates Cloud delivery...`);
      // Fallback so the wish is not lost
    }
  }

  // Option B: Use System SMTP if configured (100% Free via Gmail App Password)
  const sysEmail = process.env.SYSTEM_SMTP_EMAIL || process.env.SMTP_EMAIL;
  const sysPass = process.env.SYSTEM_SMTP_PASSWORD || process.env.SMTP_PASSWORD;
  if (sysEmail && sysPass && sysEmail.trim() !== "" && sysPass.trim() !== "") {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: sysEmail.trim(),
          pass: sysPass.trim(),
        },
      });

      const info = await transporter.sendMail({
        from: `"${senderName}" <${sysEmail.trim()}>`,
        to: recipientContact.trim(),
        replyTo: senderEmail || sysEmail.trim(),
        subject,
        html: htmlContent,
      });

      return {
        success: true,
        channel: "EMAIL",
        response: `Sent via DearDates Cloud SMTP (${sysEmail}) - MsgID: ${info.messageId}`,
      };
    } catch (err: unknown) {
      console.warn("System SMTP failed, attempting Resend fallback:", err);
    }
  }

  // Option C: Use DearDates Cloud Delivery via Resend (Default & Zero Setup)
  if (resend) {
    try {
      const cleanSender = senderName.replace(/[<>"]/g, "").trim() || "DearDates";
      const { data, error } = await resend.emails.send({
        from: `${cleanSender} <onboarding@resend.dev>`,
        to: recipientContact.trim(),
        replyTo: senderEmail || undefined, // Recipient can reply directly to sender!
        subject,
        html: htmlContent,
      });

      if (error) {
        return {
          success: false,
          channel: "EMAIL",
          response: "Resend rejected message",
          error: error.message || JSON.stringify(error),
        };
      }

      return {
        success: true,
        channel: "EMAIL",
        response: `Sent via DearDates Cloud Delivery (ID: ${data?.id || "OK"})`,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, channel: "EMAIL", response: "Resend API error", error: msg };
    }
  }

  // Fallback Simulation notice for localhost
  return {
    success: true,
    channel: "EMAIL",
    response: `Simulated Email to ${recipientContact}. (Sender: ${senderName} <${senderEmail || "cloud"}>)`,
  };
}

/**
 * Helper to build text sender info for chat / SMS / Telegram
 */
function buildSenderFooter(senderName: string, senderEmail?: string | null, senderPhone?: string | null): string {
  const parts: string[] = [];
  if (senderPhone) parts.push(`📱 ${senderPhone}`);
  if (senderEmail) parts.push(`📧 ${senderEmail}`);
  const contactText = parts.length > 0 ? ` (${parts.join(" | ")})` : "";
  return `— *With love from ${senderName}*${contactText}\n_Delivered via DearDates_`;
}

/**
 * 2. Telegram Wish Dispatcher
 */
async function sendTelegramWish({
  recipientContact,
  recipientName,
  message,
  senderName,
  senderEmail,
  senderPhone,
}: {
  recipientContact: string;
  recipientName: string;
  message: string;
  senderName: string;
  senderEmail?: string | null;
  senderPhone?: string | null;
}): Promise<DispatchResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const footer = buildSenderFooter(senderName, senderEmail, senderPhone);
  const text = `🎉 *Special Wish for ${recipientName}!*\n\n${message}\n\n${footer}`;

  if (token) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: recipientContact.trim(),
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

  return {
    success: true,
    channel: "TELEGRAM",
    response: `Simulated Telegram to ${recipientContact} from ${senderName}`,
  };
}

function formatWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    cleaned = "88" + cleaned;
  }
  return cleaned;
}

export async function dispatchWhatsAppMessage(
  phone: string,
  messageText: string
): Promise<{ success: boolean; response: string; error?: string }> {
  const formattedPhone = formatWhatsAppNumber(phone);

  // 1. Check Green-API (Most popular free WhatsApp gateway: green-api.com)
  const greenInstance = process.env.GREEN_API_INSTANCE_ID || process.env.WHATSAPP_INSTANCE_ID;
  const greenToken = process.env.GREEN_API_TOKEN || process.env.WHATSAPP_API_TOKEN;
  if (greenInstance && greenToken) {
    try {
      const res = await fetch(
        `https://api.green-api.com/waInstance${greenInstance}/sendMessage/${greenToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId: `${formattedPhone}@c.us`,
            message: messageText,
          }),
        }
      );
      const data = await res.json();
      if (res.ok && data.idMessage) {
        return { success: true, response: `Sent via Green-API (ID: ${data.idMessage})` };
      }
      return { success: false, response: "Green-API error", error: JSON.stringify(data) };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, response: "Green-API request failed", error: msg };
    }
  }

  // 2. Check Meta WhatsApp Cloud API (Official Facebook Meta)
  const metaToken = process.env.WHATSAPP_ACCESS_TOKEN || process.env.META_WHATSAPP_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID || process.env.META_PHONE_ID;
  if (metaToken && metaPhoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${metaPhoneId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${metaToken}`,
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: formattedPhone,
          type: "text",
          text: { body: messageText },
        }),
      });
      const data = await res.json();
      if (res.ok && data.messages) {
        return { success: true, response: `Sent via Meta WhatsApp Cloud (MsgID: ${data.messages[0]?.id})` };
      }
      return { success: false, response: "Meta WhatsApp error", error: data.error?.message || JSON.stringify(data) };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, response: "Meta API request failed", error: msg };
    }
  }

  // 3. Check Custom Gateway (e.g. TextBee or custom gateway)
  const gatewayUrl = process.env.WHATSAPP_GATEWAY_URL || process.env.SMS_GATEWAY_URL;
  const apiKey = process.env.WHATSAPP_GATEWAY_API_KEY || process.env.SMS_GATEWAY_API_KEY;
  if (gatewayUrl && gatewayUrl.trim() !== "") {
    try {
      const res = await fetch(`${gatewayUrl}/send-whatsapp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          phone: formattedPhone,
          message: messageText,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, response: "Sent via WhatsApp Gateway" };
      }
      return { success: false, response: "Gateway error", error: JSON.stringify(data) };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return { success: false, response: "Gateway connection failed", error: msg };
    }
  }

  return {
    success: false,
    response: "WhatsApp service not connected",
    error: "WhatsApp service is not connected yet. Please add your Green-API or Meta WhatsApp credentials in Vercel to dispatch real WhatsApp messages.",
  };
}

/**
 * 3. WhatsApp Wish Dispatcher
 */
async function sendWhatsAppWish({
  recipientContact,
  recipientName,
  message,
  senderName,
  senderEmail,
  senderPhone,
}: {
  recipientContact: string;
  recipientName: string;
  message: string;
  senderName: string;
  senderEmail?: string | null;
  senderPhone?: string | null;
}): Promise<DispatchResult> {
  const footer = buildSenderFooter(senderName, senderEmail, senderPhone);
  const formattedMsg = `🎂 *Special Wish for ${recipientName}!*\n\n${message}\n\n${footer}`;

  const result = await dispatchWhatsAppMessage(recipientContact, formattedMsg);
  return {
    success: result.success,
    channel: "WHATSAPP",
    response: result.response,
    error: result.error,
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
  senderEmail,
  senderPhone,
}: {
  recipientContact: string;
  recipientName: string;
  message: string;
  senderName: string;
  senderEmail?: string | null;
  senderPhone?: string | null;
}): Promise<DispatchResult> {
  const gatewayUrl = process.env.SMS_GATEWAY_URL;
  const apiKey = process.env.SMS_GATEWAY_API_KEY;

  const senderContactInfo = senderPhone || senderEmail || "";
  const smsText = `DearDates for ${recipientName}: ${message} - From ${senderName}${senderContactInfo ? ` (${senderContactInfo})` : ""}`;

  if (gatewayUrl) {
    try {
      const res = await fetch(`${gatewayUrl}/send-sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          phone: recipientContact.trim(),
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

  return {
    success: true,
    channel: "SMS",
    response: `Simulated SMS to ${recipientContact} from ${senderName}`,
  };
}

export interface OtpResult {
  success: boolean;
  channel: string;
  error?: string;
}

/**
 * OTP Sender for Registration & Verification
 */
export async function sendOtpCode({
  target,
  channel,
  code,
  userName = "Friend",
  smtpEmail,
  smtpPassword,
}: {
  target: string;
  channel: "EMAIL" | "WHATSAPP" | "SMS";
  code: string;
  userName?: string;
  smtpEmail?: string | null;
  smtpPassword?: string | null;
}): Promise<OtpResult> {
  const isEmail = channel === "EMAIL" || target.includes("@");

  if (isEmail) {
    const htmlEmail = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
            .card { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 20px; text-align: center; color: #ffffff; }
            .content { padding: 32px 28px; text-align: center; }
            .code-box { display: inline-block; background: #f1f5f9; border: 2px dashed #4f46e5; border-radius: 14px; padding: 14px 32px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4338ca; margin: 24px 0; }
            .footer { background: #f8fafc; padding: 18px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2 style="margin: 0; font-size: 24px; font-weight: 800;">DearDates Verification</h2>
              <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Confirm your account registration</p>
            </div>
            <div class="content">
              <p style="font-size: 16px; color: #1e293b; margin: 0;">Hello <strong>${userName}</strong>,</p>
              <p style="font-size: 14px; color: #64748b; margin-top: 8px;">Use the 6-digit code below to verify your email address. It will expire in 10 minutes.</p>
              
              <div class="code-box">${code}</div>

              <p style="font-size: 12px; color: #94a3b8; margin: 0;">If you didn't request this code, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              DearDates • Automated Celebrations & Greetings
            </div>
          </div>
        </body>
      </html>
    `;

    // 1. Try custom or system Gmail SMTP (Can send to ANY email address)
    const effectiveSmtpEmail = smtpEmail || process.env.SYSTEM_SMTP_EMAIL || process.env.SMTP_EMAIL;
    const effectiveSmtpPassword = smtpPassword || process.env.SYSTEM_SMTP_PASSWORD || process.env.SMTP_PASSWORD;

    if (effectiveSmtpEmail && effectiveSmtpPassword && effectiveSmtpEmail.trim() !== "" && effectiveSmtpPassword.trim() !== "") {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: effectiveSmtpEmail.trim(), pass: effectiveSmtpPassword.trim() },
        });
        await transporter.sendMail({
          from: `"DearDates Verification" <${effectiveSmtpEmail.trim()}>`,
          to: target,
          subject: `Your DearDates Verification Code: ${code}`,
          html: htmlEmail,
          text: `Hello ${userName}! Your DearDates verification code is: ${code}. Valid for 10 minutes.`,
        });
        console.log(`[OTP SENT VIA GMAIL SMTP] Successfully dispatched to ${target}`);
        return { success: true, channel: "EMAIL" };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("Failed to send OTP via SMTP:", msg);
      }
    }

    // 2. Try Resend Cloud
    if (resend) {
      try {
        const { data, error } = await resend.emails.send({
          from: EMAIL_FROM,
          to: target,
          subject: `Your DearDates Verification Code: ${code}`,
          html: htmlEmail,
          text: `Hello ${userName}! Your DearDates verification code is: ${code}. Valid for 10 minutes.`,
        });
        if (error) {
          console.error("Resend OTP error:", error);
        } else {
          console.log(`[OTP SENT VIA RESEND] ID: ${data?.id}`);
          return { success: true, channel: "EMAIL" };
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error("Resend OTP error:", msg);
      }
    }

    // Neither SMTP nor Resend could deliver
    return {
      success: false,
      channel: "EMAIL",
      error: "Live email delivery service is not configured. Please add SYSTEM_SMTP_EMAIL & SYSTEM_SMTP_PASSWORD (16-char Google App Password) in Vercel to send verification emails to real inboxes.",
    };
  }

  // WhatsApp dispatch (Channel WHATSAPP or phone number)
  const otpMessage = `🎂 *DearDates Account Verification*\n\nHello ${userName}!\nYour 6-digit WhatsApp verification code is: *${code}*\n\nValid for 10 minutes. Please enter this code in DearDates to activate your account.`;

  const waResult = await dispatchWhatsAppMessage(target, otpMessage);
  if (waResult.success) {
    return { success: true, channel: "WHATSAPP" };
  }

  // Fallback to generic SMS Gateway if configured
  const gatewayUrl = process.env.SMS_GATEWAY_URL;
  const apiKey = process.env.SMS_GATEWAY_API_KEY;
  const smsText = `Your DearDates verification code is ${code}. Valid for 10 minutes.`;

  if (gatewayUrl && gatewayUrl.trim() !== "") {
    try {
      const res = await fetch(`${gatewayUrl}/send-sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({ phone: target, message: smsText }),
      });
      if (res.ok) {
        return { success: true, channel: "SMS" };
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("Failed to send OTP via SMS gateway:", msg);
    }
  }

  return {
    success: false,
    channel: "WHATSAPP",
    error: waResult.error || "WhatsApp service is not connected yet. Please connect Green-API (green-api.com) or Meta WhatsApp in Vercel to receive your OTP code on WhatsApp.",
  };
}
