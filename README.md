# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

## messagesテーブル
|Column|Type|Options|
|------|----|-------|
|text|text|null: false|
|image|image|
|user_id|integer|null: false, foreign_key: true|
### Association
- belongs_to :user


## groupsテーブル
|Column|Type|Options|
|------|----|-------|
|text|text|null: false|

### Association
- has_many :users through:  :groups_users

## groups_usersテーブル
|Column|Type|Options|
|------|----|-------|
|groups_id|integer|null: false, foreign_key: true|
|users_id|integer|null: false, foreign_key: true|
- belongs_to user
- belongs_to group


