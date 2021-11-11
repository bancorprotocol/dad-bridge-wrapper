/* eslint-disable camelcase */
import {
    DADBridgeWrapper__factory,
    TestERC20Token__factory
} from '../typechain';
import { deployOrAttach } from './ContractBuilder';

/* eslint-enable camelcase */
import { Signer } from 'ethers';

const getContracts = (signer?: Signer) => ({
    connect: (signer: Signer) => getContracts(signer),

    DADBridgeWrapper: deployOrAttach('DADBridgeWrapper', DADBridgeWrapper__factory, signer),
    TestERC20Token: deployOrAttach('TestERC20Token', TestERC20Token__factory, signer)
});

export type ContractsType = ReturnType<typeof getContracts>;

export default getContracts();
