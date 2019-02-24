# Stubmatic
Mock HTTP calls without coding. Designed specially for testing and testers.

[![NPM quality][quality-image]][quality-url]
[![Travis ci Build Status](https://travis-ci.org/NaturalIntelligence/Stubmatic.svg?branch=master)](https://travis-ci.org/NaturalIntelligence/Stubmatic) 
[![Gitter](https://img.shields.io/gitter/room/Stubmatic/Stubmatic.svg)](https://gitter.im/Stubmatic/Lobby#) 
[![Known Vulnerabilities](https://snyk.io/test/github/naturalintelligence/stubmatic/badge.svg)](https://snyk.io/test/github/naturalintelligence/stubmatic) 
[![Coverage Status](https://coveralls.io/repos/github/NaturalIntelligence/Stubmatic/badge.svg?branch=dev)](https://coveralls.io/github/NaturalIntelligence/Stubmatic?branch=dev)

<a href="https://www.patreon.com/bePatron?u=9531404" data-patreon-widget-type="become-patron-button"><img src="https://c5.patreon.com/external/logo/become_a_patron_button.png" alt="Become a Patron!" width="200" /></a>
<a href="https://www.paypal.me/amitkumarguptagwl"> <img src="https://www.paypalobjects.com/webstatic/en_US/btn/btn_donate_92x26.png" alt="Stubmatic donate button"/></a>


[quality-image]: http://npm.packagequality.com/shield/stubmatic.svg?style=flat-square
[quality-url]: http://packagequality.com/#?package=stubmatic


<img align="right" src="https://naturalintelligence.github.io/Stubmatic/img/stubmatic_logo.png?raw=true" width="180px" alt="Stubmatic logo"/> 

1. Installation : `$npm install stubmatic -g`
2. Set up repo  : `$stubmatic init [repo-name]`
3. Start server : `$stubmatic [-d <repo-name>]`
4. Help         : `$stubmatic --help`

Important links : [Video Tutorial](https://youtu.be/7mA4-MXxwgk), [Wiki](https://github.com/NaturalIntelligence/Stubmatic/wiki), [NPM](https://www.npmjs.com/package/stubmatic), [Demo](https://github.com/NaturalIntelligence/Stubmatic/tree/master/functional-tests) application, [issues](https://github.com/NaturalIntelligence/Stubmatic/issues), [changelogs](https://github.com/NaturalIntelligence/Stubmatic/wikiChangelog)
[<img width="180px" src="https://naturalintelligence.github.io/Stubmatic/img/showcase_btn.png" alt="Stubmatic donate button"/>](https://naturalintelligence.github.io/Stubmatic/#showcase)

## Main features

* Mock HTTP(s) calls. (Hence can mock REST/SOAP web services)
* Inspect HTTP calls from CLI or log them for more detail.
* No code. Designed specially for testing and testers.
* Mock messagepack or Nimn (निम्न) response easily. Write in JSON parse in desirable format. 
* Support SSL certificates.
* Optional configuration
* Dynamic response
  * Use Regular Expressions to match a request, capture some part of the request, to decide response file at runtime, to change contents of response at runtime etc. 
  * Use **Expressions** (functions and markers) to display dynamic dates, random number etc.
  * Devide your response into multiple files (called **dumps**) for readability, reusability, and consistency.
  * Create a response skeleton with **DB sets** and fill data as per matched request.
  * Delay response for fixed or random time.
* Send response as a stream (downloadable file)
* Compress response automatically.
* Route requests to other server using **proxy**.
* Memory and CPU efficient
* Ready to be used in performance environment
* And much more like short notations, multiple mapping files, file strategy etc.

## Configuration
To install stubmatic, you need to install [nodejs](https://nodejs.org/en/download/) and npm first. It is recommanded to be on latest version of both. npm is bundeled with nodejs. Now follow above commands to install stubmatic and to set up a repo.

## How to start
Stubmatic works on request response mappings specified in a yaml file. Response contents can be read from *body* or *file* attribute of a maping. 

```yaml
-  request:
      url: /stubs/(admin|staff|customer|security)/([0-9]+)/2

   response:
      body: >
        multiple line response
        another line
```
When a request reaches to stubmatic server, it matches the request against all mappings. Whichever mapping matches first(top to bottom), will be used to serve the response. A complete response can be built with multiple files. It can also have some placeholder to show dynamic data, like date, or some random number or some part from request itself. Stubmatic first process and build complete response then respond back to any HTTP(s) request.

Using regular expression, single mapping can be used to match multiple requests and serve response from different files.

#### Sample SOAP request mapping
```yaml
-  request:
     method: POST
     url: /soap-simulator/services/ServiceName
     post: actionName[\s\S]*mobile.([0-9]+)
  response:
     headers:
           content-type: text/xml
     strategy: "first-found"
     files: ["stubs/<% post.1 %>/response.xml","stubs/ServiceName/actionName/default.xml"]
```
#### Sample REST request mapping
```yaml
-  request:
     method: GET
     url: /rest-simulator/services/ServiceName/actionName/([0-9]+)
  response:
     headers:
           content-type: text/xml
     strategy: "first-found"
     files: ["stubs/<% url.1 %>/response.xml","stubs/ServiceName/actionName/default.xml"]
```

### Worth to mention

- **[BigBit standard](https://bigbit.github.io/bigbitjs/?text=%F0%9F%92%A9%F0%9F%98%83%F0%9F%98%AD)** : A standard to reprent any number in the universe in comparitively less space and without precision loss. A standard to save space to represent any text string in comparision of UTF encoding.
- [अनुमार्गक (anumargak)](https://github.com/NaturalIntelligence/anumargak) : The fastest router for node web servers.
- **[imglab](https://github.com/NaturalIntelligence/imglab)** : Web based tool to label images for object. So that they can be used to train dlib or other object detectors. You can integrate 3rd party libraries for fast labeling.
- [fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser): Transform XML to JS/JSON objects, or Nimn rapidly. Transform back JSON to XML. Work in browser, node package, or CLI. Many options to customize parsing.
- [fast-lorem-ipsum](https://github.com/amitguptagwl/fast-lorem-ipsum) : Generate lorem ipsum words, sentences, paragraph very quickly.
- [Grapes](https://github.com/amitguptagwl/grapes) : Flexible Regular expression engine (for java) which can be applied on char stream. (maintainers are needed)

### Helpful articles and tutorials

- [Clean & quick way to create simulators](https://dzone.com/articles/stubby-db-clean-amp-quick-way-to-create-simulators)
- [Stubby4j to Stubmatic](https://medium.com/@amitgupta.gwl/stubby4j-to-stubmatic-a1c8b54d4758)
- [How to setup stubmatic project and stub SOAP webservices](https://naturalintelligence.github.io/Stubmatic/#exampleModal1)
- [How to delay response and stub RESTful webservices](https://naturalintelligence.github.io/Stubmatic/#exampleModal2)
- [How to route response to other servers](https://naturalintelligence.github.io/Stubmatic/#proxymodal)
- [How to make dynamic response with data sets, and expressions](https://naturalintelligence.github.io/Stubmatic/#exampleModal5)
- [How to break a response file into multiple files using dumps](https://naturalintelligence.github.io/Stubmatic/#exampleModal6)


