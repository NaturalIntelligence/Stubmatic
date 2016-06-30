# StubbyDB

[![NPM](https://nodei.co/npm/stubby-db.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/stubby-db/)
[![NPM](https://nodei.co/npm-dl/stubby-db.png?months=3&height=3)](https://nodei.co/npm/stubby-db/)


  <img align="right" src="http://naturalintelligence.github.io/StubbyDB/assets/img/stubbydb_logo_300.png?raw=true" alt="Sublime's custom image"/>
A nodejs based complete solution for maintaining the stubs for your project

To install

	$npm install stubby-db -g

For basic help

	$stubbydb --help

Important links : [Wiki](https://github.com/NaturalIntelligence/StubbyDB/wiki), [NPM](https://www.npmjs.com/package/stubby-db), [Demo](https://github.com/NaturalIntelligence/stubby-db-test) application, [issues](https://github.com/NaturalIntelligence/StubbyDB/issues)


[![Donate to author](https://www.paypalobjects.com/webstatic/en_US/btn/btn_donate_92x26.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=KQJAX48SPUKNC)

##History
Developed by a victim.

I was  previously using an open source project to manage stubbed data. However with the time when the project is expanded, I started missing few features in that. I also faced many limitations. Hence I decided to created a simple, light weighted, highly customizable, and easy to handy tool to manage stub data in whichever way I want.

##Description
Stubby DB is a npm module. In simple words you can stub the HTTP/HTTPS calls to provide stubbed data. You can make stubbed data service for SOAP or REST calls. Basic functionality is somewhat similar to stubby4j. But it has so many other features. 

###Features and Basic terminology

To start with stubby db, you need to create **a yaml file** which maps request with response. You may need **response files** as per your need and optional config.json file to ask Stubby DB to use default options defined by you.

####Mappings
yaml based mappings are required to map a request with relevant response file. You can have multiple files instead of maintaining a big fat file. You can also mark files which should be used to map the requests and skip which are under development.

```yaml
-  request:
      method: POST
      latency: 0
      headers:
      status: 200
      url: /stubs/simple
      post: Hello ([a-zA-Z]+) ([a-zA-Z]+)!! Your number is ((\+[0-9]{2}) ([0-9]+))

   response:
      file: post.xml
```
For maintainability purpose and to keep the size of mapping file short you can use **Short Notations** and **Default configuration**. Check [wiki](https://github.com/NaturalIntelligence/StubbyDB/wiki/03.0-Mappings) for more detail.

####Strategy
Many times, you don't have just one-to-one mapping between the request and response. You want to server different response every time, or you want to serve default response instead of saying 404 (stub data not found). There are many strategies, you can use suits to your requirement;

```yaml
-  request:
      url: /stubs/employee/([0-9]+)

   response:
      strategy: random
      files: ["<% url.1 %>.xml","file2.xml","file3.xml"]
```

Stubby DB is currently supporting following strategies;

1. first-found : In above example, whichever file is found first, serve that response.
2. random : In above example, serve any file from mentioned list.
3. round-robin : In above example, serve the files in sequential order. So on second same request, it'll serve response from file2.xml


####Dynamic Response
Instead of creating multiple mappings for same request where just few query parameters or headers are being changed. You can use Regular expression to write generic mappings.

Capture some part from request and use it determine the file name, or use it in file contents, or in response headers.

```yaml
-  request:
      method: POST
      url: /stubs/post2
      post: Mobile=([0-9]+)
      #name=Amit&Mobile=781011111&Sal=100000.00&DOJ=25-APR-2012

   response:
      #Mobile=781011111,781011111,<% post.2 %>
      body: <% post.0 %>,<% post.1 %>,<% post.2 %>	
```

####Data dumps
Stubby DB let you construct the response from multiple files. You can include contents of other file into your response files.

This is the content from sample response file.

	Employee: <% post.1 %>
	Projects:
		[[dumps/projects:project1,project2]]

Now you need not maintain a big response file. Split them and reuse in different responses. It'll also increase consistency.
You can also decide at the run time which dumps have to be included.


####DB sets
If you still feel that you have so many response files in your project and it is being difficult to maintain them, use this **skeleton based approach**. 

Use a response file as skeleton and fill the data from a dbset.

Sample response file

```
Employee: <% url.1 %>
Name: ##Name##
Projects:
	[[dumps/projects:##Projects##]]
```

Sample dbset file: ./dbsets/employee

```
Num 	|Name 			|Projects
001 	|Some Name 		|project1, project2
002 	|Another Name 	|project2, project3, project4
```

Actual Response

```
Employee: 001
Name: Some Name
Projects:

Title : Title 1
Description: This is project 1
:

Title : Title 2
Description: This is project 2
:
```

See sample [yaml](https://github.com/NaturalIntelligence/stubby-db-test/blob/master/mappings/dbset.yaml) for more detail. Check [DBset wiki](https://github.com/NaturalIntelligence/StubbyDB/wiki/08.0-DB-Sets#strategy) to know about strategies for DB sets.

####Latency
When you want to serve the response with some delay. It may be useful to test negative scenarios or for performance test.

####DEBUG & Logging

1. On screen loggin with '-v' or '--verbose' option
2. File based logging with '-l' or '--logs' option
3. On demand logging with query parameter 'debug=true' with request URL. It gives additional detail with the response: Original request, Matched mapping, Raw and fine response etc. Response status depends on how your requests gets resolved. If 'debug=true' is provided on root url, then it gives system level information, configuration etc.

####Markers
StubbyDB has inbuilt support for markers. So if you write `{{TODAY+1y-2m+3d}}` in somewhere of response body or file, It'll be converted into 'yyyy-mm-dd' format date. If you say `{{URL:someurl}}`, it'll encode the URL. There are many other markers are in development. And in near future StubbyDB will be able to support markers written by you.

####Configuration
StubbyDB provides you many way of configuring your project: commandline arguments, configuration file, directory structure.

####SSL hanndshaking
Stubby DB supports HTTPS and 2 way SSL handshaking as well. Have a look on [wiki](https://github.com/NaturalIntelligence/StubbyDB/wiki/10.0-SSL-handshaking) and demo application for more detail.

####Compression
If accept-encoding header is set to deflate or gzip then stubby-db serve compressed response.

####Attachments
If contentType property is set in your mappings, stubby db sends file otherwise it sends file response as response body after resolving all markers,expressions,dbsets etc.
