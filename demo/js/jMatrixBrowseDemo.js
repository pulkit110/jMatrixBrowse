/**
 * jMatrix Browse Tests
 */
(function ($) {
  $(document).ready( function () {

    var jMatrixBrowse;
    //create a new jMatrixBrowse
    var jMatrixBrowse = $('#my_browser').jMatrixBrowse();

    console.log(new MockApi().getResponse({
      x1: 0,
      x2: 2,
      y1: 0,
      y2: 2
    }));
  });
})(jQuery);