import app from "./app.js";

const port = process.env.PORT;
const host = process.env.HOST;


app.listen((port), () => {
    console.log(`server runnig at ${host}:${port}`)
})

