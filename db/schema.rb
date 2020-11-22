# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_11_22_205057) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "projects", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "projects1", id: false, force: :cascade do |t|
    t.serial "id", null: false
    t.text "name"
  end

  create_table "tasks", force: :cascade do |t|
    t.text "name"
    t.boolean "done"
    t.float "priority"
    t.bigint "project_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["project_id"], name: "index_tasks_on_project_id"
  end

  create_table "tasks1", id: :serial, force: :cascade do |t|
    t.text "name"
    t.integer "status"
    t.integer "project_id"
    t.index ["id"], name: "tasks1_id_uindex", unique: true
  end

  add_foreign_key "tasks", "projects"
end
