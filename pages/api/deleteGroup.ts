import type { NextApiRequest, NextApiResponse } from "next";
import { deleteGroup } from "../../api";
import { getUserIdByCookie } from "../../Components/helper";

type ResponseData = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { groupId } = JSON.parse(req.body);
    const ownerId = await getUserIdByCookie(req.cookies["X-Auth-Token"]);
    await deleteGroup(groupId, ownerId);
    res.status(200).json({ message: ":D" });
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
}
