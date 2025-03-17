class TeenPatti {
    constructor() {
        this.players = [];
        this.currentPlayer = 0;
        this.pot = 0;
        this.currentStake = 10;
        this.gameStarted = false;
        
        this.suits = ['♠', '♥', '♦', '♣'];
        this.values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        document.getElementById('startGame').addEventListener('click', () => {
            const playerCount = parseInt(prompt('How many players? (2-6)', '4'));
            if (playerCount >= 2 && playerCount <= 6) {
                this.initializePlayers(playerCount);
                this.startNewGame();
            } else {
                alert('Please enter a number between 2 and 6');
            }
        });
        
        document.querySelectorAll('.see-cards').forEach((button, index) => {
            button.addEventListener('click', () => this.seeCards(index));
        });
        
        document.querySelectorAll('.place-bet').forEach((button, index) => {
            button.addEventListener('click', () => this.placeBet(index));
        });
        
        document.querySelectorAll('.fold').forEach((button, index) => {
            button.addEventListener('click', () => this.fold(index));
        });
    }

    initializePlayers(count) {
        this.players = Array.from({ length: count }, (_, i) => ({
            id: i + 1,
            name: `Player ${i + 1}`,
            cards: [],
            isSeen: false,
            chips: 1000,
            isActive: true
        }));

        // Update the players container in the DOM
        const container = document.querySelector('.players-container');
        container.innerHTML = ''; // Clear existing players

        this.players.forEach((player, index) => {
            const playerElement = document.createElement('div');
            playerElement.className = 'player';
            playerElement.id = `player${index + 1}`;
            playerElement.innerHTML = `
                <div class="player-info">
                    <h2>${player.name}</h2>
                    <div class="chips">Chips: $<span class="chips-amount">1000</span></div>
                </div>
                <div class="cards"></div>
                <div class="controls hidden">
                    <button class="btn btn-blue see-cards">See Cards</button>
                    <button class="btn btn-green place-bet">Bet</button>
                    <button class="btn btn-red fold">Fold</button>
                </div>
            `;
            container.appendChild(playerElement);
        });

        // Reattach event listeners after creating new player elements
        this.initializeEventListeners();
    }

    createDeck() {
        const deck = [];
        for (const suit of this.suits) {
            this.values.forEach((value, index) => {
                deck.push({
                    suit,
                    value,
                    rank: index + 2
                });
            });
        }
        return deck;
    }

    shuffleDeck(deck) {
        const shuffled = [...deck];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    dealCards() {
        const deck = this.shuffleDeck(this.createDeck());
        this.players.forEach((player, index) => {
            player.cards = deck.slice(index * 3, (index + 1) * 3);
        });
    }

    startNewGame() {
        this.gameStarted = true;
        this.currentPlayer = 0;
        this.pot = this.players.length * this.currentStake;
        
        // Reset all player states for the new game
        this.players.forEach(player => {
            player.chips -= this.currentStake;
            player.isSeen = false;
            player.isActive = true;
            player.cards = [];
        });
        
        this.dealCards();
        
        // Reset UI elements
        document.querySelectorAll('.see-cards').forEach(button => {
            button.classList.remove('hidden');
        });
        
        document.getElementById('startGame').classList.add('hidden');
        document.getElementById('gameInfo').classList.remove('hidden');
        
        this.updateUI();
    }

    seeCards(playerIndex) {
        if (playerIndex === this.currentPlayer && this.players[playerIndex].isActive) {
            this.players[playerIndex].isSeen = true;
            this.updateUI();
        }
    }

    placeBet(playerIndex) {
        if (playerIndex === this.currentPlayer && this.players[playerIndex].isActive) {
            const betAmount = this.players[playerIndex].isSeen ? this.currentStake * 2 : this.currentStake;
            
            if (this.players[playerIndex].chips >= betAmount) {
                this.players[playerIndex].chips -= betAmount;
                this.pot += betAmount;
                this.currentStake = betAmount;
                this.nextPlayer();
            }
        }
    }

    fold(playerIndex) {
        if (playerIndex === this.currentPlayer && this.players[playerIndex].isActive) {
            this.players[playerIndex].isActive = false;
            this.nextPlayer();
        }
    }

    nextPlayer() {
        do {
            this.currentPlayer = (this.currentPlayer + 1) % this.players.length;
        } while (!this.players[this.currentPlayer].isActive);
        
        const activePlayers = this.players.filter(p => p.isActive).length;
        if (activePlayers === 1) {
            this.endGame();
        }
        
        this.updateUI();
    }

    endGame() {
        const winner = this.players.find(p => p.isActive);
        winner.chips += this.pot;
        this.pot = 0;
        this.gameStarted = false;
        
        setTimeout(() => {
            alert(`${winner.name} wins $${this.pot}!`);
            document.getElementById('startGame').classList.remove('hidden');
            
            // Reset all controls visibility for the next game
            document.querySelectorAll('.controls').forEach(control => {
                control.classList.add('hidden');
            });
        }, 100);
    }

    updateUI() {
        // Update pot and stake
        document.getElementById('potAmount').textContent = this.pot;
        document.getElementById('currentStake').textContent = this.currentStake;
        
        // Update each player's display
        this.players.forEach((player, index) => {
            const playerElement = document.getElementById(`player${index + 1}`);
            
            // Update chips
            playerElement.querySelector('.chips-amount').textContent = player.chips;
            
            // Update cards
            const cardsContainer = playerElement.querySelector('.cards');
            cardsContainer.innerHTML = '';
            
            if (player.isActive) {
                player.cards.forEach(card => {
                    const cardElement = document.createElement('div');
                    cardElement.className = `card ${!player.isSeen ? 'hidden' : ''}`;
                    
                    if (player.isSeen) {
                        cardElement.innerHTML = `${card.value}${card.suit}`;
                        if (card.suit === '♥' || card.suit === '♦') {
                            cardElement.classList.add('suit-red');
                        }
                    } else {
                        cardElement.textContent = '?';
                    }
                    
                    cardsContainer.appendChild(cardElement);
                });
            }
            
            // Update controls visibility
            const controls = playerElement.querySelector('.controls');
            controls.classList.toggle('hidden', !this.gameStarted || index !== this.currentPlayer || !player.isActive);
            
            // Update active player highlight
            playerElement.classList.toggle('active', index === this.currentPlayer && player.isActive);
            
            // Show/hide see cards button based on current state
            const seeCardsButton = controls.querySelector('.see-cards');
            if (player.isSeen) {
                seeCardsButton.classList.add('hidden');
            } else {
                seeCardsButton.classList.remove('hidden');
            }
        });
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TeenPatti();
});