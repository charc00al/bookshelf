import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "bookshelf",
  password: "gandalf",
  port: 5432,
});

db.connect();

let bookshelf = [];

// homepage
app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM books_test");
    // console.log(result.rows);
    res.render("index.ejs", {bookshelf: result.rows});
})

const apiURL = "https://www.googleapis.com/books/v1/volumes?q=intitle:"

// filter out non-desired books from google books api search
function filterGoogleBooks(allFoundBooks) {
    const filteredBooks = allFoundBooks.filter((foundBook) => {
        // book has to have: title, author(s), date of publishing, ISBN and cover image
        const book = foundBook.volumeInfo;
        const hasAllData = book
            && book.title
            && Array.isArray(book.authors) 
            && book.publishedDate
            && Array.isArray(book.industryIdentifiers)
            && book.imageLinks;

        // book has to have ISBN 13
        const hasIsbn13 = hasAllData && book.industryIdentifiers.some(({type}) => type == 'ISBN_13');
        
        // book cannot have specific words in the title 
        const keywords = ["summary", "boxed set", "collector's", "special edition"];
        const titleIncludes = (keyword) => book.title.toLowerCase().includes(keyword);
        const checkedTitle = keywords.some(titleIncludes);
    
        return hasAllData && hasIsbn13 && !checkedTitle;
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
    // console.log(displayedBooks);
    return displayedBooks
}

let searchBooks = [];
// using intitle only for now 
app.post("/submit", async (req, res) => {
    try {
        const response = await axios.get(apiURL + encodeURIComponent(req.body.input));
        const cleanBooks = filterGoogleBooks(response.data.items);
        searchBooks = displayGoogleBooks(cleanBooks);
        res.render("index.ejs", {searchBooks: searchBooks})

    } catch (error) {
        console.error(error);
    }
})

let chosenBook = {};
// create new book based on search
app.get("/new-book/:isbn", (req, res) => {
    const foundBook = searchBooks.find(({isbn}) => isbn === req.params.isbn);
    chosenBook = foundBook;
    res.render("new-book.ejs", {book: foundBook});
})

// add new book to the bookshelf (on homepage)
app.post("/add-new-book", async (req, res) => {
    console.log(chosenBook);
    const b = chosenBook
    await db.query("INSERT INTO books_test (title, author, isbn, cover_url) VALUES ($1, $2, $3, $4)", [b.title, b.authors[0], b.isbn, b.cover]);
    res.redirect("/");
})


app.listen(port, () => {
    console.log(`Server running on port ${port}.`)
})