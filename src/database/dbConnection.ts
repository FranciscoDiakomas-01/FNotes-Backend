import {Pool} from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export default async function ConnectToDb() {
    const pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: 5433,
      password: process.env.DB_PASSWORD,
    });

    pool.connect((err) => {
        if (err) {
            console.log(err);
            return
        } 
    });
    return pool 
}
