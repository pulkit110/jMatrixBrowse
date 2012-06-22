/**
 * @fileOverview Handles requests to the API.
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com> 
*/

var jMatrixBrowseNs = jMatrixBrowseNs || {};

(function (jQuery, jMatrixBrowseNS) {
  
  var _api;           // API object
  var _renderer;      // Reference to the renderer
  
  /**
   * Initialize the API
   * @param {string} type type of api: 'test' initializes the mockAPI
   */
  function initApi(type) {
    if (type === 'test') {
      _api = new MockApi();
    } else {
      console.error('API ' + type + 'not yet supported.');
    }
  };

 /**
   * Manages requests to the api. 
   * 
   * @param {jQuery Object} type - type of API to use.
   * @class jMatrixBrowseRenderer
   * @memberOf jMatrixBrowseNs
   */
  jMatrixBrowseNS.APIHandler = function(type) {
    var that = this;

    // Initialize the API
    initApi(type);
    
    /**
     * Get matrix size from api. 
     * @returns {Object} size - size of the matrix. 
     * @returns {Number} size.width - width of the matrix. 
     * @returns {Number} size.height - height of the matrix.
     */
    that.getMatrixSize = function() {
      var response = _api.getResponse({
        'row1': 0,
        'col1': 0,
        'row2': 0,
        'col2': 0
      });
      if (response)
        return response.matrix;
    };

    // TODO: Not yet implemented
    /**
     * Get the row headers for the current window from top row index. 
     * @param {Number} topRowIndex - index of the top row
     * @returns {Array} rowHeaders - Array of row headers
     */
    that.getRowHeadersFromTopRow = function(topRowIndex) {

      var height = _renderer.getCellElements().length;
      var rowHeaders = [];
      // TODO: Load from API
      for (var i = 0; i < height; ++i) {
        rowHeaders.push('row: ' + (topRowIndex+i));
      }
      return rowHeaders;
    };

    /**
     * Get the column headers for the current window from left column index. 
     * @param {Number} leftColIndex - index of the left column
     * @returns {Array} colHeaders - Array of column headers
     */
    that.getColHeadersFromLeftCol = function(leftColIndex) {
      var width = _renderer.getCellElements()[0].length;
      var colHeaders = [];
      // TODO: Load from API
      for (var i = 0; i < width; ++i) {
        colHeaders.push('col: ' + (leftColIndex+i));
      }
      return colHeaders;
    };

    /**
     * Get the row data for the row index for current window. 
     * @param {Object} cell - row and column index of cell
     * @returns {Array} rowData - Array of row data
     */
    that.getRowDataForCell = function(cell) {
      var nBackgroundCells = 1; // TODO:
      var rowData = [];
      var response = _api.getResponse({
        row1: cell.row,
        col1: cell.col - nBackgroundCells,
        row2: cell.row,
        col2: cell.col - nBackgroundCells + _renderer.getCellElements()[0].length
      });
      if (response && response.data && response.data.length == 1) {
        for (var j = 0; j < response.data[0].length; ++j) {
          var cellData = response.data[0][j]; 
          rowData.push(cellData);
        }
      }
      return rowData;
    };

    /**
    * Get the col data for the col index for current window. 
    * @param {Object} cell - row and column index of cell.
    * @returns {Array} colData - Array of col data.
    */
    that.getColDataForCell = function(cell) {
      var nBackgroundCells = 1; // TODO:
      var colData = [];
      var response = _api.getResponse({
        row1: cell.row - nBackgroundCells,
        col1: cell.col,
        row2: cell.row  - nBackgroundCells + _renderer.getCellElements().length,
        col2: cell.col
      });
      if (response && response.data) {
        for (var i = 0; i < response.data.length; ++i) {
          var cellData = response.data[i][0]; 
          colData.push(cellData);
        }
      }
      return colData;
    };

    /**
     * Sets the renderer.
     * @param {Object} renderer
     */
    that.setRenderer = function(renderer) {
      _renderer = renderer;
    };
    
    /**
     * Gets the response for a request. No checks are performed. 
     * @param {Object} request - request to send to server. See (https://github.com/pulkit110/jMatrixBrowse/wiki/API-Details)
     * @returns response received from the server. 
     */
    that.getResponse = function(request) {
      return _api.getResponse(request);
    };
    
    return that;
  };
  
})(jQuery, jMatrixBrowseNs);
