import { create } from 'zustand';
import type { Contestant, Category, LeaderboardEntry, VoteStats } from '@/types';

interface VotingStore {
  contestants: Contestant[];
  categories: Category[];
  leaderboard: LeaderboardEntry[];
  selectedContestant: Contestant | null;
  voteStats: VoteStats | null;
  isLoadingContestants: boolean;
  hasVotedToday: Record<string, boolean>;
  setContestants: (contestants: Contestant[]) => void;
  setCategories: (categories: Category[]) => void;
  setLeaderboard: (entries: LeaderboardEntry[]) => void;
  setSelectedContestant: (contestant: Contestant | null) => void;
  setVoteStats: (stats: VoteStats) => void;
  setLoading: (loading: boolean) => void;
  markVotedToday: (contestantId: string) => void;
  incrementVote: (contestantId: string) => void;
}

export const useVotingStore = create<VotingStore>()((set) => ({
  contestants: [],
  categories: [],
  leaderboard: [],
  selectedContestant: null,
  voteStats: null,
  isLoadingContestants: false,
  hasVotedToday: {},
  setContestants: (contestants) => set({ contestants }),
  setCategories: (categories) => set({ categories }),
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  setSelectedContestant: (selectedContestant) => set({ selectedContestant }),
  setVoteStats: (voteStats) => set({ voteStats }),
  setLoading: (isLoadingContestants) => set({ isLoadingContestants }),
  markVotedToday: (contestantId) =>
    set((state) => ({
      hasVotedToday: { ...state.hasVotedToday, [contestantId]: true },
    })),
  incrementVote: (contestantId) =>
    set((state) => ({
      contestants: state.contestants.map((c) =>
        c.id === contestantId ? { ...c, totalVotes: c.totalVotes + 1 } : c
      ),
      leaderboard: state.leaderboard.map((entry) =>
        entry.contestant.id === contestantId
          ? { ...entry, votes: entry.votes + 1 }
          : entry
      ),
      selectedContestant:
        state.selectedContestant?.id === contestantId
          ? { ...state.selectedContestant, totalVotes: state.selectedContestant.totalVotes + 1 }
          : state.selectedContestant,
    })),
}));
