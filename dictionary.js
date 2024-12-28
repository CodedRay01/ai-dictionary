class AIDictionary {
    constructor() {
        // API Configuration
        this.apiKey = 'AIzaSyDpv9Q1I8wRpQbEycl3giatZ3ZkubR5vcs';
        this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + this.apiKey;
        
        // Initialize Components
        this.initializeEventListeners();
        this.historyManager = new SearchHistoryManager();
        this.setupModalHandlers();
    }

    // Initialize Event Listeners
    initializeEventListeners() {
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchInput');
        const pronunciationBtn = document.getElementById('pronunciationBtn');
        const historyBtn = document.getElementById('historyBtn');

        // Search Button Event
        searchBtn.addEventListener('click', () => this.handleSearch());

        // Enter Key Support
        searchInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Pronunciation Button
        pronunciationBtn.addEventListener('click', () => alert("This feaurure will be avaliable soon.\n Regards codedray01 "));

        // History Button
        historyBtn.addEventListener('click', () => this.showSearchHistory());
    }

    // Setup Modal Handlers
    setupModalHandlers() {
        const historyModal = document.getElementById('historyModal');
        const closeModalBtn = document.querySelector('.close-modal');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        const closeHistoryBtn = document.getElementById('closeHistoryBtn');

        closeModalBtn.addEventListener('click', () => this.closeModal());
        clearHistoryBtn.addEventListener('click', () => this.clearSearchHistory());
        closeHistoryBtn.addEventListener('click', () => this.closeModal());
    }

    // Comprehensive Search Handler
    async handleSearch() {
        const searchInput = document.getElementById('searchInput');
        const resultContainer = document.getElementById('resultContainer');
        const word = searchInput.value.trim();

        // Input Validation
        if (!word) {
            this.displayError('Please enter a word');
            return;
        }

        // Loading State
        resultContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Searching for "${word}"...</p>
            </div>
        `;

        try {
            // Fetch Definition
            const definition = await this.fetchDefinition(word);
            
            // Update Result
            this.displayDefinition(word, definition);
            
            // Save to History
            this.historyManager.addToHistory(word);
        } catch (error) {
            this.displayError('Unable to fetch definition');
        }
    }

    // Secure Definition Fetching
    async fetchDefinition(word) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Provide a comprehensive definition for: ${word}`
                        }]
                    }]
                })
            });

            // Validate Response
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return this.parseDefinition(data);

        } catch (error) {
            console.error('Definition Fetch Error:', error);
            throw error;
        }
    }

    // Parse Gemini Response
    parseDefinition(data) {
        try {
            return data.candidates[0].content.parts[0].text || 
                   'No definition available for this word.';
        } catch (error) {
            console.error('Definition Parsing Error:', error);
            return 'Unable to parse definition';
        }
    }

    // Display Definition
    displayDefinition(word, definition) {
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.innerHTML = `
            <div class="definition-container">
                <h3>${word.toUpperCase()}</h3>
                <p>${definition}</p>
            </div>
        `;
    }

    // Error Display
    displayError(message) {
        const resultContainer = document.getElementById('resultContainer');
        resultContainer.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
            </div>
        `;
    }

    // Pronunciation Handler
    handlePronunciation() {
        const word = document.getElementById('searchInput').value.trim();
        if (word) {
            this.speakWord(word);
        }
    }

    // Text-to-Speech
    speakWord(word) {
        const utterance = new SpeechSynthesisUtterance(word);
        window.speechSynthesis.speak(utterance);
    }

    // Search History Management
    showSearchHistory() {
        const history = this.historyManager.getHistory();
        const historyModal = document.getElementById('historyModal');
        const historyList = document.getElementById('historyList');

        historyList.innerHTML = history.map(word => `
            <li>
                ${word}
                <button class="remove-history-item" data-word="${word}">
                    <i class="fas fa-trash"></i>
                </button>
            </li>
        `).join('');

        historyModal.style.display = 'flex';
    }

    // Close Modal
    closeModal() {
        document.getElementById('historyModal').style.display = 'none';
    }

    // Clear Search History
    clearSearchHistory() {
        this.historyManager.clearHistory();
        this.showSearchHistory();
    }
}

// Search History Manager
class SearchHistoryManager {
    constructor() {
        this.historyKey = 'dictionarySearchHistory';
    }

    addToHistory(word) {
        let history = this.getHistory();
        if (!history.includes(word)) {
            history.unshift(word);
            history = history.slice(0, 20); // Limit to 20 items
            this.saveHistory(history);
        }
    }

    getHistory() {
        return JSON.parse(localStorage.getItem(this.historyKey) || '[]');
    }

    saveHistory(history) {
        localStorage.setItem(this.historyKey, JSON.stringify(history));
    }

    clearHistory() {
        localStorage.removeItem(this.historyKey);
    }
}

// Initialize Dictionary on Page Load
document.addEventListener('DOMContentLoaded', () => {
    new AIDictionary();
});
            
