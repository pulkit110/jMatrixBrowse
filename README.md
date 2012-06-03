jMatrixBrowse
=============

**UNDER DEVELOPMENT**

jQuery plugin for browsing large matrices using dragging (like Google Maps). The main features of the tool include a browsable canvas that can be panned and zoomed easily. In the background, the tool would obtain data from the server based on a set of coordinates. These coordinates then need to be mapped to the current zoom level of the data and shown at the correct scale. The approach and implementation is similar to Google maps which sends requests to the server based on coordinates of the map to be loaded.

Matrices are basic data stores used throughout evolutionary studies. Large (1000 by 1000), collaboratively built matrices of quantitative/qualitative are becoming increasingly common on the web, and a generic mechanism to browse (interact) with these data in the browser via a "windowing" mechanism would be broadly useful. The interface could be used for any data that can be tablified according to some x/y co-ordinate system that returns the jSON spec, thus making it extremely broadly useful.

Use
===

The plugin can be initialized by using HTML data-* element like this.

```
<div id="my_browser" 
    data-jmatrix_browser=true 
    data-api="http://foo.org/path/to/api" 
</div>

```

### Required

```

data-api=http://foo.org/path/to/api     -  The API to call 
data-jmatrix_browser=true               -  This element is the wrapper for a jMatrixBrowser

```
### Optional
```
data-initial-window-size="2,3"          -  Define the width, height of the initial window (defaults to 10,10 ?)
data-initial-window-position="x,y"      -  Define the x,y position of the window  (defaults to 0,0)
data-jmatrix-browser-css                 - URL/URI
```

The API should be able to answer requests of the following form.

**Request:** http://foo.org/path/to/api_action?row1=1&col1=1&row2=100&col2=50

**Response:**
```
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