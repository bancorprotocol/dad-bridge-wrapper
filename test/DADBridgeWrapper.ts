import Contracts from '../components/Contracts';
import { TestERC20Token } from '../typechain';
import { DADBridgeWrapper } from '../typechain';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { utils, BigNumber } from 'ethers';
import { ethers } from 'hardhat';

const ROLE_ADMIN = utils.id('ROLE_ADMIN');
const TOTAL_SUPPLY = BigNumber.from(1_000_000_000);
const MINT_AMOUNT = BigNumber.from(1_000_000);

describe('DADBridgeWrapper', () => {
    let deployer: SignerWithAddress;
    let admin: SignerWithAddress;
    let user: SignerWithAddress;

    let token: TestERC20Token;
    let dadBridgeWrapper: DADBridgeWrapper;

    const assertState = async (contractBalance: BigNumber, userBalance: BigNumber) => {
        expect(await dadBridgeWrapper.totalSupply()).to.equal(userBalance);
        expect(await token.balanceOf(user.address)).to.equal(userBalance);
        expect(await token.balanceOf(dadBridgeWrapper.address)).to.equal(contractBalance);
    };

    before(async () => {
        [deployer, admin, user] = await ethers.getSigners();
    });

    beforeEach(async () => {
        token = await Contracts.TestERC20Token.deploy('BNT', 'BNT', TOTAL_SUPPLY);
        dadBridgeWrapper = await Contracts.DADBridgeWrapper.deploy(token.address);
        await dadBridgeWrapper.grantRole(ROLE_ADMIN, admin.address);
        await dadBridgeWrapper.revokeRole(ROLE_ADMIN, deployer.address);
        await token.transfer(dadBridgeWrapper.address, TOTAL_SUPPLY);
    });

    it('admin should be able to mint', async () => {
        await assertState(TOTAL_SUPPLY, BigNumber.from(0));
        await dadBridgeWrapper.connect(admin).mint(user.address, MINT_AMOUNT);
        await assertState(TOTAL_SUPPLY.sub(MINT_AMOUNT), MINT_AMOUNT);
    });

    it('non-admin should not be able to mint', async () => {
        await assertState(TOTAL_SUPPLY, BigNumber.from(0));
        await expect(dadBridgeWrapper.connect(deployer).mint(user.address, MINT_AMOUNT)).to.be.revertedWith(
            `AccessControl: account ${deployer.address.toLowerCase()} is missing role ${ROLE_ADMIN}`
        );
        await assertState(TOTAL_SUPPLY, BigNumber.from(0));
    });

    it('admin should not be able to burn', async () => {
        await assertState(TOTAL_SUPPLY, BigNumber.from(0));
        await expect(dadBridgeWrapper.connect(admin).burn(user.address, MINT_AMOUNT)).to.be.revertedWith(
            'ERR_UNSUPPORTED_OPERATION'
        );
        await assertState(TOTAL_SUPPLY, BigNumber.from(0));
    });

    it('non-admin should not be able to burn', async () => {
        await assertState(TOTAL_SUPPLY, BigNumber.from(0));
        await expect(dadBridgeWrapper.connect(deployer).burn(user.address, MINT_AMOUNT)).to.be.revertedWith(
            'ERR_UNSUPPORTED_OPERATION'
        );
        await assertState(TOTAL_SUPPLY, BigNumber.from(0));
    });
});
