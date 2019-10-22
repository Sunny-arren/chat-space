$(document).on('turbolinks:load', function(){
  function buildHTML(message){
    var image = message.image ? `<img src="${message.image}">` : "";
    var html =  `<div class="message" data-id = ${message.id}>
                  <div class="upper-message">
                    <div class="upper-message__user-name">
                      ${ message.user_name }
                    </div>
                    <div class="upper-message__date">
                      ${ message.created_at}
                    </div>
                  </div>
                  <div class="lower-message">
                      <p class="lower-message__content">
                        ${ message.content }
                      </p>
                      ${ image }
                  </div>
                </div>`
  return html;
  }

  function ScrollToBottom(){
    $('.messages').animate({scrollTop: $('.messages')[0].scrollHeight});
  }

  $('#new_message').on('submit', function(e){
    e.preventDefault();
    var formData = new FormData(this);
    var url = $(this).attr('action')
    $.ajax({
      url: url,
      type: "POST",
      data: formData,
      dataType: 'json',
      processData: false,
      contentType: false
  })
  .done(function(data){
    var html = buildHTML(data);
    $('.messages').append(html);
    $('#new_message')[0].reset();
    ScrollToBottom()
  })
  .fail(function(){
    alert('error');
  })
  .always(function(){
   $('.form__submit').removeAttr('disabled');
  })
 })

  var reloadMessages = function() {
   if (location.pathname.match(/\/groups\/\d+\/messages/)){
    last_message_id = $('.message:last').data('id');
    console.log(last_message_id)
    $.ajax({
    url: 'api/messages',
    type: 'GET',
    dataType: 'json',
    data: {id: last_message_id}
    })
  
 
  .done(function(messages) {
    var insertHTML = '';
    console.log(messages)
    messages.forEach(function(message) {
    insertHTML += buildHTML(message);
    $('.messages').append(insertHTML);
    ScrollToBottom()
   })
  })
  .fail(function() {
    alert('error');
  });
  }
 }
  setInterval(reloadMessages, 8000)
})