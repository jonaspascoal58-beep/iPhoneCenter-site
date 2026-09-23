const form = document.getElementById("leadForm");
const statusBox = document.getElementById("formStatus");

// ===============================
// FORMULÁRIO DE INTERESSE
// ===============================
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (statusBox) {
      statusBox.className = "status";
      statusBox.textContent = "Enviando…";
    }

    const fd = new FormData(form);

    const payload = {
      name: fd.get("name"),
      phone: fd.get("phone"),
      email: fd.get("email"),
      product: fd.get("product"),
      deliveryCity: fd.get("deliveryCity"),
      message: fd.get("message"),
      consent: fd.get("consent") === "on"
    };

    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });

      const data = await r.json();

      if (!r.ok) throw new Error(data.message || "Erro ao enviar.");

      if (statusBox) {
        statusBox.className = "status success";
        statusBox.textContent =
          "Solicitação enviada com sucesso. A equipe poderá entrar em contato.";
      }

      form.reset();

    } catch (err) {
      if (statusBox) {
        statusBox.className = "status error";
        statusBox.textContent = err.message;
      }
    }
  });
}

// ===============================
// SELECIONAR PRODUTO
// ===============================
function selectProduct(button) {
  const card = button.closest(".card");
  if (!card) return;

  const title = card.querySelector("h3");
  const capacity = card.querySelector("p");
  const price = card.querySelector("strong");
  const select = document.querySelector('select[name="product"]');

  if (!title || !select) return;

  const product = title.textContent.trim();
  const storage = capacity ? capacity.textContent.trim() : "";
  const value = price ? price.textContent.trim() : "";

  const completeProduct = [product, storage, value]
    .filter(Boolean)
    .join(" — ");

  let option = Array.from(select.options).find(
    option => option.value === completeProduct
  );

  if (!option) {
    option = document.createElement("option");
    option.value = completeProduct;
    option.textContent = completeProduct;
    select.appendChild(option);
  }

  select.value = completeProduct;
}

// ===============================
// CARRINHO
// ===============================

let cart = JSON.parse(localStorage.getItem("iphoneCenterCart") || "[]");

function saveCart() {
  localStorage.setItem("iphoneCenterCart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  const badge = document.getElementById("cartCount");

  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  }
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();
  renderCart();

  const cartPanel = document.getElementById("cartPanel");

  if (cartPanel) {
    cartPanel.classList.add("open");
  }
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
}

function changeQuantity(id, change) {
  const item = cart.find(item => item.id === id);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart();
  renderCart();
}

function parsePrice(value) {
  if (typeof value === "number") {
    return value;
  }

  const text = String(value).trim();

  if (text.includes("R$")) {
    return parseFloat(
      text
        .replace(/[^0-9,]/g, "")
        .replace(/\./g, "")
        .replace(",", ".")
    );
  }

  return Number(text.replace(",", "."));
}

function getCartTotal() {
  return cart.reduce(
    (total, item) => total + (parsePrice(item.price) * item.quantity),
    0
  );
}

function formatPrice(value) {
  return parsePrice(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}
function renderCart() {
  const container = document.getElementById("cartItems");
  const total = document.getElementById("cartTotal");

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <p>Seu carrinho está vazio.</p>
      </div>
    `;

    if (total) total.textContent = "R$ 0,00";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image || ""}" alt="${item.name}">
      
      <div class="cart-item-info">
        <h4>${item.name}</h4>
        <p>${formatPrice(item.price)}</p>

        <div class="quantity">
          <button onclick="changeQuantity('${item.id}', -1)">−</button>
          <span>${item.quantity}</span>
          <button onclick="changeQuantity('${item.id}', 1)">+</button>
        </div>
      </div>

      <button
        class="remove-cart"
        onclick="removeFromCart('${item.id}')"
        aria-label="Remover produto"
      >
        ×
      </button>
    </div>
  `).join("");

  if (total) {
    total.textContent = formatPrice(getCartTotal());
  }
}

function openCart() {
  const panel = document.getElementById("cartPanel");

  if (panel) {
    panel.classList.add("open");
    renderCart();
  }
}

function closeCart() {
  const panel = document.getElementById("cartPanel");

  if (panel) {
    panel.classList.remove("open");
  }
}

function checkoutCart() {
  if (cart.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const products = cart.map(item =>
    `${item.name} x${item.quantity}`
  ).join("\n");

  const message =
    `Olá! Tenho interesse nos seguintes produtos:\n\n${products}\n\n` +
    `Total: ${formatPrice(getCartTotal())}`;

  const url =
    "https://wa.me/?text=" + encodeURIComponent(message);

  window.open(url, "_blank");
}

// Inicializa o contador
updateCartCount();
renderCart();
