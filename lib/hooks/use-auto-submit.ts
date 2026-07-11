import { useEffect, useMemo, useState } from "react";
import type {
  FieldValues,
  Path,
  UseFormTrigger,
  UseFormWatch,
} from "react-hook-form";
import { debounce } from "../debounce";

interface AutoSubmitProps<T extends FieldValues> {
  trigger: UseFormTrigger<T>;
  watch: UseFormWatch<T>;
  excludeFields?: Path<T>[];
  onSubmit: () => void;
  onValidationFailed?: () => void;
  debounceTime?: number;
}

export function useAutoSubmit<T extends FieldValues>({
  trigger,
  watch,
  excludeFields,
  onSubmit,
  onValidationFailed,
  debounceTime = 500,
}: AutoSubmitProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedSubmit = useMemo(
    () =>
      debounce((submitFn: () => void) => {
        submitFn();
      }, debounceTime),
    [debounceTime]
  );

  useEffect(() => {
    const subscription = watch((_data, info) => {
      if (info?.type !== "change") {
        return;
      }
      if (info.name && excludeFields?.includes(info.name)) {
        return;
      }
      setIsSubmitting(true);
      trigger()
        .then((valid) => {
          if (valid) {
            debouncedSubmit(onSubmit);
          } else {
            onValidationFailed?.();
          }
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    });
    return () => {
      subscription.unsubscribe();
      debouncedSubmit.cancel();
    };
  }, [
    watch,
    trigger,
    excludeFields,
    onSubmit,
    onValidationFailed,
    debouncedSubmit,
  ]);

  return { isSubmitting };
}
