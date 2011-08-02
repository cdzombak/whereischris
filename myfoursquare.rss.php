<?php

$url = 'https://feeds.foursquare.com/history/RBLD5NMIHX2KNUDT0WK2A4B3CCB0QPYM.rss';

header('Content-type: application/xml');

$handle = fopen($url, "r");

if ($handle) {
    while (!feof($handle)) {
        $buffer = fgets($handle, 4096);
        echo $buffer;
    }
    fclose($handle);
}
