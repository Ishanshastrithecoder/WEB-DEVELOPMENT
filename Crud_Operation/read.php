<?php
include 'db.php';
$result = $conn->query("SELECT * FROM users");
?>

<h2>Users List</h2>
<table border="1" cellpadding="8">
<tr>
  <th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Action</th>
</tr>

<?php while($row = $result->fetch_assoc()) { ?>
<tr>
  <td><?= $row['id']; ?></td>
  <td><?= $row['name']; ?></td>
  <td><?= $row['email']; ?></td>
  <td><?= $row['phone']; ?></td>
  <td>
    <a href="update.php?id=<?= $row['id']; ?>">Edit</a> |
    <a href="delete.php?id=<?= $row['id']; ?>">Delete</a>
  </td>
</tr>
<?php } ?>
</table>
