document.addEventListener("DOMContentLoaded", () => {
    setupRegisterForm();
});

function setupRegisterForm() {
    const registerForm = document.getElementById("register-form");
    const submitBtn = document.getElementById("submit-btn");
    const btnText = document.querySelector(".btn-text");
    const btnLoading = document.querySelector(".btn-loading");

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        // Mostrar estado de carga
        submitBtn.disabled = true;
        btnText.style.display = "none";
        btnLoading.style.display = "inline";
        
        const form = event.target;
        const name = form.name.value;
        const email = form.email.value;
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        const terms = form.terms.checked;

        // Validaciones
        if (!name || !email || !password || !confirmPassword) {
            showStatus("Por favor, completa todos los campos.", "error");
            resetButton();
            return;
        }

        if (password !== confirmPassword) {
            showStatus("Las contraseñas no coinciden.", "error");
            resetButton();
            return;
        }

        if (password.length < 6) {
            showStatus("La contraseña debe tener al menos 6 caracteres.", "error");
            resetButton();
            return;
        }

        if (!terms) {
            showStatus("Debes aceptar los términos y condiciones.", "error");
            resetButton();
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                showStatus("Registro exitoso. Redirigiendo al login...", "success");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 2000);
            } else {
                throw new Error(result.message || "Error al registrarse.");
            }
        } catch (error) {
            console.error("Error al registrarse:", error);
            showStatus(error.message, "error");
        } finally {
            resetButton();
        }
    });

    function resetButton() {
        submitBtn.disabled = false;
        btnText.style.display = "inline";
        btnLoading.style.display = "none";
    }
}

function showStatus(message, type) {
    const formStatus = document.getElementById("form-status");
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = "block";
    
    setTimeout(() => {
        formStatus.style.display = "none";
    }, 5000);
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}