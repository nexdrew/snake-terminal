const keypress = require('keypress')
const logUpdate = require('log-update')
const sywac = require('sywac')

// logUpdate(`
// ┌────────┐
// │▀ ▉ ░   │
// │        │
// │        │
// │        │
// │        │
// │        │
// │        │
// │        │
// └────────┘
// `)

const UP = '↑'
const DOWN = '↓'
const RIGHT = '→'
const LEFT = '←'

function renderGrid (gridSize, snake, direction, opts) {
  let p = '┌'
  for (let i = 0; i < gridSize; i++) { p += '─' }
  p += '┐\n'
  for (let rowIndex = 0; rowIndex < gridSize; rowIndex++) {
    p += renderRow(gridSize, rowIndex, snake, opts)
  }
  p += '└'
  for (let i = 0; i < gridSize; i++) { p += '─' }
  p += '┘\n'
  p += `Moving ${direction} at ${snake[0].r},${snake[0].c}`
  return p
}

function renderRow (gridSize, rowIndex, snake, opts) {
  let r = '│'
  for (let colIndex = 0; colIndex < gridSize; colIndex++) {
    if (snake.some(coord => coord.r === rowIndex && coord.c === colIndex)) r += opts.body
    // TODO else if fruit
    else r += ' '
  }
  r += '│\n'
  return r
}

function lose (msg) {
  console.log(msg)
  process.exit()
}

function move (gridSize, snake, direction) {
  let row = snake[0].r
  let col = snake[0].c

  if (direction === RIGHT) col++
  else if (direction === LEFT) col--
  else if (direction === UP) row--
  else row++

  if (row < 0) lose('You ran into the top wall!')
  else if (row >= gridSize) lose('You ran into the bottom wall!')

  if (col < 0) lose('You ran into the left wall!')
  else if (col >= gridSize) lose('You ran into the right wall!')

  if (snake.some(coord => coord.r === row && coord.c === col)) lose('You ran into your tail!')

  for (let x = snake.length-1; x > 0; x--) {
    snake[x].r = snake[x-1].r
    snake[x].c = snake[x-1].c
  }
  snake[0].r = row
  snake[0].c = col
}

function play () {
  sywac
    .number('-g, --grid <size>', { defaultValue: 16 })
    .enumeration('-s, --speed <speed>', {
      choices: ['slow', 'normal', 'fast', 'insane'],
      defaultValue: 'normal'
    })
    .string('-b, --body <char>', {
      defaultValue: '▉',
      coerce: v => (v && v[0]) || '▉'
    })
    .help('-h, --help')
    .parseAndExit()
    .then(argv => {
      const gridSize = argv.grid

      console.log(`Grid ${gridSize}x${gridSize}, Speed: ${argv.speed}`)
      let millis = 110
      switch (argv.speed) {
        case 'slow':
          millis = 160
          break
        case 'fast':
          millis = 60
          break
        case 'insane':
          millis = 30
          break
      }

      const opts = {
        body: argv.body
      }
      const snake = []

      let direction = RIGHT
      // let keypressAllowed = true

      keypress(process.stdin)
      process.stdin.on('keypress', function (ch, key) {
        if (key && key.ctrl && key.name == 'c') lose('You gave up!')

        // if (!keypressAllowed) return
        // let dirBefore = direction

        if (key && key.name === 'up' && direction !== DOWN) direction = UP
        else if (key && key.name === 'down' && direction !== UP) direction = DOWN
        else if (key && key.name === 'right' && direction !== LEFT) direction = RIGHT
        else if (key && key.name === 'left' && direction !== RIGHT) direction = LEFT

        // if (dirBefore !== direction) keypressAllowed = false
      })
      process.stdin.setRawMode(true)
      process.stdin.resume()

      snake.push({ r: 0, c: 0 })
      logUpdate(renderGrid(gridSize, snake, direction, opts))
      setInterval(() => {
        move(gridSize, snake, direction)
        // keypressAllowed = true
        logUpdate(renderGrid(gridSize, snake, direction, opts))
      }, millis)

      // setInterval(() => {
      //   keypressAllowed = true
      // }, millis / 2)

      setInterval(() => {
        let r = snake[snake.length-1].r
        let c = snake[snake.length-1].c
        if (direction === UP) r++
        else if (direction === DOWN) r--
        else if (direction === RIGHT) c--
        else c++
        snake.push({ r, c })
      }, 1000)
    })
}

module.exports = {
  lose,
  move,
  play,
  renderGrid,
  renderRow
}

if (require.main === module) module.exports.play()
