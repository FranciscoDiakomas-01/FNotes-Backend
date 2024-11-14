import { Request, Response } from "express";
import ConnectToDb from "../database/dbConnection";
import isAdmin from "../service/isAdmin";

export async function getDashBoardData(req: Request, res: Response) {
  const db = await ConnectToDb();
  const isADm = await isAdmin(req.headers["authorization"]);
  if (isADm) {
    const { rows } = await db.query(
      `SELECT count(*) as total from users WHERE permistion = 2
                        UNION ALL
            SELECT count(*) FROM post 
                        UNION ALL 
            SELECT count(*) FROM category 
                        UNION ALL
            SELECT count(*) FROM comment;`
    );
    await db.end();
    return res.status(200).json({
      data: rows,
    });
  } else {
    await db.end();
    return res.status(401).json({
      error: "permition not allowed",
    });
  }
}
