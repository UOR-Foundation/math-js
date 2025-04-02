# CLAUDE.md - Guide for Agentic Coding

## Build/Test Commands
- `npm install` - Install dependencies
- `npm test` - Run all tests
- `npm test -- --testPathPattern=specificTest.test.js` - Run specific test
- `npm run lint` - Run ESLint
- `npm run typecheck` - Verify TypeScript types
- `npm run build` - Build the library
- `npm run docs` - Generate documentation

## Code Style Guidelines
- **Formatting**: Use 2-space indentation, no semicolons
- **Imports**: Sort imports alphabetically; group standard lib first, then external, then internal
- **Classes**: For UniversalNumber implementation, follow canonical form principles
- **Typing**: Prefer strong typing with JSDoc or TypeScript annotations
- **Error Handling**: Use PrimeMathError for domain-specific errors
- **Naming**: PascalCase for classes, camelCase for methods and variables
- **Documentation**: Document all public methods with JSDoc comments
  - Use complete JSDoc annotations for all functions and classes
  - Include @param, @returns, @throws, and @example tags
  - Document parameter types, return types, and possible exceptions
  - Make sure descriptions are clear and concise
  - Write examples that demonstrate proper usage
- **Prime Framework**: Ensure all operations maintain coherence and canonical representation
- **Testing**: Write tests for all public methods, verify round-trip conversions

All implementations must follow the Prime Framework specification and ensure exact arithmetic with immutable values.

Authoratative documents for your work:
- lib-spec.md
- repo-spec.md
- repo-plan.md