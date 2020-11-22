class CreateTaskService

  def initialize(params)
    @params = params
  end

  def call
    max_priority = Task.where(project_id: @params[:project_id]).order(priority: :desc).limit(1).pluck(:priority).first

    max_priority = max_priority.nil? ? 0 : max_priority + 1

    Task.create!({
                     name:       @params[:name],
                     done:       false,
                     priority:   max_priority,
                     project_id: @params[:project_id]
                 })
  end
end