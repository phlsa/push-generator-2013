<?php

#	Super basic image saving script
#	Gets called when rendering a list of names

#	Config
	$upload_dir = "./push_render/";
	
if ( isset( $_POST['data'] ) && isset( $_POST['name'] ) ) {

	$filename = $_POST['name'];
	$img = $_POST['data'];
	
	$img = str_replace( 'data:image/png;base64,', '', $img );
	$img = str_replace( ' ', '+', $img );
	$data = base64_decode( $img );
	$file = $upload_dir . uniqid() . $filename . '.png';
	$success = file_put_contents( $file, $data );
	
	print $success ? $file : 'Unable to save the file.';	
	
} else {
	echo "You must supply image data";
}
	
?>