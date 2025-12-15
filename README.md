# 🌑 The Shadow Diary

<div align="center">

**A journaling application that acts as a Jungian mirror, revealing your repressed subconscious through AI-powered psychological analysis**

[![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.1-61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9.1-orange)](https://firebase.google.com/)
[![Genkit](https://img.shields.io/badge/Genkit-AI-purple)](https://firebase.google.com/products/genkit)

</div>

---

## 📖 About

**The Shadow Diary** is not your typical journal. Built on Jungian psychology principles, this application utilizes Generative AI to act as your personal psychoanalyst—one that doesn't comfort, but confronts. Write your thoughts on one page, turn it, and discover what your subconscious might be hiding.

The AI persona, "The Shadow," acts as a detached, hyper-observant clinician that analyzes your entries for contradictions, patterns, and repressed thoughts, offering short, punchy observations that challenge your self-perception.

### 🎯 Core Concept

> **User writes:** "I think the date went well. He talked a lot."  
> **Shadow responds:** "You equate silence with failure. You let him talk so you wouldn't have to reveal yourself."

---

## ✨ Features

### 🖋️ **The Journaling Loop**
- **Front Page:** Write your entry in a skeuomorphic worn black leather notebook with clean serif typography
- **Page Turn:** Swipe left to "turn the page" (no submit button)
- **Back Page:** Receive The Shadow's response, typed letter-by-letter in a distressed typewriter font on grittier paper

### 🧠 **AI Psychoanalyst ("The Shadow")**
- Powered by Google's Generative AI via Firebase Genkit
- Acts as a detached observer, identifying contradictions in your entries
- No empathy, no abuse—just cold, analytical truth
- Short, punchy observations that cut deep

### 📁 **The Patient File**
- Vector database stores emotional tags from every entry (e.g., Avoidance, Narcissism, Guilt)
- Monthly psychological profile generated on the 1st of each month
- Presented as a manila folder UI element
- Tracks patterns and psychological trends over time

### 🎨 **Immersive Design**
- **Typography:** Clean serif for user (the mask), distressed typewriter for Shadow (the truth)
- **Haptic Feedback:** Heavy, low-frequency thuds during Shadow responses (like a heartbeat)
- **Animations:** Slow, heavy page-turn transitions for psychological weight

---

## 🛠️ Tech Stack

### Frontend
- **[Next.js 15.5.9](https://nextjs.org/)** - React framework with App Router
- **[React 19.2.1](https://reactjs.org/)** - UI library
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
- **[Lucide React](https://lucide.dev/)** - Icon library

### Backend & AI
- **[Firebase Genkit](https://firebase.google.com/products/genkit)** - AI orchestration framework
- **[Google Generative AI](https://ai.google.dev/)** - LLM for Shadow responses
- **[Firebase](https://firebase.google.com/)** - Authentication & database

### Additional Libraries
- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** - Form validation
- **[date-fns](https://date-fns.org/)** - Date manipulation
- **[Recharts](https://recharts.org/)** - Data visualization for Patient File
- **[Tone.js](https://tonejs.github.io/)** - Audio/haptic feedback

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v20 or higher)
- **npm** or **pnpm**
- **Firebase account** with Genkit setup
- **Google AI API key**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/the-shadow-diary.git
   cd the-shadow-diary
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GOOGLE_GENAI_API_KEY=your_api_key_here
   # Add other Firebase credentials as needed
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:9002](http://localhost:9002)

### Alternative: Genkit Development Mode

To run with Genkit's developer UI for AI flow debugging:

```bash
npm run genkit:dev
# or with hot reload
npm run genkit:watch
```

---

## 📝 Usage

1. **Write Your Entry**  
   Open the application and begin typing your journal entry on the front page.

2. **Turn the Page**  
   Swipe left or click the page corner to submit your entry.

3. **Read The Shadow's Response**  
   Watch as The Shadow types out its analysis letter-by-letter on the back page.

4. **Review Your Patient File**  
   Check your monthly psychological profile on the 1st of each month.

---

## 📂 Project Structure

```
The-Shadow-Diary/
├── src/
│   ├── ai/                    # Genkit AI flows and configuration
│   │   ├── flows/            # AI generation flows
│   │   ├── genkit.ts         # Genkit setup
│   │   └── dev.ts            # Development entry point
│   ├── app/                   # Next.js app router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx          # Main journal page
│   │   ├── profile/          # User profile pages
│   │   └── globals.css
│   ├── components/            # React components
│   │   ├── Journal.tsx       # Main journal interface
│   │   ├── ShadowResponse.tsx # Shadow's response display
│   │   ├── PatientFile.tsx   # Monthly report component
│   │   └── ui/               # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utilities and helpers
│   │   ├── journal.ts        # Journal logic
│   │   └── utils.ts          # General utilities
├── docs/                      # Documentation
├── public/                    # Static assets
├── .env                       # Environment variables (not committed)
├── next.config.ts            # Next.js configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

---

## ⚙️ Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable authentication methods
3. Set up Firestore database
4. Add your credentials to `.env`

### AI Model Configuration

The Shadow's personality and response style can be configured in `src/ai/flows/`. Adjust:
- Temperature for response variability
- System prompts for tone and analysis depth
- Response length and format

---

## 🗺️ Roadmap

- [x] Core journaling interface
- [x] AI-powered Shadow responses
- [x] Page turn animations
- [ ] Vector database integration for emotional tagging
- [ ] Monthly Patient File generation
- [ ] Haptic feedback implementation
- [ ] Mobile app version
- [ ] Export journal entries
- [ ] Dark mode toggle
- [ ] Multi-language support

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Inspired by **Carl Jung's** concept of the Shadow self
- Built with **Firebase Genkit** for AI orchestration
- UI components from **shadcn/ui** and **Radix UI**
- Special thanks to the open-source community

---

## 📧 Contact

For questions or feedback, please open an issue or contact the maintainer.

---

<div align="center">

**"The shadow is a moral problem that challenges the whole ego-personality."**  
— Carl Jung

</div>