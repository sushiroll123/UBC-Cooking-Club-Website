import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import z from "zod";

const schema = z.object({
  email: z.string().email().min(1),
  subject: z.string().min(1),
  message: z.string().min(1),
});

const resend = new Resend(`${process.env.NEXT_RESEND_API_KEY}`);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, subject, message } = schema.parse(body);

  try {
    const { data, error } = await resend.emails.send({
      from: `${email} <onboarding@resend.dev>`,
      to: "ubccookingclubinfo@gmail.com",
      subject: `${subject}`,
      html: `<p>${message}</p>`,
    });

    if (error) {
      return NextResponse.json(error, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json("Something is wrong", { status: 400 });
  }
}
