import { createServer } from "http";
import express from "express";
import Datastore from "nedb";
import cors from "cors";

const PORT = 4000;
const app = express();

app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:3000",
    })
);

const tokens = new Datastore({
    filename: "db/tokens.db",
    autoload: true,
    timestampData: true,
});
function getTokens(page, s) {
    limit = Math.max(5, limit ? parseInt(limit) : 5);
    page = page || 0;
    return new Promise(function (resolve, reject) {
        tokens
            .find({})
            .sort({ createdAt: -1 })
            .skip(page * limit)
            .limit(limit)
            .exec(function (err, tokens) {
                if (err) return reject(err);
                return resolve(tokens);
            });
    });
}

function createToken(data) {
    return new Promise(function (resolve, reject) {
        const token = {
            data: data,
            createdAt: new Date(),
        };
        tokens.insert(token, function (err, newToken) {
            if (err) return reject(err);
            return resolve(newToken);
        });
    });
}
