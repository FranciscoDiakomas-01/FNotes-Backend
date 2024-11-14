import { Request, Response } from 'express'
import CryptoJS from 'crypto-js'
import dotnenv from 'dotenv'
import { ILogin } from '../types/types'
import ConnectToDb from '../database/dbConnection'
import validator from 'validator'
import { GerenetaToken } from '../middlewares/token'
import isAdmin from '../service/isAdmin'
dotnenv.config()

export default async function login(req: Request, res: Response) {
    const db = await ConnectToDb()
    const loginBody: ILogin = {
        email: req.body.email,
        password : req.body.password
    }
    //validation
    if (validator.isEmail(loginBody.email) && loginBody?.password.length >= 8) {
        const { rows } = await db.query("SELECT email , id , password FROM users WHERE email = $1 LIMIT 1;",[loginBody.email]);
        if (rows.length == 0) {
            await db.end();
            return res.status(200).json({
                error: "user not found",
            });
        } else {
            const passwordHashed = rows[0].password;
            const isMAtchPassWord = CryptoJS.AES.decrypt(passwordHashed, process.env.PASS_CRYPT || "");
            if (isMAtchPassWord.toString(CryptoJS.enc.Utf8) == loginBody.password) {
                const token = await GerenetaToken(rows[0]?.id)
                res.status(200).json({
                    msg: "susess",
                    token,
                    isAdmin: rows[0]?.id == 1 
                });
                return await db.end();
            } else {
                await db.end();
                return res.status(200).json({
                    error: "wrong password",
                });
            }
        }
    } else {
        await db.end();
        return res.status(400).json({
            error: "wrong email or password",
        });
    }
}

export async function isAdminController(req : Request , res : Response) {
    const token = req.params.token
    const response = await isAdmin(token)
    return res.status(200).json({
        response
    })
}
