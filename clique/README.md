# Clique Barangay AI Chatbot

A modern, AI-powered chatbot application designed for barangay document processing. Built with React.js, Tailwind CSS, and Framer Motion.

## Features

- 🤖 **AI-Powered Responses**: Smart conversational interface for barangay document inquiries
- 📱 **Mobile-Responsive**: Optimized for both desktop and mobile devices
- 🎨 **Modern UI**: Clean, professional design with smooth animations
- 💬 **Multi-step Interactions**: Guided conversations for document processing
- 🔄 **Real-time Chat**: Live chat interface with message history
- ⚡ **Quick Actions**: Pre-defined buttons for common document types

## Supported Document Types

- Barangay Clearance
- Certificate of Residency
- Indigency Certificate
- Community Tax Certificate
- Barangay Business Permit

## Tech Stack

- **Frontend**: React.js 18 with Hooks
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Build Tool**: Vite
- **Package Manager**: npm/yarn

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd barangay-chatbot
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
# or
yarn build
```

## Project Structure

```
src/
├── components/
│   ├── ChatBot.jsx          # Main chatbot component
│   ├── ChatMessage.jsx      # Individual message component
│   └── LoadingDots.jsx      # Loading animation component
├── App.jsx                  # Main application component
├── main.jsx                 # Application entry point
└── index.css                # Global styles and Tailwind imports
```

## AI Integration

The application currently uses a placeholder `fetchAIResponse()` function. To integrate with real AI services:

1. **OpenAI Integration**:
```javascript
const fetchAIResponse = async (message) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return response.json();
};
```

2. **LangChain Integration**:
```javascript
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage } from 'langchain/schema';

const fetchAIResponse = async (message) => {
  const chat = new ChatOpenAI({ temperature: 0.7 });
  const response = await chat.call([new HumanMessage(message)]);
  return response.content;
};
```

## Document Management

The application is designed to easily integrate with external document data sources:

```javascript
// Example document structure
const documents = [
  {
    id: 'clearance',
    name: 'Barangay Clearance',
    description: 'Official clearance for employment and business purposes',
    requirements: ['Valid ID', 'Proof of Residency', 'Purpose Letter'],
    processingTime: '3-5 business days',
    fee: '₱100.00'
  }
  // ... more documents
];
```

## Customization

### Colors
Modify the color scheme in `tailwind.config.js`:
```javascript
colors: {
  primary: {
    500: '#your-color-here',
    // ... other shades
  }
}
```

### Animations
Adjust animation timing in `src/index.css`:
```css
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For questions or support, please open an issue in the repository.



