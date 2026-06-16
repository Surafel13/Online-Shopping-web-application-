import "./config/env.js";
import app from "./app.js";
import { connectDb } from "./config/db.js";

const PORT = process.env.PORT || 4000

const startServer = async() => {
    try{
        await connectDb();

        app.listen(PORT, () => {
            console.log(`Server run on http://localhost:${PORT}`)
        })
    }catch(err){
        console.log(`Server starting error\n`, err)
    }
}

startServer();