# SussySolver - AI Blackboard Math Solver (No Cap) ✍️🧠

Okay, so peep this project. It's basically a digital blackboard where you can doodle math problems like you're in class, but then instead of getting stuck, you yeet it to an AI, and it, like, *solves* it for you. Trying to make finding the hypotenuse slightly less... tragic? Def.

## What's the Tea ☕ (Features)

*   **Doodle Away:** Got a math problem? Just draw it right there on the canvas. Fr.
*   **Pick a Vibe:** Choose your drawing color. Because aesthetic matters, even in math. ✨
*   **Oops, Eraser:** Messed up? No cap, just switch to erase mode.
*   **Send It:** Hit 'Calculate' to send your masterpiece (or mathasterpiece?) to the backend.
*   **AI Glow-Up:** Get the answer back, looking all clean and proper (thanks, Math Renderer!).
*   **Variable Memory:** The app actually keeps track of variables you've assigned (`x=5`? It remembers!). This gets sent to the AI so it uses the right values. Big brain moves. 😎
*   **Smooth UI:** Clean and simple interface, easy to navigate. No extra clutter.

## The Stack (Current Vibes)

Here's what's making this project run rn:

### Frontend (That UI Energy)

*   **React:** The main framework vibe.
*   **TypeScript:** Keeping types in check so stuff doesn't break randomly. Type safety is key 🔐.
*   **Axios:** For hitting up the backend API easily.
*   **Framer Motion:** Adding those smooth animations for the draggable math output. ✨
*   **KaTeX:** THE real MVP for making math notation look fly. Way less drama than other options. 📈
*   **@mantine/core:** Snagged the `ColorSwatch` and `Group` components 'cause they looked clean.
*   **dotenv (for VITE\_API\_URL):** Keeping that API URL secret and sound. 👀

### Backend (The Brains)

*   **Python:** The language where the magic happens.
*   **FastAPI:** Super fast framework for the API. Fast AF boi. 🏎️
*   **Uvicorn:** Making the server run.
*   **python-dotenv:** Loading environment variables. Gotta keep those API keys safe. 🤫
*   **google-generativeai:** Connecting to the actual AI model (Gemini!). Where the math gets solved. ✨
*   **PIL (Pillow):** Handling the image data from the canvas.
*   **ast, json:** Parsing the AI's response (carefully!).

## How to Get It Running (Less Cringe Than Setting Up a Printer)

1.  **Clone the Repo:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2.  **Backend Setup:**
    *   Navigate into the `backend` folder: `cd backend`
    *   Install Python dependencies:
        ```bash
        pip install requirements.txt
        ```
        *(You might already have some, but this ensures you get the ones used)*
    *   Create a `.env` file in the `backend` folder. Get your Google AI Studio API key and add these lines:
        ```env
        GEMINI_API_KEY=YOUR_GEMINI_API_KEY
        SERVER_URL=127.0.0.1 # Or your local IP/host
        PORT=8000 # Or whatever port you want
        ENV=dev # Use 'dev' for auto-reloading
        ```
    *   Make sure you have the `ai_notes_prompt.txt` file in the correct location (`backend/ai_notes_prompt.txt`).
    *   Run the backend server:
        ```bash
        uvicorn main:app --reload
        ```
        *(Or if you're running `main.py` directly: `python main.py`)*

3.  **Frontend Setup:**
    *   Navigate into the frontend folder (assuming it's at the root or `frontend`): `cd ../frontend` (if you're in `backend`) or `cd .` (if you're at the root).
    *   Install Node.js dependencies:
        ```bash
        npm install
        # or
        yarn install
        ```
        *(This includes React, KaTeX, Framer Motion, Axios, etc.)*
    *   Create a `.env` file in the frontend project root. Point it to your backend:
        ```env
        VITE_API_URL=http://127.0.0.1:8000 # Use the host and port from your backend .env
        ```
    *   Start the frontend dev server:
        ```bash
        npm run dev
        # or
        yarn dev
        ```

4.  **Go Time!** Open your browser to the frontend URL (usually `http://localhost:5173` or similar). Draw, calculate, vibe.

## The Plot Twist 🎭 (Libraries We Ghosted)

Okay, real talk, development isn't always smooth sailing. We initially tried integrating some libs that seemed perfect but ended up being a bit... extra?

*   **MathJax:** Wanted that sweet math rendering. The docs for v2 felt kinda ancient, and trying to get it to play nice with newer React versions (v18+) was a whole thing. Fighting versioning issues and their slightly complex API for dynamic content update? Not the vibe.
*   **react-draggable:** Seemed like the move for making the output draggable. But, classic tale, ran into the infamous `TypeError: findDOMNode is not a function` error. This happens when older versions of `react-draggable` (or other libs using `findDOMNode`) clash with newer React versions. It's a sign the library isn't fully updated for modern React hooks/rendering.

**Lesson Learned:** Sometimes the newer, simpler, or purpose-built library (like **KaTeX** for math rendering - it's fast and has a straightforward API) or just using a robust one that *is* updated (like **Framer Motion**, once we fixed the ref issue) is the way to go. Don't get caught up fighting deprecated APIs if you don't have to! 💅

## AI's Secret Sauce 🤫 (The Prompt)

Okay, so the AI (Gemini) is doing the heavy lifting for solving, but it doesn't just *magically* spit out the answer in the right format. That's where the **Prompt** comes in.

Think of the prompt as giving the AI super specific instructions, like a cheat sheet for how to understand the image, what math rules to follow (PEMDAS!), what cases to handle, and **CRUCIALLY** what format the output should be in.

Initially, the AI was just sending back plain text or wrapping the output in markdown code blocks (` ```json `). That messed up the backend's parsing (`ast.literal_eval` was NOT happy). By carefully tweaking the prompt – adding instructions to use LaTeX syntax for math expressions and to **ONLY** output the raw Python list of dictionaries with no extra characters – we got the AI to behave and send data that the backend could actually work with.

This whole experience really shows how wild and powerful **prompt engineering** is in AI apps. It's like writing code, but for the AI's brain! The prompt is kinda the secret ingredient that makes the AI's output usable for our specific needs.

Yeah, the actual `ai_notes_prompt.txt` file? That's low-key the secret sauce, so it's not in this public repo. 😉 But understanding its importance is key to how this whole thing vibes. Mind blown 🤯.

## Get Involved (Optional)

Wanna make this even more fetch? Contributions are welcome!

1.  Fork the repo.
2.  Create your feature branch (`git checkout -b feature/new-vibe`).
3.  Commit your changes (`git commit -m 'Add a new vibe'`).
4.  Push to the branch (`git push origin feature/new-vibe`).
5.  Open a Pull Request.

---

Made with good vibes and sheer will. ✨
