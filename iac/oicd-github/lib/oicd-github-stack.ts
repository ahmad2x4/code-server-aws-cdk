import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { OpenIdConnectProvider, Conditions, Role, WebIdentityPrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';


export interface OicdGithubStackProps extends StackProps {
  /**
    * Name of the deploy role to assume in GitHub Actions.
    *
    * @default - 'exampleGitHubDeployRole'
    */
  readonly deployRole: string;
  /**
   * The sub prefix string from the JWT token used to be validated by AWS. Appended after `repo:${owner}/${repo}:`
   * in an IAM role trust relationship. The default value '*' indicates all branches and all tags from this repo.
   *
   * Example:
   * repo:octo-org/octo-repo:ref:refs/heads/demo-branch - only allowed from `demo-branch`
   * repo:octo-org/octo-repo:ref:refs/tags/demo-tag - only allowed from `demo-tag`.
   * repo:octo-org/octo-repo:pull_request - only allowed from the `pull_request` event.
   * repo:octo-org/octo-repo:environment:Production - only allowd from `Production` environment name.
   *
   * @default '*'
   * @see https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect#configuring-the-oidc-trust-with-the-cloud
   */
  readonly repositoryConfig: { owner: string; repo: string; filter?: string }[];
}


export class OicdGithubStack extends Stack {
  constructor(scope: Construct, id: string, props: OicdGithubStackProps) {
    super(scope, id, props);

    const githubDomain = 'token.actions.githubusercontent.com';

    const ghProvider = new OpenIdConnectProvider(this, 'githubProvider', {
      url: `https://${githubDomain}`,
      clientIds: ['sts.amazonaws.com'],
    });

    const iamRepoDeployAccess = props.repositoryConfig.map(r =>
      `repo:${r.owner}/${r.repo}:${r.filter ?? '*'}`);

    // grant only requests coming from a specific GitHub repository.
    const conditions: Conditions = {
      StringLike: {
        [`${githubDomain}:sub`]: iamRepoDeployAccess,
      },
    };

    new Role(this, 'cloudNationGitHubDeployRole', {
      assumedBy: new WebIdentityPrincipal(ghProvider.openIdConnectProviderArn, conditions),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'),
      ],
      roleName: props.deployRole,
      description: 'This role is used via GitHub Actions to deploy with AWS CDK or Terraform on the target AWS account',
      maxSessionDuration: Duration.hours(1),
    });
  }}
