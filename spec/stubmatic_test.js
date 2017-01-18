var stubmatic =require('.././os/nushi/stubmatic/stubmatic')
var http = require('http');

/*describe("Stubmatic ", function() {
  it("should start and stop server", function() {*/
  	var httpOptions = {
			host: 'localhost',
			port: 9999,
			path: '/url3'
		};

	stubmatic({'-d' :"spec/test_assets"},server => {
		http.get(httpOptions,response => {
			var str = "";
			response.on('data', function (chunk) {
				str += chunk;
			});
			response.on('end', function () {
				console.log(str)
				//expect(str).toBe("this is repeated mapping2");
				server.close(() => {
					console.log("Stopping server");
				});
			});	
		})
	});	
  /*});
});*/