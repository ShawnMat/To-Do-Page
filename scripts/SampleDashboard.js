const API = 'http://localhost:5000'

const loggedInUser = JSON.parse(
    localStorage.getItem('loggedInUser')
)

if (!loggedInUser) {
    window.location.href = 'login.html'
}

let editingId = null
let allTasks = []

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}
// Show Today's Date
const today = new Date()

const day = today.toLocaleDateString("en-US", {
    weekday: "long"
})

const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
})
// console.log(formattedDate);

function formatDate(dateString) {
    const date = new Date(dateString);
    
    const day = date.toLocaleDateString("en-US", {
        weekday: "long"
    });
    
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const fullDate = `${day}, ${dd}-${mm}-${yyyy}`;
    return `${day}, ${dd}-${mm}-${yyyy}`;
}


$('.navbar-header')
.contents()
.first()[0]
.textContent = day


$('#taskDueInput').on('input blur', function () {

    let value = $(this).val();

    const today = getTodayDate();

    if (!value) {
        $('.taskDueInputError').text('Due Date required');
    }
    else if (value < today) {
        $('.taskDueInputError').text('Due Date cannot be before today');
        // toaster.error('Due Date cannot be before today')
    }
    else {
        $('.taskDueInputError').text('');
    }
});

$('.menu-text').click(function () {

    $('.menu-text').removeClass('active');
    $(this).addClass('active');
});


async function addTask() {
    try {

        const taskData = {
            taskName: $('#taskNameInput').val(),
            taskDesc: $('#taskDescInput').val(),
            startDate: formattedDate,
            // dueDate: formatDate($('#taskDueInput').val()),
            dueDate: $('#taskDueInput').val(),
            priority: $('#priority').val(),
            status: $('#status').val(),
            userId: loggedInUser.id,
            deleted: false
        }

        const today = getTodayDate();

    if (taskData.dueDate < today) {
        toaster.error("Due Date cannot be before current date");
        return;
    }

        if (
            !taskData.taskName ||
            !taskData.taskDesc ||
            !taskData.dueDate ||
            taskData.priority === 'Choose Priority' ||
            taskData.status === 'Choose Status'
        ) {
            toaster.error('Please fill all fields')
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
        Swal.fire({
            icon: 'success',
            title: 'Task Added Successfully',
            showConfirmButton: false,
            timer: 2000
        });

    } catch (error) {
        console.log(error)
    }
}


async function getTasks() {

    try {

        const response =
            await fetch(`${API}/tasks`)

        const data =
            await response.json()
        allTasks = data.filter(task =>
            task.userId == loggedInUser.id &&
            task.deleted !== true,           
        ).reverse()

        renderTasks(allTasks)

        updateSummary()

    } catch (error) {
        console.log(error)
    }
}

function formatFullDate(dateString) {
    const date = new Date(dateString);

    const day = date.toLocaleDateString("en-US", {
        weekday: "long"
    });

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${day}, ${dd}-${mm}-${yyyy}`;
}


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
        let priorityColor = '';
        let statusColor = '';

        // Priority Colors
        if (task.priority === 'High') {
            priorityColor = 'danger';
        }
        else if (task.priority === 'Medium') {
            priorityColor = 'warning';
        }
        else {
            priorityColor = 'success';
        }

        // Status Colors
        if (task.status === 'Completed') {
            statusColor = 'success';
        }
        else if (task.status === 'Pending') {
            statusColor = 'warning';
        }
        else {
            statusColor = 'secondary';
        }

        $('.taskList').append(`

           <div class="card w-100 rounded-1 ">
        <div class="main-content px-4 py-3">
            <div class="titleandDesc">
                <h4 class="fw-bold">${task.taskName}</h4>
                <p class="fst-italic">${task.taskDesc}</p>
            </div>
                <div class="startdate">
                    <p class="fw-bold">Start Date:</p>
                    <p>${task.startDate}</p>
                </div>
                <div class="enddate">
                    <p class="fw-bold">End Date:</p>
                    <p>${formatFullDate(task.dueDate)}</p>
                </div>

            <div class="priorityandStatus">
                <span class="badge bg-${priorityColor}">
                    ${task.priority}
                </span>

                <span class="badge bg-${statusColor}">
                    ${task.status}
                </span>
            </div>
            <div>
                <button class="btn" onclick="confirmEdit('${task.id}')">
                    <i class="bi bi-pencil-square"></i>
                </button>
                <button class = "btn" id="deleteBtn" onclick="confirmDelete('${task.id}')" >
                    <i class="bi bi-trash3"></i>
                </button>
            </div>
        </div>
    </div>

        `)
        // $('#deleteBtn').click(()=>{
        //     Swal.fire({
        //         icon: 'Confirm',
        //         title: 'Are You Sure to Delete Task?',
        //         showConfirmButton: true,
        //     }).then((result)=>{
        //         if(result.isConfirmed){
        //             deleteTask(task.id)
        //         }
        //     })
        // }) 
    })
    // console.log(tasks)
}

function confirmEdit(id) {

    Swal.fire({
        title: 'Edit Task?',
        text: 'This task will be Edited',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Edit',
        cancelButtonText: 'Cancel',
        reverseButtons: true
    }).then((result) => {

        if (result.isConfirmed) {
            editTask(id);
        }

    });

}
function successEdit(){
    Swal.fire({
        icon: 'success',
        title: 'Task Edited Successfully',
        showConfirmButton: false,
        timer: 2000
    });
}
function confirmDelete(id) {
    
    Swal.fire({
        title: 'Delete Task?',
        text: 'This task will be moved to Restore.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'Cancel',
        reverseButtons: true
    }).then((result) => {
        
        if (result.isConfirmed) {
            deleteTask(id);
        }
        
    });
    
}
function successDelete(){
    Swal.fire({
        icon: 'success',
        title: 'Task Deleted Successfully',
        showConfirmButton: false,
        timer: 2000
    });
}
function confirmRestore(id) {
    
    Swal.fire({
        title: 'Restore Task?',
        text: 'This task will be Restored.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Restore',
        cancelButtonText: 'Cancel',
        reverseButtons: true
    }).then((result) => {
        
        if (result.isConfirmed) {
            restoreTask(id);
        }
        
    });
    
}
function successRestore(){
    Swal.fire({
        icon: 'success',
        title: 'Task Restored Successfully',
        showConfirmButton: false,
        timer: 2000
    });
}

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

    $('#inprogressNum').text(
        inProgress
    )
    const notStarted =
        allTasks.filter(
            task => task.status === 'Not Started'
        ).length

    $('#notStartedNum').text(
        notStarted
    )

    const today =
        new Date().toISOString().split('T')[0]

    const overdue =
        allTasks.filter(
            task =>
                task.dueDate < today &&
                task.status !== 'Completed'
        ).length

    // $('.overDue').find('p').remove()

    // $('.overDue').append(`
    //     <p class="fs-1">${overdue}</p>
    // `)
    $('#overdueNum').text(
        overdue
    )
}


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
        successDelete()
    } catch (error) {
        console.log(error)
    }
}



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
                        onclick="confirmRestore('${task.id}')">

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
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(task)
        })

        // Refresh allTasks array
        const response = await fetch(`${API}/tasks`)
        const data = await response.json()

        allTasks = data.filter(task =>
            task.userId == loggedInUser.id &&
            task.deleted !== true
        )
        

        await showDeletedTasks()

        updateSummary()

        successRestore()

    } catch (error) {
        console.log(error)
    }
}



async function editTask(id) {

    editingId = id

    const res =
        await fetch(
            `${API}/tasks/${id}`
        )

    const task =
        await res.json()

    $('#EtaskNameInput').val(
        task.taskName
    )

    $('#EtaskDescInput').val(
        task.taskDesc
    )

    $('#EtaskStartInput').val(
        task.startDate
    )

    $('#EtaskDueInput').val(
        task.dueDate
    )

    $('#Epriority').val(
        task.priority
    )

    $('#Estatus').val(
        task.status
    )

    const modal = new bootstrap.Modal(
        document.getElementById('editTaskModal')
    )

    modal.show()
}

async function updateTask() {

    try {
        console.log("Editing ID:", editingId)
        const taskData = {
            taskName: $('#EtaskNameInput').val(),
            taskDesc: $('#EtaskDescInput').val(),
            dueDate: $('#EtaskDueInput').val(),
            priority: $('#Epriority').val(),
            status: $('#Estatus').val(),
            userId: loggedInUser.id,
            deleted: false,
            startDate: formattedDate
        }
        // console.log(taskData);

        if (
            !taskData.taskName ||
            !taskData.taskDesc ||
            !taskData.dueDate ||
            taskData.priority === 'Choose Priority' ||
            taskData.status === 'Choose Status'
        ) {
            // console.log(task);
            
            toastr.error('Please fill all fields')
            return
        }
        const today = getTodayDate();

        if (taskData.dueDate < today) {
            toastr.error("Due Date cannot be before current date");
            return;
        }

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

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                document.getElementById(
                    'editTaskModal'
                )
            )

        modal.hide()

        getTasks()

        successEdit()

    } catch (error) {

        console.log(error)

        toastr.error('Failed to update task')
    }
}
$('.totaltasks').click(()=>{
    renderTasks(allTasks)
})
$('.completed').click(()=>{
    renderTasks(allTasks.filter(
        task => task.status === 'Completed'
    ))
})
$('.inprogress').click(()=>{
    renderTasks(allTasks.filter(
        task => task.status === 'Pending'
    ))
})
$('.notStarted').click(()=>{
    renderTasks(allTasks.filter(
        task => task.status === 'Not Started'
    ))
})

// function convertToInputDate(dateString) {
//     const datePart = dateString.split(", ")[1];
//     const [dd, mm, yyyy] = datePart.split("/");

//     return `${yyyy}-${mm}-${dd}`;
// }

// console.log(
//     convertToInputDate("Tuesday, 02/06/2026")
// );

// $('.overDue').click(()=>{
//     renderTasks(allTasks.filter(
//         task => task.dueDate < today
//     ))
// })

$('.overDue').click(() => {

    const today = getTodayDate();

    renderTasks(
        allTasks.filter(
            task =>
                task.dueDate < today &&
                task.status !== 'Completed'
        )
    );

});






$('#p-btns:nth-child(1)').click(() => {
    renderTasks(allTasks)
})
$('#p-btns:nth-child(2)').click(() => {
    renderTasks(
        allTasks.filter(
            task => task.priority === 'High'
        )
    )
})

$('#p-btns:nth-child(3)').click(() => {
    renderTasks(
        allTasks.filter(
            task => task.priority === 'Medium'
        )
    )
})

$('#p-btns:nth-child(4)').click(() => {
    renderTasks(
        allTasks.filter(
            task => task.priority === 'Low'
        )
    )
})
const userProfileName = document.getElementById('userNameVal') 
userProfileName.textContent = loggedInUser.firstName;
console.log(userProfileName)

$('#allTaskbtn').click(()=>{
    renderTasks(allTasks)
})

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

// let calendarInitialized = false;
// $('#calendarBtn').click(() => {

//     $('.showTasks').html(`
//         <div id="calendar"></div>
//     `);

//     const calendar =
//         new FullCalendar.Calendar(
//             document.getElementById('calendar'),
//             {
//                 initialView: 'dayGridMonth'
//             }
//         );

//     calendar.render();
// });
$('#applyDateFilter').click(() => {

    const startDate =
        $('#filterStartDate').val();

    const dueDate =
        $('#filterDueDate').val();

    $('#filterDateError').text('');

    if (!startDate || !dueDate) {

        $('#filterDateError').text(
            'Please select both dates'
        );

        return;
    }

    if (startDate > dueDate) {

        $('#filterDateError').text(
            'Start date cannot be after due date'
        );

        return;
    }

    const filteredTasks =
        allTasks.filter(task => {

            const taskDueDate =
                task.dueDate;

            return (
                taskDueDate >= startDate &&
                taskDueDate <= dueDate
            );

        }).reverse();

    renderTasks(filteredTasks);

    bootstrap.Modal
        .getInstance(
            document.getElementById(
                'filterDateModal'
            )
        )
        .hide();

});

$('#clearDateFilter').click(() => {

    $('#filterStartDate').val('');
    $('#filterDueDate').val('');

    renderTasks(allTasks);

});
document.addEventListener('DOMContentLoaded', () => {

    const calendarEl =
        document.getElementById('calendar');

    const calendar =
        new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth'
        });

    $('#calendarModal').on('shown.bs.modal', () => {
        calendar.render();
    });

});




$('#submitTaskBtn').click(() =>
    addTask()
)
$('#addTaskBtn').click(() =>
    getTasks()
)
$('#editTaskBtn').click(() =>
    updateTask()
    // successEdit()
)
function logout() {
    localStorage.clear()
    window.location.replace('login.html')
}   
// Initial Load
getTasks()