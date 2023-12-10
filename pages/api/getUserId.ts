import type { NextApiRequest, NextApiResponse } from "next";
import { getUserInfo } from "../../api";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { username } = JSON.parse(req.body);
    res.status(200).json({ id: (await getUserInfo(username))[1] ?? -1 });
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
}
