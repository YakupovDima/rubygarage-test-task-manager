class AddDeadlineAtToTasks < ActiveRecord::Migration[5.2]
  def change
    add_column :tasks, :deadline_at, :datetime
  end
end
