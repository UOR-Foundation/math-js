/**
 * Benchmark Results Analysis Tool
 * 
 * This script analyzes benchmark results, identifies optimization opportunities,
 * and can compare results across multiple benchmark runs.
 */

const fs = require('fs')
const path = require('path')

// Default location for results
const resultsDir = path.join(__dirname, 'results')

/**
 * Analyze a benchmark results file for optimization opportunities
 * @param {string} filePath - Path to the benchmark results JSON file
 * @returns {Object} Analysis results
 */
function analyzeResults(filePath) {
  console.log(`Analyzing benchmark results from ${filePath}...`)
  
  // Read the benchmark results
  const results = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  
  const analysis = {
    filename: path.basename(filePath),
    timestamp: results.timestamp,
    version: results.libraryVersion,
    stats: {
      totalSuites: Object.keys(results.suites).length,
      totalCases: 0,
      bottlenecks: [],
      highMemoryOperations: [],
      inconsistentPerformance: []
    },
    recommendations: []
  }
  
  // Analyze each suite
  for (const [suiteName, suite] of Object.entries(results.suites)) {
    const cases = Object.entries(suite.cases)
    analysis.stats.totalCases += cases.length
    
    // Find bottlenecks (slowest operations)
    cases.sort((a, b) => a[1].opsPerSecond - b[1].opsPerSecond)
    
    // Add the slowest 3 cases or all if there are fewer than 3
    const slowestCount = Math.min(3, cases.length)
    for (let i = 0; i < slowestCount; i++) {
      const [caseName, caseData] = cases[i]
      analysis.stats.bottlenecks.push({
        suite: suiteName,
        name: caseName,
        opsPerSecond: caseData.opsPerSecond,
        avgTime: caseData.avgTime
      })
    }
    
    // Find operations with high memory usage
    const highMemoryOps = cases
      .filter(([_, data]) => data.avgMemory)
      .sort((a, b) => b[1].avgMemory - a[1].avgMemory)
      .slice(0, 3)
    
    for (const [caseName, caseData] of highMemoryOps) {
      if (caseData.avgMemory > 1024 * 1024) { // More than 1MB
        analysis.stats.highMemoryOperations.push({
          suite: suiteName,
          name: caseName,
          memoryMB: (caseData.avgMemory / 1024 / 1024).toFixed(2)
        })
      }
    }
    
    // Find operations with inconsistent performance (high relative standard deviation)
    const inconsistentOps = cases
      .filter(([_, data]) => data.relativeStdDev > 0.2) // More than 20% variation
      .sort((a, b) => b[1].relativeStdDev - a[1].relativeStdDev)
    
    for (const [caseName, caseData] of inconsistentOps) {
      analysis.stats.inconsistentPerformance.push({
        suite: suiteName,
        name: caseName,
        relativeStdDev: (caseData.relativeStdDev * 100).toFixed(2) + '%'
      })
    }
  }
  
  // Generate recommendations
  if (analysis.stats.bottlenecks.length > 0) {
    analysis.recommendations.push({
      title: 'Optimize Performance Bottlenecks',
      description: 'Consider optimizing the following operations:',
      items: analysis.stats.bottlenecks.map(b => 
        `${b.suite} / ${b.name} (${b.opsPerSecond.toFixed(2)} ops/sec)`
      )
    })
  }
  
  if (analysis.stats.highMemoryOperations.length > 0) {
    analysis.recommendations.push({
      title: 'Reduce Memory Usage',
      description: 'The following operations have high memory consumption:',
      items: analysis.stats.highMemoryOperations.map(op => 
        `${op.suite} / ${op.name} (${op.memoryMB} MB)`
      )
    })
  }
  
  if (analysis.stats.inconsistentPerformance.length > 0) {
    analysis.recommendations.push({
      title: 'Improve Performance Consistency',
      description: 'These operations show inconsistent performance:',
      items: analysis.stats.inconsistentPerformance.map(op => 
        `${op.suite} / ${op.name} (Standard Deviation: ${op.relativeStdDev})`
      )
    })
  }
  
  // Print analysis to console
  console.log('\n--- Benchmark Analysis ---')
  console.log(`Analyzed ${analysis.stats.totalCases} cases across ${analysis.stats.totalSuites} suites`)
  
  if (analysis.stats.bottlenecks.length > 0) {
    console.log('\nPerformance Bottlenecks:')
    analysis.stats.bottlenecks.forEach(b => {
      console.log(`- ${b.suite} / ${b.name}: ${b.opsPerSecond.toFixed(2)} ops/sec (${b.avgTime.toFixed(2)}ms)`)
    })
  }
  
  if (analysis.stats.highMemoryOperations.length > 0) {
    console.log('\nHigh Memory Operations:')
    analysis.stats.highMemoryOperations.forEach(op => {
      console.log(`- ${op.suite} / ${op.name}: ${op.memoryMB} MB`)
    })
  }
  
  if (analysis.stats.inconsistentPerformance.length > 0) {
    console.log('\nInconsistent Performance:')
    analysis.stats.inconsistentPerformance.forEach(op => {
      console.log(`- ${op.suite} / ${op.name}: ${op.relativeStdDev}`)
    })
  }
  
  console.log('\nRecommendations:')
  analysis.recommendations.forEach(rec => {
    console.log(`\n${rec.title}`)
    console.log(rec.description)
    rec.items.forEach(item => console.log(`- ${item}`))
  })
  
  return analysis
}

/**
 * Compare two benchmark result files to identify performance changes
 * @param {string} oldFilePath - Path to the older benchmark results
 * @param {string} newFilePath - Path to the newer benchmark results
 * @returns {Object} Comparison results
 */
function compareResults(oldFilePath, newFilePath) {
  console.log(`Comparing benchmark results:\n- ${path.basename(oldFilePath)}\n- ${path.basename(newFilePath)}`)
  
  // Read the benchmark results
  const oldResults = JSON.parse(fs.readFileSync(oldFilePath, 'utf8'))
  const newResults = JSON.parse(fs.readFileSync(newFilePath, 'utf8'))
  
  const comparison = {
    oldVersion: oldResults.libraryVersion,
    newVersion: newResults.libraryVersion,
    oldTimestamp: oldResults.timestamp,
    newTimestamp: newResults.timestamp,
    improvements: [],
    regressions: [],
    unchanged: [],
    newTests: [],
    removedTests: [],
    summary: {
      totalImprovements: 0,
      totalRegressions: 0,
      averageImprovement: 0,
      averageRegression: 0,
      overallChange: 0
    }
  }
  
  // Track total changes for calculating averages
  let totalImprovementPercent = 0
  let totalRegressionPercent = 0
  
  // Analyze each suite in the new results
  for (const [suiteName, newSuite] of Object.entries(newResults.suites)) {
    // Skip if this suite doesn't exist in the old results
    if (!oldResults.suites[suiteName]) {
      comparison.newTests.push({
        type: 'suite',
        name: suiteName
      })
      continue
    }
    
    const oldSuite = oldResults.suites[suiteName]
    
    // Compare each case in the suite
    for (const [caseName, newCase] of Object.entries(newSuite.cases)) {
      // Skip if this case doesn't exist in the old results
      if (!oldSuite.cases[caseName]) {
        comparison.newTests.push({
          type: 'case',
          suite: suiteName,
          name: caseName
        })
        continue
      }
      
      const oldCase = oldSuite.cases[caseName]
      
      // Calculate performance change percentage
      const changePercent = ((newCase.opsPerSecond - oldCase.opsPerSecond) / oldCase.opsPerSecond) * 100
      
      // Classify as improvement, regression, or unchanged
      if (changePercent >= 5) { // 5% or more improvement
        comparison.improvements.push({
          suite: suiteName,
          name: caseName,
          oldOpsPerSecond: oldCase.opsPerSecond,
          newOpsPerSecond: newCase.opsPerSecond,
          changePercent
        })
        
        totalImprovementPercent += changePercent
        comparison.summary.totalImprovements++
      } else if (changePercent <= -5) { // 5% or more regression
        comparison.regressions.push({
          suite: suiteName,
          name: caseName,
          oldOpsPerSecond: oldCase.opsPerSecond,
          newOpsPerSecond: newCase.opsPerSecond,
          changePercent
        })
        
        totalRegressionPercent += changePercent
        comparison.summary.totalRegressions++
      } else { // Less than 5% change (considered stable)
        comparison.unchanged.push({
          suite: suiteName,
          name: caseName,
          oldOpsPerSecond: oldCase.opsPerSecond,
          newOpsPerSecond: newCase.opsPerSecond,
          changePercent
        })
      }
    }
    
    // Identify cases that were removed
    for (const caseName of Object.keys(oldSuite.cases)) {
      if (!newSuite.cases[caseName]) {
        comparison.removedTests.push({
          type: 'case',
          suite: suiteName,
          name: caseName
        })
      }
    }
  }
  
  // Identify suites that were removed
  for (const suiteName of Object.keys(oldResults.suites)) {
    if (!newResults.suites[suiteName]) {
      comparison.removedTests.push({
        type: 'suite',
        name: suiteName
      })
    }
  }
  
  // Calculate summary statistics
  if (comparison.summary.totalImprovements > 0) {
    comparison.summary.averageImprovement = totalImprovementPercent / comparison.summary.totalImprovements
  }
  
  if (comparison.summary.totalRegressions > 0) {
    comparison.summary.averageRegression = totalRegressionPercent / comparison.summary.totalRegressions
  }
  
  // Overall change is the net effect of improvements minus regressions
  comparison.summary.overallChange = 
    (totalImprovementPercent + totalRegressionPercent) / 
    (comparison.summary.totalImprovements + comparison.summary.totalRegressions || 1)
  
  // Sort improvements and regressions by magnitude
  comparison.improvements.sort((a, b) => b.changePercent - a.changePercent)
  comparison.regressions.sort((a, b) => a.changePercent - b.changePercent)
  
  // Print comparison to console
  console.log('\n--- Benchmark Comparison ---')
  console.log(`Old: ${comparison.oldVersion} (${new Date(comparison.oldTimestamp).toLocaleString()})`)
  console.log(`New: ${comparison.newVersion} (${new Date(comparison.newTimestamp).toLocaleString()})`)
  
  console.log(`\nSummary:`)
  console.log(`- Improvements: ${comparison.summary.totalImprovements} (avg: ${comparison.summary.averageImprovement.toFixed(2)}%)`)
  console.log(`- Regressions: ${comparison.summary.totalRegressions} (avg: ${comparison.summary.averageRegression.toFixed(2)}%)`)
  console.log(`- Overall change: ${comparison.summary.overallChange.toFixed(2)}%`)
  
  if (comparison.improvements.length > 0) {
    console.log('\nTop Improvements:')
    comparison.improvements.slice(0, 5).forEach(imp => {
      console.log(`- ${imp.suite} / ${imp.name}: +${imp.changePercent.toFixed(2)}% (${imp.oldOpsPerSecond.toFixed(2)} → ${imp.newOpsPerSecond.toFixed(2)} ops/sec)`)
    })
  }
  
  if (comparison.regressions.length > 0) {
    console.log('\nTop Regressions:')
    comparison.regressions.slice(0, 5).forEach(reg => {
      console.log(`- ${reg.suite} / ${reg.name}: ${reg.changePercent.toFixed(2)}% (${reg.oldOpsPerSecond.toFixed(2)} → ${reg.newOpsPerSecond.toFixed(2)} ops/sec)`)
    })
  }
  
  if (comparison.newTests.length > 0) {
    console.log('\nNew Tests:')
    comparison.newTests.forEach(test => {
      if (test.type === 'suite') {
        console.log(`- Suite: ${test.name}`)
      } else {
        console.log(`- Case: ${test.suite} / ${test.name}`)
      }
    })
  }
  
  if (comparison.removedTests.length > 0) {
    console.log('\nRemoved Tests:')
    comparison.removedTests.forEach(test => {
      if (test.type === 'suite') {
        console.log(`- Suite: ${test.name}`)
      } else {
        console.log(`- Case: ${test.suite} / ${test.name}`)
      }
    })
  }
  
  return comparison
}

/**
 * Find the most recent benchmark results in the results directory
 * @returns {string|null} Path to the most recent results file, or null if none found
 */
function findMostRecentResults() {
  if (!fs.existsSync(resultsDir)) {
    return null
  }
  
  const files = fs.readdirSync(resultsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(resultsDir, file))
  
  if (files.length === 0) {
    return null
  }
  
  // Sort by file modification time (newest first)
  files.sort((a, b) => {
    return fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime()
  })
  
  return files[0]
}

/**
 * Create a trend report showing performance evolution over multiple benchmark runs
 * @param {Array<string>} filePaths - Array of benchmark result file paths, ordered chronologically
 * @param {string} [outputPath] - Optional path to save the trend report
 */
function createTrendReport(filePaths, outputPath) {
  if (!filePaths || filePaths.length < 2) {
    console.error('At least two benchmark files are required for trend analysis')
    return null
  }
  
  console.log(`Creating trend report from ${filePaths.length} benchmark files...`)
  
  // Load all results files
  const allResults = filePaths.map(file => {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'))
    return {
      file: path.basename(file),
      timestamp: data.timestamp,
      version: data.libraryVersion,
      data
    }
  })
  
  // Sort by timestamp
  allResults.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  
  // Create trend data structure
  const trend = {
    files: allResults.map(r => r.file),
    versions: allResults.map(r => r.version),
    timestamps: allResults.map(r => r.timestamp),
    suites: {}
  }
  
  // Find all suite and case names across all results
  const allSuites = new Set()
  const casesInSuite = {}
  
  allResults.forEach(result => {
    Object.keys(result.data.suites).forEach(suiteName => {
      allSuites.add(suiteName)
      
      if (!casesInSuite[suiteName]) {
        casesInSuite[suiteName] = new Set()
      }
      
      Object.keys(result.data.suites[suiteName].cases).forEach(caseName => {
        casesInSuite[suiteName].add(caseName)
      })
    })
  })
  
  // Initialize trend structure for each suite and case
  allSuites.forEach(suiteName => {
    trend.suites[suiteName] = {
      cases: {}
    }
    
    casesInSuite[suiteName].forEach(caseName => {
      trend.suites[suiteName].cases[caseName] = {
        opsPerSecond: Array(allResults.length).fill(null),
        avgTime: Array(allResults.length).fill(null),
        avgMemory: Array(allResults.length).fill(null),
        trends: {}
      }
    })
  })
  
  // Fill in the data for each result
  allResults.forEach((result, index) => {
    Object.entries(result.data.suites).forEach(([suiteName, suite]) => {
      Object.entries(suite.cases).forEach(([caseName, caseData]) => {
        // Skip if this suite or case wasn't in our initial set (shouldn't happen)
        if (!trend.suites[suiteName] || !trend.suites[suiteName].cases[caseName]) {
          return
        }
        
        trend.suites[suiteName].cases[caseName].opsPerSecond[index] = caseData.opsPerSecond
        trend.suites[suiteName].cases[caseName].avgTime[index] = caseData.avgTime
        trend.suites[suiteName].cases[caseName].avgMemory[index] = caseData.avgMemory || null
      })
    })
  })
  
  // Calculate trends for each case
  Object.entries(trend.suites).forEach(([suiteName, suite]) => {
    Object.entries(suite.cases).forEach(([caseName, caseData]) => {
      // Calculate overall trend (first to last)
      if (caseData.opsPerSecond[0] !== null && caseData.opsPerSecond[caseData.opsPerSecond.length - 1] !== null) {
        const first = caseData.opsPerSecond[0]
        const last = caseData.opsPerSecond[caseData.opsPerSecond.length - 1]
        const overallChange = ((last - first) / first) * 100
        
        caseData.trends.overall = {
          changePercent: overallChange,
          direction: overallChange > 0 ? 'improvement' : (overallChange < 0 ? 'regression' : 'stable')
        }
      }
      
      // Calculate consistency (standard deviation as percentage of mean)
      const validValues = caseData.opsPerSecond.filter(v => v !== null)
      if (validValues.length >= 2) {
        const mean = validValues.reduce((sum, val) => sum + val, 0) / validValues.length
        const variance = validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validValues.length
        const stdDev = Math.sqrt(variance)
        const relativeStdDev = (stdDev / mean) * 100
        
        caseData.trends.consistency = {
          relativeStdDev,
          isConsistent: relativeStdDev < 10 // Less than 10% variation is considered consistent
        }
      }
    })
  })
  
  // Print summary to console
  console.log('\n--- Performance Trend Analysis ---')
  console.log(`Analyzed ${allResults.length} benchmark runs from ${new Date(allResults[0].timestamp).toLocaleDateString()} to ${new Date(allResults[allResults.length - 1].timestamp).toLocaleDateString()}`)
  
  // Find top improvements and regressions
  const allCases = []
  Object.entries(trend.suites).forEach(([suiteName, suite]) => {
    Object.entries(suite.cases).forEach(([caseName, caseData]) => {
      if (caseData.trends.overall) {
        allCases.push({
          suite: suiteName,
          name: caseName,
          changePercent: caseData.trends.overall.changePercent,
          direction: caseData.trends.overall.direction
        })
      }
    })
  })
  
  // Sort cases by change percentage
  allCases.sort((a, b) => b.changePercent - a.changePercent)
  
  const improvements = allCases.filter(c => c.direction === 'improvement')
  const regressions = allCases.filter(c => c.direction === 'regression')
  
  console.log(`\nTop Improvements (${improvements.length} total):`)
  improvements.slice(0, 5).forEach(imp => {
    console.log(`- ${imp.suite} / ${imp.name}: +${imp.changePercent.toFixed(2)}%`)
  })
  
  console.log(`\nTop Regressions (${regressions.length} total):`)
  regressions.slice(0, 5).forEach(reg => {
    console.log(`- ${reg.suite} / ${reg.name}: ${reg.changePercent.toFixed(2)}%`)
  })
  
  // Find cases with inconsistent performance
  const inconsistent = allCases.filter(c => {
    const caseData = trend.suites[c.suite].cases[c.name]
    return caseData.trends.consistency && !caseData.trends.consistency.isConsistent
  })
  
  if (inconsistent.length > 0) {
    console.log(`\nInconsistent Performance:`)
    inconsistent.slice(0, 5).forEach(inc => {
      const stdDev = trend.suites[inc.suite].cases[inc.name].trends.consistency.relativeStdDev.toFixed(2)
      console.log(`- ${inc.suite} / ${inc.name}: ±${stdDev}% variation`)
    })
  }
  
  // If an output path is provided, save the trend data
  if (outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(trend, null, 2))
    console.log(`Trend report saved to ${outputPath}`)
  }
  
  return trend
}

// Check if the script is being run directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2)
  const command = args[0]
  
  if (command === 'analyze' && args[1]) {
    analyzeResults(args[1])
  } else if (command === 'compare' && args[1] && args[2]) {
    compareResults(args[1], args[2])
  } else if (command === 'trend') {
    // Get all benchmark files, sorted by timestamp (oldest first)
    const files = fs.readdirSync(resultsDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(resultsDir, file))
      .sort((a, b) => {
        const fileA = JSON.parse(fs.readFileSync(a, 'utf8'))
        const fileB = JSON.parse(fs.readFileSync(b, 'utf8'))
        return new Date(fileA.timestamp) - new Date(fileB.timestamp)
      })
    
    if (files.length >= 2) {
      createTrendReport(files, path.join(resultsDir, 'trend-report.json'))
    } else {
      console.error('Need at least two benchmark files for trend analysis')
    }
  } else if (command === 'latest') {
    // Analyze the most recent benchmark file
    const latestFile = findMostRecentResults()
    if (latestFile) {
      analyzeResults(latestFile)
    } else {
      console.error('No benchmark results found')
    }
  } else {
    console.log('Usage:')
    console.log('  analyze <filename> - Analyze a benchmark results file')
    console.log('  compare <file1> <file2> - Compare two benchmark result files')
    console.log('  trend - Analyze performance trends across all benchmark files')
    console.log('  latest - Analyze the most recent benchmark results')
  }
} else {
  // Export the API for use in other files
  module.exports = {
    analyzeResults,
    compareResults,
    createTrendReport,
    findMostRecentResults
  }
}