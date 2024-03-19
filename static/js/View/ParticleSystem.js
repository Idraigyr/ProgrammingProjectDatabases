import * as THREE from "three";

const VS = `
uniform float pointMultiplier;

attribute float size;
attribute float angle;
attribute vec4 colour;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * pointMultiplier / gl_Position.w;

  vAngle = vec2(cos(angle), sin(angle));
  vColour = colour;
}`;
const FS = `

uniform sampler2D diffuseTexture;

varying vec4 vColour;
varying vec2 vAngle;

void main() {
  vec2 coords = (gl_PointCoord - 0.5) * mat2(vAngle.x, vAngle.y, -vAngle.y, vAngle.x) + 0.5;
  gl_FragColor = texture2D(diffuseTexture, coords) * vColour;
}`;

/**
 * class for a linear spline
*/
class LinearSpline{
    #points;
    #lerp;
    /**
     * initialises class
     * @param {function} lerp
     */
    constructor(lerp) {
        this.#points = [];
        this.#lerp = lerp;
    }

    /**
     * add a point to the spline
     * @param {number} t
     * @param {number} d
     */
    addPoint(t, d){
        this.#points.push([t, d]);
    }

    /**
     * interpolate corresponding value to t from the spline according to its given lerp
     * @param {number} t
     */
    getPoint(t){
        let p1 = 0;

        for(let i = 0; i < this.#points.length; i++){
            if(this.#points[i][0] <= t){
                break;
            }
            p1 = i;
        }
        const p2 = Math.min(this.#points.length - 1, p1 + 1);

        if (p1 === p2) {
          return this.#points[p1][1];
        }

        return this.#lerp((t - this.#points[p1][0]) / (this.#points[p2][0] - this.#points[p1][0]), this.#points[p1][1], this.#points[p2][1]);
    }
}
/**
 * class for a simple particle system
*/
export class ParticleSystem{
    #material;
    #bufferGeometry;
    #points;
    #particles;
    #colourSpline;
    #alphaSpline;
    #sizeSpline;
    /**
     * initialises class, adds splines for some particle attributes (colour, size, alpha)
     * @param {{scene: THREE.Scene, camera: THREE.Camera, position: THREE.Vector3, uniforms: object}} params
     */
    constructor(params) {
        this.scene = params.scene;
        this.camera = params.camera;
        this.position = params.position;

        this.#material = new THREE.ShaderMaterial({
            uniforms: params.uniforms,
            vertexShader: VS,
            fragmentShader: FS,
            blending: THREE.AdditiveBlending,
            depthTest: true,
            depthWrite: false,
            transparent: true,
            vertexColors: true,
            side: THREE.DoubleSide
        });

        this.#particles = [];
        this.#bufferGeometry = new THREE.BufferGeometry();
        this.#bufferGeometry.setAttribute('position',new THREE.Float32BufferAttribute([],3));
        this.#bufferGeometry.setAttribute('size',new THREE.Float32BufferAttribute([],1));
        this.#bufferGeometry.setAttribute('colour', new THREE.Float32BufferAttribute([], 4));
        this.#bufferGeometry.setAttribute('angle', new THREE.Float32BufferAttribute([], 1));

        this.#points = new THREE.Points(this.#bufferGeometry,this.#material);
        this.scene.add(this.#points);

        this.#alphaSpline = new LinearSpline((t, a, b) => {
          return a + t * (b - a);
        });
        this.#alphaSpline.addPoint(0.0, 0.0);
        this.#alphaSpline.addPoint(0.1, 1.0);
        this.#alphaSpline.addPoint(0.6, 1.0);
        this.#alphaSpline.addPoint(1.0, 0.0);

        this.#colourSpline = new LinearSpline((t, a, b) => {
          const c = a.clone();
          return c.lerp(b, t);
        });
        // this.#colourSpline.addPoint(0.0, new THREE.Color(0xFFFF80));
        // this.#colourSpline.addPoint(1, new THREE.Color(0xFF8080));
        this.#colourSpline.addPoint(0.0, new THREE.Color(0xFF0000));
        this.#colourSpline.addPoint(1, new THREE.Color(0x00FFFF));

        this.#sizeSpline = new LinearSpline((t, a, b) => {
          return a + t * (b - a);
        });
        this.#sizeSpline.addPoint(0.0, 1.0);
        this.#sizeSpline.addPoint(0.5, 5.0);
        this.#sizeSpline.addPoint(1.0, 1.0);

        this.addParticles();
        this.updateGeometry();
    }

    /**
     * cleans up object for garbage collection
     * removes existing particles from the scene
     */
    cleanUp(){
        this.scene.remove(this.#points);
    }

    /**
     * adds 10 particles to the system
     * @param {number} deltaTime
     */
    addParticles(deltaTime){
        if(this.#particles.length > 1000) return;
        let n = 10;
        for(let i = 0; i < n; i++){
            const life = (Math.random() * 0.75 + 0.25);
            this.#particles.push({
                position: new THREE.Vector3(
                    (Math.random()*0.2 - 0.1) + this.position.x,
                    (Math.random()*0.2 - 0.1) + this.position.y,
                    (Math.random()*0.2 - 0.1) + this.position.z
                ),
                colour: new THREE.Color(),
                alpha: 0.5,
                size: (Math.random() * 0.5 + 0.5), // 0.5 - 1
                lifetime: life, // 2.5 - 10
                maxLifeTime: life,
                rotation: Math.random() * 2.0 * Math.PI, // 0 - 2PI
                velocity: new THREE.Vector3(0, 0, 0)
            });
        }
    }
    /**
     * updates particles
     * @param {number} deltaTime
     */
    updateParticles(deltaTime){
        for (let p of this.#particles) {
          p.lifetime -= deltaTime;
        }

        this.#particles = this.#particles.filter(p => {
          return p.lifetime > 0.0;
        });

        for (let p of this.#particles) {
          const t = 1.0 - p.lifetime / p.maxLifeTime;

          p.rotation += deltaTime * 0.5;
          p.alpha = this.#alphaSpline.getPoint(t);
          p.currentSize = p.size * this.#sizeSpline.getPoint(t);
          p.colour.copy(this.#colourSpline.getPoint(t));

          // p.position.add(p.velocity.clone().multiplyScalar(deltaTime));
          //
          // const drag = p.velocity.clone();
          // drag.multiplyScalar(deltaTime * 0.1);
          // drag.x = Math.sign(p.velocity.x) * Math.min(Math.abs(drag.x), Math.abs(p.velocity.x));
          // drag.y = Math.sign(p.velocity.y) * Math.min(Math.abs(drag.y), Math.abs(p.velocity.y));
          // drag.z = Math.sign(p.velocity.z) * Math.min(Math.abs(drag.z), Math.abs(p.velocity.z));
          // p.velocity.sub(drag);
        }

        this.#particles.sort((a,b) => {
           const d1 =  this.camera.position.distanceToSquared(a.position);
           const d2 =  this.camera.position.distanceToSquared(b.position);

           return d1 > d2 ? -1 : (d1 < d2 ? 1 : 0);
        });
    }

    /**
     * updates entire system (couples multiple functions together)
     * @param {number} deltaTime
     */
    update(deltaTime){
        this.addParticles(deltaTime);
        this.updateParticles(deltaTime);
        this.updateGeometry();
    }

    /**
     * updates geometry based on particle update
     */
    updateGeometry(){
        const positions = [];
        const sizes = [];
        const colours = [];
        const angles = [];

        for(let p of this.#particles){
            positions.push(p.position.x, p.position.y, p.position.z);
            colours.push(p.colour.r, p.colour.g, p.colour.b, p.alpha);
            sizes.push(p.size);
            angles.push(p.rotation);
        }

        this.#bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        this.#bufferGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        this.#bufferGeometry.setAttribute('colour', new THREE.Float32BufferAttribute(colours, 4));
        this.#bufferGeometry.setAttribute('angle', new THREE.Float32BufferAttribute(angles, 1));

        this.#bufferGeometry.attributes.position.needsUpdate = true;
        this.#bufferGeometry.attributes.size.needsUpdate = true;
        this.#bufferGeometry.attributes.colour.needsUpdate = true;
        this.#bufferGeometry.attributes.angle.needsUpdate = true;
        this.#bufferGeometry.computeBoundingSphere();
    }
}
