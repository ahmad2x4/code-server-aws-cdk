#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { OicdGithubStack } from '../lib/oicd-github-stack';

const app = new cdk.App();
new OicdGithubStack(app, 'OicdGithubStack', {
  deployRole: 'exampleGitHubDeployRole',
  repositoryConfig: [
    { owner: 'ahmad2x4', repo: 'code-server-aws-cdk' },
  ],
});