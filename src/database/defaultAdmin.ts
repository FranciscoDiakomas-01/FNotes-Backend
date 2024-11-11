import ConnectToDb from "./dbConnection";
import dotev from 'dotenv'
import CryptoJS from "crypto-js";
dotev.config()

export default async function InsertDefaultAdmin() {
    const db = await ConnectToDb()
    const { rows } = await db.query("SELECT id from users WHERE permistion = '1' LIMIT 1;")
    //caso não exista um unico usuário com o id 1 e com a permition admin
    //o banco de dados será esvaziado
    if (rows[0]?.id == 1) {
        console.log("Admin found")
    } else {
        //deleterar todos os dados e cadastrar um novo admin
        console.log("starting creating admin" , Date.now())
        await db.query("DELETE FROM users;")
        await db.query("DELETE FROM users");
        await db.query("DELETE FROM category");
        await db.query("DELETE FROM post");
        await db.query("DELETE FROM comment");
        const password = CryptoJS.AES.encrypt("admin12345", process.env.PASS_CRYPT || "")
        const profile = process.env.SERVER_PATH + 'admin.png'
        await db.query("INSERT INTO users(id , name , email , password , permistion , profile ) VALUES (1 , 'admin' , 'admin@gmail.com' , $1 , 1 , $2)", [password.toString(), profile]);
        console.log("fininhing creating admin", Date.now());
        console.log("Admin created sucessly");
        await db.end()
        
    }
}

