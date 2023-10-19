import express from "express"; // good using only ES6+ modules
import apiRouter from "../routes/api.js";

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.static("frontend"));
app.use(express.json());
app.use("/", apiRouter);

app.listen(PORT, () => console.log(`First Listening on port ${PORT}`));
