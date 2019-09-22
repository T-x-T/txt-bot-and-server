<?php 

echo "<script>

var paxterya_countries = {";

                    require_once("php/sql-login.php");

                    $stmt = $mysqli->query("SELECT countrycode, COUNT(*) AS num FROM members GROUP BY countrycode");
                
                    while ($row = mysqli_fetch_array($stmt)) {
                        
                        echo '"';
                        echo $row['countrycode'];
                        echo '":';
                        
                        echo '"';
                        echo $row['num'];
                        echo '",';
                        
                    }



echo "};</script>";

?>