import { getAllQuotes, addOrUpdateQuote, deleteQuote } from './db.js';
import { displayQuotes, exportQuotes, toggleQuotePanel, closeQuotePanelOnClickOutside } from './ui.js';

// Ensure the database is initialized before doing anything
function initializeApp() {
  if (window.dbInitialized) {
    loadQuotes();
  } else {
    // Retry after a short delay if the DB isn't initialized yet
    setTimeout(initializeApp, 100);
  }
}

function loadQuotes() {
  getAllQuotes(displayQuotes);
}

$("#addQuoteBtn").on("click", function() {
  const quoteId = $(this).data("id");
  const newQuote = $("#quoteInput").val().trim();

  if (newQuote) {
    addOrUpdateQuote(quoteId, newQuote, () => {
      loadQuotes();
      $("#quoteInput").val("").removeClass("ring-2 ring-blue-400");
      $(this).data("id", null).html('<i class="fas fa-plus"></i>').attr("title", "Add Quote");
    });
  } else {
    alert("Please enter a quote.");
  }
});

$(document).on("click", ".editQuoteBtn", function() {
  const id = $(this).data("id");
  const transaction = db.transaction("quotes", "readonly");
  const store = transaction.objectStore("quotes");

  store.get(id).onsuccess = function(event) {
    const quote = event.target.result;
    if (quote) {
      $("#quoteInput").val(quote.quote).focus();
      $("#addQuoteBtn").data("id", id).html('<i class="fas fa-save"></i>').attr("title", "Update Quote");
      // Add visual feedback that we're in edit mode
      $("#quoteInput").addClass("ring-2 ring-blue-400");
    }
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
