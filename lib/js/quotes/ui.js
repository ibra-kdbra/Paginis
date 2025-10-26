import { getAllQuotes } from './db.js';

export function displayQuotes(quotes) {
  const quoteList = $("#quoteList");
  quoteList.empty(); // Clear the current list

  quotes.forEach(quote => {
    quoteList.append(`
      <div class="quote-item">
        <span class="quote-text">${quote.quote}</span>
        <div class="quote-actions">
          <button class="panel-button editQuoteBtn" data-id="${quote.id}" title="Edit Quote">
            <i class="fas fa-edit"></i>
          </button>
          <button class="panel-button deleteQuoteBtn" data-id="${quote.id}" title="Delete Quote">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
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
  // This function is now handled by the unified panel system
  // The quotes section is always visible when the panel is open
  console.log("Quotes panel toggle - now handled by unified panel");
}

export function closeQuotePanelOnClickOutside() {
  // This function is now handled by the unified panel system
  console.log("Quote panel click outside - now handled by unified panel");
}
