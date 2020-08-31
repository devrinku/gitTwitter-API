class Response {
  constructor(statusCode, data, pagination) {
    if (statusCode) {
      this.statusCode = statusCode;
    }

    if (data) {
      this.data = data;
    }
    if (pagination) {
      this.pagination = pagination;
    }
  }
}

module.exports = Response;
