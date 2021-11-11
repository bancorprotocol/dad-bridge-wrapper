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

    let bntToken: TestERC20Token;
    let ethBntToken: TestERC20Token;
    let dadBridgeWrapper: DADBridgeWrapper;

    const assertBalances = async (totalSupply: BigNumber, contractBalance: BigNumber, userBalance: BigNumber) => {
        expect(await dadBridgeWrapper.totalSupply()).to.equal(totalSupply);
        expect(await bntToken.balanceOf(dadBridgeWrapper.address)).to.equal(contractBalance);
        expect(await ethBntToken.balanceOf(dadBridgeWrapper.address)).to.equal(contractBalance);
        expect(await bntToken.balanceOf(user.address)).to.equal(userBalance);
        expect(await ethBntToken.balanceOf(user.address)).to.equal(userBalance);
    };

    before(async () => {
        [deployer, admin, user] = await ethers.getSigners();
    });

    beforeEach(async () => {
        bntToken = await Contracts.TestERC20Token.deploy('BNT', 'BNT', TOTAL_SUPPLY);
        ethBntToken = await Contracts.TestERC20Token.deploy('ETH/BNT', 'ETH/BNT', TOTAL_SUPPLY);
        dadBridgeWrapper = await Contracts.DADBridgeWrapper.deploy(bntToken.address, ethBntToken.address);
        await dadBridgeWrapper.grantRole(ROLE_ADMIN, admin.address);
        await dadBridgeWrapper.revokeRole(ROLE_ADMIN, deployer.address);
        await bntToken.transfer(dadBridgeWrapper.address, TOTAL_SUPPLY);
        await ethBntToken.transfer(dadBridgeWrapper.address, TOTAL_SUPPLY);
    });

    it('admin should be able to mint', async () => {
        await assertBalances(BigNumber.from(0), TOTAL_SUPPLY, BigNumber.from(0));
        await dadBridgeWrapper.connect(admin).mint(user.address, MINT_AMOUNT);
        await assertBalances(MINT_AMOUNT, TOTAL_SUPPLY.sub(MINT_AMOUNT), MINT_AMOUNT);
    });

    it('non-admin should not be able to mint', async () => {
        await assertBalances(BigNumber.from(0), TOTAL_SUPPLY, BigNumber.from(0));
        await expect(dadBridgeWrapper.connect(deployer).mint(user.address, MINT_AMOUNT)).to.be.revertedWith(
            `AccessControl: account ${deployer.address.toLowerCase()} is missing role ${ROLE_ADMIN}`
        );
        await assertBalances(BigNumber.from(0), TOTAL_SUPPLY, BigNumber.from(0));
    });

    it('admin should not be able to burn', async () => {
        await assertBalances(BigNumber.from(0), TOTAL_SUPPLY, BigNumber.from(0));
        await expect(dadBridgeWrapper.connect(admin).burn(user.address, MINT_AMOUNT)).to.be.revertedWith(
            'ERR_UNSUPPORTED_OPERATION'
        );
        await assertBalances(BigNumber.from(0), TOTAL_SUPPLY, BigNumber.from(0));
    });

    it('non-admin should not be able to burn', async () => {
        await assertBalances(BigNumber.from(0), TOTAL_SUPPLY, BigNumber.from(0));
        await expect(dadBridgeWrapper.connect(deployer).burn(user.address, MINT_AMOUNT)).to.be.revertedWith(
            'ERR_UNSUPPORTED_OPERATION'
        );
        await assertBalances(BigNumber.from(0), TOTAL_SUPPLY, BigNumber.from(0));
    });
});
