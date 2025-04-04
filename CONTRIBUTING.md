# Contributing to uor-math-js

Thank you for your interest in contributing to the UOR Math-JS library! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by its Code of Conduct. Please be respectful and constructive in your interactions with other contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** to your local machine
3. **Install dependencies** with `npm install`
4. **Run tests** to ensure everything is working: `npm test`

## Development Workflow

1. **Create a branch** for your feature or bugfix: `git checkout -b feature/your-feature-name`
2. **Make your changes** and ensure they follow the coding standards
3. **Add tests** for any new functionality
4. **Run the test suite** to ensure nothing is broken: `npm test`
5. **Run the linter** to ensure code style conformity: `npm run lint`
6. **Commit your changes** with a clear, descriptive commit message
7. **Push your branch** to your fork on GitHub
8. **Submit a pull request** to the main repository

## Coding Standards

- **Formatting**: Use 2-space indentation, no semicolons
- **Imports**: Sort imports alphabetically; group standard lib first, then external, then internal
- **Classes**: For UniversalNumber implementation, follow canonical form principles
- **Typing**: Prefer strong typing with JSDoc or TypeScript annotations
- **Error Handling**: Use PrimeMathError for domain-specific errors
- **Naming**: PascalCase for classes, camelCase for methods and variables

## Documentation

All code contributions should include appropriate documentation:

- **JSDoc Comments**: Document all public methods with JSDoc comments
- Include `@param`, `@returns`, `@throws`, and `@example` tags
- Document parameter types, return types, and possible exceptions
- Make sure descriptions are clear and concise
- Write examples that demonstrate proper usage

## Testing

Please add tests for any new features or bug fixes:

- **Unit Tests**: Add tests in the appropriate test file in the `tests/` directory
- **Test Coverage**: Ensure that your tests cover all code paths
- **Run Tests**: Make sure all tests pass before submitting a pull request

## Pull Request Process

1. Ensure all tests pass and your code follows the project standards
2. Update the README.md if needed with details of changes to the interface
3. Update the CHANGELOG.md with notes on your changes
4. The version number will be updated by maintainers at release time
5. Your pull request will be merged once it has been reviewed and approved

## Feature Requests and Bug Reports

- Use the GitHub Issues tracker to submit feature requests and bug reports
- Clearly describe the issue, including steps to reproduce for bugs
- Include any relevant information about your environment
- If possible, provide a minimal code example that demonstrates the issue

## Questions?

If you have any questions or need help with your contribution, feel free to open an issue asking for guidance.

Thank you for contributing to UOR Math-JS!