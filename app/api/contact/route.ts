import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Payload = {
  from?: unknown;
  subject?: unknown;
  message?: unknown;
  hp?: unknown; // honeypot — must be empty
  ts?: unknown; // client timestamp — block instant submits
};

const json = (data: unknown, status: number) =>
  NextResponse.json(data, { status });

export async function POST(req: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO ?? "andrerafael892@gmail.com";
  const fromAddress =
    process.env.CONTACT_EMAIL_FROM ?? "Portfolio <onboarding@resend.dev>";

  if (!apiKey) {
    return json(
      { error: "Email is not configured on the server." },
      503,
    );
  }

  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  const from = typeof body.from === "string" ? body.from.trim() : "";
  const subject =
    typeof body.subject === "string" ? body.subject.trim() : "";
  const message =
    typeof body.message === "string" ? body.message.trim() : "";
  const hp = typeof body.hp === "string" ? body.hp : "";
  const ts = typeof body.ts === "number" ? body.ts : 0;

  if (hp.length > 0) {
    return json({ ok: true }, 200);
  }
  if (ts > 0 && Date.now() - ts < 1500) {
    return json({ error: "Submission too quick. Try again." }, 400);
  }

  if (!EMAIL_RE.test(from)) {
    return json({ error: "Invalid email address." }, 400);
  }
  if (subject.length < 1 || subject.length > 200) {
    return json({ error: "Subject must be 1–200 characters." }, 400);
  }
  if (message.length < 5 || message.length > 5000) {
    return json({ error: "Message must be 5–5000 characters." }, 400);
  }

  const resend = new Resend(apiKey);

  const text = [
    `From: ${from}`,
    "",
    message,
    "",
    "—",
    "Sent from rafaelandre.dev terminal contact",
  ].join("\n");

  try {
    const { error } = await resend.emails.send({
      from: fromAddress,
      to,
      replyTo: from,
      subject: `[Portfolio] ${subject}`,
      text,
    });

    if (error) {
      return json(
        { error: error.message ?? "Failed to send email." },
        502,
      );
    }
    return json({ ok: true }, 200);
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Unknown error.";
    return json({ error: detail }, 500);
  }
}
