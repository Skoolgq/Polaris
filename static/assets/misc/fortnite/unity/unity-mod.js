function UnityOpen(url) {
	url= "#"+ url;
	console.log("--fx--UnityOpen--", url);	
	return url;
}

function UnityUrlFix(url) {
	// FIND: http.open(_method,_url,true);
	// REPL: http.open(_method,UnityUrlFix(_url),true);
	console.log("--fx--UnityUrlFix--", url);
	if(url.indexOf("unity3d.com")>0 || url.indexOf("appspot.com")>0 || url.indexOf("herocraft.com")>0){
		url= "json/null.json?"+ url;
	}
	
	return url;
}
