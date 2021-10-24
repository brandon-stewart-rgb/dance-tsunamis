let db;
const request = indexedDB.open('budget_tracker', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_budget', { autoIncrement: true });
};

request.onsuccess = function(event) {
  // when db is successfully created with its object store 
  // (from onupgradedneeded event above), save reference to db in global variable
  db = event.target.result;

  // check if  our budget app is online, if yes run checkDatabase() function to send all local db data to api
  if (navigator.onLine) {
    uploadBudget();
  }
};

request.onerror = function(event) {
  // log error here
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const transaction = db.transaction(['new_budget'], 'readwrite');

  const budgetObjectStore = transaction.objectStore('new_budget');

  // add record to your store with add method.
  budgetObjectStore.add(record);
}

function uploadBudget() {
    // open a transaction on our pending db
    const transaction = db.transaction(['new_budget'], 'readwrite');

    // access our pending object store
    const budgetObjectStore = transaction.objectStore('new_budget');

    // get all records from store and set to a var
    const getAll = budgetObjectStore.getAll();

    getAll.onsuccess = function() {
        // if there was data in indexedDb's store, send it to the api server
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if (serverResponse.message) {
                    throw new Error(serverResponse);
                }

                const transaction = db.transaction(['new_budget'], 'readwrite');
                const budgetObjectStore = transaction.objectStore('new_budget');
                // clear all items in store
                budgetObjectStore.clear();
            })
            .catch(err => {
                // set reference to redirect back here
                console.log(err);
            })
           
        }
    };
}

// listen for budget app to come back online
window.addEventListener('online', uploadBudget);