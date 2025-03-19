# NusaGPT

NusaGPT is a modern AI chat application built with Next.js, Firebase, and advanced language models. It provides a seamless chat experience with features like token management, subscriptions, and real-time interactions.

## 🌟 Features

- 💬 Advanced AI chat interface
- 🔐 Secure authentication
- 💳 Token-based usage system
- 📊 Usage analytics
- 🔔 Real-time notifications
- 🌙 Dark mode support
- 🌐 Internationalization ready
- 📱 Responsive design
- ⚡ Real-time updates

## 🏗️ Architecture

The project is structured into two main parts:

### Frontend (`/frontend`)
- Next.js application
- React with custom hooks
- Tailwind CSS for styling
- Firebase SDK integration
- Real-time updates
- Comprehensive test coverage

### Backend (`/backend/functions`)
- Firebase Cloud Functions
- Express.js API
- Token management system
- Subscription handling
- Analytics processing
- Security rules

## 🚀 Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Firebase CLI
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/nusagpt.git
cd nusagpt
```

2. Install dependencies:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend/functions
npm install
```

3. Set up environment variables:
```bash
# Frontend
cp frontend/.env.example frontend/.env.local

# Backend
cp backend/functions/.env.example backend/functions/.env
```

4. Start the development servers:
```bash
# Frontend (from /frontend directory)
npm run dev

# Backend (from /backend/functions directory)
npm run serve
```

## 📁 Project Structure

```
nusaGPT/
├── frontend/           # Next.js frontend application
│   ├── components/    # Reusable UI components
│   ├── contexts/     # React Context providers
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Next.js pages
│   ├── public/       # Static assets
│   ├── styles/       # Global styles
│   └── utils/        # Utility functions
│
├── backend/           # Firebase backend
│   └── functions/    # Cloud Functions
│       ├── api/      # API routes
│       ├── auth/     # Authentication handlers
│       └── utils/    # Utility functions
│
├── firestore.rules    # Firestore security rules
├── storage.rules      # Storage security rules
└── firebase.json      # Firebase configuration
```

## 🛠️ Development

### Frontend Development

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000`

### Backend Development

```bash
cd backend/functions
npm run serve
```

Firebase emulators will start on various ports.

## 🧪 Testing

### Frontend Tests

```bash
cd frontend
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
```

### Backend Tests

```bash
cd backend/functions
npm test
```

## 📦 Deployment

### Frontend Deployment

```bash
cd frontend
npm run build
npm run deploy
```

### Backend Deployment

```bash
cd backend/functions
npm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📝 Documentation

- [Frontend Documentation](frontend/README.md)
- [Backend Documentation](backend/README.md)
- [API Documentation](backend/functions/README.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🔒 Security

See [SECURITY.md](SECURITY.md) for security policies and procedures.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- Project Lead - [Name](https://github.com/username)
- Frontend Lead - [Name](https://github.com/username)
- Backend Lead - [Name](https://github.com/username)

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for GPT models
- [Firebase](https://firebase.google.com/) for backend services
- [Next.js](https://nextjs.org/) for the frontend framework
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📧 Support

For support, please email support@nusagpt.com or join our [Discord community](https://discord.gg/nusagpt).

## 🗺️ Roadmap

See our [public roadmap](https://github.com/your-username/nusagpt/projects) for upcoming features and improvements.