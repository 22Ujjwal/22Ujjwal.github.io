// Add random positions to sparkles and stars
document.addEventListener('DOMContentLoaded', () => {
    const sparkles = document.querySelectorAll('.sparkle, .star');
    
    sparkles.forEach(sparkle => {
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        sparkle.style.left = `${x}%`;
        sparkle.style.top = `${y}%`;
        sparkle.style.animationDelay = `${Math.random() * 2}s`;
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add scroll animation for navbar
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
}); 