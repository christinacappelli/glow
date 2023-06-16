class Particle {
  constructor(x, y, initialLifespan) {
    this.position = createVector(x, y);
    this.acceleration = createVector(0, 0);
    this.r = 1;
    this.t = 0;
    this.velocity = p5.Vector.random2D().mult(random(0.05, 1));

    this.maxspeed = 1;
    this.maxforce = 1;

    // lifespan
    this.initialLifespan = initialLifespan || 200; // lifespan of particle
    this.lifespan = this.initialLifespan;

  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.set(0, 0);
  }

  show() {
    push();
    noStroke();
    let lifespanRatio = this.lifespan / this.initialLifespan; // alpha based on lifespan
    let alpha = map(lifespanRatio, 0, 1, 10, 255);
    fill(255, 255, 255, alpha); // use mapped alpha value
    ellipse(this.position.x, this.position.y, this.r * 3);
    this.r = random(0.5, 2);
    this.t = random(TAU);
    this.t += 0.2;
    var scale = this.r + sin(this.t) * 3; // * 5 -- try
    pop();
  }

  glow() {
    push();
    noStroke();
    let hue = color(150, 255, 255, 200); //bright greenish-blue hue
    fill(hue);
    let blur = random(20, 150); // blur

    // Use lerp to smoothly change the radius over time
    let targetRadius = this.r * 5;
    let currentRadius = lerp(0, targetRadius, 0.8); // adjust the 0.1 to control the speed of the transition

    // Apply the shadow and draw the ellipse
    drawingContext.shadowColor = hue;
    //drawingContext.shadowBlur = blur;
    ellipse(this.position.x, this.position.y, currentRadius);

    // Reduce the lifespan of the particle
    // this.lifespan = this.lifespan - 1;
    pop();
  }

}
