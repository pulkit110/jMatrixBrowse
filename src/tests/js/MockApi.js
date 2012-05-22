function MockApi() {
	var matrixGenerator = new MatrixGenerator();
	matrixGenerator.init(100,100);
	this.getResponse = function(request) {
		var mat_testMatrix = matrixGenerator.test_getMatrix();
		var arr_rowLabels = matrixGenerator.test_getMatrixRowLabels();
		var arr_colLabels = matrixGenerator.test_getMatrixColumnLabels();

		// TODO: Check for undefined variables
		var x1 = request.x1;
		var x2 = request.x2;
		var y1 = request.y1;
		var y2 = request.y2;

		var obj_response = {
			"matrix" : {
				"height" : mat_testMatrix.length,
				"width" : mat_testMatrix[0].length	// TODO: Check if length is atleast 1
			},
			"row" : {
				"labels" : []
			},
			"column" : {
				"labels" : []
			},
			"data" : [
			]
		};

		for (var i=x1; i <= x2; ++i) {
			obj_response.row.labels.push(arr_rowLabels[i]);
			obj_response.data.push([]);
			for (var j=y1; j <= y2; ++j) {
				if (i === x1) {
					obj_response.column.labels.push(arr_colLabels[j]);
				}
				obj_response.data[i-x1].push(mat_testMatrix[i][j]);
			};
		};

		return obj_response;
	}
};