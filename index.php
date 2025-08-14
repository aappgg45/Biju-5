<?php
header('Content-Type: application/json');

// Get the raw POST data
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Get the user's message
$userMessage = isset($input['message']) ? $input['message'] : '';

// --- NLP Processing Functions ---

// Function to tokenize the message
function tokenize($text) {
    // Split the text into words based on spaces and punctuation
    return preg_split('/[^\p{L}\d]+/u', $text, -1, PREG_SPLIT_NO_EMPTY);
}

// Function to remove stop words
function removeStopWords($tokens, $stopWords) {
    return array_diff($tokens, $stopWords);
}

// A simple stemming function for Arabic (to reduce words to their roots)
// In a real application, a more complex library would be used.
function stem($word) {
    // Basic prefix and suffix removal
    $word = preg_replace('/^(ال)/u', '', $word);
    $word = preg_replace('/(ين|ون|ات)$/u', '', $word);
    return $word;
}

// --- Main Processing Logic ---

// Load data from JSON file
$jsonData = file_get_contents('data.json');
$data = json_decode($jsonData, true);

$response = '';

if (!empty($userMessage)) {
    // 1. Pre-process the user's message
    $userMessage = mb_strtolower(trim($userMessage), 'UTF-8');

    // 2. Tokenize the message
    $tokens = tokenize($userMessage);

    // 3. Remove stop words
    $processedTokens = removeStopWords($tokens, $data['stop_words']);

    // 4. Stem the remaining words
    $stemmedTokens = array_map('stem', $processedTokens);

    // 5. Match the processed tokens with keywords in data.json
    $found = false;
    foreach ($data['conversations'] as $conversation) {
        $matchCount = 0;
        foreach ($conversation['keywords'] as $keyword) {
            // Check if any of the processed tokens match a keyword
            if (in_array(mb_strtolower($keyword, 'UTF-8'), $stemmedTokens)) {
                $matchCount++;
            }
        }

        // A simple rule: if at least one keyword is matched, we have a potential response
        if ($matchCount > 0) {
            $response = $conversation['responses'][array_rand($conversation['responses'])];
            $found = true;
            break;
        }
    }

    // If no match found, use a default response
    if (!$found) {
        $response = $data['default_response'][array_rand($data['default_response'])];
    }
} else {
    $response = "الرسالة فارغة.";
}

// Send the response back as JSON
echo json_encode(['response' => $response]);
?>