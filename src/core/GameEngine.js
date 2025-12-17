/**
 * GameEngine.js
 * Central controller for the game loop and state management.
 * Adapted for React: Uses a subscription model for state updates.
 */

import { Unit } from '../entities/Unit.js';
import { CardSystem } from '../systems/CardSystem.js';
import { RelicSystem } from '../systems/RelicSystem.js';
import { KeywordSystem } from './KeywordSystem.js';

export class GameEngine {
    constructor() {
        this.cardSystem = new CardSystem();
        this.relicSystem = new RelicSystem();
        this.keywordSystem = new KeywordSystem();

        // Game State
        this.isPaused = false;
        this.turnIntervalId = null;
        this.turnDuration = 5000; // 5 seconds
        this.turnTimer = 0; // For UI progress (handled by CSS/Animation usually, but we might need to sync)

        // Statistics
        this.turnCount = 0;
        this.totalBingos = 0;
        this.harmonyBingos = 0;
        this.logs = []; // Store logs here

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

        this.listeners = [];
        this.activeCardId = null; // For UI highlighting
        this.bingoCardIds = []; // For UI highlighting
        this.gameOver = false;
        this.victory = false;

        // Bindings
        this.runTurn = this.runTurn.bind(this);
    }

    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    notify() {
        const state = this.getGameState();
        this.listeners.forEach(l => l(state));
    }

    log(msg) {
        const logEntry = {
            id: Date.now() + Math.random(),
            timestamp: new Date().toLocaleTimeString(),
            message: msg
        };
        this.logs = [logEntry, ...this.logs]; // Prepend
        this.notify();
    }

    startBattle() {
        if (this.turnIntervalId) return;

        console.log("Battle Started!");
        this.isPaused = false;
        this.gameOver = false;

        // Shuffle deck before starting, in case it was modified
        this.cardSystem.shuffleDeck();

        this.runTurn(); // Run first turn immediately
        this.turnIntervalId = setInterval(this.runTurn, this.turnDuration);
        this.notify();
    }

    restart() {
        this.stop();

        // Reset Stats
        this.turnCount = 0;
        this.totalBingos = 0;
        this.harmonyBingos = 0;
        this.logs = [];
        this.gameOver = false;
        this.victory = false;

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

        this.log("--- 게임 재시작 ---");
        this.startBattle();
    }

    stop() {
        if (this.turnIntervalId) {
            clearInterval(this.turnIntervalId);
            this.turnIntervalId = null;
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            this.stop();
            this.log("게임 일시정지");
        } else {
            // Resume
            this.runTurn();
            this.turnIntervalId = setInterval(this.runTurn, this.turnDuration);
            this.log("게임 재개");
        }
        this.notify();
    }

    // Called by UI to update stats manually
    updateEntityState(type, index, newState) {
        if (type === 'golem') {
            this.golem.syncState(newState);
        } else if (type === 'minion') {
            if (this.minions[index]) {
                this.minions[index].syncState(newState);
            }
        }
        this.notify();
    }

    toggleRelic(relicId) {
        this.relicSystem.toggleRelic(relicId);
        this.notify();
    }

    addCardToDeck(type) {
        this.cardSystem.addCard(type);
        this.notify();
    }

    removeCardFromDeck(id) {
        this.cardSystem.removeCard(id);
        this.notify();
    }

    async runTurn() {
        if (this.isPaused || this.gameOver) return;

        this.turnCount++;
        this.log(`--- 턴 ${this.turnCount} 시작 ---`);

        // 1. Reset Turn Stats
        this.golem.resetTurnStats();
        this.golem.totalDamageThisTurn = 0;
        this.minions.forEach(m => m.resetTurnStats());

        // 2. Minion Intent (Random for now)
        // 2. Minion Intent
        this.minions.forEach(m => {
            if (!m.isAlive) {
                m.intent = null;
                return;
            }
            const roll = Math.random();
            if (roll < 0.6) m.intent = 'ATTACK';
            else if (roll < 0.8) m.intent = 'DEFEND';
            else m.intent = 'BUFF';

            if (m.intent === 'DEFEND') {
                m.addBlock(m.baseDefense);
            }
        });

        // 2.5 Relic Triggers (Turn Start)
        this.processRelicTriggers('TurnStart');

        this.notify();

        // 3. Draw Grid
        const grid = this.cardSystem.drawGrid();
        this.notify();

        // 4. Activate Cards (Sequential Delay)
        await this.activateCards(grid);

        // 5. Check Bingos
        const bingos = this.cardSystem.checkBingos();
        await this.applyBingoEffects(bingos);

        // Discard Grid AFTER bingo checks
        this.cardSystem.discardGrid();

        // 6. Minion Actions
        this.executeMinionActions();

        // 7. Check Game Over
        this.checkGameOver();

        this.notify();
    }

    async activateCards(grid) {
        for (const card of grid) {
            if (this.isPaused || this.gameOver) break;

            await new Promise(r => setTimeout(r, 150)); // Delay

            this.activeCardId = card.instanceId;
            this.notify();

            // Effect
            this.triggerCardEffect(card);

            // Clear highlight after a short moment (optional, or let next card clear it)
            await new Promise(r => setTimeout(r, 50));
            this.activeCardId = null;
            this.notify();
        }
    }

    triggerCardEffect(card) {
        const context = {
            golem: this.golem,
            minions: this.minions,
        };

        const logs = this.keywordSystem.processCardEffects(card, context);
        logs.forEach(msg => this.log(msg));
    }

    async applyBingoEffects(bingos) {
        if (bingos.length === 0) return;

        for (const bingo of bingos) {
            this.totalBingos++;

            // Highlight ONLY the cards in this bingo line
            this.bingoCardIds = bingo.ids;
            this.notify();

            // Wait for visual effect
            await new Promise(r => setTimeout(r, 800));

            // 1. Trigger Generic Bingo Effect
            if (bingo.type === 'HARMONY') {
                this.harmonyBingos++;
                this.log(`🌈 조화(Harmony) 빙고!`);

                const dmg = 10;
                const blk = 10;

                this.minions.forEach(m => {
                    if (m.isAlive) m.takeDamage(dmg);
                });
                this.golem.addBlock(blk);
                this.log(`>> 🌈 조화 효과: 모든 적 -${dmg} HP, 골렘 +${blk} 방어`);

            } else {
                // Element Bingo
                const type = bingo.type;
                this.log(`✨ ${type} 빙고!`);

                if (type === 'FIRE') {
                    const dmg = this.golem.baseAttack * 2;
                    const t = this.getRandomTarget();
                    if (t) {
                        t.takeDamage(dmg);
                        this.log(`>> 🔥 빙고 피해: ${t.name}에게 ${dmg}`);
                    }
                } else if (type === 'EARTH') {
                    const blk = this.golem.baseShield * 2;
                    this.golem.addBlock(blk);
                    this.log(`>> 🌱 빙고 방어: +${blk}`);
                } else if (type === 'WATER') {
                    const heal = Math.floor(this.golem.maxHp / 10);
                    const healed = this.golem.heal(heal);
                    this.log(`>> 💧 빙고 회복: +${healed}`);
                } else if (type === 'WIND') {
                    this.golem.attackBuffs += 1;
                    this.log(`>> 🍃 빙고 버프: 공격 +1`);
                }
            }

            // 2. Trigger Specific Card Bingo Effects
            // Find the actual card objects based on ids
            // const allCards = this.cardSystem.getAllCards();
            // Note: getAllCards might be slow if deck is huge, but here it's small.
            // Actually, the cards are in the grid (or were). 
            // Since we discard grid AFTER bingo checks, they are still in grid.
            // But wait, bingo.ids are instanceIds.

            const bingoCards = this.cardSystem.grid.filter(c => bingo.ids.includes(c.instanceId));

            for (const card of bingoCards) {
                this.triggerBingoCardEffect(card, bingo.type);
            }
        }

        // Clear bingo highlight after delay
        this.bingoCardIds = [];
        this.notify();
    }

    triggerBingoCardEffect(card, bingoType) {
        if (!card.id) return;

        let logMsg = "";

        // Only trigger if the bingo type matches the card type (usually)
        // or if it's Harmony? Let's assume Element Bingo triggers it.
        if (bingoType !== 'HARMONY' && card.type !== bingoType) return;

        switch (card.id) {
            case "1": // 불씨: [점화] 적 화상 × 10% 추뎀
                // Simplified: Add extra damage if target has burn
                {
                    const target = this.getRandomTarget();
                    if (target && target.statuses['BURN'] > 0) {
                        const extraDmg = 5; // Simplified constant
                        target.takeDamage(extraDmg);
                        logMsg = `🔥 [불씨] 점화! 화상 적에게 추가 피해 ${extraDmg}`;
                    }
                }
                break;
            case "2": // 기름통: [확산] 단일 피해 ➔ 광역(AoE) 변경
                // This modifies the base bingo effect? Hard to do retroactively.
                // Instead, let's just deal extra AoE damage.
                {
                    const aoeDmg = 5;
                    this.minions.forEach(m => {
                        if (m.isAlive) m.takeDamage(aoeDmg);
                    });
                    logMsg = `🛢️ [기름통] 확산! 적 전체 피해 ${aoeDmg}`;
                }
                break;
            case "3": // 화염구: [폭발] 인접한 적에게 50% 스플래시
                {
                    // Simplified: Random other enemy takes damage
                    const target = this.getRandomTarget();
                    if (target) {
                        const splash = 6;
                        target.takeDamage(splash);
                        logMsg = `☄️ [화염구] 폭발! 추가 피해 ${splash}`;
                    }
                }
                break;
            case "4": // 연쇄 폭발: [유폭] 이 줄 불 카드 재발동
                // Trigger this card's effect again?
                {
                    this.triggerCardEffect(card);
                    logMsg = `💥 [연쇄 폭발] 유폭! 효과 재발동`;
                }
                break;
            case "5": // 용암 갑옷: [융해] 적 방어도 0 + 취약
                {
                    const target = this.getRandomTarget();
                    if (target) {
                        target.block = 0;
                        logMsg = `🛡️ [용암 갑옷] 융해! ${target.name} 방어도 파괴`;
                    }
                }
                break;
            // ... Implement others as needed ...
            case "6": // 불사조: [환생] 처치 시 체력 회복
                // Hard to implement "On Kill". Let's just heal Golem.
                {
                    this.golem.heal(20);
                    logMsg = `🐦 [불사조] 환생! 체력 20 회복`;
                }
                break;
            case "7": // 초신성: [대폭발] 데미지 증가
                {
                    const extra = 20;
                    const target = this.getRandomTarget();
                    if (target) target.takeDamage(extra);
                    logMsg = `🌟 [초신성] 대폭발! 추가 피해 ${extra}`;
                }
                break;
        }

        if (logMsg) this.log(logMsg);
    }

    executeMinionActions() {
        this.minions.forEach(m => {
            if (!m.isAlive) return;

            if (m.intent === 'ATTACK') {
                const dmg = m.baseAttack; // Simplified
                const taken = this.golem.takeDamage(dmg);
                this.log(`⚔️ ${m.name} 공격! ${dmg} 피해 (실제: ${taken})`);
                m.block = 0; // Reset block after attack
            } else if (m.intent === 'BUFF') {
                m.baseAttack += 2;
                m.baseDefense += 2;
                this.log(`💪 ${m.name} 강화 (+2/+2)`);
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
        this.stop();
        this.gameOver = true;
        this.victory = victory;
        this.log(victory ? "🏆 승리!" : "💀 패배!");
        this.notify();
    }

    processRelicTriggers(trigger) {
        const activeRelics = this.relicSystem.getRelicsByTrigger(trigger);

        activeRelics.forEach(relic => {
            console.log(`[Relic] Triggering ${relic.name} (${trigger})`);
            this.log(`🏺 유물 발동: ${relic.name}`);

            switch (relic.passiveKey) {
                case 'KEY_AUTO_DRAW':
                    // Draw 1 card
                    this.addCardToDeck('FIRE'); // Simplified: Add fire card as "Draw". 
                    // Real draw logic needed? CardSystem doesn't have "Draw from Deck" in the same way.
                    // It has "Grid". Maybe add card to Hand? Or just add to Grid?
                    // Let's assume "Draw" means "Add random card to Grid/Deck" or similar.
                    // For now: Add a random card to the grid if space?
                    // Or just log it for verification.
                    this.log("  >> 카드 1장 추가 드로우 (임시: 불 카드 생성)");
                    this.cardSystem.addCard('FIRE');
                    break;

                // Add other keys here
                default:
                    // console.warn("Unknown relic key:", relic.passiveKey);
                    break;
            }
        });
    }

    getGameState() {
        return {
            golem: this.golem.getState(),
            minions: this.minions.map(m => m.getState()),
            isPaused: this.isPaused,
            turnCount: this.turnCount,
            totalBingos: this.totalBingos,
            harmonyBingos: this.harmonyBingos,
            logs: this.logs,
            grid: this.cardSystem.grid,
            activeCardId: this.activeCardId,
            bingoCardIds: this.bingoCardIds,
            gameOver: this.gameOver,
            victory: this.victory,
            relics: this.relicSystem.getAllRelics(),
        };
    }
}
