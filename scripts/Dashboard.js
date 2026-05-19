const API = 'http://localhost:5000'
let editingId = null
let allTasks = []

async function addTask() {

    const taskName =
        $('#taskNameInput').val().trim()

    const taskDesc =
        $('#taskDescInput').val().trim()

    const startDate =
        $('#taskStartInput').val()

    const dueDate =
        $('#taskDueInput').val()

    const status =
        $('#status').val()

    if (!taskName) {
        alert('Please enter a Task Name')
        return
    }
    if (!status) {
        alert('Please select a Status')
        return
    }
    const taskData = {
        taskName,
        taskDesc,
        startDate,
        dueDate,
        status
    }

    try {

        if (editingId) {
            await fetch(`${API}/tasks/${editingId}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(taskData)

            })

            editingId = null

            console.log('Task updated successfully')

        } else {

            // ADD NEW TASK

            await fetch(`${API}/tasks`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(taskData)

            })

            console.log('Task added successfully')
        }

        clearInputs()

        getTasks()

        // CLOSE MODAL

        const modal =
            bootstrap.Modal.getInstance(
                document.getElementById('addTaskModal')
            )

        if (modal) {
            modal.hide()
        }

    } catch (error) {

        console.error('Error adding/updating task:', error)

        alert('Error saving task. Please try again.')
    }
}

async function getTasks() {

    try {

        const response =
            await fetch(`${API}/tasks`)

        if (!response.ok) {

            throw new Error('Failed to fetch tasks')
        }

        const data =
            await response.json()

        allTasks = data

        renderTasks(allTasks)

    } catch (error) {

        console.error('Error fetching tasks:', error)

        $('.right-cont').html(`

            <div class="alert alert-danger mt-5">
                Error loading tasks. Please check if the server is running.
            </div>

        `)
    }
}


function renderTasks(tasks) {

    $('.right-cont').empty()

    if (tasks.length === 0) {

        $('.right-cont').append(`

            <div class="text-center mt-5">
                <h3 class="text-muted"> No Tasks Found</h3>
                <p class="text-secondary">Try adding a new task or change your filter</p>
            </div>

        `)

        return
    }

    tasks.forEach(task => {

        let statusBadgeColor = 'bg-secondary'

        if (task.status.trim().toLowerCase() === 'completed') {
            statusBadgeColor = 'bg-success'
        } else if (task.status.trim().toLowerCase() === 'pending') {
            statusBadgeColor = 'bg-warning'
        } else if (task.status.trim().toLowerCase() === 'not started') {
            statusBadgeColor = 'bg-danger'
        }

        $('.right-cont').append(`

            <div class="card p-4 mt-3 shadow-sm">

                <h3>${escapeHtml(task.taskName)}</h3>

                <p class="text-muted">${escapeHtml(task.taskDesc)}</p>

                <div class="row mt-3 mb-3">

                    <div class="col-md-6">
                        <p>
                            <b>Start Date:</b>
                            <br>
                            ${task.startDate || 'Not set'}
                        </p>
                    </div>

                    <div class="col-md-6">
                        <p>
                            <b>Due Date:</b>
                            <br>
                            ${task.dueDate || 'Not set'}
                        </p>
                    </div>

                </div>

                <p>
                    <b>Status:</b>
                    <span class="badge ${statusBadgeColor}">${task.status}</span>
                </p>

                <div class="d-flex gap-2 mt-3">

                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editTask('${task.id}')"
                        data-bs-toggle="modal"
                        data-bs-target="#addTaskModal"
                    >
                        Edit
                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteTask('${task.id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `)

    })
}

// =============================================
// DELETE TASK
// =============================================

async function deleteTask(id) {

    if (!confirm('Are you sure you want to delete this task?')) {
        return
    }

    try {

        await fetch(`${API}/tasks/${id}`, {

            method: "DELETE"

        })

        console.log('Task deleted successfully')

        getTasks()

    } catch (error) {

        console.error('Error deleting task:', error)

        alert('Error deleting task. Please try again.')
    }
}

// =============================================
// EDIT TASK
// =============================================

async function editTask(id) {

    editingId = id

    try {

        const response =
            await fetch(`${API}/tasks/${id}`)

        if (!response.ok) {

            throw new Error('Failed to fetch task')
        }

        const data =
            await response.json()

        $('#taskNameInput').val(data.taskName)

        $('#taskDescInput').val(data.taskDesc)

        $('#taskStartInput').val(data.startDate)

        $('#taskDueInput').val(data.dueDate)

        $('#status').val(data.status)

    } catch (error) {

        console.error('Error loading task for editing:', error)

        alert('Error loading task. Please try again.')
    }
}

// =============================================
// CLEAR INPUT FIELDS
// =============================================

function clearInputs() {

    $('#taskNameInput').val('')

    $('#taskDescInput').val('')

    $('#taskStartInput').val('')

    $('#taskDueInput').val('')

    $('#status').val('')

    editingId = null
}

// =============================================
// ESCAPE HTML TO PREVENT XSS
// =============================================

function escapeHtml(text) {

    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }

    return text.replace(/[&<>"']/g, m => map[m])
}

// =============================================
// INITIALIZE ON DOCUMENT READY
// =============================================

$(document).ready(function() {

    // ==========================================
    // FILTER: ALL TASKS
    // ==========================================

    $('#allTasksBtn').click(function() {

        renderTasks(allTasks)

        updateActiveButton(this)

    })

    // ==========================================
    // FILTER: COMPLETED TASKS
    // ==========================================

    $('#completedBtn').click(function() {

        const filteredTasks =
            allTasks.filter(task =>
                task.status.trim().toLowerCase() === 'completed'
            )

        renderTasks(filteredTasks)

        updateActiveButton(this)

    })

    // ==========================================
    // FILTER: PENDING TASKS
    // ==========================================

    $('#pendingBtn').click(function() {

        const filteredTasks =
            allTasks.filter(task =>
                task.status.trim().toLowerCase() === 'pending'
            )

        renderTasks(filteredTasks)

        updateActiveButton(this)

    })

    // ==========================================
    // FILTER: NOT STARTED TASKS
    // ==========================================

    $('#notStartedBtn').click(function() {

        const filteredTasks =
            allTasks.filter(task =>
                task.status.trim().toLowerCase() === 'not started'
            )

        renderTasks(filteredTasks)

        updateActiveButton(this)

    })

    // ==========================================
    // ADD/SUBMIT TASK BUTTON
    // ==========================================

    $('#addTaskBtn').click(function() {

        addTask()

    })

    // ==========================================
    // RESET MODAL WHEN OPENING FOR NEW TASK
    // ==========================================

    $('#addTaskModal').on('show.bs.modal', function() {

        if (!editingId) {

            clearInputs()

            $('.modal-title').text('Add New Task')

        } else {

            $('.modal-title').text('Edit Task')
        }
    })

    // ==========================================
    // RESET EDITING ID WHEN MODAL CLOSES
    // ==========================================

    $('#addTaskModal').on('hidden.bs.modal', function() {

        editingId = null

        clearInputs()

    })

    // ==========================================
    // INITIAL LOAD - GET ALL TASKS
    // ==========================================

    getTasks()

})

// =============================================
// HELPER FUNCTION: UPDATE ACTIVE BUTTON
// =============================================

function updateActiveButton(button) {

    // Remove active class from all filter buttons

    $('#allTasksBtn, #completedBtn, #pendingBtn, #notStartedBtn')
        .removeClass('active')

    // Add active class to clicked button

    $(button).addClass('active')
}
