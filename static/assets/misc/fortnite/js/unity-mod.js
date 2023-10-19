function UnityOpen(url) {
	url= "#"+ url;
	console.log("--fx--UnityOpen--", url);	
	return url;
}

function UnityUrlFix(url) {
	console.log("--fx--UnityUrlFix--", url);
	if(url.indexOf("unity3d.com")>0 || url.indexOf("appspot.com")>0){
		url= "json/null.json?"+ url;
	}
	return url;
}
