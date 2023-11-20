import type { NextApiRequest, NextApiResponse } from "next";
import { getChats, getLastId, sendMessage } from "../../api";

type ResponseData = { [key: string]: any };

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    try {
        const { sender_id } = req.query;
        const id = await getLastId(sender_id as string);
        res.status(200).json({ id });
    } catch (err) {
        res.status(500).json({ message: err.toString() })
    }
}