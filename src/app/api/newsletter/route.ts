import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email(),
});

const { MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID, MAILCHIMP_SERVER_PREFIX } =
  process.env;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Please enter a valid email" },
      { status: 400 }
    );
  }

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER_PREFIX) {
    console.error("Mailchimp environment variables are missing");
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }

  try {
    await axios.post(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
      {
        email_address: parsed.data.email,
        status: "subscribed",
      },
      {
        auth: { username: "anystring", password: MAILCHIMP_API_KEY },
        timeout: 10_000,
      }
    );

    return NextResponse.json({ message: "Subscribed" }, { status: 200 });
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response?.data?.title === "Member Exists") {
        return NextResponse.json(
          { message: "You're already subscribed" },
          { status: 200 }
        );
      }
      // Log only the response, never the whole error (it contains your API key)
      console.error("Mailchimp error:", err.response?.status, err.response?.data);
    } else {
      console.error("Subscribe error:", err);
    }

    return NextResponse.json(
      { message: "Service unavailable" },
      { status: 502 }
    );
  }
}