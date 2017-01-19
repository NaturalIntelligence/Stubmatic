var rewire = require('rewire');
var stubmatic =rewire('.././os/nushi/stubmatic/stubmatic');
var markers =require('.././os/nushi/stubmatic/markers')
var processRequest = stubmatic.__get__('processRequest');
var configBuilder = require(".././os/nushi/stubmatic/configbuilder");
var mappingLoader = require(".././os/nushi/stubmatic/loaders/mappings_loader");
//var http = require('http');

describe("Stubmatic ", function() {
  /*it("should start and stop server", function() {
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
  });*/

  //load configuration,mappings,dumps, and dbsets


  beforeEach(function(){
    configBuilder.build({ '-d' : "spec/test_assets"});
    global.basePath = "spec/test_assets";
    var config = configBuilder.getConfig();
  	stubmatic.__set__('mappings',mappingLoader.buildMappings(config));
  });
  
  
  it("should response with 404 status when mapping is not found", function() {
  	var onSuccess = function(){
  		throw Error("not expected");
  	};
  	var onError = function(data,options){
		expect(data).toBe("");
  		expect(options.status).toBe(404);
  	}

  	var request = { url: '/url6/2', method: 'GET'  	};
  	processRequest(request,onSuccess,onError);

  	request = {	url: '/url6/2',	method: 'POST' 	};
  	processRequest(request,onSuccess,onError);

  	request = {	url: '/url6/2',	method: 'POST',
  		headers:{
  			custom : "Custom"
  		}
  	};
  	processRequest(request,onSuccess,onError);

  	request = {	url: '/url6/2',	method: 'POST',
  		headers:{
  			custom : "Custom",
  			mandatory: "mandatory"
  		}
  	};
  	processRequest(request,onSuccess,onError);

  	request = {	url: '/url6/2',	method: 'POST',
  		headers:{
  			custom : "Custom",
  			mandatory: "mandatory"
  		},
  		query:{
  			q: "abc"
  		}
  	};
  	processRequest(request,onSuccess,onError);

  });

  it("should response with 200 when mapping is found", function() {
  	spyOn(markers, 'now').and.returnValue(new Date(2016,11,29,16,43,57));

  	var onError = () => {
  		//onError
  		throw Error("not expected");
  	};

	var request = {	url: '/url6/2',	method: 'POST',
  		post: "My mobile number is 987654321.",
  		headers:{
  			custom : "Custom",
  			mandatory: "mandatory"
  		},
  		query:{
  			q: "abc"
  		}
  	};

  	processRequest(request,(data,options) => {
  		var jsonData = JSON.parse(data);
  		expect(jsonData).toEqual({
  			body : "sample content with request body 987654321. and expressions 2016-12-30",
	    	headers : "Custom<% headers.2 %>",
	    	query : "abc",
	    	url : "2"
  		});
  		expect(options.status).toBe(202);
  		expect(options.latency).toBeGreaterThan(10);
  		expect(options.latency).toBeLessThan(100);
  		expect(options.headers["content-type"]).toEqual("application/json");
  	},onError);

  });

  it("should response with fileName", function() {
  	var onError = () => {
  		//onError
  		throw Error("not expected");
  	};

	var request = {	url: '/url7/2',	method: 'POST',
  		post: "My mobile number is 987654321.",
  		headers:{
  			custom : "Custom",
  			mandatory: "mandatory"
  		},
  		query:{
  			q: "abc"
  		}
  	};
  	processRequest(request,(data,options) => {
  		expect(data).toBe("spec/test_assets/response.json");
  		expect(options.status).toBe(202);
  		expect(options.latency).toBeGreaterThan(10);
  		expect(options.latency).toBeLessThan(100);
  		expect(options.headers["content-type"]).toEqual("application/json");
  	},onError);

  });

  /*it("should compress response if relevant headers are provided in request", function() {
  	var request = {};
  	processRequest(request,() => {
  		//onSuccess
  	}, () => {
  		//onError
  		throw Error("not expected");
  	});
  });*/
});