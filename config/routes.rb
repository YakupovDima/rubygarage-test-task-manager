Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  root 'home#index'

  namespace :api do
    resources :projects, only: [:index, :create, :update, :destroy] do
      resources :tasks, only: [:index, :create, :update, :destroy]
    end
  end
end
