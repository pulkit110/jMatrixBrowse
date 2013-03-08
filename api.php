<?php 
header('Access-Control-Allow-Origin: *');
$row1 = $_GET['row1'];
$row2 = $_GET['row2'];
$col1 = $_GET['col1'];
$col2 = $_GET['col2'];

$response = array('matrix' => array('height' => 100, 'width' => 100));

for ($i=$row1; $i <= $row2; $i++) { 
	$response['data'][$i-$row1] = array();
	$response['row']['labels'][$i-$row1] = 'header row ' . $i;
	for ($j=$col1; $j <= $col2; $j++) { 
        if ($i === $row1) {
          $response['column']['labels'][$j-$col1] = 'header col ' . $j;
        }
        if (rand(1, 100) > 50) {
        	$response['data'][$i-$row1][$j-$col1] = null;
        } else {
        	$response['data'][$i-$row1][$j-$col1] = array(array('author' => 'Author ' . $i, 'value' => '1_' . $i . ', ' . $j), array('author' => 'Another author ' . $i, 'value' => '2_' . $i . ', ' . $j));
        }
	}
}

echo json_encode($response);
?>