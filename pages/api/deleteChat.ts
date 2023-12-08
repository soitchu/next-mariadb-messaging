import type { NextApiRequest, NextApiResponse } from "next";
import { deleteChat } from "../../api";
import { getUserIdByCookie } from "../../Components/helper";

type ResponseData = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { chatId } = JSON.parse(req.body);
    const ownerId = await getUserIdByCookie(req.cookies["X-Auth-Token"]);
    await deleteChat(chatId, ownerId);
    res.status(200).json({ message: ":D" });
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
}
