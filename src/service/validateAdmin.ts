import ConnectToDb from "../database/dbConnection";

export default async function isAdminUser(id: number | string) {
    const db = await ConnectToDb()
    db.query("SELECT id from adminuser WHERE id = $1", [id], (err, result) => {
        if (err) {
            return err.message
        } else {
            return result.rows[0]?.id
        }
    });
    
}