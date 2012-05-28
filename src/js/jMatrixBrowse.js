(function( $ ) {
  $.fn.jMatrixBrowse = function() {

    var _settings;
    var _api;
    var _container;
    var _content;

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

    function generateClassNameForCell(row, col) {
      return "j-matrix-browse-cell-" + "row" + row + "col" + col;
    }
    
    /**
     * Creates an empty matrix with size obtained from API and appends to content.
     */
    function generateMatrixInDom(content, container) {

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
      
      var cellWidth = Math.round(container.width()/windowSize.width);
      var cellHeight = Math.round(container.height()/windowSize.height);
      
      content.width(cellWidth*size.width);
      content.height(cellHeight*size.height);
      
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
          elem.className += " " + generateClassNameForCell(row, col);
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

      _container = elem;
      _content = $(document.createElement('div'));
      _container.append(_content);
      
      // Generate matrix content and add to DOM
      generateMatrixInDom(_content, _container);

      // TODO: Use matrix data instead of indices generated in previous step.

      // Attach EasyScroller to elem
      var scroller = new EasyScroller(_content[0]);
    }

    // Main plugin code
    $('[data-jmatrix_browser=true]').each( function() {
      init($(this));
    });
  };
})( jQuery );