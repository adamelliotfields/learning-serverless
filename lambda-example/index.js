module.exports.handler = async (event, context) => {
  // Every Lambda function invoked by API Gateway should return an object like this.
  // https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-output-format
  return {
    statusCode: 200,
    // You need to manually enable CORS.
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    // Body must always be a string.
    body: JSON.stringify({ event, context }),
  };
};
