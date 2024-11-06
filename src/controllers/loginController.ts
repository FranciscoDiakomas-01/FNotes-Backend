import { Request, Response } from 'express'
import CryptoJS from 'crypto-js'
import dotnenv from 'dotenv'
import { ILogin } from '../types/types'
import ConnectToDb from '../database/dbConnection'
import validator from 'validator'
import { GerenetaToken } from '../middlewares/token'

dotnenv.config()

export default async function login(req: Request, res: Response) {
    const db = await ConnectToDb()
    const loginBody: ILogin = {
        email: req.body.email,
        password : req.body.password
    }
    //validation
    if (validator.isEmail(loginBody.email) && loginBody?.password.length >= 8) {
        const { rows } = await db.query("SELECT email , id , password FROM users WHERE email = $1 ",[loginBody.email]);
        if (rows.length == 0) {
            res.status(200).json({
                error: "user not found",
            });
            return await db.end();
        } else {
            const passwordHashed = rows[0].password;
            const isMAtchPassWord = CryptoJS.AES.decrypt(passwordHashed, process.env.PASS_CRYPT || "");
            if (isMAtchPassWord.toString(CryptoJS.enc.Utf8) == loginBody.password) {
                const token = await GerenetaToken(rows[0]?.id)
                res.status(200).json({
                    sucess: "logged",
                    token
                });
                return await db.end();
            } else {
                
                res.status(200).json({
                    error: "wrong password",
                });
                return await db.end();
            }
        }
    } else {
        res.status(400).json({
            error : "wrong email or password"
        })
        return await db.end()
    }
    //

}