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
      type: 'string',
    },
    cumulativeGasUsed: {
      type: 'string',
    },
    contractAddress: {
      type: ['null', 'string'],
    },
    logs: {
      type: 'array',
      minItems: 1,
    },
    status: {
      type: 'string',
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
