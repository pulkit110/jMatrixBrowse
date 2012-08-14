/**
 * @fileOverview Validates the jMatrixBrowse API
 * @version 0.1
 * @author Pulkit Goyal <pulkit110@gmail.com> 
*/

(function (jQuery) {
  jQuery(document).ready( function () {
    var jMatrixBrowseTests = new jqUnit.TestCase("jMatrixBrowse API Validator");

    var url = jQuery('#my_browser').attr('data-api');
    var api = new jMatrixBrowseNs.NetworkedAPI(url);

    // 1
    jMatrixBrowseTests.test("Initialization", function () {

      jqUnit.assertNotNull('url is not null.', url);
      jqUnit.assertNotUndefined('url is not undefined.', url);

      jqUnit.assertNotNull('NetworkedAPI is not null.', api);
      jqUnit.assertNotUndefined('NetworkedAPI is not undefined.', api);

    });

    // 2
    jMatrixBrowseTests.test("API Requests test", function () {
      var matrixSize = api.getMatrixSize();

      jqUnit.assertNotNull('Matrix size is not null.', matrixSize);
      jqUnit.assertNotUndefined('Matrix size is not undefined.', matrixSize);

      jqUnit.assertNotEquals('Matrix height is not zero.', 0, matrixSize.height);
      jqUnit.assertNotEquals('Matrix width is not zero.', 0, matrixSize.width);

      var request = {
        row1: 0,
        row2: Math.min(10, matrixSize.height),
        col1: 0,
        col2: Math.min(10, matrixSize.width)
      };
      api.getResponseAsync(request, function(response) {
        jMatrixBrowseTests.test("API Response test", function () {
          jqUnit.assertNotNull('Response is not null.', response);
          jqUnit.assertNotUndefined('Response is not undefined.', response);

          jqUnit.assertNotNull('Response.matrix is not null.', response.matrix);
          jqUnit.assertNotUndefined('Response.matrix is not undefined.', response.matrix);

          jqUnit.assertNotNull('Response.matrix.height is not null.', response.matrix.height);
          jqUnit.assertNotUndefined('Response.matrix.height is not undefined.', response.matrix.height);

          jqUnit.assertNotNull('Response.matrix.width is not null.', response.matrix.width);
          jqUnit.assertNotUndefined('Response.matrix.width is not undefined.', response.matrix.width);

          jqUnit.assertEquals('Response.matrix.height is correct.', matrixSize.height, response.matrix.height);
          jqUnit.assertEquals('Response.matrix.width is correct.', matrixSize.width, response.matrix.width);

          jqUnit.assertNotNull('Response.data is not null.', response.data);
          jqUnit.assertNotUndefined('Response.data is not undefined.', response.data);

          jqUnit.assertEquals('Response.data has correct number of rows.', request.row2 - request.row1 + 1, response.data.length);
          jqUnit.assertEquals('Response.data has correct number of cols.', request.col2 - request.col1 + 1, response.data[0].length);

          jqUnit.assertNotEquals('Type of data_ij is not object.', 'object', typeof response.data[0][0]);

          jqUnit.assertNotNull('Response.row is not null.', response.row);
          jqUnit.assertNotUndefined('Response.row is not undefined.', response.row);
          
          jqUnit.assertNotNull('Response.row.labels is not null.', response.row.labels);
          jqUnit.assertNotUndefined('Response.row.labels is not undefined.', response.row.labels);
          
          jqUnit.assertNotNull('Response.column is not null.', response.column);
          jqUnit.assertNotUndefined('Response.column is not undefined.', response.column);

          jqUnit.assertNotNull('Response.column.labels is not null.', response.column.labels);
          jqUnit.assertNotUndefined('Response.column.labels is not undefined.', response.column.labels);

          jqUnit.assertEquals('Response.row.labels has correct number of rows.', request.row2 - request.row1 + 1, response.data.length);
          jqUnit.assertEquals('Response.col.labels has correct number of cols.', request.col2 - request.col1 + 1, response.data[0].length);
        });
      });
    });
  });
})(jQuery);