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

    unless @params[:deadline_at].nil?
      update_params[:deadline_at] = @params[:deadline_at]
    end

    if update_params.any? && !@params[:position].nil?
      raise "position can't be update with any other param"
    end

    if update_params.any?
      Task.update(@params[:id], update_params)
    elsif !@params[:position].nil?
      UpdateTaskPositionService.new(@params[:id], @params[:position]).call
    end
  end
end