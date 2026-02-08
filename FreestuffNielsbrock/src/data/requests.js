// src/data/requests.js
export const addRequest = (product) => {
  const requests = JSON.parse(localStorage.getItem("myRequests") || "[]");
  if (!requests.find((r) => r.id === product.id)) {
    requests.push({ ...product, requestedAt: new Date().toISOString() });
    localStorage.setItem("myRequests", JSON.stringify(requests));
  }
};

export const removeRequest = (productId) => {
  const requests = JSON.parse(localStorage.getItem("myRequests") || "[]");
  const updated = requests.filter((r) => r.id !== productId);
  localStorage.setItem("myRequests", JSON.stringify(updated));
};

export const isRequested = (productId) => {
  const requests = JSON.parse(localStorage.getItem("myRequests") || "[]");
  return requests.some((r) => r.id === productId);
};

export const getRequestsCount = () => {
  const requests = JSON.parse(localStorage.getItem("myRequests") || "[]");
  return requests.length;
};