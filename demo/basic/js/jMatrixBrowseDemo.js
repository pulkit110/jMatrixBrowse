/**
 * jMatrix Browse Tests
 */
(function ($) {
  $(document).ready( function () {

    var jMatrixBrowse;
    //create a new jMatrixBrowse
    var jMatrixBrowse = $('#my_browser').jMatrixBrowse();

    jMatrixBrowse.parseResponseToString = function(response) {
    	if (response !== null && response !== undefined) {
        if( Object.prototype.toString.call(response) === '[object Array]' ) {
          var result = '';
          for (var i = 0; i < response.length; i++) {
            result += '<span author="' + response[i].author + '">' + response[i].value + '</span>:';
          };
          return result;
        } else {
          return JSON.stringify(response);
        }
      }
      return '';
    }
    
  });
})(jQuery);