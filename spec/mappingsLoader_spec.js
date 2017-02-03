var mappingLoader = require(".././lib/loaders/mappings_loader");
var path = require('path')


/**
Expectations:
	Should report correctly when there is syntatical error
	Should report correctly when invalid mapping

**/
describe("Mapping Loader ", function() {
  	var onlyMappingConfig = {
  		"mappings": {
		    "files": [ path.join(__dirname ,"test_assets/mappings/mapping1.yaml"), path.join(__dirname ,"test_assets/mappings/mapping2.yaml")]
		}
  	};

  	var defaultMappingConfig = {
  		"mappings": {
		    "default": {
		      "request": {
		        "method": "POST"
		      },
		      "response": {
		        "strategy": "first-found",
		        "latency": 100,
		        "status": 500
		      }
		    },
		    "files": [ path.join(__dirname ,"test_assets/mappings/mapping1.yaml"), path.join(__dirname ,"test_assets/mappings/mapping2.yaml")]
		}
  	}

  it("should load mappings from multipls files", function() {
  	var mappings = mappingLoader.buildMappings(onlyMappingConfig);
  	expect(mappings.length).toBe(17);
  });

  it("should not load invalid mappings", function() {
  	//body, file, files are not allowed together

  });

  it("should attach missing mappings for short notations", function() {
  	var mappings = mappingLoader.buildMappings(onlyMappingConfig);
  	
  	var expected = { 
  		request: { url: '/url1/1', method: 'GET' },
    	response: { file: 'someFile.txt', status: 200, latency: 0}
    };

  	expect(mappings[0]).toEqual(expected);

  	expected = { 
  		request: { url: '/url1/2', method: 'HEAD' },
    	response: { body: 'ok', status: 200, latency: 0}
    };

  	expect(mappings[1]).toEqual(expected);

	expected = { 
  		request: { url: '/url1/3', method: 'PUT' },
    	response: { status: 502, latency: 3000}
    };
  	expect(mappings[2]).toEqual(expected);

  	expected = { 
  		request: { url: '/url1/4', method: 'POST' },
    	response: { files: ['someFile.txt','default.txt'], strategy: 'first-found', status: 200, latency: 0}
    };
  	expect(mappings[3]).toEqual(expected);

  });

  //Preference: given mapping > default mapping > default values
  it("should attach default mappings otherwise missing mappings", function() {
  	var mappings = mappingLoader.buildMappings(defaultMappingConfig);
  	
  	var expected = { 
  		request: { url: '/url1/1', method: 'GET' },
    	response: { file: 'someFile.txt', status: 500, latency: 100}
    };

		//console.log(JSON.stringify(mappings[0],null,4));
  	expect(mappings[0]).toEqual(expected);

  	expected = { 
  		request: { url: '/url1/2', method: 'HEAD' },
    	response: { body: 'ok', status: 500, latency: 100}
    };

  	expect(mappings[1]).toEqual(expected);

	expected = { 
  		request: { url: '/url1/3', method: 'PUT' },
    	response: { status: 502, latency: 3000}
    };
  	expect(mappings[2]).toEqual(expected);

  	expected = { 
  		request: { url: '/url1/4', method: 'POST' },
    	response: { files: ['someFile.txt','default.txt'], strategy: 'first-found', status: 500, latency: 100}
    };
  	expect(mappings[3]).toEqual(expected);

  	expected = { 
  		request: { url: '/url2', method: 'POST' , headers:{custom: 'Custom'}},
    	response: { body: 'This is sample contents served from body', status: 500, latency: [1000,2000]}
    };
  	expect(mappings[4]).toEqual(expected);

  	expected = { 
  		request: { url: '/url4', method: 'POST'},
  		dbset: { db: 'dbsetname', key: 'keyname'},
    	response: { file: 'responseFilePath', status: 500, latency: 100}
    };
  	expect(mappings[6]).toEqual(expected);

  });

});