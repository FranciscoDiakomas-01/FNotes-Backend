import jwt from "jsonwebtoken";
import ConnectToDb from "../database/dbConnection";
import dotenv from "dotenv";
dotenv.config();

export default async function isAdmin(token: string) {
  const db = await ConnectToDb();
  return jwt.verify(token || "",process.env.JWT || "my secret token base",async (error, payload) => {
      if (error) {
          return false;
        } else {
            const { rows } = await db.query("SELECT id FROM users WHERE permistion = 1;");
            if (rows[0]?.id == payload?.id) {
                await db.end();
                return true;
            } else {
                await db.end();
                return false
            }
        }
  });
}