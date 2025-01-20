/* Anson Chen */
/* achen167@ucsc.edu */

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

//Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;


function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

}

function connectVariablesToGLSL(){
   // Initialize shaders
   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Global related UI elements
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType=POINT;
let g_selectedSegments = 10;

function addActionsForHtmlUI(){

  //Button Events
  document.getElementById('green').onclick = function(){ g_selectedColor = [0.0,1.0,0.0,1.0];};
  document.getElementById('red').onclick = function(){ g_selectedColor = [1.0,0.0,0.0,1.0];};
  document.getElementById('clearButton').onclick = function(){ g_shapesList = []; renderAllShapes();};

  document.getElementById('pointButton').onclick = function(){ g_selectedType=POINT;};
  document.getElementById('triButton').onclick = function(){ g_selectedType=TRIANGLE;};
  document.getElementById('circleButton').onclick = function(){ g_selectedType=CIRCLE;};

  //Color Slider Events
  document.getElementById('redSlide').addEventListener('mouseup', function(){ g_selectedColor[0] = this.value/100; })
  document.getElementById('greenSlide').addEventListener('mouseup', function(){ g_selectedColor[1] = this.value/100; })
  document.getElementById('blueSlide').addEventListener('mouseup', function(){ g_selectedColor[2] = this.value/100; })

  //Size Slider Events
  document.getElementById('sizeSlide').addEventListener('mouseup', function(){ g_selectedSize = this.value; })

  //Seg Slider Events
  document.getElementById('segmentSlide').addEventListener('mouseup', function() { g_selectedSegments = parseInt(this.value); });

  document.getElementById('alphaSlide').addEventListener('mouseup', function() { g_selectedColor[3] = this.value / 100; });

  document.getElementById('recreateButton').onclick = function() {recreatePicture();};

}

function main() {

  setupWebGL();
  connectVariablesToGLSL();

  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}



var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = [];

function click(ev) {

  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;

  if (g_selectedType==POINT){
    point = new Point();
  } else if (g_selectedType == TRIANGLE){
    point = new Triangle();
  }else {
    point = new Circle();
    point.segments = g_selectedSegments; // Set the number of segments
  }

  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

function renderAllShapes(){
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {

    g_shapesList[i].render();


  }
}


const referenceTriangles = [
  [-1.0, 1.0, 1.0, 1.0, -1.0, 0.0, 0.0, 0.7, 1.0, 1.0],
  [1.0, 1.0, 1.0, 0.0, -1.0, 0.0, 0.0, 0.7, 1.0, 1.0],

  [-1.0, 0.0, 1.0, 0.0, -1.0, -1.0, 0.6, 0.3, 0.0, 1.0],
  [1.0, 0.0, 1.0, -1.0, -1.0, -1.0, 0.6, 0.3, 0.0, 1.0],

  [-0.1, -0.2, 0.1, -0.2, -0.1, -0.8, 0.4, 0.2, 0.0, 1.0],
  [0.1, -0.2, 0.1, -0.8, -0.1, -0.8, 0.4, 0.2, 0.0, 1.0],
  [-0.1, -0.1, 0.1, -0.1, 0.0, 0.1, 0.0, 0.8, 0.0, 1.0],
  [0.1, -0.1, 0.2, 0.0, 0.0, 0.1, 0.0, 0.8, 0.0, 1.0],
  [0.2, 0.0, 0.1, 0.1, 0.0, 0.1, 0.0, 0.8, 0.0, 1.0],
  [0.1, 0.1, -0.1, 0.1, 0.0, 0.1, 0.0, 0.8, 0.0, 1.0],
  [-0.1, 0.1, -0.2, 0.0, 0.0, 0.1, 0.0, 0.8, 0.0, 1.0],
  [-0.2, 0.0, -0.1, -0.1, 0.0, 0.1, 0.0, 0.8, 0.0, 1.0],

  [-0.6, -0.2, -0.5, -0.2, -0.6, -0.8, 0.4, 0.2, 0.0, 1.0],
  [-0.5, -0.2, -0.5, -0.8, -0.6, -0.8, 0.4, 0.2, 0.0, 1.0],
  [-0.6, -0.1, -0.5, -0.1, -0.55, 0.1, 0.0, 0.8, 0.0, 1.0],
  [-0.5, -0.1, -0.4, 0.0, -0.55, 0.1, 0.0, 0.8, 0.0, 1.0],
  [-0.4, 0.0, -0.5, 0.1, -0.55, 0.1, 0.0, 0.8, 0.0, 1.0],
  [-0.5, 0.1, -0.6, 0.1, -0.55, 0.1, 0.0, 0.8, 0.0, 1.0],
  [-0.6, 0.1, -0.7, 0.0, -0.55, 0.1, 0.0, 0.8, 0.0, 1.0],
  [-0.7, 0.0, -0.6, -0.1, -0.55, 0.1, 0.0, 0.8, 0.0, 1.0],

  [0.5, -0.2, 0.6, -0.2, 0.5, -0.8, 0.4, 0.2, 0.0, 1.0],
  [0.6, -0.2, 0.6, -0.8, 0.5, -0.8, 0.4, 0.2, 0.0, 1.0],
  [0.5, -0.1, 0.6, -0.1, 0.55, 0.1, 0.0, 0.8, 0.0, 1.0],
  [0.6, -0.1, 0.7, 0.0, 0.55, 0.1, 0.0, 0.8, 0.0, 1.0],
  [0.7, 0.0, 0.6, 0.1, 0.55, 0.1, 0.0, 0.8, 0.0, 1.0],
  [0.6, 0.1, 0.5, 0.1, 0.55, 0.1, 0.0, 0.8, 0.0, 1.0],
  [0.5, 0.1, 0.4, 0.0, 0.55, 0.1, 0.0, 0.8, 0.0, 1.0],
  [0.4, 0.0, 0.5, -0.1, 0.55, 0.1, 0.0, 0.8, 0.0, 1.0],

  [0.7, 0.8, 0.85, 0.85, 0.55, 0.85, 1.0, 1.0, 0.0, 1.0],
  [0.7, 0.8, 0.85, 0.65, 0.85, 0.85, 1.0, 1.0, 0.0, 1.0],
  [0.7, 0.8, 0.55, 0.65, 0.85, 0.65, 1.0, 1.0, 0.0, 1.0],
  [0.7, 0.8, 0.55, 0.85, 0.55, 0.65, 1.0, 1.0, 0.0, 1.0],

  [-0.8, 0.6, -0.7, 0.7, -0.9, 0.7, 1.0, 1.0, 1.0, 1.0],
  [-0.8, 0.6, -0.7, 0.5, -0.7, 0.7, 1.0, 1.0, 1.0, 1.0],
  [-0.8, 0.6, -0.9, 0.5, -0.7, 0.5, 1.0, 1.0, 1.0, 1.0],
  [-0.8, 0.6, -0.9, 0.7, -0.9, 0.5, 1.0, 1.0, 1.0, 1.0],

  [0.2, 0.55, 0.35, 0.65, 0.05, 0.65, 1.0, 1.0, 1.0, 1.0],
  [0.2, 0.55, 0.35, 0.45, 0.35, 0.65, 1.0, 1.0, 1.0, 1.0],
  [0.2, 0.55, 0.05, 0.45, 0.35, 0.45, 1.0, 1.0, 1.0, 1.0],
  [0.2, 0.55, 0.05, 0.65, 0.05, 0.45, 1.0, 1.0, 1.0, 1.0]
];


function recreatePicture() {
  // Clear the canvas
  gl.clear(gl.COLOR_BUFFER_BIT);

  for (let triangle of referenceTriangles) {
      const vertices = triangle.slice(0, 6); // [x1, y1, x2, y2, x3, y3]
      const color = triangle.slice(6); // [r, g, b, a]

      // Pass color to the fragment shader
      gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

      // Create a buffer for the triangle vertices
      const vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

      // Assign the buffer to the attribute variable
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);

      // Draw the triangle
      gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
