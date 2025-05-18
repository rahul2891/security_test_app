export const createTabSession = () => {
  const tabId = crypto.randomUUID(); // unique tab ID
  sessionStorage.setItem("tab_id", tabId);
  return tabId;
};

export const getTabSession = () => {
  return sessionStorage.getItem("tab_id");
};
