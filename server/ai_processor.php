<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$requestUri = $_SERVER['REQUEST_URI'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Simple manual routing if needed, or based on post body
$input = json_decode(file_get_contents("php://input"), true);

if ($action === 'analyze' || strpos($requestUri, 'analyze') !== false) {
    handleAnalyze($input);
} else {
    echo json_encode(["error" => "Invalid endpoint"]);
}

function handleAnalyze($data) {
    $mood = isset($data['mood']) ? $data['mood'] : 'calm';
    $stress_level = isset($data['stress_level']) ? $data['stress_level'] : 5;
    $reaction_time = isset($data['reaction_time']) ? $data['reaction_time'] : 500;

    $mood_status = "Stable";
    $recommended_exercise = "02";
    $message = "Your assessment indicates healthy neuropsychological regulation.";

    if ($stress_level > 7 || $reaction_time > 800) {
        $mood_status = "High Stress";
        $recommended_exercise = "01";
        $message = "AI detected signs of neural fatigue and elevated cortisol indicators. High-focus stabilization is recommended.";
    } elseif ($stress_level > 4) {
        $mood_status = "Moderate Stress";
        $recommended_exercise = "03";
        $message = "Moderate arousal detected. Proceed with standard cognitive therapy.";
    }

    echo json_encode([
        "mood_status" => $mood_status,
        "recommended_exercise" => $recommended_exercise,
        "message" => $message
    ]);
}
