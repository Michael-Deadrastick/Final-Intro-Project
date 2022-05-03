kaboom({
  scale: 3,
  background: [10,150,200],
})
loadSpriteAtlas("https://kaboomjs.com/sprites/dungeon.png", "atlas.json");

const levelConfig = {
  width: 16,
  height: 16,
  pos: vec2(32,32),
  "w": () => [
    "wall",
    sprite("wall"),
    area(),
    solid()
  ],
  "r":() => [
    "enemy",
    sprite("redGuy",{
      "anim":"run"
    }),
    area({
      "scale":0.50
    }),
    origin("center"),
    {
      "xVel":30
    }
  ],
  "sword": {
		"x": 322,
		"y": 81,
		"width": 12,
		"height": 30
	},
  //from https://kaboomjs.com/play?demo=spriteatlas
}

const levels = [
  [
    "   s    r   ",
    " wwwwwwwwww"
  ]
]

scene("game",() => {
  
  const level = addLevel(levels[0],levelConfig)

  const player = add([
      sprite("hero"),
      pos(level.getPos(2,0)),
      area({scale:0.5}),
      solid(),
      origin("bot"),
      body()
  ]);
  player.play("idle")
})

go("game")