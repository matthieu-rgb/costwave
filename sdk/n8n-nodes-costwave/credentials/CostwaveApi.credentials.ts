import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class CostwaveApi implements ICredentialType {
  name = 'costwaveApi';
  displayName = 'Costwave API';
  documentationUrl = 'https://docs.costwave.app';

  properties: INodeProperties[] = [
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: { password: true },
      default: '',
      required: true,
      description: 'Get from Costwave dashboard (Settings > API Keys)',
    },
    {
      displayName: 'Base URL',
      name: 'baseUrl',
      type: 'string',
      default: 'https://costwave.app',
      description: 'Change for self-hosted instances',
    },
  ];
}
