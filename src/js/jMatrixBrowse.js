/**
 * @fileOverview Contains the jMatrixBrowse plug-in code.
 * 
 * The core file for jMatrixBrowse that manages the initialization of the 
 * component and manages interaction with different parts of the components.
 * 
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
    var _renderer;              // jMatrixBrowse renderer.
    var _configuration;         // jMatrixBrowse configuration manager.
    var _api;                   // API handler.
    var _backgroundDataManager; // Background data manager.
    var _elem; 

    //Public API
    /**
     * Reload data in the matrix for the visible window. 
     */
    this.reloadData = function() {
      var cellWindow = getCellWindow(_renderer.currentCell);
      if (cellWindow == undefined) {
        console.error('Unable to get cell window.');
        return;
      }
      _api.getResponseDataAsync(cellWindow, function(data) {
        // Reload data
        for (var i = 0; i < data.length; ++i) {
          for (var j = 0; j < data[i].length; ++j) {
            var cellData = data[i][j]; 
            jQuery(_renderer.getCellElements()[i][j]).html(cellData);
          }
        }

        // Reload headers
        reloadRowHeaders({
          currentCell: _renderer.currentCell
        });
        reloadColHeaders({
          currentCell: _renderer.currentCell
        });

      });
    }
    
    /**
     * Gets the current position of jMatrix browse.
     * @return {Object} position of cell on top left corner. properties: row, col
     */
    this.getPosition = function() {
      return _renderer.currentCell;
    };
    
    // initialize the plugin.
    init(this);
    
    // Private methods
    /**
     * Initialize the jMatrixBrowse.
     * @param {jQuery object} elem - the element to which to attach the jMatrixBrowse.
     */
    function init(elem) {
      _elem = jQuery('<div/>', {
        position: 'absolute'
      }).appendTo(elem);
      
      // Initialize configuration, get user options and extend with default.
      _configuration = new jMatrixBrowseNs.Configuration(elem);
      
      // Initialize mock api
      if (_configuration.getApiUrl() === 'test')  {
        _api = new jMatrixBrowseNs.APIHandler('test');
      } else {
        _api = new jMatrixBrowseNs.APIHandler('networked', _configuration.getApiUrl());
      }

      // Initialize the jMatrixBrowseRenderer
      _renderer = new jMatrixBrowseNs.jMatrixBrowseRenderer(_elem, _configuration, _api);

      // Load data after renderer completes initialization.
      _elem.bind('jMatrixBrowseRendererInitialized', function() {
        _self.reloadData();
      });

      _renderer.init(_configuration.getWindowPosition());

      // Listen to events to implement reloading of data and headers
      // Listen for drag and reposition cells
      _elem.bind('jMatrixBrowseDrag', function (event) {
        // Reposition matrix cells
        checkAndRepositionCells();  
        // Reposition headers
        checkAndRepositionHeaders();
      });
      
      _elem.bind('jMatrixBrowseAnimationStep', function (event) {
        // Reposition matrix cells
        checkAndRepositionCells();
        // Reposition headers
        checkAndRepositionHeaders();
      });

      // Listen for drag stop and reposition cells, needed when there is a quick drag.
      _elem.bind('jMatrixBrowseDragStop', function (event) {
        if (_configuration.isSnapEnabled() && !_renderer.getIsAnimating()) {
          _renderer.snapToGrid();
        }
        // Reposition matrix cells
        checkAndRepositionCells();  
        // Reposition headers
        checkAndRepositionHeaders();
      });

      _elem.bind('jMatrixBrowseAnimationComplete', function (event) {
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
      });
      
      // Listen for click event
      _elem.bind('jMatrixBrowseClick', function (event) {
        console.log('click: ' + event.row + ', ' + event.col);
      });

      bindShortcuts();

      // Begin loading data in the background.
      _backgroundDataManager = new jMatrixBrowseNs.BackgroundDataManager(_elem, _api, _configuration);
    }
    
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
     * Computes the row index needed for reload.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} direction - direction of overflow corresponding to the update
     * @returns {Object} rowIndex - row1, row2 and rowsNotInBound
     */
    function getRowIndexForReload(event, direction) {
      var rowsNotInBound = 0;
      var rowIndex;
      var nRowsReloaded = Math.abs(event.currentCell.row - event.previousCell.row);

      // Find indices of the first and last rows in matrix.
      var firstRowIndex = event.currentCell.row - _configuration.getNumberOfBackgroundCells();
      var lastRowIndex = event.currentCell.row - _configuration.getNumberOfBackgroundCells() + _renderer.getCellElements().length - 1;

      if (direction === 'top') {
        // If overflow from top, bottom rows will have to be fetched.
        // Check if the row is within matrix bounds
        if (lastRowIndex >= _api.getMatrixSize().height) {
          // Some rows might not be in bound. Find how many?
          rowsNotInBound = lastRowIndex - _api.getMatrixSize().height + 1;
        }

        if (rowsNotInBound === nRowsReloaded) {
          // We don't need to reload any row.
          return -1;
        }
        
        rowIndex = {
          row1: lastRowIndex - (nRowsReloaded - 1),
          row2: lastRowIndex - rowsNotInBound
        };
      } else if (direction === 'bottom') {
        // If overflow from bottom, top rows will have to be fetched.
        // First check if the rows are within matrix bounds
        if (firstRowIndex < 0) {
          // Some rows might not be in bound. Find how many?
          rowsNotInBound = -firstRowIndex;
        }

        if (rowsNotInBound === nRowsReloaded) {
          // We don't need to reload any row.
          return -1;
        }
        
        rowIndex = {
          row1: firstRowIndex + rowsNotInBound,
          row2: firstRowIndex + (nRowsReloaded - 1)
        };
      } else if (direction === 'both') {
        // Check for the rows in both directions.
        var rowIndexBottom = getRowIndexForReload(event, 'top');
        var rowIndexTop = getRowIndexForReload(event, 'bottom');
        if (rowIndexBottom === -1)
          rowIndexBottom = {row2: lastRowIndex};
        if (rowIndexTop === -1)
          rowIndexTop = {row1: firstRowIndex};
        rowIndex = {
          row1: rowIndexTop.row1,
          row2: rowIndexBottom.row2
        };
      }
      rowIndex.rowsNotInBound = rowsNotInBound;
      return rowIndex;
    }

    /**
     * Computes the col index needed for reload.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} direction - direction of overflow corresponding to the update
     * @returns {Object} colIndex - col1, col2 and colsNotInBound
     */
    function getColIndexForReload(event, direction) {
      var colsNotInBound = 0;
      var colIndex;
      var nColsReloaded = Math.abs(event.currentCell.col - event.previousCell.col);

      // Find indices of the first and last columns in matrix.
      var firstColIndex = event.currentCell.col - _configuration.getNumberOfBackgroundCells();
      var lastColIndex = event.currentCell.col - _configuration.getNumberOfBackgroundCells() + _renderer.getCellElements()[0].length - 1;
      
      if (direction === 'left') {
        // If overflow from left, right columns will have to be fetched.
        // First check if the column is within matrix bounds
        if (lastColIndex >= _api.getMatrixSize().width) {
          // Some columns might not be in bound. Find how many?
          colsNotInBound = lastColIndex - _api.getMatrixSize().width + 1;
          if (colsNotInBound === nColsReloaded) {
            // We don't need to reload any column.
            return -1;
          }
        }

        colIndex = {
          col1: lastColIndex - (nColsReloaded - 1),
          col2: lastColIndex
        };

      } else if (direction === 'right'){
        // If overflow from right, left column will have to be fetched.
        // First check if the col is within matrix bounds
        if (firstColIndex < 0) {
          // Some columns might not be in bound. Find how many?
          colsNotInBound = -firstColIndex;
          if (colsNotInBound === nColsReloaded) {
            // We don't need to reload any column.
            return -1;
          }
        }

        colIndex = {
          col1: firstColIndex + colsNotInBound,
          col2: firstColIndex + (nColsReloaded - 1)
        };
      } else if (direction === 'both') {
        // Check for the rows in both directions.
        var colIndexRight = getColIndexForReload(event, 'left');
        var colIndexLeft = getColIndexForReload(event, 'right');
        if (colIndexRight === -1)
          colIndexRight = {col2: lastColIndex};
        if (colIndexLeft === -1)
          colIndexLeft = {col1: firstColIndex};
        colIndex = {
          col1: colIndexLeft.col1,
          col2: colIndexRight.col2
        };
      }
      colIndex.colsNotInBound = colsNotInBound;
      return colIndex;
    }
    
    /**
     * Reload row data on change of matrix.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} event.direction - direction of drag that triggered the change
     */
    function reloadRowData(event) {
      // Index of the rows that would be fetched.
      var rowIndex = getRowIndexForReload(event, event.direction);
      if (rowIndex === -1) {
        // We don't need to reload any row.
        return;
      }

      // Get col index by checking from both sides.
      var colIndex = getColIndexForReload(event, 'both');

      // Get data from the background data manager.
      var cells = _backgroundDataManager.getCellsForRequest({
        row1: rowIndex.row1,
        row2: rowIndex.row2,
        col1: colIndex.col1,
        col2: colIndex.col2
      }, function(cells) {
        updateCellsForReload(rowIndex, colIndex, cells);
      });
    }
    
    /**
     * Reload column data on change of matrix.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} event.direction - direction of drag that triggered the change
     */
    function reloadColData(event) {
      // Index of the rows that would be fetched.
      var colIndex = getColIndexForReload(event, event.direction);
      if (colIndex === -1) {
        // We don't need to reload any row.
        return;
      }
      
      // Get row index by checking from both sides.
      var rowIndex = getRowIndexForReload(event, 'both');

      // Get data from the background data manager.
      var cells = _backgroundDataManager.getCellsForRequest({
        row1: rowIndex.row1,
        row2: rowIndex.row2,
        col1: colIndex.col1,
        col2: colIndex.col2
      }, function(cells) {
        updateCellsForReload(rowIndex, colIndex, cells);
      });
    }

    /**
     * Updates the cells which have been reloaded for the given row and col indices.
     * @param  {Object} rowIndex - row1 and row2 for the request that was made.
     * @param  {Object} colIndex - col1 and col2 for the request that was made.
     * @param  {Array}  cells    - Array of Array of the response data. 
     */
    function updateCellsForReload(rowIndex, colIndex, cells) {
      for (var i = rowIndex.row1; i <= rowIndex.row2; ++i) {
        // Find which row needs to be replaced.
        var rowToBeReplacedIndex = i - _renderer.currentCell.row + _configuration.getNumberOfBackgroundCells();
        // Check if the row has already gone out of window. 
        if (rowToBeReplacedIndex < 0 || rowToBeReplacedIndex >= _renderer.getCellElements().length) 
          continue;
        var rowToBeReplaced = _renderer.getCellElements()[rowToBeReplacedIndex];
        for (var j = colIndex.col1; j <= colIndex.col2; ++j) {
          // Find which col needs to be replaced.
          var colToBeReplacedIndex = j - _renderer.currentCell.col + _configuration.getNumberOfBackgroundCells();
          // Check if the column has already gone out of window. 
          if (colToBeReplacedIndex < 0 || colToBeReplacedIndex >= rowToBeReplaced.length)
            continue;
          // Get the cell that is to be replaced.
          var cell = jQuery(rowToBeReplaced[colToBeReplacedIndex]);
          updateCellForReload(cell, rowToBeReplacedIndex, colToBeReplacedIndex, cells[i-rowIndex.row1][j-colIndex.col1], i, j);
        }
      }
    }

    /**
     * Updates the cell content for reload based on the reload strategy.
     * @param  {jQuery Object} cell - cell to be replaced/reloaded.
     * @param  {Number} rowIndex - row index of the cell to be replaced.
     * @param  {Number} colIndex - column index of the cell to be replaced.
     * @param  {jQuery Object} newCell - cell to be replaced with. 
     * @param  {Number} newRowNumber - new row number of the cell.
     * @param  {Number} newColNumber - new column number of the cell.
     */
    function updateCellForReload(cell, rowIndex, colIndex, newCell, newRowNumber, newColNumber) {
      if (_configuration.getDataReloadStrategy() === jMatrixBrowseNs.Constants.RELOAD_CELL_REPLACEMENT) {
        // Clone and move the cell from background container to matrix content.
        newCell = newCell.clone().removeClass('jMatrixBrowse-background-cell').addClass('jMatrixBrowse-cell').css({
          width: cell.css('width'),
          height: cell.css('height'),
          top: cell.css('top'),
          left: cell.css('left'),
          position: 'absolute'
        });
        cell.replaceWith(newCell);
        _renderer.getCellElements()[rowIndex][colIndex] = newCell;
      } else if (_configuration.getDataReloadStrategy() === jMatrixBrowseNs.Constants.RELOAD_HTML_REPLACEMENT) {
        // Change only the html content of the cell.
        var html = newCell.html();
        cell.html(html);
        cell.attr('data-row', newRowNumber);
        cell.attr('data-col', newColNumber);
      } else if (_configuration.getDataReloadStrategy() === jMatrixBrowseNs.Constants.RELOAD_CELL_POSITION) {
        // Cell is already in the matrix container. Change its position etc. to put it in correct place. 
        newCell = newCell.removeClass('jMatrixBrowse-background-cell').addClass('jMatrixBrowse-cell').css({
          width: cell.css('width'),
          height: cell.css('height'),
          top: cell.css('top'),
          left: cell.css('left'),
          position: 'absolute'
        });
        cell.hide();
        newCell.show();
       _renderer.getCellElements()[rowIndex][colIndex] = newCell;
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
      var size = _api.getMatrixSize();
      if (size == undefined) {
        throw "Unable to get matrix size";
      }

      var windowSize = _configuration.getWindowSize();
      if (windowSize == undefined) {
        throw "Unable to get window size.";
      }

      return {
        row1: position.row - _configuration.getNumberOfBackgroundCells(),
        col1: position.col - _configuration.getNumberOfBackgroundCells(),
        row2: Math.min(position.row + windowSize.height, size.height),
        col2: Math.min(position.col + windowSize.width, size.width)
      };
    };

    /**
     * Binds shortcuts for browsing.
     */
    function bindShortcuts() {
      // Arrow keys
      jQuery(document).bind('keydown', 'right', function(e) {
        e.preventDefault();
        _renderer.scrollRight();
      });

      jQuery(document).bind('keydown', 'left', function(e) {
        e.preventDefault();
        _renderer.scrollLeft();
      });

      jQuery(document).bind('keydown', 'up', function(e) {
        e.preventDefault();
        _renderer.scrollUp();
      });

      jQuery(document).bind('keydown', 'down', function(e) {
        e.preventDefault();
        _renderer.scrollDown();
      });

      // Vi like browsing.
      jQuery(document).bind('keydown', 'j', function() {
        _renderer.scrollRight();
      });

      jQuery(document).bind('keydown', 'h', function() {
        _renderer.scrollLeft();
      });

      jQuery(document).bind('keydown', 'k', function() {
        _renderer.scrollUp();
      });

      jQuery(document).bind('keydown', 'l', function() {
        _renderer.scrollDown();
      });

      // Page ups and downs using ctrl + arrow keys
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
      
      jQuery(document).bind('keydown', 'i', function() {
        console.log('zoom in');
        _renderer.zoomIn();
      });

      jQuery(document).bind('keydown', 'o', function() {
        console.log('zoom out');
        _renderer.zoomOut();
      });

      _elem.mousewheel(function(event, delta) {
        var scrollLeft, scrollRight, scrollUp, scrollRight;

        if (event.ctrlKey) {
          // If ctrl key is down, we scroll by page.
          scrollLeft = _renderer.pageLeft;
          scrollRight = _renderer.pageRight;
          // If shift key is down, we do horizontal scroll instead of vertical.
          scrollDown = (event.shiftKey) ? _renderer.pageRight : _renderer.pageDown;
          scrollUp = (event.shiftKey) ? _renderer.pageLeft : _renderer.pageUp;
        } else {
          scrollLeft = _renderer.scrollLeft;
          scrollRight = _renderer.scrollRight;
          // If shift key is down, we do horizontal scroll instead of vertical.
          scrollDown = (event.shiftKey) ? _renderer.scrollRight : _renderer.scrollDown;
          scrollUp = (event.shiftKey) ? _renderer.scrollLeft : _renderer.scrollUp;
        }
        
        // Is mouse wheel scrolled horizontally?
        if (event.originalEvent.wheelDeltaX > 0) {
          scrollLeft();
        } else if (event.originalEvent.wheelDeltaX < 0) {
          scrollRight();
        }

        // Is mouse wheel scrolled vertically?
        if (event.originalEvent.wheelDeltaY > 0) {
            scrollUp();
        } else if (event.originalEvent.wheelDeltaY < 0) {
            scrollDown();
        }
      });
    }
    
    return this;
  };
})(jQuery, jMatrixBrowseNs);
