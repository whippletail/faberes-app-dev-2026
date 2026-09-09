// ==========================
// ELEMENTS
// ==========================

const addTaskBtn = document.getElementById("addTaskBtn");

const taskModal = document.getElementById("taskModal");

const closeModal = document.getElementById("closeModal");

const modalTitle = document.getElementById("modalTitle");

const taskForm = document.getElementById("taskForm");

const taskInput = document.getElementById("taskInput");

const priorityInput = document.getElementById("priorityInput");

const taskList = document.getElementById("taskList");

const errorMessage = document.getElementById("errorMessage");

const deleteAllBtn = document.getElementById("deleteAllBtn");

const taskCount = document.getElementById("taskCount");




// ==========================
// STATE
// ==========================

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let editMode = false;
let currentEditId = null;




// ==========================
// SAVE TASKS
// ==========================

function saveTasks(){

    localStorage.setItem(
        "tasks",
        JSON.stringify(tasks)
    );

}




// ==========================
// OPEN MODAL
// ==========================

addTaskBtn.addEventListener("click", function(){
    editMode = false;
    currentEditId = null;
    modalTitle.textContent = "Create Task";
    taskForm.reset();
    taskModal.style.display = "flex";
});




// ==========================
// CLOSE MODAL
// ==========================

closeModal.addEventListener("click", function(){

    taskModal.style.display = "none";

});



window.addEventListener("click", function(event){

    if(event.target === taskModal){

        taskModal.style.display = "none";

    }

});




// ==========================
// CREATE / UPDATE TASK
// ==========================

taskForm.addEventListener("submit", function(event){

    event.preventDefault();


    const taskName = taskInput.value.trim();


    if(taskName === ""){

        errorMessage.textContent = "Please enter a task.";

        return;

    }


    errorMessage.textContent = "";



    // UPDATE EXISTING TASK

    if(editMode){

        const task = tasks.find(function(task){
            return task.id === currentEditId;

        });


        if(task){

            task.title = taskName;
            task.priority = priorityInput.value;

        }

    }



    // CREATE NEW TASK

    else{


        const newTask = {

            id: Date.now(),

            title: taskName,

            priority: priorityInput.value,

            completed:false

        };


        tasks.push(newTask);


    }



    saveTasks();

    renderTasks();


    taskForm.reset();

    taskModal.style.display = "none";


});




// ==========================
// DISPLAY TASKS - instead of manually creating every task, js generates them automatically.
// ==========================

function renderTasks(){

    taskList.innerHTML = "";


    if(tasks.length === 0){

        taskList.innerHTML = `

        <p class="empty-message">

            ✨ No tasks yet

            <br>

            Start organizing your day!

        </p>

        `;


        updateProgress();

        return;

    }



    tasks.forEach(function(task){


        const card = document.createElement("div");


        card.classList.add("task-card");



        if(task.completed){

            card.classList.add("completed");

        }




        card.innerHTML = `


        <div class="task-info">


            <h3>

            ${task.completed ? "✓":"○"}

            ${task.title}

            </h3>



            <span class="priority-badge ${task.priority}">

            ⭐ ${task.priority}

            </span>


        </div>





        <div class="task-actions">


            <button

            class="edit-btn"

            onclick="editTask(${task.id})">

            ✏

            </button>



            <button

            class="complete-btn"

            onclick="toggleTask(${task.id})">

            ${task.completed ? "↩":"✓"}

            </button>




            <button

            class="delete-btn"

            onclick="deleteTask(${task.id})">

            🗑

            </button>


        </div>


        `;


        taskList.appendChild(card);


    });


    updateProgress();


}





// ==========================
// EDIT TASK
// ==========================

function editTask(id){
    const task = tasks.find(function(task){
        return task.id === id;
    });



    if(task){


        editMode = true;

        currentEditId = id;


        modalTitle.textContent = "Edit Task";


        taskInput.value = task.title;


        priorityInput.value = task.priority;


        taskModal.style.display = "flex";


    }


}





// ==========================
// COMPLETE / UNDO TASK
// ==========================

function toggleTask(id){


    const task = tasks.find(function(task){
        return task.id === id;
    });



    if(task){

        task.completed = !task.completed;

    }



    saveTasks();

    renderTasks();


}




// ==========================
// DELETE TASK
// ==========================

function deleteTask(id){


    tasks = tasks.filter(function(task){

        return task.id !== id;

    });



    saveTasks();

    renderTasks();


}




// ==========================
// UPDATE PROGRESS
// ==========================

function updateProgress(){


    taskCount.textContent = tasks.length + " tasks";


    const progressNumber =
    document.querySelector(".progress-number");


    const progressFill =
    document.querySelector(".progress-fill");



    if(tasks.length === 0){

        progressNumber.textContent = "0%";

        progressFill.style.width = "0%";

        return;

    }



    const completedTasks = tasks.filter(function(task){

        return task.completed;

    }).length;



    const percentage = Math.round(

        (completedTasks / tasks.length) * 100

    );



    progressNumber.textContent = percentage + "%";


    progressFill.style.width = percentage + "%";


}





// ==========================
// DELETE ALL TASKS
// ==========================

deleteAllBtn.addEventListener("click", function(){


    if(tasks.length === 0){

        return;

    }



    deleteAllBtn.textContent = "Deleting tasks...";

    deleteAllBtn.disabled = true;



    setTimeout(function(){


        tasks = [];


        saveTasks();


        renderTasks();



        deleteAllBtn.textContent = "🗑 Delete All Tasks";


        deleteAllBtn.disabled = false;



    },2000);



});




// ==========================
// INITIAL LOAD
// ==========================

renderTasks();
