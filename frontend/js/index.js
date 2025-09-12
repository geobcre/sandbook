document.addEventListener("DOMContentLoaded", () => {
    setupNavigation();
});

function setupNavigation() {
    const navbarLinks = document.getElementById("navbar-links");
    if (!navbarLinks) return;

    const token = localStorage.getItem("token");
    
    if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]));
        
        navbarLinks.innerHTML = `
            <li><a href="index.html">Inicio</a></li>
            <li><a href="products.html">Productos</a></li>
            <li><a href="cart.html">Carrito</a></li>
            <li><a href="contact.html">Contacto</a></li>
            ${payload.role === 'ADMIN' ? '<li><a href="admin.html">Admin</a></li>' : ''}
            <li><a href="#" onclick="logout()">Cerrar Sesión</a></li>
        `;
    } else {
        navbarLinks.innerHTML = `
            <li><a href="index.html">Inicio</a></li>
            <li><a href="products.html">Productos</a></li>
            <li><a href="contact.html">Contacto</a></li>
            <li><a href="login.html">Iniciar Sesión</a></li>
            <li><a href="register.html">Registrarse</a></li>
        `;
    }
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}