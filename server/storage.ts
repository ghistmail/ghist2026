import { type Mailbox, type InsertMailbox, type Message, type InsertMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createMailbox(mailbox: InsertMailbox): Promise<Mailbox>;
  getMailbox(id: string): Promise<Mailbox | undefined>;
  getMailboxByToken(token: string): Promise<Mailbox | undefined>;
  getMailboxByAddress(address: string): Promise<Mailbox | undefined>;
  deleteMailbox(id: string): Promise<void>;
  getExpiredMailboxes(): Promise<Mailbox[]>;
  updateMailToken(id: string, token: string): Promise<void>;
  updateSidToken(id: string, sidToken: string): Promise<void>;

  createMessage(message: InsertMessage): Promise<Message>;
  getMessages(mailboxId: string): Promise<Message[]>;
  getMessage(id: string): Promise<Message | undefined>;
  markRead(id: string): Promise<void>;
  deleteMessagesByMailbox(mailboxId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private mailboxes: Map<string, Mailbox>;
  private messages: Map<string, Message>;

  constructor() {
    this.mailboxes = new Map();
    this.messages = new Map();
  }

  async createMailbox(insert: InsertMailbox): Promise<Mailbox> {
    const id = randomUUID();
    const mailbox: Mailbox = { ...insert, id };
    this.mailboxes.set(id, mailbox);
    return mailbox;
  }

  async getMailbox(id: string): Promise<Mailbox | undefined> {
    return this.mailboxes.get(id);
  }

  async getMailboxByToken(token: string): Promise<Mailbox | undefined> {
    return Array.from(this.mailboxes.values()).find(
      (m) => m.sessionToken === token
    );
  }

  async getMailboxByAddress(address: string): Promise<Mailbox | undefined> {
    return Array.from(this.mailboxes.values()).find(
      (m) => m.address.toLowerCase() === address.toLowerCase()
    );
  }

  async deleteMailbox(id: string): Promise<void> {
    this.mailboxes.delete(id);
  }

  async getExpiredMailboxes(): Promise<Mailbox[]> {
    const now = new Date().toISOString();
    return Array.from(this.mailboxes.values()).filter(
      (m) => m.expiresAt <= now
    );
  }

  async updateMailToken(id: string, token: string): Promise<void> {
    const mailbox = this.mailboxes.get(id);
    if (mailbox) {
      this.mailboxes.set(id, { ...mailbox, mailToken: token });
    }
  }

  async updateSidToken(id: string, sidToken: string): Promise<void> {
    const mailbox = this.mailboxes.get(id);
    if (mailbox) {
      this.mailboxes.set(id, { ...mailbox, sidToken });
    }
  }

  async createMessage(insert: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { ...insert, id };
    this.messages.set(id, message);
    return message;
  }

  async getMessages(mailboxId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter((m) => m.mailboxId === mailboxId)
      .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async markRead(id: string): Promise<void> {
    const msg = this.messages.get(id);
    if (msg) {
      this.messages.set(id, { ...msg, isRead: true });
    }
  }

  async deleteMessagesByMailbox(mailboxId: string): Promise<void> {
    for (const [id, msg] of this.messages) {
      if (msg.mailboxId === mailboxId) {
        this.messages.delete(id);
      }
    }
  }
}

export const storage = new MemStorage();
