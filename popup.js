(function(){
var converter = new Markdown.Converter();

var links = $('a.comments').toArray();

links.forEach(function(l,i){
  console.log(l);
  var moveLeft = 20;
  var moveDown = 10;
  var jL = $(l);
  $(l).hover(function(e) {
    console.log('hover');

    retrieveComments(l.href);

    var popUp =  $('<div id="pop-up">'+
      '<h3>Pop-up div Successfully Displayed</h3>'+
    '</div>');

    if ($('#pop-up').length <= 0) {
      jL.parent().append(popUp);
    }

  }, function() {
    $('#pop-up').remove();
  });
});


function retrieveComments (url){
    $.ajax(url +'.json').done(function(data){
    var results = data[1].data.children;

    var topComments = [];
    for (var i = 0; i <= results.length; i++) {
      if (i == 10) {
        break;
      }else{
        topComments.push(results[i].data.body);
      }
    }
    formatComments(topComments);
  });
}

function formatComments(commentsArray){
    commentsArray.forEach(function(c, i){
      var convertedMarkdown = converter.makeHtml(c);
      convertedMarkdown = convertedMarkdown.replace('&gt;', '|');
      console.log(convertedMarkdown);
      var jTemp = $('<p>'+convertedMarkdown+'</p>');
      $('#pop-up').append(jTemp);
    });
}


})();