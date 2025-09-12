document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
});

function setupNavigation() {
    const token = localStorage.getItem("token");
    const navUl = document.getElementById("navbar-links");

    if (token) {
        // Decodificar token para obtener datos del usuario
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userName = payload.name || 'Usuario';
        const userRole = payload.role;

        // Limpiar enlaces existentes
        navUl.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="products.html">Productos</a></li>
            <li><a href="cart.html">Carrito</a></li>
            <li><a href="contact.html">Contacto</a></li>
        `;

        // Añadir enlace al dashboard si es Admin
        if (userRole === 'ADMIN') {
            navUl.innerHTML += '<li><a href="admin.html">Admin</a></li>';
        }

        // Añadir nombre de usuario y botón de logout
        navUl.innerHTML += `
            <li class="user-info"><span>Hola, ${userName}</span></li>
            <li><a href="#" id="logout-btn">Cerrar Sesión</a></li>
        `;

        // Añadir funcionalidad al botón de logout
        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            alert("Has cerrado sesión.");
            window.location.href = "index.html";
        });

    } else {
        // Si no hay token, mostrar los enlaces por defecto
        navUl.innerHTML = `
            <li><a href="index.html">Home</a></li>
            <li><a href="products.html">Productos</a></li>
            <li><a href="cart.html">Carrito</a></li>
            <li><a href="contact.html">Contacto</a></li>
            <li><a href="login.html">Login</a></li>
            <li><a href="register.html">Register</a></li>
        `;
    }
}
