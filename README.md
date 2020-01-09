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
作成したものである。期限内LGTMを優先し、時間に追われたカリキュラム履修当時と異なり、  
多くの気づきをもたらしている。
  
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
前段で入力されたキーワードを含むnameのユーザーを返す一方、後段（where.not以下）で  
current_userを検索しないようにしている（「not」は「（後ろに続く引数）ではない」を意味するメソッド。  
SQL文を考えると分かりやすい）。  
  
## group関連  
1)rootページの左サイドバーに、current_userの所属するグループ名と、  
各グループの最新のメッセージが表示されるようにしている。  
該当するhtmlコーディングの場所は、部分テンプレートのside_bar.html.hamlのgroups以下。  
最新メッセージの表示については、group.rbに以下のように記述。三項演算子は、画像のみ投稿された場合に対応。  

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
投稿機能に関しては、fakerとfactory_botを利用して単体テストを実行した。  
コーディングは他の部分と異なり教材に雛形が充実していたため、意味の理解に努めた。  
①テストで使用するデータの準備について（Fakerを利用）は、spec/factories/messages.rb等に、  
以下のように記述。インスタンス名はname,password,emailなど  
```
インスタンス名{Faker::(Fakerに用いられているダミーデータ群の名称}  
```
画像についてはFakerでは生成しないので、publicフォルダに用意したtest_image.jpgを利用。  
spec/factories/messages.rbに以下のように記述。  
```
image {File.open("#{Rails.root}/public/images/test_image.jpg")}
```
②messageコントローラのテスト：  
コードはspec/controllers/messages_controller_spec.rbに記述。  
４、５行目で、letを用いてテスト中に使用するインスタンスを定義  
```
let(:group) { create(:group) }
let(:user) { create(:user) }
```
７〜３７行目で、indexアクションのテスト。  
この内、9~26行目がloginしている場合のテスト。  
```
describe '#index' do

    context 'log in' do
      before do
        login user
        get :index, params: { group_id: group.id }
      end

      it 'assigns @message' do
        expect(assigns(:message)).to be_a_new(Message)
      end
      (中略）     
    end

    context 'not log in' do
      before do
        get :index, params: { group_id: group.id }
      end

      it 'redirects to new_user_session_path' do
        expect(response).to redirect_to(new_user_session_path)
      end
    end
  end
```
この後にcreateアクションテストが続く。  

# Javascript, 非同期通信関連
## インクリメンタルサーチ  
１）これに関わるhtmlは、部分テンプレートのform.html.hamlの14行目「.chat-group-form__field.clearfix」から、  
３２行目の「.js-remove-btn 削除」まで。スクール側が用意したものを編集。  
なお、#user-search-result要素に検索結果が表示され、その部分のhtmlは、javascripts/members.js内に記述。  
BEM記法による類似した要素名が数多く存在する。このため、可読性の低下を避けるために空白行を設けた。  
これに関連する装飾（scss）は、スクール側が用意したものをそのまま使用。  
２）members.jsについて  
①5〜１０行目 インクリメンタルサーチ起動後、表示される追加チャットメンバー（user)候補欄  
（２行目で「var search_list = $("#user-search-result")」と定義されている部分に、  
１５〜21行目に定義されている、appendUserName関数内に記述されたhtml内にある、  
user-search-addクラスが相当）の、右端に表示される「追加」をクリックすると、実行されることが書かれている。  
②１１〜１３行目　既存チャットメンバー（user)候補欄の右端に表示される「削除」  
（_form.html.hamlの３２行目、「.user-search-remove」）をクリックすると実行される内容。  
③１５〜２１行目　appendUserName関数の定義。ここでインクリメンタルサーチ起動時に、  
追加チャットメンバー候補（user)を、２行目で定義されたvar search_listにappendしている。  
④２３〜28行目　appendNoUserName関数の定義。ここでインクリメンタルサーチ起動時、  
候補が見つからなかった場合、本来ならチャットメンバー候補（user)が表示される部分に、  
「一致するユーザーが見つかりません」とメッセージが表示されるようにしている。  
⑤30〜37行目　selectUserName関数の定義。ここでインクリメンタルサーチ起動時に、  
既存チャットメンバーを表示させているほか、①で追加されたチャットメンバー（user)を直ちに表示させるために、  
以下のようにinputタグが設定され、当該チャットメンバーのuser_idが入力される仕様になっている。  
```
<input name='group[user_ids][]' type='hidden' value='${ user_id }'>
```
name属性の記述「group[user_ids][]」は、groupに属するuserのidたちを入れる、空の配列が  
指定されている（[ ]が無いと、追加ボタンを押してもuserが追加されない  
（＝user_id を追加できない）ことを確認済）。  
私見であるが、input タグのname属性は、ただの名前という認識は誤りであり（ウェブサイトに多くある説明は  
そこまでのものが多い）、入力される値の属性の一部を示していると考えた方が適切だと思う。  
⑥３９行目以降　検索フォームに文字を入力した時にチャットメンバー（user)リストを表示する  
インクリメンタルサーチの動きを出す部分。ajaxに関する記述は代表的なものだ。  
done(リスト表示成功時）の部分で、appendUserName関数を用いて  
userのnameを表示させている。  

## 自動更新
１）【概要】各グループごとのメッセージを、一定時間ごとにアップデートする機能。これにより、  
ページをリロードせずに、ほかのユーザーが投稿した内容も、ほぼリアルタイムで表示できるようになる。  
２）コントローラについて：  
これに関するコントローラを、webAPIとして記述（controllers/api/messages_controller.rb）。  
ブラウザからサーバへリクエストを送るのではなく、プログラムから直接リクエストを送る設定のため。  
本家のmessages_controller.rbと区別するため、class Apiという名前空間（namespace)を設定。  
下記の5行目の記述で、ajaxで送信されてくる、ユーザー自身の送信したメッセージの最後のidを定義。  
```
last_message_id = params[:id].to_i
```
下記の６行目の記述で、上記で定義したidよりも大きい値のidのメッセージ（@messagese)を定義。  

```
 @messages = group.messages.includes(:user).where("id > #{last_message_id}")
```
3)message.js について  
①２から２１行目　buildHTML関数を定義。その５行目、${message.id}にカスタムデータ属性を付ける。  
```
var html =  `<div class="message" data-id = ${message.id}>
```
このようにすることで、後の記述になるが、状況に応じて変わる最後のメッセージのidをJSで取得し易くしている。  
４行目は三項演算子。画像があれば表示、画像がなければ非表示（"")、つまり、画像が無い場合でもエラーに  
ならないようにしている。  
```
var image = message.image ? `<img src="${message.image}">` : "";
```
img src="${message.image}"について：src属性は参照先のurlを指定する。また、jbuilderで  
image.url と書いているので、ここでさらにurlは付けない（付けるとundefinedと説明される）。  
逆にjbuilderの方で.urlが無いと、urlが認識されずに空のオブジェクトとして認識されてしまう。  
②２２行目　「return html」の記述があることで、htmlで描画したビューを、ほかの関数でも使えるようなる  
（この記述を無くしてしまうと、ほかの関数内でbuildHTML関数を使った場合、該当するビューが表示されなく  
なってしまう）。  
③２４、２５行目　この部分は１００％他力。現在も意味が分からないところがある。  
メッセージの最後までメッセージ表示画面をスクロールする関数、ScrollToBottomが定義されている。  
DOM要素のmessagesが、画面全体をカバーする要素（messages/index.html.hamlの１５行目）。    
scrollTop：XXが、要素上部からのスクロール位置を表す。したがって「.animate({ scrollTop:  
500})」ならば、上部から500pxまでスクロールダウンする。任意のelement.scrollHeightで、  
elementに指定したスクロールダウン幅を表せるが、今回は$('.messages')[0].scrollHeight  
（これで最下部までスクロールダウンできる）。この最後の部分は不明であり続けている。  
なお、[0]で配列の最初の要素を取得できる、というのはわかる（rubyのarry[0]と同じ）。  
また、[ ]内を０以外の整数にするとundefined となり、一切スクロールダウンしなくなるが、  
その理由も不明である。  
```
$('.messages').animate({scrollTop: $('.messages')[0].scrollHeight});
```
④２８から５２行目  新しいメッセージを送信して、それがブラウザに表示されるまでの動きを表した記述。
ajaxを用いて新しいメッセージがサーバへ送信（３２〜３９行目）成功すれば、
４０から４５行目の処理。 ４３行目の「$('#new_message')[0].reset();」は、メッセージ入力フォームを  
空にするコード。[0]の部分が引き続き不明。これを入れないと空にならない。
また、自作アプリのインクリメンタルサーチでこれを試したが、機能しなかった。
４９、５０行目は,成功・失敗に関わらず常に実行する処理が書かれている。
Rails5では、formのsubmit実行後に、自動でdisabled属性が追加され、2回目以降の送信ができなく  
なってしまうため、これを取り除くコードを記述している。  
  
⑤５４から78行目　reloadMessagesという名称で、自動更新の関数を定義した部分。  
自動更新を行うのを、メッセージ一覧表示画面のみに限定するため、５５行目で条件設定している。
```
if (location.pathname.match(/\/groups\/\d+\/messages/)){
    last_message_id = $('.message:last').data('id');
```
location.pathnameは、現在開いているページのURLを取得・設定するメソッド。
また後続の「XX.match(正規表現）」で、XXが正規表現に一致すればXXを返す。
ここではJSのif文の（ ）内に用いて、現在開いているページが「groups/19/messages」のような
パスかどうかを真偽判定している。真（要するにメッセージ一覧ページ）ならば、{}内が実行される。

⑥　８０行目は自動更新の実行スケジュールの記述。１００００ミリ秒＝１０秒である。  
```
setInterval(reloadMessages, 10000)
```
⑦　１行目　コメントアウトしている部分。画像投稿したタイミングで自動更新が同時になされると、  
メッセージ欄にキャッシュの画像と通常の画像が同時に表示されて二重投稿されたように見えてしまうエラーが出た。  
原因を、リロード時にリロード前のキャッシュを利用するturbolinksと考え、これを解除（コメントアウト）した。  
しかし現在もなお完全に解消されていない。  
71行目に「Turbolinks.clearCache();」と記述しても、状況は変わらなかった。  

以上です。　　
