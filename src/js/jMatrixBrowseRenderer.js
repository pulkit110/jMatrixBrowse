/**
 * @fileOverview Contains the jMatrixBrowse rendering code.
 * 
 * Handles rendering of jMatrixBrowse and manages the dragging, keyboard
 * shortcuts and mouse shortcuts. This doesn't perform reloading of the data
 * which is handled by catching corresponding events in jMatrixBrowse.
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

var jMatrixBrowseNs = jMatrixBrowseNs || {};

(function (jQuery, jMatrixBrowseNs) {

  /**
   * jMatrixBrowse Renderer manages the rendering of elements as well as row and 
   * column headers. Init should be called after creating the object to initialize 
   * the matrix. 
   * 
   * @param {jQuery Object} elem - element that initiated jMatrixBrowse.
   * @param {Object} configuration - configuration for jMatrixBrowse.
   * @param {Object} api - api manager for making requests to api.
   * @class jMatrixBrowseRenderer
   * @memberOf jMatrixBrowseNs
   */
  jMatrixBrowseNs.jMatrixBrowseRenderer = function(elem, configuration, api) {
    var that = this;
    
    var _dragContainer;       // Drag container that allows dragging using jQuery UI
    var _cellElements;        // Array of array of cell elements.
    var _headers;             // row and column headers.
    var _elem;                // container that initiated jMatrixBrowse
    var _configuration;       // configuration for the current instance of jMatrixBrowse
    var _api;                 // api manager
    var _self;                // reference to self
    var _dragActive = false;  // boolean to indicate if drag is active
    var _container;           // container for jMatrixBrowse

    var _positions = new Array();            // last few positions for drag.
    var _isAnimating = false;          // is the scroller animating.
    var _wasAnimating = false;          // was the scroller animating.
    var _decelerationVelocity; // velocity of animation.

    _self = that;
    _elem = elem;
    _configuration = configuration;
    _api = api;
    
    // Add class for jMatrixBrowse container
    elem.addClass('jmb-matrix-container');
    
    /**
     * Initializes the jMatrixBrowseRenderer component. 
     * This creates the required contianers and generates content in the matrix.
     * @param  {Object} windowPosition - position of first cell in window (properties: row and col)
     */
    this.init = function(windowPosition) {
      // TODO: This is a hack
      _api.setRenderer(that);
        
      // Create row and column headers.
      _headers = createRowColumnHeaderContainer(_elem);

      // Create draggable area and add matrix to it.
      var containers = createDragContainer(_elem);
      _dragContainer = containers.dragContainer;
      _container = containers.container;

      // Scroll to the window position
      scrollTo(windowPosition.row, windowPosition.col);

      // Generate initial content
      _content = generateInitialMatrixContent(_dragContainer);

      // Generate row and column header content
      generateRowColumnHeaders(_headers);

      _elem.trigger('jMatrixBrowseRendererInitialized');
    };

    /**
     * Gets the cell elements.
     * @returns {Array of Array of DOM elements} Elements in the cell.
     */
    this.getCellElements = function() {
      return _cellElements;
    };
    
    /**
     * Gets the row and column headers.
     * @returns {Object} headers - row and column headers.
     * @returns {jQuery Object} headers.row - row header.
     * @returns {jQuery Object} headers.col - column header.
     */
    this.getHeaders = function() {
      return _headers;
    };
    
    /**
     * Gets the container for jMatrixBrowse.
     * @returns {jQuery Object} The container for jMatrixBrowse.
     */
    this.getContainer = function() {
      return _container;
    };

    /**
     * Moves the row to bottom. 
     * @param {Number} row - index of the row to be moved.
     * @returns {boolean} true if the operation was successful. false otherwise.
     */
    this.moveRowToEnd = function(row) {
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

      addSpinners({
        row1: _cellElements.length-1,
        row2: _cellElements.length-1
      }, {
        col1: 0,
        col2: _cellElements[0].length-1
      });

      return true;
    };
    
    /**
     * Moves the row to top. 
     * @param {Number} row - index of the row to be moved.
     * @returns {boolean} true if the operation was successful. false otherwise.
     */
    this.moveRowToTop = function(row) {
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
      
      addSpinners({
        row1: 0,
        row2: 0
      }, {
        col1: 0,
        col2: _cellElements[0].length-1
      });
      return true;
    };
    
    /**
     * Moves a column to right. 
     * @param {Number} col - index of the column to be moved.
     * @returns {boolean} true if the operation was successful. false otherwise.
     */
    this.moveColToRight = function(col) {
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

      addSpinners({
        row1: 0,
        row2: _cellElements.length-1
      }, {
        col1: _cellElements[0].length-1,
        col2: _cellElements[0].length-1
      });
      return true;
    };
    
    /**
     * Moves a column to left. 
     * @param {Number} col - index of the column to be moved.
     * @returns {boolean} true if the operation was successful. false otherwise.
     */
    this.moveColToLeft = function(col) {
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

      addSpinners({
        row1: 0,
        row2: _cellElements.length-1
      }, {
        col1: 0,
        col2: 0
      });
      return true;
    };
    
    /**
     * Scrolls the matrix one cell to the right.
     */
    this.scrollRight = function() {
      if (checkScrollBounds('right'))
        scrollCols('right', 1);
    };

    /**
     * Scrolls the matrix one cell to the left.
     */
    this.scrollLeft = function() {
      if (checkScrollBounds('left'))
        scrollCols('left', 1);
    };
        
    /**
     * Scrolls the matrix one row up.
     */
    this.scrollUp = function() {
      if (checkScrollBounds('up'))
        scrollRows('up', 1);
    };
    
    /**
     * Scrolls the matrix one row down.
     */
    this.scrollDown = function() {
      if (checkScrollBounds('down'))
        scrollRows('down', 1);
    };
    
    /**
     * Scrolls the matrix one page up.
     */
    this.pageUp = function() {
      var nRowsToScroll = getNumberOfRowsForPageScroll('up');
      scrollRows('up', nRowsToScroll);
    };
    
    /**
     * Scrolls the matrix one page down.
     */
    this.pageDown = function() {
      var nRowsToScroll = getNumberOfRowsForPageScroll('down');
      scrollRows('down', nRowsToScroll);
    };
    
    /**
     * Scrolls the matrix one page left.
     */
    this.pageLeft = function() {
      var nColsToScroll = getNumberOfColsForPageScroll('left');
      scrollCols('left', nColsToScroll);
    };
    
    /**
     * Scrolls the matrix one page right.
     */
    this.pageRight = function() {
      var nColsToScroll = getNumberOfColsForPageScroll('right');
      scrollCols('right', nColsToScroll);
    };

    /**
     * Snap the element to grid.
     * If called without any argument, it finds the element closest to the boundary (TODO) to snap.
     * If the direction is not defined, it snaps to both the top and left.
     * Otherwise, it snaps the given element in the given direction.
     *
     * @param {jQuery Object} element - the element to snap to grid (optional).
     * @param {string} - the direction to snap (from top, left) (optional).
     */
    this.snapToGrid = function(element, direction) {

      if (element === undefined && direction === undefined) {
        _self.snapToGrid(getCellToSnap());
        return;
      }
      
      // Get element and container offsets
      var containerOffset = _container.offset();
      var elementOffset = element.offset();
      var dragContainerOffset = _dragContainer.offset();

      if (direction === 'top' || direction === undefined) {
        // The posoition.top of the element relative to cotainter.
        var top = elementOffset.top - containerOffset.top;
        if (top !== 0) { // Element is not already snapped
          dragContainerOffset.top -= top;
        }
      }
      if (direction === 'left' || direction === undefined) {
        // The posoition.left of the element relative to cotainter.
        var left = elementOffset.left - containerOffset.left;
        if (left !== 0) { // Element is not already snapped
          dragContainerOffset.left -= left;
        }
      }

      _dragContainer.offset(dragContainerOffset);
    }

    /**
     * Zooms one level in.
     */
    this.zoomIn = function() {
      // Set the window size in Configuration
      var currentSize = _configuration.getWindowSize();
      _configuration.setWindowSize({
        height: Math.max(1, currentSize.height - jMatrixBrowseNs.Constants.ZOOM_LEVEL_DIFFERENCE),
        width: Math.max(1, currentSize.width - jMatrixBrowseNs.Constants.ZOOM_LEVEL_DIFFERENCE)
      });

      // Remove already existing containers.
      cleanup();

      // Initialize with the new window size.
      _self.init(_self.currentCell);
    };

    /**
     * Zooms one level out.
     */
    this.zoomOut = function() {
      // Set the window size in Configuration
      var currentSize = _configuration.getWindowSize();
      var windowSize = {
        height: Math.min(jMatrixBrowseNs.Constants.ZOOM_MAX_WINDOW_SIZE.height, _api.getMatrixSize().height, currentSize.height + jMatrixBrowseNs.Constants.ZOOM_LEVEL_DIFFERENCE),
        width: Math.min(jMatrixBrowseNs.Constants.ZOOM_MAX_WINDOW_SIZE.width, _api.getMatrixSize().width, currentSize.width + jMatrixBrowseNs.Constants.ZOOM_LEVEL_DIFFERENCE)
      };
      _configuration.setWindowSize(windowSize);

      // Update the position of window (if required)
      var matrixSize = _api.getMatrixSize();
      var windowPosition = _self.currentCell;
      windowPosition = {
        row: (windowPosition.row + windowSize.height > matrixSize.height)?(matrixSize.height - windowSize.height):windowPosition.row,
        col: (windowPosition.col + windowSize.width > matrixSize.width)?(matrixSize.width - windowSize.width):windowPosition.col
      };

      // Remove already existing containers.
      cleanup();
      
      // Initialize with the new window size.
      _self.init(windowPosition);
    };

    this.getIsAnimating = function() {
      return _isAnimating;
    };

    // Private methods
    /**
     * Removes all the DOM elements created by jMatrixBrowseRenderer. 
     */
    function cleanup() {
      _headers.row.remove();
      _headers.col.remove();
      _dragContainer.remove();
      _container.remove();
    }

    /**
    * Create the content div and append to container.
    * @param {jQuery Object} container - container to attacht the content to.
    * @returns {jQuery Object} content 
    */
    function createContentDiv(container) {
      var content = jQuery(document.createElement('div')).addClass('jMatrixBrowse-content');
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
      // Create the container that holds the drag container. 
      var dragContainerContainer = jQuery(document.createElement('div'));
      // TODO: Move css to stylesheet. 
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

      // Create drag container. 
      var dragContainer = jQuery(document.createElement('div'));
      dragContainer.draggable({
        drag: function (event, ui) {
          dragHandler(event, ui);

          // Store the positions.
          _positions.push({
            position: ui.position, 
            timestamp: new Date().getTime()
          });

          // Keep list from growing infinitely (holding min 10, max 20 measure points)
          if (_positions.length > 60) {
            _positions.splice(0, 30);
          }
        }, 
        start: function (event, ui) {
          dragStartHandler(event, ui);
        }, 
        stop: function (event, ui) {
          dragStopHandler(event, ui);
        },
        containment: [ 0, 0, 2000, 2000]
      });
      // Override the original _generatePosition in draggable to check for matrix bounds on drag.
      dragContainer.draggable().data("draggable")._generatePosition = function(event) {
        return generatePositionsForDrag(dragContainer.draggable().data("draggable"), event);
      };

      dragContainer.addClass(jMatrixBrowseNs.Constants.CLASS_BASE+'-drag-container');
      dragContainerContainer.append(dragContainer);

      return {
        dragContainer: dragContainer,
        container: dragContainerContainer
      };
    }

    /**
     * Begin animating the matrix using _decelartionVelocity.
     * This uses cubic easing to ease out the animation. The duration of the animation can be set in configuration.
     */
    function startAnimation() {
      var duration = _configuration.getAnimationDuration();

      if (_wasAnimating) {
        // Increase velocity if element was already animating. 
        _decelerationVelocity.y *= 2;
        _decelerationVelocity.x *= 2;
      }
      _dragContainer.animate({
        top: '+=' + _decelerationVelocity.y * duration,
        left: '+=' + _decelerationVelocity.x * duration
      }, {
        duration: duration, 
        easing: (!_wasAnimating)?'easeOutCubic':'easeInOutCubic', // If the animation was already running, use easeInOutCubic. 
        step: function(now, fx) {
          // Trigger the animation step event.
          _elem.trigger({
            type: 'jMatrixBrowseAnimationStep',
            now: now,
            fx: fx
          });
        }, 
        complete: function() {
          _isAnimating = false;

          // Check if the new position crosses bounds and revert to the boundaries of matrix if bounds are crossed. 
          var position = checkPositionBounds (jQuery(this).position(), {top: 0, left:0}, _dragContainer.draggable().data("draggable"));
          _dragContainer.animate(position, {
            duration: 'fast',
            complete: function() {
              // Trigger animation complete event.
              _elem.trigger({
                type: 'jMatrixBrowseAnimationComplete'
              });
            }
          });  
        }
      });

      // Animation has started.
      _isAnimating = true;
    }
    
    /**
    * Generate new positions of the draggable element. This is used to override
    * the original generate positions which had no way of specifying dynamic
    * containment. This checks if the drag is valid by looking at the matrix
    * coordinates and returns the new top and left positions accordingly.
    *
    * @param {Object} draggable - draggable object data.
    * @param {Object} event - event that initiated the drag.
    * @returns {Object} positions - new position of the draggable.
    */
    function generatePositionsForDrag(draggable, event) {
      var o = draggable.options, scroll = draggable.cssPosition == 'absolute' && !(draggable.scrollParent[0] != document && $.ui.contains(draggable.scrollParent[0], draggable.offsetParent[0])) ? draggable.offsetParent : draggable.scrollParent, scrollIsRootNode = (/(html|body)/i).test(scroll[0].tagName);
      var pageX = event.pageX;
      var pageY = event.pageY;

      var newPosition = {
        top: (
                pageY															// The absolute mouse position
                - draggable.offset.click.top												// Click offset (relative to the element)
                - draggable.offset.relative.top												// Only for relative positioned nodes: Relative offset from element to offset parent
                - draggable.offset.parent.top												// The offsetParent's offset without borders (offset + border)
                + (jQuery.browser.safari && jQuery.browser.version < 526 && draggable.cssPosition == 'fixed' ? 0 : ( draggable.cssPosition == 'fixed' ? -draggable.scrollParent.scrollTop() : ( scrollIsRootNode ? 0 : scroll.scrollTop() ) ))
        ),
        left: (
                pageX															// The absolute mouse position
                - draggable.offset.click.left												// Click offset (relative to the element)
                - draggable.offset.relative.left												// Only for relative positioned nodes: Relative offset from element to offset parent
                - draggable.offset.parent.left												// The offsetParent's offset without borders (offset + border)
                + (jQuery.browser.safari && jQuery.browser.version < 526 && draggable.cssPosition == 'fixed' ? 0 : ( draggable.cssPosition == 'fixed' ? -draggable.scrollParent.scrollLeft() : scrollIsRootNode ? 0 : scroll.scrollLeft() ))
        )
      };

      // Impose contraints on newPosition to prevent crossing of matrix bounds. 
      // Compute change in position for the drag.
      var changeInPosition = {
        top: (draggable._convertPositionTo("absolute", newPosition).top - draggable.positionAbs.top),
        left: (draggable._convertPositionTo("absolute", newPosition).left - draggable.positionAbs.left)
      };

      return checkPositionBounds(newPosition, changeInPosition, draggable);
    }

    /**
     * Checks the bounds for the matirx from four directions to find if the bounds are violated and returns the new positions.
     * @param  {Object} newPosition - The new position of the container for which to check the bounds.
     * @param  {Object} changeInPosition - The change in position. {top:0, left:0} can be passed here.
     * @param  {Object} draggable - The draggable instance.
     * @returns {Object} newPosition of the container.
     */
    function checkPositionBounds (newPosition, changeInPosition, draggable) {
      
      var firstRow = (_self.currentCell.row == 0)?1:0;
      var firstCol = (_self.currentCell.col == 0)?1:0;
      // Get element and container offsets
      var element = jQuery(_cellElements[firstRow][firstCol]);
      var containerOffset = _container.offset();
      var elementOffset = element.offset();

      // If we are at the topmost cell, then check that bounds from the top are maintained.
      if (_self.currentCell.row <= 1) {
        // The new posoition.top of the first element relative to cotainter.
        var top = changeInPosition.top + elementOffset.top - containerOffset.top;
        if (top > 0) { // The drag crosses matrix bounds from the top.
          newPosition.top = newPosition.top - top;
        }
      }

      // If we are at the leftmost cell, then check that bounds from the left are maintained.
      if (_self.currentCell.col <= 1) {
        // The new posoition.top of the first element relative to cotainter.
        var left = changeInPosition.left + elementOffset.left - containerOffset.left;
        if (left > 0) { // The drag crosses matrix bounds from the left.
          newPosition.left = newPosition.left - left;
        }
      }

      // Get element offset for last element
      element = jQuery(_cellElements[_cellElements.length-1][_cellElements[0].length-1]);
      elementOffset = element.offset();

      // If we are at the bottomost cell, then check that bounds from the bottom are maintained.
      if (_self.currentCell.row - _configuration.getNumberOfBackgroundCells() + _cellElements.length - 1 >= _api.getMatrixSize().height-1) {
        var containerBottom = (containerOffset.top + _container.height());
        var elementBottom = (changeInPosition.top + elementOffset.top + element.height());
        // The new posoition.bottom of the last element relative to cotainter.
        var bottom =  containerBottom - elementBottom;
        if (bottom > 0) { // The drag crosses matrix bounds from the bottom.
          newPosition.top = newPosition.top + bottom;
        }
      }

      // If we are at the leftmost cell, then check that bounds from the left are maintained.
      if (_self.currentCell.col - _configuration.getNumberOfBackgroundCells() + _cellElements[0].length - 1 >= _api.getMatrixSize().width-1) {
        // The new posoition.right of the first element relative to cotainter.
        var containerRight = (containerOffset.left + _container.width());
        var newElementRight = (changeInPosition.left + elementOffset.left + element.width());
        var right =  containerRight - newElementRight;
        if (right > 0) { // The drag crosses matrix bounds from the left.
          newPosition.left = newPosition.left + right;
        }
      }

      return newPosition;
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

      // Stop any existing animations.
      if (_isAnimating) {
        _dragContainer.stop();
        _wasAnimating = true;
        _isAnimating = false;
      } else {
        _wasAnimating = false;
      }

      event.type = 'jMatrixBrowseDragStart';
      _elem.trigger(event);
    }

    /**
    * Function that handles the drag stop event on dragContainer.
    * @param {Object} event - Drag event.
    * @param {Object} ui
    */
    function dragStopHandler (event, ui) {
      var timestamp = new Date().getTime();

      // Check if animation is enabled.
      if (_configuration.animateEnabled()) {
        var endPositionIndex = _positions.length - 1;
        // Check if we need to start animation.
        if (timestamp - _positions[endPositionIndex].timestamp < 1000) {
          var startPositionIndex = endPositionIndex;
          // Get the position where we were 100 msec before
          for (var i = endPositionIndex; i > 0 && _positions[i].timestamp > (_positions[endPositionIndex].timestamp - 100); --i) {
            startPositionIndex = i;
          };

          // If start and end position are the same, we can't compute the velocity
          if (startPositionIndex !== endPositionIndex) {
            // Compute relative movement between these two points
            var timeOffset = _positions[endPositionIndex].timestamp - _positions[startPositionIndex].timestamp;
            var movedLeft = _positions[endPositionIndex].position.left - _positions[startPositionIndex].position.left;
            var movedTop = _positions[endPositionIndex].position.top - _positions[startPositionIndex].position.top;

            // Compute the deceleration velocity
            _decelerationVelocity = {
              x: movedLeft / timeOffset,
              y: movedTop / timeOffset
            };

            // Check if we have enough velocity for animation
            _decelerationVelocity.x = (Math.abs(_decelerationVelocity.x) < _configuration.getMinVelocityForAnimation()) ? 0 : _decelerationVelocity.x;
            _decelerationVelocity.y = (Math.abs(_decelerationVelocity.y) < _configuration.getMinVelocityForAnimation()) ? 0 : _decelerationVelocity.y;

            if (Math.abs(_decelerationVelocity.x) > 0 || Math.abs(_decelerationVelocity.y) > 0) {
              // Begin animation with deceleration.
              startAnimation();
            }
          }
        }
      }

      // Trigger the drag stop event.
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
      var width = windowSize.width + 2*_configuration.getNumberOfBackgroundCells();
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
      _elem.find('.jMatrixBrowse-cell').click(function(event) {
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

      if (direction === 'up' && _self.currentCell.row < 1) {
        return false;
      }
      if (direction === 'down' && _self.currentCell.row - _configuration.getNumberOfBackgroundCells() + _cellElements.length - 1 > size.height - 1) {
        return false;
      }
      if (direction === 'right' && _self.currentCell.col - _configuration.getNumberOfBackgroundCells() + _cellElements[0].length - 1 > size.width - 1) {
        return false;
      }
      if (direction === 'left' && _self.currentCell.col < 1) {
        return false;
      }
      return true;
    }

    /**
    * Finds the cell that is closest to the top left boundaries.
    * Checks only a few cells on the top.
    * @returns {jQuery Object} cell that is closest to the top left boundary.
    */
    function getCellToSnap() {
      // Define the number of rows an columns to check starting from the top corner. 
      var numberOfRowsToCheck = 2 * _configuration.getNumberOfBackgroundCells() + 1;
      var numberOfColsToCheck = 2 * _configuration.getNumberOfBackgroundCells() + 1;
      // Store the cells and distances that we check.
      var cells = [];
      var distances = [];
      // Compute container offset to find distances from cells.
      var containerOffset = _container.offset();
      for (var i = 0; i < numberOfRowsToCheck && i < _cellElements.length; ++i) {
          for (var j = 0; j < numberOfColsToCheck && j < _cellElements[i].length; ++j) {
              var offset = jQuery(_cellElements[i][j]).offset();
              distances.push((offset.top - containerOffset.top)*(offset.top - containerOffset.top) + (offset.left - containerOffset.left)*(offset.left - containerOffset.left)); // Squared distance of the cell's top,left with container's top, left.
              cells.push(jQuery(_cellElements[i][j]));
          }
      }
      return cells[jMatrixBrowseNs.Utils.findIndexOfMin(distances).minIndex];
    }
    
    /**
     * Gets the number of rows that can be scrolled for a page up/down event without violating the matrix bounds.
     * @param  {string} direction the direction of the scroll.
     * @return {Number} the number of rows that can be safely scrolled.
     */
    function getNumberOfRowsForPageScroll(direction) {
      var height = _configuration.getWindowSize().height;
      if (direction === 'up') {
        var newTopRow = _self.currentCell.row - height;
        if (newTopRow < 1) {
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
          // Move bottommost row to the top
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

    function addSpinners(rowIndex, colIndex) {
      for (var i = rowIndex.row1; i <= rowIndex.row2; ++i) {
        for (var j = colIndex.col1; j <= colIndex.col2; ++j) {
          jQuery(_cellElements[i][j]).html('<div class="jMatrixBrowse-loading"/>');
        }
      }
    }
    
    return that;
  };
  
})(jQuery, jMatrixBrowseNs);
