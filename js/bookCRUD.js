
// ==========================================
// LOCAL STORAGE HELPER FUNCTIONS
// ==========================================

function getBooksData() {
    var jsonString = localStorage.getItem("myBooks");

    if (!jsonString) {
        return { books: [] };
    }

    return JSON.parse(jsonString);
}

function saveBooksData(jsonObj) {
    localStorage.setItem("myBooks", JSON.stringify(jsonObj));
}


// ==========================================
// DISPLAY ALL BOOKS
// ==========================================

var currentPage = 1;
var booksPerPage = 5;

function getAllBooks() {
    var jsonObj = getBooksData();
    var books = jsonObj.books;

    var tbody = document.getElementsByTagName("tbody")[0];

    tbody.innerHTML = "";

    // Display total book count
    var countElement = document.getElementById("bookCount");

    if (countElement) {
        countElement.innerText = "Total Books: " + books.length;
    }

    // Empty books message
    if (books.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No books available.
                </td>
            </tr>
        `;
        return;
    }

    var startIndex = (currentPage - 1) * booksPerPage;
    var endIndex = startIndex + booksPerPage;

    var paginatedBooks = books.slice(startIndex, endIndex);

    paginatedBooks.forEach(function(book) {

        var trow = document.createElement("tr");

        trow.innerHTML = `
            <th scope="row">${escapeHTML(book.bookId)}</th>
            <td>${escapeHTML(book.bookTitle)}</td>
            <td>${escapeHTML(book.authorName)}</td>
            <td>${escapeHTML(book.publisherName)}</td>
            <td class="table_buttons">
                <a class="edit"
                   href="adminBooksEdit.html"
                   onclick="rememberBook('${book.bookId}')"
                   title="Edit Book">
                    <i class="material-icons">edit</i>
                </a>

                <a class="delete"
                   href="adminBooks.html"
                   onclick="deleteBookHandler('${book.bookId}')"
                   title="Delete Book">
                    <i class="material-icons">delete</i>
                </a>
            </td>
        `;

        tbody.appendChild(trow);
    });

    updatePagination(books.length);
}


// Prevent HTML injection when displaying book data
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}


// ==========================================
// ADD BOOK
// ==========================================

function addBookHandler() {

    var bookTitle = document.getElementById("addBookTitle").value.trim();
    var bookAuthor = document.getElementById("addBookAuthor").value.trim();
    var bookPublisher = document.getElementById("addBookPublisher").value.trim();

    if (!validateBook(bookTitle, bookAuthor, bookPublisher)) {
        return;
    }

    var jsonObj = getBooksData();

    // Prevent duplicate titles
    var duplicate = jsonObj.books.some(function(book) {
        return book.bookTitle.toLowerCase() === bookTitle.toLowerCase();
    });

    if (duplicate) {
        alert("A book with this title already exists.");
        return;
    }

    // Generate unique ID
    var nextId = jsonObj.books.length > 0
        ? Math.max(...jsonObj.books.map(book => Number(book.bookId))) + 1
        : 1;

    var saveObj = {
        bookId: nextId,
        bookTitle: bookTitle,
        authorName: bookAuthor,
        publisherName: bookPublisher
    };

    jsonObj.books.push(saveObj);

    saveBooksData(jsonObj);

    alert("Book added successfully!");

    window.location.href = "adminBooks.html";
}


// ==========================================
// COMMON VALIDATION
// ==========================================

function validateBook(title, author, publisher) {

    if (title === "" || author === "" || publisher === "") {
        alert("Fields cannot be empty.");
        return false;
    }

    if (title.length > 25 || author.length > 25 || publisher.length > 25) {
        alert("Fields cannot exceed 25 characters.");
        return false;
    }

    return true;
}


// ==========================================
// REMEMBER SELECTED BOOK FOR EDITING
// ==========================================

function rememberBook(id) {

    var jsonObj = getBooksData();

    var selectedBook = jsonObj.books.find(function(book) {
        return String(book.bookId) === String(id);
    });

    if (!selectedBook) {
        alert("Book not found.");
        return;
    }

    localStorage.setItem("bookToEdit", JSON.stringify(selectedBook));
}


// ==========================================
// FILL EDIT FORM
// ==========================================

function fillSelectedBook() {

    var objString = localStorage.getItem("bookToEdit");

    if (!objString) {
        alert("No book selected for editing.");
        window.location.href = "adminBooks.html";
        return;
    }

    var obj = JSON.parse(objString);

    document.getElementById("editBookTitle").value = obj.bookTitle;
    document.getElementById("editBookAuthor").value = obj.authorName;
    document.getElementById("editBookPublisher").value = obj.publisherName;
}


// ==========================================
// UPDATE BOOK
// ==========================================

function updateBookHandler() {

    var newBookTitle = document.getElementById("editBookTitle").value.trim();
    var newBookAuthor = document.getElementById("editBookAuthor").value.trim();
    var newBookPublisher = document.getElementById("editBookPublisher").value.trim();

    if (!validateBook(newBookTitle, newBookAuthor, newBookPublisher)) {
        return;
    }

    var objString = localStorage.getItem("bookToEdit");

    if (!objString) {
        alert("No book selected.");
        return;
    }

    var selectedBook = JSON.parse(objString);

    var jsonObj = getBooksData();

    // Check duplicate title, excluding current book
    var duplicate = jsonObj.books.some(function(book) {
        return String(book.bookId) !== String(selectedBook.bookId) &&
            book.bookTitle.toLowerCase() === newBookTitle.toLowerCase();
    });

    if (duplicate) {
        alert("Another book with this title already exists.");
        return;
    }

    var book = jsonObj.books.find(function(book) {
        return String(book.bookId) === String(selectedBook.bookId);
    });

    if (!book) {
        alert("Book not found.");
        return;
    }

    book.bookTitle = newBookTitle;
    book.authorName = newBookAuthor;
    book.publisherName = newBookPublisher;

    saveBooksData(jsonObj);

    localStorage.removeItem("bookToEdit");

    alert("Book updated successfully!");

    window.location.href = "adminBooks.html";
}


// ==========================================
// DELETE BOOK
// ==========================================

function deleteBookHandler(id) {

    if (!confirm("Are you sure you want to delete this book?")) {
        return false;
    }

    var jsonObj = getBooksData();

    var initialLength = jsonObj.books.length;

    jsonObj.books = jsonObj.books.filter(function(book) {
        return String(book.bookId) !== String(id);
    });

    if (jsonObj.books.length === initialLength) {
        alert("Book not found.");
        return false;
    }

    saveBooksData(jsonObj);

    alert("Book deleted successfully!");

    return true;
}


// ==========================================
// SEARCH BOOKS
// ==========================================

function searchBooks() {

    var searchValue = document.getElementById("searchBook").value.toLowerCase();

    var jsonObj = getBooksData();

    var filteredBooks = jsonObj.books.filter(function(book) {

        return book.bookTitle.toLowerCase().includes(searchValue) ||
            book.authorName.toLowerCase().includes(searchValue) ||
            book.publisherName.toLowerCase().includes(searchValue);
    });

    displayFilteredBooks(filteredBooks);
}

function displayFilteredBooks(books) {

    var tbody = document.getElementsByTagName("tbody")[0];

    tbody.innerHTML = "";

    if (books.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align:center;">
                    No matching books found.
                </td>
            </tr>
        `;
        return;
    }

    books.forEach(function(book) {

        var trow = document.createElement("tr");

        trow.innerHTML = `
            <th>${escapeHTML(book.bookId)}</th>
            <td>${escapeHTML(book.bookTitle)}</td>
            <td>${escapeHTML(book.authorName)}</td>
            <td>${escapeHTML(book.publisherName)}</td>
            <td>
                <a href="adminBooksEdit.html"
                   onclick="rememberBook('${book.bookId}')">
                    <i class="material-icons">edit</i>
                </a>

                <a href="adminBooks.html"
                   onclick="deleteBookHandler('${book.bookId}')">
                    <i class="material-icons">delete</i>
                </a>
            </td>
        `;

        tbody.appendChild(trow);
    });
}


// ==========================================
// SORT BOOKS
// ==========================================

function sortBooks(field, order) {

    var jsonObj = getBooksData();

    jsonObj.books.sort(function(a, b) {

        var valueA = a[field].toLowerCase();
        var valueB = b[field].toLowerCase();

        if (valueA < valueB) return order === "asc" ? -1 : 1;
        if (valueA > valueB) return order === "asc" ? 1 : -1;

        return 0;
    });

    saveBooksData(jsonObj);

    currentPage = 1;

    getAllBooks();
}


// ==========================================
// CLEAR ALL BOOKS
// ==========================================

function clearAllBooks() {

    if (!confirm("Are you sure you want to delete ALL books?")) {
        return;
    }

    saveBooksData({ books: [] });

    currentPage = 1;

    alert("All books deleted successfully!");

    getAllBooks();
}


// ==========================================
// RESET ADD BOOK FORM
// ==========================================

function resetBookForm() {

    document.getElementById("addBookTitle").value = "";
    document.getElementById("addBookAuthor").value = "";
    document.getElementById("addBookPublisher").value = "";
}


// ==========================================
// EXPORT BOOKS TO CSV
// ==========================================

function exportBooksToCSV() {

    var jsonObj = getBooksData();

    if (jsonObj.books.length === 0) {
        alert("No books available to export.");
        return;
    }

    var csvData = [
        ["Book ID", "Book Title", "Author", "Publisher"],
        ...jsonObj.books.map(function(book) {
            return [
                book.bookId,
                book.bookTitle,
                book.authorName,
                book.publisherName
            ];
        })
    ];

    var csvContent = csvData.map(function(row) {
        return row.map(function(value) {
            return '"' + String(value).replace(/"/g, '""') + '"';
        }).join(",");
    }).join("\n");

    var blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    var link = document.createElement("a");

    link.href = URL.createObjectURL(blob);
    link.download = "books.csv";

    link.click();

    URL.revokeObjectURL(link.href);
}


// ==========================================
// PAGINATION
// ==========================================

function updatePagination(totalBooks) {

    var totalPages = Math.ceil(totalBooks / booksPerPage);

    var pagination = document.getElementById("pagination");

    if (!pagination) return;

    pagination.innerHTML = "";

    for (var i = 1; i <= totalPages; i++) {

        var button = document.createElement("button");

        button.innerText = i;
        button.className = "page-button";

        if (i === currentPage) {
            button.disabled = true;
        }

        button.onclick = function() {
            currentPage = Number(this.innerText);
            getAllBooks();
        };

        pagination.appendChild(button);
    }
}
