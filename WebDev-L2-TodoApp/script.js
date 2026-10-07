document.addEventListener('DOMContentLoaded', () => {
    // State
    let tasks = JSON.parse(localStorage.getItem('todo_tasks')) || [];

    // DOM Elements
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const pendingList = document.getElementById('pending-list');
    const completedList = document.getElementById('completed-list');
    const pendingCount = document.getElementById('pending-count');
    const completedCount = document.getElementById('completed-count');
    const pendingEmpty = document.getElementById('pending-empty');
    const completedEmpty = document.getElementById('completed-empty');

    // Init
    renderTasks();

    // Event Listeners
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    // handle clicks on tasks
    document.querySelector('main').addEventListener('click', (e) => {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        
        if (!taskItem) return;

        const id = taskItem.dataset.id;

        // Toggle Status
        if (target.classList.contains('checkbox')) {
            toggleTaskStatus(id);
        }
        
        // Delete Task
        if (target.closest('.btn-delete')) {
            deleteTask(id);
        }
        
        // Edit Task
        if (target.closest('.btn-edit')) {
            enableEditMode(id, taskItem);
        }

        // Save Edit
        if (target.closest('.btn-save')) {
            saveEdit(id, taskItem);
        }
    });

    function saveTasksToStorage() {
        localStorage.setItem('todo_tasks', JSON.stringify(tasks));
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        const newTask = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            timestamp: new Date().toLocaleString()
        };

        tasks.push(newTask);
        saveTasksToStorage();
        taskInput.value = '';
        renderTasks();
    }

    function toggleTaskStatus(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasksToStorage();
        renderTasks();
    }

    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasksToStorage();
        renderTasks();
    }

    function enableEditMode(id, taskElement) {
        const task = tasks.find(t => t.id === id);
        const taskTextSpan = taskElement.querySelector('.task-text');
        const actionsDiv = taskElement.querySelector('.actions');
        
        // Replace text with input
        const input = document.createElement('input');
        input.type = 'text';
        input.value = task.text;
        input.className = 'task-text-input';
        
        taskTextSpan.replaceWith(input);
        input.focus();

        // Change Edit button to Save button
        actionsDiv.innerHTML = `
            <button class="btn-icon btn-save" title="Save">
                <i class="fas fa-check"></i>
            </button>
            <button class="btn-icon btn-delete" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        `;

        // Handle Enter key for save
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit(id, taskElement);
        });
    }

    function saveEdit(id, taskElement) {
        const input = taskElement.querySelector('.task-text-input');
        if (!input) return;

        const newText = input.value.trim();
        if (newText === '') {
            deleteTask(id);
            return;
        }

        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, text: newText };
            }
            return task;
        });
        
        saveTasksToStorage();
        renderTasks();
    }

    function renderTasks() {
        // Clear lists
        pendingList.innerHTML = '';
        completedList.innerHTML = '';

        let pCount = 0;
        let cCount = 0;

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.dataset.id = task.id;

            li.innerHTML = `
                <div class="task-content">
                    <input type="checkbox" class="checkbox" ${task.completed ? 'checked' : ''}>
                    <div class="task-text-wrapper">
                        <span class="task-text ${task.completed ? 'completed' : ''}">${escapeHTML(task.text)}</span>
                        <span class="task-time" style="font-size: 0.75rem; color: #718096; display: block;">Added: ${task.timestamp || 'Unknown'}</span>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn-icon btn-edit" title="Edit" ${task.completed ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            if (task.completed) {
                completedList.appendChild(li);
                cCount++;
            } else {
                pendingList.appendChild(li);
                pCount++;
            }
        });

        // Update Counters
        pendingCount.textContent = pCount;
        completedCount.textContent = cCount;

        // Toggle Empty States
        pendingEmpty.classList.toggle('active', pCount === 0);
        completedEmpty.classList.toggle('active', cCount === 0);
    }

    // prevent html tags in input
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
});
