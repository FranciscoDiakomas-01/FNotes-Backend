import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import RunnMigrations from './database/runMigrations'
import userRoute from './routes/userRoute'
import categoryRouter from './routes/categoryRoutes'
import postRouter from './routes/postRoute'
import path from 'node:path'
import loginRouter from './routes/loginRoutes'
import commentRouter from './routes/commentRoute'
import InsertDefaultAdmin from './database/defaultAdmin'
import dashBoardRouter from './routes/dashBoard'
dotenv.config();
async function RunnServer() {
    await RunnMigrations()
    try {
        await InsertDefaultAdmin();const server = express();
        //globlal middlewares
        server.use(cors());
        server.use(express.json());
        server.use(express.static(path.join(process.cwd() + "/src/uploads")));
        const serverPort = process.env.PORT;
        //routes
        server.use(userRoute);
        server.use(categoryRouter);
        server.use(postRouter);
        server.use(loginRouter);
        server.use(commentRouter);
        server.use(dashBoardRouter);
        //listen on port
        server.listen(serverPort ?? 4000, () => {
          console.log("Server Running on http://localhost:" + serverPort);
        });
    } catch (error) {
        //pare resolver o  problema do postgres de número máximo de conections para 
        //sempre que atingir o n máximo de connections para tentar novamente rodando todo programa
        await InsertDefaultAdmin();const server = express();
        //globlal middlewares
        server.use(cors());
        server.use(express.json());
        server.use(express.static(path.join(process.cwd() + "/src/uploads")));
        const serverPort = process.env.PORT;
        //routes
        server.use(userRoute);
        server.use(categoryRouter);
        server.use(postRouter);
        server.use(loginRouter);
        server.use(commentRouter);
        server.use(dashBoardRouter);
        //listen on port
        server.listen(serverPort ?? 4000, () => {
          console.log("Server Running on http://localhost:" + serverPort);
        });
    }
    
}

RunnServer()