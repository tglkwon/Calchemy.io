/**
 * UIManager.js
 * Handles DOM manipulation and Event Binding.
 */

export class UIManager {
    constructor(assetManager) {
        this.assetManager = assetManager;

        // DOM Elements
        this.app = document.getElementById('app');
        this.golemPanel = document.getElementById('golem-stats-container');
        this.golemTotalDamage = document.getElementById('golem-total-damage');
        this.minionPanel = document.getElementById('minions-container');
        this.gridContainer = document.getElementById('bingo-grid');
        this.turnTimerBar = document.getElementById('turn-timer-bar');
        this.logModal = document.getElementById('log-modal');
        this.logContent = document.getElementById('log-content');

        // Buttons
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.assetToggleBtn = document.getElementById('asset-toggle-btn');
        this.logToggleBtn = document.getElementById('log-toggle-btn');
        this.logCloseBtn = document.getElementById('log-close-btn');
        this.logRestartBtn = document.getElementById('log-restart-btn');

        // Game Over Modal Elements
        this.gameOverModal = document.getElementById('game-over-modal');
        this.gameOverTitle = document.getElementById('game-over-title');
        this.gameOverMessage = document.getElementById('game-over-message');
        this.statTurns = document.getElementById('stat-turns');
        this.statBingos = document.getElementById('stat-bingos');
        this.restartBtn = document.getElementById('restart-btn');
        this.gameOverLogBtn = document.getElementById('game-over-log-btn');

        // State
        this.timerAnim = null;
    }

    bindEvents(gameEngine) {
        this.startBtn.addEventListener('click', () => {
            this.startBtn.classList.add('hidden');
            this.pauseBtn.classList.remove('hidden');
            gameEngine.startBattle();
        });

        this.pauseBtn.addEventListener('click', () => {
            gameEngine.togglePause();
        });

        this.assetToggleBtn.addEventListener('click', () => {
            const newMode = this.assetManager.toggleMode();
            this.assetToggleBtn.textContent = `모드: ${newMode === 'EMOJI' ? '이모지' : '이미지'}`;
            // Re-render everything to update assets
            gameEngine.uiManager.render(gameEngine.getGameState());
            gameEngine.uiManager.renderGrid(gameEngine.cardSystem.grid);
        });

        this.logToggleBtn.addEventListener('click', () => {
            this.logModal.classList.remove('hidden');
        });

        this.logCloseBtn.addEventListener('click', () => {
            this.logModal.classList.add('hidden');
        });

        this.logRestartBtn.addEventListener('click', () => {
            this.logModal.classList.add('hidden');
            gameEngine.restart();
        });

        // Game Over Events
        this.restartBtn.addEventListener('click', () => {
            gameEngine.restart();
        });

        this.gameOverLogBtn.addEventListener('click', () => {
            this.gameOverModal.classList.add('hidden'); // Hide Game Over Modal
            this.logModal.classList.remove('hidden'); // Show Log Modal
        });
    }

    showGameOver(victory, stats) {
        this.gameOverModal.classList.remove('hidden');
        this.gameOverTitle.textContent = victory ? "🏆 승리!" : "💀 패배!";
        this.gameOverTitle.className = victory ? "text-4xl font-bold mb-4 text-yellow-400" : "text-4xl font-bold mb-4 text-red-500";
        this.gameOverMessage.textContent = victory ? "모든 적을 물리쳤습니다!" : "골렘이 파괴되었습니다...";

        this.statTurns.textContent = stats.turnCount;
        this.statBingos.textContent = stats.totalBingos;
    }

    hideGameOver() {
        this.gameOverModal.classList.add('hidden');
    }

    updatePauseButton(isPaused) {
        this.pauseBtn.textContent = isPaused ? "재개 (Resume)" : "일시정지 (Pause)";
        this.pauseBtn.className = isPaused
            ? "px-6 py-2 bg-blue-600 hover:bg-blue-500 font-bold rounded shadow-lg transform active:scale-95 transition-all"
            : "px-6 py-2 bg-yellow-600 hover:bg-yellow-500 font-bold rounded shadow-lg transform active:scale-95 transition-all";
    }

    startTimer(duration) {
        this.turnTimerBar.style.transition = 'none';
        this.turnTimerBar.style.width = '0%';

        // Force reflow
        void this.turnTimerBar.offsetWidth;

        this.turnTimerBar.style.transition = `width ${duration}ms linear`;
        this.turnTimerBar.style.width = '100%';
    }

    resetTimer() {
        this.turnTimerBar.style.transition = 'none';
        this.turnTimerBar.style.width = '0%';
    }

    log(msg) {
        const div = document.createElement('div');
        div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
        this.logContent.prepend(div);
    }

    // --- Rendering ---

    render(gameState) {
        this.renderGolem(gameState.golem, gameState.isPaused);
        this.renderMinions(gameState.minions, gameState.isPaused);
    }

    renderGolem(golem, isPaused) {
        // If first time, create structure
        if (!this.golemPanel.hasChildNodes()) {
            this.golemPanel.innerHTML = `
                <div class="flex items-center justify-center p-4 bg-gray-900 rounded-lg border border-gray-700 h-32">
                    <div id="golem-asset" class="w-20 h-20 text-6xl flex items-center justify-center"></div>
                </div>
                ${this.createStatRow('HP', 'golem-hp', golem.hp, golem.maxHp)}
                ${this.createStatRow('Block', 'golem-block', golem.block)}
                <div class="h-px bg-gray-700 my-2"></div>
                ${this.createInputRow('기본 공격력', 'golem-baseAttack', golem.baseAttack)}
                ${this.createInputRow('기본 방어도', 'golem-baseShield', golem.baseShield)}
                ${this.createInputRow('검 보너스', 'golem-swordBonus', golem.swordBonus || 0)}
                ${this.createInputRow('방패 보너스', 'golem-shieldBonus', golem.shieldBonus || 0)}
                ${this.createInputRow('공격 버프', 'golem-attackBuffs', golem.attackBuffs)}
            `;
        }

        // Update Asset
        const assetDiv = document.getElementById('golem-asset');
        assetDiv.innerHTML = this.assetManager.get('GOLEM');

        // Update Total Damage
        if (this.golemTotalDamage) {
            this.golemTotalDamage.textContent = golem.totalDamageThisTurn || 0;
        }

        // Update Values
        this.updateStatBar('golem-hp', golem.hp, golem.maxHp, 'bg-red-600');
        this.updateStatBar('golem-block', golem.block, 100, 'bg-blue-500'); // Block max arbitrary for visual

        if (!isPaused) {
            this.setInputValue('golem-baseAttack', golem.baseAttack);
            this.setInputValue('golem-baseShield', golem.baseShield);
            this.setInputValue('golem-swordBonus', golem.swordBonus || 0);
            this.setInputValue('golem-shieldBonus', golem.shieldBonus || 0);
            this.setInputValue('golem-attackBuffs', golem.attackBuffs);
        }
    }

    renderMinions(minions, isPaused) {
        // Clear and rebuild if length changed or just rebuild for simplicity
        this.minionPanel.innerHTML = '';

        minions.forEach((m, idx) => {
            const div = document.createElement('div');
            div.className = `p-3 rounded border ${m.isAlive ? 'border-gray-600 bg-gray-800' : 'border-red-900 bg-red-900/20 opacity-50'}`;
            div.innerHTML = `
                <div class="flex justify-between items-center mb-2">
                    <span class="font-bold text-sm">${m.name}</span>
                    <div class="w-8 h-8 flex items-center justify-center text-2xl">
                        ${m.isAlive ? this.assetManager.get(`MINION_${idx + 1}`) : '💀'}
                    </div>
                </div>
                ${m.isAlive ? `
                    <div class="flex justify-between text-xs mb-1">
                        <span>의도:</span>
                        <span>${this.getIntentIcon(m.intent)}</span>
                    </div>
                    ${this.createStatRow('HP', `minion-${idx}-hp`, m.hp, m.maxHp, true)}
                    ${this.createStatRow('Block', `minion-${idx}-block`, m.block, null, true)}
                    <div class="grid grid-cols-2 gap-2 mt-2">
                        ${this.createInputRow('공격력', `minion-${idx}-atk`, m.baseAttack, true)}
                        ${this.createInputRow('방어력', `minion-${idx}-def`, m.baseDefense, true)}
                        ${this.createInputRow('디버프', `minion-${idx}-debuff`, m.attackDebuffs || 0, true)}
                    </div>
                ` : '<div class="text-center text-red-500 font-bold">처치됨</div>'}
            `;
            this.minionPanel.appendChild(div);
        });

        // Note: For minions, since we rebuild DOM every render, we don't need separate setInputValue logic 
        // UNLESS we want to preserve focus. But for now, simple rebuild is safer for dynamic lists.
        // However, if paused, we should ENABLE inputs.
        if (isPaused) {
            const inputs = this.minionPanel.querySelectorAll('input');
            inputs.forEach(input => {
                input.disabled = false;
                input.classList.add('border-yellow-500');
            });
        }
    }

    renderGrid(grid) {
        this.gridContainer.innerHTML = '';
        grid.forEach(card => {
            const div = document.createElement('div');
            div.id = `card-${card.id}`;
            div.className = 'aspect-square bg-gray-700 rounded flex items-center justify-center border border-gray-600 transition-all duration-300';
            div.innerHTML = this.assetManager.get(card.type);
            this.gridContainer.appendChild(div);
        });
    }

    highlightCard(cardId) {
        const el = document.getElementById(`card-${cardId}`);
        if (el) {
            el.classList.add('card-activating');
            setTimeout(() => {
                el.classList.remove('card-activating');
            }, 300);
        }
    }

    highlightBingoCards(cardIds) {
        cardIds.forEach(id => {
            const el = document.getElementById(`card-${id}`);
            if (el) {
                el.classList.add('bingo-highlight');
            }
        });

        // Remove after a delay
        setTimeout(() => {
            cardIds.forEach(id => {
                const el = document.getElementById(`card-${id}`);
                if (el) el.classList.remove('bingo-highlight');
            });
        }, 1500);
    }

    // --- Helpers ---

    getIntentIcon(intent) {
        if (!intent) return '-';
        return this.assetManager.get(`INTENT_${intent}`);
    }

    createStatRow(label, id, val, max, small = false) {
        const h = small ? 'h-2' : 'h-4';
        const txt = small ? 'text-[10px]' : 'text-xs';
        return `
            <div class="flex flex-col gap-1 w-full">
                <div class="flex justify-between ${txt} text-gray-400">
                    <span>${label}</span>
                    <span id="${id}-text">${val}${max ? '/' + max : ''}</span>
                </div>
                <div class="w-full ${h} bg-gray-900 rounded-full overflow-hidden">
                    <div id="${id}-bar" class="h-full transition-all duration-300 w-0"></div>
                </div>
            </div>
        `;
    }

    updateStatBar(id, val, max, colorClass) {
        const bar = document.getElementById(`${id}-bar`);
        const text = document.getElementById(`${id}-text`);
        if (bar && text) {
            const pct = max ? Math.min(100, (val / max) * 100) : Math.min(100, val); // If no max, treat val as raw pct or cap at 100
            bar.className = `h-full transition-all duration-300 ${colorClass}`;
            bar.style.width = `${pct}%`;
            text.textContent = max ? `${val}/${max}` : val;
        }
    }

    createInputRow(label, id, val, small = false) {
        const txt = small ? 'text-[10px]' : 'text-xs';
        return `
            <div class="flex flex-col">
                <label class="${txt} text-gray-500">${label}</label>
                <input type="number" id="${id}" value="${val}" class="w-full bg-gray-700 border border-gray-600 rounded px-1 text-white text-center font-mono focus:outline-none focus:border-yellow-500" disabled>
            </div>
        `;
    }

    setInputValue(id, val) {
        const el = document.getElementById(id);
        if (el && document.activeElement !== el) { // Don't overwrite if user is typing
            el.value = val;
        }
    }

    setInputsDisabled(disabled) {
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => {
            input.disabled = disabled;
            if (!disabled) {
                input.classList.add('border-yellow-500');
            } else {
                input.classList.remove('border-yellow-500');
            }
        });
    }

    getInputsState() {
        // Collects all input values to sync back to game state
        const state = {
            golem: {
                hp: parseInt(document.getElementById('golem-hp').value) || 0,
                maxHp: parseInt(document.getElementById('golem-maxHp').value) || 0,
                block: parseInt(document.getElementById('golem-block').value) || 0,
                baseAttack: parseInt(document.getElementById('golem-baseAttack').value) || 0,
                baseShield: parseInt(document.getElementById('golem-baseShield').value) || 0,
                swordBonus: parseInt(document.getElementById('golem-swordBonus').value) || 0,
                shieldBonus: parseInt(document.getElementById('golem-shieldBonus').value) || 0,
                attackBuffs: parseInt(document.getElementById('golem-attackBuffs').value) || 0,
            },
            minions: []
        };

        // Minions
        for (let i = 0; i < 3; i++) {
            const hp = document.getElementById(`minion-${i}-hp`);
            const block = document.getElementById(`minion-${i}-block`);
            const atk = document.getElementById(`minion-${i}-atk`);
            const def = document.getElementById(`minion-${i}-def`);
            const debuff = document.getElementById(`minion-${i}-debuff`);

            if (hp) {
                state.minions.push({
                    hp: parseInt(hp.value) || 0,
                    block: parseInt(block.value) || 0,
                    baseAttack: parseInt(atk.value) || 0,
                    baseDefense: parseInt(def.value) || 0,
                    attackDebuffs: parseInt(debuff.value) || 0
                });
            } else {
                state.minions.push({}); // No update
            }
        }
        return state;
    }
}
