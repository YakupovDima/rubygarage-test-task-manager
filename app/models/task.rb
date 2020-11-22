class Task < ApplicationRecord
  belongs_to :project

  validates :name, presence: true
  validates :priority, presence: true
  validates :done, inclusion: [true, false]
end
