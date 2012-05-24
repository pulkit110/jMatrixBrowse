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
    
    function init(elem) {
      // Get user options
      var options = getUserOptions(elem);

      // Create some defaults, extending them with any options that were provided
      var settings = extendDefaults(options);
      setSettings(settings);
      
    }
    
    // Main plugin code
    $('[data-jmatrix_browser=true]').each( function() {
      init($(this));
    });
  };
})( jQuery );