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
dotenv.config()
async function RunnServer() {
    
    await RunnMigrations()

    const server = express();
    //globlal middlewares
    server.use(cors())
    server.use(express.json())
    server.use(express.static(path.join(process.cwd() + '/src/uploads')))
    const serverPort = process.env.PORT;
    //routes
    server.use(userRoute)
    server.use(categoryRouter);
    server.use(postRouter);
    server.use(loginRouter);
    server.use(commentRouter);
    //listen on port
    server.listen(serverPort ?? 4000, () => {
    console.log("Server Running on http://localhost:" + serverPort);
    });
}

RunnServer()