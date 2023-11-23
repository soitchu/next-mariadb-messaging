import type { NextApiRequest, NextApiResponse } from "next";
import { editMessage } from "../../api";
import { getUserIdByCookie } from "../../Components/helper";

type ResponseData = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { messageId, message, isGroup } = JSON.parse(req.body);
    const userId = await getUserIdByCookie(req.cookies["X-Auth-Token"]);
    await editMessage(Number(messageId), Number(userId), message, isGroup);

    res.status(200).json({ message: ":D" });
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
}
