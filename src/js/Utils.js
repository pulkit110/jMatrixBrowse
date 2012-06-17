/**
 * @fileOverview Contains the jMatrixBrowse utility code.
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com> 
 */

/**
 * Utility functions for jMatrixBrowse.
 * 
 * @class Utils
 */
function Utils() {
}

/** 
 * Utility function that parses a position (row,col).
 * @returns {Object} position - Object representing the position denoted by the string. 
 * @returns {Number} position.row - row index of the position.
 * @returns {Number} position.col - column index of the position.
 */
Utils.parsePosition = function(str_position) {
  var arr_position = str_position.split(',');
  if (arr_position.length == 2) {
    return {
      row: parseInt(arr_position[0]),
      col: parseInt(arr_position[1])
    };
  }
};

/**
 * Check if the given cell is overflowing the container dimensions. 
 * @param {jQuery Object} element - jQuery object for the element to be checked for overflow.
 * @param {jQuery Object} container - The container against which to check the overflow.
 * @param {Number} overflow - Type of oevrflow to check.
 * @returns true if there is an overflow. false otherwise.
 */
Utils.isOverflowing = function(element, container, overflow) {
  var containerOffset = container.offset();
  var elementOffset = element.offset();
      
  var top = elementOffset.top - containerOffset.top;
  var left = elementOffset.left - containerOffset.left;
  var width = element.width();
  var height = element.height();

  switch (overflow) {
    case Constants.OVERFLOW_LEFT:
      return (left+width < 0);
    case Constants.OVERFLOW_RIGHT:
      return (left > container.width());
    case Constants.OVERFLOW_TOP:
      return (top+height < 0);
    case Constants.OVERFLOW_BOTTOM:
      return (top > container.height());
  }
  return false;
}