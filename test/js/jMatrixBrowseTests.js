/**
 * jMatrix Browse Tests
 */
(function ($) {
  $(document).ready( function () {
    var jMatrixBrowseTests = new jqUnit.TestCase("jMatrixBrowse Tests");

    var jMatrixBrowse;

    // 1
    jMatrixBrowseTests.test("Initialization", function () {

      //create a new jMatrixBrowse
      var jMatrixBrowse = $('#my_browser').jMatrixBrowse();

      console.log(new MockApi().getResponse({
        x1: 0,
        x2: 2,
        y1: 0,
        y2: 2
      }));

      jqUnit.isVisible("jMatrixBrowse is initially visible", "#my_browser");
      jqUnit.isVisible("jMatrixBrowse container is visible", ".jmb-matrix-container");

      var initialCenter = jMatrixBrowse.getCenter();
      jqUnit.assertEquals("jMatrixBrowse centered at correct position", "20,20", initialCenter.x + ',' + initialCenter.y);

      var initialWindowSize = jMatrixBrowse.getWindowSize();
      jqUnit.assertEquals("jMatrixBrowse rendered with correct dimensions", "5,10", initialWindowSize.x + ',' + initialWindowSize.y);

    });
    // 2
    jMatrixBrowseTests.test("Basic jMatrixBrowse Dragging Tests", function () {

      //create a new jMatrixBrowse
      var jMatrixBrowse = $.jMatrixBrowse();

      // Drag jMatrixBrowse to 0,0
      jMatrixBrowse.dragTo({
        x: 0,
        y: 0
      });

      var initialCenter = jMatrixBrowse.getCenter();
      jqUnit.assertEquals("jMatrixBrowse centered at correct position after dragging to 0,0", "0,0", jMatrixBrowseCenter.x + ',' + jMatrixBrowseCenter.y);

    });
  });
})(jQuery);