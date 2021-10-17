import AWS from 'aws-sdk';
import {GetPolicyResponse} from "aws-sdk/clients/lambda";

export class AWSUtils
{
	static profile: string;
	static region: string = 'us-east-1';
	static accountID: string;

	private static setupAWS ()
	{
		AWS.config.credentials = new AWS.SharedIniFileCredentials({profile: this.profile});
		AWS.config.region = this.region;
	}

	static updateLambdaPermissions = async (dryRun: boolean, restApiName: string, startingSid: number, removeOldPermissions: boolean) =>
	{
		if (dryRun)
			console.info('--------------------- DRY RUN --------------------- ');

		console.info(`[IN] restApiName: ${restApiName}`);
		console.info(`[IN] startingSid: ${startingSid}`);
		console.info(`[IN] removeOldPermissions ${removeOldPermissions}`);

		AWSUtils.setupAWS();

		if (dryRun)
			console.info(`[DRY_RUN] [setLambdaPermissions] restApi: ${restApiName} removeOldPermissions ${removeOldPermissions}`);
		else
			console.info(`[setLambdaPermissions] restApi: ${restApiName} removeOldPermissions ${removeOldPermissions}`);

		console.info('trying to find existing rest api...');
		const apiGateway = new AWS.APIGateway();
		const restApis = await apiGateway.getRestApis({limit: 500}).promise();
		let restApiID: string | undefined;

		for (const restApi of (restApis.items || []))
		{
			if (restApi.name === restApiName && !!restApi.id)
			{
				restApiID = restApi.id;
				break;
			}
		}
		if (!restApiID)
			throw new Error(`[setLambdaPermissions] RestApi not found: ${restApiName}`)

		const resources = await apiGateway.getResources({restApiId: restApiID, limit: 500}).promise();
		for (const resource of (resources?.items || []))
		{
			console.info(`checking path: ${resource.path}. ${JSON.stringify(resource)}`);

			if (!resource.resourceMethods)
				continue;

			for (const method of Object.keys(resource.resourceMethods))
			{
				console.info(`checking method: ${method}`);
				if (method === 'OPTIONS' || !resource.id || !restApiID)
					continue;

				const params: AWS.APIGateway.GetIntegrationRequest = {resourceId: resource.id, httpMethod: method, restApiId: restApiID};
				const integrationResponse = await apiGateway.getIntegration(params).promise();
				console.info(`integration: ${JSON.stringify(integrationResponse)}`)
				const uri = integrationResponse.uri;
				if (!uri)
					continue;

				const components = uri.split('/');
				const functionARN = components[components.length - 2];
				const sourceARN = `arn:aws:execute-api:us-east-1:${this.accountID}:${restApiID}/*/${method}${resource.path}`;

				if (removeOldPermissions)
					await AWSUtils.removeLambdaPermission(dryRun, functionARN);

				const sid = `api-gateway-${restApiID}-${startingSid}`;
				await AWSUtils.addLambdaPermission(dryRun, functionARN, sid, sourceARN);
				startingSid += 1;
			}
		}
		console.info('[setLambdaPermissions] end ------------------------------\n');
	}

	private static addLambdaPermission = async (dryRun: boolean, functionARN: string, sid: string, sourceARN: string) =>
	{
		console.info(`[addLambdaPermission] functionARN: ${functionARN} sourceARN: ${sourceARN}`);
		const lambda = new AWS.Lambda();

		try
		{
			console.info(`adding permission to: ${functionARN} -> ${sid}`);
			if (!dryRun)
			{
				await lambda.addPermission(
					{
						FunctionName: functionARN,
						StatementId: sid,
						Action: 'lambda:InvokeFunction',
						Principal: 'apigateway.amazonaws.com',
						SourceArn: sourceARN
					}).promise();
			}
			console.info(`[addLambdaPermission] permission added: ${functionARN} -> ${sid}`);
		}
		catch (e)
		{
			const message = `[addLambdaPermission] can't add permission to: ${functionARN} -> ${sid}. ${JSON.stringify(e)}`;
			console.info(message);
			throw new Error(message);
		}
	}

	private static removeLambdaPermission = async (dryRun: boolean, functionARN: string) =>
	{
		console.info(`[removeLambdaPermission] functionARN: ${functionARN}`);
		const lambda = new AWS.Lambda();
		let policyResponse: GetPolicyResponse;
		try
		{
			policyResponse = await lambda.getPolicy({FunctionName: functionARN}).promise();
		}
		catch (e)
		{
			return console.info(`[removeLambdaPermission] nothing to do: ${functionARN}`);
		}

		const policyObject: { Statement: { Sid: string | undefined, Resource: string | undefined }[] } = JSON.parse(policyResponse.Policy || '');
		for (const item of policyObject.Statement)
		{
			const sid = item.Sid;
			const resource = item.Resource;
			if (!sid || !resource)
				continue;

			console.info(`removing: sid:${sid} function: ${resource}`);
			if (!dryRun)
				await lambda.removePermission({StatementId: sid, FunctionName: resource}).promise();

			console.info(`[removeLambdaPermission] permissions removed: ${functionARN}`);
			return;
		}
		console.info(`[removeLambdaPermission] nothing to do: ${functionARN}`);
	}
}
