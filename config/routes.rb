Rails.application.routes.draw do
<<<<<<< Updated upstream
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
=======
  devise_for :users
  root to: 'messages#index' 
  resources :users, only: [:edit, :update]
>>>>>>> Stashed changes
end
