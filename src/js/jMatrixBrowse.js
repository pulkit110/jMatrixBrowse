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
    
    /**
     * Computes the new cell coordinates when a drag results in overflow.
     * @param {Number} overflow - Type of the overflow.
     */
    function computeNewCellCoordinates(overflow) {

      switch(overflow) {
        case Constants.OVERFLOW_TOP:
          ++_currentCell.row;
          break;
          
        case Constants.OVERFLOW_BOTTOM:
          --_currentCell.row;
          break;
          
        case Constants.OVERFLOW_LEFT:
          ++_currentCell.col;
          break;
          
        case Constants.OVERFLOW_RIGHT:
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
        case Constants.OVERFLOW_TOP:
          if (_currentCell.row >= getMatrixSize().height-1)
            return false;
          return true;
          
        case Constants.OVERFLOW_BOTTOM:
          if (_currentCell.row <= 0) 
            return false;
          return true;
          
        case Constants.OVERFLOW_LEFT:
          if (_currentCell.col >= getMatrixSize().width-1) 
            return false;
          return true;
          
        case Constants.OVERFLOW_RIGHT:
          if (_currentCell.col <= 0) 
            return false;
          return true;
      }
    }
    
    /**
     * Check and resposition cells that are overflowing.
     */
    function checkAndRepositionCells() {
      // TODO: We might need to check more elements in case of a quick drag. 
      
      // Row on top might overflow from the top.
      checkAndRepositionCellRow(_cellElements, _container, 1, Constants.OVERFLOW_TOP);
      // Row on bottom might overflow from the bottom.
      checkAndRepositionCellRow(_cellElements, _container, _cellElements.length-2, Constants.OVERFLOW_BOTTOM);
      // Column on left might overflow from the left.
      checkAndRepositionCellCol(_cellElements, _container, 1, Constants.OVERFLOW_LEFT);
      // Column on right might overflow from the right.
      checkAndRepositionCellCol(_cellElements, _container, _cellElements[0].length-2, Constants.OVERFLOW_RIGHT);
    }
    
    /**
     * Check and resposition headers according to cell positions.
     */
    function checkAndRepositionHeaders() {
      checkAndRepositionRowHeader(_headers.row);
      checkAndRepositionColumnHeader(_headers.col);
    }
    
    /**
     * Check and resposition headers according to cell positions.
     * @param header - row header container
     */
    function checkAndRepositionRowHeader(header) {
      header.children().each(function(index, element) {
        var containerOffset = _container.offset();
        var elementOffset = jQuery(_cellElements[index][0]).offset();
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
        var containerOffset = _container.offset();
        var elementOffset = jQuery(_cellElements[0][index]).offset();
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
     */
    function checkAndRepositionCellRow(cellElements, container, row, overflow) {
      if (cellElements[row].length > 0 && Utils.isOverflowing(jQuery(cellElements[row][0]), container, overflow) && isValidDrag(overflow)) {
        
        var previousCell = jQuery.extend({}, _currentCell); // Clone currentCell
        
        // There is an overflow.
        computeNewCellCoordinates(overflow);
        
        var cellRow;
        var direction;
        
        switch (overflow) {
          case Constants.OVERFLOW_TOP:
            direction = 'top';
            
            // The row is overflowing from top. Move it to bottom. 
            var height = cellElements.length;
            var lastCell = (cellElements[height-1].length > 0) ? jQuery(cellElements[height-1][0]) : undefined;
            if (lastCell === undefined) {
              console.error('Unable to resposition row ' + row + ' overflowing from top.')
              return;
            }
            
            var backgroundTopRow = 0; // TODO: get background top row
            
            // Change the position of all elements in the row.
            var newTop = lastCell.position().top + lastCell.height();
            for (var i = 0, w = cellElements[backgroundTopRow].length; i < w; ++i) {
              jQuery(cellElements[backgroundTopRow][i]).css({
                top: newTop
              });
            }
            
            // Move row in matrix to end
            cellRow = cellElements.splice(backgroundTopRow,1); // Remove row at [backgroundTopRow]
            if (cellRow.length > 0)
              cellElements.push(cellRow[0]);  // Insert row at the end.
            
            break;

          case Constants.OVERFLOW_BOTTOM:
            direction = 'bottom';
            
            // The row is overflowing from bottom. Move it to top.
            var firstCell = (cellElements.length > 0 && cellElements[0].length > 0)?jQuery(cellElements[0][0]):undefined;
            if (firstCell === undefined) {
              console.error('Unable to resposition row ' + row + ' overflowing from bottom.')
              return;
            }
            
            var backgroundBottomRow = cellElements.length-1; // TODO: get background bottom row
            
            // Change the position of all elements in the row.
            var newBottom = firstCell.position().top;
            for (var i = 0, w = cellElements[backgroundBottomRow].length; i < w; ++i) {
              jQuery(cellElements[backgroundBottomRow][i]).css({
                top: newBottom - jQuery(cellElements[backgroundBottomRow][i]).height()
              });
            }
            // Move row in matrix to first
            cellRow = cellElements.splice(backgroundBottomRow,1);  // Remove row at [backgroundBottomRow]
            if (cellRow.length > 0)
              cellElements.splice(0,0,cellRow[0]);  // Insert row at the beginning.
            
            break;
        }
        // Trigger event for change
        _elem.trigger({
          type: 'jMatrixBrowseChange',
          previousCell: previousCell,
          currentCell: _currentCell,
          direction: direction
        });
      
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
      if (Utils.isOverflowing(jQuery(cellElements[0][col]), container, overflow) &&  isValidDrag(overflow)) {
        
        var previousCell = jQuery.extend({}, _currentCell); // Clone currentCell
        
        // There is an overflow.
        computeNewCellCoordinates(overflow);
        
        var direction;
        switch (overflow) {
          case Constants.OVERFLOW_LEFT:
            direction = 'left';
            
            // The row is overflowing from left. Move it to right. 
            if (cellElements.length <= 0 || cellElements[0].length <= 0) {
              console.error('Unable to resposition col ' + col + ' overflowing from left.');
              return;
            }
            
            var backgroundLeftCol = 0; // TODO: Get position of background left col.
            
            // Change the position of all elements in the column.
            var w = cellElements[0].length;
            var lastCell = jQuery(cellElements[0][w-1]);
            var newLeft = lastCell.position().left + lastCell.width();
            for (var i = 0, h = cellElements.length; i < h; ++i) {
              jQuery(cellElements[i][backgroundLeftCol]).css({
                left: newLeft
              });
            }
            // Move col to end in matrix.
            for (var i = 0, h = cellElements.length; i < h; ++i) {
              var cell = cellElements[i].splice(backgroundLeftCol, 1); // Remove element at [i][col]
              cellElements[i].push(cell[0]); // Insert element at end of row i
            }
            break;

          case Constants.OVERFLOW_RIGHT:
            direction = 'right';
            
            // The row is overflowing from right. Move it to left. 
            if (cellElements.length <= 0 || cellElements[0].length <= 0) {
              console.error('Unable to resposition col ' + col + ' overflowing from left.');
              return;
            }
            
            var backgroundRightCol = cellElements[0].length-1; // TODO: Get position of background left col.
            
            var firstCell = jQuery(cellElements[0][0]);
            // Change the position of all elements in the column.
            var newRight = firstCell.position().left;
            for (var i = 0, h = cellElements.length; i < h; ++i) {
              jQuery(cellElements[i][backgroundRightCol]).css({
                left: newRight - jQuery(cellElements[i][backgroundRightCol]).width()
              });
            }
            // Move col to first in matrix.
            for (var i = 0, h = cellElements.length; i < h; ++i) {
              var cell = cellElements[i].splice(backgroundRightCol, 1); // Remove element at [i][col]
              cellElements[i].splice(0,0,cell[0]); // Insert element to [i][0]
            }
            break;
        }
        // Trigger event for change
        _elem.trigger({
          type: 'jMatrixBrowseChange',
          previousCell: previousCell,
          currentCell: _currentCell,
          direction: direction
        });
      }
    }

    /**
     * Reload column headers on change of matrix.
     * @param {Number} event.currentCell - currentCell at the top left
     * @param {Number} event.previousCell - previousCell at the top left
     * @param {string} event.direction - direction of drag that triggered the change
     */
    function reloadRowHeaders(event) {
      var nBackgroundCells = 1; // TODO
      var rowHeaders = getRowHeadersFromTopRow(event.currentCell.row-nBackgroundCells);
      _headers.row.children().each(function (index, element) {
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
      var colHeaders = getColHeadersFromLeftCol(event.currentCell.col-nBackgroundCells);
      _headers.col.children().each(function (index, element) {
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
      if (event.direction === 'top') {
        // If overflow from top, bottom row will have to be fetched.
        rowData = getRowDataForCell({
         row: event.currentCell.row - nBackgroundCells + _cellElements.length - 1,
         col: event.currentCell.col
        });
        rowToBeReplaced = _cellElements[_cellElements.length-1];
      } else {
        // If overflow from bottom, top row will have to be fetched.
        rowData = getRowDataForCell(event.currentCell - nBackgroundCells);
        rowToBeReplaced = _cellElements[0];
      }
      
      jQuery.each(rowToBeReplaced, function(index, cell) {
        jQuery(cell).html(rowData[index]);
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
      if (event.direction === 'left') {
        // If overflow from left, right column will have to be fetched. 
        colData = getColDataForCell({
         row: event.currentCell.row,
         col: event.currentCell.col - nBackgroundCells + _cellElements[0].length - 1 
        });
        colToBeReplacedIndex = _cellElements[0].length-1;
      } else {
        // If overflow from right, left column will have to be fetched.
        colData = getColDataForCell(event.currentCell - nBackgroundCells);
        colToBeReplacedIndex = 0;
      }
      
      for (var i = 0; i < _cellElements.length; ++i) {
        jQuery(_cellElements[i][colToBeReplacedIndex]).html(colData[i]);
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
      // Get user options
      var options = getUserOptions(elem);

      // Extending user options with application defaults
      var settings = extendDefaults(options);
      setSettings(settings);

      // Initialize mock api
      initApi('test');

      _elem = elem;
      
      // Create row and column headers.
      _headers = createRowColumnHeaderContainer(_elem);
      
      // Create draggable area and add matrix to it.
      var containers = createDragContainer(_elem);
      _dragContainer = containers.dragContainer;
      _container = containers.container;

      // Scroll to the initial position
      var windowPosition = getWindowPosition();
      _self.scrollTo(windowPosition.row, windowPosition.col);
      
      // Generate initial content
      _content = generateInitialMatrixContent(_dragContainer);
      
      // Generate row and column header content
      generateRowColumnHeaders(_headers);

      // Load data
      _self.reloadData();
      
      // Listen to events to implement reloading of data and headers
      
      // Listen for drag and reposition cells
      _elem.bind('jMatrixBrowseDrag', function (event) {
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
