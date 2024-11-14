import fs from 'node:fs'
import path from 'node:path'
import { Pool } from 'pg'
import dotenv from 'dotenv'
dotenv.config()


export async function DeleteFile(filepath : string) {
    try {
        const x = await fs.unlinkSync(path.join(filepath))
        return x
    } catch (error) {
        return error
    }
}

export async function getAndDeleteFileById(postId: number | string, db: Pool) {
    const { rows } = await db.query("SELECT cover  FROM post WHERE id = $1 LIMIT 1", [postId])
    const postFile = rows[0]?.cover
    if (postFile) {
        const serverPath = process.env.SERVER_PATH || "http://localhost:8080/";
        await fs.readdir(
          path.join(process.cwd() + "/src/uploads"),
          (err, files) => {
            if (err) {
              return false;
            } else {
              files.forEach((file) => {
                if (serverPath + file == postFile) {
                  fs.unlinkSync(
                    path.join(process.cwd() + "/src/uploads/" + file)
                  );
                  return true;
                }
              });
            }
          }
        );
      } 
}

