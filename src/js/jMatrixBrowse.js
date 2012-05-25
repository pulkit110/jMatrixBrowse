(function( $ ) {
  $.fn.jMatrixBrowse = function() {

    var _settings;
    var _api = null;

    /**
     * Initialize the API
     * @param type type of api: 'test' initializes the mockAPI
     */
    function initApi(type) {
      if (type === 'test') {
        _api = new MockApi();
      } else {
        console.error('API ' + type + 'not yet supported.');
      }
    }

    /**
     * Get matrix size from api. 
     * @return size of the matrix
     */
    function getMatrixSize() {
      var response = _api.getResponse({
        'x1': 0,
        'y1': 0,
        'x2': 0,
        'y2': 0
      });
      if (response)
        return response.matrix;
    }

    /** 
     * Get window size from settings. 
     */
    function getWindowSize() {
      if (_settings && _settings.str_initialWindowSize) {
        var arr_size = _settings.str_initialWindowSize.split(',');
        if (arr_size.length == 2) {
          return {
            height: parseInt(arr_size[0]),
            width: parseInt(arr_size[1])
          };
        }
      }
    }
    
    /**
     * Get user defined options from data-* elements
     */
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

    function generateMatrixInDom(content) {

      var size = getMatrixSize();
      if (size == undefined) {
        console.error("Unable to get matrix size");
        return;
      }
      
      var windowSize = getWindowSize();
      if (windowSize == undefined) {
        console.error("Unable to get window size");
        return;
      }
      
      // Define cell width and height according to window size and content width and height
      var cellWidth = content.width()/windowSize.width;
      var cellHeight = content.height()/windowSize.height;
      
      // TODO: Remove hardcoded variables
      // Generate matrix content
      var frag = document.createDocumentFragment();
      for (var row=0; row < size.height; row++) {
        for (var col=0; col < size.width; col++) {
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

      // Extending user options with application defaults
      var settings = extendDefaults(options);
      setSettings(settings);

      // Initialize mock api
      initApi('test');

      // Generate matrix content and add to DOM
      generateMatrixInDom(elem);

      // TODO: Use matrix data instead of indices generated in previous step.
      // TODO: Idea: Create empty cells for other windows and when scroller is dragged there, load data into those empty cells

      // Attach EasyScroller to elem
      var scroller = new EasyScroller(elem[0]);
    }

    // Main plugin code
    $('[data-jmatrix_browser=true]').each( function() {
      init($(this));
    });
  };
})( jQuery );