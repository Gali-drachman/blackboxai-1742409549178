# NusaGPT Frontend

A modern Next.js application with React hooks, TypeScript, Tailwind CSS, and Firebase integration.

## Features

- 🎨 Modern UI with Tailwind CSS
- 🎣 Custom React Hooks for state management
- 🔒 Authentication with Firebase
- 📱 Responsive design
- 🌙 Dark mode support
- 🌐 Internationalization ready
- ⚡ Real-time updates
- 📊 Analytics and usage tracking
- 💳 Subscription management
- 🔔 Real-time notifications

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm 7.x or later
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/nusagpt.git
cd nusagpt/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration.

4. Start the development server:
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Project Structure

```
frontend/
├── components/       # Reusable UI components
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── pages/           # Next.js pages
├── public/          # Static assets
├── styles/          # Global styles
├── utils/           # Utility functions
└── __tests__/       # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run format` - Format code

## Custom Hooks

### API and Data Management
- `useApi` - Handle API requests with loading and error states
- `useForm` - Form state management and validation
- `useChat` - Chat functionality and message management

### User Management
- `useSettings` - User preferences and settings
- `useTokens` - Token balance and usage tracking
- `useSubscription` - Subscription plan management
- `useAnalytics` - Usage analytics and statistics
- `useNotifications` - Real-time notifications

### UI and Interaction
- `useHotkeys` - Keyboard shortcuts management
- `useTheme` - Theme switching and customization

## Testing

We use Jest and React Testing Library for testing. Run tests with:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## Code Quality

We maintain code quality through:

- ESLint for code linting
- Prettier for code formatting
- Husky for pre-commit hooks
- Commitlint for commit message standards
- EditorConfig for consistent coding styles

### Git Commit Guidelines

We follow conventional commits specification:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test updates
- `chore:` Build process or tool changes

## Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## VSCode Configuration

We recommend installing the following extensions:

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- GitLens
- Jest
- EditorConfig

Settings are automatically configured via `.vscode/settings.json`.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@nusagpt.com or join our Discord channel.