import z from "zod";

export function createFeatureRequestSchema(messages: {
  min: string;
  max: string;
}) {
  return z.object({
    message: z.string().min(10, messages.min).max(500, messages.max),
  });
}

export type FeatureRequestData = z.infer<
  ReturnType<typeof createFeatureRequestSchema>
>;
