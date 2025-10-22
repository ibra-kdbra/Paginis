import { getAllQuotes } from './db.js';

export function displayQuotes(quotes) {
  const quoteList = $("#quoteList");
  quoteList.empty(); // Clear the current list

  quotes.forEach(quote => {
    quoteList.append(`
      <li class="quote-item flex items-center justify-between mb-2">
        <span class="quote-text">${quote.quote}</span>
        <div class="flex space-x-2">
          <button class="editQuoteBtn px-2 py-1 bg-gray-800 text-white border border-gray-600 rounded-md shadow-md hover:bg-gray-700 transition-all" data-id="${quote.id}" title="Edit Quote">
            <i class="fas fa-edit"></i>
          </button>
          <button class="deleteQuoteBtn px-2 py-1 bg-slate-900 text-white border border-slate-700 rounded-md shadow-md hover:bg-slate-800 transition-all" data-id="${quote.id}" title="Delete Quote">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </li>
    `);
  });
}

export function exportQuotes() {
  getAllQuotes((quotes) => {
    if (quotes.length === 0) {
      alert("No quotes to export!");
      return;
    }

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
  });
}


export function toggleQuotePanel() {
  $("#quoteNotesPanel").toggleClass("hidden");

  if ($("#quoteNotesPanel").hasClass("hidden")) {
    $("#toggleQuotePanelBtn").html('<i class="fas fa-quote-left"></i>').attr("title", "Toggle Quotes Panel");
  } else {
    $("#toggleQuotePanelBtn").html('<i class="fas fa-quote-left"></i>').attr("title", "Hide Quotes Panel");
  }
}

export function closeQuotePanelOnClickOutside() {
  $(document).on("click", function(event) {
    if (!$(event.target).closest("#quoteNotesPanel").length && !$(event.target).is("#toggleQuotePanelBtn")) {
      $("#quoteNotesPanel").addClass("hidden");
      $("#toggleQuotePanelBtn").html('<i class="fas fa-quote-left"></i>').attr("title", "Toggle Quotes Panel");
    }
  });
}
