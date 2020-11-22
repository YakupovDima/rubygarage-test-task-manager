class Projects {

    constructor() {
        this.projects = [];
        this.projectsContainer = $('#projects');
        this.init()
    }

    init() {
        this.handleCreateButton();
        this.loadProjects();
    }

    loadProjects() {
        apiService.getProjects().done(projects => {
            this.projects = projects;
            this.renderProjects()
        });
    }

    renderProjects() {
        this.projects.forEach((project) => {
            const projectModel = this.createProjectModel(project);
            this.projectsContainer.append(projectModel.getHtml());
        })
    }

    createProject() {
        apiService.createProject('').done((project) => {
            this.projects.push(project);
            const projectModel = this.createProjectModel(project);
            this.projectsContainer.append(projectModel.getHtml());
            projectModel.startEditName();
        })
    }

    createProjectModel(project) {
        return new Project(project, {
            onRemove: (project) => {
                this.onProjectRemoved(project);
            }
        })
    }

    onProjectRemoved(project) {
        this.projects = this.projects.filter((item) => item !== project);
        $('#project-' + project.id).remove();
    }

    handleCreateButton() {
        $('#create-project-btn').on('click', () => this.createProject())
    }

}

class Project {
    constructor(project, options) {
        this.project = project;
        this.options = options || {};
        this.element = null;
        this.tasks = null;

        if (typeof this.options.onRemove === 'function') {
            this.onRemove = this.options.onRemove;
        } else {
            this.onRemove = () => {
            };
        }

        this.createElement();
        this.loadTasks();
    }

    loadTasks() {
        apiService.getTasks(this.project.id)
            .done((tasks) => {
                this.tasks = tasks;
                this.renderTasks()
            })
    }

    renderTasks() {
        const container = $(this.element).find('.tasks');
        const tasksHtml = [];
        this.tasks.forEach((task) => {
            const model = this.createTaskModel(task);
            tasksHtml.push(model.getHtml());
        })
        container.append(...tasksHtml);
    }

    cancelEditName() {
        this.finishEditName();
    }

    submitEditName() {
        const newName = $(this.element).find('.project-title-edit-input').val().trim();
        if (newName !== this.project.name) {
            this.project.name = newName;
            $(this.element).find('.project-title').text(newName);
            apiService.updateProject(this.project.id, {name: newName})
                .fail(() => console.error('не удалось обновить имя'));
        }

        this.finishEditName();
    }

    finishEditName() {
        $(this.element).find('.project-title-container').removeClass('editing');
        $(this.element).find('.project-title-edit-container').addClass('hide');
        $(this.element).find('.project-title').removeClass('hide');
        $(this.element).find('.project-title-controls').removeClass('hide');
    }

    startEditName() {
        $(this.element).find('.project-title-container').addClass('editing');
        $(this.element).find('.project-title-edit-container').removeClass('hide');
        $(this.element).find('.project-title').addClass('hide');
        $(this.element).find('.project-title-controls').addClass('hide');
        $(this.element).find('.project-title-edit-container input').val(this.project.name).focus();
    }

    remove() {
        const answer = confirm("Вы хотите удалить список задач " + this.project.name + "?")
        if (answer === true) {
            apiService.deleteProject(this.project.id)
                .done(() => this.onRemove(this.project))
                .fail(() => console.error('не удалось удалить проект'))
        }
    }

    createTaskModel(task) {
        return new Task(this.project, task, {
            onRemove: (task) => this.onTaskRemoved(task)
        });
    }

    onTaskRemoved(task) {
        this.tasks = this.tasks.filter((item) => item !== task);
        $('#task-' + task.id).remove();
    }

    onCreateTaskClicked() {
        const input = $(this.element).find('.add-task-input');
        const name = input.val().trim();
        input.val('')
        if (!name) {
            // TODO show error toast
            return
        }

        apiService.createTask(this.project.id, {name: name})
            .done((task) => {
                this.tasks.push(task);
                let model = this.createTaskModel(task);
                $(this.element).find('.tasks').append(model.getHtml());
            })
    }

    createElement() {
        this.element = $.parseHTML(`
       <div id="project-${this.project.id}" class="project">
            <div class="project-header">
                <div class="project-title-container">
                    <i class="fa fa-calendar project-header-icon"></i>
                    <h2 class="project-title">${this.project.name}</h2>
                    <div class="project-title-edit-container hide">
                        <input type="text" class="project-title-edit-input" value="">
                        <button type="button" class="btn project-title-edit-submit"><i class="fa fa-check"></i></button>
                    </div>
                </div>
                <div class="project-title-controls">
                    <i class="fa fa-pencil project-title-control-icon js-project-title-edit-button"></i>
                    <div class="icon-separator"></div>
                    <i class="fa fa-trash project-title-control-icon js-project-remove-button"></i>
                </div>
            </div>

            <div class="add-task-container">
                <i class="fa fa-plus add-task-icon"></i>
                <div class="add-task-input-container">
                    <input type="text" class="add-task-input"
                           placeholder="Start typing here to create a task...">
                    <button class="btn add-task-btn" type="button">Add task</button>
                </div>
            </div>

            <div class="tasks"></div>
        </div>
       `);

        $(this.element).find('.js-project-remove-button').on('click', () => this.remove());
        $(this.element).find('.js-project-title-edit-button').on('click', () => this.startEditName());
        $(this.element).find('.project-title-edit-submit').on('click', () => this.submitEditName());
        $(this.element).find('.add-task-btn').on('click', () => this.onCreateTaskClicked());
        $(this.element).find('.project-title-edit-input').on('keydown', (e) => {
            if (e.keyCode === 13) {
                this.submitEditName();
                return false;
            } else if (e.keyCode === 27) {
                this.cancelEditName();
                return false;
            }
        });
    }

    getHtml() {
        return this.element;
    }
}

class Task {
    constructor(project, task, options) {
        this.project = project;
        this.task = task;
        this.options = options || {};

        if (typeof this.options.onRemove === 'function') {
            this.onRemove = this.options.onRemove;
        } else {
            this.onRemove = () => {
            };
        }

        this.element = null;
        this.createElement();
    }

    onDoneChanged() {
        const done = $(this.element).find('.task-checkbox').is(':checked');
        apiService.updateTask(this.project.id, this.task.id, {done: done})
    }

    onRemoveClicked() {
        apiService.deleteTask(this.project.id, this.task.id)
            .done(() => this.onRemove(this.task));
    }

    createElement() {
        this.element = $.parseHTML(`
        <div id="task-${this.task.id}" class="task">
            <div class="task-title-container">
                <input id="task-done-${this.task.id}" type="checkbox" class="task-checkbox" ${this.task.done ? 'checked' : ''}>
                <div class="task-checkbox-separator"></div>
                <label for="task-done-${this.task.id}" class="task-title">${this.task.name}</label>
            </div>
            <div class="task-controls">
                <div class="task-controls-arrows">
                    <span class="task-change-position-icon fa fa-caret-up"></span>
                    <span class="task-change-position-separator"></span>
                    <span class="task-change-position-icon fa fa-caret-down"></span>
                </div>
                <div class="task-controls-separator"></div>
                <i class="fa fa-pencil task-control-icon"></i>
                <div class="task-controls-separator"></div>
                <i class="fa fa-trash task-control-icon js-task-delete-btn"></i>
            </div>
        </div>`);

        $(this.element).find('.task-checkbox').on('change', () => this.onDoneChanged())
        $(this.element).find('.js-task-delete-btn').on('click', () => this.onRemoveClicked())
    }

    getHtml() {
        return this.element;
    }
}

$(function () {
    new Projects();
});


