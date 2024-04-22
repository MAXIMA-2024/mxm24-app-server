export type JWTModel = {
  email: string;
  role: "panitia" | "organisator" | "mahasiswa" | "unknown";
  ticket: string;
};

export type JWTRefreshModel = {
  email: string;
  ticket: string;
};
