import { exec } from 'child_process';
import { RequestHandler, Router } from 'express';
import { KubeConfig, AppsV1Api } from '@kubernetes/client-node';
import EnvConfig from './lib/config/EnvConfig.js';
import { z } from 'zod';

const webhooks = Router();

const githubWorkflow: RequestHandler = async (req, res) => {
  if (req.query.t !== EnvConfig.DOCKERHUB_WEBHOOK_TOKEN) {
    console.error('Invalid dockerhub webhook token');
    return res.status(401).send();
  }

  const dockerHubPayloadSchema = z.object({
    callback_url: z.string().url(),
    push_data: z.object({
      pusher: z.string(),
      pushed_at: z.number(),
      tag: z.string(),
      images: z.array(z.any()),
      media_type: z.string().optional(),
    }),
    repository: z.object({
      status: z.string(),
      namespace: z.string(),
      name: z.string(),
      repo_name: z.string(),
      repo_url: z.string().url(),
      description: z.string(),
      full_description: z.string().nullable(),
      star_count: z.number(),
      is_private: z.boolean(),
      is_trusted: z.boolean(),
      is_official: z.boolean(),
      owner: z.string(),
      date_created: z.number(),
    }),
  });


  console.log('Received dockerhub webhook data:\n', req.body);
  const validation = dockerHubPayloadSchema.safeParse(req.body);
  if (!validation.success) {
    console.error(`Failed to validate dockerhub webhook data: ${JSON.stringify(validation.error.issues, null, 2)}`);
    return res.status(400).send(validation.error.issues);
  }

  const tag = validation.data.push_data.tag;
  const mediaType = validation.data.push_data.media_type;
  if (tag.endsWith('.sig') || mediaType === 'application/vnd.oci.image.config.v1+json') {
    console.log(`Ignoring tag: ${tag}`);
    return res.status(200).send('Ignored tag');
  }

  const kc = new KubeConfig();
  kc.loadFromDefault();
  const k8sAppsApi = kc.makeApiClient(AppsV1Api);

  try {
    const deployment = await k8sAppsApi.readNamespacedDeployment('lexo-api-deployment', 'lexo-api');
    if (!deployment.body.spec?.template.spec) {
      console.error('Deployment not found');
      return res.status(404).send('Deployment not found');
    }
    const container = deployment.body.spec.template.spec.containers.find(c => c.name === 'lexo-api');
    if (!container) {
      console.error('Container not found');
      return res.status(404).send('Container not found');
    }

    container.image = `${validation.data.repository.repo_name}:${validation.data.push_data.tag}`;
    await k8sAppsApi.replaceNamespacedDeployment('lexo-api-deployment', 'lexo-api', deployment.body);
    console.log('Deployment updated successfully');
    return res.status(200).send('Deployment updated successfully');
  } catch (error) {
    console.error(`Failed to update the deployment: ${JSON.stringify(error, null, 2)}`);
    return res.status(500).send(`Error updating deployment: ${error}`);
  }
};

webhooks.post('/github-workflow', githubWorkflow);

export default webhooks;
