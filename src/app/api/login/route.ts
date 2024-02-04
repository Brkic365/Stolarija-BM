import { signJwtAccessToken } from "@/lib/jwt";

interface RequestBody {
  username: string;
  password: string;
}

export async function POST(request: Request) {
  const body: RequestBody = await request.json();

  if (
    body.username === process.env.USER &&
    body.password === process.env.PASSWORD
  ) {
    const userWithoutPass = {
      username: body.username,
    };

    /*
    const accessToken = signJwtAccessToken(userWithoutPass);

    const result = {
      ...userWithoutPass,
      accessToken,
    };
    */

    return new Response(JSON.stringify(userWithoutPass));
  } else return new Response(JSON.stringify(null));
}
