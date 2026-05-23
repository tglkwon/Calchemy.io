# Calchemy: Alchemist Auto-Battler Context

This context defines the core domain rules and language for Calchemy, an alchemist auto-battler deck-building game.

## Language

**Empty Card (빈 카드)**:
A placeholder card object of type `EMPTY` used to populate the 4x4 grid. To avoid undefined index exceptions and ease target calculations, the grid is always pre-filled with 16 **Empty Cards**, and drawn cards overwrite these from index 0 sequentially. During turn activation, **Empty Cards** maintain the 150ms sequential delay (without triggering action effects) to provide players sufficient time to react and use items.
_Avoid_: Empty slot, void, blank space, null element

**Grid Placement (그리드 배치)**:
The mechanism of placing drawn cards onto the 4x4 grid sequentially from index 0 (top-left, left-to-right, top-to-bottom) and leaving the remaining pre-filled **Empty Cards** intact.
_Avoid_: Random placement, chaotic positioning

**Bingo Line (빙고 라인)**:
Any of the 12 lines (4 rows, 4 columns, 2 diagonals) checked for element or harmony alignment. A **Bingo Line** is disqualified if it contains one or more **Empty Cards**.
_Avoid_: Win line, combo line

**Bingo Limit (빙고 제한)**:
A system safety constraint that limits the maximum number of times a single card instance can participate in triggering a bingo effect per turn (default: 4, adjustable via `maxCardBingoContribPerTurn`). This prevents infinite action loops focused on abusing a specific card.
_Avoid_: Combo cap, trigger ceiling, global bingo cap

## Example Dialogue

**Developer**: "Since the player only has 8 cards in Act 1, the grid is populated with those 8 cards starting from index 0, and the other 8 slots are filled with **Empty Cards**."
**Domain Expert**: "Yes, and because those **Empty Cards** are present, none of the **Bingo Lines** can trigger a bingo, which matches our 'addition-based growth' design for Act 1."
