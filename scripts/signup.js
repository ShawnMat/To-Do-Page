const API = 'http://localhost:5000';

async function addTask(){
    console.log('runn')
    const fname = $('#fname').val();
    const response = await fetch(`${API}/tasks`,{
        method: "POST",
        headers:{
            'Content-type':'application/json'
        },
        body:JSON.stringify({
            fname: fname
        })
    })
}

const id = "iycvOsVYfLs"

async function getUser() {
    const response = await fetch(`${API}/tasks/${id}`)
    const data = await response.json()
    console.log(data)
}

$('#signupBtn').on('click',()=>{
    addTask()
    getUser
})