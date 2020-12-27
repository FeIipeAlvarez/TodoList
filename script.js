const d = document;
const taskForm = d.getElementById("taskForm");
let task;

class Task {

    id;
    name;
    color;
    registrationDate;
    deadLine;
    status;
    dateDifference;

    constructor(id, name, color, registrationDate, deadLine, status) {
        this.id = id || this.generateTaskId();
        this.color = color;
        this.name = name;
        this.registrationDate = registrationDate;
        this.deadLine = deadLine;
        this.status = status;
        this.dateDifference = this.generateDateDifference(deadLine);
    }

    generateDateDifference(deadLine) {

        const difference = deadLine - new Date().getTime();
        const days = difference <= 0 ? '00' : (
            "0" + Math.floor(difference / (1000 * 60 * 60 * 24))
        ).slice(-2);

        const hours = difference <= 0 ? '00' : (
            "0" + Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        ).slice(-2);

        const minutes = difference <= 0 ? '00' : (
            "0" + Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        ).slice(-2);

        const seconds = difference <= 0 ? '00' : (
            "0" + Math.floor((difference % (1000 * 60)) / (1000)
            )).slice(-2);


        return {
            days: days,
            hours: hours,
            minutes: minutes,
            seconds: seconds
        };
    }

    generateTaskId() {
        const now = new Date();
        return `${now.getDate()}` + now.getMonth() + now.getFullYear() + now.getHours() + now.getMinutes() + now.getSeconds();
    }

    createTaskDom(typeTask = 1) {
        const completerTask = typeTask === 1 ?
            `<div class = "todoList__button">
            <img src="img/check2.svg" class = "button__img button__img--complete" >
        </div>` : '';


        // completerTask =
        //  `<div class = "todoList__button">
        //     <img src="img/check2.svg" class = "button__img button__img--complete" >
        // </div>  `;

        return `
        <li class="todoList__item" id="${this.id}" style="background-color: ${this.color};">
            <span class="todoList__description">${this.name}</span>
            <div class="timer">
                <span class="timer__element">
                    <span class="timer__number">${this.dateDifference.days}</span>
                    <span class="timer__word">D</span>
                </span><span class="timer__element">
                    <span class="timer__number">${this.dateDifference.hours}</span>
                    <span class="timer__word">H</span>
                </span>
                <span class="timer__element">
                    <span class="timer__number">${this.dateDifference.minutes}</span>
                    <span class="timer__word">M</span></span>
                <span class="timer__element">
                    <span class="timer__number">${this.dateDifference.seconds}</span>
                    <span class="timer__word">S</span>
                </span>
            </div>
            <div class="todoList__buttons">
                <div class = "todoList__button">
                    <img src="img/delete2.svg" class = "button__img button__img--delete" >
                </div>
                ${completerTask}
            </div>
            <input class="dateHidden" type="hidden" value="${this.deadLine}">
        </li>`;
    }

    addTaskLocalStorage() {
        localStorage.setItem(this.id,
            JSON.stringify(
                { id: this.id, name: this.name, color: this.color, registrationDate: this.registrationDate, deadLine: this.deadLine, status: this.status }
            ));
    }



    updaterDateLimit() {
        let removed = false;
        const tasks = Array.from(d.getElementById("todoList").children);

        const taskFound = tasks.find(task => task.id == this.id);

        if (tasks.length > 0 && taskFound) {
            const deadLine = taskFound.lastElementChild.value;


            setInterval(() => {
                const date_difference = this.generateDateDifference(deadLine);

                const timer = taskFound.children[1];

                timer.children[0].firstElementChild.textContent = date_difference.days;
                timer.children[1].firstElementChild.textContent = date_difference.hours;
                timer.children[2].firstElementChild.textContent = date_difference.minutes;
                timer.children[3].firstElementChild.textContent = date_difference.seconds;

                if (date_difference.days == '00' &&
                    date_difference.hours == '00' &&
                    date_difference.minutes == '00' &&
                    date_difference.seconds == '00') {

                    if (removed === false) {

                        this.updateStatus(taskFound.id, 0);
                        taskFound.remove();
                        removed = true;
                    }

                }

            }, 1000);

        }
    }


    updateStatus(taskId, status) {

        const tasks = Array.from(d.getElementById("todoList").children);
        // const taskSelected = tasks.find(task => task.id == taskId);
        const taskSelected = JSON.parse(localStorage.getItem(taskId));

        taskSelected.status = status;

        const updatedTask = JSON.stringify(taskSelected);

        localStorage.setItem(taskId, updatedTask);
    }

    completeTask(taskId) {
        const tasks = Array.from(d.getElementById("todoList").children);
        const taskSelected = tasks.find(task => task.id == taskId);

        this.updateStatus(taskId, 2);

        taskSelected.remove();

        d.getElementById('todoListCompleted').appendChild(taskSelected);

    }

    deleteTask(taskId) {
        const completedTasksList = Array.from(d.getElementById("todoListCompleted").children);
        const currentTasksList = Array.from(d.getElementById("todoList").children);
        const expiredTasksList = Array.from(d.getElementById("todoListExpired").children);
        const tasks = completedTasksList.concat(currentTasksList).concat(expiredTasksList);

        const taskSelected = tasks.find(task => task.id == taskId);

        taskSelected.remove();

        localStorage.removeItem(taskId);
    }

}

d.addEventListener("DOMContentLoaded", () => {
    minDate();
    listTasksSaved();
    showMessageEmpty();
    if (!existsTasks()) {
        showHideLists(3);
        d.getElementById("todoList").style.display = '';

    } else {
        showHideLists(1);
        d.getElementById("todoList").style.display = 'none';
    }
    styleSelectedFilterOption();

});

d.getElementById("taskFilter").addEventListener('click', e => {

    listTasksSaved();
    // e.target.classList.add('taskFiler__option--active');
    styleSelectedFilterOption(e.target);
    switch (e.target.textContent) {
        case 'Completed':
            showHideLists(0);
            break;
        case 'Current':
            showHideLists(1);
            break;
        case 'Expired':
            showHideLists(2);
            break;
        default:
            break;
    }
});


taskForm.addEventListener('submit', e => {
    e.preventDefault();
    const taskData = new FormData(e.currentTarget);
    if (validateForm(taskData)) {

        task = new Task(null, taskData.get('taskName'), taskData.get('colorTask'), new Date().getTime(), new Date(taskData.get('dateLimit')).getTime(), 1);
        d.getElementById("todoList").insertAdjacentHTML('afterbegin', task.createTaskDom());
        showMessageEmpty();
        showHideLists(1);
        styleSelectedFilterOption();
        task.addTaskLocalStorage();
        task.updaterDateLimit();

        e.currentTarget.reset();

    } else {
        alert("All fields are requeried. The selected date must be greater than today");
    }

});



d.getElementById("divTodoList").addEventListener('click', e => {

    const taskIdDelete = e.target.parentElement.parentElement.parentElement.id;

    if (e.target.classList.contains('button__img--delete')) {//If click on removeButton.
        task.deleteTask(taskIdDelete);
        showMessageEmpty();
    } else if (e.target.classList.contains('button__img--complete')) {
        task.completeTask(taskIdDelete);
        showMessageEmpty();

    }
});


const validateForm = formData => {
    const deadline = new Date(formData.get("dateLimit")).getTime();
    for (const value of formData.values()) {
        if (value == "") {
            return false;
        }
    }

    if (deadline <= new Date().getTime()) {
        return false;
    }

    return true;
};

const styleSelectedFilterOption = (selected = d.getElementById("taskFilter").children[1]) => {
    for (const option of d.getElementById("taskFilter").children) {
        option.classList.remove('taskFiler__option--active');
    }
    selected.classList.add('taskFiler__option--active');
};

const showHideLists = option => {

    const completedTasksList = d.getElementById("todoListCompleted");
    const currentTasksList = d.getElementById("todoList");
    const expiredTasksList = d.getElementById("todoListExpired");

    switch (option) {
        case 0:
            completedTasksList.style.display = '';
            currentTasksList.style.display = 'none';
            expiredTasksList.style.display = 'none';
            break;
        case 1:
            completedTasksList.style.display = 'none';
            currentTasksList.style.display = '';
            expiredTasksList.style.display = 'none';
            break;
        case 2:
            completedTasksList.style.display = 'none';
            currentTasksList.style.display = 'none';
            expiredTasksList.style.display = '';
            break;
        case 3:
            completedTasksList.style.display = 'none';
            currentTasksList.style.display = 'none';
            expiredTasksList.style.display = 'none';
            break;

        default:
            break;
    }
};

const minDate = () => {
    const $dateLimit = d.getElementById("dateLimit");
    const now = nowInArray();
    const min = `${now[2]}-${now[1]}-${now[0]}T00:00`;
    $dateLimit.setAttribute("min", min);
};


const nowInArray = () => {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getUTCFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return [day, month, year, hours, minutes, seconds];
};

const listTasksSaved = () => {
    const completedTasksList = d.getElementById("todoListCompleted");
    const expiredTasksList = d.getElementById("todoListExpired");
    const currentTasksList = d.getElementById("todoList");

    completedTasksList.innerHTML = '';
    expiredTasksList.innerHTML = '';
    currentTasksList.innerHTML = '';


    for (const key of Object.keys(localStorage)) {
        const localStorageTask = JSON.parse(localStorage.getItem(key));

        task = new Task(
            localStorageTask.id,
            localStorageTask.name,
            localStorageTask.color,
            localStorageTask.registrationDate,
            localStorageTask.deadLine, localStorageTask.status
        );

        switch (task.status) {
            case 0:
                expiredTasksList.insertAdjacentHTML('afterbegin', task.createTaskDom('expired'));
                break;
            case 1:
                currentTasksList.insertAdjacentHTML('afterbegin', task.createTaskDom());
                break;
            case 2:
                completedTasksList.insertAdjacentHTML('afterbegin', task.createTaskDom('complete'));
                break;
            default:
                break;
        }

        task.updaterDateLimit();
    }
};

const showMessageEmpty = () => {
    const completedTasksList = d.getElementById("todoListCompleted");
    const expiredTasksList = d.getElementById("todoListExpired");
    const currentTasksList = d.getElementById("todoList");
    const message = d.getElementById("messageNoTasks");
    const filter = d.getElementById("taskFilter");
    if (existsTasks()) {
        completedTasksList.style.display = "none";
        expiredTasksList.style.display = "none";
        currentTasksList.style.display = "none";
        message.style.display = "";
        filter.style.display = 'none';
    } else {
        message.style.display = 'none';
        filter.style.display = '';

    }
};

const existsTasks = () => {
    return Array.from(d.getElementById("todoList").children).length <= 0 && Array.from(d.getElementById("todoListExpired").children).length <= 0 && Array.from(d.getElementById("todoListCompleted").children).length <= 0;
};

