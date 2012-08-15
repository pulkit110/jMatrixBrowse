/**
 * @fileOverview Handles requests to the API.
 * 
 * Handles the requests to API. All the requests to the API are sent through 
 * this class rather than directly making requests to the API. To manage data 
 * of different formats, the user can implement his own API class that 
 * implements the public methods for the module.
 * 
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com> 
*/

var jMatrixBrowseNs = jMatrixBrowseNs || {};

(function (jQuery, jMatrixBrowseNs) {
  
  /**
   * An instance of api that sends requests to url and receives response.
   * 
   * @param {string} url - url to make requests.
   * @class NetworkedAPI
   * @memberOf jMatrixBrowseNs
   */
  jMatrixBrowseNs.NetworkedAPI = function(url) {

    var that = this;

    // Get the matrix size.
    jQuery.ajax({
      url: url,
      dataType: 'json',
      data: {
        'row1': 0,
        'col1': 0,
        'row2': 0,
        'col2': 0
      },
      async: false,
      success: function(data, textStatus, xhr) {
        that.matrixSize = data.matrix;
      }
    });

    /**
     * Gets the response for a request. No checks are performed.
     * callback is called with the response received from api as a parameter.
     * @param {Object} request - request to send to server. See (https://github.com/pulkit110/jMatrixBrowse/wiki/API-Details)
     */
    this.getResponseAsync = function(request, callback) {
      jQuery.getJSON(url, request, function(data, textStatus, xhr) {
        callback.call(this, data);
      });
    };

    /**
     * Gets the response data for a request. No checks are performed.
     * callback is called with the data received from api as a parameter.
     * @param {Object} request - request to send to server. See (https://github.com/pulkit110/jMatrixBrowse/wiki/API-Details)
     */
    this.getResponseDataAsync = function(request, callback) {
      jQuery.getJSON(url, request, function(data, textStatus, xhr) {
        callback.call(this, data.data);
      });
    };

    /**
     * Gets the matrix size.
     * @return {Object} height, width of the matrix.
     */
    this.getMatrixSize = function() {
      return this.matrixSize;
    };

  };

 /**
   * Manages requests to the api. 
   * 
   * @param {jQuery Object} type - type of API to use.
   * @param {string} url - The url for sending requests. Optional for type `test`.
   * @class APIHandler
   * @memberOf jMatrixBrowseNs
   */
  jMatrixBrowseNs.APIHandler = function(type, url) {
    var that = this;
    
    // Row and column headers are going to be very few, so we can cache them.
    that.cache = {
      rowHeaders : [],
      colHeaders : []
    };

    // Initialize the API
    initApi(type);
    
    /**
     * Get matrix size from api. 
     * @returns {Object} size - size of the matrix. 
     * @returns {Number} size.width - width of the matrix. 
     * @returns {Number} size.height - height of the matrix.
     */
    this.getMatrixSize = function() {
      return _api.getMatrixSize();
    };

    // TODO: Not yet implemented
    /**
     * Get the row headers for the current window from top row index. 
     * @param {Number} topRowIndex - index of the top row
     * @returns {Array} rowHeaders - Array of row headers
     */
    this.getRowHeadersFromTopRow = function(topRowIndex) {
      var height = _renderer.getCellElements().length;
      var rowHeaders = [];
      for (var i = 0; i < height; ++i) {
        rowHeaders.push(that.cache.rowHeaders[topRowIndex + i]);
      }
      return rowHeaders;
    };

    /**
     * Get the column headers for the current window from left column index. 
     * @param {Number} leftColIndex - index of the left column
     * @returns {Array} colHeaders - Array of column headers
     */
    this.getColHeadersFromLeftCol = function(leftColIndex) {
      var width = _renderer.getCellElements()[0].length;
      var colHeaders = [];
      for (var i = 0; i < width; ++i) {
        colHeaders.push(that.cache.colHeaders[leftColIndex + i]);
      }
      return colHeaders;
    };

    /**
     * Get the row data for the row index for current window. 
     * @param {Object} cell - row and column index of cell
     * @returns {Array} rowData - Array of row data
     * @deprecated You need to pass in the full window now. See getResponseData.
     */
    this.getRowDataForCell = function(cell) {
      var nBackgroundCells = jMatrixBrowseNs.Constants.N_BACKGROUND_CELLS;
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
     * @deprecated You need to pass in the full window now. See getResponseData.
     */
    this.getColDataForCell = function(cell) {
      var nBackgroundCells = jMatrixBrowseNs.Constants.N_BACKGROUND_CELLS;
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
    this.setRenderer = function(renderer) {
      _renderer = renderer;
    };
    
    /**
     * Gets the response for a request. No checks are performed. 
     * @param {Object} request - request to send to server. See (https://github.com/pulkit110/jMatrixBrowse/wiki/API-Details)
     * @returns response received from the server. 
     */
    this.getResponse = function(request) {
      var response = _api.getResponse(request);
      cacheHeaders(request, response);
      return response;
    };

    /**
     * Gets the response data for a request. No checks are performed.
     * @param {Object} request - request to send to server. See (https://github.com/pulkit110/jMatrixBrowse/wiki/API-Details)
     * @returns response.data received from the server.
     */
    this.getResponseData = function(request) {
      var response = _api.getResponse(request);
      cacheHeaders(request, response);
      return response.data;
    };

    /**
     * Gets the response for a request. No checks are performed.
     * callback is called with the response received from api as a parameter.
     * This method will eventually replace the getResponseAsync the older method is not very useful with a live API.
     * @param {Object} request - request to send to server. See (https://github.com/pulkit110/jMatrixBrowse/wiki/API-Details)
     */
    that.getResponseAsync = function(request, callback) {
      _api.getResponseAsync(request, function(response) {
        cacheHeaders(request, response);
        callback.call(this, response);
      });
    };

    /**
     * Gets the response data for a request. No checks are performed.
     * callback is called with the data received from api as a parameter.
     * This method will eventually replace the getResponseData the older method is not very useful with a live API.
     * @param {Object} request - request to send to server. See (https://github.com/pulkit110/jMatrixBrowse/wiki/API-Details)
     */
    that.getResponseDataAsync = function(request, callback) {
      that.getResponseAsync(request, function(response) {
        callback.call(that, response.data);
      });
    };

    // Private methods
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
        _api = new jMatrixBrowseNs.NetworkedAPI(url);
      }
    };

    function cacheHeaders(request, response) {
      for (var i = request.row1; i <= request.row2; ++i) {
        that.cache.rowHeaders[i] = response.row.labels[i-request.row1];
      }
      for (var j = request.col1; j <= request.col2; ++j) {
        that.cache.colHeaders[j] = response.column.labels[j-request.col1];
      }
    }
    
    return that;
  };
  
})(jQuery, jMatrixBrowseNs);
