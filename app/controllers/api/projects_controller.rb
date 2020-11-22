class Api::ProjectsController < ActionController::API

  def index
    @projects = Project.all.order(id: :asc).to_a
  end

  def create
    @project = Project.create(name: params[:name])
  end

  def update
    project      = Project.where(id: params[:id]).first
    project.name = params[:name]
    project.save!
  end

  def destroy
    Project.destroy(params[:id])
  end

end
