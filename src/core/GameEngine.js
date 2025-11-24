/**
 * GameEngine.js
 * Central controller for the game loop and state management.
 */

import { Unit } from '../entities/Unit.js';
import { CardSystem } from '../systems/CardSystem.js';
import { RelicSystem } from '../systems/RelicSystem.js';

export class GameEngine {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.cardSystem = new CardSystem();
        this.relicSystem = new RelicSystem();

        // Game State
        this.isPaused = false;
        this.turnIntervalId = null;
        this.turnDuration = 5000; // 5 seconds
        this.turnTimer = 0;

        // Statistics
        this.turnCount = 0;
        this.totalBingos = 0;

        // Entities
        this.golem = new Unit("Golem", 300, 0);
        this.golem.baseAttack = 2;
        this.golem.baseShield = 2;

        this.minions = [
            new Unit("Minion 1", 100, 0),
            new Unit("Minion 2", 100, 0),
            new Unit("Minion 3", 100, 0)
        ];

        // Init Minion Stats
        this.minions.forEach(m => {
            m.baseAttack = 8;
            m.baseDefense = 8;
        });

        // Bindings
        this.runTurn = this.runTurn.bind(this);
    }

    init() {
        this.uiManager.bindEvents(this);
        this.uiManager.render(this.getGameState());
        console.log("Game Initialized.");
    }

    startBattle() {
        if (this.turnIntervalId) return;

        console.log("Battle Started!");
        this.isPaused = false;
        this.runTurn(); // Run first turn immediately
        this.turnIntervalId = setInterval(this.runTurn, this.turnDuration);

        // Start Timer Animation
        this.uiManager.startTimer(this.turnDuration);
    }

    restart() {
        // Reset Stats
        this.turnCount = 0;
        this.totalBingos = 0;

        // Reset Entities
        this.golem = new Unit("Golem", 300, 0);
        this.golem.baseAttack = 2;
        this.golem.baseShield = 2;

        this.minions = [
            new Unit("Minion 1", 100, 0),
            new Unit("Minion 2", 100, 0),
            new Unit("Minion 3", 100, 0)
        ];

        this.minions.forEach(m => {
            m.baseAttack = 8;
            m.baseDefense = 8;
        });

        // Reset System
        this.cardSystem.initDeck();
        this.cardSystem.grid = [];
        this.cardSystem.discardPile = [];

        // UI Reset
        this.uiManager.hideGameOver();
        this.uiManager.log("--- 게임 재시작 ---");

        // Start
        this.startBattle();
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            clearInterval(this.turnIntervalId);
            this.turnIntervalId = null;
            this.uiManager.setInputsDisabled(false); // Enable editing
            console.log("Game Paused.");
        } else {
            // Resume
            // Sync state first
            this.syncStateFromUI();

            this.uiManager.setInputsDisabled(true); // Disable editing
            this.runTurn();
            this.turnIntervalId = setInterval(this.runTurn, this.turnDuration);
            console.log("Game Resumed.");
        }

        this.uiManager.updatePauseButton(this.isPaused);
    }

    syncStateFromUI() {
        const inputState = this.uiManager.getInputsState();

        // Sync Golem
        if (inputState.golem) this.golem.syncState(inputState.golem);

        // Sync Minions
        inputState.minions.forEach((mState, idx) => {
            if (this.minions[idx]) this.minions[idx].syncState(mState);
        });

        this.uiManager.render(this.getGameState());
    }

    async runTurn() {
        if (this.isPaused) return;

        this.turnCount++;
        console.log(`--- Turn ${this.turnCount} Start ---`);
        this.uiManager.log(`--- 턴 ${this.turnCount} 시작 ---`);
        this.uiManager.resetTimer();
        this.uiManager.startTimer(this.turnDuration);

        // 1. Reset Turn Stats
        this.golem.resetTurnStats();
        this.golem.totalDamageThisTurn = 0;
        this.minions.forEach(m => m.resetTurnStats());

        // 2. Minion Intent (Random for now)
        this.minions.forEach(m => {
            if (!m.isAlive) {
                m.intent = null;
                return;
            }
            const roll = Math.random();
            if (roll < 0.6) m.intent = 'ATTACK';
            else if (roll < 0.8) m.intent = 'DEFEND';
            else m.intent = 'BUFF';

            // Immediate Defense Effect
            if (m.intent === 'DEFEND') {
                m.addBlock(m.baseDefense);
            }
        });

        // Render Intents
        this.uiManager.render(this.getGameState());

        // 3. Draw Grid
        const grid = this.cardSystem.drawGrid();
        this.uiManager.renderGrid(grid);

        // 4. Activate Cards (Sequential Delay)
        await this.activateCards(grid);

        // 5. Check Bingos
        const bingos = this.cardSystem.checkBingos();
        this.applyBingoEffects(bingos);

        // Discard Grid AFTER bingo checks
        this.cardSystem.discardGrid();

        // 6. Minion Actions
        this.executeMinionActions();

        // 7. Check Game Over
        this.checkGameOver();

        // Final Render
        this.uiManager.render(this.getGameState());
    }

    async activateCards(grid) {
        for (const card of grid) {
            if (this.isPaused) break; // Stop if paused mid-animation

            await new Promise(r => setTimeout(r, 150)); // Delay
            this.uiManager.highlightCard(card.id);

            // Effect
            this.triggerCardEffect(card);
            this.uiManager.render(this.getGameState()); // Update stats
        }
        // Removed discardGrid from here
    }

    triggerCardEffect(card) {
        let logMsg = "";
        switch (card.type) {
            case 'FIRE':
                const dmg = this.golem.baseAttack; // Simplified
                const target = this.getRandomTarget();
                if (target) {
                    const taken = target.takeDamage(dmg);
                    this.golem.totalDamageThisTurn += taken;
                    logMsg = `🔥 불 카드: ${target.name}에게 ${taken} 피해`;
                }
                break;
            case 'EARTH':
                const block = this.golem.baseShield;
                this.golem.addBlock(block);
                logMsg = `🌱 대지 카드: 골렘 방어도 +${block}`;
                break;
            case 'WATER':
                const heal = Math.floor(this.golem.maxHp / 8);
                const healed = this.golem.heal(heal);
                logMsg = `💧 물 카드: 골렘 체력 +${healed}`;
                break;
            case 'WIND':
                // 50% Buff Golem / 50% Debuff Enemy
                if (Math.random() < 0.5) {
                    this.golem.attackBuffs = Math.min(this.golem.attackBuffs + 1, 2);
                    logMsg = `🍃 바람 카드: 골렘 공격 버프 +1`;
                } else {
                    const t = this.getRandomTarget();
                    if (t) {
                        t.attackDebuffs = Math.min(t.attackDebuffs + 1, 2);
                        logMsg = `🍃 바람 카드: ${t.name} 공격 디버프 +1`;
                    }
                }
                break;

        }
        if (logMsg) this.uiManager.log(logMsg);
    }

    applyBingoEffects(bingos) {
        // bingos is now an array of { type, ids }

        for (const bingo of bingos) {
            this.totalBingos++;

            // Highlight ONLY the cards in this bingo line
            this.uiManager.highlightBingoCards(bingo.ids);

            if (bingo.type === 'HARMONY') {
                this.uiManager.log(`🌈 조화(Harmony) 빙고!`);

                const dmg = 10;
                const blk = 10;

                this.minions.forEach(m => {
                    if (m.isAlive) m.takeDamage(dmg);
                });
                this.golem.addBlock(blk);
                this.uiManager.log(`>> 🌈 조화 효과: 모든 적 -${dmg} HP, 골렘 +${blk} 방어`);

            } else {
                // Element Bingo
                const type = bingo.type;
                this.uiManager.log(`✨ ${type} 빙고!`);

                if (type === 'FIRE') {
                    const dmg = this.golem.baseAttack * 2;
                    const t = this.getRandomTarget();
                    if (t) {
                        t.takeDamage(dmg);
                        this.uiManager.log(`>> 🔥 빙고 피해: ${t.name}에게 ${dmg}`);
                    }
                } else if (type === 'EARTH') {
                    const blk = this.golem.baseShield * 2;
                    this.golem.addBlock(blk);
                    this.uiManager.log(`>> 🌱 빙고 방어: +${blk}`);
                } else if (type === 'WATER') {
                    const heal = Math.floor(this.golem.maxHp / 10);
                    const healed = this.golem.heal(heal);
                    this.uiManager.log(`>> 💧 빙고 회복: +${healed}`);
                } else if (type === 'WIND') {
                    this.golem.attackBuffs += 1;
                    this.uiManager.log(`>> 🍃 빙고 버프: 공격 +1`);
                }
            }
        }
    }

    executeMinionActions() {
        this.minions.forEach(m => {
            if (!m.isAlive) return;

            if (m.intent === 'ATTACK') {
                const dmg = m.baseAttack; // Simplified
                const taken = this.golem.takeDamage(dmg);
                this.uiManager.log(`⚔️ ${m.name} 공격! ${dmg} 피해 (실제: ${taken})`);
                m.block = 0; // Reset block after attack
            } else if (m.intent === 'BUFF') {
                m.baseAttack += 2;
                m.baseDefense += 2;
                this.uiManager.log(`💪 ${m.name} 강화 (+2/+2)`);
            }
        });
    }


    getRandomTarget() {
        const alive = this.minions.filter(m => m.isAlive);
        if (alive.length === 0) return null;
        return alive[Math.floor(Math.random() * alive.length)];
    }

    checkGameOver() {
        if (!this.golem.isAlive) {
            this.endGame(false);
        } else if (this.minions.every(m => !m.isAlive)) {
            this.endGame(true);
        }
    }

    endGame(victory) {
        clearInterval(this.turnIntervalId);
        this.turnIntervalId = null;
        this.uiManager.log(victory ? "🏆 승리!" : "💀 패배!");

        const stats = {
            turnCount: this.turnCount,
            totalBingos: this.totalBingos
        };
        this.uiManager.showGameOver(victory, stats);
    }

    getGameState() {
        return {
            golem: this.golem.getState(),
            minions: this.minions.map(m => m.getState()),
            isPaused: this.isPaused,
            relics: this.relicSystem.getAllRelics(),
            relicSystem: this.relicSystem
        };
    }
}
