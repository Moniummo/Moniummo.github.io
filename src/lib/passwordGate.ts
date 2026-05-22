export const splitConfiguredPasswordHashes = (value?: string) =>
  value
    ?.split(/\r?\n|,|;/)
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean) ?? [];

export const hashToSha256Hex = async (value: string) => {
  if (!window.crypto?.subtle) {
    throw new Error("This browser does not support secure password hashing.");
  }

  const encodedValue = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", encodedValue);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const allySessionAccessKey = "ally-session-access";

export const grantAllySessionAccess = () => {
  try {
    window.sessionStorage.setItem(allySessionAccessKey, "granted");
  } catch {
    // Route access falls back to locked when session storage is unavailable.
  }
};

export const hasAllySessionAccess = () => {
  try {
    return window.sessionStorage.getItem(allySessionAccessKey) === "granted";
  } catch {
    return false;
  }
};
