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
      <li class="quote-item flex items-center justify-between mb-2">
        <span class="quote-text">${quote.quote}</span> <!-- Use class for truncation -->
        <div class="flex space-x-2">
          <button class="editQuoteBtn px-2 py-1 bg-gray-800 text-white border border-gray-600 rounded-md shadow-md hover:bg-gray-700 transition-all" data-id="${quote.id}">Edit</button>
          <button class="deleteQuoteBtn px-2 py-1 bg-slate-900 text-white border border-slate-700 rounded-md shadow-md hover:bg-slate-800 transition-all" data-id="${quote.id}">Delete</button>
        </div>
      </li>
    `);
  });
}


// Add a new quote or update an existing one
$("#addQuoteBtn").on("click", function() {
  const quoteId = $(this).data("id");
  const newQuote = $("#quoteInput").val().trim(); 

  console.log("Input Value:", newQuote);
  
  if (newQuote) {
    const transaction = db.transaction("quotes", "readwrite");
    const store = transaction.objectStore("quotes");

    if (quoteId) {
      // Update the existing quote
      store.put({ id: quoteId, quote: newQuote });
      $(this).data("id", null).text("Add");
    } else {
      // Add a new quote
      store.add({ quote: newQuote });
    }

    $("#quoteInput").val("");

    loadQuotes();
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
    $("#quoteNotesPanel").toggleClass("hidden");
  
    if ($("#quoteNotesPanel").hasClass("hidden")) {
      $(this).text("Quotes"); 
    } else {
      $(this).text("Hide Quotes");
    }
  });
  
  // Ensure clicking outside the panel closes it
  $(document).on("click", function(event) {
    if (!$(event.target).closest("#quoteNotesPanel").length && !$(event.target).is("#toggleQuotePanelBtn")) {
      $("#quoteNotesPanel").addClass("hidden"); 
      $("#toggleQuotePanelBtn").text("Quotes"); 
    }
  });
  
