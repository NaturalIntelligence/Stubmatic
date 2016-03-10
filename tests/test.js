var http = require('http');
var chalk = require('chalk');
var deasync = require('deasync');


testData = [
			{request:{path:'/stubs/healthcheck'}, response:{ body:'OK'}},
			{request:{path:'/stubs/body'}, response:{ body:'This is sample contents served from body'}},
			{request:{path:'/stubs/simple'}, response:{ body:'Sample File contents'}},
			{request:{path:'/stubs/not-found'}, response:{ body:'Sample File contents'}},
			{request:{path:'/stubs/random'}, response:{ }},
			{request:{path:'/stubs/round-robin'}, response:{ }},
			{request:{path:'/stubs/phone-2563'}, response:{ body:'phoine number = 2563'}},
			{request:{path:'/stubs/markers'}, 
				response:{ body:'Today is 2016-03-08. And the url is https://www.google.co.uk/?gws_rd=ssl#safe=strict&q=blah%20blah. Tomorrow would be 2016-03-09. And yesterday it was 2016-03-07. Other url https://www.google.co.uk/?gws_rd=ssl#safe=strict&q=ola%20ola.'}},
			{request:{path:'/stubs/dynamic-filename/2'}, response:{ body:'file 2'}},
			{request:{path:'/stubs/dynamic-filename/9'}, response:{ status: 404}},
			{request:{path:'/stubs/500'}, response:{ status:500}},
			{request:{path:'/stubs/simple', method: 'POST', post:'Hello Amit Gupta!! Your number is +44 7123456789'}, response:{ body:'My name is Amit Gupta. My mobile number is 07123456789.'}},
			{request:{path:'/stubs/header',headers: {'custom': 'Custom'}}, response:{ body:'Sample File contents'}},
			{request:{path:'/stubs/dumps'}, response:{ body: 'Some text in this file. dumps 1 dumps 2 and some footer. Some text in this file. dumps 1dumps 2 and some footer.'}},
			{request:{path:'/stubs/datasets/001'}, response:{ body: 'My name is Amit Gupta. My Employee ID is 001. Somehow I earn 1000000000'}},
			{request:{path:'/stubs/datasets/002'}, response:{ body: 'My name is Nilesh. My Employee ID is 002. Somehow I earn 9000000000'}}
			,{request:{path:'/stubs/mix', method:'POST', post:'Hello Amit!!'}, response:{ body: 'Amit\nSome text in this file.\ndumps included here from given datasets\ndumps 1dumps 2\nmarkers from data set: 2016-03-08\n and some footer.'}}
			,{request:{path:'/stubs/post2', method:'POST', post:'name=Amit&Mobile=781011111&Sal=100000.00&DOJ=25-APR-2012'}, response:{ body: 'Mobile=781011111,781011111,<% post.2 %>'}}
			,{request:{path:'/stubs/post3', method:'POST', post:'name=Amit&Mobile=(44)781011111&Sal=100000.00&DOJ=25-APR-2012'}, response:{ body: '44,44,781011111,781011111,100000'}}
			,{request:{path:'/stubs/post4', method:'POST', post:'name=Amit&Mobile=(44)781011111&Sal=100000.00&DOJ=25-APR-2012'}, response:{ body: '=100000,100000,=25,25,<% post.4 %>,,<% post.5 %>'}}
			,{request:{path:'/stubs/post5', method:'POST', post:'name=Amit&Mobile=781011111&Sal=100000.00&DOJ=25-APR-2012'}, response:{ body: 'name=Amit&Mobile=781011111&Sal=100000.00&DOJ=25-APR-2012,781011111,<% post.2 %>'}}
			]

validate = function(actual_res, expected_res, testNumber){
	var result = false;
	if(!expected_res.status){
		result = actual_res.statusCode == 200;
	}else{
		result = actual_res.statusCode == expected_res.status;
	}

	if(expected_res.body){
		result = actual_res.body == expected_res.body;
	}

	if(result){
		console.log(chalk.green('Test ' + testNumber + " PASS"));
	}else{
		console.log(chalk.red('Test ' + testNumber + " Fails"));
	}
}

for (var i = 0; i<testData.length; i++) {
	var test = testData[i];
	var options = {host: "localhost", port: 9999, method: 'GET'};
	options['path'] = test.request.path;
	if(test.request.headers){
		options['headers'] = test.request.headers;
	}
	if(test.request.method){
		options['method'] = test.request.method;	
	}
	
	var testState = false;
	var req = http.request(options, function(response){
		var str = ''
		response.on('data', function (chunk) {
			str += chunk;
		});

		response.on('end', function () {
			response['body'] = str;
			validate(response,test.response, i);
			testState = true;
		});
	});

	if(test.request.post){
		req.write(test.request.post);	
	}
	req.end();

	deasync.loopWhile(function(){return !testState;});
}



