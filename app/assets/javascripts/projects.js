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
        container.empty();
        this.tasks.forEach((task) => {
            const model = this.createTaskModel(task);
            container.append(model.getHtml());
        })
    }

    cancelEditName() {
        this.finishEditName();
    }

    submitEditName() {
        const newName = $(this.element).find('.js-project-title-edit-input').val().trim();
        if (newName !== this.project.name) {
            this.project.name = newName;
            $(this.element).find('.project-title').text(newName);
            apiService.updateProject(this.project.id, {name: newName})
                .fail(() => console.error('не удалось обновить имя'));
        }

        this.finishEditName();
    }

    finishEditName() {
        $(this.element).find('.js-project-title-container').removeClass('editing');
        $(this.element).find('.js-project-title-edit-container').addClass('hide');
        $(this.element).find('.project-title').removeClass('hide');
        $(this.element).find('.project-title-controls').removeClass('hide');
    }

    startEditName() {
        $(this.element).find('.js-project-title-container').addClass('editing');
        $(this.element).find('.js-project-title-edit-container').removeClass('hide');
        $(this.element).find('.project-title').addClass('hide');
        $(this.element).find('.project-title-controls').addClass('hide');
        $(this.element).find('.js-project-title-edit-container input').val(this.project.name).focus();
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
            onRemove: (task) => this.onTaskRemoved(task),
            onPositionUp: (task) => this.onTaskPositionUp(task),
            onPositionDown: (task) => this.onTaskPositionDown(task),
        });
    }

    onTaskRemoved(task) {
        this.tasks = this.tasks.filter((item) => item !== task);
        $('#task-' + task.id).remove();
    }

    onTaskPositionUp(task) {
        const currentIndex = this.tasks.indexOf(task);
        if (currentIndex === 0) {
            return
        }
        apiService.updateTask(this.project.id, task.id, {
            position: currentIndex - 1
        }).done(() => {
            this.tasks[currentIndex] = this.tasks[currentIndex - 1];
            this.tasks[currentIndex - 1] = task;
            this.renderTasks();
        }).fail(() => {
            console.error('не удалось изменить позицию')
        })
    }

    onTaskPositionDown(task) {
        const currentIndex = this.tasks.indexOf(task);
        if (currentIndex === this.tasks.length - 1) {
            return
        }
        apiService.updateTask(this.project.id, task.id, {
            position: currentIndex + 1
        }).done(() => {
            this.tasks[currentIndex] = this.tasks[currentIndex + 1];
            this.tasks[currentIndex + 1] = task;
            this.renderTasks();
        }).fail(() => {
            console.error('не удалось изменить позицию')
        })
    }

    submitCreateTask() {
        const input = $(this.element).find('.add-task-input');
        const name = input.val().trim();
        input.val('')
        if (!name) {
            // TODO show error toast
            return
        }

        apiService.createTask(this.project.id, {name: name})
            .done((task) => {
                this.tasks.unshift(task);
                let model = this.createTaskModel(task);
                $(this.element).find('.tasks').prepend(model.getHtml());
            })
    }

    cancelEnterTaskName() {
        $(this.element).find('.add-task-input').val('')
    }

    createElement() {
        this.element = $.parseHTML(`
       <div id="project-${this.project.id}" class="project">
            <div class="project-header">
                <div class="project-title-container">
                    <i class="fa fa-calendar project-header-icon"></i>
                    <h2 class="project-title">${this.project.name}</h2>
                    <div class="title-edit-container hide js-project-title-edit-container">
                        <input type="text" class="title-edit-input js-project-title-edit-input" value="">
                        <button type="button" class="btn title-edit-submit js-project-title-edit-submit"><i class="fa fa-check"></i></button>
                    </div>
                </div>
                <div class="project-title-controls">
                    <i class="fa fa-pencil project-title-control-icon js-project-title-edit-btn"></i>
                    <div class="icon-separator"></div>
                    <i class="fa fa-trash project-title-control-icon js-project-remove-btn"></i>
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
        </div>`);

        $(this.element).find('.js-project-remove-btn').on('click', () => this.remove());
        $(this.element).find('.project-title').on('click', () => this.startEditName());
        $(this.element).find('.js-project-title-edit-btn').on('click', () => this.startEditName());
        $(this.element).find('.js-project-title-edit-submit').on('click', () => this.submitEditName());
        $(this.element).find('.add-task-btn').on('click', () => this.submitCreateTask());
        $(this.element).find('.js-project-title-edit-input').on('keydown', (e) => {
            if (e.keyCode === 13) {
                this.submitEditName();
                return false;
            } else if (e.keyCode === 27) {
                this.cancelEditName();
                return false;
            }
        });
        $(this.element).find('.add-task-input').on('keydown', (e) => {
            if (e.keyCode === 13) {
                this.submitCreateTask();
                return false;
            } else if (e.keyCode === 27) {
                this.cancelEnterTaskName();
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

        if (typeof this.options.onPositionUp === 'function') {
            this.onPositionUp = this.options.onPositionUp;
        } else {
            this.onPositionUp = () => {
            };
        }

        if (typeof this.options.onPositionDown === 'function') {
            this.onPositionDown = this.options.onPositionDown;
        } else {
            this.onPositionDown = () => {
            };
        }

        this.element = null;
        this.createElement();
    }

    onDoneChanged() {
        const done = $(this.element).find('.task-checkbox').is(':checked');
        this.task.done = done;
        apiService.updateTask(this.project.id, this.task.id, {
            done: done
        })
    }

    onDeadlineChanged(newDate) {
        this.task.deadline_at = newDate;
        apiService.updateTask(this.project.id, this.task.id, {
            deadline_at: newDate
        })
    }

    onRemoveClicked() {
        apiService.deleteTask(this.project.id, this.task.id)
            .done(() => this.onRemove(this.task));
    }

    onPositionUpClicked() {
        this.onPositionUp(this.task);
    }

    onPositionDownClicked() {
        this.onPositionDown(this.task);
    }

    startEditName() {
        $(this.element).find('.js-task-title-datetimepicker-container').addClass('hide');
        $(this.element).find('.task-controls').addClass('invisible');
        $(this.element).find('.js-task-title-edit-container').removeClass('hide');
        $(this.element).find('.js-task-title-edit-container input').val(this.task.name).focus();
    }

    submitEditName() {
        const newName = $(this.element).find('.js-task-title-edit-input').val().trim();
        if (newName !== this.task.name) {
            this.task.name = newName;
            $(this.element).find('.task-title').text(newName);
            apiService.updateTask(this.project.id, this.task.id, {name: newName})
                .fail(() => console.error('не удалось обновить название задачи'));
        }

        this.finishEditName();
    }

    finishEditName() {
        $(this.element).find('.js-task-title-edit-container').addClass('hide');
        $(this.element).find('.js-task-title-datetimepicker-container').removeClass('hide');
        $(this.element).find('.task-controls').removeClass('invisible');
    }

    cancelEditName() {
        this.finishEditName();
    }

    createElement() {
        this.element = $.parseHTML(`
        <div id="task-${this.task.id}" class="task">
            <div class="task-title-container">
                <input id="task-done-${this.task.id}" type="checkbox" class="task-checkbox" ${this.task.done ? 'checked' : ''}>
                <div class="task-checkbox-separator"></div>
                <div class="task-title-datetimepicker-container js-task-title-datetimepicker-container">
                    <label for="task-done-${this.task.id}" class="task-title">${this.task.name}</label>
                    <input class="task-deadline-datetimepicker js-task-deadline-datetimepicker" placeholder="click to add a deadline" />
                </div>
                <div class="title-edit-container task-title-edit-container hide js-task-title-edit-container">
                    <input type="text" class="title-edit-input task-title-edit-input js-task-title-edit-input" value="">
                    <button type="button" class="btn title-edit-submit js-task-title-edit-submit"><i class="fa fa-check"></i></button>
                </div>
            </div>
            <div class="task-controls">
                <div class="task-controls-arrows">
                    <span class="task-change-position-icon fa fa-caret-up js-task-position-up-btn"></span>
                    <span class="task-change-position-separator"></span>
                    <span class="task-change-position-icon fa fa-caret-down js-task-position-down-btn"></span>
                </div>
                <div class="task-controls-separator"></div>
                <i class="fa fa-pencil task-control-icon js-task-title-edit-btn"></i>
                <div class="task-controls-separator"></div>
                <i class="fa fa-trash task-control-icon js-task-delete-btn"></i>
            </div>
        </div>`);

        $(this.element).find('.task-checkbox').on('change', () => this.onDoneChanged())
        $(this.element).find('.js-task-delete-btn').on('click', () => this.onRemoveClicked())
        $(this.element).find('.js-task-title-edit-btn').on('click', () => this.startEditName());
        $(this.element).find('.js-task-title-edit-submit').on('click', () => this.submitEditName());
        $(this.element).find('.js-task-title-edit-input').on('keydown', (e) => {
            if (e.keyCode === 13) {
                this.submitEditName();
                return false;
            } else if (e.keyCode === 27) {
                this.cancelEditName();
                return false;
            }
        });
        $(this.element).find('.js-task-position-up-btn').on('click', () => this.onPositionUpClicked());
        $(this.element).find('.js-task-position-down-btn').on('click', () => this.onPositionDownClicked());
        $(this.element).find('.js-task-deadline-datetimepicker').datetimepicker({
            date: this.task.deadline_at
        }).on('dp.change', (data) => this.onDeadlineChanged(data.date))
    }

    getHtml() {
        return this.element;
    }
}

$(function () {
    new Projects();
});


