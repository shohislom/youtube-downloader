$(".btn").click(function(){
    var link = $(".link").val();
    var format = $(".format").children("option:selected").val();
    var src = "" + link + "=" + format + "";
    download(link,format);
})
function download(link,format){
    $('.button-container').html('<iframe style="height:50px; border:none; overflow:hidden;" src="https://loader.to/api/button/?url=' + link + '&f=' + format + '"></iframe>')
}

let grid, cells, tiles;
let mx = 0;
let my = 0;
let cellSize = 20;

let paths = [
  [[0,0], [.5, 0], [0, .5]],
  [[.5, 0],[1, 0],[1, .5], [.5, 1], [0, 1], [0, .5]],
  [[1, 1], [1, .5], [.5, 1]],
]

class Cell{
  constructor(x, y, left){
    this.x = x;
    this.y = y;
    this.left = left;
    this.col  = 1;
  }
  render(){
    let [x, y] = [this.x, this.y];
    let idx = this.left ? 0 : 2;
    let t = tiles[idx + 1 - this.col];
    image(t, x, y, 1, 1);
  }
}

//TODO meta tiles
class Tile{
  constructor(x, y, size){
    this.x = x;
    this.y = y;
    this.g = createGraphics(this.size,this.size);
  }
}

function setup (){
  pixelDensity(1);
  createCanvas();
  colorMode(HSB, 1, 1, 1);
  windowResized();
}

let createGrid = () => {
  grid  = [];
  cells = [];
  tiles = [];
  [gw, gh] = [floor(width/cellSize), floor(height/cellSize)];
  [gw, gh] = [max(floor(gw/2)*2, 2), max(floor(gh/2)*2, 2)];//tileable
  for (let i = 0; i < gw; i++){
    grid.push([]);
    for (let j = 0; j < gh; j++){
      let cell = new Cell(i, j, random() < .5);
      grid[i].push(cell);
      cells.push(cell);
    }
  } 
}

let updateColors = () => {
  for (let i = 0; i < gw; i++){
    for (let j = 0; j < gh; j++){
      let c = grid[i][j];
      if (i == 0){
        if (j != 0){
          let c2 = grid[i][j-1];
          if (c.left ^ c2.left) c.col = c2.col;
          else                  c.col = 1-c2.col;
        }
      } else {
        let c2 = grid[i-1][j];
        if (c.left ^ c2.left) c.col = c2.col;
        else                  c.col = 1-c2.col;
      }
    }
  }
}

let createTiles = () => {
  tiles.map(t => t.remove());
  tiles = [];
  //noise
  let n = createGraphics(cellSize, cellSize)
  for (let i = 0; i < cellSize; i++){
    for (let j = 0; j < cellSize; j++){
      n.stroke(0, 20 + random()*50);
      n.point(i, j);
    }
  }
  
  //tiles
  for (let i = 0; i < 4; i++){
    let g = createGraphics(cellSize, cellSize);
    g.colorMode(HSB, 1, 1, 1);
    let col = i%2;
    let left = floor(i/2);
    g.noStroke();
    g.scale(cellSize);
    if (left == 0){
      g.translate(1, 0);
      g.scale(-1, 1);
    }
    
    for (let i = 0; i < 3; i++){
      g.fill(.6, col, 1);
      if (i%2 == 1) g.fill(.6, 1 - col, 1);
      
      let path = paths[i];
      g.beginShape();
      path.map(p => vertex(p[0], p[1]));
      g.endShape(CLOSE);
    }
    
    g.strokeWeight(3/cellSize);
    g.stroke(0);
    g.line(.5, 0, 0, .5);
    g.line(1, .5, .5, 1);
    g.image(n, 0, 0, 1, 1);
    tiles.push(g);
  } 
}

function init(){
  createGrid();
  createTiles();
  updateColors();
}

function draw(){
  background(0);
  scale(width/gw, height/gh);
  cells.map(c => c.render());
}

function mouseMoved(){
  let [px, py] = [mx, my];
  mx = floor(mouseX/(width/gw));
  my = floor(mouseY/(height/gh));
  if (px != mx || py != my){
    let c = grid[mx][my];
    c.left ^= true;
    updateColors();
  }
}

function mousePressed(){init()}

function windowResized(){
  resizeCanvas(windowWidth, windowHeight)
  init();
}