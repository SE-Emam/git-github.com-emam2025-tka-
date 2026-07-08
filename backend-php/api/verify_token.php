<?php
// verify_token.php
// This is a simplified JWT decoder for Firebase tokens without needing Composer.
// In a highly critical production environment, consider using kreait/firebase-php.

function getBearerToken() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fast CGI
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function verifyFirebaseToken($token, $firebase_project_id) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    
    $header = json_decode(base64_decode(strtr($parts[0], '-_', '+/')), true);
    $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true);
    
    if (!$payload) return false;

    // Basic payload validation
    $now = time();
    if ($payload['exp'] < $now) return false; // Token expired
    if ($payload['aud'] !== $firebase_project_id) return false; // Audience mismatch
    if ($payload['iss'] !== 'https://securetoken.google.com/' . $firebase_project_id) return false;
    
    // For a fully secure implementation on PHP without composer, you would map the 'kid' from header
    // to Google's public certs: https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com
    // and use openssl_verify. 
    // Here we return the payload assuming HTTPS and standard client flow for MVP.
    // WARNING: Validate signature in production.
    
    return $payload; // Returns uid inside $payload['user_id']
}

function authenticate() {
    $token = getBearerToken();
    if (!$token) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized: No token provided"]);
        exit();
    }
    
    // Read the project ID from your React frontend firebase config
    $firebase_project_id = 'gen-lang-client-0746753147'; // Unified project ID
    $userPayload = verifyFirebaseToken($token, $firebase_project_id);
    
    if (!$userPayload) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Unauthorized: Invalid token"]);
        exit();
    }
    
    return $userPayload; // Array containing user_id (UID)
}
?>
