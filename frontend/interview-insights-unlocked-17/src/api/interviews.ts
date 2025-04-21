import api from "./client";

export const fetchInterviews = async (params?: any) => {
  const {
    search_term,
    company,
    position,
    difficulty,
    offer_status,
    sort_by = "date_desc",
    skip = 0,
    limit = 10,
  } = params || {};

  const response = await api.get("/interviews/", {
    params: {
      search_term,
      company,
      position,
      difficulty,
      offer_status,
      sort_by,
      skip,
      limit,
    },
  });

  return response.data;
};

export const fetchRecent = async (limit = 5) => {
  const response = await api.get("/interviews/recent-experiences", {
    params: { limit },
  });

  return response.data;
};
