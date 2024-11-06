import jwt from "jsonwebtoken";

export default function getIdInToken(token: string) {
    let t = 0
    jwt.verify(token , process.env.JWT || "", (error : any, payload: any) => {
        if (payload) {
            t = payload?.id;
        }
    });
    return t
}