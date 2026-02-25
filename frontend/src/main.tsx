import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("main.tsx: Starting app render...");
try {
    const root = createRoot(document.getElementById("root")!);
    root.render(<App />);
    console.log("main.tsx: render() called successfully");
} catch (e) {
    console.error("main.tsx: RENDER ERROR:", e);
    document.getElementById("root")!.innerHTML = `<pre style="color:red;padding:20px;">${e}</pre>`;
}
