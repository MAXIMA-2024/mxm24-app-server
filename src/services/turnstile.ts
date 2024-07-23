import ENV from "@/utils/env";

const url = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResponse = {
  success: boolean;
  challenge_ts: string;
  hostname: string;
  "error-codes": string[];
  action: string;
  cdata: string;
};

export const verifyCaptcha = async (token: string, ip: string) => {
  const formData = new FormData();

  formData.append("secret", ENV.TURNSTILE_SECRET_KEY);
  formData.append("response", token);
  formData.append("remoteip", ip);

  try {
    const result = await fetch(url, {
      body: formData,
      method: "POST",
    });

    const outcome = (await result.json()) as TurnstileResponse;

    return outcome.success;
  } catch (error) {
    return false;
  }
};
