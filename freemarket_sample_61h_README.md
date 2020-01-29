# README（freemarket_sample_61h）
# 概要
TECH::EXPERTの最終課題。メルカリのWebアプリケーションのリプロダクション。
## 開発環境
開発言語：ruby 2.5.1p57  
開発フレームワーク：Rails 5.2.3  
RDBMS：MySQL  
開発プラットフォーム：Github  
デプロイ先：AWSのEC2  
コーディングソフト：Visual Studio Code  
## 開発期間と平均作業時間
開発期間：10/26（土）-11/21（木）（休日2日を除いて25日間、22日（金）が発表会）  
1日あたりの平均作業時間：9~10時間（合計約240時間）  
人数：5名(26歳3名（女性1名含む）、24歳1名、44歳1名)  
開発スタイル：アジャイル型開発  
最初と最後の週を除く毎週金曜日にスプリントレビューを行った。  
朝のデイリースクラム、夜の一日の作業状況報告は毎日欠かさず行った。  
日常的にコミュニケーションを取りながら作業を進めていた。  
タスク管理はTrelloを使用。  
【Team members】（一番左が私）  
![IMG_20191121_141948](https://user-images.githubusercontent.com/56028886/72675011-a041fe00-3ac1-11ea-8b05-939bd0242d54.jpg)
【Trelloの状況（開発終了時）】
![Trello_1](https://user-images.githubusercontent.com/56028886/72675074-7210ee00-3ac2-11ea-9f6e-558707879e3c.png)

![Trello_2](https://user-images.githubusercontent.com/56028886/72675075-763d0b80-3ac2-11ea-808a-c751a612a362.png)

## デプロイ先、テスト用アカウント情報
### デプロイ先
URL http://54.168.98.247/  
ID/Pass  
ID:admin  
Pass: 2222   
### テスト用アカウント
＜購入者用＞  
メールアドレス: machida@gmail.com  
パスワード: 1234567  
※購入用カード情報  
番号：4242424242424242  
期限：03/23  
ユーザー名：町田太郎  
セキュリティコード：123  
＜出品者用＞  
メールアドレス名: ebina@gmail.com  
パスワード: 1234567  

# DB設計
## ER chart
![ER_chart_Mercari](https://user-images.githubusercontent.com/56028886/72677107-1c493f80-3adc-11ea-8032-50ed25adcd1d.png)  
## usersテーブル
|Column|Type|Options|
|------|----|-------|
|nickname|string|null: false|
|email|string|null: false|
|password|string|null: false|
|name|string|null: false|
|name_f|string|null: false|
|last_name|string|null: false|
|last_name_f|string|null: false|
|birth_year|integer|null: false|
|birth_month|integer|null: false|
|birth_day|integer|null: false|
|d_name|string|null: false|
|d_name_f|string|null: false|
|d_last_name|string|null: false|
|d_last_name_f|string|null: false|
|postal_code|integer|null: false|
|prefecture|string|null: false|
|city|string|null: false|
|address|string|null: false|
|building_name|string||
|phone_number|integer||
|v_good|integer||
|v_accept|integer||
|v_bad|integer||
|avatar|string||
|profile|text||
### Association
- has_many :products
- has_many :cards

## productsテーブル
|Column|Type|Options|
|------|----|-------|
|name|string|null: false|
|introduction|text|null: false|
|status|string|null: false|
|d_charge|string|null: false|
|d_method|string|null: false|
|d_origin|string|null: false|
|d_interval|string|null: false|
|price|integer|null: false|
|category_id|integer|null: false, foreign_key: true|
|user_id|integer|null: false, foreign_key: true|
|brand_id|integer|null: false, foreign_key: true|
|product_size|string||
### Association
- has_many :images
- belongs_to :user
- belongs_to :brand
- belongs_to :category
- belongs_to_active_hash :prefecture
- belongs_to_active_hash :grand_category

## categoriesテーブル
|Column|Type|Options|
|------|----|-------|
|name|string|null: false|
|ancestry|string||
### Association
- has_one :product
- has_ancestry

## brandsテーブル
|Column|Type|Options|
|------|----|-------|
|name|string|null: false|
|profile|text|null: false|
|keyword1|text|null: false|
|keyword2|text|null: false|
### Association
- has_many :products

## imagesテーブル
|Column|Type|Options|
|------|----|-------|
|picture|string|null: false|
|product_id|integer|null: false, foreign_key: true|
### Association
- belongs_to :product

## cardsテーブル
|Column|Type|Options|
|------|----|-------|
|user_id|integer|null: false, foreign_key: true|
|customer_id|integer|null: false|
|card_id|integer|null: false|
### Association
- belongs_to :user

# 各ページおよび機能の概略  
## 商品一覧ページ（ヘッダーとフッターを除く）  
トップページ、カテゴリ別ページ、ブランド別ページに分かれている。  
カテゴリ別ページ、ブランド別ページには、ヘッダーの「カテゴリから選ぶ」「ブランドから探す」をクリックし、任意のカテゴリ、ブランドをクリックすると遷移。新着アイテムの「もっと見る」をクリックすると、該当のカテゴリのページへ遷移できる。

## 商品詳細ページ  
各商品別に詳細情報を閲覧できるページがある（各商品のサムネイルをクリックすると詳細ページへ遷移）。ここのロジック部分は、画像のスライド部分を含めて私が担当した。  
＜関連するファイル＞  
app/assets/stylesheets/_products.scss  
app/views/products/show.html.haml  
app/controllers/products_controller.rb  
＜簡単な解説＞  
ファットなproducts_controller（showアクション)を作ってしまい、可読性が悪い。以下に補足説明する。  
```
@other_products = @user.products.where.not(id: @product.id)
```
これでメインで表示されている商品を除外し、下段の出品者の他の商品を表示。また、
```
@ordered_other_products
```
この変数で、新しい順（＝product_idの大きい順）に並べている。親と子カテゴリ名は、categories テーブルのancestoryカラムを読む形式。
次の商品を参照するリンクについては、前に戻るリンクでは、
```
@reverse_ordered_products 
```
この変数でレコードを降順にして、@product.idの次に若いid の商品のページのリンクに飛べるようにしている。

### 画像スライド部分について
＜関連するファイル＞  
app/assets/javascripts/product-image.js  
app/assets/stylesheets/_products.scss  
app/views/products/show.html.haml  
<簡単な解説(JSファイルを中心に）>  
要素「item__main-content__photo__frame__stage-outer__stage」のwidthを1500px取り、ここに、show.html.haml内の、each_with_index 文で取得した画像を、index 順に左へ押し込むイメージ。リロード時にこれが実行される。  
【show.html.haml 13~16行目】
```
%ul.item__main-content__photo__frame__stage-outer__stage
  - @product.images.each.with_index do |p,i|
    %li.item__main-content__photo__frame__stage-outer__stage__item                   
      = image_tag p.picture.url, class:"item__main-content__photo__frame__stage-outer__stage__item__image"    
```
JSのコーディングの、li:eq(n)は、指定されたindexの要素だけを選択。  
一番最後のコードは、読み込み時に最初の画像のopacity を消すもの。  
【product-image.js 2~9行目】  
```
$(document).on('turbolinks:load',function(){
  $(document).ready(function(){
    $('.item__main-content__photo__frame__stage-outer__stage li:eq(0)').css("left","0px");
    $('.item__main-content__photo__frame__stage-outer__stage li:eq(1)').css("left","300px");
    $('.item__main-content__photo__frame__stage-outer__stage li:eq(2)').css("left","600px");
    (中略)     
    $('.item__main-content__photo__frame__dots__dot__image:eq(0)').css("opacity","1.0");})
```
同ファイルの後段では、サムネイル画像に触れた時に選択した画像のメイン画像が、スライドして現れるようにしている。デフォルトではopacity がかかっているが、触れた時にそれが解除されるように、CSSで :hover を設定している。各部分の3行目に
```
$('.item__main-content__photo__frame__dots__dot__image:eq(0)').css("opacity","0.4");
```
とあるのは、先頭サムネイルのopacity 解除を打ち消しているため。なお、商品の編集ページ（ユーザーマイページから入る）に行く手前にも詳細ページと同様のページが存在するが（product_id/product_show のページ、以下、商品編集のトップページと記す）、ここの画像スライドについても同様のコーディングを行なっている（product_exhibit-image.js ファイル）。  
【商品詳細ページの画像】  
![商品詳細ページ_1](https://user-images.githubusercontent.com/56028886/72679337-83252380-3af1-11ea-8a76-a7657e353202.png)
![商品詳細ページ_2](https://user-images.githubusercontent.com/56028886/72679338-83252380-3af1-11ea-9f50-6914a19050e6.png)

## 商品出品ページ
ユーザーマイページから入るか、ログイン後に商品一覧ページに表示される赤い丸型の「出品」アイコンをクリックすると、出品ページへ遷移する。ここで出品する商品の様々な情報を入力および選択する。ブランド名についてはインクリメンタルサーチが、三段階のカテゴリ欄や発送元の地域等にはセレクトボックスが、JSを利用して実装されている（該当JSファイル：new_product.js スクラムリーダーが460行余りに及ぶコードを自走）。画像の入れ込みについては、同ファイルの368行目以降。new.html.haml の関連する部分を以下に抜粋する（13~16行目）。fields_for については機会を見て自分でも実装を試みたいと思う。  
```
.exhibit-product__view--img__box
  = f.fields_for :images do |i|
    #image-contents.img-box
      .view_box
        = i.file_field :picture, class:"file"
```
【ユーザーマイページ】  
![ユーザーマイページ](https://user-images.githubusercontent.com/56028886/72680139-c71c2680-3af9-11ea-8a44-42343877a08d.png)  
※「出品する」（青い枠で囲った部分）をクリック→商品出品ページ遷移。  
「出品した商品・出品中」（赤い枠で囲った部分）をクリック→商品編集ページへ遷移。  
なお、ユーザーマイページへは、ヘッダーの「マイページ」をクリックして遷移する。  
【商品出品ページの画像】  
![商品出品ページ_1](https://user-images.githubusercontent.com/56028886/72679303-422d0f00-3af1-11ea-9a50-79f7aecbf1e4.png)
![商品出品ページ_2](https://user-images.githubusercontent.com/56028886/72679304-42c5a580-3af1-11ea-95c3-83d6a14a829a.png)
![商品出品ページ_2 5](https://user-images.githubusercontent.com/56028886/72679305-42c5a580-3af1-11ea-8d00-8b8f45e58885.png)
![商品出品ページ_3](https://user-images.githubusercontent.com/56028886/72679306-42c5a580-3af1-11ea-9730-7948a21ce9df.png)
![商品出品ページ_4](https://user-images.githubusercontent.com/56028886/72679353-aa7bf080-3af1-11ea-9ab4-1a9c7217217a.png)

## 商品編集ページ
ユーザーマイページから入る。基本的に商品出品ページに関するコードが流用されている。画像の入れ替え機能の実装はできなかった。 
同ページのトップページについては、前述の画像スライド機能のほか、ビューファイルの変数設定は私が担当した（product_show.html.haml）。  
【商品編集ページの画像】  
![商品編集ページ](https://user-images.githubusercontent.com/56028886/72679393-165e5900-3af2-11ea-81f2-5a4b8bda3e22.png)

## カテゴリ機能
Railsのライブラリにあるgem 'ancestry' を利用して実装した。簡単に述べると、カテゴリ（親、子、孫）名＋インデックス番号（親には無し、子なら親のインデックス番号が振られる。孫なら親と子のインデックス番号が振られる）でカテゴリを管理するシステム。データはseedファイルに書き出している。  
【ancestryを利用したDBのレコードの様子】  
![ancestryのDBレコード](https://user-images.githubusercontent.com/56028886/72679680-b61ce680-3af4-11ea-96ca-1e6da520e2d4.png)

### ヘッダーのカテゴリ検索機能
カテゴリおよびブランド検索機能も含めて、ヘッダーとフッターの担当は私だった。インターネットにある情報を元に、JSを使って実装を試みたが、大カテゴリを出す位のところまでしかできず、ギブアップした。当時の状況ではこのように、ネットの情報を見ても実装に落とし込めないということが別のシーン（前述の画像スライドやいいね！機能。後者はチームとして実装しないことにした）でも発生し、私を懊悩させた。最終的にはスクラムリーダーがJSを使用して実装した（category.js ファイル)。  
【トップページのカテゴリ検索機能】  
![トップページのカテゴリ検索機能](https://user-images.githubusercontent.com/56028886/72679847-9981ae00-3af6-11ea-8f6f-d4e8c6b15b05.png)  
【私の実装したカテゴリ検索機能（映像リンク）】  
https://gyazo.com/e000951f649ffb312a7fdb8ff0c3c794  

## ログイン・サインアップ機能
### メールアドレスで登録する
HTTP通信はステートレスで、何もしなければ入力された情報（＝以前のリクエスト）をページ遷移時（＝次のリクエスト）に維持することができない。railsのsessionメソッドは、ブラウザ側（＝クライアントサイド）でcookiesという小さなテキストファイルに情報の一時的な保存を可能にするもの。これを利用して連続的なユーザー情報入力と、ログイン状態の維持を行う。なお、広義のsessionの意味は、ログイン〜ログアウトまでの一連の流れのこと。本Appではsessionメソッドを利用し、signup_controllerに入力段階（ページ）毎にstep1からstep4のアクションを設定。User.newを実行した上で、入力された情報をsession[:XX]に代入している（各stepに書かれているsessionデータは、一つ前のstepのものだが、前にリクエストされたデータを、次のリクエストへ引き継ぐ役目があると考えると理解できる）。また、validates_step1 ~ 4で、各ステップで入力された情報を、次のステップに行く前に（before_actionを見ると分かる）User.new以降でモデルに渡して、一括してバリデーションしている（正規表現は、user.rbに書かれている）。入力に不備があれば、render :step1~3 unless @user.valid?(:validates_step1 ~ 3)で、次のページへ遷移しないようになっている。valid?の後ろの引数は、当該アクションで入力されたsession情報全てを指す。生年月日については、date_selectメソッドを利用（ビューに具体的な記述がある）。エラーメッセージの日本語化については、config/application.rbに、config.i18n.default_locale = :jaと記述。ビューへの表示は、/layouts/_error_messages.html.haml に記述。  
  
【signup_controllerの一部抜粋】  
```
def step1
    @user = User.new
  end

  def step2
    birthday                        = birthday_join(params[:birthday])
    session[:nickname]              = user_params[:nickname]
    session[:email]                 = user_params[:email]
    session[:password]              = user_params[:password]
    session[:password_confirmation] = user_params[:password_confirmation]
    session[:last_name]             = user_params[:last_name]
    session[:name]                  = user_params[:name]
    session[:last_name_f]           = user_params[:last_name_f]
    session[:name_f]                = user_params[:name_f]
    session[:birthday]              = birthday
    session[:provider]              = session[:provider]
    session[:uid]                   = session[:uid]
    @user = User.new
  end
```
```
def validates_step1
    birthday                        =  birthday_join(params[:birthday])
    session[:nickname]              = user_params[:nickname]
    session[:email]                 = user_params[:email]
    session[:password]              = user_params[:password]
    session[:password_confirmation] = user_params[:password_confirmation]
    session[:last_name]             = user_params[:last_name]
    session[:name]                  = user_params[:name]
    session[:last_name_f]           = user_params[:last_name_f]
    session[:name_f]                = user_params[:name_f]
    session[:birthday]              = birthday
    @user = User.new(
      nickname:               session[:nickname],
      email:                  session[:email],
      password:               session[:password],
      password_confirmation:  session[:password_confirmation],
      last_name:              session[:last_name],
      name:                   session[:name],
      last_name_f:            session[:last_name_f],
      name_f:                 session[:name_f],
      birthday:               session[:birthday]
    )
    render :step1 unless @user.valid?(:validates_step1)
  end

  def validates_step2
    session[:phone_number] = user_params[:phone_number]
    @user = User.new(
      phone_number:          session[:phone_number],
      password:              "1234567",
      password_confirmation: "1234567",
      email:                 "123@gmail.com"
    )
    render :step2 unless @user.valid?(:validates_step2)
  end
```
validates_step2と3にある、パスワードとその確認、emailのダミーデータの設定については、deviseにもともと入っている設定が邪魔をするのを防ぐためとスクラムリーダーより聞いているが、自分自身でこれをsession[:XX]に書き直して入力してみたところ、問題なく動いていた。ダミーデータが使用された理由が、現時点では確認できない。

【ユーザー情報入力画面（step1)】  
![ユーザー情報入力画面_1(step1_1)](https://user-images.githubusercontent.com/56028886/72711160-dc518d80-3bab-11ea-9f77-79bb2471a7cb.png)
![ユーザー情報入力画面_2(step1_2)](https://user-images.githubusercontent.com/56028886/72711162-dd82ba80-3bab-11ea-8b11-6c3261ee0ae3.png)
![ユーザ情報入力画面_3(step1_3)](https://user-images.githubusercontent.com/56028886/72780743-f306eb80-3c62-11ea-9770-c4c0dfb38d38.png)

### SNSを用いたログイン機能  
Googleアカウントと、FacebookアカウントでSNS認証を行えるようにした（現在はこの部分を担当したメンバーのAPIキー（非公開）のセッティングに問題が生じている様子で、正常に作動しない。課題提出時は問題なく作動していた）。以下の3つのgemをインストール（再度のgemは環境変数を管理するもの。sns_credentialsは、認証実行の結果、返って来るproviderと各ユーザーを識別するuidを保存するテーブル。  
```
gem 'omniauth-google-oauth2'
gem 'omniauth-facebook'
gem 'dotenv-rails'
```
本実装に伴い、routes.rb の devise_for :users の後に以下を追記。  
```
controllers: {omniauth_callbacks: 'users/omniauth_callbacks'}
```
関連するコントローラーは、users/omniauth_callbacks_controller.rb 。以下は、すでに認証されている場合と、そうでない場合の条件分岐を記述した部分。  
```
def callback_for(provider)
    @omniauth = request.env['omniauth.auth']
    info = User.find_oauth(@omniauth)
    @user = info[:user]
    if @user.persisted? 
      sign_in_and_redirect @user, event: :authentication
      set_flash_message(:notice, :success, kind: "#{provider}".capitalize) if is_navigational_format?
    else 
      @sns = info[:sns]
      session[:provider] = @sns[:provider]
      session[:uid] = @sns[:uid]
      render template: "signup/step1"
    end
  end
```  
【サインアップ画面】  
![サインアップ画面](https://user-images.githubusercontent.com/56028886/72786700-8fd08580-3c71-11ea-95f9-2a509d00d584.png)  
【ログイン画面】  
![ログイン画面](https://user-images.githubusercontent.com/56028886/72786706-9101b280-3c71-11ea-9903-191a0feb5889.png)  
  
## 商品購入機能
### 商品購入ページ
商品詳細ページの、「購入画面に進む」をクリックすると、購入画面へ遷移する。購入画面の「購入する」ボタンは、ログインしたユーザーがクレジットカード登録している時のみアクティブ（赤色）になるようにしている。同ボタンをクリックすると、ボタンの表示は「購入が完了しました」（灰色）に変化する。商品購入後の商品詳細ページの変化（売却済みの表示を出すなど）は実装していない。  
【商品購入ページ（アクティブ）】  
![購入画面](https://user-images.githubusercontent.com/56028886/72789221-a75e3d00-3c76-11ea-9dab-b56dfbb4cfc9.png)  
【商品購入ページ（非アクティブ）】  
![購入画面（非アクティブ）](https://user-images.githubusercontent.com/56028886/72789394-0d4ac480-3c77-11ea-9916-ee047d85cc83.png)  

### クレジットカード登録機能（PAY.JPを利用）  
PAY.JPのアカウントを設定してAPIを取得、また開発サイドではgem 'payjp'をインストール。該当するビューは、views/cards/new.html.haml、コントローラは、controllers/cards_controller.rb.まず、コントローラについて若干の説明を行う。
```
def set_card
    @card = Card.where(user_id: current_user.id).first if Card.where(user_id: current_user.id).present?
```
上記はbefore_actionに指定されているアクション。cardsテーブルからuser_idをキーにカード情報を呼び出す。where~firstは、find_byで代替可能。if 以下で、card情報がnilの場合に発生するエラーを防いでいる。
```
def create  # カード登録処理
    Payjp.api_key = ENV["PAYJP_PRIVATE_KEY"]

    if params['payjp-token'].blank?
      redirect_to action: "new"
    else
      customer = Payjp::Customer.create(
        description: 'test', 
        email: current_user.email,
        card: params['payjp-token'], 
        metadata: {user_id: current_user.id} 
      )
      @card = Card.new(user_id: current_user.id, customer_id: customer.id, card_id: customer.default_card)
      if @card.save
        redirect_to action: "index"
      else
        redirect_to action: "create"
      end     
    end
  end
```
以上はカードを登録するcreateアクション。ENV["PAYJP_PRIVATE_KEY"]は、PAY.JPアカウント取得時に発行される秘密鍵（ターミナルから直接bash_profileに記述するため、Appファイルの中にはこの記述が無い）。フォームに入力されたカード情報を送信すると、PAY.JPサーバーに情報が送られ、PAY.JPからカード毎にトークンが返される（['payjp-token']）。サーバーサイドでこのトークンを受け取り、その情報を用いてコントローラーで支払い処理を記述。customer = Payjp::Customer.create(省略)の部分は、PAY.JPへ登録する情報。トークンはe-mailとuser_idで紐づけられていることが分かる。@cardはサーバサイドのcardsテーブルから抽出したインスタンス変数。if文の分岐は、カード情報が保存されれば、カード情報確認画面（indexアクション）へ、保存されなければ登録画面（createアクション）へ遷移するということ。 
```
//トークン生成
      Payjp.createToken(card, (status, response) => {
        if (status === 200) { 
          $("#card_number").removeAttr("name");
          $("#cvc").removeAttr("name");
          $("#exp_month").removeAttr("name");
          $("#exp_year").removeAttr("name"); 
          $("#card_token").append(
            $('<input type="hidden" name="payjp-token">').val(response.id)
          ); 
          document.inputForm.submit();
          alert("登録が完了しました"); 
        } else {
          alert("カード情報が正しくありません。");
        }
      });
```
上記は、カード情報登録時に用いるJavascriptのコード（ファイル名：payjp.js）。トークン作成のところのみ若干説明する。カード情報入力のあと、送信ボタンを押すと起動。Payjp.createTokenは、トークン作成のメソッド。if (status === 200) はカード情報送信リクエストがPAY.JPサーバーに受け付けられたらという条件（createTokenの引数になっている）。removeAttr("name")は、カード所有者とトークン情報（name）が紐づいてしまうのを防ぐコード 。しかし、同一トークンの購入履歴を管理することは可能である。  
【カード情報登録画面】（ユーザー情報登録のstep4も内容は同じである）  
![クレジットカード情報登録画面](https://user-images.githubusercontent.com/56028886/73119043-d5f25580-3f9f-11ea-8bf6-7e2a6166531e.png)  
【カード情報確認画面】  
![登録されたクレジットカードの情報確認画面](https://user-images.githubusercontent.com/56028886/73119046-dee32700-3f9f-11ea-8396-e498bdb8b51b.png)  

## ヘッダーとフッター
マークアップを私が担当した。

# 開発の総括
## 自身の担当箇所
①トップページのヘッダーとフッターマークアップ(カテゴリ検索機能にチャレンジしたが、納期を考えスキル上位者に引き継いた）  
②商品詳細ページ（サーバーサイド全般）（いいね！機能にチャレンジしたが、納期を考え最終的には実装しなかった）  
③出品者の商品出品ページのトップページ（サーバーサイド一部）（ビューファイルの変数設定、画像スライド実装（JS））  

## チームとして工夫した点
何か問題がありそうな場合（プルリクのマージ前）や、詰まってしまっている時をはじめ、日常的に活発にコミュニケーションを取った。役に立つ情報はslack に積極的に上げてシェアした。我々のチームにおいて、各担当者の状況がよく分からないということは全く無かったと思う。  
## 個人として工夫を行った点
実際に仕事をはじめた時と同様、納期を意識し、自身のスキルを冷静に見てチャレンジを途中で止めたり、技術上位者にタスクを譲った。
それでもタスクの量や難易度に比して、平均をだいぶ過ぎる時間を要してしまった。シンプルなタスクを担当することになっても、気を抜かずに行った。

## アジャイル型開発のメリットとデメリットなど
最大のメリットは、チームの結束が高まり、モチベーションが上がる点ではないかと思う。自分自身のマインドセットに与えたプラスの影響も大きかった。デメリットは、個々人のスキルの幅が大きく、作業量に多寡が生じ易いこと。アジャイル型開発について述べた記事を読むと、こうした属人的な作業量の差については、一つのタスクについて共同でプログラミングを行うのが良いと書かれていたが、一人で一タスクを基本的に完結させた方が効率的で、他者とコーディングを分割すると面倒なことになるというのが我々の認識で、時間の制約もある中で深くは検討しなかった。また、開発を通じたスキルアップは、取り組んだ課題の量に比例したと思う。どのように助け合いながら効率よく進められるかについては、テクニカルな面から再考の余地が多いように思った。なお、ヘッダーのカテゴリ検索機能と、いいね！機能はレベルが高く、今思うと当時の私にはオーバースペックであった。しかしながら、どの機能がどのくらいの難易度なのか、当時はスクラムリーダーを含め、誰もがよく分からなかった。とはいえ、アジャイル型開発において、当初は作業の難易度や必要な時間が不明で、走りながら明らかになってゆくということはよくあることではないかと思う。  

##  苦労した点  
分かり易いところから述べると、画像スライドの実装について、当初プラグインを利用しようと考えたがこれは大失敗だった。当時の理解度/スキルではプラグインを、作成しているアプリに合わせることができず、また、そもそもプラグインを利用するとエラーが生じた時の原因がわかりづらい。最終的には同期に相談するなどして、既知の内容を利用した。いいね！機能はRails Tutorialを解説した情報を利用しようとしたが、難し過ぎた（今なら参考にしない）。カテゴリ検索機能については前述の通り。インターネット上には数多くのコーディング情報が溢れているが、内容の難しいものや未知の内容が多い。安易に答えを見つけようとして、無理にこうした内容に合わせたりせず、まずは自走し、たとえそれが効率的なものでなかったとしても、きちんと動くようにすることが、スキルの向上に繋がると痛感した。  
  
以上です。  