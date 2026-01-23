/**
 * GameEngine.js
 * Central controller for the game loop and state management.
 * Adapted for React: Uses a subscription model for state updates.
 */

import { Unit } from '../entities/Unit.js';
import { CardSystem } from '../systems/CardSystem.js';
import { RelicSystem } from '../systems/RelicSystem.js';
import { KeywordSystem } from '../systems/KeywordSystem.js';
import { MapGenerator, RoomType } from '../systems/MapGenerator.js';

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

        // Map State
        this.mapGenerator = new MapGenerator({
            mapWidth: 7,
            mapHeight: 15,
            xSpacing: 100,
            ySpacing: 100,
            jitter: 30
        });
        this.mapData = null;
        this.currentNodeId = null;
        this.visitedNodeIds = new Set();

        // Treasure Chest State
        this.treasureSelectionMode = false;
        this.offeredRelics = [];

        // Economy & Shop State
        this.gold = 1000; // Starting gold (Modified to 1000 for testing)
        this.shopRemovalCost = 75; // Slay the Spire default starting cost
        this.shopEnhanceCost = 50; // Starting enhancement cost
        this.shopInventory = {
            cards: [],
            relics: [],
            potions: [],
            saleItemId: null
        };

        // Inventory
        this.potions = []; // Max 3
        this.maxPotions = 3;

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

    // Map Methods
    generateNewMap() {
        this.mapData = this.mapGenerator.generateMap();
        this.currentNodeId = null;
        this.visitedNodeIds = new Set();
        this.notify();
    }

    selectMapNode(nodeId) {
        const node = this.mapData.nodes.find(n => n.id === nodeId);
        if (!node) return;

        // Logic check: Is it a valid move? 
        // 1. If no current node, must be floor 0
        // 2. If has current node, must be in current node's outgoing
        // const isValid = this.isNodeReachable(nodeId);
        // if (!isValid) return;

        this.currentNodeId = nodeId;
        this.visitedNodeIds.add(nodeId);

        if ([RoomType.MONSTER, RoomType.ELITE, RoomType.BOSS].includes(node.roomType)) {
            this.restart(); // Start/Reset battle
            return true; // Indicate navigation needed
        } else {
            // Handle other room types (Rest, Shop, etc.)
            this.notify();
            return false;
        }
    }

    isNodeReachable(nodeId) {
        if (!this.mapData) return false;
        if (this.visitedNodeIds.has(nodeId)) return false;

        const node = this.mapData.nodes.find(n => n.id === nodeId);
        if (!node) return false;

        if (this.currentNodeId === null) {
            return node.y === 0;
        }

        const currentNode = this.mapData.nodes.find(n => n.id === this.currentNodeId);
        return currentNode.outgoing.includes(nodeId);
    }

    // Treasure Chest Methods
    startTreasureSelection() {
        this.offeredRelics = this.relicSystem.getRandomRelics(3);
        this.treasureSelectionMode = true;
        this.notify();
    }

    selectTreasureRelic(relicId) {
        if (!this.treasureSelectionMode) {
            console.warn('Not in treasure selection mode');
            return false;
        }

        const offered = this.offeredRelics.find(r => r.id === relicId || r.artifactId === relicId);
        if (!offered) {
            console.warn('Relic not in offered list');
            return false;
        }

        // Activate the selected relic
        this.relicSystem.activateRelic(relicId);
        this.log(`🎁 보물 획득: ${offered.name}`);

        // Clear treasure mode
        this.treasureSelectionMode = false;
        this.offeredRelics = [];
        this.notify();

        return true;
    }

    skipTreasureSelection() {
        this.treasureSelectionMode = false;
        this.offeredRelics = [];
        this.notify();
    }

    // Shop Methods
    generateShopInventory(gameData) {
        if (!gameData) return;

        // 8 Cards (4x2 grid)
        const allCards = gameData.cards || [];
        const shopCards = [...allCards].sort(() => Math.random() - 0.5)
            .slice(0, 8)
            .map((card, index) => ({
                ...card,
                instanceId: `shop_card_${Date.now()}_${index}`, // Temporary ID for shop reference
                price: Math.floor(40 + Math.random() * 40) // Cards 40-80 gold
            }));

        // 1 Random card on sale (50% discount) - strictly among cards as per request
        const saleIndex = Math.floor(Math.random() * shopCards.length);
        const saleItem = shopCards[saleIndex];
        if (saleItem) {
            saleItem.originalPrice = saleItem.price;
            saleItem.price = Math.floor(saleItem.price * 0.5);
            saleItem.onSale = true;
        }

        // 3 Relics
        const allRelics = gameData.artifacts || [];
        const activeRelicIds = this.relicSystem.getActiveRelicIds();
        const availableRelics = allRelics.filter(r => !activeRelicIds.includes(r.id) && !activeRelicIds.includes(r.artifactId));
        const shopRelics = [...availableRelics].sort(() => Math.random() - 0.5).slice(0, 3).map(relic => ({
            ...relic,
            price: Math.floor(150 + Math.random() * 150) // Relics 150-300 gold
        }));

        // 3 Potions
        const allPotions = gameData.potions || [];
        const shopPotions = [...allPotions].sort(() => Math.random() - 0.5).slice(0, 3).map(potion => ({
            ...potion,
            price: Math.floor(50 + Math.random() * 50) // Potions 50-100 gold
        }));

        this.shopInventory = {
            cards: shopCards,
            relics: shopRelics,
            potions: shopPotions,
            saleItemId: saleItem ? (saleItem.instanceId || saleItem.id) : null
        };

        this.notify();
    }

    buyItem(itemType, itemData) {
        if (this.gold < itemData.price) {
            this.log(`❌ 골드가 부족합니다! (필요: ${itemData.price}, 보유: ${this.gold})`);
            return false;
        }

        if (itemType === 'potion') {
            if (this.potions.length >= this.maxPotions) {
                this.log(`❌ 포션 슬롯이 가득 찼습니다!`);
                return false;
            }
            this.gold -= itemData.price;
            this.log(`🛒 포션 구매: ${itemData.name}`);
            this.potions.push(itemData);
            this.shopInventory.potions = this.shopInventory.potions.filter(p => p.id !== itemData.id);
            this.notify();
            return true;
        }

        this.gold -= itemData.price;

        if (itemType === 'card') {
            this.log(`🛒 카드 구매: ${itemData.name}`);
            this.cardSystem.addCard(itemData);
            this.shopInventory.cards = this.shopInventory.cards.filter(c => c.instanceId !== itemData.instanceId);
        } else if (itemType === 'relic') {
            this.log(`🛒 유물 구매: ${itemData.name}`);
            this.relicSystem.activateRelic(itemData.id || itemData.artifactId);
            this.shopInventory.relics = this.shopInventory.relics.filter(r => (r.id !== itemData.id && r.artifactId !== itemData.id));
        }

        this.notify();
        return true;
    }

    usePotion(index) {
        if (index < 0 || index >= this.potions.length) return;
        const potion = this.potions[index];

        // MVP: Simple usage logic here. Later delegate to EffectSystem or ItemSystem
        this.log(`🧪 포션 사용: ${potion.name}`);

        // Hardcoded simple effects for MVP or parse logic
        // Assuming potion has 'summary' or 'logic'? Data structure check needed.
        // For now, let's assume it heals 20 if no logic found, or parsing name.
        if (potion.name.includes('체력')) {
            this.golem.heal(20);
        } else if (potion.name.includes('힘')) {
            this.golem.baseAttack += 2;
        } else if (potion.name.includes('폭발')) {
            this.minions.forEach(m => {
                if (m.isAlive) m.takeDamage(20);
            });
        }

        // Remove used potion
        this.potions.splice(index, 1);
        this.notify();
    }

    removeCardInShop(cardInstanceId) {
        if (this.gold < this.shopRemovalCost) {
            this.log(`❌ 골드가 부족합니다! (필요: ${this.shopRemovalCost}, 보유: ${this.gold})`);
            return false;
        }

        this.gold -= this.shopRemovalCost;
        this.cardSystem.removeCard(cardInstanceId);
        this.shopRemovalCost += 25; // Price increases per removal

        this.log(`🔥 카드 제거 서비스 이용 완료 (다음 비용: ${this.shopRemovalCost})`);
        this.notify();
        return true;
    }

    enhanceCardInShop(cardInstanceId, enhancement) {
        if (this.gold < this.shopEnhanceCost) {
            this.log(`❌ 골드가 부족합니다! (필요: ${this.shopEnhanceCost}, 보유: ${this.gold})`);
            return false;
        }

        this.gold -= this.shopEnhanceCost;

        // enhancement includes { type, field, value, name }
        // e.g. { type: 'ENHANCEMENT', field: 'ATTACK', value: 10, name: '보너스 공격' }
        const success = this.cardSystem.enhanceCard(cardInstanceId, enhancement);

        if (success) {
            this.log(`✨ 카드 강화 성공: [${enhancement.name}] 적용 완료!`);
            // this.shopEnhanceCost += 25; // Option: increase cost
            this.notify();
            return true;
        }

        return false;
    }

    addGold(amount) {
        this.gold += amount;
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

        // 6.5 Process Status Effects (Poison, and reducing durations)
        this.processEndTurnStatusEffects();

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
            cardSystem: this.cardSystem,
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
                let dmg = m.baseAttack; // Simplified

                // Apply WEAK debuff (-25% damage dealt)
                if (m.statuses['WEAK'] > 0) {
                    dmg = Math.max(0, Math.floor(dmg * 0.75));
                }

                const taken = this.golem.takeDamage(dmg);
                const weakIcon = (m.statuses['WEAK'] > 0) ? ' (약화)' : '';
                this.log(`⚔️ ${m.name} 공격! ${dmg} 피해${weakIcon} (실제: ${taken})`);
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
        if (victory) {
            this.addGold(75);
            this.log("🏆 승리! 75 골드를 획득했습니다.");
        } else {
            this.log("💀 패배!");
        }
        this.notify();
    }

    processEndTurnStatusEffects() {
        const units = [this.golem, ...this.minions];

        units.forEach(unit => {
            if (!unit.isAlive) return;

            // 1. POISON: Deal damage equal to stacks, then decrease stack by 1
            if (unit.statuses['POISON'] > 0) {
                const poisonDmg = unit.statuses['POISON'];
                unit.takeDamage(poisonDmg);
                this.log(`🧪 ${unit.name}: 독으로 인해 ${poisonDmg} 피해`);
                unit.statuses['POISON'] -= 1;
            }

            // 2. DEBUFF Durations (WEAK, VULNERABLE, etc.)
            // Assuming these are duration-based (turns)
            ['WEAK', 'VULNERABLE'].forEach(st => {
                if (unit.statuses[st] > 0) {
                    unit.statuses[st] -= 1;
                    if (unit.statuses[st] === 0) {
                        this.log(`✨ ${unit.name}: ${st} 효과 종료`);
                    }
                }
            });
        });
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
            mapData: this.mapData,
            currentNodeId: this.currentNodeId,
            visitedNodeIds: Array.from(this.visitedNodeIds),
            treasureSelectionMode: this.treasureSelectionMode,
            offeredRelics: this.offeredRelics,
            gold: this.gold,
            shopInventory: this.shopInventory,
            shopRemovalCost: this.shopRemovalCost,
            shopEnhanceCost: this.shopEnhanceCost,
            potions: this.potions,
            maxPotions: this.maxPotions
        };
    }
}
