<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: text/csv");
header("Content-Disposition: attachment; filename=users_list.csv");



include("db.php");
$query = "
    SELECT u.id, u.first_name, u.last_name, u.email, u.phone, u.gender,
           u.education, u.hobbies, u.password, u.role_id, c.name AS country
    FROM users u
    LEFT JOIN countries c ON u.country_id = c.id
";

$result = mysqli_query($conn, $query);

if (!$result) {
    die("Query failed: " . mysqli_error($conn));
}

$rows = mysqli_fetch_all($result, MYSQLI_ASSOC);

// Output CSV
$output = fopen("php://output", "w");

// Headers
fputcsv($output, [
    'ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Gender',
    'Education', 'Hobbies', 'Password', 'Role ID', 'Country'
]);

// Data rows
foreach ($rows as $row) {
    fputcsv($output, [
        $row['id'],
        $row['first_name'],
        $row['last_name'],
        $row['email'],
        $row['phone'],
        $row['gender'],
        $row['education'],
        $row['hobbies'],
        $row['password'],
        $row['role_id'],
        $row['country']
    ]);
}

fclose($output);
exit;
