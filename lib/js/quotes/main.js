import { getAllQuotes, addOrUpdateQuote, deleteQuote, getQuotesByPdf, getQuoteById } from './db.js';
import { displayQuotes, exportQuotes, displayQuotesInModal, exportPdfQuotes } from './ui.js';

// Initialize PDF context from localStorage if valid data exists
const storedPdf = localStorage.getItem('lastOpenedPDF');
const storedPdfType = localStorage.getItem('lastOpenedPDFType');
if (storedPdf && storedPdf.trim() !== '') {
  window.currentPdf = storedPdf;
}
if (storedPdfType) {
  window.currentPdfType = storedPdfType;
}

// Expose the update function globally so it can be called from load.js
window.updateCurrentPdfContext = updateCurrentPdfContext;

// Ensure the database is initialized before doing anything
function initializeApp() {
  if (window.dbInitialized) {
    loadQuotes();
        // Load current PDF context
        updateCurrentPdfContext();
  } else {
    // Retry after a short delay if the DB isn't initialized yet
    setTimeout(initializeApp, 100);
  }
}

function updateCurrentPdfContext() {
  // This will be called when a PDF is loaded to update the context
  const pdfUrl = window.currentPdf || '';
  let pdfName = '';

  if (pdfUrl) {
    if (pdfUrl.startsWith('blob:')) {
      pdfName = 'Local PDF';
    } else {
      try {
        // Try to parse as URL for remote PDFs
        const url = new URL(pdfUrl);
        pdfName = url.hostname;
      } catch (e) {
        // If it's not a valid URL, it's probably a local filename
        pdfName = 'Local PDF';
      }
    }
  }

  $("#currentPdfInfo").text(pdfName || 'No PDF loaded');

  // Update quotes button state
  const quotesToggleBtn = $("#quotesToggleBtn");
  if (pdfUrl) {
    quotesToggleBtn.prop('title', `View quotes for ${pdfName}`);
    quotesToggleBtn.find('i').removeClass('fa-quote-left').addClass('fa-list');
  } else {
    quotesToggleBtn.prop('title', 'Load a PDF to view quotes');
    quotesToggleBtn.find('i').removeClass('fa-list').addClass('fa-quote-left');
  }
}

function loadQuotes() {
  getAllQuotes(displayQuotes);
}

$("#addQuoteBtn").on("click", function() {
  const quoteId = $(this).data("id");
  const newQuote = $("#quoteInput").val().trim();

  if (newQuote) {
    // Get current PDF context
    const pdfUrl = window.currentPdf || '';
    let pdfName = '';

    if (pdfUrl) {
      if (pdfUrl.startsWith('blob:')) {
        pdfName = 'Local PDF';
      } else {
        try {
          const url = new URL(pdfUrl);
          pdfName = url.hostname;
        } catch (e) {
          pdfName = 'Local PDF';
        }
      }
    }

  

    addOrUpdateQuote(quoteId, newQuote, pdfUrl, pdfName, null, () => {

      loadQuotes();
      $("#quoteInput").val("").removeClass("ring-2 ring-blue-400");
      $(this).data("id", null).html('<i class="fas fa-plus"></i>').attr("title", "Add Quote");
    });
  } else {
    alert("Please enter a quote.");
  }
});

$(document).on("click", ".editQuoteBtn", function(event) {
  event.stopPropagation();
  event.preventDefault();
  const id = $(this).data("id");
  const button = $(this);


  if (!window.dbInitialized) {
    alert("Database not ready. Please try again.");
    return;
  }

  // Add loading state to button
  button.html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);

  getQuoteById(id, (quote) => {
    if (quote) {

      // Populate the input field with the current quote text
      $("#quoteInput").val(quote.quote).focus();

      // Change the add button to update button
      $("#addQuoteBtn").data("id", id).html('<i class="fas fa-save"></i>').attr("title", "Update Quote");

      // Close modal immediately if open
      const modal = $("#pdfSpecificQuotesModal");
      if (modal.hasClass("open")) {
        modal.removeClass("open").css({
          'display': 'none',
          'visibility': 'hidden',
          'opacity': '0'
        });
      }

      // Reset button state
      button.html('<i class="fas fa-edit"></i>').prop('disabled', false);


    } else {
      console.error("Quote not found with ID:", id);
      alert("Quote not found. Please try again.");
      button.html('<i class="fas fa-edit"></i>').prop('disabled', false);
    }
  });
});

$(document).on("click", ".deleteQuoteBtn", function(event) {
  event.stopPropagation();
  const id = $(this).data("id");
  const button = $(this);

  if (confirm("Are you sure you want to delete this quote?")) {
    // Add loading state to button
    button.html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);

    deleteQuote(id, () => {


      // Update main quotes list immediately
      loadQuotes();

      // Update modal content immediately if open
      const modal = $("#pdfSpecificQuotesModal");
      if (modal.hasClass("open") && window.currentPdf) {
        getQuotesByPdf(window.currentPdf, (quotes) => {
          displayQuotesInModal(quotes);
        });
      }

      // Reset button state
      button.html('<i class="fas fa-trash"></i>').prop('disabled', false);
    });
  }
});

$("#exportQuotesBtn").on("click", exportQuotes);

$(document).on("click", "#modalExportQuotesBtn", function(event) {
  event.stopPropagation();
  event.preventDefault();
  const button = $(this);

  let pdfName = '';
  if (window.currentPdf) {
    if (window.currentPdf.startsWith('blob:')) {
      pdfName = 'Local PDF';
    } else {
      try {
        const url = new URL(window.currentPdf);
        pdfName = url.hostname;
      } catch (e) {
        pdfName = 'Local PDF';
      }
    }
  }

  if (window.currentPdf) {
    // Add loading state to button
    button.html('<i class="fas fa-spinner fa-spin"></i>').prop('disabled', true);

    getQuotesByPdf(window.currentPdf, (quotes) => {

      exportPdfQuotes(quotes, pdfName);

      // Reset button state
      button.html('<i class="fas fa-download"></i>').prop('disabled', false);
    });
  } else {
    alert("No PDF loaded to export quotes from!");
  }
});

// PDF-specific quotes functionality
$("#quotesToggleBtn").on("click", function() {
  showPdfSpecificQuotesModal();
});

function showPdfSpecificQuotesModal() {
  const modal = $("#pdfSpecificQuotesModal");
  const modalQuoteList = $("#modalQuoteList");

  // Apply current theme to modal
  const currentTheme = window.themeManager ? window.themeManager.getCurrentTheme() : 'default';
  const themeClass = `theme-${currentTheme}`;
  modal.addClass(`${themeClass} theme-applied`);
  $('.modal-content, .modal-header, .modal-body, .modal-loading').addClass(`${themeClass} theme-applied`);

  // Show loading state
  modalQuoteList.html(`
    <div class="modal-loading ${themeClass} theme-applied">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Loading quotes...</p>
    </div>
  `);

  modal.addClass("open");

  // Force a style recalculation and ensure visibility
  modal.hide().show(0);

  // Add inline styles as a test to ensure modal is visible
  modal.css({
    'display': 'flex',
    'visibility': 'visible',
    'opacity': '1',
    'z-index': '1000000'
  });

  if (window.currentPdf) {
    // Ensure database is initialized
    if (!window.dbInitialized) {
      modalQuoteList.html(`
        <div class="no-quotes-modal ${themeClass} theme-applied">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Database Not Ready</h3>
          <p>Please wait for the application to fully load and try again.</p>
        </div>
      `);
      return;
    }

    // Get quotes for current PDF
    getQuotesByPdf(window.currentPdf, (quotes) => {
      displayQuotesInModal(quotes);
    });
  } else {
    modalQuoteList.html(`
      <div class="no-quotes-modal ${themeClass} theme-applied">
        <i class="fas fa-file-pdf"></i>
        <h3>No PDF Loaded</h3>
        <p>Load a PDF document first to view its quotes here.</p>
      </div>
    `);
  }
}

// Close modal functionality
$(document).on("click", ".modal-close", function(event) {
  event.stopPropagation(); // Prevent event bubbling
  event.preventDefault(); // Prevent default action

  $("#pdfSpecificQuotesModal").removeClass("open").css({
    'display': 'none',
    'visibility': 'hidden',
    'opacity': '0'
  });
});

// Prevent modal clicks from bubbling up to canvas - comprehensive coverage
$(document).on("click", "#pdfSpecificQuotesModal", function(event) {
  event.stopPropagation();
});

$(document).on("click", ".modal-content", function(event) {
  event.stopPropagation();
});

$(document).on("click", ".modal-header", function(event) {
  event.stopPropagation();
});

$(document).on("click", ".modal-body", function(event) {
  event.stopPropagation();
});

$(document).on("click", ".modal-quote-list", function(event) {
  event.stopPropagation();
});

$(document).on("click", ".modal-quotes-header", function(event) {
  event.stopPropagation();
});

$(document).on("click", ".modal-quote-item", function(event) {
  event.stopPropagation();
});

$(document).on("click", ".modal-quote-content", function(event) {
  event.stopPropagation();
});

$(document).on("click", ".modal-quote-actions", function(event) {
  event.stopPropagation();
});

$(document).on("click", ".modal-quote-text", function(event) {
  event.stopPropagation();
});

$(document).on("click", ".modal-quote-meta", function(event) {
  event.stopPropagation();
});

// More robust click-outside detection with timeout to prevent immediate closing
let modalCloseTimeout;

$(document).on("click", function(event) {
  const modal = $("#pdfSpecificQuotesModal");

  if (!modal.hasClass("open")) {
    return; // Modal is not open, nothing to do
  }

  // Get the actual click target and its hierarchy
  const target = $(event.target);
  const targetClasses = target.attr('class') || '';
  const targetId = target.attr('id') || '';

  // Define all elements that should be considered "inside" the modal
  const modalElements = [
    'modal-container',
    'modal-content',
    'modal-header',
    'modal-body',
    'modal-quote-list',
    'modal-quotes-header',
    'modal-header-left',
    'modal-header-actions',
    'modal-export-btn',
    'modal-quote-item',
    'modal-quote-content',
    'modal-quote-text',
    'modal-quote-meta',
    'modal-quote-timestamp',
    'modal-quote-pdf',
    'modal-quote-page',
    'modal-quote-actions',
    'modal-close',
    'panel-button',
    'editQuoteBtn',
    'deleteQuoteBtn',
    'quotes-count'
  ];

  // Check if click target is part of the modal or its children
  const isModalElement = modalElements.some(className =>
    target.hasClass(className) ||
    target.closest(`.${className}`).length > 0 ||
    target.is(`.${className}`) ||
    target.closest(`#${targetId}`).length > 0
  );

  // Also check coordinates as backup
  const clickX = event.clientX;
  const clickY = event.clientY;
  const modalOffset = modal.offset();
  const modalWidth = modal.outerWidth();
  const modalHeight = modal.outerHeight();
  const modalLeft = modalOffset.left;
  const modalTop = modalOffset.top;
  const modalRight = modalLeft + modalWidth;
  const modalBottom = modalTop + modalHeight;
  const isInsideModal = clickX >= modalLeft && clickX <= modalRight &&
                       clickY >= modalTop && clickY <= modalBottom;

  // Clear any existing timeout
  if (modalCloseTimeout) {
    clearTimeout(modalCloseTimeout);
  }

  // Only close modal if click is clearly outside both element hierarchy and boundaries
  if (!isModalElement && !isInsideModal) {
    modalCloseTimeout = setTimeout(() => {
      if (modal.hasClass("open")) {
        modal.removeClass("open");
      }
    }, 100); // Small delay to allow other handlers to process first
  }
});

// Add error handling for uncaught errors
window.addEventListener('error', function(event) {
  console.error('Global error:', event.error);
});

// Add unhandled promise rejection handling
window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled promise rejection:', event.reason);
});

// Initialize app once the database is ready
initializeApp();
