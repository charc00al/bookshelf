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

// filter out non-desired books from google books api after search
function filterGoogleBooks(allFoundBooks) {
    const filteredBooks = allFoundBooks.filter((foundBook) => {
        // a book has to have: title, author(s), date of publishing, ISBN 13 and cover image
        const book = foundBook.volumeInfo;
        const hasAllData = book
            && book.title
            && Array.isArray(book.authors) 
            && book.publishedDate
            && Array.isArray(book.industryIdentifiers)
            && book.imageLinks;

        const hasIsbn13 = hasAllData && book.industryIdentifiers.some(({type}) => type == 'ISBN_13');

        return hasAllData && hasIsbn13;
    })
    return filteredBooks
}

// create simplified objects of filtered google books to display
function displayGoogleBooks(cleanBooks) {
    let displayedBooks = [];

    cleanBooks.forEach(cleanBook => {
        const bookIsbn = cleanBook.volumeInfo.industryIdentifiers.find(({type}) => type == 'ISBN_13')
        const book = {
            title: cleanBook.volumeInfo.title,
            authors: cleanBook.volumeInfo.authors,
            isbn: bookIsbn.identifier,
            cover: cleanBook.volumeInfo.imageLinks.thumbnail
        }
        displayedBooks.push(book);
    });
    console.log(displayedBooks);
    return displayedBooks
}

// using intitle only for now 
app.post("/submit", async (req, res) => {
    try {
        const response = await axios.get(apiURL + encodeURIComponent(req.body.input));
        const cleanBooks = filterGoogleBooks(response.data.items);
        const searchBooks = displayGoogleBooks(cleanBooks);
        res.render("index.ejs", {searchBooks: searchBooks})

    } catch (error) {
        console.error(error);
    }
})

// create new book based on search
app.get("/new-book/:isbn", (req, res) => {
    console.log("HELLO");
    res.redirect("/");
})

app.listen(port, () => {
    console.log(`Server running on port ${port}.`)
})