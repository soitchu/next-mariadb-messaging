import type { NextApiRequest, NextApiResponse } from "next";
import { search } from "../../api";
import { getUserIdByCookie } from "../../Components/helper";

type ResponseData = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  try {
    const { recipientId, params, isGroup } = JSON.parse(req.body);
    const userId = await getUserIdByCookie(req.cookies["X-Auth-Token"]);
    console.log(params);

    res
      .status(200)
      .json((await search(params, Number(userId), Number(recipientId), isGroup)) as any);
  } catch (err) {
    res.status(500).json({ message: err.toString() });
  }
}
