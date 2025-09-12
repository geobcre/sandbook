// Global state variables
let categories = [];
let filteredUsers = [];

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  // 1. Protect the page
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

  // 2. If admin, set up the page
  setupEventListeners(token);
  loadCategories();
  fetchAndDisplayProducts();
  fetchAndDisplayUsers(token);
});

// --- SETUP AND DATA LOADING ---

function setupEventListeners(token) {
  // Add product form
  const addProductForm = document.getElementById("add-product-form");
  addProductForm.addEventListener("submit", (event) =>
    handleAddProduct(event, token),
  );

  // Event delegation for product list actions
  const productListContainer = document.getElementById(
    "admin-product-list-container",
  );
  productListContainer.addEventListener("click", (event) => {
    const target = event.target;
    const productId = target.dataset.productId;
    if (!productId) return;

    if (target.classList.contains("delete-btn")) {
      handleDeleteProduct(productId, token);
    }
    if (target.classList.contains("edit-btn")) {
      handleEditClick(productId, token);
    }
  });

  // Event delegation for user list actions
  const userListContainer = document.getElementById(
    "admin-user-list-container",
  );
  userListContainer.addEventListener("click", (event) => {
    const target = event.target;
    const userId = target.dataset.userId;
    if (!userId) return;

    if (target.classList.contains("delete-user-btn")) {
      handleDeleteUser(userId, token);
    }
    if (target.classList.contains("edit-user-btn")) {
      const userToEdit = filteredUsers.find((u) => u.id === parseInt(userId));
      if (userToEdit) {
        displayEditUserRoleModal(userToEdit, token);
      }
    }
  });
}

async function loadCategories() {
  try {
    const response = await fetch(
      "https://sandbook-production-aa04.up.railway.app/api/categories",
    );
    if (response.ok) {
      categories = await response.json();
      updateCategorySelects();
    } else {
      console.error("Error loading categories:", response.status);
    }
  } catch (error) {
    console.error("Error loading categories:", error);
  }
}

function updateCategorySelects() {
  const selects = document.querySelectorAll('select[name="category"]');
  selects.forEach((select) => {
    select.innerHTML = '<option value="">Sin categoría</option>';
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
    });
  });
}

// --- PRODUCT MANAGEMENT ---

async function fetchAndDisplayProducts() {
  try {
    const response = await fetch(
      "https://sandbook-production-aa04.up.railway.app/api/products",
    );
    if (!response.ok) throw new Error("Error fetching products.");
    const products = await response.json();
    const container = document.getElementById("admin-product-list-container");
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML =
        "<h2>Gestionar Productos</h2><p>No hay productos para mostrar.</p>";
    } else {
      container.innerHTML = `
        <h2>Gestionar Productos</h2>
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${products
              .map(
                (p) => `
              <tr>
                <td>${p.id}</td>
                <td>${p.name}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>${p.stock}</td>
                <td class="actions">
                  <button class="edit-btn" data-product-id="${p.id}">Editar</button>
                  <button class="delete-btn" data-product-id="${p.id}">Eliminar</button>
                </td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>`;
    }
  } catch (error) {
    console.error("Error:", error);
    const container = document.getElementById("admin-product-list-container");
    if (container) container.innerHTML = "<p>Could not load products.</p>";
  }
}

async function handleAddProduct(event, token) {
  event.preventDefault();
  const form = event.target;
  const productData = {
    name: form.name.value,
    description: form.description.value,
    price: parseFloat(form.price.value),
    stock: parseInt(form.stock.value),
    imageUrl: form.imageUrl.value,
    categoryId: form.category.value ? parseInt(form.category.value) : null,
  };

  if (!productData.name || !productData.price || !productData.stock) {
    alert("Nombre, precio y stock son campos requeridos.");
    return;
  }

  try {
    const response = await fetch(
      "https://sandbook-production-aa04.up.railway.app/api/admin",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      },
    );
    const result = await response.json();
    if (response.ok) {
      alert("Producto añadido exitosamente.");
      form.reset();
      fetchAndDisplayProducts();
    } else {
      throw new Error(result.message || "Error al añadir el producto.");
    }
  } catch (error) {
    console.error("Error adding product:", error);
    alert(error.message);
  }
}

async function handleDeleteProduct(productId, token) {
  if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;

  try {
    const response = await fetch(
      `https://sandbook-production-aa04.up.railway.app/api/admin/${productId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (response.ok) {
      alert("Producto eliminado exitosamente.");
      fetchAndDisplayProducts();
    } else {
      const result = await response.json();
      throw new Error(result.message || "Error al eliminar el producto.");
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    alert(error.message);
  }
}

async function handleEditClick(productId, token) {
  try {
    const response = await fetch(
      `https://sandbook-production-aa04.up.railway.app/api/products/${productId}`,
    );
    if (!response.ok) throw new Error("Could not fetch product info.");
    const product = await response.json();
    displayEditModal(product, token);
  } catch (error) {
    console.error("Error preparing edit:", error);
    alert(error.message);
  }
}

function displayEditModal(product, token) {
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
        ${categories.map((cat) => `<option value="${cat.id}" ${product.categoryId === cat.id ? "selected" : ""}>${cat.name}</option>`).join("")}
      </select>
      <div class="modal-actions">
        <button type="submit">Guardar Cambios</button>
        <button type="button" class="cancel-btn">Cancelar</button>
      </div>
    </form>`;

  document.body.appendChild(modalOverlay);
  modalOverlay.appendChild(modalContent);

  document
    .getElementById("edit-product-form")
    .addEventListener("submit", (event) =>
      handleUpdateProduct(event, product.id, token),
    );
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
    categoryId: form.category.value ? parseInt(form.category.value) : null,
  };

  try {
    const response = await fetch(
      `https://sandbook-production-aa04.up.railway.app/api/admin/${productId}`,
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
    console.error("Error updating product:", error);
    alert(error.message);
  }
}

// --- USER MANAGEMENT ---

async function fetchAndDisplayUsers(token) {
  try {
    const response = await fetch(
      "https://sandbook-production-aa04.up.railway.app/api/users",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.ok) throw new Error("Error fetching users.");
    const { user: users } = await response.json();
    const container = document.getElementById("admin-user-list-container");
    if (!container) return;

    const payload = JSON.parse(atob(token.split(".")[1]));
    filteredUsers = users.filter((user) => user.id !== payload.id);

    if (filteredUsers.length === 0) {
      container.innerHTML =
        "<h2>Gestionar Usuarios</h2><p>No hay otros usuarios para mostrar.</p>";
    } else {
      container.innerHTML = `
        <h2>Gestionar Usuarios</h2>
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${filteredUsers
              .map(
                (user) => `
              <tr>
                <td>${user.id}</td>
                <td>${user.name || "N/A"}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td class="actions">
                  <button class="edit-user-btn" data-user-id="${user.id}">Editar Rol</button>
                  <button class="delete-user-btn" data-user-id="${user.id}">Eliminar</button>
                </td>
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>`;
    }
  } catch (error) {
    console.error("Error loading users:", error);
    const container = document.getElementById("admin-user-list-container");
    if (container)
      container.innerHTML =
        "<h2>Gestionar Usuarios</h2><p>Could not load users.</p>";
  }
}

async function handleDeleteUser(userId, token) {
  if (
    !confirm(
      "¿Estás seguro de que quieres eliminar este usuario? Esta acción es irreversible.",
    )
  )
    return;

  try {
    const response = await fetch(
      `https://sandbook-production-aa04.up.railway.app/api/users/${userId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (response.ok) {
      alert("Usuario eliminado exitosamente.");
      fetchAndDisplayUsers(token);
    } else {
      const result = await response.json();
      throw new Error(result.message || "Error al eliminar el usuario.");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    alert(error.message);
  }
}

function displayEditUserRoleModal(user, token) {
  if (document.querySelector(".modal-overlay")) return;
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "modal-overlay";
  const modalContent = document.createElement("div");
  modalContent.className = "modal-content";

  modalContent.innerHTML = `
    <h2>Editar Rol de Usuario</h2>
    <p><strong>Usuario:</strong> ${user.name || user.email}</p>
    <form id="edit-user-role-form">
      <label for="edit-role">Nuevo Rol:</label>
      <select id="edit-role" name="role">
        <option value="USER" ${user.role === "USER" ? "selected" : ""}>USER</option>
        <option value="ADMIN" ${user.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
      </select>
      <div class="modal-actions">
        <button type="submit">Guardar Rol</button>
        <button type="button" class="cancel-btn">Cancelar</button>
      </div>
    </form>`;

  document.body.appendChild(modalOverlay);
  modalOverlay.appendChild(modalContent);

  document
    .getElementById("edit-user-role-form")
    .addEventListener("submit", (event) =>
      handleUpdateUserRole(event, user.id, token),
    );
  modalOverlay.addEventListener("click", (event) => {
    if (
      event.target === modalOverlay ||
      event.target.classList.contains("cancel-btn")
    ) {
      document.body.removeChild(modalOverlay);
    }
  });
}

async function handleUpdateUserRole(event, userId, token) {
  event.preventDefault();
  const form = event.target;
  const newRole = form.role.value;

  try {
    const response = await fetch(
      `https://sandbook-production-aa04.up.railway.app/api/users/${userId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      },
    );
    const result = await response.json();
    if (response.ok) {
      alert("Rol de usuario actualizado exitosamente.");
      document.body.removeChild(document.querySelector(".modal-overlay"));
      fetchAndDisplayUsers(token);
    } else {
      throw new Error(result.message || "Error al actualizar el rol.");
    }
  } catch (error) {
    console.error("Error updating role:", error);
    alert(error.message);
  }
}