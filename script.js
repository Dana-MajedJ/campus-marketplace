document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("loaded");

  const STORAGE_KEY = "campus_marketplace_products_v3";
  const MESSAGES_KEY = "campus_marketplace_messages_v3";
  const ROLE_KEY = "campus_marketplace_role_v3";

  const defaultProducts = [
    {
      id: 1,
      title: "Calculus Textbook",
      description: "Clean textbook in very good condition, perfect for first year students.",
      price: 120,
      phone: "0501234567",
      category: "Books",
      condition: "Used - Excellent",
      status: "available",
      seller: "Areej",
      email: "areej@campus.edu",
      image: "assets/images/programming-books.jpg",
      date: "2026-04-10"
    },
    {
      id: 2,
      title: "iPad Air",
      description: "Used carefully for study notes and projects, works perfectly.",
      price: 1800,
      phone: "0559988776",
      category: "Tablets",
      condition: "Like New",
      status: "available",
      seller: "Dana",
      email: "dana@campus.edu",
      image: "assets/images/ipad-back.jpg",
      date: "2026-04-11"
    },
    {
      id: 3,
      title: "Desk Lamp",
      description: "Simple white desk lamp for study table.",
      price: 90,
      phone: "0544567890",
      category: "Furniture",
      condition: "Used - Good",
      status: "sold",
      seller: "Mona",
      email: "mona@campus.edu",
      image: "assets/images/white-study-desk.jpg",
      date: "2026-04-08"
    },
    {
      id: 4,
      title: "Wireless Headphones",
      description: "Comfortable headphones with good sound quality.",
      price: 250,
      phone: "0533332211",
      category: "Audio",
      condition: "Used - Excellent",
      status: "reported",
      seller: "Nour",
      email: "nour@campus.edu",
      image: "assets/images/sony-headphones-beige.jpg",
      date: "2026-04-12",
      reportReason: "Wrong Information"
    }
  ];

  function getProducts() {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
      return [...defaultProducts];
    }

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [...defaultProducts];
    } catch (error) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
      return [...defaultProducts];
    }
  }

  function saveProducts(products) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function getMessages() {
    const stored = localStorage.getItem(MESSAGES_KEY);

    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveMessages(messages) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  }

  function formatPrice(price) {
    return `${Number(price).toLocaleString()} SR`;
  }

  function getStatusClass(status) {
    if (status === "sold") return "sold";
    if (status === "reported") return "reported";
    return "available";
  }

  function getPlaceholderEmoji(category) {
    if (category === "Books") return "📚";
    if (category === "Phones") return "📱";
    if (category === "Laptops") return "💻";
    if (category === "Audio") return "🎧";
    if (category === "Furniture") return "🪑";
    if (category === "Tablets") return "📱";
    return "📦";
  }

  function imageExists(path) {
    return typeof path === "string" && path.trim() !== "";
  }

  function createThumbContent(product) {
    if (imageExists(product.image)) {
      return `
        <img
          src="${product.image}"
          alt="${product.title}"
          onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;font-size:3rem;&quot;>${getPlaceholderEmoji(product.category)}</div>';"
        >
      `;
    }

    return `<div style="font-size:3rem;">${getPlaceholderEmoji(product.category)}</div>`;
  }

  function renderProductCard(product) {
    return `
      <div class="card product-card">
        <div class="product-thumb">
          <span class="badge ${getStatusClass(product.status)}">${product.status}</span>
          <div class="thumb-wrap">
            ${createThumbContent(product)}
          </div>
        </div>

        <div class="product-content">
          <div class="product-main-info">
            <h3 class="product-name">${product.title}</h3>
            <div class="product-meta">${product.category} • ${product.seller}</div>
          </div>

          <div class="price-row">
            <div class="price">${formatPrice(product.price)}</div>
            <div class="condition-text meta">${product.condition}</div>
          </div>

          <div class="card-actions">
            <a class="small-btn primary" href="product-details.html?id=${product.id}">View Details</a>
            <a class="small-btn ghost" href="browse.html">Browse More</a>
          </div>
        </div>
      </div>
    `;
  }

  function renderLatestListings() {
    const target = document.getElementById("latestListings");
    if (!target) return;

    const products = getProducts().slice(0, 4);
    target.innerHTML = products.map(renderProductCard).join("");
  }

  function renderBrowseListings() {
    const grid = document.getElementById("browseGrid");
    if (!grid) return;

    const searchInput = document.getElementById("searchInput");
    const categoryFilter = document.getElementById("categoryFilter");
    const statusFilter = document.getElementById("statusFilter");
    const priceFilter = document.getElementById("priceFilter");

    function update() {
      let products = getProducts();

      const searchValue = (searchInput?.value || "").trim().toLowerCase();
      const categoryValue = categoryFilter?.value || "";
      const statusValue = statusFilter?.value || "";
      const priceValue = priceFilter?.value || "";

      if (searchValue) {
        products = products.filter((product) => {
          return (
            product.title.toLowerCase().includes(searchValue) ||
            product.category.toLowerCase().includes(searchValue) ||
            product.seller.toLowerCase().includes(searchValue)
          );
        });
      }

      if (categoryValue) {
        products = products.filter((product) => product.category === categoryValue);
      }

      if (statusValue) {
        products = products.filter((product) => product.status === statusValue);
      }

      if (priceValue) {
        products = products.filter((product) => {
          const price = Number(product.price);

          if (priceValue === "0-300") return price >= 0 && price <= 300;
          if (priceValue === "301-1000") return price >= 301 && price <= 1000;
          if (priceValue === "1001-2000") return price >= 1001 && price <= 2000;
          if (priceValue === "2001+") return price >= 2001;

          return true;
        });
      }

      if (products.length === 0) {
        grid.innerHTML = `
          <div class="card" style="padding:24px;">
            <h3>No products found</h3>
            <p class="small-muted">Try changing the filters.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = products.map(renderProductCard).join("");
    }

    [searchInput, categoryFilter, statusFilter, priceFilter].forEach((element) => {
      element?.addEventListener("input", update);
      element?.addEventListener("change", update);
    });

    update();
  }

  function setupAddProduct() {
    const form = document.getElementById("addProductForm");
    if (!form) return;

    const imageInput = document.getElementById("image");
    const previewImage = document.getElementById("previewImage");
    const previewFallback = document.getElementById("previewFallback");
    const fileNameText = document.getElementById("file-name");
    const phoneInput = document.getElementById("phone");
    const successNotice = document.getElementById("successNotice");

    phoneInput?.addEventListener("input", () => {
      phoneInput.value = phoneInput.value.replace(/[^0-9]/g, "").slice(0, 10);
    });

    imageInput?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];

      if (fileNameText) {
        fileNameText.textContent = file ? file.name : "No file chosen";
      }

      if (!file) {
        if (previewImage) {
          previewImage.style.display = "none";
          previewImage.src = "";
        }

        if (previewFallback) {
          previewFallback.style.display = "flex";
        }

        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        if (previewImage) {
          previewImage.src = e.target?.result || "";
          previewImage.style.display = "block";
        }

        if (previewFallback) {
          previewFallback.style.display = "none";
        }
      };

      reader.readAsDataURL(file);
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const title = document.getElementById("title")?.value.trim();
      const description = document.getElementById("description")?.value.trim();
      const price = Number(document.getElementById("price")?.value);
      const phone = document.getElementById("phone")?.value.trim();
      const category = document.getElementById("category")?.value;
      const condition = document.getElementById("condition")?.value;

      if (!title || !description || !price || !phone || !category || !condition) {
        alert("Please fill in all required fields.");
        return;
      }

      const products = getProducts();

      const newProduct = {
        id: Date.now(),
        title,
        description,
        price,
        phone,
        category,
        condition,
        status: "available",
        seller: "Current User",
        email: "user@campus.edu",
        image:
          previewImage?.src && previewImage.style.display !== "none"
            ? previewImage.src
            : "",
        date: new Date().toISOString().split("T")[0]
      };

      products.unshift(newProduct);
      saveProducts(products);

      if (successNotice) {
        successNotice.classList.add("show");
      }

      setTimeout(() => {
        window.location.href = `product-details.html?id=${newProduct.id}`;
      }, 1200);
    });
  }

  function renderMyListings() {
    const body = document.getElementById("myListingsBody");
    const emptyState = document.getElementById("myListingsEmpty");
    const tabs = document.querySelectorAll(".listing-tab");

    if (!body || !emptyState || tabs.length === 0) return;

    let currentFilter = "all";

    function update() {
      let products = getProducts();

      if (currentFilter === "active") {
        products = products.filter((product) => product.status === "available");
      } else if (currentFilter === "sold") {
        products = products.filter((product) => product.status === "sold");
      }

      if (products.length === 0) {
        body.innerHTML = "";
        emptyState.style.display = "block";
        return;
      }

      emptyState.style.display = "none";

      body.innerHTML = products.map((product) => `
        <tr>
          <td>
            <div class="listing-product-cell">
              <div class="listing-product-thumb">
                ${
                  imageExists(product.image)
                    ? `<img src="${product.image}" alt="${product.title}" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<span style=&quot;font-size:2rem;&quot;>📦</span>';">`
                    : `<span style="font-size:2rem;">📦</span>`
                }
              </div>
              <div class="listing-product-info">
                <h3>${product.title}</h3>
                <p>${product.category} • ${product.condition}</p>
              </div>
            </div>
          </td>
          <td><div class="listing-price">${formatPrice(product.price)}</div></td>
          <td><div class="listing-date">${product.date}</div></td>
          <td><span class="status-pill ${getStatusClass(product.status)}">${product.status}</span></td>
          <td>
            <div class="listing-actions">
              <a class="action-btn view" href="product-details.html?id=${product.id}" title="View">👁</a>
              <button class="action-btn sold" title="Mark sold" ${product.status === "sold" ? "disabled" : ""} data-sold="${product.id}">✓</button>
              <button class="action-btn delete" title="Delete" data-delete="${product.id}">🗑</button>
            </div>
          </td>
        </tr>
      `).join("");

      body.querySelectorAll("[data-sold]").forEach((button) => {
        button.addEventListener("click", () => {
          const id = Number(button.dataset.sold);
          const updatedProducts = getProducts().map((product) =>
            product.id === id ? { ...product, status: "sold" } : product
          );
          saveProducts(updatedProducts);
          update();
        });
      });

      body.querySelectorAll("[data-delete]").forEach((button) => {
        button.addEventListener("click", () => {
          const id = Number(button.dataset.delete);
          const updatedProducts = getProducts().filter((product) => product.id !== id);
          saveProducts(updatedProducts);
          update();
        });
      });
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((button) => button.classList.remove("active"));
        tab.classList.add("active");
        currentFilter = tab.dataset.filter || "all";
        update();
      });
    });

    update();
  }

  function renderProductDetails() {
    const detailTitle = document.getElementById("detailTitle");
    if (!detailTitle) return;

    const params = new URLSearchParams(window.location.search);
    const id = Number(params.get("id"));
    const products = getProducts();
    const product = products.find((item) => item.id === id) || products[0];

    if (!product) return;

    const detailTitleSecondary = document.getElementById("detailTitleSecondary");
    const detailPrice = document.getElementById("detailPrice");
    const detailStatus = document.getElementById("detailStatus");
    const detailCondition = document.getElementById("detailCondition");
    const detailCategory = document.getElementById("detailCategory");
    const detailDesc = document.getElementById("detailDesc");
    const detailSeller = document.getElementById("detailSeller");
    const detailSellerMeta = document.getElementById("detailSellerMeta");
    const sellerAvatar = document.getElementById("sellerAvatar");
    const detailImage = document.getElementById("detailImage");

    detailTitle.textContent = product.title;
    if (detailTitleSecondary) detailTitleSecondary.textContent = product.title;
    if (detailPrice) detailPrice.textContent = formatPrice(product.price);

    if (detailStatus) {
      detailStatus.textContent = product.status;
      detailStatus.className = `status-pill ${getStatusClass(product.status)}`;
    }

    if (detailCondition) detailCondition.textContent = product.condition;
    if (detailCategory) detailCategory.textContent = product.category;
    if (detailDesc) detailDesc.textContent = product.description;
    if (detailSeller) detailSeller.textContent = product.seller;
    if (detailSellerMeta) detailSellerMeta.textContent = `${product.email} • ${product.phone}`;
    if (sellerAvatar) sellerAvatar.textContent = product.seller.slice(0, 2).toUpperCase();

    if (detailImage) {
      detailImage.innerHTML = imageExists(product.image)
        ? `<img src="${product.image}" alt="${product.title}" onerror="this.onerror=null; this.style.display='none'; this.parentElement.innerHTML='<div style=&quot;font-size:5rem;&quot;>📦</div>';">`
        : `<div style="font-size:5rem;">📦</div>`;
    }

    const chatList = document.getElementById("chatList");
    const messageForm = document.getElementById("contactSellerForm");
    const messageText = document.getElementById("messageText");
    const contactButton = document.getElementById("contactButton");

    function renderMessages() {
      const messages = getMessages().filter((message) => message.productId === product.id);

      if (!chatList) return;

      chatList.innerHTML = messages.length
        ? messages.map((message) => `<div class="chat-bubble">${message.text}</div>`).join("")
        : `<div class="chat-bubble">Start the conversation with the seller.</div>`;
    }

    contactButton?.addEventListener("click", () => {
      messageText?.focus();
    });

    messageForm?.addEventListener("submit", (e) => {
      e.preventDefault();

      const text = messageText?.value.trim();
      if (!text) return;

      const messages = getMessages();
      messages.push({
        id: Date.now(),
        productId: product.id,
        text,
        date: new Date().toISOString()
      });

      saveMessages(messages);

      if (messageText) {
        messageText.value = "";
      }

      renderMessages();
    });

    renderMessages();

    const relatedListings = document.getElementById("relatedListings");
    if (relatedListings) {
      relatedListings.innerHTML = products
        .filter((item) => item.id !== product.id)
        .slice(0, 2)
        .map(renderProductCard)
        .join("");
    }
  }

  function renderAdminPanel() {
    const totalListings = document.getElementById("totalListings");
    if (!totalListings) return;

    const activeListings = document.getElementById("activeListings");
    const soldListings = document.getElementById("soldListings");
    const reportedListings = document.getElementById("reportedListings");
    const adminListings = document.getElementById("adminListings");
    const recentMessages = document.getElementById("recentMessages");
    const adminSearchInput = document.getElementById("adminSearchInput");
    const adminStatusFilter = document.getElementById("adminStatusFilter");
    const reportModal = document.getElementById("reportModal");
    const submitReportBtn = document.getElementById("submitReportBtn");
    const closeReportBtn = document.getElementById("closeReportBtn");
    const reportReason = document.getElementById("reportReason");

    let selectedReportId = null;

    function updateStats() {
      const products = getProducts();
      totalListings.textContent = products.length;
      if (activeListings) activeListings.textContent = products.filter((p) => p.status === "available").length;
      if (soldListings) soldListings.textContent = products.filter((p) => p.status === "sold").length;
      if (reportedListings) reportedListings.textContent = products.filter((p) => p.status === "reported").length;
    }

    function openReportModal(id) {
      selectedReportId = id;
      if (reportReason) reportReason.value = "";
      reportModal?.classList.remove("hidden");
    }

    function closeReportModal() {
      selectedReportId = null;
      reportModal?.classList.add("hidden");
    }

    submitReportBtn?.addEventListener("click", () => {
      const reason = reportReason?.value || "";

      if (!selectedReportId || !reason) {
        alert("Please choose a reason first.");
        return;
      }

      const updatedProducts = getProducts().map((product) =>
        product.id === selectedReportId
          ? { ...product, status: "reported", reportReason: reason }
          : product
      );

      saveProducts(updatedProducts);
      closeReportModal();
      updateStats();
      renderListings();
    });

    closeReportBtn?.addEventListener("click", closeReportModal);

    function renderListings() {
      if (!adminListings) return;

      let products = getProducts();
      const searchValue = (adminSearchInput?.value || "").trim().toLowerCase();
      const statusValue = adminStatusFilter?.value || "";

      if (searchValue) {
        products = products.filter((product) =>
          product.title.toLowerCase().includes(searchValue) ||
          product.seller.toLowerCase().includes(searchValue)
        );
      }

      if (statusValue) {
        products = products.filter((product) => product.status === statusValue);
      }

      adminListings.innerHTML = products.map((product) => `
        <div class="admin-item">
          <div class="admin-item-top">
            <div>
              <strong>${product.title}</strong>
              <div class="small-muted">${product.seller} • ${product.category} • ${formatPrice(product.price)}</div>
            </div>
            <span class="status-pill ${getStatusClass(product.status)}">${product.status}</span>
          </div>
          <div class="small-muted">${product.description}</div>
          ${
            product.reportReason
              ? `<div style="margin-top:10px; color:#ef8a00; font-weight:700;">Reason: ${product.reportReason}</div>`
              : ""
          }
          <div class="admin-actions">
            <button class="small-btn success" data-approve="${product.id}">Approve</button>
            <button class="small-btn warning" data-report="${product.id}">Report</button>
            <button class="small-btn danger" data-remove="${product.id}">Delete</button>
          </div>
        </div>
      `).join("");

      adminListings.querySelectorAll("[data-approve]").forEach((button) => {
        button.addEventListener("click", () => {
          const id = Number(button.dataset.approve);
          const updatedProducts = getProducts().map((product) =>
            product.id === id ? { ...product, status: "available", reportReason: "" } : product
          );
          saveProducts(updatedProducts);
          updateStats();
          renderListings();
        });
      });

      adminListings.querySelectorAll("[data-report]").forEach((button) => {
        button.addEventListener("click", () => {
          openReportModal(Number(button.dataset.report));
        });
      });

      adminListings.querySelectorAll("[data-remove]").forEach((button) => {
        button.addEventListener("click", () => {
          const id = Number(button.dataset.remove);
          const updatedProducts = getProducts().filter((product) => product.id !== id);
          saveProducts(updatedProducts);
          updateStats();
          renderListings();
        });
      });
    }

    function renderMessagesList() {
      if (!recentMessages) return;

      const messages = getMessages().slice().reverse().slice(0, 6);

      recentMessages.innerHTML = messages.length
        ? messages.map((message) => `
            <div class="message-item">
              <div class="message-item-top">
                <strong>Message</strong>
                <span class="small-muted">${new Date(message.date).toLocaleDateString()}</span>
              </div>
              <div>${message.text}</div>
            </div>
          `).join("")
        : `<div class="message-item"><div class="small-muted">No recent messages yet.</div></div>`;
    }

    adminSearchInput?.addEventListener("input", renderListings);
    adminStatusFilter?.addEventListener("change", renderListings);

    updateStats();
    renderListings();
    renderMessagesList();

    window.closeReportModal = closeReportModal;
  }

  function setupLogin() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    const studentRoleBtn = document.getElementById("studentRoleBtn");
    const adminRoleBtn = document.getElementById("adminRoleBtn");
    const selectedRoleText = document.getElementById("selectedRoleText");

    let currentRole = localStorage.getItem(ROLE_KEY) || "student";

    function applyRole(role) {
      currentRole = role;
      localStorage.setItem(ROLE_KEY, role);

      if (selectedRoleText) {
        selectedRoleText.textContent = role;
      }

      studentRoleBtn?.classList.toggle("active", role === "student");
      adminRoleBtn?.classList.toggle("active", role === "admin");

      document.querySelectorAll(".admin-only").forEach((element) => {
        element.style.display = role === "admin" ? "" : "none";
      });
    }

    studentRoleBtn?.addEventListener("click", () => applyRole("student"));
    adminRoleBtn?.addEventListener("click", () => applyRole("admin"));

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      applyRole(currentRole);

      if (currentRole === "admin") {
        window.location.href = "admin-panel.html";
      } else {
        window.location.href = "index.html";
      }
    });

    applyRole(currentRole);
  }

  function setupGlobalRoleVisibility() {
    const role = localStorage.getItem(ROLE_KEY) || "student";

    document.querySelectorAll(".admin-only").forEach((element) => {
      element.style.display = role === "admin" ? "" : "none";
    });
  }

  function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
    const navLinks = document.querySelector(".nav-links");

    if (mobileMenuBtn && navLinks) {
      mobileMenuBtn.addEventListener("click", () => {
        navLinks.classList.toggle("show");
      });
    }
  }

  setupGlobalRoleVisibility();
  setupMobileMenu();
  renderLatestListings();
  renderBrowseListings();
  setupAddProduct();
  renderMyListings();
  renderProductDetails();
  renderAdminPanel();
  setupLogin();
});