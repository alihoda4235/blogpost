import z from "zod";

export const singupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
})

export type SignupSchema = z.infer<typeof singupSchema>