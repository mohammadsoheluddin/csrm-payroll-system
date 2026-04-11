import jwt, { Secret, SignOptions } from "jsonwebtoken";

const createToken = (payload: object, secret: Secret, expiresIn: string) => {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
};

export default createToken;
