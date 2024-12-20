import fs from 'node:fs'
import path from 'node:path'
import ConnectToDb from './dbConnection';
const db =  ConnectToDb;
export default async function RunnMigrations() {
    
    try {
        //read the migration folder
        fs.readdir(path.join(__dirname + "/migrations"), async(err, files) => {
          if (err) {
            console.log(err);
            return ;
          } else {
              files.forEach(async(file) => {
                  //running each sql query from each file in mygration folder or dir
                  const sqlQuery = fs.readFileSync(path.join(__dirname + `/migrations/${file}`), { encoding: 'utf-8' });
                  if (sqlQuery.toString().length > 0) {
                    await db.query(sqlQuery.toString(), async(err, rows) => {
                        if (err) {
                          console.log("error running migration ", err.message, " ", file);
                          return
                        } 
                      
                    });
                   ;
                  } else {
                          console.log("Empty file Mirations/" + file)
                          process.exit(1);
                }

              });
          }
        });
      console.log("Migrations Runned")
      
    } catch (error) {
        console.log(error)
  }
}