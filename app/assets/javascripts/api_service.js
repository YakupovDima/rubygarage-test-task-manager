class ApiService {
    constructor() {
        this.url = '/api/';
    }

    getRequest(path) {
        return $.get(this.url + path)
    }

    postRequest(path, params) {
        return $.post(this.url + path, params)
    }

    putRequest(path, params) {
        return $.ajax({
            url: this.url + path,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(params)
        })
    }

    deleteRequest(path,) {
        return $.ajax({
            url: this.url + path,
            method: 'DELETE',
        })
    }

    getProjects() {
        return this.getRequest('projects');
    }

    createProject(name) {
        return this.postRequest('projects', {name: name});
    }

    updateProject(id, params) {
        return this.putRequest('projects/' + id, params);
    }

    deleteProject(id) {
        return this.deleteRequest('projects/' + id);
    }

    getTasks(projectId) {
        return this.getRequest(`projects/${projectId}/tasks`);
    }

    createTask(projectId, params) {
        return this.postRequest(`projects/${projectId}/tasks`, params);
    }

    updateTask(projectId, id, params) {
        return this.putRequest(`projects/${projectId}/tasks/${id}`, params);
    }

    deleteTask(projectId, id) {
        return this.deleteRequest(`projects/${projectId}/tasks/${id}`);
    }
}

const apiService = new ApiService();