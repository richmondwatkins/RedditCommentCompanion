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
      $(jL).hoverIntent(function(e) {
          currentPost = jL.parent().parent().parent().parent();
          currentPost = $(currentPost);
          currenPostID = currentPost.data('fullname');

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
          $('#pop-up').css('width', $(window).width() /2);
          $('#pop-up').css('height', $(window).height() /2);

          if ($('.exit-button').length <= 0) {
            var exitButton = $('<a class="exit-button" href="#"">X</a>');
            $('#pop-up').append(exitButton);

            exitButton.click(function(e){
              removePopUpFromView();
              e.preventDefault();
            });
          }

          isPopUpDisplay = true;

          var postResponseID = data[0].data.children[0].data.name;

          var postPermalink = data[0].data.children[0].data.permalink;
          var author = data[0].data.children[0].data.author;

          results = data[1].data.children;

          for (var i = 0; i <= results.length; i++) {

            if(!results[i]){
              break;
            }

            var indivComment = results[i].data;

            if (topComments.length === 10 || postResponseID !== currenPostID) {
              // console.log('BREAK')
              break;
            }else{

              var firstReply 
              if (indivComment.replies) {
                firstReply = indivComment.replies.data.children[0].data;
                firstReply = {
                  author: firstReply.author,
                  html : firstReply.body,
                  gilded: firstReply.gilded,
                  votes: firstReply.ups,
                  isOP: false,
                  peermalink: postPermalink + firstReply.id
                }
              }else{
                firstReply = null;
              }

              var commentInfo = {
                author:  indivComment.author,
                html: indivComment.body,
                gilded: indivComment.gilded,
                votes: indivComment.ups,
                isOP: false,
                permalink: postPermalink + indivComment.id,
                firstReply: firstReply
              }

              if (author === indivComment.author) {
                commentInfo.isOP = true;
              }

              if (firstReply) {
                if (firstReply.author === author) {
                  firstReply.isOP = true;
                }
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

      var parentComment = createComment(c, false);
      if (c.firstReply) {
        var childComment = createComment(c.firstReply, true);
        parentComment.append(childComment);
        parentComment.append($('<a class="permalink" href="'+c.permalink+'">View Thread</a>'));
      }

      $('#pop-up').append(parentComment);
    });

    var exitButton = $('<a class="exit-button" href="#"">X</a>');
            $('#pop-up').append(exitButton);

    exitButton.click(function(e){
      removePopUpFromView();
      e.preventDefault();
    });
    
    $('.comment-text').linkify();
}

function createComment(c, isChild){
  var converter = new Showdown.converter();
  var commentDiv;

  if (isChild) {
    commentDiv = $('<div class="comment" id="child-comment"></div>');
  }else{
    commentDiv = $('<div class="comment"></div>');
    var imageURL = chrome.extension.getURL("minus.png");
    var minusImg = $('<a href="#"><img class="minus" src="'+imageURL+'"></a>');
    minusImg.on('click', function(e){
      collapseComment(commentDiv);
      minusImg.unbind();
      e.stopPropagation();
    });
    commentDiv.append(minusImg);
  }
  var convertedMarkdown = converter.makeHtml(c.html);
  convertedMarkdown = convertedMarkdown.replace('&gt;', '|').replace('>;', '|');

  var points;

  if (c.votes === 1) {
    points = "  point";
  }else{
    points = "  points";
  }

  if (c.isOP) {
    commentDiv.append($('<a class="author" id="op" href="/u/'+c.author+'">' + c.author +'</a><span class="votes">'+c.votes+points+'</span>'));
  }else{
    commentDiv.append($('<a id="author" href="/u/'+c.author+'">' + c.author +'</a><span class="votes">'+c.votes+points+'</span>'));
  }
  commentDiv.append($('<div class="comment-text">'+convertedMarkdown+'</div>')); 

  return commentDiv;
}

function collapseComment(comment){
  console.log('collapsing');
  var minusImage = $(comment.children('a').children('img')[0]);
  var plusURL = chrome.extension.getURL("plus.png");

  var permalink = $(comment.children('.permalink'));
  permalink.css('visibility', 'hidden');

  console.log(permalink);
  minusImage.attr('src', plusURL);

  minusImage.on('click', function(e){
    expandComment(comment);
    minusImage.unbind();
    e.stopPropagation();
  })

  var commentText = comment.children('div').toArray();
  commentText.forEach(function(t, i){
    t = $(t);

     t.css('visibility', 'hidden');
  });

  comment.css('height', '10px');
}

function expandComment(comment){
  var plusImage = $(comment.children('a').children('img')[0]);
  plusImage.unbind();
  aTag = $(comment.children('a')[0]);

  var permalink = $(comment.children('.permalink'));
  permalink.css('visibility', 'visible');
  
  var minusURL = chrome.extension.getURL("minus.png");
   
  var commentText = comment.children('div').toArray();

  commentText.forEach(function(t, i){
    t = $(t);
     t.css('visibility', 'visible');
  });
  comment.css('height', 'auto');
  console.log(aTag);
  plusImage.attr('src', minusURL);

  aTag.on('click',function(e){
    e.stopPropagation();
    console.log('clicky');
    collapseComment(comment);
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