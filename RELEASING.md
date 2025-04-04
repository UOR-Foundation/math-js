# Release Process

This document outlines the process for creating a new release of the `uor-math-js` package.

## Prerequisites

1. Ensure you have appropriate permissions to publish to the NPM registry.
2. Make sure you have a GitHub Personal Access Token with appropriate permissions.
3. Configure your NPM token:
   ```
   npm config set //registry.npmjs.org/:_authToken=${NPM_TOKEN}
   ```

## Release Steps

1. **Prepare the release**
   - Ensure all changes for the release are merged into the `main` branch
   - Check that all tests are passing on CI
   - Update the `CHANGELOG.md` with release notes for the new version

2. **Update version**
   - Use the npm version command to update the package version and create a git tag:
     ```
     # For a patch release (bug fixes)
     npm version patch
     
     # For a minor release (new features, backward compatible)
     npm version minor
     
     # For a major release (breaking changes)
     npm version major
     ```
   - This will automatically create a commit with the updated version and a corresponding git tag

3. **Push changes**
   - Push the changes and tag to GitHub:
     ```
     git push && git push --tags
     ```

4. **Create a GitHub Release**
   - Go to the GitHub repository page
   - Click on "Releases" > "Create a new release"
   - Select the tag you just pushed
   - Enter a title (e.g., "v1.0.0")
   - Copy the release notes from the CHANGELOG.md
   - Publish the release

5. **Monitor the release**
   - The GitHub Actions workflow will automatically publish the package to NPM
   - Verify that the package has been published correctly: https://www.npmjs.com/package/uor-math-js

## After Release

1. Announce the release to stakeholders if needed
2. Start the next development cycle

## Troubleshooting

If the automatic publishing fails:

1. Check the GitHub Actions logs for errors
2. Ensure that the NPM_TOKEN secret is properly set in the repository
3. If necessary, you can publish manually:
   ```
   npm ci
   npm run build
   npm publish
   ```
