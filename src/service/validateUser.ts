import { ICreateUser } from "../types/types";
import validator from 'validator'

export function ValidateUserCreation(user : ICreateUser) : boolean {
    let response = false
    if (validator.isEmail(user?.email) && user?.name?.length >= 2 && user?.password?.length >= 8) {
        response = true
        return response
    } else {
        return false
    }
}