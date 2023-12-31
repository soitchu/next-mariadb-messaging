import type { NextApiRequest, NextApiResponse } from "next";
import { getMessages, sendMessage } from "../../api";
import { getUserIdByCookie } from "../../Components/helper";

type ResponseData = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { recipientId, oldestId, greater, isGroup } = JSON.parse(req.body);
    const userId = await getUserIdByCookie(req.cookies["X-Auth-Token"]);

    res
      .status(200)
      .json(
        (await getMessages(
          Number(userId),
          recipientId,
          oldestId === -1 ? Infinity : oldestId,
          greater === "true",
          isGroup
        )) as any
      );
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
}
