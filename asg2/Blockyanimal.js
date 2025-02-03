/* Anson Chen */
/* achen167@ucsc.edu */

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
  
  gl.enable(gl.DEPTH_TEST);

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

  //Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }


  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Global related UI elements
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType=POINT;
let g_selectedSegments = 10;


let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_yellowAnimation=false;

function addActionsForHtmlUI(){

  //Button Events
  document.getElementById('animationYellowOnButton').onclick = function(){ g_yellowAnimation = true;};
  document.getElementById('animationYellowOffButton').onclick = function(){ g_yellowAnimation = false;};

  //Size Slider Events
  document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); });

  //Seg Slider Events
  document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

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

  // renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

// Called by browser repeatedly whenever it's time
function tick() {
    // Save the current time
    g_seconds = performance.now() / 1000.0 - g_startTime;
    // console.log(g_seconds);

    updateAnimationAngles();

    // Draw everything
    renderAllShapes();

    // Tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

function updateAnimationAngles(){
  if (g_yellowAnimation){
    g_yellowAngle = (45 * Math.sin(g_seconds));
  }

}



var g_shapesList = [];

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

  // renderAllShapes();
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

  // Pass the matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);


  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // body
  var body = new Cube();
  body.color = [1, 1, 1, 1];
  body.matrix.setTranslate(-0.25, -0.25, -0.25); // Move it forward so it's visible
  body.matrix.scale(0.5, 0.5, 0.8); // Ensure it has a visible size
  body.render();

  //head
  var head = new Cube();
  head.color = [0, 1, 1, 1];
  head.matrix.setTranslate(-0.25, 0.2, -0.25); // Move it forward so it's visible
  head.matrix.scale(0.25, 0.25, 0.25); // Ensure it has a visible size
  head.matrix.translate(0.5, 0.2, 0.001);
  head.render();

  //front left leg
  var front_left_leg = new Cube();
  front_left_leg.color = [0, 0.5, 1, 1];
  front_left_leg.matrix.setTranslate(-0.25, -0.25, -0.25); // Move it forward so it's visible
  front_left_leg.matrix.scale(0.15, 0.3, 0.15); // Ensure it has a visible size
  front_left_leg.matrix.translate(0.1, -1, 0.001);
  front_left_leg.render();

  //front_left_hoof
  var front_left_hoof = new Cone();
  front_left_hoof.color = [1, 1, 1, 1];
  front_left_hoof.matrix.setTranslate(-0.25, -0.25, -0.25); // Move it forward so it's visible
  front_left_hoof.matrix.scale(0.08, -0.08, 0.08); // Ensure it has a visible size
  front_left_hoof.matrix.translate(1.1, 3.7, 0.9);
  front_left_hoof.render();



  //front right leg
  var front_right_leg = new Cube();
  front_right_leg.color = [0, 0.5, 1, 1];
  front_right_leg.matrix.setTranslate(-0.25, -0.25, -0.25); // Move it forward so it's visible
  front_right_leg.matrix.scale(0.15, 0.3, 0.15); // Ensure it has a visible size
  front_right_leg.matrix.translate(2.25, -1, 0.001);
  front_right_leg.render();

  // Back Left Leg
  var back_left_leg = new Cube();
  back_left_leg.color = [0, 0.5, 1, 1];
  back_left_leg.matrix.setTranslate(-0.25, -0.25, 0.4); // Move it backward
  back_left_leg.matrix.scale(0.15, 0.3, 0.15);
  back_left_leg.matrix.translate(0.1, -1, 0.001);
  back_left_leg.render();

  // Back Right Leg
  var back_right_leg = new Cube();
  back_right_leg.color = [0, 0.5, 1, 1];
  back_right_leg.matrix.setTranslate(-0.25, -0.25, 0.4); // Move it backward
  back_right_leg.matrix.scale(0.15, 0.3, 0.15);
  back_right_leg.matrix.translate(2.25, -1, 0.001);
  back_right_leg.render();





  // //yellow
  // var yellow = new Cube();
  // yellow.color = [1, 1, 0, 1];
  // yellow.matrix.setTranslate(0, -0.5, 0);
  // yellow.matrix.rotate(-5, 1, 0, 0);
  // yellow.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  // var yellowCoordinatesMat = new Matrix4(yellow.matrix);
  // yellow.matrix.scale(0.25, 0.7, 0.5);
  // yellow.matrix.translate(-0.5, 0, 0);
  // yellow.render();

  // //magenta
  // var magenta = new Cube();
  // magenta.color = [1, 0, 1, 1];
  // magenta.matrix = yellowCoordinatesMat;
  // magenta.matrix.translate(-0.15, 0, 0);
  // magenta.matrix.rotate(g_magentaAngle, 0, 0, 1);
  // magenta.matrix.scale(0.3, -0.3, 0.3);
  // magenta.render();

  // //cone
  // var defaultCone = new Cone();
  // defaultCone.color = [1, 1, 1, 1];
  // defaultCone.matrix = new Matrix4();
  // defaultCone.render();

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
