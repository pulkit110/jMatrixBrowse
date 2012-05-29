(function( $ ) {
  $.fn.jMatrixBrowse = function() {

    var _self = this;
    
    var _settings;     // user Settings
    var _api;          // API object
    var _container;    // container for jMatrixBrowse
    var _content;      // content of jMatrixBrowse
    var _scroller;     // scroller object used for browsing
    var _cellPosition; // cell position for the component
    var _currentCell;  // currently shown cell (TODO: for now this cell is on left corner of matrix)

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
        var  position = parsePosition(_settings.str_initialWindowSize);
        return {
          height: position.row,
          width: position.col
        };
      }
    }
    
    function getWindowPosition() {
      if (_settings && _settings.str_initialWindowPosition) {
        var  position = parsePosition(_settings.str_initialWindowPosition);
        return position;
      }
    }
    
    // Utils
    function parsePosition(str_position) {
      var arr_position = str_position.split(',');
      if (arr_position.length == 2) {
        return {
          row: parseInt(arr_position[0]),
          col: parseInt(arr_position[1])
        };
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
    
    function getCellWindow(position) {
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
      
      return obj_cellWindow = {
        x1: position.row,
        y1: position.col,
        x2: Math.min(position.row + windowSize.height, size.height),
        y2: Math.min(position.col + windowSize.width, size.width) 
      };
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
      
      var w = container.width();
      var h = container.height();
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

      // Attach EasyScroller to elem
      _scroller = new EasyScroller(_content[0]);
      
      // TODO: Use matrix data instead of indices generated in previous step.
      
      // Scroll to the initial position
      var windowPosition = getWindowPosition();
      _self.scrollTo(windowPosition.row, windowPosition.col);

      // Load data
      _self.reloadData();
    }

    //Public API
    
    //TODO: Might not work when more than one jMatrixBrowse on the same page. 
    this.getCellPosition = function (row, col) {
      return $('.' + generateClassNameForCell(row,col)).position();
    };
    
    this.scrollTo = function (row, col) {
      _cellPosition = _self.getCellPosition(row, col);
      _currentCell = {
        row: row,
        col: col
      };
      _scroller.scroller.scrollTo(_cellPosition.left, _cellPosition.top);
    };
    
    this.reloadData = function() {
      var cellWindow = getCellWindow(_currentCell);
      if (cellWindow == undefined) {
        console.error('Unable to get cell window.');
        return;
      }
      var response = _api.getResponse(cellWindow);
      
      if (response && response.data) {
        for (var i = 0; i < response.data.length; ++i) {
          for (var j = 0; j < response.data[i].length; ++j) {
            var cellData = response.data[i][j]; // TODO: If we support named methods, the data should be extracted for the named method corresponding to current layer.
            var row = cellWindow.x1 + i;
            var col = cellWindow.y1 + j;
            $('.' + generateClassNameForCell(row, col)).html(cellData);  
          }
        }
      }
    }
    
    // Main plugin code
    $('[data-jmatrix_browser=true]').each( function() {
      init($(this));
    });
  };
})( jQuery );