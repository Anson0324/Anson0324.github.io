class Cylinder {
    constructor(segments = 20) {
        this.type = 'cylinder';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.segments = segments;
    }

    render() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let angleStep = (2 * Math.PI) / this.segments;
        let baseCenterBottom = [0, 0, 0];
        let baseCenterTop = [0, 1, 0];

        // Draw bottom base
        for (let i = 0; i < this.segments; i++) {
            let theta1 = i * angleStep;
            let theta2 = (i + 1) * angleStep;
            let x1 = Math.cos(theta1);
            let z1 = Math.sin(theta1);
            let x2 = Math.cos(theta2);
            let z2 = Math.sin(theta2);
            drawTriangle3D([...baseCenterBottom, x1, 0, z1, x2, 0, z2]);
        }

        // Draw top base
        for (let i = 0; i < this.segments; i++) {
            let theta1 = i * angleStep;
            let theta2 = (i + 1) * angleStep;
            let x1 = Math.cos(theta1);
            let z1 = Math.sin(theta1);
            let x2 = Math.cos(theta2);
            let z2 = Math.sin(theta2);
            drawTriangle3D([...baseCenterTop, x2, 1, z2, x1, 1, z1]);
        }

        // Darker shade for the sides
        gl.uniform4f(u_FragColor, rgba[0] * 0.8, rgba[1] * 0.8, rgba[2] * 0.8, rgba[3]);

        // Draw side faces
        for (let i = 0; i < this.segments; i++) {
            let theta1 = i * angleStep;
            let theta2 = (i + 1) * angleStep;
            let x1 = Math.cos(theta1);
            let z1 = Math.sin(theta1);
            let x2 = Math.cos(theta2);
            let z2 = Math.sin(theta2);

            // Side face (two triangles forming a quad)
            drawTriangle3D([x1, 0, z1, x2, 0, z2, x1, 1, z1]);
            drawTriangle3D([x1, 1, z1, x2, 0, z2, x2, 1, z2]);
        }
    }
}
