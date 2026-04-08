import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FeedbackRequest {
  message: string;
  timestamp: string;
}

interface FeedbackState {
  requests: FeedbackRequest[];
}

interface FeedbackActions {
  addRequest: (message: string) => void;
}

const STORAGE_KEY = "qrFeedback.v1";

type FeedbackStore = FeedbackState & {
  actions: FeedbackActions;
};

const feedbackStore = create<FeedbackStore>()(
  persist(
    (set, get) => ({
      requests: [],
      actions: {
        addRequest: (message: string) => {
          set((state) => ({
            requests: [
              { message, timestamp: new Date().toISOString() },
              ...state.requests,
            ],
          }));
        },
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        requests: state.requests,
      }),
    }
  )
);

export const useFeedbackRequests = () =>
  feedbackStore((state) => state.requests);
export const useFeedbackActions = () => feedbackStore((state) => state.actions);
