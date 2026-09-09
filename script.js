// ELEMENTS

const addTaskBtn =
document.getElementById("addTaskBtn");

const taskModal =
document.getElementById("taskModal");

const closeModal =
document.getElementById("closeModal");

const taskForm =
document.getElementById("taskForm");

const taskInput =
document.getElementById("taskInput");

const priorityInput =
document.getElementById("priorityInput");

const taskList =
document.getElementById("taskList");

const errorMessage =
document.getElementById("errorMessage");

const deleteAllBtn =
document.getElementById("deleteAllBtn");

const taskCount =
document.getElementById("taskCount");

// STATE
let tasks =
JSON.parse(localStorage.getItem("tasks")) || [];


// STORAGE
function saveTasks(){
localStorage.setItem(
"tasks",
JSON.stringify(tasks)
);
}

// OPEN MODAL

addTaskBtn.onclick=function(){
taskModal.style.display="flex";
};


// CLOSE MODAL

closeModal.onclick=function(){
taskModal.style.display="none";
};


window.onclick=function(event){
if(event.target === taskModal){
taskModal.style.display="none";
}
};

// CREATE TASK


taskForm.addEventListener("submit",function(event){

event.preventDefault();

let taskName =
taskInput.value.trim();

if(taskName===""){

errorMessage.textContent =
"Please enter a task.";

return;
}

errorMessage.textContent="";


let newTask={
id:Date.now(),
title:taskName,
priority:priorityInput.value,
completed:false
};


tasks.push(newTask);
saveTasks();
renderTasks();
taskForm.reset();
taskModal.style.display="none";
});


// DISPLAY TASKS


function renderTasks(){

taskList.innerHTML="";



if(tasks.length===0){

taskList.innerHTML=`

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

let card=document.createElement("div");
card.className="task-card";

if(task.completed){
card.classList.add("completed");
}


card.innerHTML=`
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

<button class="complete-btn"
onclick="toggleTask(${task.id})">
${task.completed?"↩":"✓"}
</button>

<button class="delete-btn"
onclick="deleteTask(${task.id})">
🗑
</button>
</div>
`;

taskList.appendChild(card);
});

updateProgress();
}


// COMPLETE
function toggleTask(id){
let task =
tasks.find(t=>t.id===id);

if(task){
task.completed =
!task.completed;
}

saveTasks();
renderTasks();
}


// DELETE

function deleteTask(id){
tasks =
tasks.filter(t=>t.id!==id);
saveTasks();
renderTasks();
}

// PROGRESS
function updateProgress(){
taskCount.textContent =
tasks.length+" tasks";

let progress =
document.querySelector(".progress-number");
let bar =
document.querySelector(".progress-fill");


if(tasks.length===0){
progress.textContent="0%";
bar.style.width="0%";
return;
}

let completed =
tasks.filter(t=>t.completed).length;

let percent =
Math.round(
(completed/tasks.length)*100
);

progress.textContent =
percent+"%";
bar.style.width =
percent+"%";
}

// DELETE ALL


deleteAllBtn.onclick=function(){
if(tasks.length===0)return;

deleteAllBtn.textContent =
"Deleting tasks...";

deleteAllBtn.disabled=true;
setTimeout(function(){
tasks=[];
saveTasks();
renderTasks();

deleteAllBtn.textContent =
"🗑 Delete All Tasks";
deleteAllBtn.disabled=false;
},2000);        //2000ms delay to simulate deletion process
    
};




// INITIAL LOAD

renderTasks();