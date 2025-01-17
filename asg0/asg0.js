/* Anson Chen */
/* achen167@ucsc.edu */

function main() {
  let canvas = document.getElementById('asg0');
  let ctx = canvas.getContext('2d');

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate(canvas.width / 2, canvas.height / 2);

  document.getElementById('draw-operation-button').addEventListener('click', () => handleDrawOperationEvent(ctx));
}

/**
 * handleDrawOperationEvent(ctx)
 * Handles vector operations based on user selection and visualizes the result.
 * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context
 */
function handleDrawOperationEvent(ctx) {
  ctx.clearRect(-200, -200, 400, 400);
  ctx.fillStyle = "black";
  ctx.fillRect(-200, -200, 400, 400);

  const x1 = parseFloat(document.getElementById('x-coordinate-v1').value) || 0;
  const y1 = parseFloat(document.getElementById('y-coordinate-v1').value) || 0;
  const v1 = new Vector3([x1, y1, 0]);
  drawVector(ctx, v1, "red");

  const x2 = parseFloat(document.getElementById('x-coordinate-v2').value) || 0;
  const y2 = parseFloat(document.getElementById('y-coordinate-v2').value) || 0;
  const v2 = new Vector3([x2, y2, 0]);
  drawVector(ctx, v2, "blue");

  const operation = document.getElementById('operation').value;
  const scalar = parseFloat(document.getElementById('scalar').value) || 1;

  if (operation === "add") {
    const v3 = v1.add(v2);
    drawVector(ctx, v3, "green");
  } else if (operation === "sub") {
    const v3 = v1.sub(v2);
    drawVector(ctx, v3, "green");
  } else if (operation === "mul") {
    const v3 = v1.mul(scalar);
    const v4 = v2.mul(scalar);
    drawVector(ctx, v3, "green");
    drawVector(ctx, v4, "green");
  } else if (operation === "div") {
    const v3 = v1.div(scalar);
    const v4 = v2.div(scalar);
    drawVector(ctx, v3, "green");
    drawVector(ctx, v4, "green");
  } else if (operation === "magnitude") {
    console.log(`Magnitude of v1: ${v1.magnitude()}`);
    console.log(`Magnitude of v2: ${v2.magnitude()}`);
  } else if (operation === "normalize") {
    const v3 = v1.normalize();
    const v4 = v2.normalize();
    drawVector(ctx, v3, "green");
    drawVector(ctx, v4, "green");
  } else if (operation === "angle") {
    const angle = angleBetween(v1, v2);
    console.log(`Angle between v1 and v2: ${angle.toFixed(2)} degrees`);
  } else if (operation === "area") {
    const area = areaTriangle(v1, v2);
    console.log("Area of the triangle: %f", area);;
  }
}

/**
 * Calculate the area of the triangle formed by two vectors.
 * @param {Vector3} v1 - The first vector.
 * @param {Vector3} v2 - The second vector.
 * @return {number} The area of the triangle.
 */
function areaTriangle(v1, v2) {
  const crossProduct = Vector3.cross(v1, v2);
  const magnitude = crossProduct.magnitude();
  return magnitude / 2; // Area of the triangle is half the parallelogram's area.
}

function drawVector(ctx, v, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  const scaledX = v.elements[0] * 20;
  const scaledY = v.elements[1] * 20;
  ctx.lineTo(scaledX, -scaledY);
  ctx.stroke();
}
