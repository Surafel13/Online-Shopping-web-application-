import type { Response } from "express";

interface Client {
  res: Response;
  userId: string;
  isAgent: boolean;
}

// In-memory hub (single Node process). For multiple instances, back this with Redis pub/sub.
const clients = new Set<Client>();

const send = (client: Client, event: string, data: unknown) => {
  try {
    client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  } catch {
    clients.delete(client);
  }
};

export const openStream = (res: Response, userId: string, isAgent: boolean) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.write("retry: 5000\n\n");
  const client: Client = { res, userId, isAgent };
  clients.add(client);
  send(client, "ready", { ok: true });
  const heartbeat = setInterval(() => {
    try {
      res.write(": ping\n\n");
    } catch {
      clearInterval(heartbeat);
      clients.delete(client);
    }
  }, 25_000);
  res.on("close", () => {
    clearInterval(heartbeat);
    clients.delete(client);
  });
};

export const emitToUsers = (userIds: string[], event: string, data: unknown) => {
  const ids = new Set(userIds);
  clients.forEach((c) => ids.has(c.userId) && send(c, event, data));
};

export const emitToAgents = (event: string, data: unknown) => {
  clients.forEach((c) => c.isAgent && send(c, event, data));
};
