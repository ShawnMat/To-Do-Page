const API = 'http://localhost:3000'

const loggedInUser = JSON.parse(
    localStorage.getItem('loggedInUser')
)

if (!loggedInUser) {
    window.location.href = 'login.html'
}

let editingId = null
let allTasks = []

// Show Today's Date
const today = new Date()

$('.navbar-header')
    .contents()
    .first()[0]
    .textContent =
    today.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

// ======================
// Add / Update Task
// ======================

async function addTask() {
    try {

        const taskData = {
            taskName: $('#taskNameInput').val(),
            taskDesc: $('#taskDescInput').val(),
            startDate: $('#taskStartInput').val(),
            dueDate: $('#taskDueInput').val(),
            priority: $('#priority').val(),
            status: $('#status').val(),
            userId: loggedInUser.id,
            deleted: false
        }

        if (
            !taskData.taskName ||
            !taskData.taskDesc ||
            !taskData.startDate ||
            !taskData.dueDate ||
            taskData.priority === 'Choose Priority' ||
            taskData.status === 'Choose Status'
        ) {
            alert('Please fill all fields')
            return
        }

        if (editingId) {

            const res = await fetch(
                `${API}/tasks/${editingId}`
            )

            const oldTask = await res.json()

            taskData.deleted = oldTask.deleted

            await fetch(
                `${API}/tasks/${editingId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(taskData)
                }
            )

            editingId = null

        } else {

            await fetch(`${API}/tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            })
        }

        clearInputs()

        getTasks()

        const modal =
            bootstrap.Modal.getInstance(
                document.getElementById(
                    'addTaskModal'
                )
            )

        modal.hide()

    } catch (error) {
        console.log(error)
    }
}

// ======================
// Get Tasks
// ======================

async function getTasks() {

    try {

        const response =
            await fetch(`${API}/tasks`)

        const data =
            await response.json()

        allTasks = data.filter(task =>
            task.userId == loggedInUser.id &&
            task.deleted !== true
        )

        renderTasks(allTasks)

        updateSummary()

    } catch (error) {
        console.log(error)
    }
}

// ======================
// Render Tasks
// ======================

function renderTasks(tasks) {

    $('.taskList').empty()

    if (tasks.length === 0) {

        $('.taskList').append(`
            <h5 class="text-center mt-3">
                No Tasks Found
            </h5>
        `)

        return
    }

    tasks.forEach(task => {

        let priorityColor = ''

        if (task.priority === 'High') {
            priorityColor = 'danger'
        }
        else if (task.priority === 'Normal') {
            priorityColor = 'warning'
        }
        else {
            priorityColor = 'success'
        }

        $('.taskList').append(`

            <div class="card w-100 d-flex flex-row  bg-primary rounded-1">
                        <input type="checkbox" id="taskCheckbox">
                        <div class="main-content d-flex gap-5 justify-content-between">
                            <h5>${task.taskName}</h5>
                            <h5>${task.taskDesc}</h5>
                            <p>${task.startDate}</p>
                            <p>${task.dueDate}</p>
                            <p>${task.status}</p>
                        </div>
                        <span class="badge bg-secondary">${task.priority}</span>
                    </div>

        `)
    })
}

// ======================
// Summary Cards
// ======================

function updateSummary() {

    $('#totalNumber').text(
        allTasks.length
    )

    const completed =
        allTasks.filter(
            task => task.status === 'Completed'
        ).length

    $('#completedNum').text(
        completed
    )

    const inProgress =
        allTasks.filter(
            task => task.status === 'Pending'
        ).length

    $('.inprogress p').text(
        inProgress
    )

    const today =
        new Date().toISOString().split('T')[0]

    const overdue =
        allTasks.filter(
            task =>
                task.dueDate < today &&
                task.status !== 'Completed'
        ).length

    $('.overDue').find('p').remove()

    $('.overDue').append(`
        <p>${overdue}</p>
    `)
}

// ======================
// Delete Task
// ======================

async function deleteTask(id) {

    try {

        const res =
            await fetch(
                `${API}/tasks/${id}`
            )

        const task =
            await res.json()

        task.deleted = true

        await fetch(
            `${API}/tasks/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body: JSON.stringify(task)
            }
        )

        getTasks()

    } catch (error) {
        console.log(error)
    }
}

// ======================
// Show Deleted Tasks
// ======================

async function showDeletedTasks() {

    try {

        const response =
            await fetch(`${API}/tasks`)

        const data =
            await response.json()

        const deletedTasks =
            data.filter(task =>
                task.userId ==
                    loggedInUser.id &&
                task.deleted === true
            )

        $('.taskList').empty()

        if (
            deletedTasks.length === 0
        ) {

            $('.taskList').append(`
                <h5 class="text-center">
                    No Deleted Tasks
                </h5>
            `)

            return
        }

        deletedTasks.forEach(task => {

            $('.taskList').append(`
                <div class="card p-3 m-2">

                    <h5>${task.taskName}</h5>

                    <p>${task.taskDesc}</p>

                    <button
                        class="btn btn-success btn-sm"
                        onclick="restoreTask('${task.id}')">

                        Restore

                    </button>

                </div>
            `)
        })

    } catch (error) {
        console.log(error)
    }
}

// ======================
// Restore Task
// ======================

async function restoreTask(id) {

    try {

        const res =
            await fetch(
                `${API}/tasks/${id}`
            )

        const task =
            await res.json()

        task.deleted = false

        await fetch(
            `${API}/tasks/${id}`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body: JSON.stringify(task)
            }
        )

        showDeletedTasks()

    } catch (error) {
        console.log(error)
    }
}

// ======================
// Edit Task
// ======================

async function editTask(id) {

    editingId = id

    const res =
        await fetch(
            `${API}/tasks/${id}`
        )

    const task =
        await res.json()

    $('#taskNameInput').val(
        task.taskName
    )

    $('#taskDescInput').val(
        task.taskDesc
    )

    $('#taskStartInput').val(
        task.startDate
    )

    $('#taskDueInput').val(
        task.dueDate
    )

    $('#priority').val(
        task.priority
    )

    $('#status').val(
        task.status
    )
}

// ======================
// Priority Filters
// ======================

$('#p-btns:nth-child(1)').click(() => {
    renderTasks(
        allTasks.filter(
            task => task.priority === 'High'
        )
    )
})

$('#p-btns:nth-child(2)').click(() => {
    renderTasks(
        allTasks.filter(
            task => task.priority === 'Normal'
        )
    )
})

$('#p-btns:nth-child(3)').click(() => {
    renderTasks(
        allTasks.filter(
            task => task.priority === 'Low'
        )
    )
})

// ======================
// Clear Inputs
// ======================

function clearInputs() {

    $('#taskNameInput').val('')
    $('#taskDescInput').val('')
    $('#taskStartInput').val('')
    $('#taskDueInput').val('')
    $('#priority').prop(
        'selectedIndex',
        0
    )
    $('#status').prop(
        'selectedIndex',
        0
    )
}

// ======================
// Events
// ======================

$('#addTaskBtn').click(() =>
    addTask()
)
function logout() {
    localStorage.clear()
    window.location.replace('login.html')
}   
// Initial Load
getTasks()