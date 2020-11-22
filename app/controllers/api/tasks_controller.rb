class Api::TasksController < ActionController::API

  def index
    @tasks = Task.where(project_id: params[:project_id]).order(priority: :asc).to_a
  end

  def create
    @task = CreateTaskService.new(params).call
  end

  def update
    UpdateTaskService.new(params).call
  end

  def destroy
    Task.destroy(params[:id])
  end

end
