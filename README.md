# Chat-space README
# 概要
TECH::EXPERT短期集中コースの後半戦（応用カリキュラム）で作成した、  
グループ毎にチャットするデモWebアプリケーション。ユーザーはまず自らグループを作成し、  
そこへ既存のユーザーを検索して呼び込み（削除も可能）、グループ内でチャットするという仕組み。  
デモサイトを参考に、マークアップからサーバサイド実装、デプロイまでの作業を全て行った。  
マークアップについては、下記の指示書のみが与えられた。サーバサイドについては、  
JSを使用してインクリメンタルサーチと  メッセージ欄の自動更新を実装。  
pictweet等を用いた簡易的な実装カリキュラムを参考に、ここも基本的に自力での実装が  
求められた。最後にAWSのEC2インスタンスへの手動デプロイと、Capistranoを用いた  
自動デプロイを行った。デプロイに関する教材内容は比較的詳しかったが、多くの場合、  
デプロイ後のエラーが続出。期限との闘いに敗れ去る人たちが少なくなかったが、  
一連の開発の流れを理解し、また期限内に自分で調べながら開発を行うことの厳しさを思い知った  
非常にためになるカリキュラムだった。  

# DB設計
## usersテーブル
|Column|Type|Options|
|------|----|-------|
|email|string|null: false|
|password|string|null: false|
|username|string|null: false|
### Association
- has_many :messages
- has_many :groups through groups_users

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
※グループ毎にチャットする仕組みのため、ユーザーとグループとの間に  
多対多の関係が存在する。このため上記のように中間テーブルを  
作成した。

# バージョン情報
Rails 5.0.7.2
Ruby 2.5.1



