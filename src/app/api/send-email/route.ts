import type { NextApiRequest, NextApiResponse } from "next";
import { EmailTemplate } from "@/components/EmailTemplate";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      product,
      price,
      first_name,
      last_name,
      email,
      telephone,
      address,
      message,
      configuration,
    } = body;

    const data = await resend.emails.send({
      from: "Stolarija BM <onboarding@resend.dev>",
      to: ["brkic123antonio@gmail.com"],
      subject: `Nova narudžba: ${product} - ${first_name} ${last_name}`,
      react: EmailTemplate({
        product,
        price,
        firstName: first_name,
        lastName: last_name,
        email,
        telephone,
        address,
        message,
        configuration,
      }),
      text: `Nova narudžba za ${product} od korisnika ${first_name} ${last_name}. Cijena: €${price}`,
    });

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify(error), { status: 400 });
  }
}
