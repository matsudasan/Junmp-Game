const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let anime

const srcs = {
    back: './img/背景.png',
    human: './img/棒人間.png',
    Aaron: './img/アーロン.png',
    bird: './img/鳥.png'
}

const game = {
    images: {},
    back: { x: 0, moveX: -10 },
    enemys: [],
    score: 0,
    Aaronmeter: 0,
    birdmeter: 0
}

const GCD = (x, y) => {
    if (y === 0) return x
    return GCD(y, x % y)
}

const Shrink = (img, string, num) => {
    const max = GCD(img.width, img.height)
    const aspectW = img.width / max
    const aspectH = img.height / max
    if (string === 'height') {
        const imageWidth = (num * aspectW) / aspectH
        return [imageWidth, num]
    } else if (string === 'width') {
        const imageHeight = (num * aspectH) / aspectW
        return [num, imageHeight]
    }
}

const Random = (min, max) => {
    return Math.floor(Math.random() * (max + 1 - min)) + min
}

const LoadImage = (src) => {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.src = src
    })
}

const Init = async () => {
    for (let key in srcs) {
        const img = await LoadImage(srcs[key])
        game.images[key] = img
    }
    CreateHuman()
    anime = setInterval(Draw, 50)
}

const DrawBack = () => {
    const x = (Math.abs(game.back.x) + 1) % canvas.width
    ctx.drawImage(game.images.back, game.back.x, 0, canvas.width, canvas.height)
    ctx.drawImage(game.images.back, canvas.width - x, 0, canvas.width, canvas.height)
    game.back.x += game.back.moveX
    if (game.back.x <= -canvas.width) {
        game.back.x = 0
    }
}

const CreateHuman = () => {
    const [HumanWidth, HumanHeight] = Shrink(game.images.human, 'height', 130)
    game.human = {
        x: 0,
        y: canvas.height - HumanHeight,
        moveY: 0,
        width: HumanWidth,
        height: HumanHeight,
        image: game.images.human
    }
}

const CreatAaron = () => {
    const [AaronWidth, AaronHeight] = Shrink(game.images.Aaron, 'height', 100)
    game.enemys.push({
        x: canvas.width,
        y: canvas.height - AaronHeight,
        moveX: -15,
        width: AaronWidth,
        height: AaronHeight,
        img: game.images.Aaron
    })
}

const CreatBird = () => {
    const [BirdWidth, BirdHeight] = Shrink(game.images.bird, 'height', 100)
    game.enemys.push({
        x: canvas.width,
        y: Random(0, canvas.height - game.human.height - BirdHeight),
        moveX: -25,
        width: BirdWidth,
        height: BirdHeight,
        img: game.images.bird
    })
}

const DrawEnemy = () => {
    const number = []
    for (let i = 0; i < game.enemys.length; i++) {
        const enemy = game.enemys[i]
        if (enemy.x + enemy.width <= 0) {
            number.push(i)
        }
        ctx.drawImage(enemy.img, enemy.x, enemy.y, enemy.width, enemy.height)
        //デバック用
        // ctx.strokeStyle = "red"
        // ctx.strokeRect(enemy.x, enemy.y, enemy.width, enemy.height)
        enemy.x += enemy.moveX
    }
    for (let i = 0; i < number.length; i++) {
        game.enemys.splice(number[i], 1)
    }
}

const DrawHuman = () => {
    game.human.y += game.human.moveY
    if (game.human.y >= canvas.height - game.human.height) {
        game.human.y = canvas.height - game.human.height
        game.human.moveY = 0
    } else {
        game.human.moveY += 7
    }
    ctx.drawImage(game.images.human, game.human.x, game.human.y, game.human.width, game.human.height)
    //デバック用
    // ctx.strokeStyle = "red"
    // ctx.strokeRect(game.human.x, game.human.y, game.human.width, game.human.height)
}

const DrawScore = () => {
    ctx.font = '24px serif';
    ctx.fillText(`score: ${game.score}`, 0, 30);
}

const JageHit = () => {
    for (const enemy of game.enemys) {
        if (
            game.human.x < (enemy.x + enemy.width) &&
            enemy.x < (game.human.x + game.human.width * 0.6) &&
            game.human.y < (enemy.y + enemy.height) &&
            enemy.y < (game.human.y + game.human.height * 0.6)
        ) {
            game.GameOver = true
            clearInterval(anime)

            const text1 = 'Game Over!'
            const fontsize1 = 100
            ctx.font = `bold ${fontsize1}px serif`
            const textWidth1 = ctx.measureText(text1).width
            ctx.fillText(text1, (canvas.width - textWidth1) / 2, 200)

            const text2 = 'キーを押してリスタート'
            const fontsize2 = 30
            ctx.font = `bold ${fontsize2}px serif`
            const textWidth2 = ctx.measureText(text2).width
            ctx.fillText(text2, (canvas.width - textWidth2) / 2, 230)

        }
    }
}

const ReSrart = () => {
    game.GameOver = false
    game.enemys = []
    game.back = { x: 0, moveX: -10 }
    game.human.y = canvas.height - game.human.height
    game.human.moveY = 0
    game.score = 0
    anime = setInterval(Draw, 50)
}

const Draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (Math.floor(Math.random() * 120) === 0 || game.Aaronmeter >= 200) {
        CreatAaron()
        game.Aaronmeter = 0
    }
    if (Math.floor(Math.random() * 200) === 0 || game.birdmeter >= 300) {
        game.birdmeter = 0
        CreatBird()
    }

    JageHit()
    DrawBack()
    DrawEnemy()
    DrawHuman()
    DrawScore()
    game.Aaronmeter += 5
    game.birdmeter += 2
    game.score += 1
}

document.onkeydown = (event) => {
    if (event.key === ' ' && (game.human.y >= canvas.height - game.human.height)) {
        game.human.moveY = -70
    }
    if (game.GameOver) {
        ReSrart()
    }
}

Init()
