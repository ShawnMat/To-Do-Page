const API = 'http://localhost:5000'

const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'))

if (!loggedInUser) {
    window.location.href = 'login.html'
}

let editingId = null
let allTasks = []

$('.navbar-brand').text(loggedInUser.username)

async function addTask() {
    try {
        const taskData = {
            taskName: $('#taskNameInput').val(),
            taskDesc: $('#taskDescInput').val(),
            startDate: $('#taskStartInput').val(),
            dueDate: $('#taskDueInput').val(),
            status: $('#status').val(),
            priority: $('#priority').val(),
            userId: loggedInUser.id,
            deleted: false
        }
        if (editingId) {
            const res = await fetch(`${API}/tasks/${editingId}`)
            const oldTask = await res.json()
            taskData.deleted = oldTask.deleted
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
        const modalElement = document.getElementById('addTaskModal')
        const modal = bootstrap.Modal.getOrCreateInstance(modalElement)
        modal.hide()
    } catch (error) {
        console.log(error)
    }
}

async function getTasks() {
    try {
        const response = await fetch(`${API}/tasks`)
        const data = await response.json()
        allTasks = data.filter(task =>
            task.userId == loggedInUser.id &&
            task.deleted !== true
        )
        renderTasks(allTasks)
    } catch (error) {
        console.log(error)
    }
}

function renderTasks(tasks) {
    $('.left-cont').empty()
    if (tasks.length === 0) {
        $('.left-cont').append(`
            <h3 class="text-center mt-5">
                No Tasks Found
            </h3>
        `)
        return
    }
    tasks.forEach(task => {
        $('.left-cont').append(`
            <div class="card d-flex flex-row justify-content-between align-items-center p-3 my-4 shadow">
                <h5>${task.taskName}</h5>
                <p>${task.taskDesc}</p>
                <p>${task.startDate}</p>
                <p>${task.dueDate}</p>
                <p>${task.status}</p>
                <p>${task.priority}</p>
                <div class="editDelete d-flex gap-2">
                    <button class="btn btn-warning btn-sm" onclick="editTask('${task.id}')" data-bs-toggle="modal" data-bs-target="#addTaskModal">
                        Edit
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteTask('${task.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `)
    })
}


async function deleteTask(id) {
    try {
        const res = await fetch(`${API}/tasks/${id}`)
        const task = await res.json()
        task.deleted = true
        await fetch(`${API}/tasks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(task)
        })
        getTasks()
    } catch (error) {
        console.log(error)
    }
}

async function showDeletedTasks() {
    try {
        const response = await fetch(`${API}/tasks`)
        const data = await response.json()
        const deletedTasks = data.filter(task =>
            task.userId == loggedInUser.id &&
            task.deleted === true
        )
        $('.left-cont').empty()
        if (deletedTasks.length === 0) {
            $('.left-cont').append(`
                <h3 class="text-center mt-5">
                    No Deleted Tasks
                </h3>
            `)
            return
        }
        deletedTasks.forEach(task => {
            $('.left-cont').append(`
                <div class="card d-flex flex-row justify-content-between align-items-center p-3 my-4 shadow">
                    <h5>${task.taskName}</h5>
                    <p>${task.taskDesc}</p>
                    <p>${task.startDate}</p>
                    <p>${task.dueDate}</p>
                    <p>${task.status}</p>
                    <p>${task.priority}</p>
                    <button class="btn btn-success btn-sm" onclick="restoreTask('${task.id}')">
                        Restore
                    </button>
                </div>
            `)
        })
    } catch (error) {
        console.log(error)
    }
}

async function restoreTask(id) {
    try {
        const res = await fetch(`${API}/tasks/${id}`)
        const task = await res.json()
        task.deleted = false
        await fetch(`${API}/tasks/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(task)
        })
        showDeletedTasks()
    } catch (error) {
        console.log(error)
    }
}

async function editTask(id) {
    editingId = id
    const res =
        await fetch(`${API}/tasks/${id}`)
    const data =
        await res.json()
    $('#taskNameInput').val(data.taskName)
    $('#taskDescInput').val(data.taskDesc)
    $('#taskStartInput').val(data.startDate)
    $('#taskDueInput').val(data.dueDate)
    $('#priority').val(data.priority)
    $('#status').val(data.status)
}

function clearInputs() {
    $('#taskNameInput').val('')
    $('#taskDescInput').val('')
    $('#taskStartInput').val('')
    $('#taskDueInput').val('')
    $('#priority').val('')
    $('#status').val('')
}

$('#allTasksBtn').click(() =>
    renderTasks(allTasks)
)
$('#completedBtn').click(() => {
    renderTasks(
        allTasks.filter(t =>
            t.status === 'Completed'
        )
    )
})

$('#pendingBtn').click(() => {
    renderTasks(
        allTasks.filter(t =>
            t.status === 'Pending'
        )
    )
})

$('#notStartedBtn').click(() => {
    renderTasks(
        allTasks.filter(t =>
            t.status === 'Not Started'
        )
    )
})

$('#addTaskBtn').click(() =>
    addTask()
)

function logout() {
    localStorage.clear()
    window.location.replace('login.html')
}
getTasks()