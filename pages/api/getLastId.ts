import type { NextApiRequest, NextApiResponse } from "next";
import { getLastId } from "../../api";
import { getUserIdByCookie } from "../../Components/helper";

type ResponseData = { [key: string]: any };

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const userId = await getUserIdByCookie(req.cookies["X-Auth-Token"]);
    const { sender_id, isGroup } = req.query;
    const id = await getLastId(Number(sender_id), Number(userId), isGroup === "true");
    res.status(200).json({ id });
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
}
