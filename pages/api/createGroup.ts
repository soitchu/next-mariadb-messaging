import type { NextApiRequest, NextApiResponse } from "next";
import { createGroup } from "../../api";
import { getUserIdByCookie } from "../../Components/helper";

type ResponseData = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { name } = JSON.parse(req.body);
    const userId = await getUserIdByCookie(req.cookies["X-Auth-Token"]);
    await createGroup(userId, name);
    res.status(200).json({ message: ":D" });
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
}
