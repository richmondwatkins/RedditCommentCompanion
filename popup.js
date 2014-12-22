(function(){

var topComments = [];
var currenPostID;
var isPopUpDisplay = false;
var currentPost;

setUpHoverEvents();

function setUpHoverEvents () {
  var links = $('a.comments').toArray();

  links.forEach(function(l,i){
    var jL = $(l);

    $(jL).hover(function(e) {
       
        currentPost = jL.parent().parent().parent().parent();
        currentPost = $(currentPost);

        currentPost.mouseleave(function(){
          removePopUpFromView();
        });
      
        if ($('#pop-up').length <= 0) {

            retrieveComments(l.href, jL); 

        }else{
          removePopUpFromView();
        }
    }, function(m) {
      //mouse leave
    });
  });
}

function setUpPop (jL){

  var popUp =  $('<div id="pop-up"></div>');

  jL.parent().append(popUp);

  var imageURL = chrome.extension.getURL("smallLoader.gif");
  var loadingIMG = $('<img id="loader" src="'+imageURL+'">')

       if ($('#loader').length <= 0) {
          popUp.append(loadingIMG);
       }

  $('#pop-up').css('width', $(window).width() / 2);

  $('#pop-up').mouseleave(function() {
      removePopUpFromView();
  });
}

function retrieveComments (url, jL){
  setUpPop(jL); 

  topComments = [];
  $.ajax({
        url: url +'.json',
        dataType: 'json',
        success: function(data) {
          $('#loader').remove();
          var exitButton = $('<a id="exit-button" href="#"">X</a>');
          $('#pop-up').append(exitButton);
          exitButton.click(function(){
            removePopUpFromView();
          });

          isPopUpDisplay = true;
          currenPostID = data[0].data.children[0].data.id;
          var results = data[1].data.children;
          for (var i = 0; i <= results.length; i++) {

            if(!results[i]){
              break;
            }

            var indivComment = results[i].data;

            if (i == 10 || indivComment.link_id.indexOf(currenPostID) <= 0) {
              break;
            }else{
              var commentInfo = {
                author:  indivComment.author,
                html: indivComment.body,
                gilded: indivComment.gilded,
                votes: indivComment.ups
              };

              if (topComments.length <= 10 && containsObject(commentInfo, topComments) == false) {
                topComments.push(commentInfo);
              };
            }
          }
        formatComments(topComments);
      }
  });
   
}

function formatComments(commentsArray){
  var converter = new Showdown.converter();

    commentsArray.forEach(function(c, i){
      var commentDiv = $('<div class="comment"></div>');
      var convertedMarkdown = converter.makeHtml(c.html);
      convertedMarkdown = convertedMarkdown.replace('&gt;', '|').replace('>;', '|');

      var points;

      if (c.votes === 1) {
        points = "  point";
      }else{
        points = "  points";
      }

      commentDiv.append($('<a id="author" href="www.reddit.com/u/'+c.author+'">' + c.author +'</a><span class="votes">'+c.votes+points+'</span>'));
      commentDiv.append($('<div class="comment-text">'+convertedMarkdown+'</div>'));

      $('#pop-up').append(commentDiv);
    });
}

function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i] === obj) {
            return true;
        }
    }
    return false;
}

function removePopUpFromView (){
   if(currentPost.mouseenter()){
      currentPost.mouseleave(animateClosing());
    }else{
      animateClosing();
    }
}

function animateClosing(){
  $( "#pop-up" ).animate({
      opacity: 0,
      height: 0
    }, 100, function() {
      $('#pop-up').remove();
  });
}

checkDocumentHeight(setUpURLS);

function checkDocumentHeight(callback){
    var lastHeight = document.body.clientHeight, newHeight, timer;
    (function run(){
        newHeight = document.body.clientHeight;
        if( lastHeight != newHeight )
            callback();
        lastHeight = newHeight;
        timer = setTimeout(run, 200);
    })();
}

function setUpURLS(){
    setUpHoverEvents();
}

})();