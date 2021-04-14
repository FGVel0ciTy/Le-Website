(() => {
    // Global Variables
    let stars = [];
    const fps = 30;
    const canvas = document.getElementById("starfield");
    const context = canvas.getContext("2d");

    // Star constructor
    let createStar = (x, y, radius, opacity, context) => {
        return {
            x, y, radius, opacity, context,
            change: Math.random() > .5 ? 1 : -1,
            draw: function() {
                this.change = this.opacity >= 1 ? -1
                    : this.opacity <= 0 ? 1 : this.change;
                this.opacity += this.change * Math.random() / 100;

                this.context.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                this.context.beginPath();
                this.context.arc(this.x, this.y, radius, 0, 360);
                this.context.fill();
            }
        }
    }

    // Resizes the canvas and re-initializes the stars
    let resize = function() {
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;
        init();
    }

    // General update function
    let update = () => {
        context.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(star => star.draw());
    }

    // Calculates and draws simple parallax effect
    let parallax = movement => {
        stars.forEach(star => {
            star.x += movement.x * Math.random() / 200;
            star.y += movement.y * Math.random() / 100;
        });
    }

    // Initializes a new set of stars
    let init = () => {
        canvas.width = document.body.clientWidth;
        canvas.height = document.body.clientHeight;

        const starCount = Math.floor(canvas.width * canvas.height / 2500);
        stars = [];

        for (var i = 0; i < starCount; i++) {
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
})();