const API = 'http://localhost:5000'

async function addTask(){
    console.log('Runnning');
    
    const taskName = $('#taskNameInput').val()
    const taskDesc = $('#taskDescInput').val()
    const startDate = $('#taskStartInput').val()
    const dueDate = $('#taskDueInput').val()
    const status = $('#status').val()

    const response = await fetch(`${API}/tasks`,
        {
        method:"POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            taskName,
            taskDesc,
            startDate,
            dueDate,
            status
        })
    })
}
async function getUser() {
    const response = await fetch(`${API}/tasks/${id}`)
    const data = await response.json()
    $('#taskNameInput').val(data.taskName)
    $('#taskDescInput').val(data.taskDesc)
    $('#taskStartInput').val(data.startDate)
    $('#taskDueInput').val(data.dueDate)
    $('#status').val(data.status)
}

$('#addTaskBtn').on('click',()=>{
    addTask()
    getUser()
})