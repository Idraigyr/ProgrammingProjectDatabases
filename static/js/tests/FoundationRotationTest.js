/*This is a test for foundation rotation*/
function returnMultipliedString(string, length){
  let str = "";
  for(let i = 0; i < length; i++){
    str += string;
  }
  return str;
}

function printFoundationGrid(grid, width, length, oneline=false){
  console.log(returnMultipliedString("*", width));
  for(let i = 0; i < length; i++){
    let currentRow = "";
    const rowColor = [];
    for(let j = 0; j < width; j++){
      currentRow += "%c" + grid[i*width + j] + " ";
      if(grid[i*width + j] === 1){
        rowColor.push("color: green;");
        continue;
      }
      rowColor.push("color: white;");
    }
    if(i % 2 === 0){
      currentRow += " ";
    }
    console.log(currentRow, ...rowColor);
  }
  console.log(returnMultipliedString("*", width));
}

class A{
  constructor(width, length) {
    this.width = width;
    this.length = length;
    this.grid = new Array(this.width*this.length).fill(0);
  }

  rotate(degrees=90){
    if(degrees % 90 !== 0){
      throw new Error("degrees must be a multiple of 90");
    }
    console.log("before");
    printFoundationGrid(this.grid, this.width, this.length);
    const rotate90Deg = () => {
      const temp = this.width;
      this.width = this.length;
      this.length = temp;
      let rotatedGrid = new Array(this.width*this.length).fill(0);
      for(let x = 0; x < this.width; x++){
        for(let z = 0; z < this.length; z++){
          let index = x*this.length + z;
          // let newIndex = z*this.width + this.width - 1 - x;
          let newIndex = (this.length - z - 1) * this.width + x;
          if(newIndex >= this.width*this.length || newIndex < 0 || index >= this.width*this.length || index < 0){
            throw new Error("newIndex is out of bounds");
          }
          rotatedGrid[newIndex] = this.grid[index];
        }
      }
      this.grid = rotatedGrid;
    }

    for(let i = 0; i < degrees/90; i++){
      rotate90Deg();
    }

    console.log("after");
    printFoundationGrid(this.grid, this.width, this.length);
  }
}
const minSize = 5;
const maxSize = 11;
let width = Math.round(Math.random()*(maxSize - minSize) + minSize);
if(width % 2 === 0){
  width += 1;
}
let length = Math.round(Math.random()*(maxSize - minSize) + minSize);
if(length % 2 === 0){
  length += 1;
}

const a = new A(width, length);
for(let i = 0; i < Math.round(Math.random()*a.width*a.length); i++){
    a.grid[Math.round(Math.random()*a.width*a.length)] = 1;
}
a.rotate(360)