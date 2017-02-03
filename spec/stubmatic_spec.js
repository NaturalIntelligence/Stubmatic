//var rewire = require('rewire');
var configBuilder = require(".././lib/configbuilder");
var mappingLoader = require(".././lib/loaders/mappings_loader");
var stubmatic = require('.././lib/stubmatic');
var markers = require('.././lib/markers')
var processRequest = stubmatic.processRequest;

describe("Stubmatic ", function () {

	beforeEach(function () {
		configBuilder.build({
			'-d': "spec/test_assets"
		});
		global.basePath = "spec/test_assets";
		var config = configBuilder.getConfig();
		mappingLoader.buildMappings(config);
	});

	describe("should response with 404 status when mapping doesn't match because", function () {
		var onSuccess = function () {
			throw Error("not expected");
		};
		var onError = function (data, options) {
			expect(data).toBe("");
			expect(options.status).toBe(404);
		}
		it("method is wrong", function () {

			var request = {
				url: '/url6/2',
				method: 'GET'
			};
			processRequest(request, onSuccess, onError);
		});
		it("headers, query params and request body are not given", function () {

			var request = {
				url: '/url6/2',
				method: 'POST'
			};
			processRequest(request, onSuccess, onError);

		});
		it("query params and request body are not given and only some headers are given", function () {
			var request = {
				url: '/url6/2',
				method: 'POST',
				headers: {
					custom: "Custom"
				}
			};
			processRequest(request, onSuccess, onError);
		});
		it("query params and request body are not given", function () {
			var request = {
				url: '/url6/2',
				method: 'POST',
				headers: {
					custom: "Custom",
					mandatory: "mandatory"
				}
			};
			processRequest(request, onSuccess, onError);
		});
		it("request body is not given", function () {
			request = {
				url: '/url6/2',
				method: 'POST',
				headers: {
					custom: "Custom",
					mandatory: "mandatory"
				},
				query: {
					q: "abc"
				}
			};
			processRequest(request, onSuccess, onError);

		});
	});

	it("should response with 200 when mapping is found", function () {

		spyOn(markers, 'now').and.returnValue(new Date(2016, 11, 29, 16, 43, 57));

		var onError = () => {
			//onError
			throw Error("not expected");
		};

		var request = {
			url: '/url6/2',
			method: 'POST',
			post: "My mobile number is 987654321.",
			headers: {
				custom: "Custom",
				mandatory: "mandatory"
			},
			query: {
				q: "abc"
			}
		};

		processRequest(request, (data, options) => {
			var jsonData = JSON.parse(data);
			expect(jsonData).toEqual({
				body: "sample content with request body 987654321. and expressions 2016-12-30",
				headers: "Custom<% headers.2 %>",
				query: "abc",
				url: "2"
			});
			expect(options.status).toBe(202);
			expect(options.latency).toBeGreaterThan(10);
			expect(options.latency).toBeLessThan(100);
			expect(options.headers["content-type"]).toEqual("application/json");
		}, onError);

	});

	it("should response with fileName", function () {
		var onError = () => {
			//onError
			throw Error("not expected");
		};

		var request = {
			url: '/url7/2',
			method: 'POST',
			post: "My mobile number is 987654321.",
			headers: {
				custom: "Custom",
				mandatory: "mandatory"
			},
			query: {
				q: "abc"
			}
		};
		processRequest(request, (data, options) => {
			expect(data).toBe("spec/test_assets/response.json");
			expect(options.status).toBe(202);
			expect(options.latency).toBeGreaterThan(10);
			expect(options.latency).toBeLessThan(100);
			expect(options.headers["content-type"]).toEqual("application/json");
		}, onError);

	});

	describe("should resolve the correct file as per file strategy", function () {
		var onError = () => {
			//onError
			throw Error("not expected");
		};

		it("should select next file when 1st file doesn't exist", function () {
			var request = {
				url: '/url8',
				method: 'GET'
			};
			processRequest(request, (data, options) => {
				expect(data).toBe("This is the simple response to test.");
				expect(options.status).toBe(200);
			}, onError);
		});

		it("should return 404 when no file exist", function () {
			var request = {
				url: '/url8/2',
				method: 'GET'
			};
			processRequest(request, (data, options) => {
				throw Error("not expected");
			}, function (data, options) {
				expect(data).toBe("");
				expect(options.status).toBe(500);
			});
		});

		it("should select any file in random", function () {
			var request = {
				url: '/url9',
				method: 'GET'
			};
			processRequest(request, (data, options) => {
				expect(data).toMatch("This is (another|the) simple response to test.");
				expect(options.status).toBe(200);
			}, onError);

			processRequest(request, (data, options) => {
				expect(data).toMatch("This is (another|the) simple response to test.");
				expect(options.status).toBe(200);
			}, onError);

		});

		it("should select file in round-robin fashion", function () {
			var request = {
				url: '/url10',
				method: 'GET'
			};
			processRequest(request, (data, options) => {
				expect(data).toBe("This is the simple response to test.");
				expect(options.status).toBe(200);
			}, onError);

			processRequest(request, (data, options) => {
				expect(data).toBe("This is another simple response to test.");
				expect(options.status).toBe(200);
			}, onError);
		});

		it("should throw err when file doesn't present in round-robin fashion", function () {
			var request = {
				url: '/url11',
				method: 'GET'
			};
			processRequest(request, (data, options) => {
				throw Error("not expected");
			}, function (data, options) {
				expect(data).toBe("");
				expect(options.status).toBe(500);
			});

			processRequest(request, (data, options) => {
				expect(data).toBe("This is the simple response to test.");
				expect(options.status).toBe(200);
			}, onError);
		});
	});
});