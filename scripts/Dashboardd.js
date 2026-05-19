const API = 'http://localhost:5000'

console.log(localStorage.getItem('loggedInUser'));
// console.log("run");



const loggedInUser =
    JSON.parse(
        localStorage.getItem('loggedInUser')
    )

if (!loggedInUser) {

    window.location.href = 'login.html'

}

let editingId = null
let allTasks = []

$('.navbar-brand').text(
    loggedInUser.username
)

async function addTask() {

    const taskName =
        $('#taskNameInput').val()

    const taskDesc =
        $('#taskDescInput').val()

    const startDate =
        $('#taskStartInput').val()

    const dueDate =
        $('#taskDueInput').val()

    const status =
        $('#status').val()

    const taskData = {

        taskName,
        taskDesc,
        startDate,
        dueDate,
        status,
        // isDeleted=false,

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

    const modal = bootstrap.Modal.getInstance(
        document.getElementById('addTaskModal')
    )

    modal.hide()
}

async function getTasks() {
    // const activeTasks = tasks.filter(task => !task.isDeleted)
    const response = await fetch(`${API}/tasks`)

    const data = await response.json()

    allTasks = data.filter(task =>
        task.userId == loggedInUser.id
    )

    renderTasks(allTasks)
}

function renderTasks(tasks) {

    $('.right-cont').empty()

    tasks.forEach(task => {

        $('.right-cont').append(`

            <div class="card p-4 mt-3 shadow">

                <h3>${task.taskName}</h3>

                <p>${task.taskDesc}</p>

                <p>
                    <b>Start:</b>
                    ${task.startDate}
                </p>

                <p>
                    <b>Due:</b>
                    ${task.dueDate}
                </p>

                <p>
                    <b>Status:</b>
                    ${task.status}
                </p>

                <div class="d-flex gap-2">

                    <button
                        class="btn btn-warning"
                        onclick="editTask('${task.id}')"
                        data-bs-toggle="modal"
                        data-bs-target="#addTaskModal">

                        Edit

                    </button>

                    <button
                        class="btn btn-danger"
                        onclick="deleteTask('${task.id}')">

                        Delete

                    </button>

                </div>

            </div>

        `)

    })
}

async function deleteTask(id) {

    await fetch(`${API}/tasks/${id}`, {
        method: "DELETE"
        // headers: {
        //     'Content-Type': 'application/json'
        // },
        // body: JSON.stringify({
        //     isDeleted: true
        // })
    })

    getTasks()
}

async function editTask(id) {

    editingId = id

    const response =
        await fetch(`${API}/tasks/${id}`)

    const data =
        await response.json()

    $('#taskNameInput').val(data.taskName)

    $('#taskDescInput').val(data.taskDesc)

    $('#taskStartInput').val(data.startDate)

    $('#taskDueInput').val(data.dueDate)

    $('#status').val(data.status)
}

function clearInputs() {

    $('#taskNameInput').val('')

    $('#taskDescInput').val('')

    $('#taskStartInput').val('')

    $('#taskDueInput').val('')

    $('#status').val('')
}

$('#allTasksBtn').click(function () {

    renderTasks(allTasks)

})

$('#completedBtn').click(function () {

    const filteredTasks =
        allTasks.filter(task =>
            task.status === 'Completed'
        )

    renderTasks(filteredTasks)

})

$('#pendingBtn').click(function () {

    const filteredTasks =
        allTasks.filter(task =>
            task.status === 'Pending'
        )

    renderTasks(filteredTasks)

})

$('#notStartedBtn').click(function () {

    const filteredTasks =
        allTasks.filter(task =>
            task.status === 'Not Started'
        )

    renderTasks(filteredTasks)

})

$('#addTaskBtn').click(function () {

    addTask()

})

// function logout() {

//     localStorage.removeItem(
//         'loggedInUser'
//     )

//     window.location.href =
//         'login.html'
// }

function logout() {

    localStorage.clear()

    window.location.replace('login.html')

}

getTasks()