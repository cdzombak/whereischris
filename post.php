<?php

// must define constants KEY and CONTENT_FILENAME
require_once('config.php');

if (!isset($_POST['key']) || $_POST['key'] !== KEY) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 403 Forbidden', true, 403);
    exit("API key missing or incorrect");
}

/* required keys:
   lat: float
   lon: float
   speed: int or float; will be coerced to int
   speed_unit: string
   heading: int or float; will be coerced to int
*/

$floatKeys = array('lat', 'lon');
$intKeys = array('speed', 'heading');
$strKeys = array('speed_unit');

$content = array();

foreach ($floatKeys as $key) {
    $val = get_post_value($key);
    $content[$key] = floatval($val);
}

foreach ($intKeys as $key) {
    $val = get_post_value($key);
    $content[$key] = intval($val);
}

foreach ($strKeys as $key) {
    $val = get_post_value($key);
    $content[$key] = strval($val);
}

$content['timestamp'] = date('c');

$jsonContent = json_encode($content);
$writeSuccess = file_put_contents(CONTENT_FILENAME, $jsonContent, LOCK_EX);

if ($writeSuccess === FALSE) {
    header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
} else {
    header($_SERVER['SERVER_PROTOCOL'] . ' 204 No Content', true, 204);
}

function get_post_value($key) {
    if (!isset($_POST[$key])) {
        header($_SERVER['SERVER_PROTOCOL'] . ' 400 Bad Request', true, 400);
        exit("value $key missing from POST content");
    }

    return $_POST[$key];
}
