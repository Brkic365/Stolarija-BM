import { JwtPayload, sign, verify } from "jsonwebtoken";

interface SignOption {
  expiresIn?: string | number;
}

const DEFAULT_SIGN_OPTION: SignOption = {
  expiresIn: "1h",
};

export function signJwtAccessToken(
  payload: JwtPayload,
  options: SignOption = DEFAULT_SIGN_OPTION
) {
  const secretKey = process.env.SECRET_KEY;
  const token = sign(payload, secretKey!, options);

  return token;
}

export function verifyJwt(token: string) {
  try {
    const secretKey = process.env.SECRET_KEY;
    const decoded = verify(token, secretKey!);
    return decoded as JwtPayload;
  } catch (error) {
    return null;
  }
}
