import type { NextApiRequest, NextApiResponse } from "next";
import { getChats } from "../../api";
import { getUserIdByCookie } from "../../Components/helper";

type ResponseData = { [key: string]: any };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const userId = await getUserIdByCookie(req.cookies["X-Auth-Token"]);
    res.status(200).json(await getChats(Number(userId)));
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
}
