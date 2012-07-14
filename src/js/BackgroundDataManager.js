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

(function (jQuery, jMatrixBrowseNS) {

  var _api;                     // api manager
  var _elem;                    // Element that triggered jMatrixBrowse.
  var _backgroundDataContainer; // Container for background data.

  var backgroundLoadingWindowSize = {height: 20, width: 20}; // TODO: Move to config
  
  /**
   * Begins loading all the data into the dom.
   * This creates a new container to hold the data inside elem.
   */
  function beginLoadingData() {

    // Create container for keeping background data.
    _elem.append(jQuery('<div/>', {
      className: 'jMatrixBrowse-background-data-container'
    }));

    _backgroundDataContainer = jQuery('.jMatrixBrowse-background-data-container');
    (function loadData(request){
      setTimeout(function(){
        // Load Data
        var response = _api.getResponseDataAsync(request, function(data) {
          
          // Load data in DOM
          for (var i = 0; i < data.length; ++i) {
            for (var j = 0; j < data[i].length; ++j) {
              _backgroundDataContainer.append(jQuery('<div/>', {
                className: 'jMatrixBrowse-background-cell',
                'data-row': i + request.row1,
                'data-col': j + request.col1,
                html: data[i][j]
              }));
            }
          }

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
              // TODO: Trigger an event to indicate load complete.
              return;
            }
          }

          loadData(request);
        });
        
      }, 2500);
    })({
      row1: 0,
      row2: backgroundLoadingWindowSize.height,
      col1: 0,
      col2: backgroundLoadingWindowSize.width
    });

  }

  /**
   * Manages backgorund loading for jMatrixBrowse.
   *
   * @param {jQuery Object} elem - element that initiated jMatrixBrowse.
   * @param {Object} api - api manager for making requests to api.
   * @class BackgorundDataManager
   * @memberOf jMatrixBrowseNs
   */
  jMatrixBrowseNS.BackgorundDataManager = function(elem, api) {
    var that = this;

    _elem = elem;
    _api = api;

    beginLoadingData();

    return that;
  };

})(jQuery, jMatrixBrowseNs);
