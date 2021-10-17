import fs from 'fs';
import {AWSUtils} from './scripts/AWSUtils';

const {series} = require('gulp');

export {};

const exec = require('child_process').exec;

const currentFunction = 'search';
const debugOn = true;

const stage = 'default';
const cloudFormationStackName = 'intellistyle-be';
const version = '1.0.0';
const apiName = 'intellistyle-be-1.0.0';

const serverless = {
   deploy: async (cmd: string): Promise<string> => {
      return new Promise<string>((resolve, reject) => {
         let buffer = '';
         const spawn = exec(`set SLS_DEBUG=* && sls ${cmd} --stage ${stage}`, (err: any) => {
            err ? reject(err) : resolve(buffer);
         });

         if (debugOn) {
            spawn.stdout.pipe(process.stdout);
            spawn.stderr.pipe(process.stderr);
         }
         spawn.stdout.on('data', (readData: any) => {
            buffer += readData;
         });
      });
   },
};

const utils = {
   generate: async (sourceFile: string, destFile: string, cloudFormation: string) => {
      const replacements = [{key: /@@cloudformation/g, value: cloudFormation}];

      let content = fs.readFileSync(sourceFile, {encoding: 'utf-8'});
      replacements.forEach((replacement) => (content = content.replace(replacement.key, replacement.value)));
      fs.writeFileSync(destFile, content);
   },
};

const openapi = {
   prepare: async () => {
      const sourceFile = `openapi/openapi-${version}-model-template.yaml`;
      const destFile = `openapi/openapi-${version}-model.yaml`;
      await utils.generate(sourceFile, destFile, `${cloudFormationStackName}-${stage}`);
   },
};

const api = {
   update_lambda_permissions: async () => {
      console.info('[api] update_lambda_permissions');
      AWSUtils.profile = 'personal';
      AWSUtils.accountID = '855046591317';
      await AWSUtils.updateLambdaPermissions(false, apiName, 10000, true);
   },
};

const deploy = {
   print: async () => {
      console.info('[website] print');
      await serverless.deploy(`print`);
   },

   package: async () => {
      console.info('[website] package');
      await serverless.deploy(`package --verbose`);
   },

   setup: async () => {
      console.info('[setup] update');
      await serverless.deploy(`deploy --verbose --force`);
   },

   delete: async () => {
      console.info('[setup] delete');
      await serverless.deploy(`remove --verbose --force`);
   },

   deploy_current: async () => {
      console.info('[lambda][stage] deploy_current');
      await serverless.deploy(`deploy function --function ${currentFunction} --force`);
   },
};

exports.print = deploy.print;
exports.package = series(openapi.prepare, deploy.package);
exports.deploy_fn = deploy.deploy_current;
exports.setup = series(openapi.prepare, deploy.setup, api.update_lambda_permissions);
exports.delete = deploy.delete;
