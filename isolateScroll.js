var trapScroll;

(function($){  
  
  trapScroll = function(opt){
    
    var trapElement;
    var scrollableDist;
    var trapClassName = 'trapScroll-enabled';
    var trapSelector = '.trapScroll';
    
    var trapWheel = function(e){
      
      if (!$('body').hasClass(trapClassName)) {
        
        return;
        
      } else {  
        
        var curScrollPos = trapElement.scrollTop();
        var wheelEvent = e.originalEvent;
        var dY = wheelEvent.deltaY;

        // only trap events once we've scrolled to the end
        // or beginning
        if ((dY>0 && curScrollPos >= scrollableDist) ||
            (dY<0 && curScrollPos <= 0)) {

          opt.onScrollEnd();
          return false;
          
        }
        
      }
      
    }
    
    $(document)
      .on('wheel', trapWheel)
      .on('mouseleave', trapSelector, function(){
        
        $('body').removeClass(trapClassName);
      
      })
      .on('mouseenter', trapSelector, function(){   
      
        trapElement = $(this);
        var containerHeight = trapElement.outerHeight();
        var contentHeight = trapElement[0].scrollHeight; // height of scrollable content
        scrollableDist = contentHeight - containerHeight;
        
        if (contentHeight>containerHeight)
          $('body').addClass(trapClassName); 
      
      });       
  } 
  
})($);

var preventedCount = 0;
var showEventPreventedMsg = function(){  
  $('#mousewheel-prevented').stop().animate({opacity: 1}, 'fast');
}
var hideEventPreventedMsg = function(){
  $('#mousewheel-prevented').stop().animate({opacity: 0}, 'fast');
}
var addPreventedCount = function(){
  $('#prevented-count').html('prevented <small>x</small>' + preventedCount++);
}

trapScroll({ onScrollEnd: addPreventedCount });
$('.trapScroll')
  .on('mouseenter', showEventPreventedMsg)
  .on('mouseleave', hideEventPreventedMsg);      
$('[id*="parent"]').scrollTop(100);