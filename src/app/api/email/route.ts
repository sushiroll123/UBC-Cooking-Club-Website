import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import z from "zod";

const schema = z.object({
  email: z.string().email().min(1),
  subject: z.string().min(1),
  message: z.string().min(1),
});

export async function POST() {
  return NextResponse.json(
    { message: "Contact form is temporarily unavailable" },
    { status: 503 }
  );
}

// const resend = new Resend(process.env.NEXT_RESEND_API_KEY);

// export async function POST(req: NextRequest) {
//   let body: unknown;
//   try {
//     body = await req.json();
//   } catch {
//     return NextResponse.json({ message: "Invalid request" }, { status: 400 });
//   }

//   const parsed = schema.safeParse(body);
//   if (!parsed.success) {
//     return NextResponse.json({ message: "Invalid request" }, { status: 400 });
//   }

//   const { email, subject, message } = parsed.data;

//   try {
//     const { data, error } = await resend.emails.send({
//       from: `${email} <onboarding@resend.dev>`,
//       to: "ubccookingclubinfo@gmail.com",
//       subject: `${subject}`,
//       html: `<p>${message}</p>`,
//     });

//     if (error) {
//       return NextResponse.json(
//         { message: "Service unavailable" },
//         { status: 502 }
//       );
//     }

//     return NextResponse.json(data);
//   } catch  (err) {
//     console.error("contact form error:", err)
//     return NextResponse.json(
//       { message: "Service unavailable" },
//       { status: 502 }
//     );
//   }
// }
