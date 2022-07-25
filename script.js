// Global Variables //
/** Array of all stars on the canvas */
let stars = [];
/** Amount of updates per second */
const ups = 30;
/** Reference to the canvas that the starfield is drawn on */
const canvas = document.getElementById("starfield");
/** The canvas context for drawing */
const context = canvas.getContext("2d");
/** Stars per square pixel */
const starDensity = 1 / 16_000;
/** Flicker rate */
const flickerRate = 5;

const randomBinomial = (min, max, skew) => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random() //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random()
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

    num = num / 10.0 + 0.5 // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randomBinomial(min, max, skew) // resample between 0 and 1 if out of range
    else {
        num = Math.pow(num, skew) // Skew
        num *= max - min // Stretch to fill range
        num += min // offset to min
    }
    return num
}

const Star = {
    create: (
        x, y,
        radius, opacity,
        change,
        xMultiplier = Math.max(0.75, Math.random() + 0.3),
        yMultiplier = Math.max(0.75, Math.random() + 0.3),
    ) => ({
        x, y, radius, opacity, change,
        xMultiplier, yMultiplier
    }),
    clone: star => ({...star}),
    draw: (star, isForced = false) => {
        if (!isForced && !Star.isInView(star)) return star;
        context.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;

        context.beginPath(); {
            context.arc(star.x, star.y, star.radius * 3, 0, 360);

            context.moveTo(star.x - star.radius, star.y);
            context.lineTo(star.x, star.y - star.radius * 15 * star.yMultiplier);
            context.lineTo(star.x + star.radius, star.y);

            context.moveTo(star.x, star.y - star.radius);
            context.lineTo(star.x + star.radius * 15 * star.xMultiplier, star.y);
            context.lineTo(star.x, star.y + star.radius);

            context.moveTo(star.x + star.radius, star.y);
            context.lineTo(star.x, star.y + star.radius * 15 * star.yMultiplier);
            context.lineTo(star.x - star.radius, star.y);

            context.moveTo(star.x, star.y + star.radius);
            context.lineTo(star.x - star.radius * 15 * star.xMultiplier, star.y);
            context.lineTo(star.x, star.y - star.radius);
        } context.fill();

        return star;
    },
    update: (star, isForced = false) => {
        if (!isForced && !Star.isInView(star)) return star;
        const newStar = Star.clone(star);
        newStar.change *= (newStar.opacity >= 1 || newStar.opacity <= 0) ? -1 : 1;
        newStar.opacity += newStar.change * Math.random() / 100 * flickerRate;
        return newStar;
    },
    parallax: (star, movement, isForced = false) => {
        if (!isForced && !Star.isInView(star)) return star;
        const random = Math.random() / 135;
        const newStar = Star.clone(star);
        newStar.x += random * movement.x;
        newStar.y += 1.5 * random * movement.y;
        return newStar;
    },
    isInView: star => {
        const buffer = 100;
        return (star.y - (star.radius * 2) + buffer) > window.scrollY
            && (star.y + (star.radius * 2) - buffer)
               < (window.scrollY + document.documentElement.clientHeight);
    },
};

/** Resizes the canvas and re-initializes the stars */
const resize = () => {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;
    init();
}

/** General update function */
const update = () => { stars = stars.map(Star.update) };


const circs = 20;

// Gives an array from min to max
const range = (min, max) => {
    let arr = [];
    for (let i = min; i <= max; i++) {
        arr.push(i);
    }
    return arr;
}

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);


const rands = range(0, circs).map(_ => range(0, 3).map(__ => Math.random()));

// METABALLS?
const drawBackground = () => {
    context.globalCompositeOperation = "lighten";
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < circs; i++) {
        const x0 = rands[i][0] * canvas.width;
        const y0 = rands[i][1] * canvas.height;
        const r0 = rands[i][2] * 100 + 50 * (canvas.width * canvas.height / 50000000);

        const x1 = x0 + rands[i][1] * x0 / 50;
        const y1 = y0 + rands[i][1] * y0 / 50;
        const r1 = r0 + rands[i][3] * 800 + 300;

        const gradient = context.createRadialGradient(x0, y0, r0, x1, y1, r1);
        gradient.addColorStop(0.0, "rgba(128, 0, 128, 0.2)");
        gradient.addColorStop(clamp(0.8 * rands[i][0] + Math.sin(new Date().getTime() / 50000) / 2, 0.10, 0.7), "rgba(25, 25, 112, 0.5)");
        gradient.addColorStop(0.75, "rgba(25, 25, 112, 0.25)");
        gradient.addColorStop(0.90, "rgba(25, 25, 112, 0.125)");
        gradient.addColorStop(1.0, "rgba(25, 25, 112, 0.0)");
        context.fillStyle = gradient;
        context.beginPath(); {
            context.arc(x0, y0, r1, 0, Math.PI * 2);
        } context.fill();
    }
}

const draw = () => {
    drawBackground();
    stars.forEach(Star.draw);
    window.requestAnimationFrame(draw);
}

/** Calculates and draws simple parallax effect */
const parallax = movement => {
    stars = stars.map(star => Star.parallax(star, movement));
}

/** Initializes a new set of stars */
const init = () => {
    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    const starCount = Math.floor(canvas.width * canvas.height * starDensity);
    stars = [];

    for (let i = 0; i < starCount; i++) {
        const opacity = Math.random();
        // const radius = 3 * Math.random() * Math.random();
        const radius = randomBinomial(0.32, 4, 5);
        const x = Math.random() * canvas.offsetWidth;
        const y = Math.random() * canvas.offsetHeight;

        /** Randomized initial state if star starts glowing or fading */
        const change = Math.random() > .5 ? 1 : -1;

        const star = Star.create(x, y, radius, opacity, change);
        stars.push(star);
    }
    canvas.style.animation = "fadeInAnimation ease 3s";
}

// Initializes stars and attaches proper listeners
window.addEventListener("load", init);
window.setInterval(update, 1000 / ups);
window.requestAnimationFrame(draw);
window.addEventListener("resize", resize);
// window.addEventListener("mousemove", event => {
//     parallax({
//         x: event.movementX,
//         y: event.movementY
//     });
// });

// All anchor links will be smooth scrolled to
document.querySelectorAll("a[href^='#']").forEach(anchor => {
    anchor.addEventListener("click", event => {
        event.preventDefault();
        document.querySelector(anchor.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});
