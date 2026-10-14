import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const schema = z.object({
  email: z.string().email().min(1),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  try {
    const data = {
      email_address: parsed.data.email,
      status: "subscribed",
    };
    const response = await axios.post(
      `https://${process.env.MAILCHIMP_API_SERVER}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_AUDIENCE_ID}/members`,
      data,
      {
        headers: {
          Authorization: `apikey ${process.env.MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status >= 400) {
      return NextResponse.json(
        { message: "Service unavailable" },
        { status: 502 }
      );
    }

    return NextResponse.json("Subscribed", { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Service unavailable" },
      { status: 502 }
    );
  }
}
