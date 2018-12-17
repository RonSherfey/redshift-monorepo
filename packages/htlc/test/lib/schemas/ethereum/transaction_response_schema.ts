import { config } from '../../helpers';

export const transactionResponseSchema = {
  id: '/transactionResponseSchema',
  type: 'object',
  properties: {
    transactionHash: {
      type: 'string',
    },
    transactionIndex: {
      type: 'integer',
    },
    blockHash: {
      type: 'string',
    },
    blockNumber: {
      type: 'integer',
    },
    from: {
      type: 'string',
    },
    to: {
      type: 'string',
    },
    gasUsed: {
      type: 'integer',
    },
    cumulativeGasUsed: {
      type: 'integer',
    },
    contractAddress: {
      type: ['null', 'string'],
    },
    logs: {
      type: 'array',
      items: [
        {
          type: 'object',
          properties: {
            logIndex: {
              type: 'integer',
            },
            transactionIndex: {
              type: 'integer',
            },
            transactionHash: {
              type: 'string',
            },
            blockHash: {
              type: 'string',
            },
            blockNumber: {
              type: 'integer',
            },
            address: {
              type: 'string',
            },
            data: {
              type: 'string',
            },
            topics: {
              type: 'array',
              items: [
                {
                  type: 'string',
                },
              ],
            },
            type: {
              type: 'string',
            },
            id: {
              type: 'string',
            },
          },
          required: [
            'logIndex',
            'transactionIndex',
            'transactionHash',
            'blockHash',
            'blockNumber',
            'address',
            'data',
            'topics',
            'type',
            'id',
          ],
        },
      ],
    },
    status: {
      type: 'boolean',
    },
    logsBloom: {
      type: 'string',
    },
    v: {
      type: 'string',
    },
    r: {
      type: 'string',
    },
    s: {
      type: 'string',
    },
  },
  required: [
    'transactionHash',
    'transactionIndex',
    'blockHash',
    'blockNumber',
    'from',
    'to',
    'gasUsed',
    'cumulativeGasUsed',
    'contractAddress',
    'logs',
    'status',
    'logsBloom',
    'v',
    'r',
    's',
  ],
};
