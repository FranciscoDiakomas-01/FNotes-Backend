import {Client} from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export default async function ConnectToDb() {
    const client = new Client({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: 5433,
      password: process.env.DB_PASSWORD,
    });

    client.connect((err) => {
      if (err) {
        process.exit(1);
      }
    });
    return client; 
}

