import { z } from "zod";

// Mailbox schema
export const mailboxSchema = z.object({
  id: z.string(),
  address: z.string(),
  domain: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
  sessionToken: z.string(),
  // Guerrilla Mail session token for API calls
  sidToken: z.string().optional(),
  // mail.tm fallback fields
  mailToken: z.string().optional(),
  mailPassword: z.string().optional(),
  accountId: z.string().optional(),
  // Which provider is backing this mailbox
  provider: z.enum(["guerrilla", "mailtm", "maildrop"]).optional(),
});

export const insertMailboxSchema = mailboxSchema.omit({ id: true });

export type Mailbox = z.infer<typeof mailboxSchema>;
export type InsertMailbox = z.infer<typeof insertMailboxSchema>;

// Message schema
export const messageSchema = z.object({
  id: z.string(),
  mailboxId: z.string(),
  from: z.string(),
  fromName: z.string(),
  subject: z.string(),
  textBody: z.string(),
  htmlBody: z.string(),
  receivedAt: z.string(),
  isRead: z.boolean(),
});

export const insertMessageSchema = messageSchema.omit({ id: true });

export type Message = z.infer<typeof messageSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
