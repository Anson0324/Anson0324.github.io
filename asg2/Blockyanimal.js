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

let g_mouseRotateX = 0; // Rotation around Y-axis
let g_mouseRotateY = 0; // Rotation around X-axis
let g_isDragging = false;
let g_prevMouseX = 0;
let g_prevMouseY = 0;



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

// Front Left Leg
let g_Front_Left_Leg_Angle = 0;
let g_Front_Left_Hoof_Angle = 0;
let g_Front_Left_Leg_Animation = false;
let g_Front_Left_Hoof_Animation = false;

// Front Right Leg
let g_Front_Right_Leg_Angle = 0;
let g_Front_Right_Hoof_Angle = 0;
let g_Front_Right_Leg_Animation = false;
let g_Front_Right_Hoof_Animation = false;

// Back Left Leg
let g_Back_Left_Leg_Angle = 0;
let g_Back_Left_Hoof_Angle = 0;
let g_Back_Left_Leg_Animation = false;
let g_Back_Left_Hoof_Animation = false;

// Back Right Leg
let g_Back_Right_Leg_Angle = 0;
let g_Back_Right_Hoof_Angle = 0;
let g_Back_Right_Leg_Animation = false;
let g_Back_Right_Hoof_Animation = false;

//special move
let g_pokeAnimation = false;
let g_pokeTime = 0; // Keeps track of time for the poke animation


function addActionsForHtmlUI(){
  //special move
  document.addEventListener("mousedown", function(event) {
    if (event.shiftKey) {
        g_pokeAnimation = !g_pokeAnimation; // Toggle poke animation on/off
    }
  });

  //view angle
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

  //Front_Left_Leg
  document.getElementById('Front_Left_Leg_animation_On_Button').onclick = function(){ g_Front_Left_Leg_Animation = true;};
  document.getElementById('Front_Left_Leg_animation_Off_Button').onclick = function(){ g_Front_Left_Leg_Animation = false;};
  document.getElementById('Front_Left_Hoof_animation_On_Button').onclick = function(){ g_Front_Left_Hoof_Animation = true;};
  document.getElementById('Front_Left_Hoof_animation_Off_Button').onclick = function(){ g_Front_Left_Hoof_Animation = false;};
  document.getElementById('Front_Left_LegSlide').addEventListener('mousemove', function() { g_Front_Left_Leg_Angle = this.value; renderAllShapes(); });
  document.getElementById('Front_Left_HoofSlide').addEventListener('mousemove', function() { g_Front_Left_Hoof_Angle = this.value; renderAllShapes(); });

  // Front_Right_Leg
  document.getElementById('Front_Right_Leg_animation_On_Button').onclick = function(){ g_Front_Right_Leg_Animation = true;};
  document.getElementById('Front_Right_Leg_animation_Off_Button').onclick = function(){ g_Front_Right_Leg_Animation = false;};
  document.getElementById('Front_Right_Hoof_animation_On_Button').onclick = function(){ g_Front_Right_Hoof_Animation = true;};
  document.getElementById('Front_Right_Hoof_animation_Off_Button').onclick = function(){ g_Front_Right_Hoof_Animation = false;};
  document.getElementById('Front_Right_LegSlide').addEventListener('mousemove', function() { g_Front_Right_Leg_Angle = this.value; });
  document.getElementById('Front_Right_HoofSlide').addEventListener('mousemove', function() { g_Front_Right_Hoof_Angle = this.value; });

  // Back_Left_Leg
  document.getElementById('Back_Left_Leg_animation_On_Button').onclick = function(){ g_Back_Left_Leg_Animation = true;};
  document.getElementById('Back_Left_Leg_animation_Off_Button').onclick = function(){ g_Back_Left_Leg_Animation = false;};
  document.getElementById('Back_Left_Hoof_animation_On_Button').onclick = function(){ g_Back_Left_Hoof_Animation = true;};
  document.getElementById('Back_Left_Hoof_animation_Off_Button').onclick = function(){ g_Back_Left_Hoof_Animation = false;};
  document.getElementById('Back_Left_LegSlide').addEventListener('mousemove', function() { g_Back_Left_Leg_Angle = this.value; });
  document.getElementById('Back_Left_HoofSlide').addEventListener('mousemove', function() { g_Back_Left_Hoof_Angle = this.value; });

  // Back_Right_Leg
  document.getElementById('Back_Right_Leg_animation_On_Button').onclick = function(){ g_Back_Right_Leg_Animation = true;};
  document.getElementById('Back_Right_Leg_animation_Off_Button').onclick = function(){ g_Back_Right_Leg_Animation = false;};
  document.getElementById('Back_Right_Hoof_animation_On_Button').onclick = function(){ g_Back_Right_Hoof_Animation = true;};
  document.getElementById('Back_Right_Hoof_animation_Off_Button').onclick = function(){ g_Back_Right_Hoof_Animation = false;};
  document.getElementById('Back_Right_LegSlide').addEventListener('mousemove', function() { g_Back_Right_Leg_Angle = this.value; });
  document.getElementById('Back_Right_HoofSlide').addEventListener('mousemove', function() { g_Back_Right_Hoof_Angle = this.value; });




}

function main() {

  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  // Register mouse events for rotation
  canvas.addEventListener('mousedown', function (ev) {
      g_isDragging = true;
      g_prevMouseX = ev.clientX;
      g_prevMouseY = ev.clientY;
  });

  canvas.addEventListener('mousemove', function (ev) {
      if (g_isDragging) {
          let deltaX = ev.clientX - g_prevMouseX;
          let deltaY = ev.clientY - g_prevMouseY;

          g_mouseRotateX -= deltaX * 0.5; // Adjust sensitivity if needed
          g_mouseRotateY -= deltaY * 0.5;

          g_prevMouseX = ev.clientX;
          g_prevMouseY = ev.clientY;

          renderAllShapes();
      }
  });

  canvas.addEventListener('mouseup', function () {
      g_isDragging = false;
  });

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Start the animation loop
  requestAnimationFrame(tick);
}


var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 0;

function updateFPS() {
  let now = performance.now();
  frameCount++;

  // Only update FPS once per second
  if (now - lastFrameTime >= 1000) {
      fps = frameCount;
      frameCount = 0;
      lastFrameTime = now;

      // Update the FPS display
      document.getElementById("fpsCounter").innerText = `FPS: ${fps}`;
  }
}



// Called by browser repeatedly whenever it's time
function tick() {
    // Save the current time
    g_seconds = performance.now() / 1000.0 - g_startTime;
    // console.log(g_seconds);
    updateAnimationAngles();
    // Draw everything
    renderAllShapes();
    //fps
    updateFPS();
    // Tell the browser to update again when it has time
    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  //special move
  if (g_pokeAnimation) {
    g_pokeTime += 0.1; // Increase animation time

    g_Front_Left_Leg_Angle = 45 * Math.sin(g_pokeTime);
    g_Front_Right_Leg_Angle = 45 * Math.sin(g_pokeTime);
    g_Back_Left_Leg_Angle = 45 * Math.sin(g_pokeTime);
    g_Back_Right_Leg_Angle = 45 * Math.sin(g_pokeTime);

    g_globalAngle = 30 * Math.sin(g_pokeTime * 2);

    g_Front_Left_Hoof_Angle = 15 * Math.sin(g_pokeTime * 5);
    g_Front_Right_Hoof_Angle = 15 * Math.sin(g_pokeTime * 5);
    g_Back_Left_Hoof_Angle = 15 * Math.sin(g_pokeTime * 5);
    g_Back_Right_Hoof_Angle = 15 * Math.sin(g_pokeTime * 5);
    
    return;
  }

  if (g_Front_Left_Leg_Animation) {
    g_Front_Left_Leg_Angle = 30 * Math.sin(g_seconds); // Legs swing back and forth
  }

  if (g_Front_Left_Hoof_Animation) {
    g_Front_Left_Hoof_Angle = 10 * Math.sin(g_seconds); // Hooves move slightly, following legs
  }

  if (g_Front_Right_Leg_Animation) {
    g_Front_Right_Leg_Angle = 30 * Math.sin(g_seconds); // Legs swing back and forth
  }

  if (g_Front_Right_Hoof_Animation) {
    g_Front_Right_Hoof_Angle = 10 * Math.sin(g_seconds); // Hooves move slightly, following legs
  }

  if (g_Back_Left_Leg_Animation) {
    g_Back_Left_Leg_Angle = 30 * Math.sin(g_seconds); // Legs swing back and forth
  }

  if (g_Back_Left_Hoof_Animation) {
    g_Back_Left_Hoof_Angle = 10 * Math.sin(g_seconds); // Hooves move slightly, following legs
  }

  if (g_Back_Right_Leg_Animation) {
    g_Back_Right_Leg_Angle = 30 * Math.sin(g_seconds); // Legs swing back and forth
  }

  if (g_Back_Right_Hoof_Animation) {
    g_Back_Right_Hoof_Angle = 10 * Math.sin(g_seconds); // Hooves move slightly, following legs
  }
}




function renderAllShapes(){

  // Create the combined rotation matrix
  var globalRotMat = new Matrix4()
      .rotate(g_mouseRotateX, 0, 1, 0)  // Rotate around Y-axis (horizontal)
      .rotate(g_mouseRotateY, 1, 0, 0); // Rotate around X-axis (vertical)

  // Apply the camera slider rotation on top of mouse rotation
  globalRotMat.rotate(g_globalAngle, 0, 1, 0); 

  // Pass the final matrix to the vertex shader
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // body
  var body = new Cube();
  body.color = [1, 1, 1, 1];
  body.matrix.setTranslate(-0.25, -0.25, -0.25); // Move it forward so it's visible
  body.matrix.scale(0.5, 0.5, 0.8); // Ensure it has a visible size
  body.render();

  //head
  var head = new Cube();
  head.color = [0.75, 0.75, 0.75, 1];
  head.matrix.setTranslate(-0.25, 0.2, -0.25); // Move it forward so it's visible
  head.matrix.scale(0.25, 0.25, 0.25); // Ensure it has a visible size
  head.matrix.translate(0.5, 0.2, 0.001);
  head.render();


  //front left leg
  var front_left_leg = new Cylinder();
  front_left_leg.color = [0.5, 0.5, 0.5, 1]; // Brown color
  front_left_leg.matrix.setTranslate(-0.25, -0.25, -0.25); // Move it forward so it's visible
  front_left_leg.matrix.rotate(-g_Front_Left_Leg_Angle, 1, 0, 0);
  var front_left_leg_Mat = new Matrix4(front_left_leg.matrix);
  front_left_leg.matrix.scale(0.08, 0.15, 0.08); // Ensure it has a visible size
  front_left_leg.matrix.translate(1.1, -1, 0.9);
  front_left_leg.render();
  // Front Left Hoof
  var front_left_hoof = new Cylinder();
  front_left_hoof.color = [0.3, 0.3, 0.3, 1];
  front_left_hoof.matrix = new Matrix4(front_left_leg_Mat);
  front_left_hoof.matrix.rotate(-g_Front_Left_Hoof_Angle, 1, 0, 0);
  var third_test = new Matrix4(front_left_hoof.matrix);
  front_left_hoof.matrix.scale(0.08, 0.15, 0.08);
  front_left_hoof.matrix.translate(1.1, -2, 0.9);
  front_left_hoof.render();
  //third
  var thrid = new Cone();
  thrid.color = [0, 1, 0, 1];
  thrid.matrix = new Matrix4(third_test);
  thrid.matrix.rotate(-g_Front_Left_Hoof_Angle, 1, 0, 0);
  thrid.matrix.scale(0.08, 0.15, 0.08);
  thrid.matrix.translate(1.1, -3, 0.9);
  thrid.render();
  

  // Front Right Leg
  var front_right_leg = new Cylinder();
  front_right_leg.color = [0.5, 0.5, 0.5, 1];
  front_right_leg.matrix.setTranslate(-0.25, -0.25, -0.25); // Move it forward so it's visible
  front_right_leg.matrix.rotate(-g_Front_Right_Leg_Angle, 1, 0, 0);
  var front_right_leg_Mat = new Matrix4(front_right_leg.matrix);
  front_right_leg.matrix.scale(0.08, 0.15, 0.08); // Ensure it has a visible size
  front_right_leg.matrix.translate(5.2, -1, 0.9);
  front_right_leg.render();
  // Front Right Hoof
  var front_right_hoof = new Cylinder();
  front_right_hoof.color = [0.3, 0.3, 0.3, 1];
  front_right_hoof.matrix = new Matrix4(front_right_leg_Mat);
  front_right_hoof.matrix.rotate(-g_Front_Right_Hoof_Angle, 1, 0, 0);
  front_right_hoof.matrix.scale(0.08, 0.15, 0.08);
  front_right_hoof.matrix.translate(5.2, -2, 0.9);
  front_right_hoof.render();

  // Back Left Leg
  var back_left_leg = new Cylinder();
  back_left_leg.color = [0.5, 0.5, 0.5, 1];
  back_left_leg.matrix.setTranslate(-0.25, -0.25, 0.4); // Move it backward
  back_left_leg.matrix.rotate(g_Back_Left_Leg_Angle, 1, 0, 0);
  var back_left_leg_Mat = new Matrix4(back_left_leg.matrix);
  back_left_leg.matrix.scale(0.08, 0.15, 0.08);
  back_left_leg.matrix.translate(1.1, -1, 0.9);
  back_left_leg.render();
  // Back Left Hoof
  var back_left_hoof = new Cylinder();
  back_left_hoof.color = [0.3, 0.3, 0.3, 1];
  back_left_hoof.matrix = new Matrix4(back_left_leg_Mat);
  back_left_hoof.matrix.rotate(g_Back_Left_Hoof_Angle, 1, 0, 0);
  back_left_hoof.matrix.scale(0.08, 0.15, 0.08);
  back_left_hoof.matrix.translate(1.1, -2, 0.9);
  back_left_hoof.render();

  // Back Right Leg
  var back_right_leg = new Cylinder();
  back_right_leg.color = [0.5, 0.5, 0.5, 1];
  back_right_leg.matrix.setTranslate(-0.25, -0.25, 0.4); // Move it backward
  back_right_leg.matrix.rotate(g_Back_Right_Leg_Angle, 1, 0, 0);
  var back_right_leg_Mat = new Matrix4(back_right_leg.matrix);
  back_right_leg.matrix.scale(0.08, 0.15, 0.08);
  back_right_leg.matrix.translate(5.2, -1, 0.9);
  back_right_leg.render();
  // Back Right Hoof
  var back_right_hoof = new Cylinder();
  back_right_hoof.color = [0.3, 0.3, 0.3, 1];
  back_right_hoof.matrix = new Matrix4(back_right_leg_Mat);
  back_right_hoof.matrix.rotate(g_Back_Right_Hoof_Angle, 1, 0, 0);
  back_right_hoof.matrix.scale(0.08, 0.15, 0.08);
  back_right_hoof.matrix.translate(5.2, -2, 0.9);
  back_right_hoof.render();

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
