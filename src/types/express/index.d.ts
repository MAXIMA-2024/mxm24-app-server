declare namespace Express {
  export interface Request {
    user?:
      | {
          role: "panitia";
          data: import("@/models/accounts/panitia.model").PanitiaUpdatable;
        }
      | {
          role: "organisator";
          data: import("@/models/accounts/organisator.model").OrganisatorUpdatable;
        }
      | {
          role: "mahasiswa";
          data: import("@/models/accounts/mahasiswa.model").MahasiswaUpdatable;
        }
      | {
          role: "unknown";
        };

    jwt?: import("@/models/auth/jwt.model").JWTModel;

    cookies: {
      jwt: string;
      jwt_refresh: string;
    };
  }
}
