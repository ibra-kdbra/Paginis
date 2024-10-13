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
    quoteList.append(`
      <li class="quote-item">
        <span class="quote-text">${quote.quote}</span> <!-- Use class for truncation -->
        <div>
          <button class="editQuoteBtn px-1 py-1 bg-yellow-500 text-white rounded-lg" data-id="${quote.id}">Edit</button>
          <button class="deleteQuoteBtn px-1 py-1 bg-red-500 text-white rounded-lg" data-id="${quote.id}">Delete</button>
        </div>
      </li>
    `);
  });
}

function displayQuotes(quotes) {
  const quoteList = $("#quoteList");
  quoteList.empty(); // Clear the current list

  quotes.forEach(quote => {
    quoteList.append(`
        <li class="quote-item">
          <div class="quote-container">
            <span class="quote-text">${quote.quote}</span>
            <div class="quote-tooltip">${quote.quote}</div> <!-- Tooltip with full quote -->
          </div>
          <div class="quote-buttons">
            <button class="editQuoteBtn px-1 py-1 bg-yellow-500 text-white rounded-lg" data-id="${quote.id}">Edit</button>
            <button class="deleteQuoteBtn px-1 py-1 bg-red-500 text-white rounded-lg" data-id="${quote.id}">Delete</button>
          </div>
        </li>
      `);
      
            
  });
}

  
  

// Add a new quote or update an existing one
$("#addQuoteBtn").on("click", function() {
  const quoteId = $(this).data("id");
  const newQuote = $("#quoteInput").val().trim(); // Trim whitespace

  console.log("Input Value:", newQuote); // Debugging line to check input
  
  if (newQuote) {
    const transaction = db.transaction("quotes", "readwrite");
    const store = transaction.objectStore("quotes");

    if (quoteId) {
      // Update the existing quote
      store.put({ id: quoteId, quote: newQuote });
      $(this).data("id", null).text("Add"); // Reset button to Add
    } else {
      // Add a new quote
      store.add({ quote: newQuote });
    }

    $("#quoteInput").val("");

    loadQuotes();
  } else {
    alert("Please enter a quote."); // Alert for empty input
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
    $("#addQuoteBtn").data("id", id).text("Update"); // Change button to Update
  };
});

// Delete a quote
$(document).on("click", ".deleteQuoteBtn", function() {
  const id = $(this).data("id");
  const transaction = db.transaction("quotes", "readwrite");
  const store = transaction.objectStore("quotes");

  store.delete(id).onsuccess = function() {
    loadQuotes(); // Reload quotes
  };
});

// Export quotes
$("#exportQuotesBtn").on("click", function() {
  const transaction = db.transaction("quotes", "readonly");
  const store = transaction.objectStore("quotes");

  store.getAll().onsuccess = function(event) {
    const quotes = event.target.result;
    const quotesText = quotes.map(q => q.quote).join('\n');
    const blob = new Blob([quotesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up the URL.createObjectURL
  };
});

// Toggle quote panel visibility
$("#toggleQuotePanelBtn").on("click", function() {
    $("#quoteNotesPanel").toggleClass("hidden"); // Toggle visibility of quote panel
  
    // Check the visibility and update button text accordingly
    if ($("#quoteNotesPanel").hasClass("hidden")) {
      $(this).text("Quotes"); // Change button text to 'Quotes' if hidden
    } else {
      $(this).text("Hide Quotes"); // Change button text to 'Hide Quotes' if visible
    }
  });
  
  // Ensure clicking outside the panel closes it
  $(document).on("click", function(event) {
    if (!$(event.target).closest("#quoteNotesPanel").length && !$(event.target).is("#toggleQuotePanelBtn")) {
      $("#quoteNotesPanel").addClass("hidden"); // Hide the quote panel
      $("#toggleQuotePanelBtn").text("Quotes"); // Reset button text
    }
  });
  
