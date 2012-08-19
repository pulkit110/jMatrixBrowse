jMatrixBrowse
=============

**UNDER DEVELOPMENT**

jQuery plugin for browsing large matrices using dragging (like Google Maps). The main features of the tool include a browsable canvas that can be panned and zoomed easily. In the background, the tool would obtain data from the server based on a set of coordinates. These coordinates then need to be mapped to the current zoom level of the data and shown at the correct scale. The approach and implementation is similar to Google maps which sends requests to the server based on coordinates of the map to be loaded.

Matrices are basic data stores used throughout evolutionary studies. Large (1000 by 1000), collaboratively built matrices of quantitative/qualitative are becoming increasingly common on the web, and a generic mechanism to browse (interact) with these data in the browser via a "windowing" mechanism would be broadly useful. The interface could be used for any data that can be tablified according to some x/y co-ordinate system that returns the jSON spec, thus making it extremely broadly useful.

Use
===

* Clone jMatrixBrowse using
```shell
git clone https://github.com/pulkit110/jMatrixBrowse.git
```
or download a [zip](https://github.com/pulkit110/jMatrixBrowse/zipball/master).

* Download and include jquery and jquery-ui in your HTML. 
```html 
<!--  jQuery includes -->
<script type="text/javascript" src="../../../lib/jquery/core/js/jquery.js"></script>
<script type="text/javascript" src="../../../lib/jquery/ui/js/jquery-ui-all.js"></script>
```

* Include jMatrixBrowse javascript file in your HTML. 
```html
<script type="text/javascript" src="jMatrixBrowse-master.min.js"></script> 
```

* If you would like to debug, include the individual files instead.
```html
<!--  jQuery plugins includes -->
<script type="text/javascript" src="lib/jquery/hotkeys/jquery.hotkeys.js"></script>
<script type="text/javascript" src="lib/jquery/mousewheel/jquery.mousewheel.js"></script>
<!--  jMatrixBrowse includes-->
<script type="text/javascript" src="src/js/Constants.js"></script>
<script type="text/javascript" src="src/js/Utils.js"></script>
<script type="text/javascript" src="src/js/Configuration.js"></script>
<script type="text/javascript" src="src/js/APIHandler.js"></script>
<script type="text/javascript" src="src/js/jMatrixBrowseRenderer.js"></script>
<script type="text/javascript" src="src/js/BackgroundDataManager.js"></script>
<script type="text/javascript" src="src/js/jMatrixBrowse.js"></script>
<!--  Test Matrix generator files -->
<script type="text/javascript" src="test/js/MatrixGenerator.js"></script>
<script type="text/javascript" src="test/js/MockApi.js"></script>
```

* Include the jMatrixBrowse css
```html
<link rel="stylesheet" href="src/css/jMatrixBrowse.css" />
```

* The plugin can be initialized by using HTML data-* element like this.
```html
<div id="my_browser"
    data-jmatrix_browser=true
    data-initial-window-position="20,30"
    data-initial-window-size="5,10"
    data-snap="false"
    data-deceleration-duration="1000"
    data-min-velocity-for-animation="0"
    data-animate="true"
    data-api="http://foo.org/path/to/api">
</div>
```

### Required

```
data-jmatrix_browser=true               -  This element is the wrapper for a jMatrixBrowser

```

### Optional
```
data-api=http://foo.org/path/to/api     -  The API to call. (defaults to test API)
data-initial-window-size="2,3"          -  Define the width, height of the initial window (defaults to 10,10 ?)
data-initial-window-position="x,y"      -  Define the x,y position of the window  (defaults to 0,0)
data-animate                            -  If the matrix should be animated if the user initiates a quick drag.
data-min-velocity-for-animation         -  Minimum velocity for animation to be activated.
data-deceleration-duration              -  The duration of deceleration animation.
data-snap                               -  Whether the matrix should snap to edges when stopped.
```

API Details
===========

The API should be able to answer requests of the following form.

**Request:** http://foo.org/path/to/api_action?row1=1&col1=1&row2=100&col2=50

**Response:**
```javascript
{
  "matrix": {
    "height": 1000,
    "width": 1000
  },
  "row": {
    "labels": ["label1", "label2", ..., "label100"]
  },
  "column": {
    "labels": ["label1", "label2", ..., "label50"]
  },
  "data": [
    [
      {
        "author": "XYZ",
        "date": "YYYYMMDDhhmm",
        "value": 100
      },
      {data_{1,2}},
      .
      .
      .
      {data_{1,50}}
    ],
    [data_2],
    .
    .
    .
    [data_100]
  ]
}
```

The html of the cell is formed by using the string representation of the cell data. In order to customize the text that is displayed in the cells, you can specify your own function to parse the resopnse. In order to achieve this, define the method parseResponseToString(resopnse) for your jMatrixBrowse instance. 
```javascript
var browser = jQuery('#my_browser').jMatrixBrowse();
browser.parseResponseToString = function(response) {
  if (response !== null && response !== undefined) {
    // TODO: Define your own parser here. 	
  }
  return '';
};
```
The properties returned from the response would also be attached as html data elements to the cells to allow for custom styling based on the values of these properties. For example, for a cell with response 
```  
{
  "author": "XYZ",
  "text": "ABC"
}
```
the cell will have attributes
```html
data-author="XYZ"
data-text="ABC"
```

If you would like to get data from javascript rather than having a complete API, you can extend the MockAPI provided in test/src/js.
The MockAPI should implement the following three functions:
```javascript
  /**
   * Gets a response for given request and calls the callback on success.
   * @param {Object} request - the request.
   * @param {function} callback - the callback function.
   */
  this.getResponseDataAsync = function(request, callback) {
    // TODO: Your implementation here
  }
  
  /**
   * Gets the response data for given request and calls the callback on success.
   * @param {Object} request - the request.
   * @param {function} callback - the callback function.
   */
  this.getResponseAsync = function(request, callback) {
    // TODO: Your implementation here
  }
  
  /**
   * Get matrix size from api. 
   * @returns {Object} size - size of the matrix. 
   * @returns {Number} size.width - width of the matrix. 
   * @returns {Number} size.height - height of the matrix.
   */
  this.getMatrixSize = function() {
    // TODO: Your implementation here
  }
```

Custom Styling
==============

You can plug in your own css to change the look and feel of jMatrixBrowse. Below is the description of the class names for different elements. 
```
jmb-matrix-container - The container for jMatrixBrowse. 
  jmatrixbrowse-col-header - The container for column headers.
  jmatrixbrowse-row-header - The container for row headers.
  jmatrixbrowse-drag-container-container - The container for jMatrixBrowseDragContainer.
    jmatrixbrowse-drag-container - jMatrixBrowseDragContainer. Container for matrix content.
      jMatrixBrowse-content - The container for all matrix cells. 
        jMatrixBrowse-cell - A matrix cell. Every cell contains two attributes data-row and data-col.
  jMatrixBrowse-background-data-container - The container for background data. 
  
```

Documentation
=============
Updated documentation can be found in `doc/` directory in the repository. Documentation can also be found online [here](http://pulkitgoyal.in/Demo/jMatrixBrowse/doc/). 

Demo
====
An online demo is deployed [here](http://pulkitgoyal.in/Demo/jMatrixBrowse/).