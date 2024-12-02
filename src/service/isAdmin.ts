import jwt from "jsonwebtoken";
import ConnectToDb from "../database/dbConnection";
import dotenv from "dotenv";
dotenv.config();
const db =  ConnectToDb;
export default async function isAdmin(token: string) {
  
  return jwt.verify(token , String(process.env.JWT) ,async (error, payload) => {
      if (error) {
          return false;
        } else {
            const { rows } = await db.query("SELECT id FROM users WHERE permistion = 1;");
            if (rows[0]?.id == payload?.id) {
                return true;
            } else {
                return false
            }
        }
  });
}