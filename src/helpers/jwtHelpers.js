import jwt from 'jsonwebtoken';

const createToken = (payload, secret, expiry) => {
  return jwt.sign(payload, secret, {
    expiresIn: expiry,
  });
};

const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

export const jwtHelpers = {
  createToken,
  verifyToken,
};
