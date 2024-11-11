import {Client} from 'pg'

export default async function verifyCategory( db : Client , category : number | string)  {
    
    const { rowCount } = await db.query("SELECT * FROM category WHERE id = $1 LIMIT 1;", [category])
    if (rowCount == 0) {
        return false
    } else {
        return true
    }
}