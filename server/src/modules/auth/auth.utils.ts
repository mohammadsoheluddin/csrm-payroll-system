import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

export type TJwtUserPayload = {
  userId: string;
  email: string;
  role: string;
};

export const createToken = (
  jwtPayload: TJwtUserPayload,
  secret: Secret,
  expiresIn: string,
) => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(jwtPayload, secret, options);
};

export const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload & TJwtUserPayload;
};
