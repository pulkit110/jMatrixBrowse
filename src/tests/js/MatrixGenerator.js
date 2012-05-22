function MatrixGenerator() {
	var that = this;

	var INT_MAX_LABEL_LENGTH = 10;
	var FLO_NUM_PROBABILITY = 0.1;

	var arr_stateLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

	var mat_testMatrix;
	var arr_rowLabels;
	var arr_colLabels;

	function getRandomString(length) {
		var str_randomString = '';
		for (var i = 0; i < length; ++i) {
			str_randomString += (Math.random() > FLO_NUM_PROBABILITY)?arr_stateLabels[Math.floor(Math.random()*arr_stateLabels.length)]:Math.floor(Math.random()*10);
		}
		return str_randomString;
	};

	this.init = function(int_height, int_width) {
		mat_testMatrix = [];
		arr_rowLabels = [];
		arr_colLabels = [];

		for (var i = 0; i < int_height; ++i) {
			arr_rowLabels.push(getRandomString(Math.random()*INT_MAX_LABEL_LENGTH));
			mat_testMatrix.push([]);
			for (var j = 0; j < int_width; ++j) {
				if (i == 0)
					arr_colLabels.push(getRandomString(Math.random()*INT_MAX_LABEL_LENGTH));
				mat_testMatrix[i].push(getRandomString(Math.random()*INT_MAX_LABEL_LENGTH));
			}
		}
	};
	this.test_getMatrix = function() {
		return mat_testMatrix;
	};
	this.test_getMatrixRowLabels = function() {
		return arr_rowLabels;
	};
	this.test_getMatrixColumnLabels = function() {
		return arr_colLabels;
	};
};