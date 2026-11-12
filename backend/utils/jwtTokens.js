
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const jwtTokens = (user) => {
  const payload = {
    id: user._id.toString(),
    role: user.role,
  };
  
  // accesstoken
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" }
  );

  // refresh - 7d
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" }
  );

  return { accessToken, refreshToken };
}; // jsonwebtoken


// Hash refresh token before storing in MongoDB
export const hashToken = (token) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};



