document.addEventListener('DOMContentLoaded', function() {
    const featuredCoursesContainer = document.querySelector('.featured-courses .row');
    if (!featuredCoursesContainer) return;

    const courses = [
        {
            title: 'Linux Fundamentals',
            description: 'Build shell confidence, system navigation skills, and service hardening essentials.',
            duration: '12 Hours',
            level: 'Beginner',
            icon: 'terminal',
            price: 149.00,
            oldPrice: 299.00,
            features: ['Interactive Shell Labs', 'Automation Scripts', 'Checkpoint Quizzes'],
            badge: 'Starter',
            link: 'courses/linux-fundamental.html'
        },
        {
            title: 'eJPT Penetration Tester Prep',
            description: 'Train for the eJPT practical exam with guided enumeration, exploitation, and reporting drills.',
            duration: '18 Hours',
            level: 'Intermediate',
            icon: 'user-ninja',
            price: 229.00,
            oldPrice: 449.00,
            features: ['Scenario Labs', 'Pivoting Toolkit', 'Report Templates'],
            badge: 'Bestseller',
            link: 'courses/ejpt.html'
        },
        {
            title: 'Cloud Security Operations',
            description: 'Secure AWS, Azure, and GCP workloads with zero trust guardrails and threat simulations.',
            duration: '17 Hours',
            level: 'Intermediate',
            icon: 'cloud',
            price: 239.00,
            oldPrice: 499.00,
            features: ['Multi-cloud Labs', 'Control Matrix Toolkit', 'Incident Runbooks'],
            badge: 'Popular',
            link: 'courses/cloud-security.html'
        }
    ];

    const courseCards = courses.map(course => `
        <div class="col-md-6 col-lg-4">
            <div class="course-card animate-on-scroll">
                ${course.badge ? `<div class="course-badge ${course.badge.toLowerCase()}">${course.badge}</div>` : ''}
                <div class="course-icon">
                    <i class="fas fa-${course.icon}"></i>
                </div>
                <h3>${course.title}</h3>
                <div class="course-meta">
                    <span><i class="fas fa-clock"></i> ${course.duration}</span>
                    <span><i class="fas fa-signal"></i> ${course.level}</span>
                </div>
                <p>${course.description}</p>
                <ul class="course-features">
                    ${course.features.map(feature => `
                        <li><i class="fas fa-check"></i> ${feature}</li>
                    `).join('')}
                </ul>
                <div class="course-footer">
                    <div class="course-price">
                        <span class="price-current">$${course.price.toFixed(2)}</span>
                        <span class="price-old">$${course.oldPrice.toFixed(2)}</span>
                    </div>
                    <a href="${course.link}" class="btn btn-primary">
                        Enroll Now
                    </a>
                </div>
            </div>
        </div>
    `).join('');

    featuredCoursesContainer.innerHTML = courseCards;
});