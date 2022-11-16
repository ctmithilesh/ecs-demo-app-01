import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as ec2 from "aws-cdk-lib/aws-ec2"; 
import * as ecs from "aws-cdk-lib/aws-ecs"; 
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns"; 

export class EcsDemoApp01Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // vpc 
    const vpc = new ec2.Vpc(this, "MyVpc", { 

      maxAzs: 3 // Default is all AZs in region 

    }); 

    // cluster
    const cluster = new ecs.Cluster(this, "MyCluster", { 

      vpc: vpc 

    }); 

    // create a task definition with CloudWatch Logs 
    const logging = new ecs.AwsLogDriver({ 

        streamPrefix: "myapp", 
    
    }) 

    const taskDef = new ecs.FargateTaskDefinition(this, "MyTaskDefinition", { 
      memoryLimitMiB: 512, 
      cpu: 256, 

    }) 

    taskDef.addContainer("AppContainer", { 

      image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample"), 
      logging, 

    }) 

    // Create a load-balanced Fargate service and make it public 
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyFargateService", { 

      cluster: cluster, // Required 
      cpu: 512, // Default is 256 
      desiredCount: 6, // Default is 1 
      taskImageOptions: { image: ecs.ContainerImage.fromRegistry("amazon/amazon-ecs-sample") }, 
      memoryLimitMiB: 2048, // Default is 512 
      publicLoadBalancer: true // Default is false 

    }); 

    // example resource 
    const queue = new sqs.Queue(this, 'MyEcsConstructQueue', { 

        visibilityTimeout: cdk.Duration.seconds(300) 

    }); 

  }
}
