$(document).on('turbolinks:load',function(){
  var search_list = $(".chat-group-form__search.clearfix);  
  function appendUser(user){
    var html = `<div class="chat-group-form__search.clearfix">
                  <input class="chat-group-form__input" id="user-search-field">
                  </input>
                  <div id="user-search-result">
                  </div>
                </div>`
                search_list.append(html);
  }
  function appendErrMsgToHTML(msg){
    var html = `<div class="chat-group-form__search.clearfix">
                  <input class="chat-group-form__input" id="user-search-field">
                  </input>
                  <div id="user-search-result">${msg}
                  </div>
                </div>`
           search_list.append(html);
  }              
  
  $(".chat-group-form__input").on("keyup", function() {
      var input = $("#user-search-result").val();
  
      $.ajax({
        type: 'GET',
        url: '/users',
        data: { keyword: input },
        dataType: 'json'
      })
  
      .done(function(users) {
        if (input.length === 0) {
          $('#user-search-result').empty();
              }
        elsif(input.length ==! 0){
          users.forEach(function(user){
            appendUser(user)
          });
        }
        else{
          $("#user-search-result").empty();
          appendErrMsgToHTML("一致するユーザーは見つかりません");
        }
      })
      .fail(function() {
        alert('ユーザー検索に失敗しました');
      })
    });
  });