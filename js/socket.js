if ("WebSocket" in window) {
	var connection = new WebSocket("ws://localhost:9998/echo");

}
else alert('WebSocket is not supported on this browser!');