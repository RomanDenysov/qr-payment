import z from "zod";

export function createFeatureRequestSchema(messages: {
  min: string;
  max: string;
  email: string;
}) {
  return z.object({
    message: z.string().min(10, messages.min).max(500, messages.max),
    // Optional: left empty unless the user wants the developer to reply.
    email: z.union([z.literal(""), z.email(messages.email).max(254)]),
  });
}

export type FeatureRequestData = z.infer<
  ReturnType<typeof createFeatureRequestSchema>
>;
