# Math-JS Benchmarking Suite

This directory contains a comprehensive benchmarking system for the math-js library. The benchmarking system allows for measuring and analyzing the performance of various operations and configurations.

## Overview

The benchmarking suite consists of:

1. A core benchmarking framework (`benchmark-runner.js`)
2. Multiple benchmark suites for different aspects of the library
3. Results analysis tools (`analyze-results.js`)
4. Visualization tools (`visualize-results.js`)
5. A command-line interface for running benchmarks (`run.js`)

## Running Benchmarks

To run all benchmarks with default settings:

```bash
node benchmarks/run.js
```

For more accurate memory measurements, run with garbage collection exposed:

```bash
node --expose-gc benchmarks/run.js
```

### Command-Line Options

- `--verbose`: Show detailed output during benchmarking
- `--analyze`: Analyze results after benchmarking
- `--visualize`: Generate HTML visualization of results
- `--iterations=N`: Set number of iterations (default: 5)
- `--warmup=N`: Set number of warmup runs (default: 3)

### Running Specific Suites

You can specify which benchmark suites to run:

```bash
node benchmarks/run.js arithmetic conversion
```

## Available Benchmark Suites

The benchmarking system includes the following suites:

1. **Arithmetic Operations**: Tests basic arithmetic operations on UniversalNumbers of various sizes
2. **Factorization**: Tests the performance of different factorization algorithms
3. **Conversion**: Tests conversion between UniversalNumber and other formats
4. **Configuration**: Tests the performance impact of different configuration settings
5. **Memory Usage**: Measures the memory footprint of various operations

## Analyzing Results

After running benchmarks, you can analyze the results using:

```bash
node benchmarks/analyze-results.js analyze ./benchmarks/results/benchmark-xxx.json
```

This will identify performance bottlenecks, high memory usage operations, and inconsistent performance.

### Comparing Results

You can compare two benchmark runs to track performance changes:

```bash
node benchmarks/analyze-results.js compare ./benchmarks/results/old.json ./benchmarks/results/new.json
```

### Trend Analysis

To analyze performance trends across multiple benchmark runs:

```bash
node benchmarks/analyze-results.js trend
```

## Visualizing Results

To generate HTML visualizations of benchmark results:

```bash
node benchmarks/visualize-results.js ./benchmarks/results/benchmark-xxx.json
```

This will create an HTML file with interactive charts for easier analysis.

## Adding New Benchmark Suites

To add a new benchmark suite:

1. Create a new file in the `benchmarks/suites` directory
2. Use the `createSuite` function to define a suite
3. Add benchmark cases using the `suite.add` method
4. Export the suite

Example:

```javascript
const { createSuite } = require('../benchmark-runner')
const mathjs = require('../../src')
const { UniversalNumber } = mathjs

// Create a benchmark suite
const suite = createSuite('My New Suite', {
  warmupRuns: 3,
  iterations: 5
})

// Add benchmark cases
suite.add('My Benchmark Case', () => {
  // Code to benchmark
  const a = new UniversalNumber(123)
  const b = new UniversalNumber(456)
  return a.add(b)
})

// Export the suite
module.exports = suite
```

## Configuration

The benchmarking system uses the same configuration system as the core library. You can customize the configuration before running benchmarks:

```javascript
const mathjs = require('../../src')

mathjs.configure({
  performanceProfile: 'speed',
  cache: {
    enabled: true,
    maxSize: 1024 * 1024 * 20 // 20MB
  }
})

// Run benchmarks with this configuration
```

## Integration with CI/CD

The benchmarking system can be integrated into CI/CD pipelines to automatically track performance over time. Example GitHub Actions workflow:

```yaml
name: Performance Benchmarks

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16.x'
      - name: Install dependencies
        run: npm ci
      - name: Run benchmarks
        run: node --expose-gc benchmarks/run.js --analyze
      - name: Upload benchmark results
        uses: actions/upload-artifact@v2
        with:
          name: benchmark-results
          path: benchmarks/results/
```