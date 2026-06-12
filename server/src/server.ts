import app from "./app.js";
import dotenv from "dotenv"


dotenv.config();
const PORT = process.env.PORT || 4000

const startServer = async() => {
    try{

        app.listen(PORT, () => {
            console.log(`Server run on http://localhost:${PORT}`)
        })

    }catch(err){
        console.log(`Server starting error\n`, err)

    }
}

startServer();