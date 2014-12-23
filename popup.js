(function(){

var topComments = [];
var currenPostID;
var isPopUpDisplay = false;
var currentPost;
var links;
var results;

setUpHoverEvents();

function setUpHoverEvents () {
  links = $('a.comments').toArray();

  links.forEach(function(l,i){
    $(l).unbind();
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
          $('.comment').remove();
          $('#pop-up').css('width', $(window).width() - $(window).width() * 0.25);

          var exitButton = $('<a id="exit-button" href="#"">X</a>');
          $('#pop-up').append(exitButton);

          exitButton.click(function(e){
            removePopUpFromView();
            e.preventDefault();
          });

          isPopUpDisplay = true;
          currenPostID = data[0].data.children[0].data.id;

          var postPermalink = data[0].data.children[0].data.permalink;
          var author = data[0].data.children[0].data.author;

          results = data[1].data.children;

          for (var i = 0; i <= results.length; i++) {

            if(!results[i]){
              break;
            }

            var indivComment = results[i].data;
            
            if (topComments.length === 10 || indivComment.link_id.indexOf(currenPostID) <= 0) {
              console.log('BREAK')
              break;
            }else{
              var commentInfo = {
                author:  indivComment.author,
                html: indivComment.body,
                gilded: indivComment.gilded,
                votes: indivComment.ups,
                isOP: false,
                permalink: postPermalink + indivComment.id
              }

              if (author === indivComment.author) {
                commentInfo.isOP = true;
              }

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

      if (c.isOP) {
        commentDiv.append($('<a class="author" id="op" href="www.reddit.com/u/'+c.author+'">' + c.author +'</a><span class="votes">'+c.votes+points+'</span>'));
      }else{
        commentDiv.append($('<a id="author" href="www.reddit.com/u/'+c.author+'">' + c.author +'</a><span class="votes">'+c.votes+points+'</span>'));
      }
      commentDiv.append($('<div class="comment-text">'+convertedMarkdown+'</div>'));
      commentDiv.append($('<a class="permalink" href="'+c.permalink+'">View Thread</a>'));

      $('#pop-up').append(commentDiv);
    });

    $('.comment-text').linkify();
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
  topComments = [];
  results = [];
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