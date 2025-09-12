document.addEventListener("DOMContentLoaded", () => {
    setupLoginForm();
});

function setupLoginForm() {
    const loginForm = document.getElementById("login-form");
    const submitBtn = document.getElementById("submit-btn");
    const btnText = document.querySelector(".btn-text");
    const btnLoading = document.querySelector(".btn-loading");

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        // Mostrar estado de carga
        submitBtn.disabled = true;
        btnText.style.display = "none";
        btnLoading.style.display = "inline";
        
        const form = event.target;
        const email = form.email.value;
        const password = form.password.value;

        if (!email || !password) {
            showStatus("Por favor, completa todos los campos.", "error");
            resetButton();
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (response.ok) {
                localStorage.setItem("token", result.token);
                showStatus("Inicio de sesión exitoso. Redirigiendo...", "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 1500);
            } else {
                throw new Error(result.message || "Error al iniciar sesión.");
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
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