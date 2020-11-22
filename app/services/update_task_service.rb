class UpdateTaskService

  def initialize(params)
    @params = params
  end

  def call
    update_params = {}

    unless @params[:name].nil?
      update_params[:name] = @params[:name]
    end

    unless @params[:done].nil?
      update_params[:done] = @params[:done]
    end

    if update_params.any?
      Task.update(@params[:id], update_params)
    end
  end
end