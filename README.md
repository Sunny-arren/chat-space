# Chat-space README
# 概要
TECH::EXPERT短期集中コースの後半戦（応用カリキュラム）で作成した、  
グループ毎にチャットするデモWebアプリケーション。ユーザーはまず自らグループを作成し、  
そこへ既存のユーザーを検索して呼び込み（削除も可能）、グループ内でチャットするという仕組み。  
デモサイトを参考に、マークアップからサーバサイド実装、デプロイまでの作業を全て行った。  
マークアップについては、下記の指示書のみが与えられた。　

<img width="735" alt="Chat-space_指示書" src="https://user-images.githubusercontent.com/56028886/71344674-8edf0200-25a6-11ea-985e-188ce4b52644.png">

サーバサイドについては、JSを使用してインクリメンタルサーチとメッセージ欄の自動更新を実装。  
pictweet等を用いた簡易的な実装カリキュラムを参考に、ここも基本的に自力での実装が求められた。  
求められている規模のJSのコードを自走するのは当時は困難を極めたため、Qiitaの情報や  
プログラミングの得意な同期の意見を参考にし、何とか期限内に仕上げた。  　　
  
最後にAWSのEC2インスタンスへの手動デプロイと、Capistranoを用いた  
自動デプロイを行った。デプロイに関する教材内容は比較的詳しかったが、多くの場合、  
デプロイ後のエラーが続出。期限との闘いに敗れ去る人たちが少なくなかったが、  
一連の開発の流れを理解し、また期限内に自分で調べながら開発を行うことの厳しさを思い知った  
非常にためになるカリキュラムだった。  
  
本READMEの、DB設計を除く部分は、全カリキュラム終了後に自身の復習を兼ねて  
作成したものである。時間に追われていたカリキュラム時と異なり、当時は見過ごしていた、  
あるいは期限内LGTMを第一に意図的に無視した部分など、多くの気づきをもたらしている。
  
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
多対多の関係が存在する。このため上記のように中間テーブルを作成した。  

# バージョン情報
Rails 5.0.7.2
Ruby 2.5.1

# マークアップ
reset.scss（ブラウザ毎にデフォルトで設定されているスタイルにより生じる  
表示の差異を解消するためのファイル）と、groupの新規作成・編集画面を除き、全面的に実装した。  
原則、BEM記法を用いてクラス命名を行い、また、初めてhtmlをhamlテンプレートを利用して  
コーディングした。当初、画面の崩壊を含むエラーが多発し、その解決に多くの時間を費やす結果となったが、  
インデントによるhamlの入れ子構造や、hamlのクラス名とsassのクラス名の不一致  
（ハイフンとアンダーバーの違いなど）に、相当気を付けられるようになり、現在は当時に比べると  
エラー解決のスピードは格段に上がっている。装飾にはすでに述べたように、sass(拡張子scss)を用い、  
適宜ネスト構造や変数、mixin、パーシャルを利用して記述の簡略化に努めた。     
  
# サーバーサイド 
## devise関連
サインイン、ログイン、ログアウト時にフラッシュメッセージが表示されるように設定している  
（メッセージ送信時、グループ編集時も表示される）。  
例：「ログインしました」「Emailもしくはパスワードが不正です」  
「アカウント登録もしくはログインしてください」など。これらはflash.html.hamlに記述している。  
なお、この設定に伴い、GitHubに公開されているコードを利用して、  
メッセージの日本語化ファイルを作成している（config/locales/ja.yamlと、config/devise/ja.yaml).  
また、application.rbの、module ChatSpace内に、config.i18n.default_locale = :ja  
を追記している。  

## user関連
１）UsersControllerのupdateアクションに、user情報編集の成功or失敗時の条件分岐を  
導入しているが、成功時はredirect_toメソッドでroot_path（groups#index)へ、  
失敗時はrenderメソッドで元の編集画面へ遷移する設定にしている。  
※更新や削除の結果をきちんと反映させる場合はredirect_toメソッドを使用。  
２）groupの新規作成、編集ページで、チャットメンバー（=user)の追加・削除の際に
JSの非同期通信を用いたインクリメンタルサーチを実装（別記もご参照お願いします）。
この関連でUsersControllerのindexアクションに、曖昧検索とJSON形式のレスポンスを返せるように記述。
```
def index
    @users = User.where('name LIKE(?)  AND  id != ?', "%#{params[:keyword]}%" ,current_user) 
      respond_to do |format|
      format.html
      format.json
    end    
  end
```
2行目がわかりづらいが、  
User.where('name LIKE(?)', "%#{params[:keyword]}%").where.not(id: @current_user.id) と同じ。  
前段で入力されたキーワードを含むnameのユーザーを返す一方、後段（where.not以下）でcurrent_userを検索しないように  
している（「not」は「（後ろに続く引数）ではない」を意味するメソッド。SQL文を考えると分かりやすい）。  
  
## group関連  
1)rootページの左サイドバーに、current_userの所属するグループ名と、  
各グループの最新のメッセージが表示されるようにしている。  
該当するhtmlコーディングの場所は、部分テンプレートのside_bar.html.hamlのgroups以下。  
最新メッセージの表示については、group.rbに以下の記述。三項演算子は、画像のみ投稿された場合に対応。  
```
def show_last_message
    if (last_message = messages.last).present?
      last_message.content? ? last_message.content : '画像が投稿されています'
    else
      'まだメッセージはありません。'
    end
  end
```
２）GroupsControllerのnewアクションで@groupインスタンスを生成。  
また、新規作成したグループに所属するユーザーに、current_userが含まれるように記述。  
３）createアクション、updateアクションでは、group新規作成時および編集時の条件分岐を導入。  
４）インクリメンタルサーチに関しては別記。

## message 関連

# Javascript, 非同期通信関連
## インクリメンタルサーチ
１）これに関わるhtmlは、部分テンプレートのform.html.hamlの14行目「.chat-group-form__field.clearfix」から、  
３２行目の「.js-remove-btn 削除」まで。スクール側が用意したものを編集。  
なお、#user-search-result要素に検索結果が表示され、その部分のhtmlは、javascripts/members.js内に記述。  
BEM記法による類似した要素名が数多く存在する。可読性の低下を避けるために空白行を設けた。  
これに関連する装飾（scss）は、スクール側が用意したものをそのまま使用。  
２）members.jsについて
  ①5〜１０行目 インクリメンタルサーチ起動後、表示される追加チャットメンバー（= user)候補欄　　
  （２行目で「var search_list = $("#user-search-result")」と定義されている部分）の、
  右端に表示される「追加」をクリックすると実行されることが書かれている。selecrUsername関数については、
  ⑤をご参照お願いします。
  












