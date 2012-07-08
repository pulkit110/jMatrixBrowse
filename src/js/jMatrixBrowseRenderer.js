/**
 * @fileOverview Contains the jMatrixBrowse rendering code.
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

var jMatrixBrowseNs = jMatrixBrowseNs || {};

(function (jQuery, jMatrixBrowseNS) {

  var _container;     // container for jMatrixBrowse
  var _dragContainer; // Drag container that allows dragging using jQuery UI
  var _cellElements;  // Array of array of cell elements.
  var _headers;       // row and column headers.
  var _content;       // content of jMatrixBrowse
  var _cellPosition;  // cell position for the component
  var _elem;          // container that initiated jMatrixBrowse
  var _configuration; // configuration for the current instance of jMatrixBrowse
  var _api;           // api manager
  var _self;          // reference to self
  var _dragActive = false;  // boolean to indicate if drag is active

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
   * Generate class name for given cell position.
   * @param {Number} row - zero indexed row of the element.
   * @param {Number} col - zero indexed column of the element.
   * @returns {string} className - class name for the cell element.
   */
  function generateClassNameForCell(row, col) {
    return "j-matrix-browse-cell-" + "row" + row + "col" + col;
  }

  /**
   * Create the row and column header containers. 
   * @param {jQuery Object} container - container to attach the content to.
   * @returns {Object} headersContainer - hash containing column and row containers.
   * @returns {jQuery Object} headersContainer.row - row container.
   * @returns {jQuery Object} headersContainer.col - column container.
   */
  function createRowColumnHeaderContainer(container) {
    var colHeaderContainer = jQuery(document.createElement('div'));
    colHeaderContainer.css({
      width: '90%',
      height: '10%',
      top: '0px',
      right: '0px',
      'background-color': 'red',
      position: 'absolute',
      overflow: 'hidden'
    });
    colHeaderContainer.addClass(jMatrixBrowseNs.Constants.CLASS_BASE + '-col-header');
    container.append(colHeaderContainer);

    var rowHeaderContainer = jQuery(document.createElement('div'));
    rowHeaderContainer.css({
      width: '10%',
      height: '90%',
      bottom: '0px',
      'background-color': 'green',
      'float': 'left',
      position: 'absolute',
      overflow: 'hidden'
    });
    rowHeaderContainer.addClass(jMatrixBrowseNs.Constants.CLASS_BASE + '-row-header');
    container.append(rowHeaderContainer);

    return {
      row: rowHeaderContainer,
      col: colHeaderContainer
    };
  }

  /**
   * Create the drag container and make it draggable.
   * @param {jQuery Object} container - container to attach the content to.
   * @returns {Object} coantiners
   * @returns {jQuery Object} coantiners.conatiner coantiner containing matrix content
   * @returns {jQuery Object} coantiners.dragConatiner dragCoantiner containing matrix content
   */
  function createDragContainer(container) {
    var dragContainerContainer = jQuery(document.createElement('div'));
    dragContainerContainer.css({
      'float': 'left',
      width: '90%',
      height: '90%',
      bottom: '0px',
      right: '0px',
      position: 'absolute',
      'overflow': 'hidden'
    }); 
    dragContainerContainer.addClass(jMatrixBrowseNs.Constants.CLASS_BASE+'-drag-container-container');
    container.append(dragContainerContainer);

    var dragContainer = jQuery(document.createElement('div'));
    dragContainer.draggable({
      drag: function (event, ui) {
        dragHandler(event, ui);
      }, 
      start: function (event, ui) {
        _dragActive = true;
        dragStartHandler(event, ui);
      }, 
      stop: function (event, ui) {
        dragStopHandler(event, ui);
      }
    });
    dragContainer.addClass(jMatrixBrowseNs.Constants.CLASS_BASE+'-drag-container');
    dragContainerContainer.append(dragContainer);

    return {
      dragContainer: dragContainer,
      container: dragContainerContainer
    };
  }

  /**
   * Function that handles the click event on cell elements.
   * @param {jQuery Object} elem - Element that triggered the click event
   * @param {Object} event - Click event.
   */
  function cellClickHandler(elem, event) {
    event.type = 'jMatrixBrowseClick';
    event.row = elem.attr('data-row');
    event.col = elem.attr('data-col');
    console.log(event);
    _elem.trigger(event);
  }
  
  /**
   * Function that handles the drag event on dragContainer.
   * @param {Object} event - Drag event.
   * @param {Object} ui
   */
  function dragHandler (event, ui) {
    event.type = 'jMatrixBrowseDrag';
    _elem.trigger(event);
  }

  /**
   * Function that handles the drag start event on dragContainer.
   * @param {Object} event - Drag event.
   * @param {Object} ui
   */
  function dragStartHandler (event, ui) {
    event.type = 'jMatrixBrowseDragStart';
    _elem.trigger(event);
  }

  /**
   * Function that handles the drag stop event on dragContainer.
   * @param {Object} event - Drag event.
   * @param {Object} ui
   */
  function dragStopHandler (event, ui) {
    event.type = 'jMatrixBrowseDragStop';
    _elem.trigger(event);
  }
    
  /**
   * Creates an empty matrix with size obtained from API and appends to content.
   * @param {jQuery object} container - The element that acts as the matrix container (element that invoked jMatrixBrowse).
   * @returns {jQuery object} content where matrix is generated.
   */
  function generateInitialMatrixContent (container) {
    var size = _api.getMatrixSize();
    if (size == undefined) {
      console.error("Unable to get matrix size");
      return null;
    }
      
    var windowSize = _configuration.getWindowSize();
    if (windowSize == undefined) {
      console.error("Unable to get window size");
      return null;
    }
      
    var content = createContentDiv(container);
    content.css({
      'position' : 'absolute',
      'top' : 0,
      'left' : 0
    });
      
    var cellHeight = _container.height()/windowSize.height;
    var cellWidth = _container.width()/windowSize.width;
      
    var windowPosition = _configuration.getWindowPosition();
      
    _cellElements = [];
    var height = windowSize.height + 2*_configuration.getNumberOfBackgroundCells();
    var width = windowSize.width + 2*_configuration.getNumberOfBackgroundCells(); // TODO: Get number of background cells
    var rowBegin = Math.max(0, windowPosition.row - _configuration.getNumberOfBackgroundCells());
    var colBegin = Math.max(0, windowPosition.col - _configuration.getNumberOfBackgroundCells());
      
    // Generate matrix content for only the rows that are in the window.
    var frag = document.createDocumentFragment();
    for (var row= rowBegin; row < rowBegin + height; row++) {
      _cellElements.push([]);
      for (var col = colBegin; col < colBegin + width; col++) {
        // Create cell and set style
        var elem = document.createElement("div");
        elem.style.backgroundColor = row%2 + col%2 > 0 ? "#ddd" : "whitesmoke";
        elem.style.width = cellWidth + "px";
        elem.style.height = cellHeight + "px";
        elem.style.position = "absolute";
        elem.style.top = (row-rowBegin-_configuration.getNumberOfBackgroundCells())*cellHeight + "px";
        elem.style.left = (col-colBegin-_configuration.getNumberOfBackgroundCells())*cellWidth + "px";
        elem.style.display = "inline-block";
        elem.style.textIndent = "6px";
        elem.innerHTML = row + "," + col;
        elem.className += " jMatrixBrowse-cell " + generateClassNameForCell(row, col);
        
        // Add data-row and data-col to cell
        jQuery(elem).attr('data-row', row);
        jQuery(elem).attr('data-col', col);
        
        // Append cell to fragment
        frag.appendChild(elem);
        _cellElements[row-rowBegin].push(elem);
      }
    }    
    content.append(frag);
    
    // Associate click handler with cell
    jQuery('.jMatrixBrowse-cell').click(function(event) {
      // Trigger click only when click is not for drag
      if (!_dragActive) {
        cellClickHandler(jQuery(this), event);
      } else {
        // Click was triggered due to drag. 
        _dragActive = false;
      }
    });
    
    return content;
  }

  /**
   * Creates an empty matrix with size obtained from API and appends to content.
   * @param {jQuery object} headers - header containers.
   */
  function generateRowColumnHeaders(headers) {
    generateRowHeaders(headers.row);
    generateColHeaders(headers.col);
  }
    
  /**
   * Generates elements and appends them to row header container. 
   * @param {jQuery object} header - row header container.
   */
  function generateRowHeaders(header) {  
    var rowHeaders = _api.getRowHeadersFromTopRow(_self.currentCell.row-_configuration.getNumberOfBackgroundCells());
    var frag = document.createDocumentFragment();
    for (var row = 0, nRows = rowHeaders.length; row < nRows; ++row) {
      var cellElement = jQuery(_cellElements[row][0]);
      var elem = jQuery(document.createElement("div"));
      elem.addClass(jMatrixBrowseNs.Constants.CLASS_BASE+'-row-header-cell');
      var css = {
        width: '100%',
        height: cellElement.height(),
        top: cellElement.position().top,
        left: 0,
        position: 'absolute'
      };
      elem.css(css);
      elem.html(rowHeaders[row]);
      frag.appendChild(elem[0]);
    }
    header.append(frag);
  }
    
  /**
   * Generates elements and appends them to column header container. 
   * @param {jQuery object} header - column header container.
   */
  function generateColHeaders(header) {
    var colHeaders = _api.getColHeadersFromLeftCol(_self.currentCell.col-_configuration.getNumberOfBackgroundCells());
    var frag = document.createDocumentFragment();
    for (var col = 0, nCols = colHeaders.length; col < nCols; ++col) {
      var cellElement = jQuery(_cellElements[0][col]);
      var elem = jQuery(document.createElement("div"));
      elem.addClass(jMatrixBrowseNs.Constants.CLASS_BASE+'-col-header-cell');
      var css = {
        width: cellElement.width(),
        height: '100%',
        left: cellElement.position().left,
        top: 0,
        position: 'absolute'
      };
      elem.css(css);
      elem.html(colHeaders[col]);
      frag.appendChild(elem[0]);
    }
    header.append(frag);
  }
  
  //TODO: Might not work when more than one jMatrixBrowse on the same page. 
  /**
    * Get the cell position for cell at (row,col).
    * @param {Number} row - row index of the cell.
    * @param {Number} col - column index of the cell.
    * @returns {Object} position - position of the cell. 
    * @returns {Number} position.top - top coordinate of the cell. 
    * @returns {Number} position.left - left coordinate of the cell. 
    */
  function getCellPosition(row, col) {
    return jQuery('.' + generateClassNameForCell(row,col)).position();
  }
    
  /**
    * Scroll to given position. 
    * @param {Number} row - row index of the cell.
    * @param {Number} col - column index of the cell.
    */
  function scrollTo (row, col) {
    _cellPosition = getCellPosition(row, col);
    _self.currentCell = {
      row: row,
      col: col
    };
  };
  
  /**
   * Checks if the bounds for scrolling matrix are valid.
   * @param  {string} direction direction of scroll
   * @return {boolean} true if the bounds are valid. false otherwise.
   */
  function checkScrollBounds(direction) {
    var size = _api.getMatrixSize();
    if (direction === 'up' && _self.currentCell.row <= 0) {
      return false;
    }
    if (direction === 'down' && _self.currentCell.row + _cellElements.length - 2*_configuration.getNumberOfBackgroundCells() > size.height - 1) {
      return false;
    }
    if (direction === 'right' && _self.currentCell.col + _cellElements[0].length - 2*_configuration.getNumberOfBackgroundCells() > size.width - 1) {
      return false;
    }
    if (direction === 'left' && _self.currentCell.col <= 0) {
      return false;
    }
    return true;
  }
  
  /**
   * jMatrixBrowse Renderer manages the rendering of elements as well as row and 
   * column headers.
   * 
   * @param {jQuery Object} elem - element that initiated jMatrixBrowse.
   * @param {Object} configuration - configuration for jMatrixBrowse.
   * @param {Object} api - api manager for making requests to api.
   * @class jMatrixBrowseRenderer
   * @memberOf jMatrixBrowseNs
   */
  jMatrixBrowseNS.jMatrixBrowseRenderer = function(elem, configuration, api) {
    var that = this;
    
    _self = that;
    _elem = elem;
    _configuration = configuration;
    _api = api;
    
    // Add class for jMatrixBrowse container
    elem.addClass('jmb-matrix-container');
    
    /**
     * Gets the cell elements.
     * @returns {Array of Array of DOM elements} Elements in the cell.
     */
    that.getCellElements = function() {
      return _cellElements;
    };
    
    /**
     * Gets the row and column headers.
     * @returns {Object} headers - row and column headers.
     * @returns {jQuery Object} headers.row - row header.
     * @returns {jQuery Object} headers.col - column header.
     */
    that.getHeaders = function() {
      return _headers;
    };
    
    /**
     * Gets the container for jMatrixBrowse.
     * @returns {jQuery Object} The container for jMatrixBrowse.
     */
    that.getContainer = function() {
      return _container;
    };
    
    /**
     * Moves the row to bottom. 
     * @param {Number} row - index of the row to be moved.
     * @returns {boolean} true if the operation was successful. false otherwise.
     */
    that.moveRowToEnd = function(row) {
      // Get index of last cell
      var height = _cellElements.length;
      var lastCell = (_cellElements[height-1].length > 0) ? jQuery(_cellElements[height-1][0]) : undefined;
      if (lastCell === undefined) {
        console.error('Unable to move row ' + row + ' to the end.')
        return false;
      }

      // Change the position of all elements in the row.
      var newTop = lastCell.position().top + lastCell.height();
      for (var i = 0, w = _cellElements[row].length; i < w; ++i) {
        jQuery(_cellElements[row][i]).css({
          top: newTop
        });
      }

      // Move row in matrix to end
      var cellRow = _cellElements.splice(row,1); // Remove row at [backgroundTopRow]
      if (cellRow.length > 0)
        _cellElements.push(cellRow[0]);  // Insert row at the end.
        
      return true;
    };
    
    /**
     * Moves the row to top. 
     * @param {Number} row - index of the row to be moved.
     * @returns {boolean} true if the operation was successful. false otherwise.
     */
    that.moveRowToTop = function(row) {
      // Get index of first cell
      var firstCell = (_cellElements.length > 0 && _cellElements[0].length > 0)?jQuery(_cellElements[0][0]):undefined;
      if (firstCell === undefined) {
        console.error('Unable to move row ' + row + ' to top.')
        return false;
      }

      // Change the position of all elements in the row.
      var newBottom = firstCell.position().top;
      for (var i = 0, w = _cellElements[row].length; i < w; ++i) {
        jQuery(_cellElements[row][i]).css({
          top: newBottom - jQuery(_cellElements[row][i]).height()
        });
      }
      // Move row in matrix to first
      var cellRow = _cellElements.splice(row,1);  // Remove row at [backgroundBottomRow]
      if (cellRow.length > 0)
        _cellElements.splice(0,0,cellRow[0]);  // Insert row at the beginning.
        
      return true;
    };
    
    /**
     * Moves a column to right. 
     * @param {Number} col - index of the column to be moved.
     * @returns {boolean} true if the operation was successful. false otherwise.
     */
    that.moveColToRight = function(col) {
      if (_cellElements.length <= 0 || _cellElements[0].length <= 0) {
        console.error('Unable to move col ' + col + ' to right.');
        return false;
      }

      // Change the position of all elements in the column.
      var w = _cellElements[0].length;
      var lastCell = jQuery(_cellElements[0][w-1]);
      var newLeft = lastCell.position().left + lastCell.width();
      for (var i = 0, h = _cellElements.length; i < h; ++i) {
        jQuery(_cellElements[i][col]).css({
          left: newLeft
        });
      }
      // Move col to end in matrix.
      for (var i = 0, h = _cellElements.length; i < h; ++i) {
        var cell = _cellElements[i].splice(col, 1); // Remove element at [i][col]
        _cellElements[i].push(cell[0]); // Insert element at end of row i
      }
      return true;
    };
    
    /**
     * Moves a column to left. 
     * @param {Number} col - index of the column to be moved.
     * @returns {boolean} true if the operation was successful. false otherwise.
     */
    that.moveColToLeft = function(col) {
      if (_cellElements.length <= 0 || _cellElements[0].length <= 0) {
        console.error('Unable to move col ' + col + ' to left.');
        return false;
      }

      var firstCell = jQuery(_cellElements[0][0]);
      // Change the position of all elements in the column.
      var newRight = firstCell.position().left;
      for (var i = 0, h = _cellElements.length; i < h; ++i) {
        jQuery(_cellElements[i][col]).css({
          left: newRight - jQuery(_cellElements[i][col]).width()
        });
      }
      // Move col to first in matrix.
      for (var i = 0, h = _cellElements.length; i < h; ++i) {
        var cell = _cellElements[i].splice(col, 1); // Remove element at [i][col]
        _cellElements[i].splice(0,0,cell[0]); // Insert element to [i][0]
      }
      return true;
    };
    
    /**
     * Scrolls the matrix one cell to the right.
     */
    that.scrollRight = function() {
      if (checkScrollBounds('right'))
        scrollCols('right', 1);
    };

    /**
     * Scrolls the matrix one cell to the left.
     */
    that.scrollLeft = function() {
      if (checkScrollBounds('left'))
        scrollCols('left', 1);
    };
        
    /**
     * Scrolls the matrix one row up.
     */
    that.scrollUp = function() {
      if (checkScrollBounds('up'))
        scrollRows('up', 1);
    };
    
    /**
     * Scrolls the matrix one row down.
     */
    that.scrollDown = function() {
      if (checkScrollBounds('down'))
        scrollRows('down', 1);
    };
    
    /**
     * Scrolls the matrix one page up.
     */
    that.pageUp = function() {
      var nRowsToScroll = getNumberOfRowsForPageScroll('up');
      scrollRows('up', nRowsToScroll);
    };
    
    /**
     * Scrolls the matrix one page down.
     */
    that.pageDown = function() {
      var nRowsToScroll = getNumberOfRowsForPageScroll('down');
      scrollRows('down', nRowsToScroll);
    };
    
    /**
     * Scrolls the matrix one page left.
     */
    that.pageLeft = function() {
      var nColsToScroll = getNumberOfColsForPageScroll('left');
      scrollCols('left', nColsToScroll);
    };
    
    /**
     * Scrolls the matrix one page right.
     */
    that.pageRight = function() {
      var nColsToScroll = getNumberOfColsForPageScroll('right');
      scrollCols('right', nColsToScroll);
    };
    
    /**
     * Gets the number of rows that can be scrolled for a page up/down event without violating the matrix bounds.
     * @param  {string} direction the direction of the scroll.
     * @return {Number} the number of rows that can be safely scrolled.
     */
    function getNumberOfRowsForPageScroll(direction) {
      var height = _configuration.getWindowSize().height;
      if (direction === 'up') {
        var newTopRow = _self.currentCell.row - height;
        if (newTopRow < 0) {
          // The scroll exceeds bounds.
          return Math.max(0, height + newTopRow);
        }
      } else {
        var matrixHeight = _api.getMatrixSize().height;
        var newBottomRow = _self.currentCell.row + height + _cellElements.length - _configuration.getNumberOfBackgroundCells() - 1;
        if (newBottomRow >= matrixHeight-1) {
          // The scroll exceeds bounds
          return Math.max(0, height - (newBottomRow - matrixHeight));
        }
      }
      return height;
    }
  
    /**
     * Gets the number of cols that can be scrolled for a page left/right event without violating the matrix bounds.
     * @param  {string} direction the direction of the scroll.
     * @return {Number} the number of cols that can be safely scrolled.
     */
    function getNumberOfColsForPageScroll(direction) {
      var width = _configuration.getWindowSize().width;
      if (direction === 'left') {
        var newLeftCol = _self.currentCell.col - width;
        if (newLeftCol < 0) {
          // The scroll exceeds bounds.
          return Math.max(0, width + newLeftCol);
        }
      } else {
        var matrixWidth = _api.getMatrixSize().width;
        var newRightCol = _self.currentCell.col + width + _cellElements[0].length - _configuration.getNumberOfBackgroundCells() - 1;
        if (newRightCol >= matrixWidth) {
          // The scroll exceeds bounds
          return Math.max(0, width - (newRightCol - matrixWidth));
        }
      }
      return width;
    }

    /**
     * Scrolls the matrix nRows row in the given direction.
     * @param {string} direction - the direction to scroll.
     * @param {Number} nRows - number of rows to scroll.
     */
    function scrollRows(direction, nRows) {
      // Dont't scroll if no rows to scroll.
      if (nRows === 0)
        return;

      var previousCell = jQuery.extend({}, _self.currentCell); // Clone currentCell
      
      if (direction === 'up') {
        for(var i = 0; i < nRows; ++i) {
          // Move bottommost column to the top
          var row = _cellElements.length-1;
          that.moveRowToTop(row);
          --_self.currentCell.row;
        }
      } else {
        for(var i = 0; i < nRows; ++i) {
          // Move topmost row to the bottom
          row = 0;
          that.moveRowToEnd(row);
          ++_self.currentCell.row;
        }
      }
      
      // Reposition cells to move them nRows cells up/down
      for (var i = 0, h = _cellElements.length; i < h; ++i) {
        for (var j = 0, w = _cellElements[i].length; j < w; ++j) {
          var cell = jQuery(_cellElements[i][j]);
          cell.css({
            top: cell.position().top + (direction==='up'?nRows:-nRows)*cell.height()
          });
        }
      }
  
      var currentCell = _self.currentCell;
        
      // Reposition row headers.
      _headers.row.children().each(function(index, element) {
        var containerOffset = _container.offset();
        var elementOffset = jQuery(_cellElements[index][0]).offset();
        var top = elementOffset.top - containerOffset.top;

        jQuery(element).css({
          top: top
        });
      });
        
      // Set direction of overflow
      if (direction === 'down') {
        direction = 'top'; 
      } else {
        direction = 'bottom';
      }
        
      // Trigger event for change
      _elem.trigger({
        type: 'jMatrixBrowseChange',
        previousCell: previousCell,
        currentCell: currentCell,
        direction: direction
      });
    };
    
    /**
     * Scrolls the matrix nCols columns in the given direction.
     * @param {string} direction - the direction to scroll.
     * @param {Number} nCols - number of cols to scroll.
     */
    function scrollCols(direction, nCols) {
      // Dont't scroll if no columns to scroll. 
      if (nCols === 0)
        return;
      var previousCell = jQuery.extend({}, _self.currentCell); // Clone currentCell
      
      if (direction === 'left') {
        for(var i = 0; i < nCols; ++i) {
          // Move rightmost column to the left
          var col = _cellElements[0].length-1;
          that.moveColToLeft(col);
          --_self.currentCell.col;
        }
      } else {
        for(var i = 0; i < nCols; ++i) {
          // Move rightmost col to the left
          col = 0;
          that.moveColToRight(col);
          ++_self.currentCell.col;
        }
      }
      
      // Reposition cells to move them nCols cells left/right
      for (var i = 0, h = _cellElements.length; i < h; ++i) {
        for (var j = 0, w = _cellElements[i].length; j < w; ++j) {
          var cell = jQuery(_cellElements[i][j]);
          cell.css({
            left: cell.position().left + (direction==='left'?nCols:-nCols)*cell.width()
          });
        }
      }
  
      var currentCell = _self.currentCell;
        
      // Reposition column headers.
      _headers.col.children().each(function(index, element) {
        var containerOffset = _container.offset();
        var elementOffset = jQuery(_cellElements[0][index]).offset();
        var left = elementOffset.left - containerOffset.left;
        jQuery(element).css({
          left: left
        });
      });
        
      // Set direction of overflow
      if (direction === 'left') {
        direction = 'right'; 
      } else {
        direction = 'left';
      }
        
      // Trigger event for change
      _elem.trigger({
        type: 'jMatrixBrowseChange',
        previousCell: previousCell,
        currentCell: currentCell,
        direction: direction
      });
    };
    
    // TODO: This is a hack
    _api.setRenderer(that);
      
    // Create row and column headers.
    _headers = createRowColumnHeaderContainer(_elem);

    // Create draggable area and add matrix to it.
    var containers = createDragContainer(_elem);
    _dragContainer = containers.dragContainer;
    _container = containers.container;

    // Scroll to the initial position
    var windowPosition = _configuration.getWindowPosition();
    scrollTo(windowPosition.row, windowPosition.col);

    // Generate initial content
    _content = generateInitialMatrixContent(_dragContainer);

    // Generate row and column header content
    generateRowColumnHeaders(_headers);
    
    return that;
  };
  
})(jQuery, jMatrixBrowseNs);
