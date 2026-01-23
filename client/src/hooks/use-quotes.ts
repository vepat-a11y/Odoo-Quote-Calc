import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertQuote } from "@shared/schema";

// GET /api/quotes
export function useQuotes() {
  return useQuery({
    queryKey: [api.quotes.list.path],
    queryFn: async () => {
      const res = await fetch(api.quotes.list.path);
      if (!res.ok) throw new Error("Failed to fetch quotes");
      return api.quotes.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/quotes/:id
export function useQuote(id: number) {
  return useQuery({
    queryKey: [api.quotes.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.quotes.get.path, { id });
      const res = await fetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch quote");
      return api.quotes.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// POST /api/quotes
export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertQuote) => {
      const res = await fetch(api.quotes.create.path, {
        method: api.quotes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.quotes.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to save quote");
      }
      return api.quotes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.quotes.list.path] });
    },
  });
}
