browser.storage.local.set({
	text: {size:50},
});

//listen for font size change
document.getElementById("text-size").addEventListener("input", function(){
	var size = document.getElementById("text-size").value;

	var text = {
		size: size
	};

	browser.storage.local.set(text);

	console.log(text);

});