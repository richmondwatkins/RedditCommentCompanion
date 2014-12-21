(function(){

var topComments = [];
var currenPostID;
var isPopUpDisplay = false;
var mouseInPopUp = false;
var currentPostCSS;
var timer; 
console.log('working');

setUpHoverEvents();

function setUpHoverEvents () {
  var links = $('a.comments').toArray();

  links.forEach(function(l,i){
    var jL = $(l);

    $(l).hover(function(e) {
  
      var imageURL = chrome.extension.getURL("smallLoader.gif");
      var loadingIMG = $('<img id="loader" src="'+imageURL+'">')

       if ($('#loader').length <= 0) {
          jL.append(loadingIMG);
       }

        currentPostCSS = jL.parent().parent().parent().parent();
        currentPostCSS = $(currentPostCSS);

        currentPostCSS.mouseleave(function(){
          removePopUpFromView();
        });
      
        if ($('#pop-up').length <= 0) {

          if (isPopUpDisplay == false) {
            retrieveComments(l.href, jL); 
          }

        }else{
          removePopUpFromView();
        }
    }, function(m) {
      // if (!mouseInPopUp) {
      //   $('#pop-up').remove();
      // }
    });
  });
}

function setUpPop (jL){

  var popUp =  $('<div id="pop-up"></div>');

  $("#pop-upt").animate({
         height: 0,
      }, {
          duration: 300
    });
  jL.parent().append(popUp);
  $('#loader').remove();
  $('#pop-up').css('width', $(window).width() / 2);

    $('#pop-up').mouseenter(function() {
        mouseInPopUp = true;
      
      }).mouseleave(function() {
        mouseInPopUp = false;

        removePopUpFromView();
    });
}

function retrieveComments (url, jL){
  console.log(url +'.json');
  topComments = [];
  $.ajax({
        url: url +'.json',
        dataType: 'json',
        success: function(data) {
          isPopUpDisplay = true;

          setUpPop(jL); 

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

      commentDiv.append($('<a id="author" href="www.reddit.com/u/'+c.author+'">' + c.author +'</a><span class="votes">'+c.votes+' points</span>'));
      commentDiv.append($('<div class="comment-text">'+convertedMarkdown+'</div>'));

      // console.log(convertedMarkdown);
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
   if(currentPostCSS.mouseenter()){
      console.log('left popup entered upper');
      currentPostCSS.mouseleave(animateClosing());
    }else{
      console.log('getting ready to close');
      animateClosing();
    }

}

function animateClosing(){
     $("#pop-upt").animate({
         height: 0,
      }, {
          duration: 300
    });

    $('#pop-up').fadeOut(function(){
        topComments = [];
        $('#pop-up').remove();
        isPopUpDisplay = false;
        $('#loader').remove();
    });
}

checkDocumentHeight(doSomthing);

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

function doSomthing(){
    console.log('height changed');
    setUpHoverEvents();
}

})();