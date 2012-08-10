/**
 * @fileOverview Contains the jMatrixBrowse configuration.
 * 
 * This reads the configuration set in the DOM by the user as per the options 
 * defined in https://github.com/pulkit110/jMatrixBrowse/wiki/Use
 * 
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com>
*/

var jMatrixBrowseNs = jMatrixBrowseNs || {};

(function (jQuery, jMatrixBrowseNs) {

 /**
   * Manages configurations for jMatrixBrowse.
   *
   * @param {jQuery Object} elem - element that initiated jMatrixBrowse.
   * @param {Object} api - api manager for making requests to api.
   * @class Configuration
   * @memberOf jMatrixBrowseNs
   */
  jMatrixBrowseNs.Configuration = function(elem) {
    var that = this;

    var _dataReloadStategy = jMatrixBrowseNs.Constants.DEFAULT_DATA_RELOAD_STRATEGY;

    // Get user options
    var options = getUserOptions(elem);
    // Extending user options with application defaults
    var _settings = extendDefaults(options);

    // Public methods
    /**
     * Gets settings object.
     * @returns {Object} User settings for jMatrixBrowse.
     * See (https://github.com/pulkit110/jMatrixBrowse/wiki/Use) for list of available settings.
     */
    this.getSettings = function() {
      return _settings;
    };

    /**
     * Gets window size from settings.
     * @returns {Object} size - size of the window.
     * @returns {Number} size.width - width of the window.
     * @returns {Number} size.height - height of the window.
     */
    this.getWindowSize = function() {
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
     * Sets window size.
     * @param {Object} size - size of the window.
     */
    this.setWindowSize = function(size) {
      _settings.str_initialWindowSize = size.height + ',' + size.width;
    };

    /**
     * Gets position of window.
     * @returns {Object} position - position of the top-left corner of window.
     * @returns {Number} position.row - row index of the position.
     * @returns {Number} position.col - column index of the position.
     */
    this.getWindowPosition = function() {
      if (_settings && _settings.str_initialWindowPosition) {
        var  position = jMatrixBrowseNs.Utils.parsePosition(_settings.str_initialWindowPosition);
        return position;
      }
      return null;
    };

    /**
     * Gets the api url for requests.
     * @returns url The url for api. A default value of 'test' is sent if this is not defined.
     */
    this.getApiUrl = function() {
      return _settings.str_api;
    };

    /**
     * Gets the number of background cells to use.
     * @returns nBackgroundCells The number of background cells.
     */
    this.getNumberOfBackgroundCells = function() {
      return jMatrixBrowseNs.Constants.N_BACKGROUND_CELLS;
    };

    /**
     * Gets the data reload strategy to use.
     * @returns dataReloadStrategy Reload strategy (possible options defined in Constants)
     */
    this.getDataReloadStrategy = function() {
      return _dataReloadStategy;
    };
    
    /**
     * Gets if the snap is enabled.
     * @returns {boolean} true if snap is enabled.
     */
    this.isSnapEnabled = function() {
      return _settings.boo_snap;
    };

    /**
     * Get the duration of deceleration animation.
     * @return {Number} Deceleration animation in msec.
     */
    this.getAnimationDuration = function() {
      return _settings.animationDuration;
    };

    /**
     * Gets the min velocity for beginning animation.
     * @return {Object} Minimum velocity to begin animation. properties x, y
     */
    this.getMinVelocityForAnimation = function() {
      return _settings.minVelocityForAnimation;
    };

    /**
     * Is animation enabled?
     * @return {boolean} true if animation is enabled.
     */
    this.animateEnabled = function() {
      return _settings.boo_animate;
    }

    // Private methods
    /**
    * Validates the options defined by the user.
    * @param {Object} options - User's options for the plugin.
    * @returns {Boolean} true if the options are valid.
    */
    function validate(options) {   
      if (options.boo_jMatrixBrowser !== true && options.boo_jMatrixBrowser !== true) {
        throw "data-jmatrix_browser invalid";
      }
      if (options.str_initialWindowSize && !(/\s*\d+\s*,\s*\d+\s*/).test(options.str_initialWindowSize)) {
        throw "data-initial-window-size invalid."
      }
      if (options.str_initialWindowPosition && !(/\s*\d+\s*,\s*\d+\s*/).test(options.str_initialWindowPosition)) {
        throw "data-initial-window-size invalid."
      }
      return true;
    }

    /**
    * Get user defined options from data-* elements.
    * @param {jQuery object} elem - the element to retrieve the user options from.
    * @returns {Object} options - User's options for the plugin.
    * @returns {boolean} options.boo_jMatrixBrowser - Is jMatrixBrowse active for the container.
    * @returns {string} options.str_api - URI for the API.
    * @returns {string} options.str_initialWindowSize - comma separated window size as (width, height).
    * @returns {string} options.str_initialWindowPosition - comma separated window position as (row,col).
    */
    function getUserOptions(elem) {
      var options = {
        boo_jMatrixBrowser: (elem.attr('data-jmatrix_browser') === 'true'),
        str_api: elem.attr('data-api'),
        str_initialWindowSize: elem.attr('data-initial-window-size'),
        str_initialWindowPosition: elem.attr('data-initial-window-position'),
        boo_snap: elem.attr('data-snap') === 'true',
        boo_animate: elem.attr('data-animate') === 'true',
        animationDuration: elem.attr('data-deceleration-duration'),
        minVelocityForAnimation: elem.attr('data-min-velocity-for-animation')
      };
      var temp = elem.attr('data-animate');
      
      if (validate(options))
        return options;
      else
        throw "Unable to get user options.";
    }

    /**
    * Extend the user's settings with defaults.
    * @returns {Object} options - User's options for the plugin.
    * @returns {boolean} options.boo_jMatrixBrowser - Is jMatrixBrowse active for the container.
    * @returns {string} options.str_api - URI for the API.
    * @returns {string} options.str_initialWindowSize - comma separated window size as (width, height).
    * @returns {string} options.str_initialWindowPosition - comma separated window position as (row,col).
    */
    function extendDefaults(options) {
      return jQuery.extend(jMatrixBrowseNs.Constants.DEFAULT_OPTIONS, options);
    }

    /**
    * Set the settings object.
    * @param {Object} settings
    */
    function setSettings(settings) {
      _settings = settings;
    }
    
    return that;
  };

})(jQuery, jMatrixBrowseNs);