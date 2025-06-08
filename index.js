import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const apiURL = "https://www.googleapis.com/books/v1/volumes?q="
const testSearch = "flowers+inauthor:keyes"

app.get("/", (req, res) => {
    res.render("index.ejs");
})

app.post("/submit", async (req, res) => {
    console.log(req.body);
    try {
        const response = await axios.get(apiURL + testSearch);
        // console.log(response.data.items[0].volumeInfo);
        const foundBook = response.data.items[0].volumeInfo;
        const title = foundBook.title;
        const author = foundBook.authors[0]; 
        const isbn = foundBook.industryIdentifiers[1].identifier;
        console.log(title, author, isbn)
    } catch (error) {
        console.error(error);
    }
    res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server running on port ${port}.`)
})