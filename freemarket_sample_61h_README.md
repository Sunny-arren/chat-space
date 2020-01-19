# README
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
【Team members】
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
ユーザーマイページから入るか、ログイン後に商品一覧ページに表示される赤い丸型の「出品」アイコンをクリックすると、出品ページへ遷移する。ここで出品する商品の様々な情報を入力および選択する。ブランド名についてはインクリメンタルサーチが、三段階のカテゴリ欄や発送元の地域等にはプルダウンメニューがJSを利用して実装されている（該当JSファイル：new_product.js スクラムリーダーが460行余りに及ぶコードを自走）。画像の入れ込みについては、同ファイルの368行目以降。new.html.haml の関連する部分を以下に抜粋する（13~16行目）。fields_for については機会を見て自分でも実装を試みたいと思う。  
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
カテゴリおよびブランド検索機能も含めて、ヘッダーとフッターの担当は私だった。インターネットにある情報を元に、JSを使って実装を試みたが、1週間かけても大カテゴリをちょろっと出すくらいまでしかできず、ギブアップした。当時の状況ではこのように、ネットの情報を見ても理解できず、実装できないということが別のシーン（前述の画像スライドやいいね！機能。後者はチームとして実装しないことにした）でも発生し、私を懊悩させた。最終的にはスクラムリーダーがJSを使用して実装した（category.js ファイル)。  
【トップページのカテゴリ検索機能】  
![トップページのカテゴリ検索機能](https://user-images.githubusercontent.com/56028886/72679847-9981ae00-3af6-11ea-8f6f-d4e8c6b15b05.png)  
【私の実装したカテゴリ検索機能（映像リンク）】  
https://gyazo.com/e000951f649ffb312a7fdb8ff0c3c794  

## ログイン・サインアップ機能
### SNSを用いたログイン機能
## 商品購入ページ
### クレジットカード登録機能（PAY.JPを利用）
## ヘッダーとフッター

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
最大のメリットは、チームの結束が高まり、モチベーションが上がる点ではないかと思う。自分自身のマインドセットに与えたプラスの影響も大きかった。デメリットは、個々人のスキルの幅が大きく、作業量に多寡が生じ易いこと。アジャイル型開発について述べた記事を読むと、こうした属人的な作業量の差については、一つの件について共同でプログラミングを行うのが良いと書かれていたが、非効率であろう（一人で基本的に完結させた方が効率的。他人が書いたものを読解するのはそもそも困難）というのが我々の認識で、時間の制限もある中で深くは検討しなかった。しかし共同でやりたいという要望は、スクラムリーダー以外の誰もが持っていた。そうでなければ開発を通じたスキルアップが難しいからである（できる人は多くの課題にチャレンジできる、できない人はチャレンジできない、ということになってしまう）。もしも実現できていたら、私も含めてメンバー全員がもっと色々な機能実装にチャレンジできたことと思う。なお、ヘッダーのカテゴリ検索機能と、いいね！機能はレベルが高く、今思うと当時の私にはオーバースペックであった。しかしながら、どの機能がどのくらいの難易度なのか、当時はスクラムリーダーを含め、誰もがよく分からなかった。とはいえ、アジャイル型開発において、当初は作業の難易度や必要な時間が不明で、走りながら明らかになってゆくということはよくあることではないかと思う。  

##  苦労した点  
分かり易いところから述べると、画像スライドの実装について、当初プラグインを利用しようと考えたがこれは大失敗だった。当時の理解度/スキルではプラグインを、作成しているアプリに合わせることができず、また、そもそもプラグインを利用するとエラーが生じた時の原因がわかりづらい。最終的には同期に相談するなどして、既知の内容を利用した。いいね！機能はRails Tutorialを解説した情報を利用しようとしたが、難し過ぎた（今なら参考にしない）。カテゴリ検索機能については前述の通り。インターネット上には数多くのコーディング情報が溢れているが、内容の難しいものや未知の内容が多い。安易に答えを見つけようとして、無理にこうした内容に合わせたりせず、まずは自走し、たとえそれが効率的なものでなかったとしても、きちんと動くようにすることが、スキルの向上に繋がると痛感した。  
  
以上です。  