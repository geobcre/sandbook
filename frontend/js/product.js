let categories = [];
let allProducts = [];

document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.endsWith("products.html")) {
    loadCategoriesAndProducts();
  }
});

async function loadCategoriesAndProducts() {
  try {
    // Cargar categorías y productos en paralelo
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch('https://sandbook-production-aa04.up.railway.app/api/categories'),
      fetch('https://sandbook-production-aa04.up.railway.app/api/products')
    ]);

    if (categoriesResponse.ok && productsResponse.ok) {
      categories = await categoriesResponse.json();
      allProducts = await productsResponse.json();
      
      displayCategoryFilters();
      
      // Verificar si hay un filtro en la URL
      const urlParams = new URLSearchParams(window.location.search);
      const categoryId = urlParams.get('category');
      
      if (categoryId) {
        filterProducts(parseInt(categoryId));
      } else {
        displayProducts(allProducts);
      }
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
}

function displayCategoryFilters() {
  const filtersContainer = document.querySelector('.category-filters');
  if (!filtersContainer) return;

  // Botón "Todos"
  const allBtn = document.createElement('button');
  allBtn.className = 'filter-btn active';
  allBtn.textContent = 'Todos';
  allBtn.dataset.category = '';
  allBtn.addEventListener('click', () => filterProducts(''));
  filtersContainer.appendChild(allBtn);

  // Botones de categorías
  categories.forEach(category => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = category.name;
    btn.dataset.category = category.id;
    btn.addEventListener('click', () => filterProducts(category.id));
    filtersContainer.appendChild(btn);
  });
}

function filterProducts(categoryId) {
  // Actualizar botones activos
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  const activeBtn = document.querySelector(`[data-category="${categoryId}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  // Filtrar productos
  const filteredProducts = categoryId 
    ? allProducts.filter(product => product.categoryId === parseInt(categoryId))
    : allProducts;
  
  displayProducts(filteredProducts);
}

function displayProducts(products) {
  const container = document.getElementById('products-container');
  if (!container) return;

  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = '<p>No hay productos en esta categoría.</p>';
    return;
  }

  const productGrid = document.createElement('div');
  productGrid.className = 'product-grid';

  products.forEach((product) => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}" class="product-image">` : ''}
      <div class="product-info">
        <h3>${product.name}</h3>
        ${product.category ? `<span class="category-tag">${product.category.name}</span>` : ''}
        <p>${product.description || ""}</p>
        <p class="price">$${product.price.toFixed(2)}</p>
        <p>Stock: ${product.stock}</p>
        <button data-product-id="${product.id}">Añadir al Carrito</button>
      </div>
    `;
    productGrid.appendChild(productCard);
  });

  container.appendChild(productGrid);

  // Delegación de eventos para los botones
  productGrid.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.dataset.productId) {
      handleAddToCart(event.target.dataset.productId);
    }
  });
}

function handleAddToCart(productId) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Necesitas iniciar sesión para añadir productos al carrito.");
    window.location.href = "login.html";
    return;
  }

  // Decodificar el token para obtener el userId
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.id;

  addProductToBackendCart(userId, productId);
}

async function addProductToBackendCart(userId, productId) {
  try {
    const response = await fetch("https://sandbook-production-aa04.up.railway.app/api/carts/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: userId,
        productId: parseInt(productId),
        quantity: 1,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("¡Producto añadido al carrito!");
    } else {
      const errorMessage = result.message || "Ocurrió un error.";
      console.error("Error al añadir el producto:", errorMessage);
      alert(`Error al añadir el producto: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Error de conexión o de servidor:", error);
    alert("No se pudo conectar con el servidor.");
  }
}