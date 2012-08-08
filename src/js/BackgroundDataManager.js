/**
 * @fileOverview Manages background loading of data for jMatrixBrowse.
 * 
 * When initiated, it loads the data for the complete matrix in the DOM. 
 * Other components should make requests to this to obtain data to be loaded
 * in the matrix rather than directly speaking with the API as this module
 * will manage the data already cached form the API and make additional requests 
 * if necessary. 
 * 
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com>
*/

var jMatrixBrowseNs = jMatrixBrowseNs || {};

(function (jQuery, jMatrixBrowseNs) {

  /**
   * Manages backgorund loading for jMatrixBrowse.
   *
   * @param {jQuery Object} elem - element that initiated jMatrixBrowse.
   * @param {Object} api - api manager for making requests to api.
   * @class BackgroundDataManager
   * @memberOf jMatrixBrowseNs
   */
  jMatrixBrowseNs.BackgroundDataManager = function(elem, api, config) {
    var that = this;

    var _backgroundDataContainer; // Container for background data.
    
    var _windowLoaded = {
      row1: 0,
      col1: 0,
      row2: 0,
      col2: 0
    };

    var backgroundLoadingWindowSize = {height: 20, width: 20}; // TODO: Move to config
    
    var _elem = elem;     // Element that triggered jMatrixBrowse.
    var _api = api;       // api manager
    var _config = config; // jMatrixBrowse configuration.

    beginLoadingData();

    // Public methods
    this.getCellsForRequest = function(request, callback) {
      // Create a request dynamically to load only the cells which have not already been loaded.
      var requests = getRequiredRequests(request);

      if (requests.length > 0) {
        // Make requests for required data and merge the responses in one matrix of cells
        var numberOfResponsesToReceive = requests.length;
        var responses = new Array(numberOfResponsesToReceive);
        for (var i = requests.length - 1; i >= 0; i--) {
          (function(i) {
            _api.getResponseDataAsync(requests[i], function(data) {
              responses[i] = data;
              -- numberOfResponsesToReceive;
              if (numberOfResponsesToReceive == 0) {
                // All responses have been loaded. Combine responses by taking the data from responses and background cells
                var cells = combineResponses(requests, responses, request);
                callback.call(this, cells);
              }
            });
          })(i);
        };
      } else {
        // No need to make requests to the api.
        var cells = [];
        for (var i = request.row1; i <= request.row2; ++i) {
          cells.push([]);
          for (var j = request.col1; j <= request.col2; ++j) {
            var cellSelector = '.jMatrixBrowse-background-cell[data-row=' + i + '][data-col=' + j + ']';
            cells[i-request.row1].push(_elem.find(cellSelector));
          }
        }
        callback.call(this, cells);
      }
    };

    /**
     * Gets the curernt window that has been loaded by the background data manager.
     * 
     * @returns {Object} windowLoaded - window (row1, col1, row2, col2) of cells that have been loaded. 
     */
    this.getWindowLoaded = function() {
      return _windowLoaded;
    };

    // Private methods
    /**
    * Begins loading all the data into the dom.
    * This creates a new container to hold the data inside elem.
    */
    function beginLoadingData() {

      // Create container for keeping background data.
      _backgroundDataContainer = jQuery('<div/>', {
        className: 'jMatrixBrowse-background-data-container'
      }).appendTo(_elem);

      (function loadData(request){
        setTimeout(function(){
          // Load Data
          var response = _api.getResponseDataAsync(request, function(data) {

            // Load data in DOM
            for (var i = 0; i < data.length; ++i) {
              for (var j = 0; j < data[i].length; ++j) {
                var backgroundCell = jQuery('<div/>', {
                  className: 'jMatrixBrowse-background-cell',
                  'data-row': i + request.row1,
                  'data-col': j + request.col1,
                  html: data[i][j]
                });
                if (_config.getDataReloadStrategy === jMatrixBrowseNs.Constants.RELOAD_CELL_POSITION) {
                  _elem.find('.jMatrixBrowse-content').append(backgroundCell);
                  backgroundCell.hide();
                } else {
                  _backgroundDataContainer.append(backgroundCell);
                }
              }
            }

            // Update the coordinates of window 
            _windowLoaded.row2 = request.row2;
            _windowLoaded.col2 = request.col2;

            var matrixSize = _api.getMatrixSize();

            if (request.row2 < matrixSize.height - 1) {
              // Load more data in the same group of cols.
              request.row1 = Math.min(request.row1 + backgroundLoadingWindowSize.height + 1, matrixSize.height-1);
              request.row2 = Math.min(request.row2 + backgroundLoadingWindowSize.height + 1, matrixSize.height-1);
            } else {
              // Begin loading data in the next grouop of cols.
              request.row1 = 0;
              request.row2 = backgroundLoadingWindowSize.height;
              if (request.col2 < matrixSize.width - 1) {
                // There are more columns to load
                request.col1 = Math.min(request.col1 + backgroundLoadingWindowSize.width + 1, matrixSize.width-1);
                request.col2 = Math.min(request.col2 + backgroundLoadingWindowSize.width + 1, matrixSize.width-1);
              } else {
                // All columns loaded
                // Don't need to request more data now.
                _elem.trigger({
                  type: 'jMatrixBrowseLoadComplete'
                });
                return;
              }
            }

            loadData(request);
          });

        }, jMatrixBrowseNs.Constants.BACKGROUND_DATA_RELOAD_DELAY);
      })({
        row1: 0,
        row2: backgroundLoadingWindowSize.height,
        col1: 0,
        col2: backgroundLoadingWindowSize.width
      });

    }

    /**
    * Forms the requests that should be made to the api to get the remaining cells.
    * 
    * @param  {Object} request The requested window.
    * @returns {Array} Array of requests to be made to api to get cells not already in background.
    */
    function getRequiredRequests(request) {
      var requests = [];
      var notAllCellsExist = false;
      for (var j = request.col1; j <= request.col2; ++j) {
        for (var i = request.row1; i <= request.row2; ++i) {
          var cellSelector = '.jMatrixBrowse-background-cell[data-row=' + i + '][data-col=' + j + ']';
          if (_elem.find(cellSelector).length == 0) {
            // This row doesn't exist
            // Since we were loading columnwise, we know that all elements after i,j don't exist.
            requests.push({
              row1: i,
              col1: j,
              row2: request.row2,
              col2: request.col2
            });
            notAllCellsExist = true;
            break;
          }
        }
        if (notAllCellsExist)
          break;
      }
      if (notAllCellsExist) {
        if (i > request.row1 && i < request.row2 && j > request.col1 && j < request.col2) {
          requests.push({
            row1: request.row1,
            col1: j+1,
            row2: i-1,
            col2: request.col2
          });
        }
      }
      return requests;
    }

    /**
    * Combines the responses from various api requests and backgrounds to form one matrix of cells.
    * @param  {Array} requests  Array of requests that were made to the api.
    * @param  {Array} responses Responses received from the api.
    * @param  {Object} request  One big request for which we want the data.
    * @return {ArrayOfArray}    Array of array of cells in the requested window.
    */
    function combineResponses(requests, responses, request) {
      // Make an array of array of cells
      var cells = new Array(request.row2 - request.row1 + 1);
      for (var i = cells.length - 1; i >= 0; i--) {
        cells[i] = new Array(request.col2 - request.col1 + 1);
      };

      // Merge the responses in one matrix
      for (var i = responses.length - 1; i >= 0; --i) {
        var currentResponse = responses[i];
        var currentRequest = requests[i];
        for (var j = currentResponse.length - 1; j >= 0; --j) {
          for (var k = currentResponse[j].length - 1; k >= 0; --k) {
            var cell = jQuery('<div/>', {
              className: 'jMatrixBrowse-background-cell',
              'data-row': j + currentRequest.row1,
              'data-col': k + currentRequest.col1,
              html: currentResponse[j][k]
            });
            if (_config.getDataReloadStrategy === jMatrixBrowseNs.Constants.RELOAD_CELL_POSITION) {
              _elem.find('.jMatrixBrowse-content').append(cell);
              cell.hide();
            }
            cells[j + currentRequest.row1 - request.row1][k + currentRequest.col1 - request.col1] = cell;
          };
        };
      };

      // Add the already existing background cells to the matrix.
      for (var j = request.col1; j <= requests[0].col1; ++j) {
        // If we are at requests[0].col1, we should load only upto request[0].row1 rows from background 
        // Otherwise, we load until request.row2 rows
        for (var i = request.row1; i <= request.row2; ++i) {
          if (j == requests[0].col1 && i >= requests[0].row1)
            break;
          var cellSelector = '.jMatrixBrowse-background-cell[data-row=' + i + '][data-col=' + j + ']';
          cells[i - request.row1][j - request.col1] = _elem.find(cellSelector);
        };
      };
      return cells;
    }
    
    return that;
  };

})(jQuery, jMatrixBrowseNs);
