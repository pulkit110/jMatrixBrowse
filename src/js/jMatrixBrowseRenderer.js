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

var _container;     // container for jMatrixBrowse
var _dragContainer; // Drag container that allows dragging using jQuery UI
var _cellElements;  // Array of array of cell elements.
var _headers;       // row and column headers.
var _content;       // content of jMatrixBrowse
var _cellPosition;  // cell position for the component
var _currentCell;   // currently shown cell (TODO: for now this cell is on left corner of matrix)
var _elem;          // container that initiated jMatrixBrowse

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
  colHeaderContainer.addClass(Constants.CLASS_BASE + '-col-header');
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
  rowHeaderContainer.addClass(Constants.CLASS_BASE + '-row-header');
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
  dragContainerContainer.addClass(Constants.CLASS_BASE+'-drag-container-container');
  container.append(dragContainerContainer);

  var dragContainer = jQuery(document.createElement('div'));
  dragContainer.draggable({
    drag: function (event, ui) {
      dragHandler(event, ui);
    }, 
    dragStart: function (event, ui) {
      dragStartHandler(event, ui);
    }, 
    dragStop: function (event, ui) {
      dragStopHandler(event, ui);
    }
  });
  dragContainer.addClass(Constants.CLASS_BASE+'-drag-container');
  dragContainerContainer.append(dragContainer);

  return {
    dragContainer: dragContainer,
    container: dragContainerContainer
  };
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
  var size = getMatrixSize();
  if (size == undefined) {
    console.error("Unable to get matrix size");
    return null;
  }
      
  var windowSize = getWindowSize();
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
      
  var windowPosition = getWindowPosition();
      
  _cellElements = [];
  var nBackgroundCells = 1; // TODO: Get number of background cells
  var height = windowSize.height + 2*nBackgroundCells; 
  var width = windowSize.width + 2*nBackgroundCells; // TODO: Get number of background cells
  var rowBegin = Math.max(0, windowPosition.row - nBackgroundCells);
  var colBegin = Math.max(0, windowPosition.col - nBackgroundCells);
      
  // Generate matrix content for only the rows that are in the window.
  var frag = document.createDocumentFragment();
  for (var row= rowBegin; row < rowBegin + height; row++) {
    _cellElements.push([]);
    for (var col = colBegin; col < colBegin + width; col++) {
      var elem = document.createElement("div");
      elem.style.backgroundColor = row%2 + col%2 > 0 ? "#ddd" : "whitesmoke";
      elem.style.width = cellWidth + "px";
      elem.style.height = cellHeight + "px";
      elem.style.position = "absolute";
      elem.style.top = (row-rowBegin-nBackgroundCells)*cellHeight + "px";
      elem.style.left = (col-colBegin-nBackgroundCells)*cellWidth + "px";
      elem.style.display = "inline-block";
      elem.style.textIndent = "6px";
      elem.innerHTML = row + "," + col;
      elem.className += " jMatrixBrowse-cell " + generateClassNameForCell(row, col);
      frag.appendChild(elem);
      _cellElements[row-rowBegin].push(elem);
    }
  }
  content.append(frag);
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
  var nBackgroundCells = 1; // TODO
  var rowHeaders = getRowHeadersFromTopRow(_currentCell.row-nBackgroundCells);
  var frag = document.createDocumentFragment();
  for (var row = 0, nRows = rowHeaders.length; row < nRows; ++row) {
    var cellElement = jQuery(_cellElements[row][0]);
    var elem = jQuery(document.createElement("div"));
    elem.addClass(Constants.CLASS_BASE+'-row-header-cell');
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
  var nBackgroundCells = 1; // TODO
  var colHeaders = getColHeadersFromLeftCol(_currentCell.col-nBackgroundCells);
  var frag = document.createDocumentFragment();
  for (var col = 0, nCols = colHeaders.length; col < nCols; ++col) {
    var cellElement = jQuery(_cellElements[0][col]);
    var elem = jQuery(document.createElement("div"));
    elem.addClass(Constants.CLASS_BASE+'-col-header-cell');
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