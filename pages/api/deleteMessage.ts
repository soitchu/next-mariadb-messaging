import type { NextApiRequest, NextApiResponse } from "next";
import { deleteMessage, sendMessage } from "../../api";
import { getUserIdByCookie } from "../../Components/helper";

type ResponseData = {
    message: string
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    try {
        const { messageId, recipientId } = JSON.parse(req.body);
        const userId = await getUserIdByCookie(req.cookies["X-Auth-Token"]);
        await deleteMessage(Number(messageId), Number(userId), recipientId);
        res.status(200).json({ message: ":D" })
    } catch (err) {
        res.status(500).json({ message: err.toString() })
    }
}