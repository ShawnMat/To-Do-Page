const API = 'http://localhost:5000'

const loggedInUser =
    JSON.parse(localStorage.getItem('loggedInUser'))

if (!loggedInUser) {
    window.location.href = 'login.html'
}

let editingId = null
let allTasks = []

$('.navbar-brand').text(loggedInUser.username)


// -------------------- ADD / UPDATE TASK --------------------
async function addTask() {

    try {

        const taskData = {
            taskName: $('#taskNameInput').val(),
            taskDesc: $('#taskDescInput').val(),
            startDate: $('#taskStartInput').val(),
            dueDate: $('#taskDueInput').val(),
            status: $('#status').val(),
            userId: loggedInUser.id
        }

        if (editingId) {

            await fetch(`${API}/tasks/${editingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(taskData)
            })

            editingId = null

        } else {

            await fetch(`${API}/tasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(taskData)
            })
        }

        clearInputs()
        getTasks()

        // SAFE MODAL CLOSE
        const modalElement = document.getElementById('addTaskModal')
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement)
        modal.hide()

    } catch (error) {
        console.log(error)
    }
}


// -------------------- GET TASKS --------------------
async function getTasks() {

    try {

        const response = await fetch(`${API}/tasks`)
        const data = await response.json()

        allTasks = data.filter(task =>
            task.userId == loggedInUser.id
        )

        renderTasks(allTasks)

    } catch (error) {
        console.log(error)
    }
}


// -------------------- RENDER --------------------
function renderTasks(tasks) {

    $('.left-cont').empty()

    tasks.forEach(task => {

        $('.left-cont').append(`

            <div class="card p-3 my-4 shadow" style=" width:300px; height:250px">

                <h5>${task.taskName}</h5>
                <p>${task.taskDesc}</p>

                <p><b>Start:</b> ${task.startDate}</p>
                <p><b>Due:</b> ${task.dueDate}</p>
                <p><b>Status:</b> ${task.status}</p>

                <div class="editDelete">
                    <button class="btn btn-warning btn-sm"
                        onclick="editTask('${task.id}')"
                        data-bs-toggle="modal"
                        data-bs-target="#addTaskModal">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-sm"
                        onclick="deleteTask('${task.id}')">
                        Delete
                    </button>
                </div>

            </div>

        `)
    })
}


// -------------------- DELETE --------------------
async function deleteTask(id) {

    await fetch(`${API}/tasks/${id}`, {
        method: "DELETE"
    })

    getTasks()
}


// -------------------- EDIT --------------------
async function editTask(id) {

    editingId = id

    const res = await fetch(`${API}/tasks/${id}`)
    const data = await res.json()

    $('#taskNameInput').val(data.taskName)
    $('#taskDescInput').val(data.taskDesc)
    $('#taskStartInput').val(data.startDate)
    $('#taskDueInput').val(data.dueDate)
    $('#status').val(data.status)
}


// -------------------- CLEAR INPUTS --------------------
function clearInputs() {

    $('#taskNameInput').val('')
    $('#taskDescInput').val('')
    $('#taskStartInput').val('')
    $('#taskDueInput').val('')
    $('#status').val('')
}


// -------------------- FILTERS --------------------
$('#allTasksBtn').click(() => renderTasks(allTasks))

$('#completedBtn').click(() => {
    renderTasks(allTasks.filter(t => t.status === 'Completed'))
})

$('#pendingBtn').click(() => {
    renderTasks(allTasks.filter(t => t.status === 'Pending'))
})

$('#notStartedBtn').click(() => {
    renderTasks(allTasks.filter(t => t.status === 'Not Started'))
})


// -------------------- ADD TASK BUTTON --------------------
$('#addTaskBtn').click(() => addTask())


// -------------------- LOGOUT --------------------
function logout() {
    localStorage.clear()
    window.location.replace('login.html')
}


// INIT
getTasks()