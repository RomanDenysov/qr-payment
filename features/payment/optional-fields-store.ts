import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PaymentFormat } from "./format";
import type { OptionalFieldKey } from "./optional-fields";

/** Which optional fields the user has opted into, per format. Persisted so the
 * choice sticks across sessions. */
type EnabledByFormat = Partial<Record<PaymentFormat, OptionalFieldKey[]>>;

interface OptionalFieldsStore {
  enabled: EnabledByFormat;
  actions: {
    enable: (format: PaymentFormat, key: OptionalFieldKey) => void;
    disable: (format: PaymentFormat, key: OptionalFieldKey) => void;
  };
}

const STORAGE_KEY = "qrPayments.optionalFields.v1";
const EMPTY: OptionalFieldKey[] = [];

const optionalFieldsStore = create<OptionalFieldsStore>()(
  persist(
    (set) => ({
      enabled: {},
      actions: {
        enable: (format, key) =>
          set((state) => {
            const current = state.enabled[format] ?? EMPTY;
            if (current.includes(key)) {
              return state;
            }
            return {
              enabled: { ...state.enabled, [format]: [...current, key] },
            };
          }),
        disable: (format, key) =>
          set((state) => ({
            enabled: {
              ...state.enabled,
              [format]: (state.enabled[format] ?? EMPTY).filter(
                (k) => k !== key
              ),
            },
          })),
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ enabled: state.enabled }),
    }
  )
);

export const useEnabledOptionalFields = (format: PaymentFormat) =>
  optionalFieldsStore((state) => state.enabled[format] ?? EMPTY);
export const useOptionalFieldsActions = () =>
  optionalFieldsStore((state) => state.actions);
