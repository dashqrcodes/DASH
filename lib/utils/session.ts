import crypto from "crypto";

export const SESSION_COOKIE_NAME = "dash_session";
export const SESSION_DAYS = 180;

export const createSessionToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, hash };
};

export const getSessionExpiry = (days: number = SESSION_DAYS) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt;
};
