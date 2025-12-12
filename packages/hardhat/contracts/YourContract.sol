//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract YourContract {
    struct Candidate {
        string name;
        uint256 votes;
    }

    struct Voting {
        string title;
        bool isOpen;
        Candidate[] candidates;
        mapping(address => bool) voted;
    }

    Voting[] public votings;

    function createVoting(string calldata title) external {
        votings.push();
        Voting storage v = votings[votings.length - 1];
        v.title = title;
        v.isOpen = false;
    }

    function addCandidate(uint256 votingId, string calldata candidateName) external {
        Voting storage v = votings[votingId];
        require(!v.isOpen, "Voting already started");

        v.candidates.push(Candidate(candidateName, 0));
    }

    function openVoting(uint256 votingId) external {
        Voting storage v = votings[votingId];
        require(!v.isOpen, "Voting already open");
        require(v.candidates.length > 0, "No candidates");

        v.isOpen = true;
    }

    function closeVoting(uint256 votingId) external {
        Voting storage v = votings[votingId];
        require(v.isOpen, "Voting already closed");

        v.isOpen = false;
    }

    function vote(uint256 votingId, uint256 candidateIndex) external {
        Voting storage v = votings[votingId];

        require(v.isOpen, "Voting is closed");
        require(!v.voted[msg.sender], "Already voted");
        require(candidateIndex < v.candidates.length, "Invalid candidate");

        v.voted[msg.sender] = true;
        v.candidates[candidateIndex].votes++;
    }

    function getCandidates(uint256 votingId) external view returns (Candidate[] memory) {
        return votings[votingId].candidates;
    }

    function getWinner(uint256 votingId)
        external
        view
        returns (string memory winnerName, uint256 winnerVotes)
    {
        Voting storage v = votings[votingId];
        require(!v.isOpen, "Voting must be closed");

        uint256 winnerIndex = 0;
        uint256 maxVotes = 0;

        for (uint256 i = 0; i < v.candidates.length; i++) {
            if (v.candidates[i].votes > maxVotes) {
                maxVotes = v.candidates[i].votes;
                winnerIndex = i;
            }
        }

        return (v.candidates[winnerIndex].name, v.candidates[winnerIndex].votes);
    }

    function getVotingCount() external view returns (uint256) {
        return votings.length;
    }
}
