/**
 * Room types for the map generator.
 */
export const RoomType = {
    MONSTER: 'Monster',
    ELITE: 'Elite',
    SHOP: 'Shop',
    REST: 'Rest',
    TREASURE: 'Treasure',
    EVENT: 'Event',
    BOSS: 'Boss',
    NONE: 'None'
};

/**
 * Represents a single node (room) in the map.
 */
export class MapNode {
    constructor(x, y, posX, posY) {
        this.id = `node_${y}_${x}`;
        this.x = x; // Grid X (Lane)
        this.y = y; // Grid Y (Floor)
        this.position = { x: posX, y: posY }; // Logical position for rendering
        this.roomType = RoomType.NONE;
        this.incoming = []; // Array of node IDs (from nodes above)
        this.outgoing = []; // Array of node IDs (to nodes below)
    }
}

/**
 * Procedural Map Generator based on Slay the Spire.
 */
import gameData from '../generated/gameData.json';

/**
 * Simple Linear Congruential Generator for seeded randomness.
 */
class RNG {
    constructor(seed) {
        // Handle string seeds by hashing
        if (typeof seed === 'string') {
            this.state = this.hashString(seed);
        } else {
            this.state = seed ? seed : Math.floor(Math.random() * 2147483647);
        }
    }

    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    next() {
        this.state = (this.state * 48271) % 2147483647;
        return this.state / 2147483647;
    }

    // Helper to get integer range [min, max)
    range(min, max) {
        return Math.floor(this.next() * (max - min)) + min;
    }
}

/**
 * Procedural Map Generator based on Slay the Spire.
 */
export class MapGenerator {
    constructor(settings = {}) {
        this.mapWidth = settings.mapWidth || 7;
        this.mapHeight = settings.mapHeight || 15;
        this.pathCount = settings.pathCount || 6;
        this.xSpacing = settings.xSpacing || 100;
        this.ySpacing = settings.ySpacing || 80;
        this.jitter = settings.jitter || 20;

        // RNG Setup
        this.seed = settings.seed || Math.random().toString(36).substring(7);
        this.rng = new RNG(this.seed);

        this.nodes = [];
        this.grid = []; // 2D array [y][x]
    }

    generateMap() {
        this.nodes = [];
        this.grid = Array.from({ length: this.mapHeight }, () => Array(this.mapWidth).fill(null));

        // 1. Create paths (Skeleton)
        this.createPaths();

        // 2. Connect nodes (Edges)
        this.connectNodes();

        // 3. Prune isolated nodes
        this.pruneNodes();

        // 4. Create Boss node
        this.createBossNode();

        // 5. Assign room types
        this.assignRoomTypes();

        return {
            nodes: this.nodes,
            mapWidth: this.mapWidth,
            mapHeight: this.mapHeight,
            seed: this.seed
        };
    }

    createPaths() {
        for (let i = 0; i < this.pathCount; i++) {
            let currentX = Math.floor(this.rng.next() * this.mapWidth);

            for (let y = 0; y < this.mapHeight; y++) {
                if (!this.grid[y][currentX]) {
                    // Option A: y=0 is top, position.y increases for downward flow
                    const posX = currentX * this.xSpacing + (this.rng.next() - 0.5) * this.jitter;
                    const posY = y * this.ySpacing + (this.rng.next() - 0.5) * this.jitter;

                    const newNode = new MapNode(currentX, y, posX, posY);
                    this.grid[y][currentX] = newNode;
                    this.nodes.push(newNode);
                }

                if (y < this.mapHeight - 1) {
                    currentX = this.getNextPathX(currentX);
                }
            }
        }
    }

    getNextPathX(currentX) {
        const candidates = [currentX];
        if (currentX > 0) candidates.push(currentX - 1);
        if (currentX < this.mapWidth - 1) candidates.push(currentX + 1);
        return candidates[Math.floor(this.rng.next() * candidates.length)];
    }

    connectNodes() {
        for (let y = 0; y < this.mapHeight - 1; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const node = this.grid[y][x];
                if (!node) continue;

                const potentialTargets = [];
                // Left-down, Down, Right-down (y+1)
                if (x > 0 && this.grid[y + 1][x - 1]) potentialTargets.push(this.grid[y + 1][x - 1]);
                if (this.grid[y + 1][x]) potentialTargets.push(this.grid[y + 1][x]);
                if (x < this.mapWidth - 1 && this.grid[y + 1][x + 1]) potentialTargets.push(this.grid[y + 1][x + 1]);

                if (potentialTargets.length > 0) {
                    // Always link at least one
                    const primary = potentialTargets[Math.floor(this.rng.next() * potentialTargets.length)];
                    this.link(node, primary);

                    // Chance for extra links (crossings)
                    potentialTargets.forEach(target => {
                        if (target !== primary && this.rng.next() < 0.2) {
                            this.link(node, target);
                        }
                    });
                }
            }
        }
    }

    link(from, to) {
        if (!from.outgoing.includes(to.id)) from.outgoing.push(to.id);
        if (!to.incoming.includes(from.id)) to.incoming.push(from.id);
    }

    pruneNodes() {
        let changed = true;
        while (changed) {
            changed = false;
            for (let i = this.nodes.length - 1; i >= 0; i--) {
                const node = this.nodes[i];

                // Prune if not top floor and has no incoming paths (from above)
                const isUnreachable = node.y > 0 && node.incoming.length === 0;
                // Prune if not bottom floor and has no outgoing paths (to below)
                const isDeadEnd = node.y < this.mapHeight - 1 && node.outgoing.length === 0;

                if (isUnreachable || isDeadEnd) {
                    // Remove connections
                    this.nodes.forEach(n => {
                        n.outgoing = n.outgoing.filter(id => id !== node.id);
                        n.incoming = n.incoming.filter(id => id !== node.id);
                    });

                    this.grid[node.y][node.x] = null;
                    this.nodes.splice(i, 1);
                    changed = true;
                }
            }
        }
    }

    createBossNode() {
        const bossX = (this.mapWidth - 1) * this.xSpacing / 2;
        const bossY = (this.mapHeight) * this.ySpacing; // Bottom of the map
        const bossNode = new MapNode(-1, this.mapHeight, bossX, bossY);
        bossNode.roomType = RoomType.BOSS;
        bossNode.id = 'boss_node';

        this.nodes.forEach(node => {
            if (node.y === this.mapHeight - 1) {
                this.link(node, bossNode);
            }
        });

        this.nodes.push(bossNode);
    }

    assignRoomTypes() {
        // Pool of available events (Clone to avoid modifying original info if needed, though here we want a consumable list for this map generation)
        let availableEvents = [...(gameData.events || [])];

        // Shuffle events using seeded RNG (Fisher-Yates)
        for (let i = availableEvents.length - 1; i > 0; i--) {
            const j = Math.floor(this.rng.next() * (i + 1));
            [availableEvents[i], availableEvents[j]] = [availableEvents[j], availableEvents[i]];
        }

        this.nodes.forEach(node => {
            if (node.roomType === RoomType.BOSS) return;

            if (node.y === 0) {
                node.roomType = RoomType.MONSTER;
            } else if (node.y === this.mapHeight - 1) {
                node.roomType = RoomType.SHOP; // Last floor before boss is always a shop
            } else if (node.y === Math.floor(this.mapHeight / 2)) {
                node.roomType = RoomType.TREASURE;
            } else {
                const roll = this.rng.next();
                const canElite = node.y >= 5;

                if (canElite && roll < 0.15) {
                    node.roomType = RoomType.ELITE;
                } else if (roll < 0.3) {
                    node.roomType = RoomType.SHOP;
                } else if (roll < 0.5) {
                    node.roomType = RoomType.EVENT;

                    // Assign specific event ID
                    if (availableEvents.length > 0) {
                        // Pop an event to ensure uniqueness
                        const pickedEvent = availableEvents.pop();
                        node.eventId = pickedEvent.id;
                    } else {
                        // Fallback if we run out of events
                        node.eventId = "EVENT_GENERIC";
                    }
                } else {
                    node.roomType = RoomType.MONSTER;
                }
            }

            // Post-process: Replace any remaining REST with SHOP
            if (node.roomType === RoomType.REST) {
                node.roomType = RoomType.SHOP;
            }
        });
    }
}
