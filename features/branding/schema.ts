import z from "zod";

export const brandPresetSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Názov je povinný").max(30, "Max 30 znakov"),
  colors: z.object({
    foreground: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Neplatná farba"),
    background: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Neplatná farba"),
  }),
  logo: z
    .object({
      data: z.string(),
      size: z.number().min(10).max(20),
    })
    .optional(),
  cornerStyle: z.enum(["square", "rounded", "dots"]),
  frame: z
    .object({
      enabled: z.boolean(),
      text: z.string().max(40, "Max 40 znakov"),
      position: z.enum(["top", "bottom"]),
    })
    .optional(),
  createdAt: z.number(),
});

export type BrandPreset = z.infer<typeof brandPresetSchema>;

export const brandPresetFormSchema = brandPresetSchema.omit({
  id: true,
  createdAt: true,
});

export type BrandPresetFormData = z.infer<typeof brandPresetFormSchema>;
