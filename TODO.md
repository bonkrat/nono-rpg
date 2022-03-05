# Tech Debt
* Add letters/numbers/symbols to textsprite
* Set speech bubble outline to shape of text curve
* Refactor Cell to use generic Phaser.GameObjects.Sprite pool.

# Quality of Life enhancements
* Add zones to scenes for better sprite placements and scene orginization 

# Bugs
* Disabled cell tint/alpha is wrong sometimes
* Fix battleSpeak in Battle scene
* Fix gameover/end screens

# Game Loop
1. 3 rounds
2. Each round has 3 basic mobs and 1 boss
3. Basic mobs are one puzzle at (5 x levelnum) ^ 2
4. Basic mobs do increasingly faster attacks
5. Boss does a complicated pattern with 3 puzzles