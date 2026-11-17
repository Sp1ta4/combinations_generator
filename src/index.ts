import express from "express";
const app = express();
const port = "8888";

app.get("/", (req, res) => {
	res.send("Hello World!");
	console.log("Response sent");
});

app.listen(port, () => {
	console.log(`Server start working on port ${port}`);
});