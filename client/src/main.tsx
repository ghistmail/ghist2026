import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Redirect legacy hash-based URLs (e.g. /#/blog) to real paths (/blog)
// so existing bookmarks and shared links continue to work.
const hash = window.location.hash;
if (hash.startsWith("#/") && hash.length > 2) {
  const realPath = hash.slice(1); // "#/blog" → "/blog"
  window.history.replaceState(null, "", realPath);
}

createRoot(document.getElementById("root")!).render(<App />);
