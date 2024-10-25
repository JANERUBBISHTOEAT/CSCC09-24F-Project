import express from "express";
import { createServer } from "http";

const app = express();
const PORT = 3000;

app.use(express.static("static"));

const server = createServer(app).listen(PORT, (err) => {
    if (err) console.log(err);
    else console.log(`HTTP server on http://localhost:${PORT}`);
});
