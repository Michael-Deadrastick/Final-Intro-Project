kaboom({
  scale: 1,
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
  "b":() => [
    "barrier",
    sprite("wall"), 
    area(),
    opacity(0)
  ],
  "o":() => [
    "enemy",
    sprite("ogre",{
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
  "D": () => [
    "door",
    sprite("closed_door"),
    area({
      "scale":0.60
    }),
    solid(),
    origin("center")
  ],
  "c": () => [
    "chest",
    sprite("chest"),
    area(),
    solid(),
    origin("top")
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
 "S": () => [
    "sword",
    sprite("sword"),
    area({
      "scale":0.60
    }),
    origin("center")
   ],
  "P.h":() => [
    "heal",
    sprite("wall"), 
    area(),
    opacity(0)
  ],
    "P.p":() => [
    "poison",
    sprite("wall"), 
    area(),
    opacity(0)
  ],
}

const levels = [
  [
    "      S       ",
    "     ww      ",
    "       b  o r b  c",
    "wwwwwwwwwwwwwwwwwww   w",
    "w                     w",
    "w                     w",
    "w D                   w",
    "wwwwwwwwwwwwwwwwwww   w",
  ],
  [
    "                                 D",  
    "                            wwwwww", 
    "                           w",  
    "     ww   c               w",
    "      b o o  b           w",
    " wwww wwwwwwwwww www  w "       
  ],
  [
    "     ww      ",
    "      b o o  b      c",
    " wwww wwwwwwwwww wwwww",
    " w                   w",
    " w         c         w",
    " w     b   r     b   w",
    " wwwwwwwwwwwwwwwwww  w",
    " w                   w",
    " w D                 w",
    " wwwwwwwwwwwwwwwwwwwww",
  ]
]
  
let levelNum = 0

scene("game",() => {
  
  let hp = 3
  
  let hasKey = false
  
  const level = addLevel(levels[levelNum],levelConfig)

  const hpLabel = add([
    text("hp: "+hp,{
      "size":16
    }),
    pos(16,16),
    fixed()
  ])
  
  const player = add([
      sprite("hero"),
      pos(level.getPos(2,-1)),
      area({scale:0.5}),
      solid(),
      origin("bot"),
      body(),    
      {
        "speed": 150,
        "jumpSpeed": 350     
      }
  ]);
  
  player.play("idle")
  
  onUpdate("enemy",(e) => {
    e.move(e.xVel,0)
  })
  //enemy patrols
  onCollide("enemy", "barrier",(e,b) => {
  e.xVel = -e.xVel
  if (e.xVel < 0) {
    e.flipX(true)
  }
  else {
    e.flipX(false)
  }
  })
  //make sure jumping is in proper working order 
    onKeyPress("space",() => {
    if (player.isGrounded()) {
    player.jump(player.jumpSpeed)
      player.play("hit")
    } 
  })
  
  player.onCollide('wall',() => {
    player.play("idle")
  })
  //enemies do damage
  player.onCollide("enemy",() => {
    addKaboom(player.pos)
    hp--
    if (hp == 0) {
       wait(1,() => {
      go("lose")
    })
    }
  })
  //if the chest opens, the player gets to use the door
  player.onCollide("chest", (c) => {
    c.play("open")
    hasKey = true
  })
  //door is the passageway to the next level
  player.onCollide("door",() => {
    if(hasKey) {
      if(levelNum == levels.length -1) {
        go("win")
      }
    else {
  levelNum++ 
      
  localStorage.setItem("level",levelNum)    
      go("game")
      }
    }
  })
 
  player.onCollide("killBox",() => {
    addKaboom(player.pos)
    destroy(player)
    go("lose")
  })
  
add([
  rect(10000,10000),
  "killBox", //tag
  pos(1,600),
  area(),
  fixed(),
  color(RED)
])  
  
// Movement
  onKeyDown("right",() => {
    player.move(player.speed,0)    
    player.flipX(false)
  })
  
  onKeyDown("left",() => {
    player.move(-player.speed,0)  
    player.flipX(true)
  })
  
  onKeyPress(["right","left"],() => {
    player.play("run")
  })
  
  onKeyRelease(["right","left"],() => {
    player.play("idle")
  })
  
}) //CLOSE game

scene("menu",() => {
  add([
    text("Knights"),
    pos(width()/2,height()/2-150),
    origin("center"),
    color(YELLOW)
  ])
    add([
    text("and Wizards"),
    pos(width()/2,height()/2-75),
    origin("center"),
    color(YELLOW)
  ])
  add([
    text("PLAY"),
    "playButton",
    pos(width()/2,height()/2+75),
    origin("center"),
    area()
  ])
  add([
    text("Continue?"),
    "continue",
    
    pos(width()/2,height()/2+150),
    origin("center"),
    area()
  ])
  
  onClick("playButton",() => {
    go("game")
  })
  onClick("continue",() => {
    levelNum = 
  localStorage.getItem("level") ||
      0
    
  go("menu")  
  })
})
//go to win scene
scene("win",() => {
  add([
    text("You Win!"),
    pos(width()/2,height()/2),
    origin("center")
  ])
  add([
    text("Play Again"),
    "playButton",
    pos(width()/2,height()/2+75),
    origin("center"),
    area()
  ])
  onClick("playButton",() => {
    go("game")
  })
})
//go to you lose screen
scene("lose",() => {
    add([
    text("You Lose!"),
    pos(width()/2,height()/2),
    origin("center"),
    color(RED)
  ])
  add([
    text("RETRY"),
    "playButton",
    pos(width()/2,height()/2+75),
    origin("center"),
    area()
  ])
  onClick("playButton",() => {
    go("game")
  })
})

go("menu")
