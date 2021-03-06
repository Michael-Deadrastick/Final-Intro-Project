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
 "s": () => [
    "sword",
    sprite("sword"),
    area(),
   origin("bot"),
   z(1)
   ],
 "h":() => [
    "heal",
    sprite("coin",{
      "anim":"spin"
    }),
    area({
      "scale":0.50
    }),
    origin("center"),
  ],
}

const levels = [
  [
    "      s       ",
    "     ww      ",
    "       b  o r b  c    h",
    "wwwwwwwwwwwwwwwwwww   w",
    "w                     w",
    "w                     w",
    "w D                   w",
    "wwwwwwwwwwwwwwwwwww   w",
  ],
  [
    "                                D        ",  
    "                            wwwwww       ", 
    "      s                 h  w             ",  
    "     ww   c               w              ",
    "      b o o  b           w               ",
    " wwww wwwwwwwwww www  ww                 "       
  ],
  [
    "     ww          s",
    "      b o o  b      c",
    " wwww wwwwwwwwww  wwww",
    " w         c         w",
    " w                   w",
    " w  h   b   r     b  w",
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
      "size":25
    }),
    pos(16,16),
    fixed()
  ])
  
  const player = add([
      sprite("hero"),
      pos(level.getPos(2,-1)),
      area({scale:1}),
      solid(),
      origin("bot"),
      body(),    
      {
        "speed": 150,
        "jumpSpeed": 350     
      }
  ]);
   
//When colliding with the lucky coin, gain one hp point
  player.onCollide("heal", (h) => {
    hp += 1
    destroy(h)
    let coin = h 
  })
  
//Equip Sword
 player.onCollide("sword", (s) => {
   s.use(follow(player, vec2(10,-5)))
 })
//Use sword
    onCollide("sword", "enemy", (s,e) => {
      if(isKeyDown("e")) {
      addKaboom(e.pos)
      destroy(e)
      }
    }) 
  
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
   
//Make sure jumping is in proper working order 
    onKeyPress("space",() => {
    if (player.isGrounded()) {
    player.jump(player.jumpSpeed)
      player.play("hit")
    } 
  })
  
  player.onCollide('wall',() => {
    player.play("idle")
  })
//Enemies do damage
  player.onCollide("enemy",() => {
    addKaboom(player.pos)
    hp--
    hpLabel.text = "hp: "+hp
    if (hp == 0) {
       wait(1,() => {
      go("lose")
    })
    }
  })
//If the chest(s) are opened, then the player can use the door. 
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
  
//Killbox for when the player falls off the map
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
  onKeyDown("d",() => {
    player.move(player.speed,0)    
    player.flipX(false)
  })
  onKeyDown("left",() => {
    player.move(-player.speed,0)  
    player.flipX(true)
  })
  onKeyDown("a",() => {
    player.move(-player.speed,0)  
    player.flipX(true)
  })
  onKeyPress(["right","left"],() => {
    player.play("run")
  })
  onKeyPress(["d","a"], () => {
    player.play("run")
  })
  onKeyRelease(["right","left"],() => {
    player.play("idle")
  })
  onKeyRelease(["d","a"],() => {
    player.play("idle")
  })
})

//Menu Scene
scene("menu",() => {
  add([
    text("Knights"),
    pos(width()/2,height()/2-150),
    origin("center"),
    color(YELLOW)
  ])
    add([
    text("vs Monsters"),
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
//FullScreen 
add([
  rect(100, 100),
  color(YELLOW),
  text("fullscreen mode", {
      size:30
    }),
    pos(),
    "fullScreenButton",
    area(),
])
  
 onClick("fullScreenButton", () => {
    fullscreen(!isFullscreen())
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
