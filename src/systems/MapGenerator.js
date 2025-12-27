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
        this.incoming = []; // Array of node IDs
        this.outgoing = []; // Array of node IDs
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
            mapHeight: this.mapHeight
        };
    }

    createPaths() {
        for (let i = 0; i < this.pathCount; i++) {
            let currentX = Math.floor(Math.random() * this.mapWidth);

            for (let y = 0; y < this.mapHeight; y++) {
                if (!this.grid[y][currentX]) {
                    const posX = currentX * this.xSpacing + (Math.random() - 0.5) * this.jitter;
                    const posY = y * this.ySpacing + (Math.random() - 0.5) * this.jitter;

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
        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    connectNodes() {
        for (let y = 0; y < this.mapHeight - 1; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                const node = this.grid[y][x];
                if (!node) continue;

                const potentialTargets = [];
                // Left-up, Up, Right-up
                if (x > 0 && this.grid[y + 1][x - 1]) potentialTargets.push(this.grid[y + 1][x - 1]);
                if (this.grid[y + 1][x]) potentialTargets.push(this.grid[y + 1][x]);
                if (x < this.mapWidth - 1 && this.grid[y + 1][x + 1]) potentialTargets.push(this.grid[y + 1][x + 1]);

                if (potentialTargets.length > 0) {
                    // Always link at least one
                    const primary = potentialTargets[Math.floor(Math.random() * potentialTargets.length)];
                    this.link(node, primary);

                    // Chance for extra links (crossings)
                    potentialTargets.forEach(target => {
                        if (target !== primary && Math.random() < 0.2) {
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

                // Prune if not bottom floor and has no incoming paths
                const isUnreachable = node.y > 0 && node.incoming.length === 0;
                // Prune if not top floor and has no outgoing paths
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
        const bossY = this.mapHeight * this.ySpacing;
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
        this.nodes.forEach(node => {
            if (node.roomType === RoomType.BOSS) return;

            if (node.y === 0) {
                node.roomType = RoomType.MONSTER;
            } else if (node.y === this.mapHeight - 1) {
                node.roomType = RoomType.REST;
            } else if (node.y === Math.floor(this.mapHeight / 2)) {
                node.roomType = RoomType.TREASURE;
            } else {
                const roll = Math.random();
                const canElite = node.y >= 5;

                if (canElite && roll < 0.15) {
                    node.roomType = RoomType.ELITE;
                } else if (roll < 0.3) {
                    node.roomType = RoomType.SHOP;
                } else if (roll < 0.5) {
                    node.roomType = RoomType.EVENT;
                } else {
                    node.roomType = RoomType.MONSTER;
                }
            }
        });
    }
}
