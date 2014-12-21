(function(){

var links = $('a.comments').toArray();

links.forEach(function(l,i){
  var jL = $(l);

  $(l).hover(function(e) {
    console.log('hover');

    retrieveComments(l.href);

    var popUp =  $('<div id="pop-up">'+
      '<h3>Pop-up div Successfully Displayed</h3>'+
    '</div>');

    if ($('#pop-up').length <= 0) {
      jL.parent().append(popUp);
    }else{
      topComments = [];
      $('#pop-up').remove();
    }

  }, function(m) {
    console.log(m);
    // $('#pop-up').remove();
  });
});

var topComments = [];

function retrieveComments (url){
    $.ajax(url +'.json').done(function(data){
    var results = data[1].data.children;

    for (var i = 0; i <= results.length; i++) {
      if (i == 10) {
        break;
      }else{
        // console.log(results[i].data);
        var indivComment = results[i].data;

        var commentInfo = {
          author:  indivComment.author,
          html: indivComment.body,
          gilded: indivComment.gilded,
          votes: indivComment.ups
        };
        topComments.push(commentInfo);
      }
    }
    formatComments(topComments);
  });
}

function formatComments(commentsArray){
  var converter = new Markdown.Converter();

    commentsArray.forEach(function(c, i){
      var commentDiv = $('<div #comment-container></div>');
      var convertedMarkdown = converter.makeHtml(c.html);
      convertedMarkdown = convertedMarkdown.replace('&gt;', '|');

      commentDiv.append($('<a id="author" href="www.reddit.com/u/'+c.author+'">' + c.author + '   </a><span>'+c.votes+' points</span>'));
      commentDiv.append($('<p>'+convertedMarkdown+'</p>'));

      // console.log(convertedMarkdown);
      $('#pop-up').append(commentDiv);
    });
}



})();