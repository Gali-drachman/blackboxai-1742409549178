# Contributing to NusaGPT

First off, thank you for considering contributing to NusaGPT! It's people like you that make NusaGPT such a great tool.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots and animated GIFs if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fill in the required template
* Do not include issue numbers in the PR title
* Include screenshots and animated GIFs in your pull request whenever possible
* Follow our [coding standards](#coding-standards)
* End all files with a newline

## Development Process

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Coding Standards

### JavaScript/TypeScript

* Use TypeScript for new code
* Follow the existing code style
* Use meaningful variable names
* Keep functions small and focused
* Write comments for complex logic
* Use modern ES6+ features

### React

* Use functional components and hooks
* Keep components small and reusable
* Use TypeScript for prop types
* Follow the container/presenter pattern
* Use CSS modules or Tailwind for styling

### Testing

* Write unit tests for new features
* Maintain high test coverage
* Use meaningful test descriptions
* Follow the Arrange-Act-Assert pattern
* Mock external dependencies

### Git Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Consider starting the commit message with an applicable emoji:
    * 🎨 `:art:` when improving the format/structure of the code
    * 🐎 `:racehorse:` when improving performance
    * 🚱 `:non-potable_water:` when plugging memory leaks
    * 📝 `:memo:` when writing docs
    * 🐛 `:bug:` when fixing a bug
    * 🔥 `:fire:` when removing code or files
    * 💚 `:green_heart:` when fixing the CI build
    * ✅ `:white_check_mark:` when adding tests
    * 🔒 `:lock:` when dealing with security
    * ⬆️ `:arrow_up:` when upgrading dependencies
    * ⬇️ `:arrow_down:` when downgrading dependencies

## Project Structure

```
nusaGPT/
├── frontend/           # Next.js frontend application
│   ├── components/    # Reusable UI components
│   ├── contexts/     # React Context providers
│   ├── hooks/        # Custom React hooks
│   ├── pages/        # Next.js pages
│   └── utils/        # Utility functions
│
└── backend/           # Firebase backend
    └── functions/    # Cloud Functions
```

## Setting Up Development Environment

1. Install dependencies:
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend/functions
npm install
```

2. Set up environment variables:
```bash
# Frontend
cp frontend/.env.example frontend/.env.local

# Backend
cp backend/functions/.env.example backend/functions/.env
```

3. Start development servers:
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd ../backend/functions
npm run serve
```

## Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend/functions
npm test
```

## Documentation

* Keep README.md files up to date
* Document all new features
* Update API documentation
* Include JSDoc comments for functions
* Update TypeScript types

## Review Process

1. Create a pull request
2. Wait for the automated checks to pass
3. Get a code review from team members
4. Address review comments
5. Get approval
6. Merge your changes

## Additional Notes

### Issue and Pull Request Labels

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `documentation` - Improvements or additions to documentation
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `invalid` - Something's wrong
* `question` - Further information is requested
* `wontfix` - This will not be worked on

## Getting Help

* Join our [Discord channel](https://discord.gg/nusagpt)
* Email the team at support@nusagpt.com
* Check the [FAQ](https://nusagpt.com/faq)

## Recognition

Contributors who make significant improvements will be recognized in our [CONTRIBUTORS.md](CONTRIBUTORS.md) file.

Thank you for contributing to NusaGPT! 🎉