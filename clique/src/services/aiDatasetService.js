// AI Dataset Service for ChatBot
// Handles CSV dataset loading and intent matching

class AIDatasetService {
  constructor() {
    this.dataset = null
    this.intentMap = new Map()
    this.isLoaded = false
    this.similarityThreshold = 0.5; // Adjust this threshold as needed
  }

  // Load the CSV dataset
  async loadDataset() {
    if (this.isLoaded) return

    try {
      console.log('Loading AI dataset from /chat-dataset/Clique.csv...')
      const response = await fetch('/chat-dataset/Clique.csv')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const csvText = await response.text()
      console.log('CSV text loaded, length:', csvText.length)
      console.log('First 500 characters:', csvText.substring(0, 500))
      
      this.dataset = this.parseCSV(csvText)
      this.buildIntentMap()
      
      console.log(`AI dataset loaded successfully: ${this.dataset.length} entries`)
      console.log('Sample entries:', this.dataset.slice(0, 3))
      console.log('Available intents:', Array.from(this.intentMap.keys()).slice(0, 10))
      this.isLoaded = true
    } catch (error) {
      console.error('Error loading AI dataset:', error)
      this.dataset = []
    }
  }

  // Parse CSV text into array of objects
  parseCSV(csvText) {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    return lines.slice(1).map(line => {
      const values = this.parseCSVLine(line)
      const entry = {}
      headers.forEach((header, index) => {
        entry[header] = values[index] || ''
      })
      return entry
    }).filter(entry => entry['User Query'] && entry['Intent'] && entry['Response'])
  }

  // Parse CSV line handling quoted values
  parseCSVLine(line) {
    const result = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Handle escaped quotes
          current += '"'
          i++ // Skip next quote
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current.trim())
    return result
  }

  // Build intent map for faster lookup
  buildIntentMap() {
    this.intentMap.clear()
    
    this.dataset.forEach(entry => {
      const intent = entry['Intent']
      if (!this.intentMap.has(intent)) {
        this.intentMap.set(intent, [])
      }
      this.intentMap.get(intent).push(entry)
    })
    
    console.log(`Intent map built: ${this.intentMap.size} intents`)
  }

  // Find best matching response for user query
  async findBestResponse(userQuery) {
    if (!this.isLoaded) {
      await this.loadDataset()
    }

    if (!this.dataset || this.dataset.length === 0) {
      console.log('No dataset available for query:', userQuery)
      return {
        Intent: 'fallback',
        Response: "I'm sorry, I couldn't find an answer. Could you please clarify or rephrase your question?"
      }
    }

    const query = userQuery.toLowerCase().trim()
    console.log('Searching for query:', query)
    console.log('Dataset size:', this.dataset.length)
    
    // First, try exact or very close matches
    let bestMatch = this.findExactMatch(query)
    if (bestMatch) {
      console.log('Found exact match:', bestMatch['Intent'])
      return bestMatch
    }

    // Then try keyword-based matching
    bestMatch = this.findKeywordMatch(query)
    if (bestMatch) {
      console.log('Found keyword match:', bestMatch['Intent'])
      return bestMatch
    }
    
    //Finally, try fuzzy matching
    bestMatch = this.findFuzzyMatch(query)
    if (bestMatch) {
      console.log('Found fuzzy match:', bestMatch['Intent'])
      return bestMatch
    }
    
    
    // 🔴 No match found - return fallback message
    console.log('No match found for query:', userQuery)
    return {
      Intent: 'fallback',
      Response: "I didn't quite understand that. Could you please clarify or be more specific?"
    }
  }

  // Find exact or very close matches
  findExactMatch(query) {
    for (const entry of this.dataset) {
      const datasetQuery = entry['User Query'].toLowerCase().trim()
      
      // Exact match
      if (datasetQuery === query) {
        return entry
      }
      
      // Very close match (90% similarity)
      if (this.calculateSimilarity(query, datasetQuery) > 0.9) {
        return entry
      }
    }
    return null
  }

  // Find matches based on keywords
  findKeywordMatch(query) {
    const queryWords = this.extractKeywords(query)
    let bestMatch = null
    let bestScore = 0

    console.log('Query keywords:', queryWords)

    for (const entry of this.dataset) {
      const datasetQuery = entry['User Query'].toLowerCase()
      const datasetWords = this.extractKeywords(datasetQuery)
      
      const score = this.calculateKeywordScore(queryWords, datasetWords)
      
      if (score > bestScore && score > 0.1) { // Lowered threshold from 0.2 to 0.1
        bestScore = score
        bestMatch = entry
        console.log(`Better match found: "${entry['User Query']}" (score: ${score.toFixed(2)})`)
      }
    }

    console.log('Best keyword match score:', bestScore)
    return bestMatch
  }

  // Find matches using fuzzy string matching
  findFuzzyMatch(query) {
    let bestMatch = null;
    let bestScore = 0;

    for (const entry of this.dataset) {
        const datasetQuery = entry['User Query'].toLowerCase();
        const score = this.calculateSimilarity(query, datasetQuery);

        if (score > this.similarityThreshold) { // Use the defined threshold
            bestScore = score;
            bestMatch = entry;
            console.log(`Better fuzzy match found: "${entry['User Query']}" (score: ${score.toFixed(2)})`);
        }
    }

    console.log('Best fuzzy match score:', bestScore);
    return bestMatch;
}

  // Extract keywords from text
  extractKeywords(text) {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'how', 'what', 'where', 'when', 'why', 'who', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
      'might', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us',
      'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their', 'get', 'got', 'getting'
    ])

    return text
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 2 && !stopWords.has(word))
  }

  // Calculate keyword-based similarity score
  calculateKeywordScore(queryWords, datasetWords) {
    if (queryWords.length === 0 || datasetWords.length === 0) return 0

    const querySet = new Set(queryWords)
    const datasetSet = new Set(datasetWords)
    
    const intersection = new Set([...querySet].filter(x => datasetSet.has(x)))
    const union = new Set([...querySet, ...datasetSet])
    
    return intersection.size / union.size
  }

  // Calculate string similarity using Levenshtein distance
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    
    if (longer.length === 0) return 1.0
    
    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  // Calculate Levenshtein distance between two strings
  levenshteinDistance(str1, str2) {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  // Get all available intents
  getAvailableIntents() {
    return Array.from(this.intentMap.keys())
  }

  // Get sample queries for an intent
  getSampleQueries(intent) {
    const entries = this.intentMap.get(intent)
    return entries ? entries.slice(0, 5).map(entry => entry['User Query']) : []
  }

  // Get response for specific intent
  getResponseForIntent(intent) {
    const entries = this.intentMap.get(intent)
    return entries ? entries[0]['Response'] : null
  }

  // Test function to verify dataset is working
  async testDataset() {
    if (!this.isLoaded) {
      await this.loadDataset()
    }
    
    console.log('=== DATASET TEST ===')
    console.log('Dataset loaded:', this.isLoaded)
    console.log('Dataset size:', this.dataset ? this.dataset.length : 0)
    
    if (this.dataset && this.dataset.length > 0) {
      console.log('First entry:', this.dataset[0])
      console.log('Available intents:', Array.from(this.intentMap.keys()))
      
      // Test a simple query
      const testQuery = 'How do I get a barangay clearance?'
      console.log('Testing query:', testQuery)
      
      const response = await this.findBestResponse(testQuery)
      if (response) {
        console.log('✅ Test successful!')
        console.log('Intent:', response['Intent'])
        console.log('Response:', response['Response'])
      } else {
        console.log('❌ Test failed - no response found')
      }
    }
    console.log('=== END TEST ===')
  }
}

// Create singleton instance
const aiDatasetService = new AIDatasetService()

export default aiDatasetService
