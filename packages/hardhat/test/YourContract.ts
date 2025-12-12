import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract", function () {
  let voting: YourContract;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let owner: any;
  let user1: any;
  let user2: any;

  before(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const factory = await ethers.getContractFactory("YourContract");
    voting = (await factory.deploy()) as YourContract;
    await voting.waitForDeployment();
  });

  describe("Voting process", function () {
    it("create a new voting", async () => {
      await voting.createVoting("Test Voting");

      const count = await voting.getVotingCount();
      expect(count).to.equal(1);

      const votingStruct = await voting.votings(0);
      expect(votingStruct.title).to.equal("Test Voting");
    });

    it("add candidates", async () => {
      await voting.addCandidate(0, "Alice");
      await voting.addCandidate(0, "Bob");

      const candidates = await voting.getCandidates(0);
      expect(candidates.length).to.equal(2);
      expect(candidates[0].name).to.equal("Alice");
      expect(candidates[1].name).to.equal("Bob");
    });

    it("open voting", async () => {
      await voting.openVoting(0);
      const votingStruct = await voting.votings(0);
      expect(votingStruct.isOpen).to.equal(true);
    });

    it("allow users to vote", async () => {
      await voting.connect(user1).vote(0, 0);
      await voting.connect(user2).vote(0, 1);

      const candidates = await voting.getCandidates(0);
      expect(candidates[0].votes).to.equal(1);
      expect(candidates[1].votes).to.equal(1);
    });

    it("prevent double voting", async () => {
      await expect(voting.connect(user1).vote(0, 0)).to.be.revertedWith("Already voted");
    });

    it("close the voting", async () => {
      await voting.closeVoting(0);
      const votingStruct = await voting.votings(0);
      expect(votingStruct.isOpen).to.equal(false);
    });

    it("return the winner", async () => {
      const [winnerName, votes] = await voting.getWinner(0);

      expect(winnerName).to.equal("Alice");
      expect(votes).to.equal(1);
    });
  });
});
