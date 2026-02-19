// State
let products = [
    {
        id: 1,
        name: "96 Oversized Hoodie",
        price: 2499.00,
        image: null, // Using placeholder css
        placeholderClass: "solid-1"
    },
    {
        id: 2,
        name: "Utility Cargo Pants",
        price: 3999.00,
        image: null,
        placeholderClass: "solid-2"
    },
    {
        id: 3,
        name: "Signature Tee",
        price: 1499.00,
        image: null,
        placeholderClass: "solid-3"
    }
];

let cart = [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];

document.addEventListener('DOMContentLoaded', () => {
    init();

    // Smooth scrolling (legacy)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId !== "#") {
                document.querySelector(targetId).scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Navbar scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.classList.remove('scrolled');
            header.style.boxShadow = 'none';
        }
    });

    // Event Listeners for Forms
    document.getElementById('upload-form').addEventListener('submit', handleUpload);
    document.getElementById('checkout-form').addEventListener('submit', handleCheckout);
});

function init() {
    renderProducts();
    updateCartIcon();

    // Init Toast
    if (!document.getElementById('toast')) {
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }

    // Observer for animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.product-card, .about-content, .about-visual').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// Product Management
function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-id', product.id);
        card.style.opacity = '1'; // Ensure visible when re-rendered
        card.style.transform = 'translateY(0)';

        // Image handling: Real image vs Placeholder class
        let imageHtml;
        if (product.image) {
            imageHtml = `<img src="${product.image}" alt="${product.name}" style="width:100%; height:100%; object-fit:cover;">`;
        } else {
            imageHtml = `<div class="image-placeholder ${product.placeholderClass || 'gradient-1'}"></div>`;
        }

        card.innerHTML = `
            <div class="product-image">
                ${imageHtml}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>₹${product.price.toFixed(2)}</p>
                <button class="btn btn-secondary" onclick="addToCart(${product.id})" style="width:100%; margin-top:10px;">INSTALL_UPGRADE</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function handleUpload(e) {
    e.preventDefault();

    const name = document.getElementById('p-name').value;
    const price = parseFloat(document.getElementById('p-price').value);
    const fileInput = document.getElementById('p-image');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const newProduct = {
                id: Date.now(),
                name: name,
                price: price,
                image: e.target.result // Base64 image
            };
            products.unshift(newProduct);
            renderProducts();
            closeModal('upload-modal');
            document.getElementById('upload-form').reset();
            showToast('Item Added Successfully');
        }
        reader.readAsDataURL(fileInput.files[0]);
    }
}

// Cart functionality
function addToCart(id) {
    const product = products.find(p => p.id === id);
    cart.push(product);
    updateCartIcon();
    renderCart(); // Update cart modal content immediately
    showToast(`Added ${product.name} to cart`);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartIcon();
    renderCart();
}

function updateCartIcon() {
    document.getElementById('cart-count').innerText = cart.length;
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');

    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        totalEl.innerText = '0.00';
        return;
    }

    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;
        let imgTag = item.image ? `<img src="${item.image}" class="responsive-img">` : `<div style="width:50px;height:50px;background:#ddd;margin-right:10px;"></div>`;

        html += `
            <div class="cart-item">
                <div style="display:flex; align-items:center;">
                    ${imgTag}
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
                    </div>
                </div>
                <span class="remove-item" onclick="removeFromCart(${index})">Remove</span>
            </div>
        `;
    });

    container.innerHTML = html;
    totalEl.innerText = total.toFixed(2);
}

function openCheckout() {
    closeModal('cart-modal');
    openModal('checkout-modal');

    // Show summary in checkout
    let summaryHtml = '<h3>Order Summary</h3><ul style="list-style:none; padding:0; margin-bottom:15px;">';
    let total = 0;
    cart.forEach(item => {
        summaryHtml += `<li style="display:flex; justify-content:space-between; margin-bottom:5px;">
            <span>${item.name}</span>
            <span>₹${item.price.toFixed(2)}</span>
        </li>`;
        total += item.price;
    });
    summaryHtml += `</ul><div style="text-align:right; font-weight:bold;">Total: ₹${total.toFixed(2)}</div>`;

    document.getElementById('order-summary').innerHTML = summaryHtml;
}

function handleCheckout(e) {
    e.preventDefault();
    if (cart.length === 0) {
        showToast("Cart is empty!");
        return;
    }
    // Capture order data
    const orderData = {
        id: 'ORD-' + Date.now(),
        customer: {
            name: document.querySelector('#checkout-form input[placeholder="John Doe"]').value,
            address: document.querySelector('#checkout-form input[placeholder="123 Street Name, City"]').value,
            phone: document.querySelector('#checkout-form input[placeholder="+1 234 567 8900"]').value
        },
        items: [...cart],
        total: cart.reduce((acc, item) => acc + item.price, 0),
        date: new Date().toLocaleString()
    };

    // Simulate API call
    setTimeout(() => {
        orders.unshift(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));

        showToast("Order Placed Successfully!");
        cart = [];
        updateCartIcon();
        renderCart();
        closeModal('checkout-modal');
        document.getElementById('checkout-form').reset();
    }, 1000);
}

// Modal Helpers
window.openModal = function (id) {
    document.getElementById(id).classList.add('open');
    if (id === 'cart-modal') renderCart();
    if (id === 'orders-modal') renderOrders();
}

window.closeModal = function (id) {
    document.getElementById(id).classList.remove('open');
}

// Close modal when clicking outside
window.onclick = function (event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('open');
    }
}

function renderOrders() {
    const list = document.getElementById('orders-list');
    if (orders.length === 0) {
        list.innerHTML = '<p>No orders placed yet.</p>';
        return;
    }

    let html = '';
    orders.forEach(order => {
        let itemsHtml = order.items.map(item => `<li>${item.name} - ₹${item.price.toFixed(2)}</li>`).join('');
        html += `
            <div style="border: 1px solid var(--brand-red); padding: 15px; margin-bottom: 15px; background: rgba(255,0,60,0.05);">
                <div style="display: flex; justify-content: space-between; color: var(--brand-red); font-weight: bold; margin-bottom: 10px;">
                    <span>Order ID: ${order.id}</span>
                    <span>Date: ${order.date}</span>
                </div>
                <div style="margin-bottom: 10px;">
                    <strong>Customer:</strong> ${order.customer.name}<br>
                    <strong>Address:</strong> ${order.customer.address}<br>
                    <strong>Phone:</strong> ${order.customer.phone}
                </div>
                <div>
                    <strong>Items:</strong>
                    <ul style="margin-top: 5px; color: #ccc;">${itemsHtml}</ul>
                </div>
                <div style="text-align: right; margin-top: 10px; font-weight: bold; color: var(--brand-red);">
                    Total Amount: ₹${order.total.toFixed(2)}
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
}

function clearOrders() {
    if (confirm("Are you sure you want to clear all order history?")) {
        orders = [];
        localStorage.removeItem('orders');
        renderOrders();
        showToast("Order history cleared!");
    }
}

function showToast(message) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
