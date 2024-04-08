import { type Request, type Response } from "express";
import { success } from "@/utils/responses";

export const index = (_req: Request, res: Response) => {
  return success(res, "Welcome to MAXIMA 2024 API", {
    repo: "https://github.com/MAXIMA-2024/mxm24-app-server/",
    coordinators: [
      "00000068083 - Albert Tirto Kusumo",
      "00000069524 - Muhammad Fathan Ridhwan",
    ],
    members: [
      "00000068930 - Dimas Takeda Wukir Tirtowidjojo",
      "00000069115 - Alvin Yohanes Kristianto",
      "00000070288 - Paskasius Gian Avila Putra",
      "00000070515 - Michael Tio",
      "00000073191 - Hafizh Kumara Widyadhana",
      "00000083560 - Godwin Gilbert Woisiri",
      "00000092186 - Nikolas Bentus Karya",
    ],
    broughtToYouBy: "CHARTA MAXIMA 2024",
  });
};
