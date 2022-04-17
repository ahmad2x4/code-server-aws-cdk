import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class ApplicationStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const myBucket = new Bucket(this, "my-static-website-bucket", {
      publicReadAccess: true,
      removalPolicy: RemovalPolicy.DESTROY,        
      websiteIndexDocument: "index.html"
   });
  }
}
