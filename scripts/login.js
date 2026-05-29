const API = 'http://localhost:3000'

$('#loginBtn').click(async function () {
    const username = $('#usrname').val().trim()

    const password = $('#pwd').val()

    const usernameRegex = /^[A-Za-z0-9_]{4,15}$/

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,}$/

    if (!username || !password) {
        alert('Please fill all fields')
        return
    }
    if (!usernameRegex.test(username)) {
        alert('Invalid Username')
        return
    }
    if (!passwordRegex.test(password)) {
        alert('Invalid Password Format')
        return
    }
    const response =
        await fetch(`${API}/users`)
    const users =
        await response.json()
    const validUser =
        users.find(user =>
            user.username === username &&
            user.password === password
        )
    if (validUser) {
        alert('Login Successful')
        localStorage.setItem(
            'loggedInUser',
            JSON.stringify(validUser)
        )
        window.location.replace(    
            'Dashboardd.html')
    } else {
        alert('Invalid Username or Password')
    }
})