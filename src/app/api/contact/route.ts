import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string" ||
      !name.trim() ||
      !email.includes("@") ||
      !message.trim()
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    // TODO: Integrate an email provider (Resend/EmailJS/Nodemailer)
    // For now, just log on the server and return success.
    console.log("Contact form submission:", { name, email, message });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
