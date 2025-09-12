document.addEventListener("DOMContentLoaded", () => {
    setupContactForm();
});

function setupContactForm() {
    const contactForm = document.getElementById("contact-form");
    const submitBtn = document.getElementById("submit-btn");
    const btnText = document.querySelector(".btn-text");
    const btnLoading = document.querySelector(".btn-loading");
    const formStatus = document.getElementById("form-status");

    contactForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        
        // Mostrar estado de carga
        submitBtn.disabled = true;
        btnText.style.display = "none";
        btnLoading.style.display = "inline";
        
        try {
            const formData = new FormData(contactForm);
            
            const response = await fetch(contactForm.action, {
                method: "POST",
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showStatus("¡Mensaje enviado exitosamente! Te responderemos pronto.", "success");
                contactForm.reset();
            } else {
                const data = await response.json();
                if (data.errors) {
                    showStatus("Hubo un error: " + data.errors.map(e => e.message).join(", "), "error");
                } else {
                    showStatus("Hubo un error al enviar el mensaje. Intenta de nuevo.", "error");
                }
            }
        } catch (error) {
            console.error("Error:", error);
            showStatus("Hubo un error de conexión. Intenta de nuevo.", "error");
        } finally {
            // Restaurar botón
            submitBtn.disabled = false;
            btnText.style.display = "inline";
            btnLoading.style.display = "none";
        }
    });
}

function showStatus(message, type) {
    const formStatus = document.getElementById("form-status");
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = "block";
    
    // Ocultar después de 5 segundos
    setTimeout(() => {
        formStatus.style.display = "none";
    }, 5000);
}