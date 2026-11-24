const levels=[

() => ({
    floorY: 350,
    worldWidth: 1000,

    platforms: [
        { x:250, y:250, width:80, height:30},
        { x:300, y: 150, width: 80, height: 30},
    ],
    exit: {x: 800, y: 100, ytop:50, ybottom:200, width:30, height:30, dir:1},
    items: [
        {x:500, y:150, radius: 20},
    ],
    enemies: [
        {x:100, y:300, width: 50, height:30, xleft:100, xright:800, dir: 1}
    ]
    
}),

() => ({
    floorY: 350,
    worldWidth: 1500,
    
    platforms: [
        { x: 150, y: 300, width: 80, height: 30 },
        { x: 350, y: 220, width: 80, height: 30 },
        { x: 550, y: 140, width: 80, height: 30 },
    ],
    exit: { x: 650, y: 80, ytop: 50, ybottom: 200, width: 30, height: 30, dir: 1 },
    items: [
        { x: 250, y: 260, radius: 20 }
    ],
    enemies: [
        { x: 490, y: 180, width: 50, height: 30, xleft: 400, xright: 800, dir: 1 }
    ]
}),

() => ({
    floorY: 350,
    worldWidth: 1500,
    
    platforms: [
        { x: 0, y: 140, width: 80, height: 210 },
        { x: 200, y: 240, width: 80, height: 110 },
        { x: 400, y: 340, width: 80, height: 10 },
    ],
    exit: { x: 680, y: 0, ytop: 50, ybottom: 200, width: 30, height: 30, dir: 1 },
    items: [
        { x: 200, y: 150, radius: 20 }
    ],
    enemies: [
        { x: 350, y: 280, width: 50, height: 30, xleft: 400, xright: 800, dir: 1 }
    ]
})

];