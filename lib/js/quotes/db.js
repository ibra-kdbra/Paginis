let db;

// Initialize IndexedDB
const request = indexedDB.open("QuotesDB", 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  // Create object store only if it doesn't exist already
  if (!db.objectStoreNames.contains("quotes")) {
    db.createObjectStore("quotes", { keyPath: "id", autoIncrement: true });
  }
};

request.onsuccess = function(event) {
  db = event.target.result;
  // Ensure the database is ready before interacting with it
  window.dbInitialized = true;
};

// Get all quotes from the database
export function getAllQuotes(callback) {
  if (window.dbInitialized) {
    const transaction = db.transaction("quotes", "readonly");
    const store = transaction.objectStore("quotes");
    const request = store.getAll();

    request.onsuccess = function(event) {
      callback(event.target.result);
    };
  } else {
    console.error("Database is not initialized yet.");
  }
}

// Add or update a quote
export function addOrUpdateQuote(id, quote, callback) {
  if (window.dbInitialized) {
    const transaction = db.transaction("quotes", "readwrite");
    const store = transaction.objectStore("quotes");

    if (id) {
      // Update the existing quote
      store.put({ id, quote });
    } else {
      // Add a new quote
      store.add({ quote });
    }

    transaction.oncomplete = function() {
      callback();
    };
  } else {
    console.error("Database is not initialized yet.");
  }
}

// Delete a quote
export function deleteQuote(id, callback) {
  if (window.dbInitialized) {
    const transaction = db.transaction("quotes", "readwrite");
    const store = transaction.objectStore("quotes");

    store.delete(id).onsuccess = function() {
      callback();
    };
  } else {
    console.error("Database is not initialized yet.");
  }
}