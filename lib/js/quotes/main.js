import { getAllQuotes, addOrUpdateQuote, deleteQuote } from './db.js';
import { displayQuotes, exportQuotes, toggleQuotePanel, closeQuotePanelOnClickOutside } from './ui.js';

// Load existing quotes when the database is ready
function loadQuotes() {
  getAllQuotes(displayQuotes);
}

// Ensure that the database is initialized before doing anything
function initializeApp() {
  if (window.dbInitialized) {
    loadQuotes();
    setTimeout(initializeApp, 100); // Retry until the DB is initialized
  }
}

// Add a new quote or update an existing one
$("#addQuoteBtn").on("click", function() {
  const quoteId = $(this).data("id");
  const newQuote = $("#quoteInput").val().trim();

  if (newQuote) {
    addOrUpdateQuote(quoteId, newQuote, () => {
      loadQuotes();
      $("#quoteInput").val("");
      $(this).data("id", null).text("Add");
    });
  } else {
    alert("Please enter a quote.");
  }
});

// Edit a quote
$(document).on("click", ".editQuoteBtn", function() {
  const id = $(this).data("id");
  const transaction = db.transaction("quotes", "readonly");
  const store = transaction.objectStore("quotes");

  store.get(id).onsuccess = function(event) {
    const quote = event.target.result;
    $("#quoteInput").val(quote.quote);
    $("#addQuoteBtn").data("id", id).text("Update");
  };
});

$(document).on("click", ".deleteQuoteBtn", function() {
  const id = $(this).data("id");
  deleteQuote(id, loadQuotes);
});

$("#exportQuotesBtn").on("click", exportQuotes);

$("#toggleQuotePanelBtn").on("click", toggleQuotePanel);

closeQuotePanelOnClickOutside();

// Initialize app once the database is ready
initializeApp();
