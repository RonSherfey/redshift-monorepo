import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiJsonSchema from 'chai-json-schema';

chai.use(chaiAsPromised);
chai.use(chaiJsonSchema);

export const { expect } = chai;
