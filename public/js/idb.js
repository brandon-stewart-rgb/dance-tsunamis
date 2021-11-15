let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;

    db.createObjectStore('new_expense', { autoIncrement: true })
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.online) {
        checkDatabase();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode)
};

function saveRecord(record) {
    const transaction = db.transaction(['new_expense'], 'readwrite');

    const expenseObjectStore = transaction.objectStore('new_expense');

    expenseObjectStore.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(['new_expense'], 'readwrite');

    const expenseObjectStore = transaction.objectStore('new_expense');

    const getAll = expenseObjectStore.getAll();
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            console.log(JSON.stringify(getAll.result))
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*', 'Content-Type': 'application/json'
                }
            })
                .then(response => {
                    console.log(response)
                    return response.json()
                })
                .then((serverResponse) => {
                    if(serverResponse.message){
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['new_expense'], 'readwrite');

                    const expenseObjectStore = transaction.objectStore('new_expense');

                    expenseObjectStore.clear();

                    alert('Transactions have been submitted')
                })
                .catch(err => console.log(err));
        }
    }
};
window.addEventListener('online', checkDatabase)