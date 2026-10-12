<?php

//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

/**
 * Returns a single past 5WORDS puzzle by its game_id.
 *
 *   GET /api/get_game.php?game_id=120
 *
 * Same response shape as get_daily_words.php, so the front end reuses the
 * same parser. An unknown (or not-yet-published) id returns [] with a 404.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');
// a past puzzle never changes, so let the browser and CDN keep it
header('Cache-Control: public, max-age=86400');

// Validate the id before it goes anywhere near the database
$game_id = filter_input(INPUT_GET, 'game_id', FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1]
]);

if ($game_id === false || $game_id === null) {
    http_response_code(400);
    echo json_encode([]);
    exit;
}

$config = require('/home/u174747673/domains/5words.co.uk/private/db_config.php');

// Connect
$conn = new mysqli(
    $config['host'],
    $config['user'],
    $config['pass'],
    $config['db']
);

if ($conn->connect_errno) {
    error_log('get_game.php connect failed: ' . $conn->connect_error);
    http_response_code(500);
    echo json_encode([]);
    exit;
}

// Query - game_date guard stops anyone reading a future puzzle's answers early
$sql = "SELECT game_id, game_date, word_1, word_2, word_3, word_4, word_5, shuffle_words FROM game_list where game_id = ? and game_date <= current_date()";
$stmt = $conn->prepare($sql);

if ($stmt === false) {
    error_log('get_game.php prepare failed: ' . $conn->error);
    http_response_code(500);
    echo json_encode([]);
    $conn->close();
    exit;
}

$stmt->bind_param("i", $game_id);
$stmt->execute();
$result = $stmt->get_result();

// Format
$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

if (empty($data)) {
    http_response_code(404);
}

echo json_encode($data);
$stmt->close();
$conn->close();
?>
