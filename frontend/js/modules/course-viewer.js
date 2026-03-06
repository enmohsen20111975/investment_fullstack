/**
 * عارض الدروس التفاعلي
 * Interactive Course Viewer
 * نظام عرض الدروس مع خطوات إرشادية وتفاعلية
 */

import { 
    learningStateV2, 
    coursesData, 
    calculateLevel,
    getRank
} from './learning-v2.js';

// ============================================
// حالة عارض الدروس
// ============================================
const courseViewerState = {
    currentCourse: null,
    currentModule: null,
    currentLesson: null,
    currentSlide: 0,
    isPlaying: false,
    playbackSpeed: 1,
    annotations: [],
    notes: []
};

// ============================================
// عارض الدروس الرئيسي
// ============================================

/**
 * فتح دورة
 */
function openCourse(courseId) {
    const course = coursesData[courseId];
    if (!course) return;
    
    courseViewerState.currentCourse = course;
    courseViewerState.currentModule = null;
    courseViewerState.currentLesson = null;
    
    renderCourseModal(course);
}

/**
 * عرض نافذة الدورة
 */
function renderCourseModal(course) {
    const modal = document.createElement('div');
    modal.id = 'courseModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <!-- Header -->
            <div class="bg-gradient-to-l ${course.level === 1 ? 'from-green-500 to-green-600' : 
                course.level === 2 ? 'from-blue-500 to-blue-600' : 
                'from-purple-500 to-purple-600'} text-white p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h2 class="text-2xl font-bold">${course.title}</h2>
                        <p class="text-white/80">${course.description}</p>
                    </div>
                    <button class="text-white/80 hover:text-white text-2xl" onclick="closeCourseModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- Progress Bar -->
                <div class="mt-4">
                    <div class="flex justify-between text-sm mb-1">
                        <span>تقدم الدورة</span>
                        <span>${calculateCourseProgress(course)}%</span>
                    </div>
                    <div class="h-2 bg-white/20 rounded-full overflow-hidden">
                        <div class="h-full bg-white rounded-full transition-all" style="width: ${calculateCourseProgress(course)}%"></div>
                    </div>
                </div>
            </div>
            
            <!-- Content -->
            <div class="flex flex-1 overflow-hidden">
                <!-- Sidebar - Modules List -->
                <div class="w-72 border-l bg-gray-50 overflow-y-auto">
                    <div class="p-4">
                        <h3 class="font-bold text-gray-700 mb-4">محتويات الدورة</h3>
                        <div class="space-y-2">
                            ${course.modules.map((module, mIndex) => `
                                <div class="module-item">
                                    <button class="w-full text-right p-3 rounded-lg hover:bg-gray-100 flex items-center justify-between module-header" data-module="${mIndex}">
                                        <div class="flex items-center gap-2">
                                            <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">${mIndex + 1}</span>
                                            <span class="font-medium">${module.title}</span>
                                        </div>
                                        <i class="fas fa-chevron-down text-gray-400 transition-transform"></i>
                                    </button>
                                    <div class="module-lessons hidden mr-8 mt-2 space-y-1">
                                        ${module.lessons.map((lesson, lIndex) => `
                                            <button class="w-full text-right p-2 rounded-lg hover:bg-gray-100 flex items-center gap-2 text-sm lesson-btn ${learningStateV2.progress.completedLessons.includes(lesson.id) ? 'text-green-600' : ''}" 
                                                    data-module="${mIndex}" data-lesson="${lIndex}">
                                                ${learningStateV2.progress.completedLessons.includes(lesson.id) ? 
                                                    '<i class="fas fa-check-circle text-green-500"></i>' : 
                                                    '<i class="far fa-circle text-gray-300"></i>'}
                                                <span>${lesson.title}</span>
                                                <span class="mr-auto text-xs text-gray-400">${lesson.duration}د</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Main Content Area -->
                <div class="flex-1 overflow-y-auto">
                    <div id="lessonContent" class="p-6">
                        <!-- Welcome Screen -->
                        <div class="text-center py-12">
                            <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i class="fas fa-play-circle text-4xl text-gray-400"></i>
                            </div>
                            <h3 class="text-xl font-bold mb-2">مرحباً بك في ${course.title}</h3>
                            <p class="text-gray-500 mb-6">اختر درساً من القائمة الجانبية للبدء</p>
                            <button class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 start-first-lesson">
                                ابدأ الدرس الأول
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.classList.add('overflow-hidden');
    
    // Event listeners
    initializeCourseModalEvents(modal, course);
}

/**
 * تهيئة أحداث نافذة الدورة
 */
function initializeCourseModalEvents(modal, course) {
    // إغلاق النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeCourseModal();
    });
    
    // فتح/إغلاق الوحدات
    modal.querySelectorAll('.module-header').forEach(btn => {
        btn.addEventListener('click', () => {
            const lessons = btn.nextElementSibling;
            const icon = btn.querySelector('i');
            lessons.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        });
    });
    
    // اختيار درس
    modal.querySelectorAll('.lesson-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mIndex = parseInt(btn.dataset.module);
            const lIndex = parseInt(btn.dataset.lesson);
            openLesson(course, mIndex, lIndex);
        });
    });
    
    // بدء أول درس
    modal.querySelector('.start-first-lesson')?.addEventListener('click', () => {
        if (course.modules[0]?.lessons[0]) {
            openLesson(course, 0, 0);
        }
    });
}

/**
 * فتح درس
 */
function openLesson(course, moduleIndex, lessonIndex) {
    const module = course.modules[moduleIndex];
    const lesson = module.lessons[lessonIndex];
    
    courseViewerState.currentModule = module;
    courseViewerState.currentLesson = lesson;
    courseViewerState.currentSlide = 0;
    
    renderLessonContent(lesson, module, course);
}

/**
 * عرض محتوى الدرس
 */
function renderLessonContent(lesson, module, course) {
    const container = document.getElementById('lessonContent');
    if (!container) return;
    
    const progress = learningStateV2.progress.lessonProgress[lesson.id] || { progress: 0 };
    const isCompleted = learningStateV2.progress.completedLessons.includes(lesson.id);
    
    container.innerHTML = `
        <div class="lesson-viewer">
            <!-- Lesson Header -->
            <div class="flex items-center justify-between mb-6">
                <div>
                    <div class="text-sm text-gray-500">${module.title}</div>
                    <h2 class="text-2xl font-bold">${lesson.title}</h2>
                </div>
                <div class="flex items-center gap-4">
                    <span class="text-sm text-gray-500">
                        <i class="fas fa-clock ml-1"></i>${lesson.duration} دقيقة
                    </span>
                    <span class="text-sm text-gray-500">
                        <i class="fas fa-star ml-1"></i>${lesson.xp} XP
                    </span>
                    ${isCompleted ? `
                        <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                            <i class="fas fa-check ml-1"></i>مكتمل
                        </span>
                    ` : ''}
                </div>
            </div>
            
            <!-- Progress Bar -->
            <div class="mb-6">
                <div class="flex justify-between text-sm text-gray-500 mb-1">
                    <span>تقدم الدرس</span>
                    <span id="slideProgress">${courseViewerState.currentSlide + 1} / ${lesson.content?.slides?.length || 1}</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div id="lessonProgressBar" class="h-full bg-blue-500 rounded-full transition-all" 
                         style="width: ${((courseViewerState.currentSlide + 1) / (lesson.content?.slides?.length || 1)) * 100}%"></div>
                </div>
            </div>
            
            <!-- Slide Content -->
            <div id="slideContainer" class="bg-white rounded-xl border shadow-sm overflow-hidden">
                ${renderSlide(lesson, courseViewerState.currentSlide)}
            </div>
            
            <!-- Navigation -->
            <div class="flex items-center justify-between mt-6">
                <button id="prevSlideBtn" class="px-4 py-2 border rounded-lg hover:bg-gray-50 flex items-center gap-2 ${courseViewerState.currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : ''}">
                    <i class="fas fa-arrow-right"></i>
                    السابق
                </button>
                
                <div class="flex items-center gap-2">
                    <!-- Slide Indicators -->
                    <div class="flex gap-1">
                        ${(lesson.content?.slides || []).map((_, i) => `
                            <button class="slide-indicator w-2 h-2 rounded-full ${i === courseViewerState.currentSlide ? 'bg-blue-500' : 'bg-gray-300'}" data-slide="${i}"></button>
                        `).join('')}
                    </div>
                </div>
                
                <button id="nextSlideBtn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    التالي
                    <i class="fas fa-arrow-left"></i>
                </button>
            </div>
            
            <!-- Lesson Actions -->
            <div class="mt-6 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <button class="text-gray-500 hover:text-gray-700 flex items-center gap-1" onclick="takeNote()">
                        <i class="fas fa-sticky-note"></i>
                        تدوين ملاحظة
                    </button>
                    <button class="text-gray-500 hover:text-gray-700 flex items-center gap-1" onclick="reportIssue()">
                        <i class="fas fa-flag"></i>
                        إبلاغ عن مشكلة
                    </button>
                </div>
                
                ${!isCompleted ? `
                    <button id="completeLessonBtn" class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                        <i class="fas fa-check"></i>
                        إكمال الدرس
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    
    // تهيئة أحداث التنقل
    initializeSlideNavigation(lesson, module, course);
}

/**
 * عرض شريحة
 */
function renderSlide(lesson, slideIndex) {
    const slide = lesson.content?.slides?.[slideIndex];
    
    if (!slide) {
        // إذا لم تكن هناك شرائح، اعرض المحتوى الافتراضي
        return `
            <div class="p-8">
                <div class="prose max-w-none">
                    ${lesson.content?.summary || 'لا يوجد محتوى لهذا الدرس'}
                </div>
            </div>
        `;
    }
    
    let content = `
        <div class="slide-content p-8">
            <h3 class="text-xl font-bold mb-6">${slide.title}</h3>
            <div class="prose max-w-none">
                ${slide.content}
            </div>
    `;
    
    // إضافة الاختبار التفاعلي إذا وجد
    if (slide.quiz) {
        content += renderInlineQuiz(slide.quiz);
    }
    
    // إضافة الرسوم التفاعلية إذا وجدت
    if (slide.interactive) {
        content += renderInteractiveDemo(lesson, slideIndex);
    }
    
    content += `</div>`;
    
    return content;
}

/**
 * عرض اختبار تفاعلي داخل الشريحة
 */
function renderInlineQuiz(quiz) {
    return `
        <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 class="font-bold text-blue-800 mb-3">
                <i class="fas fa-question-circle ml-2"></i>اختبر فهمك
            </h4>
            <p class="mb-4">${quiz.question}</p>
            <div class="space-y-2">
                ${quiz.options.map((option, i) => `
                    <label class="flex items-center gap-3 p-3 bg-white rounded-lg cursor-pointer hover:bg-blue-100 transition-colors quiz-option">
                        <input type="radio" name="inlineQuiz" value="${i}" class="w-4 h-4 text-blue-600">
                        <span>${option}</span>
                    </label>
                `).join('')}
            </div>
            <button class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 submit-inline-quiz" data-correct="${quiz.correct}">
                تحقق من الإجابة
            </button>
            <div id="inlineQuizResult" class="mt-4 hidden"></div>
        </div>
    `;
}

/**
 * عرض عرض تفاعلي
 */
function renderInteractiveDemo(lesson, slideIndex) {
    return `
        <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-bold mb-3">
                <i class="fas fa-hand-pointer ml-2"></i>جرب بنفسك
            </h4>
            <div id="interactiveDemoArea" class="bg-white rounded-lg p-4 min-h-32">
                <!-- Interactive demo content will be rendered here -->
                <div class="text-center text-gray-400 py-8">
                    <i class="fas fa-mouse-pointer text-3xl mb-2"></i>
                    <p>العرض التفاعلي</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * تهيئة التنقل بين الشرائح
 */
function initializeSlideNavigation(lesson, module, course) {
    const prevBtn = document.getElementById('prevSlideBtn');
    const nextBtn = document.getElementById('nextSlideBtn');
    const completeBtn = document.getElementById('completeLessonBtn');
    const totalSlides = lesson.content?.slides?.length || 1;
    
    // السابق
    prevBtn?.addEventListener('click', () => {
        if (courseViewerState.currentSlide > 0) {
            courseViewerState.currentSlide--;
            updateSlide(lesson, module, course);
        }
    });
    
    // التالي
    nextBtn?.addEventListener('click', () => {
        if (courseViewerState.currentSlide < totalSlides - 1) {
            courseViewerState.currentSlide++;
            updateSlide(lesson, module, course);
        } else {
            // آخر شريحة - عرض زر الإكمال
            if (completeBtn) {
                completeBtn.classList.add('animate-pulse');
            }
        }
    });
    
    // إكمال الدرس
    completeBtn?.addEventListener('click', () => {
        completeLesson(lesson, course);
    });
    
    // مؤشرات الشرائح
    document.querySelectorAll('.slide-indicator').forEach(indicator => {
        indicator.addEventListener('click', () => {
            courseViewerState.currentSlide = parseInt(indicator.dataset.slide);
            updateSlide(lesson, module, course);
        });
    });
    
    // الاختبارات التفاعلية
    document.querySelectorAll('.submit-inline-quiz').forEach(btn => {
        btn.addEventListener('click', () => {
            const correct = parseInt(btn.dataset.correct);
            const selected = document.querySelector('input[name="inlineQuiz"]:checked');
            const result = document.getElementById('inlineQuizResult');
            
            if (!selected) {
                result.innerHTML = '<div class="text-yellow-600">الرجاء اختيار إجابة</div>';
                result.classList.remove('hidden');
                return;
            }
            
            if (parseInt(selected.value) === correct) {
                result.innerHTML = `
                    <div class="text-green-600 flex items-center gap-2">
                        <i class="fas fa-check-circle"></i>
                        إجابة صحيحة! 🎉
                    </div>
                `;
                // منح XP
                addXP(5);
            } else {
                result.innerHTML = `
                    <div class="text-red-600 flex items-center gap-2">
                        <i class="fas fa-times-circle"></i>
                        إجابة خاطئة، حاول مرة أخرى
                    </div>
                `;
            }
            result.classList.remove('hidden');
        });
    });
}

/**
 * تحديث الشريحة
 */
function updateSlide(lesson, module, course) {
    const container = document.getElementById('slideContainer');
    const progressBar = document.getElementById('lessonProgressBar');
    const progressText = document.getElementById('slideProgress');
    const totalSlides = lesson.content?.slides?.length || 1;
    
    if (container) {
        container.innerHTML = renderSlide(lesson, courseViewerState.currentSlide);
    }
    
    if (progressBar) {
        progressBar.style.width = `${((courseViewerState.currentSlide + 1) / totalSlides) * 100}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${courseViewerState.currentSlide + 1} / ${totalSlides}`;
    }
    
    // تحديث المؤشرات
    document.querySelectorAll('.slide-indicator').forEach((indicator, i) => {
        indicator.classList.toggle('bg-blue-500', i === courseViewerState.currentSlide);
        indicator.classList.toggle('bg-gray-300', i !== courseViewerState.currentSlide);
    });
    
    // تحديث حالة الأزرار
    const prevBtn = document.getElementById('prevSlideBtn');
    const nextBtn = document.getElementById('nextSlideBtn');
    
    if (prevBtn) {
        prevBtn.disabled = courseViewerState.currentSlide === 0;
        prevBtn.classList.toggle('opacity-50', courseViewerState.currentSlide === 0);
    }
    
    if (nextBtn) {
        if (courseViewerState.currentSlide === totalSlides - 1) {
            nextBtn.innerHTML = `<i class="fas fa-check ml-2"></i>إنهاء`;
        } else {
            nextBtn.innerHTML = `التالي<i class="fas fa-arrow-left mr-2"></i>`;
        }
    }
    
    // إعادة تهيئة أحداث الاختبارات
    document.querySelectorAll('.submit-inline-quiz').forEach(btn => {
        btn.addEventListener('click', () => {
            const correct = parseInt(btn.dataset.correct);
            const selected = document.querySelector('input[name="inlineQuiz"]:checked');
            const result = document.getElementById('inlineQuizResult');
            
            if (!selected) {
                result.innerHTML = '<div class="text-yellow-600">الرجاء اختيار إجابة</div>';
                result.classList.remove('hidden');
                return;
            }
            
            if (parseInt(selected.value) === correct) {
                result.innerHTML = `
                    <div class="text-green-600 flex items-center gap-2">
                        <i class="fas fa-check-circle"></i>
                        إجابة صحيحة! 🎉
                    </div>
                `;
                addXP(5);
            } else {
                result.innerHTML = `
                    <div class="text-red-600 flex items-center gap-2">
                        <i class="fas fa-times-circle"></i>
                        إجابة خاطئة
                    </div>
                `;
            }
            result.classList.remove('hidden');
        });
    });
}

/**
 * إكمال الدرس
 */
function completeLesson(lesson, course) {
    if (!learningStateV2.progress.completedLessons.includes(lesson.id)) {
        learningStateV2.progress.completedLessons.push(lesson.id);
        learningStateV2.progress.lessonProgress[lesson.id] = {
            progress: 100,
            completedAt: new Date().toISOString()
        };
        
        // منح XP
        addXP(lesson.xp);
        
        // حفظ التقدم
        saveProgress();
        
        // عرض رسالة النجاح
        showCompletionCelebration(lesson);
        
        // تحديث الواجهة
        updateCourseProgress(course);
    }
}

/**
 * عرض احتفال الإكمال
 */
function showCompletionCelebration(lesson) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 text-center max-w-md animate-bounce">
            <div class="text-6xl mb-4">🎉</div>
            <h3 class="text-2xl font-bold mb-2">أحسنت!</h3>
            <p class="text-gray-600 mb-4">أكملت الدرس بنجاح</p>
            <div class="bg-yellow-50 rounded-lg p-4 mb-6">
                <div class="text-3xl font-bold text-yellow-600">+${lesson.xp} XP</div>
                <div class="text-sm text-yellow-700">نقاط خبرة</div>
            </div>
            <div class="flex gap-4">
                <button class="flex-1 py-3 border rounded-lg hover:bg-gray-50 close-celebration">
                    إغلاق
                </button>
                <button class="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 next-lesson-btn">
                    الدرس التالي
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-celebration').addEventListener('click', () => modal.remove());
    modal.querySelector('.next-lesson-btn').addEventListener('click', () => {
        modal.remove();
        goToNextLesson();
    });
}

/**
 * الانتقال للدرس التالي
 */
function goToNextLesson() {
    const course = courseViewerState.currentCourse;
    const currentModule = courseViewerState.currentModule;
    const currentLesson = courseViewerState.currentLesson;
    
    // البحث عن الدرس التالي
    let foundCurrent = false;
    for (const module of course.modules) {
        for (const lesson of module.lessons) {
            if (foundCurrent) {
                openLesson(course, course.modules.indexOf(module), module.lessons.indexOf(lesson));
                return;
            }
            if (lesson.id === currentLesson.id) {
                foundCurrent = true;
            }
        }
    }
    
    // إذا لم يوجد درس تالي، عرض رسالة إكمال الدورة
    showCourseCompletion(course);
}

/**
 * عرض إكمال الدورة
 */
function showCourseCompletion(course) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-2xl p-8 text-center max-w-md">
            <div class="text-6xl mb-4">🏆</div>
            <h3 class="text-2xl font-bold mb-2">مبروك!</h3>
            <p class="text-gray-600 mb-4">أكملت دورة ${course.title} بنجاح!</p>
            <div class="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg p-4 mb-6">
                <div class="text-3xl font-bold">+${course.xpReward} XP</div>
                <div class="text-sm opacity-80">مكافأة الدورة</div>
            </div>
            <button class="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 close-celebration">
                العودة للدورات
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-celebration').addEventListener('click', () => {
        modal.remove();
        closeCourseModal();
    });
}

/**
 * حساب تقدم الدورة
 */
function calculateCourseProgress(course) {
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = learningStateV2.progress.completedLessons.filter(l => 
        course.modules.some(m => m.lessons.some(lesson => lesson.id === l))
    ).length;
    
    return Math.round((completedLessons / totalLessons) * 100);
}

/**
 * تحديث تقدم الدورة
 */
function updateCourseProgress(course) {
    const progress = calculateCourseProgress(course);
    const progressBar = document.querySelector('#courseModal .h-2 > div');
    const progressText = document.querySelector('#courseModal .h-2 + span');
    
    if (progressBar) {
        progressBar.style.width = `${progress}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${progress}%`;
    }
}

/**
 * إضافة XP
 */
function addXP(amount) {
    learningStateV2.user.xp += amount;
    
    // التحقق من رفع المستوى
    const level = calculateLevel(learningStateV2.user.xp);
    const rank = getRank(learningStateV2.user.xp);
    
    learningStateV2.user.level = level.level;
    learningStateV2.user.rank = rank.name;
    
    saveProgress();
}

/**
 * حفظ التقدم
 */
function saveProgress() {
    localStorage.setItem('learningProgressV2', JSON.stringify(learningStateV2));
}

/**
 * إغلاق نافذة الدورة
 */
function closeCourseModal() {
    const modal = document.getElementById('courseModal');
    if (modal) {
        modal.remove();
        document.body.classList.remove('overflow-hidden');
    }
}

// جعل الدوال متاحة عالمياً
window.openCourse = openCourse;
window.closeCourseModal = closeCourseModal;

// تصدير الدوال
export {
    openCourse,
    renderCourseModal,
    openLesson,
    renderLessonContent,
    completeLesson,
    calculateCourseProgress,
    addXP,
    courseViewerState
};
