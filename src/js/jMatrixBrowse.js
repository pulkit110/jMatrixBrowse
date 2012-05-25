(function( $ ) {
  $.fn.jMatrixBrowse = function() {
    
    var _settings;
    
    function getUserOptions(elem) {
      
      var options = {
        boo_jMatrixBrowser: (elem.attr('data-jmatrix_browser') === 'true'),
        str_api: elem.attr('data-api'),
        str_initialWindowSize: elem.attr('data-initial-window-size'),
        str_initialWindowPosition: elem.attr('data-initial-window-position')
      };
      
      return options;
      
    }
    
    function setSettings(settings) {
      _settings = settings;
    }
    
    function getSettings() {
      return _settings;
    }
    
    function extendDefaults(options) {
      return $.extend({
        str_initialWindowPosition: '0,0',
        str_initialWindowSize: '10,10'
      }, options);
    }
    
    function generateMatrixZynga(content) {
      
      // Settings
      var contentWidth = 2000;
      var contentHeight = 2000;
      var cellWidth = 100;
      var cellHeight = 100;

      // Generate content
      var size = 100;
      var frag = document.createDocumentFragment();
      for (var row=0, rl=contentHeight/size; row<rl; row++) {
        for (var col=0, cl=contentWidth/size; col<cl; col++) {
          elem = document.createElement("div");
          elem.style.backgroundColor = row%2 + col%2 > 0 ? "#ddd" : "";
          elem.style.width = cellWidth + "px";
          elem.style.height = cellHeight + "px";
          elem.style.display = "inline-block";
          elem.style.textIndent = "6px";
          elem.innerHTML = row + "," + col;
          frag.appendChild(elem);
        }
      }
      content.append(frag);
    }
    
    function init(elem) {
      // Get user options
      var options = getUserOptions(elem);

      // Create some defaults, extending them with any options that were provided
      var settings = extendDefaults(options);
      setSettings(settings);
      
      // Generate matrix using Zynga Scroller
      generateMatrixZynga(elem);
      
      // Attach EasyScroller to elem
      var scroller = new EasyScroller(elem[0]);  
    }
    
    // Main plugin code
    $('[data-jmatrix_browser=true]').each( function() {
      init($(this));
    });
  };
})( jQuery );