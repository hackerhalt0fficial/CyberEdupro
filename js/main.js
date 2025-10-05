document.addEventListener('DOMContentLoaded', () => {
    // Navbar scroll styling
    const navbar = document.querySelector('.navbar');
    const siteHeader = document.querySelector('.site-header');
    const updateNavbarState = () => {
        if (!navbar) {
            return;
        }

        const shouldShrink = window.scrollY > 50;
        navbar.classList.toggle('scrolled', shouldShrink);
        siteHeader?.classList.toggle('scrolled', shouldShrink);
    };

    window.addEventListener('scroll', updateNavbarState, { passive: true });
    updateNavbarState();

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (event) => {
            const href = anchor.getAttribute('href');
            const target = href ? document.querySelector(href) : null;
            if (!target) {
                return;
            }

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // Animate on scroll helper
    const animateOnScroll = () => {
        document.querySelectorAll('.animate-on-scroll').forEach((element) => {
            const { top, bottom } = element.getBoundingClientRect();
            const visible = top < window.innerHeight && bottom >= 0;

            if (visible) {
                element.classList.add('animated');
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll, { passive: true });
    animateOnScroll();

    // Newsletter and open-access update forms
    const bindSimpleForm = (form, successMessage) => {
        if (!form || form.dataset.bound === 'true') {
            return;
        }

        form.dataset.bound = 'true';
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const emailField = form.querySelector('input[type="email"]');
            if (emailField?.value) {
                alert(successMessage);
            }
            form.reset();
        });
    };

    bindSimpleForm(
        document.querySelector('.newsletter-form'),
        "Thanks for subscribing! We'll keep you updated."
    );

    document.querySelectorAll('[data-open-access-updates]').forEach((form) => {
        bindSimpleForm(form, "We'll send occasional updates about new missions.");
    });

    const registrationModalElement = document.querySelector('[data-registration-modal]');
    if (registrationModalElement && window.bootstrap) {
        const COURSE_REGISTRATION_WEBHOOK = 'https://discordapp.com/api/webhooks/1424089083587592372/pbqINJiA1O7eweyMPV7iSGa_pkPR9AoSmtV_F5r7--4NTIhsFWM7yIjtfMS_Yqur5ZCx';
        const REGISTRATION_MODAL_INTERVAL_MS = 120000;
        const REGISTRATION_MODAL_INITIAL_DELAY_MS = 8000;
        const REGISTRATION_MODAL_STATE_KEY = 'cyberedu:registration-modal-state';

        const registrationModal = window.bootstrap.Modal.getOrCreateInstance(registrationModalElement, {
            backdrop: true,
            focus: true
        });

        const registrationForm = registrationModalElement.querySelector('[data-registration-form]');
        const successBanner = registrationModalElement.querySelector('[data-registration-success]');
        const submitButton = registrationForm?.querySelector('button[type="submit"]');
        const defaultSubmitLabel = submitButton?.textContent?.trim() || 'Submit';
        let registrationIntervalId = null;

        const shouldSuppressModal = () => sessionStorage.getItem(REGISTRATION_MODAL_STATE_KEY) === 'submitted';

        const hideBanner = () => {
            if (!successBanner) {
                return;
            }

            successBanner.classList.add('d-none');
            successBanner.classList.remove('alert-danger', 'alert-info', 'alert-success');
            successBanner.classList.add('alert-success');
        };

        const showBanner = (message, tone = 'success') => {
            if (!successBanner) {
                return;
            }

            const toneClass = tone === 'error' ? 'alert-danger' : tone === 'info' ? 'alert-info' : 'alert-success';
            successBanner.textContent = message;
            successBanner.classList.remove('d-none', 'alert-danger', 'alert-info', 'alert-success');
            successBanner.classList.add(toneClass);
            successBanner.focus?.();
        };

        const clearIntervalIfNeeded = () => {
            if (registrationIntervalId) {
                window.clearInterval(registrationIntervalId);
                registrationIntervalId = null;
            }
        };

        const scheduleModal = () => {
            clearIntervalIfNeeded();
            if (shouldSuppressModal()) {
                return;
            }

            registrationIntervalId = window.setInterval(() => {
                if (shouldSuppressModal()) {
                    clearIntervalIfNeeded();
                    return;
                }

                const modalIsVisible = registrationModalElement.classList.contains('show');
                const pageHasModalOpen = document.body.classList.contains('modal-open');
                if (!modalIsVisible && !pageHasModalOpen) {
                    registrationModal.show();
                }
            }, REGISTRATION_MODAL_INTERVAL_MS);
        };

        const resetFormState = () => {
            if (registrationForm) {
                registrationForm.reset();
                const updatesCheckbox = registrationForm.querySelector('#modalUpdates');
                if (updatesCheckbox instanceof HTMLInputElement) {
                    updatesCheckbox.checked = true;
                }
            }

            hideBanner();

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = defaultSubmitLabel;
            }
        };

        const showModalWithPrep = () => {
            if (shouldSuppressModal()) {
                return;
            }

            const anotherModalOpen = document.body.classList.contains('modal-open');
            if (anotherModalOpen && !registrationModalElement.classList.contains('show')) {
                return;
            }

            resetFormState();
            registrationModal.show();
        };

        registrationModalElement.addEventListener('hidden.bs.modal', () => {
            if (!shouldSuppressModal()) {
                scheduleModal();
            } else {
                clearIntervalIfNeeded();
            }
        });

        registrationModalElement.addEventListener('show.bs.modal', resetFormState);

        if (registrationForm) {
            registrationForm.addEventListener('submit', async (event) => {
                event.preventDefault();

                if (!registrationForm.checkValidity()) {
                    registrationForm.reportValidity?.();
                    return;
                }

                if (submitButton) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Submitting…';
                }

                showBanner('Submitting your registration… this may take a moment.', 'info');

                const formData = new FormData(registrationForm);
                const fullName = (formData.get('fullName') || '').toString().trim();
                const email = (formData.get('email') || '').toString().trim();
                const focus = (formData.get('focus') || '').toString().trim();
                const goals = (formData.get('goals') || '').toString().trim();
                const wantsUpdates = formData.get('updates') ? 'Yes' : 'No';

                const truncate = (value, max) => {
                    if (!value) {
                        return value;
                    }

                    return value.length > max ? `${value.slice(0, max - 1)}…` : value;
                };

                const payload = {
                    username: 'CyberEdu Pro Enrollments',
                    embeds: [
                        {
                            title: 'Intake Submission Received',
                            description:
                                'A prospective learner completed the Cyber Mission registration intake. Please review and follow up within one business day.',
                            color: 0x2563eb,
                            fields: [
                                {
                                    name: 'Learner',
                                    value:
                                        `${fullName ? `**${fullName}**` : 'Name not provided'}\n${email || 'Email not provided'}`,
                                    inline: false
                                },
                                {
                                    name: 'Focus Area',
                                    value: focus || 'Not specified',
                                    inline: true
                                },
                                {
                                    name: 'Updates Opt-In',
                                    value: wantsUpdates,
                                    inline: true
                                },
                                {
                                    name: 'Stated Outcomes',
                                    value: truncate(goals, 1000) || 'Learner did not articulate specific objectives.',
                                    inline: false
                                }
                            ],
                            footer: {
                                text: 'CyberEdu Pro · Enrollment Desk'
                            },
                            timestamp: new Date().toISOString()
                        }
                    ]
                };

                try {
                    const response = await fetch(COURSE_REGISTRATION_WEBHOOK, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });

                    if (!response.ok) {
                        throw new Error(`Webhook responded with status ${response.status}`);
                    }

                    showBanner('Thanks for registering! A program coordinator will reach out within one business day.', 'success');
                    registrationForm.reset();
                    const updatesCheckbox = registrationForm.querySelector('#modalUpdates');
                    if (updatesCheckbox instanceof HTMLInputElement) {
                        updatesCheckbox.checked = true;
                    }

                    sessionStorage.setItem(REGISTRATION_MODAL_STATE_KEY, 'submitted');

                    window.setTimeout(() => {
                        registrationModal.hide();
                    }, 2200);
                } catch (error) {
                    console.error('Registration submission failed:', error);
                    showBanner('We could not submit your registration. Please try again or email support@cyberedupro.com.', 'error');
                } finally {
                    if (submitButton) {
                        submitButton.disabled = false;
                        submitButton.textContent = defaultSubmitLabel;
                    }
                }
            });
        }

        if (!shouldSuppressModal()) {
            window.setTimeout(() => {
                showModalWithPrep();
                scheduleModal();
            }, REGISTRATION_MODAL_INITIAL_DELAY_MS);
        }
    }

    // Mobile menu toggler
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    if (navbarToggler && navbarCollapse) {
        navbarToggler.addEventListener('click', () => {
            navbarCollapse.classList.toggle('show');
        });

        document.addEventListener('click', (event) => {
            if (!navbarCollapse.contains(event.target) && !navbarToggler.contains(event.target)) {
                navbarCollapse.classList.remove('show');
            }
        });
    }

    // Search drawer behaviour
    const searchDrawer = document.getElementById('navbarSearch');
    if (searchDrawer && window.bootstrap) {
        const searchCollapse = window.bootstrap.Collapse.getOrCreateInstance(searchDrawer, {
            toggle: false
        });
        const searchInput = searchDrawer.querySelector('input[type="search"]');

        document.querySelectorAll('[data-bs-target="#navbarSearch"]').forEach((trigger) => {
            trigger.addEventListener('click', () => {
                setTimeout(() => searchInput?.focus(), 200);
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                searchCollapse.hide();
            }
        });

        document.querySelectorAll('.navbar-nav a, .dropdown-item').forEach((link) => {
            link.addEventListener('click', () => {
                searchCollapse.hide();
            });
        });
    }

    // Desktop dropdown hover support
    if (window.innerWidth >= 992) {
        document.querySelectorAll('.dropdown').forEach((dropdown) => {
            const menu = dropdown.querySelector('.dropdown-menu');
            if (!menu) {
                return;
            }

            dropdown.addEventListener('mouseenter', () => menu.classList.add('show'));
            dropdown.addEventListener('mouseleave', () => menu.classList.remove('show'));
        });
    }

    // Course playlist interactions (open access)
    const appendQueryParams = (url, params = {}) => {
        if (!url) {
            return '';
        }

        const [base, existingQuery = ''] = url.split('?');
        const searchParams = new URLSearchParams(existingQuery);

        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') {
                searchParams.delete(key);
            } else {
                searchParams.set(key, value);
            }
        });

        const query = searchParams.toString();
        return query ? `${base}?${query}` : base;
    };

    let coursePlayerIndex = 0;
    document.querySelectorAll('.course-layout').forEach((layout) => {
        const playerFrame = layout.querySelector('.course-player iframe');
        const lessonButtons = Array.from(layout.querySelectorAll('.lesson-list .lesson-item'));
        if (!playerFrame || lessonButtons.length === 0) {
            return;
        }

        if (!playerFrame.id) {
            coursePlayerIndex += 1;
            playerFrame.id = `coursePlayer-${coursePlayerIndex}`;
        }

        const currentLessonOutput = layout.querySelector('.current-lesson-title');
        const currentLessonBadge = layout.querySelector('.current-lesson-index');

        const setActiveButton = (activeButton) => {
            lessonButtons.forEach((button) => {
                button.classList.toggle('active', button === activeButton);
                button.setAttribute('aria-pressed', button === activeButton ? 'true' : 'false');
            });
        };

        const buildVideoSource = (button, autoplay = true) => {
            const rawVideo = button.dataset.videoUrl || button.dataset.video || '';
            if (!rawVideo) {
                return null;
            }

            const hasProtocol = /^https?:\/\//i.test(rawVideo);
            const baseUrl = hasProtocol ? rawVideo : `https://www.youtube.com/embed/${rawVideo}`;
            return appendQueryParams(baseUrl, {
                rel: '0',
                modestbranding: '1',
                playsinline: '1',
                autoplay: autoplay ? '1' : null
            });
        };

        const updatePlayer = (button, autoplay = true) => {
            const newSource = buildVideoSource(button, autoplay);
            if (!newSource || playerFrame.dataset.currentVideo === newSource) {
                return;
            }

            playerFrame.dataset.currentVideo = newSource;
            playerFrame.src = newSource;

            if (currentLessonOutput && button.dataset.videoTitle) {
                currentLessonOutput.textContent = button.dataset.videoTitle;
            }

            if (currentLessonBadge) {
                const badgeValue =
                    button.dataset.lessonIndex ||
                    button.querySelector('.lesson-index')?.textContent ||
                    '';
                currentLessonBadge.textContent = badgeValue.trim();
            }
        };

        lessonButtons.forEach((button) => {
            button.setAttribute('type', 'button');
            button.setAttribute('aria-controls', playerFrame.id);
            button.setAttribute('aria-pressed', button.classList.contains('active') ? 'true' : 'false');

            button.addEventListener('click', () => {
                if (button.classList.contains('active')) {
                    return;
                }

                setActiveButton(button);
                updatePlayer(button, true);
            });
        });

        const initialActive =
            layout.querySelector('.lesson-list .lesson-item.active') || lessonButtons[0];
        if (initialActive) {
            if (!initialActive.dataset.lessonIndex) {
                const index = initialActive
                    .querySelector('.lesson-index')
                    ?.textContent?.trim();
                if (index) {
                    initialActive.dataset.lessonIndex = index;
                }
            }

            setActiveButton(initialActive);
            updatePlayer(initialActive, false);
        }
    });
});