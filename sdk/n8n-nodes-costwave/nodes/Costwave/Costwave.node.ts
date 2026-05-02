import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';

export class Costwave implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Costwave',
    name: 'costwave',
    icon: 'file:costwave.svg',
    group: ['transform'],
    version: 1,
    description: 'Track AI costs in Costwave',
    defaults: {
      name: 'Costwave Track',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'costwaveApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Provider',
        name: 'provider',
        type: 'options',
        options: [
          { name: 'Anthropic', value: 'anthropic' },
          { name: 'OpenAI', value: 'openai' },
          { name: 'Groq', value: 'groq' },
          { name: 'Mistral', value: 'mistral' },
          { name: 'Google', value: 'google' },
        ],
        default: 'anthropic',
        required: true,
      },
      {
        displayName: 'Model',
        name: 'model',
        type: 'string',
        default: 'claude-sonnet-4-5-20250929',
        required: true,
      },
      {
        displayName: 'Input Tokens',
        name: 'inputTokens',
        type: 'number',
        default: 0,
        required: true,
      },
      {
        displayName: 'Output Tokens',
        name: 'outputTokens',
        type: 'number',
        default: 0,
        required: true,
      },
      {
        displayName: 'Cached Tokens',
        name: 'cachedTokens',
        type: 'number',
        default: 0,
      },
      {
        displayName: 'Latency (ms)',
        name: 'latencyMs',
        type: 'number',
        default: 0,
      },
      {
        displayName: 'Workflow Name',
        name: 'workflowName',
        type: 'string',
        default: '={{$workflow.name}}',
        description: 'Defaults to n8n workflow name',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const credentials = await this.getCredentials('costwaveApi');
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      const provider = this.getNodeParameter('provider', i) as string;
      const model = this.getNodeParameter('model', i) as string;
      const inputTokens = this.getNodeParameter('inputTokens', i) as number;
      const outputTokens = this.getNodeParameter('outputTokens', i) as number;
      const cachedTokens = this.getNodeParameter('cachedTokens', i, 0) as number;
      const latencyMs = this.getNodeParameter('latencyMs', i, 0) as number;
      const workflowName = this.getNodeParameter('workflowName', i) as string;

      const payload = {
        type: 'n8n_llm_call',
        provider,
        model,
        inputTokens,
        outputTokens,
        cachedTokens,
        latencyMs,
        workflowName,
        status: 'success',
      };

      const response = await this.helpers.httpRequest({
        method: 'POST',
        url: `${credentials.baseUrl}/api/v1/events/ingest`,
        headers: {
          Authorization: `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: payload,
      });

      returnData.push({ json: response });
    }

    return [returnData];
  }
}
