/**
 * @fileOverview Contains utility funcitons that several modules of 
 * jMatrixBrowse use.
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com> 
 */

var jMatrixBrowseNs = jMatrixBrowseNs || {};

/**
 * Utility functions for jMatrixBrowse.
 * 
 * @class Utils
 * @memberOf jMatrixBrowseNs
 */
jMatrixBrowseNs.Utils = {
  /** 
   * Utility function that parses a position (row,col).
   * @returns {Object} position - Object representing the position denoted by the string. 
   * @returns {Number} position.row - row index of the position.
   * @returns {Number} position.col - column index of the position.
   */
  parsePosition : function(str_position) {
    var arr_position = str_position.split(',');
    if (arr_position.length == 2) {
      return {
        row: parseInt(arr_position[0]),
        col: parseInt(arr_position[1])
      };
    }
  },

  /**
   * Check if the given cell is overflowing the container dimensions. 
   * @param {jQuery Object} element - jQuery object for the element to be checked for overflow.
   * @param {jQuery Object} container - The container against which to check the overflow.
   * @param {Number} overflow - Type of oevrflow to check.
   * @returns true if there is an overflow. false otherwise.
   */
  isOverflowing : function(element, container, overflow) {
    var containerOffset = container.offset();
    var elementOffset = element.offset();
      
    var top = elementOffset.top - containerOffset.top;
    var left = elementOffset.left - containerOffset.left;
    var width = element.width();
    var height = element.height();

    switch (overflow) {
      case jMatrixBrowseNs.Constants.OVERFLOW_LEFT:
        return (left+width < 0);
      case jMatrixBrowseNs.Constants.OVERFLOW_RIGHT:
        return (left > container.width());
      case jMatrixBrowseNs.Constants.OVERFLOW_TOP:
        return (top+height < 0);
      case jMatrixBrowseNs.Constants.OVERFLOW_BOTTOM:
        return (top > container.height());
    }
    return false;
  },

  /**
   * Finds the min and index of min number in the array.
   *
   * @param {Array} array - the array to look into.
   * @returns {Number} obj.min - the minimum number in the array.
   * @returns {Number} obj.minIndex - the index of minimum number in the array.
   */
  findIndexOfMin : function(array) {
    if (array && array.length) {
      var min = array[0];
      var minIndex = 0;
      for (var i = 1, l = array.length; i < l; ++i) {
        if (array[i] < min) {
          min = array[i];
          minIndex = i;
        }
      }
      return {
        min: min,
        minIndex: minIndex
      };
    }
    return null;
  }
}

