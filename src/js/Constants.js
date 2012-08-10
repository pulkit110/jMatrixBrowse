/**
 * @fileOverview Contains the jMatrixBrowse constants.
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com> 
*/

var jMatrixBrowseNs = jMatrixBrowseNs || {};

/**
 * Constants for jMatrixBrowse.
 * 
 * @class Constants
 * @memberOf jMatrixBrowseNs
 */
jMatrixBrowseNs.Constants = {
  // Overflow Types.
  OVERFLOW_LEFT : 1,
  OVERFLOW_RIGHT : 2,
  OVERFLOW_TOP : 3,
  OVERFLOW_BOTTOM : 4,
  OVERFLOW_NONE : -1,
  
  CLASS_BASE : 'jmatrixbrowse',
  N_BACKGROUND_CELLS : 1, 
  
  // Default option values
  DEFAULT_OPTIONS : {
    str_initialWindowPosition: '0,0',
    str_initialWindowSize: '10,10',
    boo_snap: false,
    boo_animate: false,
    minVelocityForAnimation: 4,
    animationDuration: 2000,
    str_api: 'test'
  },
  
  // Background Loading
  DEFAULT_DATA_RELOAD_STRATEGY: 1,
  RELOAD_HTML_REPLACEMENT: 1,
  RELOAD_CELL_REPLACEMENT: 2,
  RELOAD_CELL_POSITION: 3,
  BACKGROUND_DATA_RELOAD_DELAY: 2000, // milliseconds to wait before sending another request to api

  // Zooming
  ZOOM_LEVEL_DIFFERENCE: 2,
  ZOOM_MAX_WINDOW_SIZE: {
    height: 10,
    width: 20
  }
};
