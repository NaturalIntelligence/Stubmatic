class ApplicationError extends Error {
    constructor(message, response) {
      super(message);
      this.name = "ApplicationError"; 
      this.response = response;
    }
  }
  

  module.exports = ApplicationError;