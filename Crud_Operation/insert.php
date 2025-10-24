<?php
include 'db.php';

if(isset($_POST['submit'])){
    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];

    $sql = "INSERT INTO users (name, email, phone) VALUES ('$name', '$email', '$phone')";
    if($conn->query($sql) === TRUE){
        echo "New record created successfully!";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}
?>

<form method="POST">
  Name: <input type="text" name="name"><br><br>
  Email: <input type="email" name="email"><br><br>
  Phone: <input type="text" name="phone"><br><br>
  <input type="submit" name="submit" value="Add User">
</form>
