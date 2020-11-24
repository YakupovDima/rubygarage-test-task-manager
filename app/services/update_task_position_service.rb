class UpdateTaskPositionService

  def initialize(task_id, new_position)
    @task_id      = task_id
    @new_position = new_position
  end

  def call
    if @new_position < 0
      raise "wrong task position #{@new_position}. can't be less then zero"
    end

    task          = Task.find(@task_id)
    position_task = Task.all.order(priority: :desc).offset(@new_position).limit(1).first

    if position_task.nil?
      raise "wrong task position #{@new_position}"
    end

    if task.id == position_task.id
      return
    end

    if position_task.priority > task.priority # move up
      if @new_position == 0
        new_priority = position_task.priority + 1
      else
        up_task      = Task.all.order(priority: :desc).offset(@new_position - 1).limit(1).first
        new_priority = (up_task.priority + position_task.priority).to_f / 2
      end
    else # move down
      down_task = Task.all.order(priority: :desc).offset(@new_position + 1).limit(1).first
      if down_task.nil?
        new_priority = position_task.priority - 1
      else
        new_priority = (down_task.priority + position_task.priority).to_f / 2
      end
    end

    task.priority = new_priority
    task.save!
  end
end