const { expect } = require("chai");

describe("Lottery", function () {
  let Lottery, lottery, manager, addr1, addr2, addr3, addr4;

  beforeEach(async () => {
    Lottery = await ethers.getContractFactory('Lottery')
    lottery = await Lottery.deploy();
    [manager, addr1, addr2, addr3, addr4] = await ethers.getSigners();
  });


  describe('Deployment', () => {
    it("Should set manager to deployers address", async () => {
      expect(await lottery.manager()).to.equal(manager.address);
    });
  });

  describe("Contract methods", ()=> {

    it("Should allowed to entry players only if they pay exactly 0.1 ether", async() =>{
      await expect(addr1.sendTransaction({
          to: lottery.address,
          value: ethers.utils.parseEther("0.05")
      })).to.be.revertedWith('require to sent exactly 0.001 ether');

      await expect(addr1.sendTransaction({
          to: lottery.address,
          value: ethers.utils.parseEther("1.00")
      })).to.be.revertedWith('require to sent exactly 0.001 ether');

      await addr1.sendTransaction({
          to: lottery.address,
          value: ethers.utils.parseEther("0.001")
      });
      expect(await lottery.players(0)).to.be.equal(addr1.address);
    });

    it("Only manager should be able to get balance of contract", async() =>{
      await expect(
        lottery.connect(addr1).getBalance()
      ).to.be.revertedWith(
        'Only manager can retrieve balance of contract'
      );

      await addr1.sendTransaction({
          to: lottery.address,
          value: ethers.utils.parseEther("0.001")
      });

      expect(
        await lottery.getBalance()
      ).to.be.equal(
        ethers.utils.parseEther("0.001")
      );

    });

    describe("Pick random winner", async() =>{
      it("Only manager should be able to call pick winner method", async() =>{
        await expect(
          lottery.connect(addr1).pickWinner()
        ).to.be.revertedWith(
          'Only manager of the lottery can pick the winner'
        );
      });

      it("Minimum players should be 3", async() =>{
        await expect(
          lottery.pickWinner()
        ).to.be.revertedWith(
          'Minimum 3 players are required to pick winner'
        );
      });

      it("Transfer lottery funds to the winner address and reset players index", async() =>{
        let players = [addr1, addr2, addr3];
        await addr1.sendTransaction({
            to: lottery.address,
            value: ethers.utils.parseEther("0.001")
        });
        await addr2.sendTransaction({
            to: lottery.address,
            value: ethers.utils.parseEther("0.001")
        });
        await addr3.sendTransaction({
            to: lottery.address,
            value: ethers.utils.parseEther("0.001")
        });
        await expect(
          lottery.pickWinner()
        ).to.emit(
          lottery, 'pickedWinner'
        );
      });

    });

  });
});
