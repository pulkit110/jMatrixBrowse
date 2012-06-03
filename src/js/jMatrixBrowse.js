/**
 * @fileOverview Contains the jMatrixBrowse plug-in code.
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com> 
*/

/**
 * See (http://jquery.com/).
 * @name jQuery
 * @class 
 * See the jQuery Library  (http://jquery.com/) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 */

/**
 * See (http://jquery.com/)
 * @name fn
 * @class 
 * See the jQuery Library  (http://jquery.com/) for full details.  This just
 * documents the function and classes that are added to jQuery by this plug-in.
 * @memberOf jQuery
 */
(function( jQuery ) {
  /**
   * jMatrixBrowse - a jQuery plugin to create large draggable(like Google Maps)
   * matrices. 
   *
   * @class jMatrixBrowse
   * @memberOf jQuery.fn
   */
  jQuery.fn.jMatrixBrowse = function() {

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
     * @param {String} type type of api: 'test' initializes the mockAPI
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
     * @returns {Object} size - size of the matrix. 
     * @returns {Number} size.width - width of the matrix. 
     * @returns {Number} size.height - height of the matrix.
     */
    function getMatrixSize() {
      var response = _api.getResponse({
        'row1': 0,
        'col1': 0,
        'row2': 0,
        'col2': 0
      });
      if (response)
        return response.matrix;
    }

    /** 
     * Get window size from settings. 
     * @returns {Object} size - size of the window. 
     * @returns {Number} size.width - width of the window. 
     * @returns {Number} size.height - height of the window.
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
    
    /** 
     * Get position of window. 
     * @returns {Object} position - position of the top-left corner of window. 
     * @returns {Number} position.row - row index of the position.
     * @returns {Number} position.col - column index of the position.
     */
    function getWindowPosition() {
      if (_settings && _settings.str_initialWindowPosition) {
        var  position = parsePosition(_settings.str_initialWindowPosition);
        return position;
      }
    }
    
    /** 
     * Utility function that parses a position (row,col).
     * @returns {Object} position - Object representing the position denoted by the string. 
     * @returns {Number} position.row - row index of the position.
     * @returns {Number} position.col - column index of the position.
     */
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
     * Get user defined options from data-* elements.
     * @param {jQuery object} elem - the element to retrieve the user options from. 
     * @returns {Object} options - User's options for the plugin. 
     * @returns {boolean} options.boo_jMatrixBrowser - Is jMatrixBrowse active for the container.
     * @returns {string} options.str_api - URI for the API.
     * @returns {string} options.str_initialWindowSize - comma separated (TODO: no checks performed) window size as (width, height).
     * @returns {string} options.str_initialWindowPosition - comma separated (TODO: no checks performed) window position as (row,col).
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

    /**
     * Set the settings object.
     * @param {Object} settings
     */
    function setSettings(settings) {
      _settings = settings;
    }

    /**
     * Get settings object.
     */
    function getSettings() {
      return _settings;
    }

    /**
     * Extend the user's settings with defaults.
     * @returns {Object} options - User's options for the plugin. 
     * @returns {boolean} options.boo_jMatrixBrowser - Is jMatrixBrowse active for the container.
     * @returns {string} options.str_api - URI for the API.
     * @returns {string} options.str_initialWindowSize - comma separated (TODO: no checks performed) window size as (width, height).
     * @returns {string} options.str_initialWindowPosition - comma separated (TODO: no checks performed) window position as (row,col).
     */
    function extendDefaults(options) {
      return jQuery.extend({
        str_initialWindowPosition: '0,0',
        str_initialWindowSize: '10,10'
      }, options);
    }

    /**
     * Generate class name for given cell position.
     * @param {Number} row - zero indexed row of the element.
     * @param {Number} col - zero indexed column of the element.
     * @returns {string} className - class name for the cell element.
     */
    function generateClassNameForCell(row, col) {
      return "j-matrix-browse-cell-" + "row" + row + "col" + col;
    }
    
    /**
     * Get the window end points which has given point at its top left corner. 
     * @param {Object} position - position of the cell.
     * @param {Number} position.row - row of the cell.
     * @param {Number} position.col - column of the cell.
     * @returns {Object} window - Object representing the window coordinates. 
     * @returns {Number} window.row1 - row index of the top left corner.
     * @returns {Number} window.col1 - column index of the top left corner.
     * @returns {Number} window.row2 - row index of the bottom right corner.
     * @returns {Number} window.col2 - column index of the bottom right corner.
     */
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
        row1: position.row,
        col1: position.col,
        row2: Math.min(position.row + windowSize.height, size.height),
        col2: Math.min(position.col + windowSize.width, size.width) 
      };
    }
    
    /**
     * Creates an empty matrix with size obtained from API and appends to content.
     * @param {jQuery object} content - The element that acts as the matrix content.
     * @param {jQuery object} container - The element that acts as the matrix container (parent of content).
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
      
      var windowPosition = getWindowPosition();
      
      // TODO: Idea: Generate only the visible part of matrix. 
      // Still set the content height and width of content so 
      // that Zynga scroller scrolls the other parts 
      
      // TODO: Remove hardcoded variables
      // Generate matrix content
      var frag = document.createDocumentFragment();
      for (var row=windowPosition.row; row <= windowPosition.row+windowSize.height; row++) {
        for (var col=windowPosition.col; col <= windowPosition.col + windowSize.width; col++) {
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
        elem = document.createElement("br");
        frag.appendChild(elem);
      }
      content.append(frag);
    }

    /**
     * Initialize the jMatrixBrowse.
     * @param {jQuery object} elem - the element to which to attach the jMatrixBrowse.
     */
    function init(elem) {
      // Get user options
      var options = getUserOptions(elem);

      // Extending user options with application defaults
      var settings = extendDefaults(options);
      setSettings(settings);

      // Initialize mock api
      initApi('test');

      _container = elem;
      _content = jQuery(document.createElement('div'));
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
    /**
     * Get the cell position for cell at (row,col).
     * @param {Number} row - row index of the cell.
     * @param {Number} col - column index of the cell.
     * @returns {Object} position - position of the cell. 
     * @returns {Number} position.top - top coordinate of the cell. 
     * @returns {Number} position.left - left coordinate of the cell. 
     */
    this.getCellPosition = function (row, col) {
      return jQuery('.' + generateClassNameForCell(row,col)).position();
    };
    
    /**
     * Scroll to given position. 
     * @param {Number} row - row index of the cell.
     * @param {Number} col - column index of the cell.
     */
    this.scrollTo = function (row, col) {
      _cellPosition = _self.getCellPosition(row, col);
      _currentCell = {
        row: row,
        col: col
      };
      _scroller.scroller.scrollTo(_cellPosition.left, _cellPosition.top);
    };
    
    /**
     * Reload data in the matrix for the visible window. 
     */
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
            var row = cellWindow.row1 + i;
            var col = cellWindow.col1 + j;
            jQuery('.' + generateClassNameForCell(row, col)).html(cellData);  
          }
        }
      }
    }
    
    /**
     * Main plugin function
     */
    jQuery('[data-jmatrix_browser=true]').each( function() {
      init(jQuery(this));
    });
  };
})( jQuery );
