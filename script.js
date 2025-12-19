// Global variables
let products = [
    {
        id: 1,
        name: "Classic White Shirt",
        price: 49.99,
        category: "men",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop",
        description: "Premium cotton white shirt for men"
    },
    {
        id: 2,
        name: "Elegant Black Dress",
        price: 89.99,
        category: "women",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
        description: "Sophisticated black dress for special occasions"
    },
    {
        id: 3,
        name: "Leather Handbag",
        price: 129.99,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
        description: "Premium leather handbag with multiple compartments"
    },
    {
        id: 4,
        name: "Casual Jeans",
        price: 69.99,
        category: "men",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
        description: "Comfortable casual jeans for everyday wear"
    },
    {
        id: 5,
        name: "Summer Blouse",
        price: 39.99,
        category: "women",
        image: "https://images.unsplash.com/photo-1564257577-0a8c8e0b6e3e?w=400&h=400&fit=crop",
        description: "Light and airy summer blouse"
    },
    {
        id: 6,
        name: "Designer Watch",
        price: 199.99,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop",
        description: "Elegant designer watch with leather strap"
    }
];

let cart = [];
let currentCategory = 'all';
let isAdminMode = false;

// DOM elements
const productGrid = document.getElementById('productGrid');
const cartModal = document.getElementById('cartModal');
const cartBtn = document.getElementById('cartBtn');
const closeCart = document.getElementById('closeCart');
const cartCount = document.getElementById('cartCount');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    updateCartUI();
    setupEventListeners();
});

// Event listeners
function setupEventListeners() {
    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Cart modal
    cartBtn.addEventListener('click', () => {
        cartModal.style.display = 'block';
        displayCartItems();
    });

    closeCart.addEventListener('click', () => {
        cartModal.style.display = 'none';
    });

    // Category filters
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            filterProducts(category);
        });
    });

    // Admin toggle (hidden feature - press Ctrl+Alt+A)
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 'a') {
            toggleAdminMode();
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });
}

// Display products
function displayProducts(productsToShow = products) {
    productGrid.innerHTML = '';
    
    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productGrid.appendChild(productCard);
    });
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/400x300?text=Image+Not+Found'">
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            ${isAdminMode ? `
                <div class="admin-controls">
                    <button class="edit-btn" onclick="editProduct(${product.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            ` : `
                <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            `}
        </div>
    `;
    return card;
}

// Filter products by category
function filterProducts(category) {
    currentCategory = category;
    const filteredProducts = category === 'all' ? products : products.filter(p => p.category === category);
    displayProducts(filteredProducts);
}

// Cart functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCartUI();
    showNotification('Item added to cart!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
    displayCartItems();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCartUI();
        displayCartItems();
    }
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = totalPrice.toFixed(2);
}

function displayCartItems() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Your cart is empty</p>';
        return;
    }
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
            </div>
            <div class="quantity-controls">
                <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                <button onclick="removeFromCart(${item.id})" class="remove-btn">Remove</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
    });
}

// Admin functions
function toggleAdminMode() {
    isAdminMode = !isAdminMode;
    
    if (isAdminMode) {
        showAdminPanel();
        showNotification('Admin mode activated');
    } else {
        hideAdminPanel();
        showNotification('Admin mode deactivated');
    }
    
    displayProducts();
}

function showAdminPanel() {
    let adminPanel = document.getElementById('adminPanel');
    if (!adminPanel) {
        adminPanel = document.createElement('div');
        adminPanel.id = 'adminPanel';
        adminPanel.className = 'admin-panel';
        adminPanel.innerHTML = `
            <h3>Admin Panel</h3>
            <button onclick="showAddProductForm()" class="admin-btn">Add New Product</button>
            <button onclick="toggleAdminMode()" class="admin-btn">Exit Admin Mode</button>
        `;
        document.body.appendChild(adminPanel);
    }
    adminPanel.style.display = 'block';
}

function hideAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if (adminPanel) {
        adminPanel.style.display = 'none';
    }
}

function showAddProductForm() {
    const modal = createProductModal();
    document.body.appendChild(modal);
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    const modal = createProductModal(product);
    document.body.appendChild(modal);
}

function createProductModal(product = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'productModal';
    
    const isEdit = product !== null;
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close" onclick="closeProductModal()">&times;</span>
            <h2>${isEdit ? 'Edit Product' : 'Add New Product'}</h2>
            <form id="productForm">
                <div class="form-group">
                    <label>Product Name:</label>
                    <input type="text" id="productName" value="${product ? product.name : ''}" required>
                </div>
                <div class="form-group">
                    <label>Price:</label>
                    <input type="number" id="productPrice" step="0.01" value="${product ? product.price : ''}" required>
                </div>
                <div class="form-group">
                    <label>Category:</label>
                    <select id="productCategory" required>
                        <option value="men" ${product && product.category === 'men' ? 'selected' : ''}>Men</option>
                        <option value="women" ${product && product.category === 'women' ? 'selected' : ''}>Women</option>
                        <option value="accessories" ${product && product.category === 'accessories' ? 'selected' : ''}>Accessories</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Image URL:</label>
                    <input type="url" id="productImage" value="${product ? product.image : ''}" required>
                </div>
                <div class="form-group">
                    <label>Description:</label>
                    <textarea id="productDescription" required>${product ? product.description : ''}</textarea>
                </div>
                <div class="form-buttons">
                    <button type="submit">${isEdit ? 'Update Product' : 'Add Product'}</button>
                    <button type="button" onclick="closeProductModal()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
    
    // Add form submit handler
    setTimeout(() => {
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (isEdit) {
                updateProduct(product.id);
            } else {
                addNewProduct();
            }
        });
    }, 100);
    
    return modal;
}

function addNewProduct() {
    const newProduct = {
        id: Math.max(...products.map(p => p.id)) + 1,
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value,
        description: document.getElementById('productDescription').value
    };
    
    products.push(newProduct);
    displayProducts();
    closeProductModal();
    showNotification('Product added successfully!');
}

function updateProduct(productId) {
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        products[productIndex] = {
            ...products[productIndex],
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value,
            image: document.getElementById('productImage').value,
            description: document.getElementById('productDescription').value
        };
        
        displayProducts();
        closeProductModal();
        showNotification('Product updated successfully!');
    }
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.id !== productId);
        displayProducts();
        showNotification('Product deleted successfully!');
    }
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
        modal.remove();
    }
}

// Utility functions
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}