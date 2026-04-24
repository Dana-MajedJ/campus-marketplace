document.addEventListener("DOMContentLoaded", () => {
  const bubbleLayer = document.createElement('div');
  bubbleLayer.className = 'bubble-layer';
  document.body.prepend(bubbleLayer);

  const bubbleSpecs = [
    { size: 180, left: '4%', duration: 22, delay: 0 },
    { size: 110, left: '16%', duration: 17, delay: 2 },
    { size: 240, left: '28%', duration: 26, delay: 6 },
    { size: 90, left: '44%', duration: 16, delay: 1 },
    { size: 150, left: '58%', duration: 21, delay: 4 },
    { size: 220, left: '72%', duration: 28, delay: 8 },
    { size: 100, left: '84%', duration: 18, delay: 3 },
    { size: 170, left: '92%', duration: 24, delay: 7 }
  ];

  bubbleSpecs.forEach(spec => {
    const bubble = document.createElement('span');
    bubble.className = 'bubble';
    bubble.style.width = `${spec.size}px`;
    bubble.style.height = `${spec.size}px`;
    bubble.style.left = spec.left;
    bubble.style.animationDuration = `${spec.duration}s`;
    bubble.style.animationDelay = `-${spec.delay}s`;
    bubbleLayer.appendChild(bubble);
  });
  const STORAGE_KEY = "bubble_market_data";
  const ROLE_KEY = "bubble_market_role";

  // 1. FAKE DATABASE SETUP
  if (!localStorage.getItem(STORAGE_KEY)) {
    const defaultProducts = [
      { id: 1, title: "Calculus Textbook", category: "Books", price: 120, status: "available" },
      { id: 2, title: "iPad Air", category: "Tablets", price: 1800, status: "available" },
      { id: 3, title: "Wireless Headphones", category: "Audio", price: 250, status: "sold" }
    ];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
  }
  let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // 2. AUTHENTICATION & SECURITY
  const currentRole = localStorage.getItem(ROLE_KEY) || "guest"; // 'guest', 'student', 'admin'

  // Security Check: Kick non-admins out of the Admin page
  if (window.location.pathname.includes("admin-panel") && currentRole !== "admin") {
    alert("Access Denied: You must be an Admin to view this page.");
    window.location.replace("index.html");
    return; // Stop the script entirely for this page so it doesn't load
  }

  // Update Nav Bar Visibility Based on Role
  document.querySelectorAll(".admin-only").forEach(el => {
    el.style.display = currentRole === "admin" ? "block" : "none";
  });
  document.querySelectorAll(".logged-in-only").forEach(el => {
    el.style.display = currentRole !== "guest" ? "block" : "none";
  });
  document.querySelectorAll(".guest-only").forEach(el => {
    el.style.display = currentRole === "guest" ? "block" : "none";
  });

  // Auto-Highlight Active Nav Link
  const path = window.location.pathname;
  if (path.includes("add-product")) document.getElementById("nav-add")?.classList.add("active");
  else if (path.includes("my-listings")) document.getElementById("nav-mine")?.classList.add("active");
  else if (path.includes("admin-panel")) document.getElementById("nav-admin")?.classList.add("active");
  else if (path.includes("login")) document.getElementById("nav-login")?.classList.add("active");
  else document.getElementById("nav-index")?.classList.add("active");

  // Logout Logic
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.setItem(ROLE_KEY, "guest");
      window.location.href = "login.html";
    });
  }

  // 3. HOMEPAGE SEARCH & FILTER
  const productsGrid = document.getElementById("productsGrid");
  if (productsGrid) {
    function renderProducts() {
      let filtered = products;
      const text = document.getElementById("searchInput")?.value.toLowerCase() || "";
      const cat = document.getElementById("categoryFilter")?.value || "";
      const stat = document.getElementById("statusFilter")?.value || "";
      const price = document.getElementById("priceFilter")?.value || "";

      if (text) filtered = filtered.filter(p => p.title.toLowerCase().startsWith(text));
      if (cat) filtered = filtered.filter(p => p.category === cat);
      if (stat) filtered = filtered.filter(p => p.status === stat);
      if (price) {
        filtered = filtered.filter(p => {
          if (price === "0-300") return p.price <= 300;
          if (price === "301-1000") return p.price > 300 && p.price <= 1000;
          if (price === "1000+") return p.price > 1000;
          return true;
        });
      }

      if(filtered.length === 0) {
        productsGrid.innerHTML = `<h3 style="color:var(--muted); grid-column: 1/-1; text-align: center;">No products match your search.</h3>`;
        return;
      }

      productsGrid.innerHTML = filtered.map(p => `
        <a href="product-details.html?id=${p.id}" class="card" style="display:block;">
          <div class="product-image">${p.category === 'Books' ? '📚' : p.category === 'Tablets' ? '📱' : '📦'}</div>
          <h3 style="margin: 10px 0 5px;">${p.title}</h3>
          <div style="color: #6f78a8; font-size: 0.9rem;">${p.category} • ${p.status}</div>
          <div class="product-price">${p.price} SR</div>
        </a>
      `).join("");
    }
    
    document.querySelectorAll(".search-bar input, .search-bar select").forEach(el => {
      el.addEventListener("input", renderProducts);
    });
    renderProducts();
  }

  // 4. ADD PRODUCT PAGE
  const addForm = document.getElementById("addForm");
  if (addForm) {
    addForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Pull fresh data directly from storage so it never overwrites incorrectly
      let currentData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      
      const newItem = {
        id: Date.now(),
        title: document.getElementById("addTitle").value,
        category: document.getElementById("addCategory").value,
        price: Number(document.getElementById("addPrice").value),
        status: "available"
      };

      currentData.unshift(newItem); // Add to the top of the list
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData)); // Save it securely
      
      alert("Item added successfully!");
      window.location.href = "index.html"; // Send them back to homepage to see it
    });
  }

  // 5. ADMIN PANEL (Delete Items)
  const adminListings = document.getElementById("adminListings");
  if (adminListings) {
    adminListings.innerHTML = products.map(p => `
      <div class="list-row">
        <h3>${p.title} <span class="status-note">(${p.status})</span></h3>
        <button class="btn" style="background: #ff85a2; padding: 10px 20px;" onclick="deleteItem(${p.id})">Delete</button>
      </div>
    `).join("");

    window.deleteItem = function(id) {
      if(confirm("Are you sure you want to delete this listing permanently?")) {
        products = products.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        window.location.reload(); 
      }
    };
  }

  // 6. MY LISTINGS (Change Status)
  const myListings = document.getElementById("myListings");
  if (myListings) {
    myListings.innerHTML = products.map(p => `
      <div class="list-row">
        <h3>${p.title} <span class="status-note">(Current: ${p.status})</span></h3>
        <button class="btn btn-ghost" style="padding: 10px 20px;" onclick="toggleStatus(${p.id})">
          Mark as ${p.status === 'available' ? 'Sold' : 'Available'}
        </button>
      </div>
    `).join("");

    window.toggleStatus = function(id) {
      const product = products.find(p => p.id === id);
      product.status = product.status === 'available' ? 'sold' : 'available';
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      window.location.reload(); 
    };
  }

  // 7. PRODUCT DETAILS PAGE
  const detailCard = document.getElementById("detailCard");
  if (detailCard) {
    const params = new URLSearchParams(window.location.search);
    const p = products.find(x => x.id === parseInt(params.get("id")));
    if (p) {
      detailCard.innerHTML = `
        <div class="product-image" style="height: 250px; font-size: 6rem;">${p.category === 'Books' ? '📚' : p.category === 'Tablets' ? '📱' : '📦'}</div>
        <h1 style="color: var(--bubble-blue); margin-bottom: 5px;">${p.title}</h1>
        <p style="color: var(--muted); font-size: 1.2rem; margin-top: 0;">Category: ${p.category} | Status: ${p.status}</p>
        <div class="product-price" style="font-size: 1.5rem;">${p.price} SR</div>
        <br><br>
        <button class="btn" onclick="alert('Message Sent to Seller!')">Contact Seller</button>
      `;
    } else {
      detailCard.innerHTML = `<h2>Product not found.</h2>`;
    }
  }

  // 8. LOGIN PAGE WITH VALIDATION
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    let selectedRole = "student";
    
    document.getElementById("studentRoleBtn").addEventListener("click", (e) => {
      selectedRole = "student";
      e.target.classList.add("active");
      document.getElementById("adminRoleBtn").classList.remove("active");
    });
    
    document.getElementById("adminRoleBtn").addEventListener("click", (e) => {
      selectedRole = "admin";
      e.target.classList.add("active");
      document.getElementById("studentRoleBtn").classList.remove("active");
    });

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Grab the values the user typed in
      const emailInput = loginForm.querySelector('input[type="email"]').value;
      const passInput = loginForm.querySelector('input[type="password"]').value;

      // VALIDATION 1: Check Email Format using Regex
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(emailInput)) {
        alert("Please enter a valid email address (e.g., name@campus.edu).");
        return; // Stops the code so they don't log in
      }

      // VALIDATION 2: Check Password Length
      if (passInput.length < 6) {
        alert("For your security, your password must be at least 6 characters long.");
        return; // Stops the code so they don't log in
      }

      // If valid, save the role to local storage and redirect!
      localStorage.setItem(ROLE_KEY, selectedRole); 
      window.location.href = selectedRole === "admin" ? "admin-panel.html" : "index.html";
    });
  }
});