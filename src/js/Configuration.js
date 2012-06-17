/**
 * @fileOverview Contains the jMatrixBrowse configuration.
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com> 
*/
var _settings;      // user settings

/**
  * Get user defined options from data-* elements.
  * @param {jQuery object} elem - the element to retrieve the user options from. 
  * @returns {Object} options - User's options for the plugin. 
  * @returns {boolean} options.boo_jMatrixBrowser - Is jMatrixBrowse active for the container.
  * @returns {string} options.str_api - URI for the API.
  * @returns {string} options.str_initialWindowSize - comma separated (TODO: no checks performed) window size as (width, height).
  * @returns {string} options.str_initialWindowPosition - comma separated (TODO: no checks performed) window position as (row,col).
  */
function getUserOptions(elem) {
  var options = {
    boo_jMatrixBrowser: (elem.attr('data-jmatrix_browser') === 'true'),
    str_api: elem.attr('data-api'),
    str_initialWindowSize: elem.attr('data-initial-window-size'),
    str_initialWindowPosition: elem.attr('data-initial-window-position')
  };
  return options;
}

/**
  * Extend the user's settings with defaults.
  * @returns {Object} options - User's options for the plugin. 
  * @returns {boolean} options.boo_jMatrixBrowser - Is jMatrixBrowse active for the container.
  * @returns {string} options.str_api - URI for the API.
  * @returns {string} options.str_initialWindowSize - comma separated (TODO: no checks performed) window size as (width, height).
  * @returns {string} options.str_initialWindowPosition - comma separated (TODO: no checks performed) window position as (row,col).
  */
function extendDefaults(options) {
  return jQuery.extend({
    str_initialWindowPosition: '0,0',
    str_initialWindowSize: '10,10'
  }, options);
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
  var size = getMatrixSize();
  if (size == undefined) {
    console.error("Unable to get matrix size");
    return;
  }

  var windowSize = getWindowSize();
  if (windowSize == undefined) {
    console.error("Unable to get window size");
    return;
  }

  return obj_cellWindow = {
    row1: position.row,
    col1: position.col,
    row2: Math.min(position.row + windowSize.height, size.height),
    col2: Math.min(position.col + windowSize.width, size.width) 
  };
}
    
/**
 * Set the settings object.
 * @param {Object} settings
 */
function setSettings(settings) {
  _settings = settings;
}

/**
 * Get settings object.
 */
function getSettings() {
  return _settings;
}
