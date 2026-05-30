$(document).ready(function () {

const API = "http://localhost:5000";

$('#age').on('input blur', function () {
    let value = $(this).val().trim();
    $('#AgeError').text('');
    if (!value) {
        $('#AgeError').text('Age Required');
    }
    else if (value < 0) {
        $('#AgeError').text('Age cannot be negative');
    }
    else if (value < 12) {
        $('#AgeError').text('Age must be 12 or above');
    }
});

$('#cNum').on('input blur', function () {

    let value = $(this).val().trim();
    const cNumRegex = /^[6-9]\d{9}$/;
    $('#contactNumberError').text('');
    if (!value) {
        $('#contactNumberError').text('Contact Required');
    }
    else if (!cNumRegex.test(value)) {
        $('#contactNumberError').text('Enter valid 10-digit number');
    }
});

$('#email').on('input blur', function () {

    let value = $(this).val().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    $('#emailAddressError').text('');

    if (!value) {
        $('#emailAddressError').text('Email Required');
    }
    else if (!emailRegex.test(value)) {
        $('#emailAddressError').text('Invalid Email');
    }
});

$('#usrname').on('input blur', function () {

    let value = $(this).val().trim();
    const usernameRegex = /^[A-Za-z0-9_]{4,20}$/;

    $('#UsernameError').text('');

    if (!value) {
        $('#UsernameError').text('Username Required');
    }
    else if (!usernameRegex.test(value)) {
        $('#UsernameError').text('4–20 chars only (A-Z, 0-9, _)');
    }
});

$('#pwd').on('input blur', function () {

    let value = $(this).val();
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/;

    $('#PasswordError').text('');

    if (!value) {
        $('#PasswordError').text('Password Required');
    }
    else if (!passwordRegex.test(value)) {
        $('#PasswordError').text('Weak Password');
    }
});

$('#cpwd').on('input blur', function () {

    let value = $(this).val();

    $('#confirmPasswordError').text('');

    if (!value) {
        $('#confirmPasswordError').text('Required');
    }
    else if (value !== $('#pwd').val()) {
        $('#confirmPasswordError').text('Passwords do not match');
    }
});


$('#signupBtn').click(async function () {

    let firstName = $('#fname').val().trim();
    let lastName = $('#lname').val().trim();
    let age = $('#age').val().trim();
    let cNum = $('#cNum').val().trim();
    let gender = $('input[name="gender"]:checked').val();
    let email = $('#email').val().trim();
    let username = $('#usrname').val().trim();
    let password = $('#pwd').val();
    let confirmPassword = $('#cpwd').val();

    $('.error').text('');

    let isValid = true;

    if (!firstName) { $('#firstNameError').text('Required'); isValid = false; }
    if (!lastName) { $('#lastNameError').text('Required'); isValid = false; }
    if (!age) { $('#AgeError').text('Required'); isValid = false; }
    if (!cNum) { $('#contactNumberError').text('Required'); isValid = false; }
    if (!gender) { $('#genderError').text('Select gender'); isValid = false; }
    if (!email) { $('#emailAddressError').text('Required'); isValid = false; }
    if (!username) { $('#UsernameError').text('Required'); isValid = false; }
    if (!password) { $('#PasswordError').text('Required'); isValid = false; }
    if (!confirmPassword) { $('#confirmPasswordError').text('Required'); isValid = false; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[A-Za-z0-9_]{4,20}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&*!]).{8,}$/;
    const cNumRegex = /^[6-9]\d{9}$/;

    if (email && !emailRegex.test(email)) {
        $('#emailAddressError').text('Invalid Email');
        isValid = false;
    }

    if (cNum && !cNumRegex.test(cNum)) {
        $('#contactNumberError').text('Invalid Number');
        isValid = false;
    }

    if (username && !usernameRegex.test(username)) {
        $('#UsernameError').text('Invalid Username');
        isValid = false;
    }

    if (password && !passwordRegex.test(password)) {
        $('#PasswordError').text('Weak Password');
        isValid = false;
    }

    if (password !== confirmPassword) {
        $('#confirmPasswordError').text('Passwords do not match');
        isValid = false;
    }

    if (!isValid) return;

    const response = await fetch(`${API}/users`);
    const users = await response.json();

    if (users.find(u => u.username === username)) {
        $('#UsernameError').text('Username already exists');
        return;
    }

    const userData = {
        firstName,
        lastName,
        age,
        cNum,
        gender,
        email,
        username,
        password
    };

    await fetch(`${API}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
    });
    Swal.fire({
        icon: 'success',
        title: 'Account Created!',
        text: 'Redirecting to login...',
        timer: 2000,
        showConfirmButton: false
    });

    setTimeout(() => {
        window.location.href = "login.html";
    }, 2000);
    });

});