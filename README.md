# `learning-serverless`

Notes from my experience learning [Serverless Framework](https://www.serverless.com).

This is not intended to be a guide, so it might not make sense to you. Feel free to open an [issue](https://github.com/adamelliotfields/learning-serverless/issues)
if you'd like to suggest something or need help otherwise.

## What is Serverless Framework?

Serverless Framework is a toolkit for building serverless applications. By simply providing a few
lines of YAML to the Serverless CLI, you can easily provision cloud resources on AWS. Serverless was
originally known as JAWS (JavaScript AWS).

The benefit of using Serverless over something like Vercel is that with Serverless you're
provisioning AWS resources that you have complete control over and that can easily be connected to
other AWS resources like Cognito or a database. If you need a resource that is not supported by
Serverless natively, they allow you provide a CloudFormation template so you can still accomplish
everything with one tool. When you're using a service like Vercel or Heroku, you are sacrificing
that control for simplicity.

## What are Serverless Components?

Serverless Components are a new feature from Serverless. Each component is a JavaScript class that
implements an interface to provision cloud resources using user-defined settings. There are quite a
few official components, and anyone can make a new component and upload it to the Serverless
Component Registry.

Components are very easy to use, but the official ones don't support every possible configuration
setting that you get when using the old format. For example, I did not see a way to add an event
trigger when using the `aws-lambda` component. Also the [`serverless-finch`](https://github.com/fernando-mc/serverless-finch)
plugin has much more options than the `website` component.

Components are also executed in the cloud, not locally. When you deploy a traditional Serverless
service or stack, a CloudFormation template and Lambda zip package are uploaded to S3. This doesn't
happen when you deploy a Serverless Component and I _think_ it's because Components don't use
CloudFormation.

## Getting Started

> Note that you'll need a domain either registered with Route 53 or at least managed by Route 53.

First log into your AWS account.

Next you'll need to create a free account at <https://app.serverless.com>.

Now within the Serverless dashboard, click "Org" then "Providers" then click the "add" button. Then
click the "create role" button to be redirected to AWS CloudFormation. Once you click
"Create Stack", you'll be redirected back to Serverless and should see your AWS provider.

> Note that by default, this role is given `AdministratorAccess` permission.

You're also going to need to have the AWS CLI and Serverless CLI installed:

```bash
# First install and configure AWS (you'll need your access key ID and secret)
wget https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -O /tmp/aws.zip
unzip /tmp/aws.zip -d /tmp
rm /tmp/aws.zip
sudo /tmp/aws/install
rm -rf /tmp/aws
aws configure

# Now install Serverless and log-in (this will open your default web browser)
npm i -g serverless
serverless login
```

## Examples

### Static Website

The [website](https://github.com/serverless-components/website) component will deploy your web app
to an S3 bucket and create a Cloudfront distribution.

If your domain name is managed by Route 53, it will also create the necessary DNS records and an
ACM HTTPS certificate. If the domain name you specify is a naked domain (no subdomain) it will
also create a record for the `www` subdomain; likewise, if the domain you specify has a `www`
subdomain, it will create a naked domain record as well.

```bash
cd website-component-example
# The debug option shows you exactly what Serverless is doing.
sls deploy --debug
```

Run `sls remove` to remove the created resources. It will take a little time for the Cloudfront
distribution to be disabled and you'll have to delete it manually. The ACM certificate will remain
as it can be reused (it's a wildcard subdomain).

### IAM Role

The [aws-iam-role](https://github.com/serverless-components/aws-iam-role) component will create an
IAM role. You can provide either a single policy ARN or an inline policy statement. This component
is useful for creating roles you can use in your other components.

```bash
cd iam-role-example
sls deploy --debug
```

### Express Application

The [`express`](https://github.com/serverless-components/express) component allows you to deploy an
Express application as a Lambda function.

It works by wrapping your Express app in the [`serverless-http`](https://www.npmjs.com/package/serverless-http)
library. This allows you to use middleware and define routes like you normally would in a
traditional Express app.

For this to work, you want to separate your `app` from your `server`, and you also must set
`"main": "app.js"` in `package.json`.

The component will also create an API Gateway HTTP API pointing to your Express Lambda and a custom
domain with a ACM HTTPS certificate.

```bash
cd express-example
sls deploy --debug
```

### GraphQL API

The [`graphql`](https://github.com/serverless-components/graphql) component will create a Lambda
function and AppSync API using the GraphQL schema and resolvers you provide. The API will be secured
with an API Key. It will also create a CloudFront distribution to cache your responses as well as a
custom domain with an ACM HTTPS certificate.

```bash
cd graphql-example
sls deploy --debug
```

If you get a KMS `CreateGrant` error, you might have to wait a few minutes and try deploying again.
You can read more about this [here](https://docs.aws.amazon.com/kms/latest/APIReference/API_CreateGrant.html).

### Lambda Function

The [aws-lambda](https://github.com/serverless-components/aws-lambda) component will create a Lambda
function. As of right now I found this component to be pretty limited. The runtime is hard-coded at
Node v12 and you cannot add any event triggers (in other words, it just uploads your function to
Lambda with no way to invoke it). To get it to even work, I had to create a custom IAM Role because
the default role it uses didn't exist on my account (`AWSLambdaFullAccess` should be
`AWSLambda_FullAccess`). This component is probably a work-in-progress.

To that end, this example uses the traditional (non-component) syntax. It will create a Lambda
function and an API Gateway API pointing to the Lambda. Because this is not using a Serverless
Component, it will upload a CloudFormation template and a zip containing your Lambda to S3.

```bash
cd lambda-example
# The --debug option doesn't work when deploying non-components.
sls deploy
```

### NextJS Application

The [`serverless-nextjs`](https://github.com/serverless-nextjs/serverless-next.js) component will
build your NextJS and deploy the static pages and resources to S3 and create Lambda functions for
the dynamic pages and API. A CloudFront distribution will be created and configured to point at your
S3 bucket and Lambdas. Finally, it will also configure your custom domain with Route 53 and
provision a HTTPS certificate from ACM.

Note that this component is not maintained by the Serverless team and it is currently using the
Components beta syntax (so it looks different than the other examples and you cannot run
`sls deploy`).

Also note that running `sls remove` threw an error. The CloudFront distribution was disabled and the
S3 bucket was removed, but the Route 53 domain and the 2 Lambda functions remained and had to be
deleted manually. Follow [this guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/lambda-edge-delete-replicas.html)
to see how to delete a Lambda@Edge function.

```bash
cd nextjs-example
# Run the serverless command with no arguments or options.
sls
```
