import type { NextApiRequest, NextApiResponse } from "next";
import { deleteMessage, sendMessage } from "../../api";

type ResponseData = {
    message: string
}

export default function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    try {
        const { messageId, recipientId } = JSON.parse(req.body);
        deleteMessage(Number(messageId), 1);

        res.status(200).json({ message: ":D" })
    } catch (err) {
        res.status(500).json({ message: err.toString() })
    }
}