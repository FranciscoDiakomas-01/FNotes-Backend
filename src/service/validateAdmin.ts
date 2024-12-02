import ConnectToDb from "../database/dbConnection";
const db =  ConnectToDb;
export default async function isAdminUser(id: number | string) {
    db.query("SELECT id from adminuser WHERE id = $1", [id], (err, result) => {
        if (err) {
            return err.message
        } else {
            return result.rows[0]?.id
        }
    });
    
}