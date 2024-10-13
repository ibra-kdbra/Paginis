// Initialize IndexedDB
let db;
const request = indexedDB.open("QuotesDB", 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  db.createObjectStore("quotes", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;
  loadQuotes(); // Load existing quotes when the database is ready
};

function loadQuotes() {
  const transaction = db.transaction("quotes", "readonly");
  const store = transaction.objectStore("quotes");
  const request = store.getAll();

  request.onsuccess = function(event) {
    const quotes = event.target.result;
    displayQuotes(quotes);
  };
}

function displayQuotes(quotes) {
  const quoteList = $("#quoteList");
  quoteList.empty(); // Clear the current list

  quotes.forEach(quote => {
    quoteList.append(`<div class="quote-item">${quote.quote}</div>`);
  });
}

// Add a new quote
$("#addQuoteBtn").on("click", function() {
  const newQuote = $("#quoteInput").val();

  if (newQuote) {
    const transaction = db.transaction("quotes", "readwrite");
    const store = transaction.objectStore("quotes");

    store.add({ quote: newQuote });

    // Clear the input field
    $("#quoteInput").val("");

    // Reload quotes
    loadQuotes();
  } else {
    alert("Please enter a quote.");
  }
});

// Toggle quote panel visibility
$("#toggleQuotePanelBtn").on("click", function() {
  $("#quotePanel").toggleClass("hidden");
});
