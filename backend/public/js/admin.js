// Function to display items
function displayItems() {
    fetch('/api/items', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`, // Authorization header with JWT token
        }
    })
    .then(response => response.json())
    .then(items => {
        const itemCardsContainer = document.getElementById('item-cards');
        itemCardsContainer.innerHTML = ''; // Clear existing items
        items.forEach(item => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="card-body">
                    <h5>${item.name}</h5>
                    <p>${item.description}</p>
                    <p>Price: $${item.price}</p>
                    <button class="btn" onclick="editItem(${item._id})">Edit</button>
                    <button class="btn" onclick="deleteItem(${item._id})">Delete</button>
                </div>
            `;
            itemCardsContainer.appendChild(card);
        });
    })
    .catch(error => console.error('Error fetching items:', error));
}

// Function to save or edit an item
function saveItem(itemData, itemId = '') {
    const token = localStorage.getItem('jwtToken');

    let url = '/api/items';
    let method = 'POST';

    if (itemId) {
        url = `/api/items/${itemId}`;
        method = 'PUT';
    }

    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(itemData)
    })
    .then(response => response.json())
    .then(data => {
        displayItems(); // Refresh items
        closeForm();    // Close the form
    })
    .catch(error => console.error('Error:', error));
}

// Function to delete an item
function deleteItem(itemId) {
    const token = localStorage.getItem('jwtToken');

    fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message);
        displayItems(); // Refresh items after deletion
    })
    .catch(error => console.error('Error:', error));
}

// Function to edit an item
function editItem(itemId) {
    const token = localStorage.getItem('jwtToken');

    fetch(`/api/items/${itemId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
        }
    })
    .then(response => response.json())
    .then(item => {
        // Set the form values to the selected item's data
        document.getElementById('item-id').value = item._id;
        document.getElementById('item-name').value = item.name;
        document.getElementById('item-description').value = item.description;
        document.getElementById('item-image').value = item.image;
        document.getElementById('item-price').value = item.price;

        // Show the form
        document.getElementById('item-form').style.display = 'block';
    })
    .catch(error => console.error('Error:', error));
}

// Function to close the form
function closeForm() {
    document.getElementById('item-form').style.display = 'none';
}

// Event listener for the "Add New Item" button
document.getElementById('add-item-btn').addEventListener('click', () => {
    // Clear form fields
    document.getElementById('item-id').value = '';
    document.getElementById('item-name').value = '';
    document.getElementById('item-description').value = '';
    document.getElementById('item-image').value = '';
    document.getElementById('item-price').value = '';

    // Show the form
    document.getElementById('item-form').style.display = 'block';
});

// Event listener for the "Save Item" button
document.getElementById('save-item-btn').addEventListener('click', () => {
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const image = document.getElementById('item-image').value;
    const price = document.getElementById('item-price').value;
    const itemId = document.getElementById('item-id').value;

    const itemData = { name, description, image, price };

    saveItem(itemData, itemId);
});

// Event listener for the "Cancel" button
document.getElementById('cancel-item-btn').addEventListener('click', closeForm);

// Initial call to display items
displayItems();
