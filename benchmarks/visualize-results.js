/**
 * Benchmark Results Visualization Tool
 * 
 * This script generates HTML visualizations of benchmark results.
 */

const fs = require('fs')
const path = require('path')

// Default location for results
const resultsDir = path.join(__dirname, 'results')

/**
 * Generate an HTML report for a benchmark results file
 * @param {string} filePath - Path to the benchmark results JSON file
 * @param {string} outputPath - Path to write the HTML output (optional)
 */
function generateReport(filePath, outputPath) {
  // If no output path provided, create one based on input name
  if (!outputPath) {
    const baseName = path.basename(filePath, '.json')
    outputPath = path.join(path.dirname(filePath), `${baseName}.html`)
  }
  
  console.log(`Generating report from ${filePath}...`)
  
  // Read the benchmark results
  const results = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  
  // Create HTML
  const html = generateHtml(results)
  
  // Write output file
  fs.writeFileSync(outputPath, html)
  
  console.log(`Report written to ${outputPath}`)
}

/**
 * Generate HTML visualization from benchmark results
 * @param {Object} results - The benchmark results object
 * @returns {string} HTML content
 */
function generateHtml(results) {
  const title = `Math-JS Benchmark Results (${results.timestamp})`
  
  // Extract system info
  const systemInfo = results.system
  
  // Extract suite data
  const suites = Object.entries(results.suites).map(([name, data]) => ({
    name,
    totalDuration: data.totalDuration,
    caseCount: Object.keys(data.cases).length,
    cases: Object.entries(data.cases).map(([caseName, caseData]) => ({
      name: caseName,
      opsPerSecond: caseData.opsPerSecond,
      avgTime: caseData.avgTime,
      relativeStdDev: caseData.relativeStdDev * 100, // Convert to percentage
      avgMemory: caseData.avgMemory
    }))
  }))
  
  // Generate HTML
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f7;
    }
    h1, h2, h3 {
      color: #0066cc;
    }
    .card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 20px;
      margin-bottom: 20px;
    }
    .chart-container {
      height: 400px;
      margin: 20px 0;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .info-item {
      background: #f0f8ff;
      padding: 10px;
      border-radius: 4px;
    }
    .info-item h4 {
      margin: 0 0 5px 0;
      font-size: 0.9rem;
      color: #666;
    }
    .info-item p {
      margin: 0;
      font-weight: bold;
      font-size: 1.1rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      text-align: left;
      padding: 10px;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    tr:hover {
      background-color: #f5f5f5;
    }
    .performance-scale {
      display: flex;
      width: 100%;
      height: 20px;
      margin-top: 5px;
      background: linear-gradient(to right, #ff4e50, #fcb69f, #8dc26f, #2ebf91);
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <h1>Math-JS Benchmark Results</h1>
  
  <div class="card">
    <h2>System Information</h2>
    <div class="info-grid">
      <div class="info-item">
        <h4>Library Version</h4>
        <p>${results.libraryVersion}</p>
      </div>
      <div class="info-item">
        <h4>Node Version</h4>
        <p>${systemInfo.nodeVersion}</p>
      </div>
      <div class="info-item">
        <h4>Platform</h4>
        <p>${systemInfo.platform} (${systemInfo.arch})</p>
      </div>
      <div class="info-item">
        <h4>CPU Cores</h4>
        <p>${systemInfo.cpuCores}</p>
      </div>
      <div class="info-item">
        <h4>Total Memory</h4>
        <p>${(systemInfo.totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB</p>
      </div>
      <div class="info-item">
        <h4>Timestamp</h4>
        <p>${new Date(results.timestamp).toLocaleString()}</p>
      </div>
    </div>
  </div>
  
  <div class="card">
    <h2>Performance Summary</h2>
    <div class="chart-container">
      <canvas id="suitesDurationChart"></canvas>
    </div>
  </div>
  
  ${suites.map(suite => `
  <div class="card">
    <h2>${suite.name}</h2>
    <p>Total Duration: ${(suite.totalDuration / 1000).toFixed(2)}s | Cases: ${suite.caseCount}</p>
    
    <div class="chart-container">
      <canvas id="opsChart_${sanitizeId(suite.name)}"></canvas>
    </div>
    
    <h3>Performance Details</h3>
    <table>
      <thead>
        <tr>
          <th>Case</th>
          <th>Ops/Sec</th>
          <th>Avg. Time (ms)</th>
          <th>Std Dev</th>
          <th>Memory (MB)</th>
        </tr>
      </thead>
      <tbody>
        ${suite.cases.map(c => `
          <tr>
            <td>${c.name}</td>
            <td>${c.opsPerSecond.toFixed(2)}</td>
            <td>${c.avgTime.toFixed(4)}</td>
            <td>±${c.relativeStdDev.toFixed(2)}%</td>
            <td>${c.avgMemory ? (c.avgMemory / 1024 / 1024).toFixed(2) : 'N/A'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
  `).join('')}

  <script>
    // Set up Chart.js
    Chart.register(ChartDataLabels);
    
    // Colors for charts
    const colors = [
      '#4dc9f6', '#f67019', '#f53794', '#537bc4', '#acc236',
      '#166a8f', '#00a950', '#58595b', '#8549ba', '#4dc9f6',
      '#f67019', '#f53794', '#537bc4', '#acc236', '#166a8f'
    ];
    
    // Suites Duration Chart
    new Chart(document.getElementById('suitesDurationChart'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(suites.map(s => s.name))},
        datasets: [{
          label: 'Duration (seconds)',
          data: ${JSON.stringify(suites.map(s => (s.totalDuration / 1000).toFixed(2)))},
          backgroundColor: colors.slice(0, ${suites.length}),
          borderWidth: 1
        }]
      },
      options: {
        plugins: {
          datalabels: {
            color: '#fff',
            font: {
              weight: 'bold'
            },
            formatter: (value) => value + 's'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Duration (seconds)'
            }
          }
        }
      }
    });
    
    ${suites.map(suite => `
    // Operations per second chart for ${suite.name}
    new Chart(document.getElementById('opsChart_${sanitizeId(suite.name)}'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(suite.cases.map(c => c.name))},
        datasets: [{
          label: 'Operations per second',
          data: ${JSON.stringify(suite.cases.map(c => c.opsPerSecond.toFixed(2)))},
          backgroundColor: colors.slice(0, ${suite.cases.length}),
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        plugins: {
          datalabels: {
            anchor: 'end',
            align: 'right',
            formatter: (value) => value + ' ops/sec'
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Operations per second'
            }
          }
        }
      }
    });
    `).join('')}
  </script>
</body>
</html>`
}

/**
 * Sanitize a string to be used as an HTML ID
 * @param {string} str - The string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeId(str) {
  return str.replace(/[^a-zA-Z0-9]/g, '_')
}

/**
 * Generate reports for all JSON files in the results directory
 */
function generateAllReports() {
  console.log('Generating reports for all benchmark results...')
  
  // Create results directory if it doesn't exist
  if (!fs.existsSync(resultsDir)) {
    console.log('No results directory found. Nothing to visualize.')
    return
  }
  
  // Get all JSON files
  const files = fs.readdirSync(resultsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(resultsDir, file))
  
  if (files.length === 0) {
    console.log('No benchmark result files found.')
    return
  }
  
  // Generate a report for each file
  let count = 0
  for (const file of files) {
    try {
      generateReport(file)
      count++
    } catch (err) {
      console.error(`Error generating report for ${file}:`, err)
    }
  }
  
  console.log(`Generated ${count} reports.`)
}

// Check if the script is being run directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2)
  
  if (args.length > 0) {
    // Generate a report for the specified file
    generateReport(args[0])
  } else {
    // Generate reports for all files
    generateAllReports()
  }
} else {
  // Export the API for use in other files
  module.exports = {
    generateReport,
    generateAllReports
  }
}