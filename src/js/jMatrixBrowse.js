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
    
    var _settings;      // user Settings
    var _api;           // API object
    var _container;     // container for jMatrixBrowse
    var _content;       // content of jMatrixBrowse
    var _cellPosition;  // cell position for the component
    var _currentCell;   // currently shown cell (TODO: for now this cell is on left corner of matrix)
    var _dragContainer; // Drag container that allows dragging using jQuery UI
    var _cellElements;  // Array of array of cell elements.

    // TODO: Move to separate class.
    // Constants
    var OVERFLOW_LEFT = 1;
    var OVERFLOW_RIGHT = 2;
    var OVERFLOW_TOP = 3;
    var OVERFLOW_BOTTOM = 4;
    var OVERFLOW_NONE = -1;
    
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
    
    // TODO: Move utility functions to a separate class.
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

    function checkOverflow(element, container) {
      var containerOffset = container.offset();
      var elementOffset = element.offset();
      
      var top = elementOffset.top - containerOffset.top;
      var left = elementOffset.left - containerOffset.left;
      var width = element.width();
      var height = element.height();

      if (left > container.width()) {
        return OVERFLOW_RIGHT;
      }
      
      if (top > container.height()) {
        return OVERFLOW_BOTTOM;
      }
      
      if (top+height < 0) {
        return OVERFLOW_TOP;
      }
      
      if (left+width < 0) {
        return OVERFLOW_LEFT;
      }
      
      return OVERFLOW_NONE;
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
     * Create the drag container and make it draggable.
     * @param {jQuery Object} container - container to attacht the content to.
     * @returns {jQuery Object} dragContainer 
     */
    function createDragContainer(container) {
      var dragContainer = jQuery(document.createElement('div'));
      dragContainer.draggable({
        drag: function (event, ui) {
          dragHandler(event, ui);
        }
      });
      container.append(dragContainer);
      return dragContainer;
    }
    
    /**
     * Create the content div and append to container.
     * @param {jQuery Object} container - container to attacht the content to.
     * @returns {jQuery Object} content 
     */
    function createContentDiv(container) {
      var content = jQuery(document.createElement('div'));
      container.append(content);
      return content;
    }

    /**
     * Function that handles the drag event on dragContainer.
     * @param {Object} event - Drag event.
     * @param {Object} ui
     */
    function dragHandler (event, ui) {
      checkAndRepositionCells(event, ui);
    }
    
    /**
     * Computes the new cell coordinates when a drag results in overflow.
     * @param {Number} overflow - Type of the overflow.
     */
    function computeNewCellCoordinates(overflow) {
      switch(overflow) {
        case OVERFLOW_TOP:
          ++_currentCell.row;
          break;
          
        case OVERFLOW_BOTTOM:
          --_currentCell.row;
          break;
          
        case OVERFLOW_LEFT:
          ++_currentCell.col;
          break;
          
        case OVERFLOW_RIGHT:
          --_currentCell.col;
          break;
      }
    }
    
    /**
     * Check if the drag is valid.
     * @param {Number} overflow - Type of the overflow to check for.
     * @returns {boolean} true if the drag is valid.
     */
    function isValidDrag(overflow) {
      switch(overflow) {
        case OVERFLOW_TOP:
          if (_currentCell.row >= getMatrixSize().height-1)
            return false;
          return true;
          
        case OVERFLOW_BOTTOM:
          if (_currentCell.row <= 0) 
            return false;
          return true;
          
        case OVERFLOW_LEFT:
          if (_currentCell.col >= getMatrixSize().width-1) 
            return false;
          return true;
          
        case OVERFLOW_RIGHT:
          if (_currentCell.col <= 0) 
            return false;
          return true;
      }
    }
    
    /**
     * Check and resposition cells that are overflowing.
     * @param {Object} event - Drag event.
     * @param {Object} ui
     */
    function checkAndRepositionCells() {
      // TODO: We might need to check more elements in case of a quick drag.
      
      // Row on top might overflow from the top.
      checkAndRepositionCellRow(_cellElements, _container, 0, OVERFLOW_TOP);
      // Row on bottom might overflow from the bottom.
      checkAndRepositionCellRow(_cellElements, _container, _cellElements.length-1, OVERFLOW_BOTTOM);
      // Column on left might overflow from the left.
      checkAndRepositionCellCol(_cellElements, _container, 0, OVERFLOW_LEFT);
      // Column on right might overflow from the right.
      checkAndRepositionCellCol(_cellElements, _container, _cellElements[0].length-1, OVERFLOW_RIGHT);
    }
    
    /**
     * Checks if the given row is overflowing and repositions if necessary. 
     * @param {matrix} cellElements - The matrix of DOM objects representing cells.
     * @param {jQuery Object} container - The container against which to check the overflow.
     * @param {Number} row - Index of row to check the overflow for.
     * @param {Number} overflow - Type of the overflow to check for.
     */
    function checkAndRepositionCellRow(cellElements, container, row, overflow) {
      if (cellElements[row].length > 0 && isOverflowing(jQuery(cellElements[row][0]), container, overflow) && isValidDrag(overflow)) {
        // There is an overflow.
        computeNewCellCoordinates(overflow);
        
        var cellRow;
        switch (overflow) {
          case OVERFLOW_TOP:
            // The row is overflowing from top. Move it to bottom. 
            var height = cellElements.length;
            var lastCell = (cellElements[height-1].length > 0) ? jQuery(cellElements[height-1][0]) : undefined;
            if (lastCell === undefined) {
              console.error('Unable to resposition row ' + row + ' overflowing from top.')
              return;
            }
            // Change the position of all elements in the row.
            var newTop = lastCell.position().top + lastCell.height();
            for (var i = 0, w = cellElements[row].length; i < w; ++i) {
              jQuery(cellElements[row][i]).css({
                top: newTop
              });
            }
            
            // Move row in matrix to end
            cellRow = cellElements.splice(row,1); // Remove row at [row]
            if (cellRow.length > 0)
              cellElements.push(cellRow[0]);  // Insert row at the end.
            
            break;

          case OVERFLOW_BOTTOM:
            // The row is overflowing from bottom. Move it to top.
            var firstCell = (cellElements.length > 0 && cellElements[0].length > 0)?jQuery(cellElements[0][0]):undefined;
            if (firstCell === undefined) {
              console.error('Unable to resposition row ' + row + ' overflowing from bottom.')
              return;
            }
            // Change the position of all elements in the row.
            var newBottom = firstCell.position().top;
            for (var i = 0, w = cellElements[row].length; i < w; ++i) {
              jQuery(cellElements[row][i]).css({
                top: newBottom - jQuery(cellElements[row][i]).height()
              });
            }
            // Move row in matrix to first
            cellRow = cellElements.splice(row,1);  // Remove row at [row]
            if (cellRow.length > 0)
              cellElements.splice(0,0,cellRow[0]);  // Insert row at the beginning.
            
            break;
        }
      }
    }
    
    /**
     * Checks if the given column is overflowing and repositions if necessary. 
     * @param {matrix} cellElements - The matrix of DOM objects representing cells.
     * @param {jQuery Object} container - The container against which to check the overflow.
     * @param {Number} col - Index of column to check the overflow for.
     * @param {Number} overflow - Type of the overflow to check for.
     */
    function checkAndRepositionCellCol(cellElements, container, col, overflow) {
      if (isOverflowing(jQuery(cellElements[0][col]), container, overflow) &&  isValidDrag(overflow)) {
        // There is an overflow.
        computeNewCellCoordinates(overflow);
        
        switch (overflow) {
          case OVERFLOW_LEFT:
            // The row is overflowing from left. Move it to right. 
            if (cellElements.length <= 0 || cellElements[0].length <= 0) {
              console.error('Unable to resposition col ' + col + ' overflowing from left.');
              return;
            }
            // Change the position of all elements in the column.
            var w = cellElements[0].length;
            var lastCell = jQuery(cellElements[0][w-1]);
            var newLeft = lastCell.position().left + lastCell.width();
            for (var i = 0, h = cellElements.length; i < h; ++i) {
              jQuery(cellElements[i][col]).css({
                left: newLeft
              });
            }
            // Move col to end in matrix.
            for (var i = 0, h = cellElements.length; i < h; ++i) {
              var cell = cellElements[i].splice(col, 1); // Remove element at [i][col]
              cellElements[i].push(cell[0]); // Insert element at end of row i
            }
            break;

          case OVERFLOW_RIGHT:
            // The row is overflowing from right. Move it to left. 
            if (cellElements.length <= 0 || cellElements[0].length <= 0) {
              console.error('Unable to resposition col ' + col + ' overflowing from left.');
              return;
            }
            var firstCell = jQuery(cellElements[0][0]);
            // Change the position of all elements in the column.
            var newRight = firstCell.position().left;
            for (var i = 0, h = cellElements.length; i < h; ++i) {
              jQuery(cellElements[i][col]).css({
                left: newRight - jQuery(cellElements[i][col]).width()
              });
            }
            // Move col to first in matrix.
            for (var i = 0, h = cellElements.length; i < h; ++i) {
              var cell = cellElements[i].splice(col, 1); // Remove element at [i][col]
              cellElements[i].splice(0,0,cell[0]); // Insert element to [i][0]
            }
            break;
        }
      }
    }
    
    /**
     * Check if the given cell is overflowing the container dimensions. 
     * @param {jQuery Object} element - jQuery object for the element to be checked for overflow.
     * @param {jQuery Object} container - The container against which to check the overflow.
     * @param {Number} overflow - Type of oevrflow to check.
     * @returns true if there is an overflow. false otherwise.
     */
    function isOverflowing(element, container, overflow) {
      var containerOffset = container.offset();
      var elementOffset = element.offset();
      
      var top = elementOffset.top - containerOffset.top;
      var left = elementOffset.left - containerOffset.left;
      var width = element.width();
      var height = element.height();

      switch (overflow) {
        case OVERFLOW_LEFT:
          return (left+width < 0);
        case OVERFLOW_RIGHT:
          return (left > container.width());
        case OVERFLOW_TOP:
          return (top+height < 0);
        case OVERFLOW_BOTTOM:
          return (top > container.height());
      }
      return false;
    }

    /**
     * Creates an empty matrix with size obtained from API and appends to content.
     * @param {jQuery object} container - The element that acts as the matrix container (element that invoked jMatrixBrowse).
     * @returns {jQuery object} content where matrix is generated.
     */
    function generateInitialMatrixContent(container) {
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
      
      var content = createContentDiv(container);
      content.css({
        'position' : 'absolute',
        'top' : 0,
        'left' : 0
      });
      
      var cellHeight = _container.height()/windowSize.height;
      var cellWidth = _container.width()/windowSize.width;
      
      var windowPosition = getWindowPosition();
      
      _cellElements = [];
      // Generate matrix content for only the rows that are in the window.
      var frag = document.createDocumentFragment();
      for (var row=windowPosition.row; row < windowPosition.row+windowSize.height; row++) {
        _cellElements.push([]);
        for (var col=windowPosition.col; col < windowPosition.col + windowSize.width; col++) {
          var elem = document.createElement("div");
          elem.style.backgroundColor = row%2 + col%2 > 0 ? "#ddd" : "";
          elem.style.width = cellWidth + "px";
          elem.style.height = cellHeight + "px";
          elem.style.position = "absolute";
          elem.style.top = (row-windowPosition.row)*cellHeight + "px";
          elem.style.left = (col-windowPosition.col)*cellWidth + "px";
          elem.style.display = "inline-block";
          elem.style.textIndent = "6px";
          elem.innerHTML = row + "," + col;
          elem.className += " jMatrixBrowse-cell " + generateClassNameForCell(row, col);
          frag.appendChild(elem);
          _cellElements[row-windowPosition.row].push(elem);
        }
      }
      content.append(frag);
      return content;
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
      
      // Create draggable area and add matrix to it.
      _dragContainer = createDragContainer(_container);
      
      // Generate initial content
      _content = generateInitialMatrixContent(_dragContainer);
      
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
            // TODO: If we support named methods, the data should be extracted for the named method corresponding to current layer.
            var cellData = response.data[i][j]; 
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
