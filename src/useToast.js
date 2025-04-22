export const useToast = () => {
  return (title, message, type = "info") => {
    alert(`${type.toUpperCase()}: ${title} - ${message}`);
  };
};
