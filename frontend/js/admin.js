// Agregar al inicio del archivo, después de las variables globales
let categories = [];

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // 1. Proteger la página
  if (!token) {
    alert("Acceso denegado. Necesitas iniciar sesión.");
    window.location.href = "login.html";
    return;
  }

  const payload = JSON.parse(atob(token.split(".")[1]));
  if (payload.role !== "ADMIN") {
    alert("Acceso denegado. No tienes permisos de administrador.");
    window.location.href = "index.html";
    return;
  }

  // 2. Si es admin, configurar listeners y cargar datos
  setupEventListeners(token);
  loadCategories(); // ← AGREGAR ESTA LÍNEA
  fetchAndDisplayProducts();
});

// AGREGAR ESTA FUNCIÓN
async function loadCategories() {
  try {
    const response = await fetch('http://localhost:3000/api/categories');
    if (response.ok) {
      categories = await response.json();
      updateCategorySelects();
      console.log('Categorías cargadas:', categories);
    } else {
      console.error('Error al cargar categorías:', response.status);
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error);
  }
}

// AGREGAR ESTA FUNCIÓN
function updateCategorySelects() {
  const selects = document.querySelectorAll('select[name="category"]');
  selects.forEach(select => {
    // Limpiar opciones existentes excepto "Sin categoría"
    select.innerHTML = '<option value="">Sin categoría</option>';
    
    // Agregar opciones de categorías
    categories.forEach(category => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
    });
  });
}

function setupEventListeners(token) {
  const addProductForm = document.getElementById("add-product-form");
  addProductForm.addEventListener("submit", (event) =>
    handleAddProduct(event, token),
  );

  // Usamos delegación de eventos para los botones de la lista de productos
  const productListContainer = document.getElementById(
    "admin-product-list-container",
  );
  productListContainer.addEventListener("click", (event) => {
    const target = event.target;
    const productId = target.dataset.productId;

    if (target.classList.contains("delete-btn") && productId) {
      handleDeleteProduct(productId, token);
    }

    if (target.classList.contains("edit-btn") && productId) {
      handleEditClick(productId, token);
    }
  });
}

async function handleAddProduct(event, token) {
  event.preventDefault();
  const form = event.target;

  const name = form.name.value;
  const description = form.description.value;
  const price = parseFloat(form.price.value);
  const stock = parseInt(form.stock.value);
  const imageUrl = form.imageUrl.value;
  const categoryId = form.category.value; // ← AGREGAR ESTA LÍNEA

  if (!name || !price || !stock) {
    alert("Nombre, precio y stock son campos requeridos.");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/admin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description, price, stock, imageUrl, categoryId }), // ← AGREGAR categoryId
    });

    const result = await response.json();

    if (response.ok) {
      alert("Producto añadido exitosamente.");
      form.reset(); // Limpiar el formulario
      fetchAndDisplayProducts(); // Recargar la lista de productos
    } else {
      throw new Error(result.message || "Error al añadir el producto.");
    }
  } catch (error) {
    console.error("Error al añadir producto:", error);
    alert(error.message);
  }
}

async function handleDeleteProduct(productId, token) {
  if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/api/admin/${productId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      alert("Producto eliminado exitosamente.");
      fetchAndDisplayProducts(); // Recargar la lista
    } else {
      const result = await response.json();
      throw new Error(result.message || "Error al eliminar el producto.");
    }
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    alert(error.message);
  }
}

async function handleEditClick(productId, token) {
  try {
    // 1. Obtenemos los datos actuales del producto
    const response = await fetch(
      `http://localhost:3000/api/products/${productId}`,
    );
    if (!response.ok) {
      throw new Error("No se pudo obtener la información del producto.");
    }
    const product = await response.json();

    // 2. Mostramos el modal de edición con los datos
    displayEditModal(product, token);
  } catch (error) {
    console.error("Error al preparar la edición:", error);
    alert(error.message);
  }
}

function displayEditModal(product, token) {
  // Evita crear modales duplicados si ya hay uno abierto
  if (document.querySelector(".modal-overlay")) return;

  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";

  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  modalContent.innerHTML = `
      <h2>Editar Producto</h2>
      <form id="edit-product-form">
          <label for="edit-name">Nombre:</label>
          <input type="text" id="edit-name" name="name" value="${product.name}" required />

          <label for="edit-description">Descripción:</label>
          <textarea id="edit-description" name="description">${product.description || ""}</textarea>

          <label for="edit-price">Precio:</label>
          <input type="number" id="edit-price" name="price" step="0.01" value="${product.price}" required />

          <label for="edit-stock">Stock:</label>
          <input type="number" id="edit-stock" name="stock" value="${product.stock}" required />

          <label for="edit-imageUrl">URL de la Imagen:</label>
          <input type="url" id="edit-imageUrl" name="imageUrl" value="${product.imageUrl || ""}" />

          <label for="edit-category">Categoría:</label>
          <select id="edit-category" name="category">
            <option value="">Sin categoría</option>
            ${categories.map(cat => 
              `<option value="${cat.id}" ${product.categoryId === cat.id ? 'selected' : ''}>${cat.name}</option>`
            ).join('')}
          </select>

          <div class="modal-actions">
              <button type="submit">Guardar Cambios</button>
              <button type="button" class="cancel-btn">Cancelar</button>
          </div>
      </form>
    `;

  document.body.appendChild(modalOverlay);
  modalOverlay.appendChild(modalContent);

  document
    .getElementById("edit-product-form")
    .addEventListener("submit", (event) => {
      handleUpdateProduct(event, product.id, token);
    });

  modalOverlay.addEventListener("click", (event) => {
    if (
      event.target === modalOverlay ||
      event.target.classList.contains("cancel-btn")
    ) {
      document.body.removeChild(modalOverlay);
    }
  });
}

async function handleUpdateProduct(event, productId, token) {
  event.preventDefault();
  const form = event.target;
  const updatedData = {
    name: form.name.value,
    description: form.description.value,
    price: parseFloat(form.price.value),
    stock: parseInt(form.stock.value),
    imageUrl: form.imageUrl.value,
    categoryId: form.category.value, // ← AGREGAR ESTA LÍNEA
  };

  try {
    const response = await fetch(
      `http://localhost:3000/api/admin/${productId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      },
    );
    const result = await response.json();
    if (response.ok) {
      alert("Producto actualizado exitosamente.");
      document.body.removeChild(document.querySelector(".modal-overlay"));
      fetchAndDisplayProducts();
    } else {
      throw new Error(result.message || "Error al actualizar el producto.");
    }
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    alert(error.message);
  }
}

async function fetchAndDisplayProducts() {
  try {
    const response = await fetch("http://localhost:3000/api/products");
    if (!response.ok) throw new Error("Error al obtener los productos.");

    const products = await response.json();

    const productListContainer = document.getElementById(
      "admin-product-list-container",
    );
    if (!productListContainer) return;

    if (products.length === 0) {
      productListContainer.innerHTML = "<p>No hay productos para mostrar.</p>";
    } else {
      productListContainer.innerHTML = `
                  <h2>Gestionar Productos</h2>
                  <table class="admin-table">
                      <thead>
                          <tr>
                              <th>ID</th>
                              <th>Nombre</th>
                              <th>Precio</th>
                              <th>Stock</th>
                              <th>Acciones</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${products
                            .map(
                              (product) => `
                              <tr>
                                  <td>${product.id}</td>
                                  <td>${product.name}</td>
                                  <td>${product.price.toFixed(2)}</td>
                                  <td>${product.stock}</td>
                                  <td class="actions">
                                      <button class="edit-btn" data-product-id="${product.id}">Editar</button>
                                      <button class="delete-btn" data-product-id="${product.id}">Eliminar</button>
                                  </td>
                              </tr>
                          `,
                            )
                            .join("")}
                      </tbody>
                  </table>
              `;
    }
  } catch (error) {
    console.error("Error:", error);
    const productListContainer = document.getElementById(
      "admin-product-list-container",
    );
    if (productListContainer)
      productListContainer.innerHTML =
        "<p>No se pudieron cargar los productos.</p>";
  }
}