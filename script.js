// Global Variables //
/** Array of all stars on the canvas */
let stars = [];
/** Amount of times movement is caclulated per second */
const fps = 30;
/** Reference to the canvas that the starfield is drawn on */
const canvas = document.getElementById("starfield");
/** The canvas context for drawing */
const context = canvas.getContext("2d");
/** Stars per square pixel */
const starDensity = 1 / 2000;
/** Flicker rate */
const flickerRate = 3;

/**
    * Star Constructor
    * @param {number} x - x coordinate
    * @param {number} y - y coordinate
    * @param {number} radius - Radius of the star
    * @param {number} opacity - Starting brightness
    * @param context - Drawing context
*/
const createStar = (x, y, radius, opacity, context) => {
    /** Randomized initial state if star starts glowing or fading */
    const initialChange = Math.random() > .5 ? 1 : -1;
    return {
        x, y, radius, opacity, context,
        change: initialChange,
        update: function() {
            this.change *= (this.opacity >= 1 || this.opacity <= 0) ? -1 : 1;
            this.opacity += this.change * Math.random() / 100 * flickerRate;
            this.context.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            this.context.beginPath();
            this.context.arc(this.x, this.y, radius, 0, 360);
            this.context.fill();
        }
    }
}

/** Resizes the canvas and re-initializes the stars */
const resize = () => {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    init();
}

/** General update function */
const update = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(star => star.update());
}

/** Calculates and draws simple parallax effect */
const parallax = movement => {
    stars.forEach(star => {
        const random = Math.random() / 135;
        star.x += random * movement.x;
        star.y += 1.5 * random * movement.y;
    });
}

/** Initializes a new set of stars */
const init = () => {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    const starCount = Math.floor(canvas.width * canvas.height * starDensity);
    stars = [];

    for (let i = 0; i < starCount; i++) {
        const opacity = Math.random();
        const radius = 1.25 - Math.random();
        const x = Math.random() * canvas.offsetWidth;
        const y = Math.random() * canvas.offsetHeight;
        stars.push(createStar(x, y, radius, opacity, context));
    }
    canvas.style.animation = "fadeInAnimation ease 3s";
    update();
}

// Initializes stars and attaches proper listeners
window.addEventListener("load", init);
window.setInterval(update, 1000 / fps);
window.addEventListener("resize", resize);
window.addEventListener("mousemove", event => {
    parallax({
        x: event.movementX,
        y: event.movementY
    });
});

// All anchor links will be smooth scrolled to
document.querySelectorAll("a[href^='#']").forEach(anchor => {
    anchor.addEventListener("click", event => {
        event.preventDefault();
        document.querySelector(anchor.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});
