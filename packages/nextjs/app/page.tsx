'use client';

import { useState } from 'react';
import { useScaffoldReadContract, useScaffoldWriteContract } from '~~/hooks/scaffold-eth';

interface Candidate {
  name: string;
  votes: bigint;
}

export default function VotingPage() {
  const [newVotingTitle, setNewVotingTitle] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [selectedVoting, setSelectedVoting] = useState<number | null>(null);

  const { data: votingsCount } = useScaffoldReadContract({
    contractName: 'YourContract',
    functionName: 'getVotingCount',
  });

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({ contractName: "YourContract" });

  const { data: candidates } = useScaffoldReadContract({
    contractName: 'YourContract',
    functionName: 'getCandidates',
    args: selectedVoting !== null ? [selectedVoting] : undefined,
  });

  const votingLength = Number(votingsCount ?? 0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Voting DApp (Scaffold-ETH Style)</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="New voting title"
          value={newVotingTitle}
          onChange={(e) => setNewVotingTitle(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          className="btn btn-primary"
          onClick={async () => {
            try {
              await writeYourContractAsync({
                functionName: 'createVoting',
                args: [newVotingTitle],
              });
              setNewVotingTitle('');
            } catch (e) {
              console.error('Error creating voting:', e);
            }
          }}
        >
          Create Voting
        </button>
      </div>

      <div>
        <h2 className="text-xl mb-2">Votings ({votingLength})</h2>
        {Array.from({ length: votingLength }).map((_, i) => (
          <div key={i} className="border p-4 mb-4 rounded">
            <h3>Voting #{i}</h3>

            <button
              className="btn btn-secondary mb-2"
              onClick={() => setSelectedVoting(i)}
            >
              Select Voting
            </button>

            {selectedVoting === i && (
              <>
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Candidate name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="border p-1 mr-2"
                  />
                  <button
                    className="btn btn-warning"
                    onClick={async () => {
                      try {
                        await writeYourContractAsync({
                          functionName: 'addCandidate',
                          args: [i, candidateName],
                        });
                        setCandidateName('');
                      } catch (e) {
                        console.error('Error adding candidate:', e);
                      }
                    }}
                  >
                    Add Candidate
                  </button>
                </div>

                {candidates?.map((c: Candidate, idx: number) => (
                  <div key={idx} className="flex items-center mb-1">
                    <span className="mr-2">
                      {c.name} ({c.votes.toString()} votes)
                    </span>
                    <button
                      className="btn btn-success"
                      onClick={async () => {
                        try {
                          await writeYourContractAsync({
                            functionName: 'vote',
                            args: [i, idx],
                          });
                        } catch (e) {
                          console.error('Error voting:', e);
                        }
                      }}
                    >
                      Vote
                    </button>
                  </div>
                ))}

                <div className="mt-2 flex gap-2">
                  <button
                    className="btn btn-info"
                    onClick={async () => {
                      try {
                        await writeYourContractAsync({
                          functionName: 'openVoting',
                          args: [i],
                        });
                      } catch (e) {
                        console.error('Error opening voting:', e);
                      }
                    }}
                  >
                    Open Voting
                  </button>

                  <button
                    className="btn btn-error"
                    onClick={async () => {
                      try {
                        await writeYourContractAsync({
                          functionName: 'closeVoting',
                          args: [i],
                        });
                      } catch (e) {
                        console.error('Error closing voting:', e);
                      }
                    }}
                  >
                    Close Voting
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={async () => {
                      try {
                        const [winnerName, winnerVotes] = await writeYourContractAsync({
                          functionName: 'getWinner',
                          args: [i],
                        });
                        alert(`Winner: ${winnerName} with ${winnerVotes.toString()} votes`);
                      } catch (e) {
                        console.error('Error getting winner:', e);
                      }
                    }}
                  >
                    Get Winner
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
