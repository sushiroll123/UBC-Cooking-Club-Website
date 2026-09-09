import axios from "axios";
import { error } from "console";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

const schema = z.object({
  email: z.string().email().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email } = schema.parse(body);

  if (!email) return NextResponse.json("Email is required", { status: 400 });

  try {
    const data = {
      email_address: email,
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
        { message: "Fail to subscribe" },
        { status: 404 }
      );
    }

    return NextResponse.json("Subscribed", { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Something is wrong", error },
      { status: 400 }
    );
  }
}
