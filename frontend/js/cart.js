document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const main = document.querySelector("main");

  if (!token) {
    main.innerHTML =
      "<h1>Tu Carrito</h1><p>Necesitas <a href='login.html'>iniciar sesión</a> para ver tu carrito.</p>";
    return;
  }

  // Decodificar token para obtener el userId
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;

  fetchCart(userId);
});

async function fetchCart(userId) {
  try {
    const response = await fetch(`http://localhost:3000/api/carts/${userId}`);
    if (!response.ok) {
      // Si el carrito no se encuentra (404), es un carrito vacío, no un error.
      if (response.status === 404) {
        displayCart(null);
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const cart = await response.json();
    displayCart(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    const main = document.querySelector("main");
    main.innerHTML = "<h1>Tu Carrito de Compras</h1><p>Error al cargar el carrito.</p>";
  }
}

function displayCart(cart) {
  const main = document.querySelector("main");
  main.innerHTML = "<h1>Tu Carrito de Compras</h1>";

  if (!cart || cart.items.length === 0) {
    main.innerHTML += "<p>Tu carrito está vacío.</p>";
    return;
  }

  const cartItemsContainer = document.createElement("div");
  cartItemsContainer.className = "cart-items-container";

  let total = 0;

  cart.items.forEach((item) => {
    const itemElement = document.createElement("div");
    itemElement.className = "cart-item";
    const subtotal = item.product.price * item.quantity;
    total += subtotal;

    itemElement.innerHTML = `
            <div class="cart-item-details">
                <h3>${item.product.name}</h3>
                <p>Cantidad: ${item.quantity}</p>
                <p>Precio unitario: ${item.product.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-subtotal">
                <p>Subtotal: ${subtotal.toFixed(2)}</p>
                <button class="remove-btn" data-item-id="${item.id}">Eliminar</button>
            </div>
        `;
    cartItemsContainer.appendChild(itemElement);
  });

  main.appendChild(cartItemsContainer);

  const cartTotalElement = document.createElement("div");
  cartTotalElement.className = "cart-total";
  cartTotalElement.innerHTML = `<h2>Total del Carrito: ${total.toFixed(2)}</h2>`;
  main.appendChild(cartTotalElement);

  // Event listener para los botones de eliminar
  cartItemsContainer.addEventListener("click", (event) => {
    if (event.target.classList.contains("remove-btn")) {
      const itemId = event.target.dataset.itemId;
      removeItem(itemId);
    }
  });
}

async function removeItem(itemId) {
  try {
    const response = await fetch("http://localhost:3000/api/carts/remove", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ itemId: parseInt(itemId) }),
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      // Refrescar el carrito para mostrar los cambios
      const token = localStorage.getItem("token");
      const payload = JSON.parse(atob(token.split(".")[1]));
      fetchCart(payload.id);
    } else {
      console.error("Error al eliminar el item:", result.message);
      alert(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error("Error de conexión al eliminar item:", error);
    alert("No se pudo conectar con el servidor.");
  }
}