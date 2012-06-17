/**
 * @fileOverview Contains the code for generating a random matrix.
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com> 
*/
/**
 * Generates random matrix with characters from A-F and numbers.
 * 
 * @class MatrixGenerator
 */
function MatrixGenerator(type) {
  var that = this;

  var STR_TYPE_RANDOM = 'random';
  var STR_TYPE_SEQUENTIAL = 'sequential';
  
  if (type == undefined) {
    type = 'random';
  }
  
  var INT_MAX_LABEL_LENGTH = 10;
  var FLO_NUM_PROBABILITY = 0.1;

  var arr_stateLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  var mat_testMatrix;
  var arr_rowLabels;
  var arr_colLabels;

  /**
   * Returns a random string of given length. 
   * @param {Number} length - length of the string.
   * @returns {string} random string of given length.
   */
  function getRandomString(length) {
    var str_randomString = '';
    for (var i = 0; i < length; ++i) {
      str_randomString += (Math.random() > FLO_NUM_PROBABILITY)?arr_stateLabels[Math.floor(Math.random()*arr_stateLabels.length)]:Math.floor(Math.random()*10);
    }
    return str_randomString;
  };

  /**
   * Initialize the MatrixGenerator. 
   * @param {Number} int_height - height of the matrix to generate. 
   * @param {Number} int_width - width of the matrix to generate.
   */
  this.init = function(int_height, int_width) {
    mat_testMatrix = [];
    arr_rowLabels = [];
    arr_colLabels = [];

    for (var i = 0; i < int_height; ++i) {
      if (type == STR_TYPE_RANDOM) {
        arr_rowLabels.push(getRandomString(Math.random()*INT_MAX_LABEL_LENGTH));
      } else {
        arr_rowLabels.push('row ' + i);
      }
      
      mat_testMatrix.push([]);
      for (var j = 0; j < int_width; ++j) {
        if (type == STR_TYPE_RANDOM) {
            if (i == 0)
              arr_colLabels.push(getRandomString(Math.random()*INT_MAX_LABEL_LENGTH));
          mat_testMatrix[i].push(getRandomString(Math.random()*INT_MAX_LABEL_LENGTH));
        } else {
            if (i == 0)
              arr_colLabels.push('col ' + j);
          mat_testMatrix[i].push(i + ', ' + j);
        }
        
      }
    }
  };
  
  /**
   * Returns the complete matrix.
   * @returns {ArrayOfArray} mat_testMatrix - An array of array representing 
   * the matrix.
   */
  this.test_getMatrix = function() {
    return mat_testMatrix;
  };
  
  /**
   * Returns the complete matrix.
   * @returns {Array} arr_rowLabels - An array of row labels.
   */
  this.test_getMatrixRowLabels = function() {
    return arr_rowLabels;
  };
  
  /**
   * Returns the complete matrix.
   * @returns {Array} arr_rowLabels - An array of column labels.
   */
  this.test_getMatrixColumnLabels = function() {
    return arr_colLabels;
  };
};