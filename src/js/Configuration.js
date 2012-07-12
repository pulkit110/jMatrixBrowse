/**
 * @fileOverview Contains the jMatrixBrowse configuration.
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com>
*/

var jMatrixBrowseNs = jMatrixBrowseNs || {};

(function (jQuery, jMatrixBrowseNS) {

  var _settings;      // user settings
  var _api;           // api manager

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
      str_initialWindowPosition: elem.attr('data-initial-window-position'),
      boo_snap: elem.attr('data-snap') === 'true'
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
      str_initialWindowSize: '10,10',
      boo_snap: false
    }, options);
  }

  /**
   * Set the settings object.
   * @param {Object} settings
   */
  function setSettings(settings) {
    _settings = settings;
  }

 /**
   * Manages configurations for jMatrixBrowse.
   *
   * @param {jQuery Object} elem - element that initiated jMatrixBrowse.
   * @param {Object} api - api manager for making requests to api.
   * @class Configuration
   * @memberOf jMatrixBrowseNs
   */
  jMatrixBrowseNS.Configuration = function(elem, api) {
    var that = this;

    _api = api;

    // Get user options
    var options = getUserOptions(elem);

    // Extending user options with application defaults
    _settings = extendDefaults(options);

    /**
     * Gets settings object.
     * @returns {Object} User settings for jMatrixBrowse.
     * See (https://github.com/pulkit110/jMatrixBrowse/wiki/Use) for list of available settings.
     */
    that.getSettings = function() {
      return _settings;
    };

    /**
     * Gets window size from settings.
     * @returns {Object} size - size of the window.
     * @returns {Number} size.width - width of the window.
     * @returns {Number} size.height - height of the window.
     */
    that.getWindowSize = function() {
      if (_settings && _settings.str_initialWindowSize) {
        var  position = jMatrixBrowseNs.Utils.parsePosition(_settings.str_initialWindowSize);
        return {
          height: position.row,
          width: position.col
        };
      }
      return null;
    };

    /**
     * Gets position of window.
     * @returns {Object} position - position of the top-left corner of window.
     * @returns {Number} position.row - row index of the position.
     * @returns {Number} position.col - column index of the position.
     */
    that.getWindowPosition = function() {
      if (_settings && _settings.str_initialWindowPosition) {
        var  position = jMatrixBrowseNs.Utils.parsePosition(_settings.str_initialWindowPosition);
        return position;
      }
      return null;
    };

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
    that.getCellWindow = function(position) {
      var size = _api.getMatrixSize();
      if (size == undefined) {
        console.error("Unable to get matrix size");
        return null;
      }

      var windowSize = this.getWindowSize();
      if (windowSize == undefined) {
        console.error("Unable to get window size");
        return null;
      }

      return {
        row1: position.row,
        col1: position.col,
        row2: Math.min(position.row + windowSize.height, size.height),
        col2: Math.min(position.col + windowSize.width, size.width)
      };
    };

    /**
     * Gets the number of background cells to use.
     * @returns nBackgroundCells The number of background cells.
     */
    that.getNumberOfBackgroundCells = function() {
      return jMatrixBrowseNs.Constants.N_BACKGROUND_CELLS;
    };

    that.isSnapEnabled = function() {
      return _settings.boo_snap;
    };

    return that;
  };

})(jQuery, jMatrixBrowseNs);