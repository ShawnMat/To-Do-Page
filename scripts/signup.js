const API = 'http://localhost:5000'

$('#signupBtn').click(async function () {

    const firstName = $('#fname').val().trim()
    const lastName = $('#lname').val().trim()
    const dob = $('#date').val()
    const age = $('#age').val()

    const gender =
        $('input[name="gender"]:checked')
        .next('label')
        .text()

    const email = $('#email').val().trim()
    const username = $('#usrname').val().trim()
    const password = $('#pwd').val()
    const confirmPassword = $('#cpwd').val()

    const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    const usernameRegex =
        /^[A-Za-z0-9_]{4,15}$/

    const passwordRegex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,}$/

    if (
        !firstName ||
        !lastName ||
        !dob ||
        !age ||
        !gender ||
        !email ||
        !username ||
        !password ||
        !confirmPassword
    ) {

        alert('Please fill all fields')
        return
    }
    if (!emailRegex.test(email)) {

        alert('Invalid Email')
        return
    }

    if (!usernameRegex.test(username)) {
        alert(
            'Username must contain 4-15 characters'
        )
        return
    }
    if (!passwordRegex.test(password)) {
        alert(
            'Password must contain uppercase, lowercase, number and special character'
        )
        return
    }
    if (password !== confirmPassword) {
        alert('Passwords do not match')
        return
    }
    const response =
        await fetch(`${API}/users`)
    const users =
        await response.json()
    const existingUser =
        users.find(user =>
            user.username === username
        )
    if (existingUser) {
        alert('Username already exists')
        return
    }
    const userData = {

        firstName,
        lastName,
        dob,
        age,
        gender,
        email,
        username,
        password
    }
    await fetch(`${API}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    })
    alert('Signup Successful')
    window.location.href = 'login.html'

})