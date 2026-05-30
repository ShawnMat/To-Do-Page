$(document).ready(function () {

const API = 'http://localhost:5000'


$('#usrname').on('input blur', function () {
    let value = $(this).val().trim();
    $('#UserError').text('');
    if (!value) {
        $('#UserError').text('UserName is required');
    }
});
$('#pwd').on('input blur', function () {
    let value = $(this).val().trim();
    $('#PwdError').text('');
    if (!value) {
        $('#PwdError').text('Password is required');
    }
});

$('#loginBtn').click(async function () {
    const username = $('#usrname').val().trim()

    const password = $('#pwd').val()

    const usernameRegex = /^[A-Za-z0-9_]{4,20}$/

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/
    if (!username || !password) {
        toastr.error('Please fill all fields');
        return;
        
    }
    if (!usernameRegex.test(username)) {
        toastr.error('Invalid UserName');
        return
    }
    if (!passwordRegex.test(password)) {
        toastr.error('Invalid Password format');
        return
    }
    const response = await fetch(`${API}/users`)
    const users = await response.json()
    const validUser = users.find(user =>
            user.username === username &&
            user.password === password)
    if (validUser) {
        Swal.fire({
            icon: 'success',
            title: 'Log In Successful!',
            text: 'Redirecting to Dashboard...',
            timer: 2000,
            showConfirmButton: false
        });

        localStorage.setItem(
            'loggedInUser',
            JSON.stringify(validUser)
        )
    setTimeout(() => {
        window.location.replace("Dashboardd.html")
    }, 2000);
        
    } else {
        toastr.error('Invalid Username or Password');
    }
})
});