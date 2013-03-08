/**
 * jMatrix Browse Tests
 */
(function ($) {
  $(document).ready( function () {

  	jMatrixBrowseNs.Constants.BACKGROUND_DATA_RELOAD_DELAY = 100000;
    var jMatrixBrowse;
    //create a new jMatrixBrowse
    var jMatrixBrowse = $('#my_browser-first').jMatrixBrowse();
    var jMatrixBrowse = $('#my_browser-second').jMatrixBrowse();
  });
})(jQuery);