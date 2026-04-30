function handleErrorMessageFromGemini(error) {
  console.error("Error generating content:", error);
  if (error.message.includes("503")) {
    alert(
      "The model is currently overloaded. Please try again in a few moments.",
    );
    setIsLoading(false);
  } else if (error.message.includes("429")) {
    alert("Too many requests. Please wait a moment before trying again.");
    setIsLoading(false);
  } else if (error.message.includes("401") || error.message.includes("403")) {
    alert("Authentication error. Please check your API key.");
    setIsLoading(false);
  } else {
    alert(
      "An error occurred while processing your request. Please try again later.",
    );
  }
}
export default handleErrorMessageFromGemini;
