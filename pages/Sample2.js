// Toastr configuration (GLOBAL)
toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3000"
};

function validateForm() {

    let firstName = document.getElementById("firstName").value;
    let lastName = document.getElementById("lastName").value;
    let cNum = document.getElementById("cNum").value;
    let age = document.getElementById("age").value;
    let gender = document.getElementById("gender").value;
    let email = document.getElementById("email").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    // Validation
    if (
        !firstName ||
        !lastName ||
        !cNum ||
        !age ||
        !gender ||
        !email ||
        !username ||
        !password ||
        !confirmPassword
    ) {
        toastr.error("Please fill all fields");
        return;
    }

    if (password !== confirmPassword) {
        toastr.warning("Passwords do not match");
        return;
    }

    toastr.success("Registration successful!");
}