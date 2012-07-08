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

    // TODO: Move to Utils or Renderer and use in generate positions for jMatrixBrowseRenderer.
    /**
     * Check if the drag is valid.
     * @param {Number} overflow - Type of the overflow to check for.
     * @returns {boolean} true if the drag is valid.
     */
    function isValidDrag(overflow) {
      switch(overflow) {
        case jMatrixBrowseNs.Constants.OVERFLOW_TOP:
          if (_renderer.currentCell.row - _configuration.getNumberOfBackgroundCells() + _renderer.getCellElements().length - 1 >= _api.getMatrixSize().height-1)
            return false;
          return true;
          
        case jMatrixBrowseNs.Constants.OVERFLOW_BOTTOM:
          if (_renderer.currentCell.row <= 0 + _configuration.getNumberOfBackgroundCells())
            return false;
          return true;
          
        case jMatrixBrowseNs.Constants.OVERFLOW_LEFT:
          if (_renderer.currentCell.col - _configuration.getNumberOfBackgroundCells() + _renderer.getCellElements()[0].length - 1 >= _api.getMatrixSize().width-1)
            return false;
          return true;
          
        case jMatrixBrowseNs.Constants.OVERFLOW_RIGHT:
          if (_renderer.currentCell.col <= 0 + _configuration.getNumberOfBackgroundCells())
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
      var rowHeaders = _api.getRowHeadersFromTopRow(event.currentCell.row-_configuration.getNumberOfBackgroundCells());
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
      var colHeaders = _api.getColHeadersFromLeftCol(event.currentCell.col-_configuration.getNumberOfBackgroundCells());
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
      var rowIndex; // Index of the rows that would be fetched.
      var firstRowToBeReplaced; // Index of the first row that should be replaced.
      var nRowsReloaded = Math.abs(event.currentCell.row - event.previousCell.row);
      
      if (event.direction === 'top') {
        var rowsNotInBound = 0;
        var lastRowIndex = event.currentCell.row - _configuration.getNumberOfBackgroundCells() + _renderer.getCellElements().length - 1;
        // If overflow from top, bottom rows will have to be fetched.
        // First check if the row is within matrix bounds
        if (lastRowIndex >= _api.getMatrixSize().height) {
          // Some rows might not be in bound. Find how many? 
          rowsNotInBound = lastRowIndex - _api.getMatrixSize().height + 1;
          if (rowsNotInBound === nRowsReloaded) {
            // We don't need to reload any row.
            return;
          }
        }
        rowIndex = {
          row1: lastRowIndex - (nRowsReloaded - 1),
          row2: lastRowIndex - rowsNotInBound
        };
        // Data in the last few rows sould be replaced.
        firstRowToBeReplaced = _renderer.getCellElements().length - nRowsReloaded;
      } else {
        var rowsNotInBound = 0;
        var firstRowIndex = event.currentCell.row - _configuration.getNumberOfBackgroundCells();
        // If overflow from bottom, top rows will have to be fetched.
        // First check if the rows are within matrix bounds
        if (firstRowIndex < 0) {
          // Some rows might not be in bound. Find how many? 
          rowsNotInBound = -firstRowIndex;
          if (rowsNotInBound === nRowsReloaded) {
            // We don't need to reload any row.
            return;
          }
        }
        rowIndex = {
          row1: firstRowIndex + rowsNotInBound,
          row2: firstRowIndex + (nRowsReloaded - 1)
        };
        // Data in the first few rows (which are within matrix bounds) should be replaced.
        firstRowToBeReplaced = 0 + rowsNotInBound;
      }
      
      // Get data for the window.
      var rowData = _api.getResponseData({
        row1: rowIndex.row1,
        row2: rowIndex.row2,
        col1: event.currentCell.col - 1,
        col2: event.currentCell.col - _configuration.getNumberOfBackgroundCells() + _renderer.getCellElements()[0].length - 1
      });
        
      // Replace the data in (event.currentCell.row - event.previousCell.row) 
      // rows beginning from firstRowToBeReplaced.
      for (var i = rowIndex.row1; i <= rowIndex.row2; ++i) {
        var j = i - rowIndex.row1;
        var rowToBeReplaced = _renderer.getCellElements()[firstRowToBeReplaced + j];
        jQuery.each(rowToBeReplaced, function(index, cell) {
          jQuery(cell).html(rowData[j][index]);
          jQuery(cell).attr('data-row', i);
          jQuery(cell).attr('data-col', event.currentCell.col - _configuration.getNumberOfBackgroundCells() + index);
        });
      }
    }
    
    /**
     * Reload column data on change of matrix.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} event.direction - direction of drag that triggered the change
     */
    function reloadColData(event) {
      var colIndex;
      var firstColumnToBeReplaced;
      var nColsReloaded = Math.abs(event.currentCell.col - event.previousCell.col);
      
      if (event.direction === 'left') {
        var colsNotInBound = 0;
        var lastColIndex = event.currentCell.col - _configuration.getNumberOfBackgroundCells() + _renderer.getCellElements()[0].length - 1;
        // If overflow from left, right columns will have to be fetched. 
        // First check if the column is within matrix bounds
        if (lastColIndex >= _api.getMatrixSize().width) {
          // Some columns might not be in bound. Find how many? 
          colsNotInBound = lastColIndex - _api.getMatrixSize().width + 1;
          if (colsNotInBound === nColsReloaded) {
            // We don't need to reload any column.
            return;
          }
        }
        
        colIndex = {
          col1: lastColIndex - (nColsReloaded - 1),
          col2: lastColIndex
        };
        // Data in the last few columns should be replaced.
        firstColumnToBeReplaced = _renderer.getCellElements()[0].length - nColsReloaded;
      } else {
        var colsNotInBound = 0;
        var firstColIndex = event.currentCell.col - _configuration.getNumberOfBackgroundCells();
        // If overflow from right, left column will have to be fetched.
        // First check if the col is within matrix bounds
        if (firstColIndex < 0) {
          // Some columns might not be in bound. Find how many? 
          colsNotInBound = -firstColIndex;
          if (colsNotInBound === nColsReloaded) {
            // We don't need to reload any column.
            return;
          }
        }
      
        colIndex = {
          col1: firstColIndex + colsNotInBound,
          col2: firstColIndex + (nColsReloaded - 1)
        };
        // Data in the first few columns should be replaced.
        firstColumnToBeReplaced = 0 + colsNotInBound;
      }
      
      // Get data for the window.
      var colData = _api.getResponseData({
        row1: event.currentCell.row - 1,
        row2: event.currentCell.row - _configuration.getNumberOfBackgroundCells() + _renderer.getCellElements().length - 1,  // TODO: The row can stillb e outside bounds.
        col1: colIndex.col1,
        col2: colIndex.col2
      });
      
      // Replace the data in (event.currentCell.col - event.previousCell.col) 
      // columns beginning from firstColToBeReplaced.
      for (var i = 0; i < _renderer.getCellElements().length; ++i) {
        for (var j = colIndex.col1; j <= colIndex.col2; ++j) {
          var colToBeReplacedIndex = firstColumnToBeReplaced + j - colIndex.col1;
          var cell = _renderer.getCellElements()[i][colToBeReplacedIndex];
          jQuery(cell).html(colData[i][j - colIndex.col1]);
          jQuery(cell).attr('data-row', event.currentCell.row - _configuration.getNumberOfBackgroundCells() + i);
          jQuery(cell).attr('data-col', j);
        }
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

        if (_configuration.isSnapEnabled()) {
          _renderer.snapToGrid();
        }
        
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
      
      jQuery(document).bind('keydown', 'ctrl+up', function() {
        _renderer.pageUp();
      });
      
      jQuery(document).bind('keydown', 'ctrl+down', function() {
        _renderer.pageDown();
      });
      
      jQuery(document).bind('keydown', 'ctrl+left', function() {
        _renderer.pageLeft();
      });
      
      jQuery(document).bind('keydown', 'ctrl+right', function() {
        _renderer.pageRight();
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
