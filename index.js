import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", (req, res) => {
    res.render("index.ejs");
})

const apiURL = "https://www.googleapis.com/books/v1/volumes?q=intitle:"


/* function findGoogleBooks(allFoundBooks) {

    let searchedBooks = [];

    allFoundBooks.forEach(foundBook => {
        const book = foundBook.volumeInfo;
        const title = book.title;
        const author = book.authors; 
        const date = book.publishedDate;
        const isbnObj = book.industryIdentifiers;
        let isbn;
        if (typeof isbnObj === 'object') {
            const isbn13 = isbnObj.find(({type}) => type == 'ISBN_13');
            if (isbn13) {
                isbn = isbn13.identifier;
            } else {
                console.log("NOT FOUND");
            }
        }
        console.log(title, author);
        if (title && author && date && isbn) {
            searchedBooks.push(title, author);
        }
    });
    console.log(searchedBooks);
} */

function filterGoogleBooks(allFoundBooks) {
    const filteredBooks = allFoundBooks.filter((foundBook) => {
        
        const book = foundBook.volumeInfo;
        const hasAllData = book
            && book.title
            && Array.isArray(book.authors) 
            && book.publishedDate
            && Array.isArray(book.industryIdentifiers);

        const hasIsbn13 = hasAllData && book.industryIdentifiers.some(({type}) => type == 'ISBN_13');

        /* const isbnObject = foundBook.volumeInfo.industryIdentifiers;
        isbnObject.some(({type}) => type == 'ISBN_13'); */
        return hasAllData && hasIsbn13;
    })
    filteredBooks.forEach(book => {
        console.log("FILTER", book.volumeInfo.title, book.volumeInfo.authors, book.industryIdentifiers)
    });

    allFoundBooks.forEach(book => {
        console.log(book.volumeInfo.title, book.volumeInfo.authors, book.industryIdentifiers)
    });
}

app.post("/submit", async (req, res) => {
    try {
        const response = await axios.get(apiURL + encodeURIComponent(req.body.input));
        // findGoogleBooks(response.data.items)
        filterGoogleBooks(response.data.items)
    } catch (error) {
        console.error(error);
    }
    res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server running on port ${port}.`)
})