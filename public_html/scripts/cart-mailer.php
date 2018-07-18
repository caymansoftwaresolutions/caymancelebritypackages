<?php
/* 
 	If you understand PHP & html you can format request emails sent to customer & admin
*/
$messageResult 				= array();
$to 						= $_REQUEST["business"];
$sender 					= $_REQUEST["sof_email"];
//$shippingCharges 			= $_REQUEST["handling_cart"];
$cartLength 				= $_REQUEST["cartLength"];
//$currencyCode 				= $_REQUEST["currency_code"];

$adminEmailHeaders 			= "From: " . strip_tags($sender) . "\r\n";
$adminEmailHeaders 			.= "Reply-To: ". strip_tags($sender) . "\r\n";
$adminEmailHeaders 			.= "CC: evertonmalcolm77@gmail.com\r\n";
$adminEmailHeaders 			.= "BCC: webmaster@altdzyns.com\r\n";
$adminEmailHeaders 			.= "MIME-Version: 1.0\r\n";
//$adminEmailHeaders 			.= "Content-Type: text/html; charset=ISO-8859-1\r\n";
$adminEmailHeaders 			.= "Content-Type: text/html; charset=UTF-8\r\n";

$customerEmailHeaders 		= "From: " . strip_tags($to) . "\r\n";
$customerEmailHeaders 		.= "Reply-To: ". strip_tags($to) . "\r\n";
$customerEmailHeaders 		.= "MIME-Version: 1.0\r\n";
$customerEmailHeaders 		.= "Content-Type: text/html; charset=UTF-8\r\n";

// message
$startMessage 				= "<html><head>
  <title>Order Details</title>
</head>
<body style=\"font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;\" >
  <p>";

    $customerInformation = "";

  	if( !empty( $_REQUEST["fname"])  )
    {
    	$customerInformation .= "<br/>First Name: ";
		$customerInformation .= $_REQUEST["fname"];
    }

    if( !empty( $_REQUEST["lname"] ) )
	{
		$customerInformation .= "<br/>Last Name: ";
		$customerInformation .= $_REQUEST["lname"];
	}

	if( !empty($_REQUEST["sof_email"]) )
	{
		$customerInformation .= "<br/>Email: ";
		$customerInformation .= $_REQUEST["sof_email"];
	}

	if( !empty( $_REQUEST["sof_phone"] ) )
	{
		$customerInformation .= "<br/>Telephone: ";
		$customerInformation .= $_REQUEST["sof_phone"];
	}

	if( !empty( $_REQUEST["jet"] ) )
	{
		$customerInformation .= "<br/>Private Jet: ";
		$customerInformation .= $_REQUEST["jet"];
	}

	if( !empty( $_REQUEST["commercial"] ) )
	{
		$customerInformation .= "<br/>Commercial Jet: ";
		$customerInformation .= $_REQUEST["commercial"];
	}

	if( !empty( $_REQUEST["flight"] ) )
	{
		$customerInformation .= "<br/>Flight Number: ";
		$customerInformation .= $_REQUEST["flight"];
	}


	if( !empty( $_REQUEST["adate"] ) )
	{
		$customerInformation .= "<br/>Arrival Date: ";
		$customerInformation .= $_REQUEST["adate"];
	}

	if( !empty( $_REQUEST["atime"] ) )
	{
		$customerInformation .= "<br/>Arrival Time: ";
		$customerInformation .= $_REQUEST["atime"];
	}

	if( !empty( $_REQUEST["ddate"] ) )
	{
		$customerInformation .= "<br/>Departure Date: ";
		$customerInformation .= $_REQUEST["ddate"];
	}

	if( !empty( $_REQUEST["dtime"] ) )
	{
		$customerInformation .= "<br/>Departure Time: ";
		$customerInformation .= $_REQUEST["dtime"];
	}

	if( !empty( $_REQUEST["comadate"] ) )
	{
		$customerInformation .= "<br/>Arrival Date: ";
		$customerInformation .= $_REQUEST["comadate"];
	}

	if( !empty( $_REQUEST["comatime"] ) )
	{
		$customerInformation .= "<br/>Arrival Time: ";
		$customerInformation .= $_REQUEST["comatime"];
	}

	if( !empty($_REQUEST["sof_add"]) )
	{
		$customerInformation .= "<br/>Address: ";
		$customerInformation .= $_REQUEST["sof_add"];
	}
	
	if( !empty($_REQUEST["sof_zip"]) )
	{
		$customerInformation .= "<br/>Zip Code: ";
		$customerInformation .= $_REQUEST["sof_zip"];
	}
	
	if( !empty($_REQUEST["sof_city"]) )
	{
		$customerInformation .= "<br/>City: ";
		$customerInformation .= $_REQUEST["sof_city"];
	}

	if( !empty($_REQUEST["sof_ph"]) )
	{
		$customerInformation .= "<br/>Phone: ";
		$customerInformation .= $_REQUEST["sof_ph"];
	}

	if( !empty($_REQUEST["sof_country"]) )
	{
		$customerInformation .= "<br/>Country: ";
		$customerInformation .= $_REQUEST["sof_country"];
	}

	if( !empty($_REQUEST["sof_message"]) )
	{
		$customerInformation .= "<br/>Message: ";
		$customerInformation .= $_REQUEST["sof_message"];
	}

	$cartMessage = "<br/></p><strong>Details.</strong><br/><br/>
  <table border='1' cellpadding='5' cellspacing='0'>
    <tr>
      <th>Description</th><th>Quantity</th>
    </tr>";

	$totalAmount = 0;

	for ( $counter = 1; $counter < $cartLength; $counter++ ) {	
		$cartMessage .= "<tr><td>";
		$cartMessage .= $_REQUEST["item_name_".$counter];
		$cartMessage .= "</td><td>";
		$cartMessage .= $_REQUEST["quantity_".$counter];
		$cartMessage .= "</td></tr>";
	}

	$cartMessage .= "</table>";
    $endMessage = "</body></html>";

// Remove the backslashes that normally appears when entering " or '
$to = stripslashes($to); 
//$message = stripslashes($message); 

$adminMessageSubject        = "Request for Quote";
$adminMessageSubjectHtml    = "Hi admin, <h3>New Request has been placed</h3> <span style='color:#999999;'><strong>Date: </strong>" . date("l jS \of F Y h:i:s A") . " </span> <br><br> <strong>Customer Information: </strong><br>";

$customerMessageSubject     = "Your Request for Quote";
$customerMessageSubjectHtml = "Hi there, <h3>Your request has been Placed </h3> <span style='color:#999999;'><strong>Date: </strong>" . date("l jS \of F Y h:i:s A") . " </span> <br><br> <strong>Information you provided: </strong><br>";

$adminMessage       = $startMessage . $adminMessageSubjectHtml . $customerInformation . $cartMessage . $endMessage;
$customerMessage    = $startMessage . $customerMessageSubjectHtml . $customerInformation . $cartMessage . $endMessage;

/* 
 Send request email to store admin
*/
if( isset($adminMessage) and isset($adminMessageSubject) and isset($sender) ) {
	$adminMessageStatus = mail($to, $adminMessageSubject, $adminMessage, $adminEmailHeaders);
	$messageResult['adminMailSent'] = $adminMessageStatus;
}
/* 
 Send request email to customer
*/
if(isset($customerMessage) and isset($customerMessageSubject) and isset($sender)){
	$customerMessageStatus = mail($sender, $customerMessageSubject, $customerMessage, $customerEmailHeaders);

	$messageResult['customerMailSent'] = $customerMessageStatus;
}

echo json_encode( $messageResult );