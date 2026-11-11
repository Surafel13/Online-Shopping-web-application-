import apiClient, { requireApiList, requireApiValue } from "./api";
import type { ApiResponse } from "../types/api";
import type {
  Faq, Pagination, SupportMessage, SupportStats, SupportTicket, SupportUserRef,
  TicketCategory, TicketFilters, TicketPriority, TicketStatus,
} from "../types/support";

const UPLOAD = { timeout: 60000 };

function toForm(fields: Record<string, string | boolean | undefined>, files: File[]) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== "") form.append(key, String(value));
  });
  files.forEach((file) => form.append("attachments", file));
  return form;
}

const value = <T>(data: ApiResponse<T>, name: string) => requireApiValue(data.data, name);

export const supportService = {
  // ---- customer ----
  async createTicket(
    payload: { subject: string; category: TicketCategory; priority: TicketPriority; description: string; orderId?: string },
    files: File[],
  ) {
    const { data } = await apiClient.post<ApiResponse<SupportTicket>>(
      "/support/tickets", toForm(payload, files), UPLOAD,
    );
    return value(data, "ticket");
  },
  async listMine(status?: string) {
    const { data } = await apiClient.get<ApiResponse<SupportTicket[]>>("/support/tickets/me", { params: { status } });
    return requireApiList(data.data, "tickets");
  },
  async getMine(id: string) {
    const { data } = await apiClient.get<ApiResponse<SupportTicket>>(`/support/tickets/${id}`);
    return value(data, "ticket");
  },
  async getMessages(id: string) {
    const { data } = await apiClient.get<ApiResponse<SupportMessage[]>>(`/support/tickets/${id}/messages`);
    return requireApiList(data.data, "messages");
  },
  async reply(id: string, body: string, files: File[]) {
    const { data } = await apiClient.post<ApiResponse<SupportMessage>>(
      `/support/tickets/${id}/messages`, toForm({ body }, files), UPLOAD,
    );
    return value(data, "message");
  },
  async close(id: string) {
    const { data } = await apiClient.patch<ApiResponse<SupportTicket>>(`/support/tickets/${id}/close`);
    return value(data, "ticket");
  },
  async reopen(id: string) {
    const { data } = await apiClient.patch<ApiResponse<SupportTicket>>(`/support/tickets/${id}/reopen`);
    return value(data, "ticket");
  },
  async faqs() {
    const { data } = await apiClient.get<ApiResponse<Faq[]>>("/support/faqs");
    return requireApiList(data.data, "faqs");
  },

  // ---- admin ----
  async adminList(params: TicketFilters) {
    const { data } = await apiClient.get<ApiResponse<SupportTicket[]> & { pagination: Pagination }>(
      "/support/admin/tickets", { params },
    );
    return { tickets: requireApiList(data.data, "tickets"), pagination: data.pagination };
  },
  async adminStats() {
    const { data } = await apiClient.get<ApiResponse<SupportStats>>("/support/admin/stats");
    return value(data, "stats");
  },
  async adminAgents() {
    const { data } = await apiClient.get<ApiResponse<SupportUserRef[]>>("/support/admin/agents");
    return requireApiList(data.data, "agents");
  },
  async adminGet(id: string) {
    const { data } = await apiClient.get<ApiResponse<SupportTicket>>(`/support/admin/tickets/${id}`);
    return value(data, "ticket");
  },
  async adminMessages(id: string) {
    const { data } = await apiClient.get<ApiResponse<SupportMessage[]>>(`/support/admin/tickets/${id}/messages`);
    return requireApiList(data.data, "messages");
  },
  async adminReply(id: string, payload: { body: string; isInternal: boolean; status?: TicketStatus }, files: File[]) {
    const { data } = await apiClient.post<ApiResponse<SupportMessage>>(
      `/support/admin/tickets/${id}/messages`, toForm(payload, files), UPLOAD,
    );
    return value(data, "message");
  },
  async adminUpdate(
    id: string,
    payload: Partial<{ status: TicketStatus; priority: TicketPriority; category: TicketCategory; assignedTo: string | null }>,
  ) {
    const { data } = await apiClient.patch<ApiResponse<SupportTicket>>(`/support/admin/tickets/${id}`, payload);
    return value(data, "ticket");
  },
  async adminFaqs() {
    const { data } = await apiClient.get<ApiResponse<Faq[]>>("/support/admin/faqs");
    return requireApiList(data.data, "faqs");
  },
  async createFaq(payload: Omit<Faq, "_id">) {
    const { data } = await apiClient.post<ApiResponse<Faq>>("/support/admin/faqs", payload);
    return value(data, "faq");
  },
  async updateFaq(id: string, payload: Partial<Omit<Faq, "_id">>) {
    const { data } = await apiClient.patch<ApiResponse<Faq>>(`/support/admin/faqs/${id}`, payload);
    return value(data, "faq");
  },
  async removeFaq(id: string) {
    await apiClient.delete(`/support/admin/faqs/${id}`);
  },
};
