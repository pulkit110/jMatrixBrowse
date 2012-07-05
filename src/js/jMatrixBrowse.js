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

/**
  * jMatrixBrowseNS - Namespace encapsulating jMatrixBrowse.
  *
  * @namespace jMatrixBrowseNS
  */
var jMatrixBrowseNs = jMatrixBrowseNs || {};

(function(jQuery, jMatrixBrowseNs) {
  /**
   * jMatrixBrowse - a jQuery plugin to create large draggable(like Google Maps)
   * matrices. 
   *
   * @class jMatrixBrowse
   * @memberOf jQuery.fn
   */
  jQuery.fn.jMatrixBrowse = function() {

    var _self = this;
    var _renderer;      // jMatrixBrowse renderer
    var _configuration; // jMatrixBrowse configuration manager.
    var _api;           // API handler
    
    /**
     * Computes the new cell coordinates when a drag results in overflow.
     * @param {Number} overflow - Type of the overflow.
     */
    function computeNewCellCoordinates(overflow) {

      switch(overflow) {
        case jMatrixBrowseNs.Constants.OVERFLOW_TOP:
          ++_renderer.currentCell.row;
          break;
          
        case jMatrixBrowseNs.Constants.OVERFLOW_BOTTOM:
          --_renderer.currentCell.row;
          break;
          
        case jMatrixBrowseNs.Constants.OVERFLOW_LEFT:
          ++_renderer.currentCell.col;
          break;
          
        case jMatrixBrowseNs.Constants.OVERFLOW_RIGHT:
          --_renderer.currentCell.col;
          break;
      }
    }
    
    /**
     * Check if the drag is valid.
     * @param {Number} overflow - Type of the overflow to check for.
     * @returns {boolean} true if the drag is valid.
     */
    function isValidDrag(overflow) {
      var nBackgroundCells = 1;
      switch(overflow) {
        case jMatrixBrowseNs.Constants.OVERFLOW_TOP:
          if (_renderer.currentCell.row - nBackgroundCells + _renderer.getCellElements().length - 1 >= _api.getMatrixSize().height-1)
            return false;
          return true;
          
        case jMatrixBrowseNs.Constants.OVERFLOW_BOTTOM:
          if (_renderer.currentCell.row <= 0 + nBackgroundCells) 
            return false;
          return true;
          
        case jMatrixBrowseNs.Constants.OVERFLOW_LEFT:
          if (_renderer.currentCell.col - nBackgroundCells + _renderer.getCellElements()[0].length - 1 >= _api.getMatrixSize().width-1) 
            return false;
          return true;
          
        case jMatrixBrowseNs.Constants.OVERFLOW_RIGHT:
          if (_renderer.currentCell.col <= 0 + nBackgroundCells) 
            return false;
          return true;
      }
    }
    
    /**
     * Check and resposition cells that are overflowing.
     */
    function checkAndRepositionCells() {
      var cellsRepositioned = false;
      
      // Row on top might overflow from the top.
      cellsRepositioned = checkAndRepositionCellRow(_renderer.getCellElements(), _renderer.getContainer(), 1, jMatrixBrowseNs.Constants.OVERFLOW_TOP) || cellsRepositioned;
      // Row on bottom might overflow from the bottom.
      cellsRepositioned = checkAndRepositionCellRow(_renderer.getCellElements(), _renderer.getContainer(), _renderer.getCellElements().length-2, jMatrixBrowseNs.Constants.OVERFLOW_BOTTOM) || cellsRepositioned;
      // Column on left might overflow from the left.
      cellsRepositioned = checkAndRepositionCellCol(_renderer.getCellElements(), _renderer.getContainer(), 1, jMatrixBrowseNs.Constants.OVERFLOW_LEFT) || cellsRepositioned;
      // Column on right might overflow from the right.
      cellsRepositioned = checkAndRepositionCellCol(_renderer.getCellElements(), _renderer.getContainer(), _renderer.getCellElements()[0].length-2, jMatrixBrowseNs.Constants.OVERFLOW_RIGHT) || cellsRepositioned;
      
      // For handling quick drags, check for positioning again.
      if (cellsRepositioned) {
          checkAndRepositionCells();
          checkAndRepositionHeaders();
      }
    }
    
    /**
     * Check and resposition headers according to cell positions.
     */
    function checkAndRepositionHeaders() {
      checkAndRepositionRowHeader(_renderer.getHeaders().row);
      checkAndRepositionColumnHeader(_renderer.getHeaders().col);
    }
    
    /**
     * Check and resposition headers according to cell positions.
     * @param header - row header container
     */
    function checkAndRepositionRowHeader(header) {
      header.children().each(function(index, element) {
        var containerOffset = _renderer.getContainer().offset();
        var elementOffset = jQuery(_renderer.getCellElements()[index][0]).offset();
        var top = elementOffset.top - containerOffset.top;
        
        jQuery(element).css({
          top: top
        });
      });
    }
    
    /**
     * Check and resposition headers according to cell positions.
     * @param header - column header container
     */
    function checkAndRepositionColumnHeader(header) {
      header.children().each(function(index, element) {
        var containerOffset = _renderer.getContainer().offset();
        var elementOffset = jQuery(_renderer.getCellElements()[0][index]).offset();
        var left = elementOffset.left - containerOffset.left;
        jQuery(element).css({
          left: left
        });
      });
    }
    
    /**
     * Checks if the given row is overflowing and repositions if necessary. 
     * @param {matrix} cellElements - The matrix of DOM objects representing cells.
     * @param {jQuery Object} container - The container against which to check the overflow.
     * @param {Number} row - Index of row to check the overflow for.
     * @param {Number} overflow - Type of the overflow to check for.
     * @returns {boolean} true if any cells were repositioned. false otherwise.
     */
    function checkAndRepositionCellRow(cellElements, container, row, overflow) {
      if (cellElements[row].length > 0 && jMatrixBrowseNs.Utils.isOverflowing(jQuery(cellElements[row][0]), container, overflow) && isValidDrag(overflow)) {
        
        var previousCell = jQuery.extend({}, _renderer.currentCell); // Clone currentCell
        
        // There is an overflow.
        computeNewCellCoordinates(overflow);
        
        var cellRow;
        var direction;
        
        switch (overflow) {
          case jMatrixBrowseNs.Constants.OVERFLOW_TOP:
            direction = 'top';
            // The row is overflowing from top. Move it to bottom. 
            var backgroundTopRow = 0; // TODO: get background top row            
            if (_renderer.moveRowToEnd(backgroundTopRow) === false) {
                return false;
            }            
            break;

          case jMatrixBrowseNs.Constants.OVERFLOW_BOTTOM:
            direction = 'bottom';
            // The row is overflowing from bottom. Move it to top.
            var backgroundBottomRow = cellElements.length-1; // TODO: get background bottom row
            if (_renderer.moveRowToTop(backgroundBottomRow) === false) {
                return false;
            }
            break;
        }
        // Trigger event for change
        _elem.trigger({
          type: 'jMatrixBrowseChange',
          previousCell: previousCell,
          currentCell: _renderer.currentCell,
          direction: direction
        });
        return true;
      }
      return false;
    }
    
    /**
     * Checks if the given column is overflowing and repositions if necessary. 
     * @param {matrix} cellElements - The matrix of DOM objects representing cells.
     * @param {jQuery Object} container - The container against which to check the overflow.
     * @param {Number} col - Index of column to check the overflow for.
     * @param {Number} overflow - Type of the overflow to check for.
     * @returns {boolean} true if any cells were repositioned. false otherwise.
     */
    function checkAndRepositionCellCol(cellElements, container, col, overflow) {
      if (jMatrixBrowseNs.Utils.isOverflowing(jQuery(cellElements[0][col]), container, overflow) &&  isValidDrag(overflow)) {
        
        var previousCell = jQuery.extend({}, _renderer.currentCell); // Clone currentCell
        
        // There is an overflow.
        computeNewCellCoordinates(overflow);
        
        var direction;
        switch (overflow) {
          case jMatrixBrowseNs.Constants.OVERFLOW_LEFT:
            direction = 'left';
            // The row is overflowing from left. Move it to right. 
            var backgroundLeftCol = 0; // TODO: Get position of background left col.
            if (_renderer.moveColToRight(backgroundLeftCol) === false) {
                return false;
            }
            break;

          case jMatrixBrowseNs.Constants.OVERFLOW_RIGHT:
            direction = 'right';
            // The row is overflowing from right. Move it to left. 
            var backgroundRightCol = cellElements[0].length-1; // TODO: Get position of background left col.
            if (_renderer.moveColToLeft(backgroundRightCol) === false) {
                return false;
            }
            break;
        }
        // Trigger event for change
        _elem.trigger({
          type: 'jMatrixBrowseChange',
          previousCell: previousCell,
          currentCell: _renderer.currentCell,
          direction: direction
        });
        return true;
      }
      return false;
    }

    /**
     * Reload column headers on change of matrix.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} event.direction - direction of drag that triggered the change
     */
    function reloadRowHeaders(event) {
      var nBackgroundCells = 1; // TODO
      var rowHeaders = _api.getRowHeadersFromTopRow(event.currentCell.row-nBackgroundCells);
      _renderer.getHeaders().row.children().each(function (index, element) {
        if (index < rowHeaders.length) {
          jQuery(element).html(rowHeaders[index]);
        }
      });
    }
    
    /**
     * Reload row headers on change of matrix.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} event.direction - direction of drag that triggered the change
     */
    function reloadColHeaders(event) {
      var nBackgroundCells = 1; // TODO
      var colHeaders = _api.getColHeadersFromLeftCol(event.currentCell.col-nBackgroundCells);
      _renderer.getHeaders().col.children().each(function (index, element) {
        if (index < colHeaders.length) {
          jQuery(element).html(colHeaders[index]);
        }
      });
    }
    
    /**
     * Reload row data on change of matrix.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} event.direction - direction of drag that triggered the change
     */
    function reloadRowData(event) {
      var rowData;
      var rowToBeReplaced;
      var nBackgroundCells = 1; // TODO:
      var rowIndex;
      if (event.direction === 'top') {
        // If overflow from top, bottom row will have to be fetched.
        // First check if the row is within matrix bounds
        if (event.currentCell.row - nBackgroundCells + _renderer.getCellElements().length - 1 >= _api.getMatrixSize().height)
          return;
        rowData = _api.getRowDataForCell({
         row: event.currentCell.row - nBackgroundCells + _renderer.getCellElements().length - 1,
         col: event.currentCell.col
        });
        rowIndex = event.currentCell.row - nBackgroundCells + _renderer.getCellElements().length - 1;
        rowToBeReplaced = _renderer.getCellElements()[_renderer.getCellElements().length-1];
      } else {
        // If overflow from bottom, top row will have to be fetched.
        // First check if the row is within matrix bounds
        if (event.currentCell.row - nBackgroundCells < 0)
          return;
        rowData = _api.getRowDataForCell({
         row: event.currentCell.row - nBackgroundCells,
         col: event.currentCell.col
        });
        rowIndex = event.currentCell.row - nBackgroundCells;
        rowToBeReplaced = _renderer.getCellElements()[0];
      }
      
      jQuery.each(rowToBeReplaced, function(index, cell) {
        jQuery(cell).html(rowData[index]);
        jQuery(cell).attr('data-row', rowIndex);
        jQuery(cell).attr('data-col', event.currentCell.col - nBackgroundCells + index);
      });
    }
    
    /**
     * Reload column data on change of matrix.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} event.direction - direction of drag that triggered the change
     */
    function reloadColData(event) {
      var colData;
      var colToBeReplacedIndex;
      var nBackgroundCells = 1; // TODO:
      var colIndex;
      if (event.direction === 'left') {
        // If overflow from left, right column will have to be fetched. 
        // First check if the row is within matrix bounds
        var temp = event.currentCell.col - nBackgroundCells + _renderer.getCellElements()[0].length - 1;
        if (event.currentCell.col - nBackgroundCells + _renderer.getCellElements()[0].length - 1 >= _api.getMatrixSize().width)
          return;
        colData = _api.getColDataForCell({
         row: event.currentCell.row,
         col: event.currentCell.col - nBackgroundCells + _renderer.getCellElements()[0].length - 1 
        });
        colIndex = event.currentCell.col - nBackgroundCells + _renderer.getCellElements()[0].length - 1;
        colToBeReplacedIndex = _renderer.getCellElements()[0].length-1;
      } else {
        // If overflow from right, left column will have to be fetched.
        // First check if the col is within matrix bounds
        if (event.currentCell.col - nBackgroundCells < 0)
          return;
        colData = _api.getColDataForCell({
         row: event.currentCell.row,
         col: event.currentCell.col - nBackgroundCells
        });
        colIndex = event.currentCell.col - nBackgroundCells;
        colToBeReplacedIndex = 0;
      }
      
      for (var i = 0; i < _renderer.getCellElements().length; ++i) {
        var cell = _renderer.getCellElements()[i][colToBeReplacedIndex];
        jQuery(cell).html(colData[i]);
        jQuery(cell).attr('data-row', event.currentCell.row - nBackgroundCells + i);
        jQuery(cell).attr('data-col', colIndex);
      }
    }
    
    /**
     * Reload row and column headers on change of matrix.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} event.direction - direction of drag that triggered the change
     */
    function reloadHeaders(event) {
      if (event.direction === 'top' || event.direction === 'bottom') {
        reloadRowHeaders(event);
      } else {
        reloadColHeaders(event);
      }
    }
    
    /**
     * Reload row and column data on change of matrix.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} event.direction - direction of drag that triggered the change
     */
    function reloadMatrixData(event) {
      // Only the last/first row/column will have changed based on the direction of drag
      // e.g. for overflow from top, only bottom row needs to be reloaded.
      if (event.direction === 'top' || event.direction === 'bottom') {
        reloadRowData(event);
      } else {
        reloadColData(event);
      }
    }
    
    /**
     * Reload data on change of matrix.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} event.direction - direction of drag that triggered the change
     */
    function reloadData(event) {
      // TODO: Reloaded data might be wrong due to background loading.
      reloadHeaders(event);
      reloadMatrixData(event);
    }
    
    /**
     * Initialize the jMatrixBrowse.
     * @param {jQuery object} elem - the element to which to attach the jMatrixBrowse.
     */
    function init(elem) {
      
      _elem = elem;
      
      // Initialize mock api
      _api = jMatrixBrowseNs.APIHandler('test');
      
      // Initialize configuration, get user options and extend with default.
      _configuration = jMatrixBrowseNs.Configuration(elem, _api);
      
      // Initialize the jMatrixBrowseRenderer
      _renderer = jMatrixBrowseNs.jMatrixBrowseRenderer(elem, _configuration, _api);

      // Load data
      //_self.reloadData();
      
      // Listen to events to implement reloading of data and headers
      
      // Listen for drag and reposition cells
      _elem.bind('jMatrixBrowseDrag', function (event) {
        // Reposition matrix cells
        checkAndRepositionCells();  
        // Reposition headers
        checkAndRepositionHeaders();
      });
      
      // Listen for drag stop and reposition cells, needed when there is a quick drag.
      _elem.bind('jMatrixBrowseDragStop', function (event) {
        // Reposition matrix cells
        checkAndRepositionCells();  
        // Reposition headers
        checkAndRepositionHeaders();
      });
      
      // Listen for change and reload new data
      _elem.bind('jMatrixBrowseChange', function (event) {
        reloadData({
          currentCell: event.currentCell,
          previousCell: event.previousCell,
          direction: event.direction
        });
        
        console.log('jMatrixBrowseChange'); 
        console.log(event);
      });
      
      // Listen for click event
      _elem.bind('jMatrixBrowseClick', function (event) {
        console.log('click: ' + event.row + ', ' + event.col);
      });
      
      jQuery(document).bind('keydown', 'right', function() {
          _renderer.scrollRight();
      });
      
      jQuery(document).bind('keydown', 'left', function() {
          _renderer.scrollLeft();
      });
      
      jQuery(document).bind('keydown', 'up', function() {
          _renderer.scrollUp();
      });
      
      jQuery(document).bind('keydown', 'down', function() {
          _renderer.scrollDown();
      });
    }

    //Public API

    /**
     * Reload data in the matrix for the visible window. 
     */
    this.reloadData = function() {
      var cellWindow = _configuration.getCellWindow(_renderer.currentCell);
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
    
    this.getPosition = function() {
      return _renderer.currentCell;
    };
    
    /**
     * Main plugin function
     */
    jQuery('[data-jmatrix_browser=true]').each( function() {
      init(jQuery(this));
    });
    
    return this;
  };
})(jQuery, jMatrixBrowseNs);
