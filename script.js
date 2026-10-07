/* =====================================================
   STUDYVAULT
   PDF LIBRARY ENGINE
   ===================================================== */


/* =====================================================
   CONFIG
===================================================== */

const PUBLIC_BASE_URL = "";


/* =====================================================
   LOCAL STORAGE
   Subjects only.
===================================================== */

const SUBJECT_STORAGE_KEY =
    "studyvault_subjects_v5";


/* =====================================================
   INDEXED DB
   PDFs are stored here.
===================================================== */

const DB_NAME =
    "StudyVaultPDFDatabase";

const DB_VERSION = 1;

const PDF_STORE =
    "pdfs";

let db = null;


/* =====================================================
   DEFAULT SUBJECTS
===================================================== */

const defaultSubjects = [

    {
        id: "mathematics",
        name: "Mathematics",
        icon: "∑"
    },

    {
        id: "physical-science",
        name: "Physical Science",
        icon: "⚗"
    },

    {
        id: "life-science",
        name: "Life Science",
        icon: "🧬"
    },

    {
        id: "physics",
        name: "Physics",
        icon: "Φ"
    },

    {
        id: "chemistry",
        name: "Chemistry",
        icon: "⚗"
    },

    {
        id: "biology",
        name: "Biology",
        icon: "🧬"
    },

    {
        id: "history",
        name: "History",
        icon: "⌛"
    },

    {
        id: "geography",
        name: "Geography",
        icon: "🌍"
    },

    {
        id: "bengali",
        name: "Bengali",
        icon: "অ"
    },

    {
        id: "english",
        name: "English",
        icon: "A"
    },

    {
        id: "hindi",
        name: "Hindi",
        icon: "ह"
    },

    {
        id: "computer-science",
        name: "Computer Science",
        icon: "</>"
    },

    {
        id: "environmental-science",
        name: "Environmental Science",
        icon: "♧"
    },

    {
        id: "economics",
        name: "Economics",
        icon: "₹"
    },

    {
        id: "political-science",
        name: "Political Science",
        icon: "⚖"
    },

    {
        id: "general-science",
        name: "General Science",
        icon: "✦"
    },

    {
        id: "general-knowledge",
        name: "General Knowledge",
        icon: "?"
    },

    {
        id: "competitive-exams",
        name: "Competitive Exams",
        icon: "★"
    }

];


/* =====================================================
   CLASSES
===================================================== */

const CLASSES = [

    {
        id: "class-5",
        name: "Class 5",
        number: "05"
    },

    {
        id: "class-6",
        name: "Class 6",
        number: "06"
    },

    {
        id: "class-7",
        name: "Class 7",
        number: "07"
    },

    {
        id: "class-8",
        name: "Class 8",
        number: "08"
    },

    {
        id: "class-9",
        name: "Class 9",
        number: "09"
    },

    {
        id: "class-10",
        name: "Class 10",
        number: "10"
    },

    {
        id: "class-11",
        name: "Class 11",
        number: "11"
    },

    {
        id: "class-12",
        name: "Class 12",
        number: "12"
    },

    {
        id: "other",
        name: "Other / General",
        number: "∞"
    }

];


/* =====================================================
   MEDIUMS
===================================================== */

const MEDIUMS = [

    {
        id: "Bengali",
        name: "Bengali",
        letter: "অ",
        subtitle: "বাংলা মাধ্যম"
    },

    {
        id: "English",
        name: "English",
        letter: "A",
        subtitle: "English Medium"
    },

    {
        id: "Hindi",
        name: "Hindi",
        letter: "ह",
        subtitle: "हिन्दी माध्यम"
    }

];


/* =====================================================
   STATE
===================================================== */

let subjects = [];

let currentSubject = null;

let currentClass = null;

let currentMedium = null;

let subjectToRemove = null;

let selectedPDFForQR = null;

let soundEnabled = true;

let audioContext = null;


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        animateLoader();

        loadSubjects();

        await openDatabase();

        updateStats();

        renderSubjects();

        setupKeyboardShortcuts();

        initializeAudio();

        handlePDFRoute();

        setTimeout(() => {

            document
                .getElementById("loader")
                ?.classList.add("hidden");

        }, 2800);

    }
);


/* =====================================================
   LOADER
===================================================== */

function animateLoader() {

    const bar =
        document.getElementById(
            "loaderProgressBar"
        );

    const status =
        document.getElementById(
            "loaderStatus"
        );


    const stages = [

        {
            progress: 20,
            text: "OPENING ARCHIVE"
        },

        {
            progress: 43,
            text: "TURNING PAGES"
        },

        {
            progress: 67,
            text: "LOADING LIBRARY"
        },

        {
            progress: 86,
            text: "INDEXING COLLECTION"
        },

        {
            progress: 100,
            text: "READY"
        }

    ];


    let index = 0;


    function nextStage() {

        if (index >= stages.length) {

            return;

        }


        const stage =
            stages[index];


        bar.style.width =
            `${stage.progress}%`;


        status.textContent =
            stage.text;


        index++;


        setTimeout(
            nextStage,
            480
        );

    }


    nextStage();

}


/* =====================================================
   DATABASE
===================================================== */

function openDatabase() {

    return new Promise(
        (resolve, reject) => {

            const request =
                indexedDB.open(
                    DB_NAME,
                    DB_VERSION
                );


            request.onupgradeneeded =
                event => {

                    const database =
                        event.target.result;


                    if (
                        !database.objectStoreNames.contains(
                            PDF_STORE
                        )
                    ) {

                        const store =
                            database.createObjectStore(
                                PDF_STORE,
                                {
                                    keyPath: "id"
                                }
                            );


                        store.createIndex(
                            "subjectId",
                            "subjectId",
                            {
                                unique: false
                            }
                        );


                        store.createIndex(
                            "classId",
                            "classId",
                            {
                                unique: false
                            }
                        );


                        store.createIndex(
                            "medium",
                            "medium",
                            {
                                unique: false
                            }
                        );

                    }

                };


            request.onsuccess =
                event => {

                    db =
                        event.target.result;

                    resolve(db);

                };


            request.onerror =
                event => {

                    console.error(
                        "IndexedDB error:",
                        event.target.error
                    );

                    reject(
                        event.target.error
                    );

                };

        }
    );

}


/* =====================================================
   PDF DATABASE FUNCTIONS
===================================================== */

function addPDFToDatabase(pdf) {

    return new Promise(
        (resolve, reject) => {

            if (!db) {

                reject(
                    new Error(
                        "Database not ready."
                    )
                );

                return;

            }


            const transaction =
                db.transaction(
                    [PDF_STORE],
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    PDF_STORE
                );


            const request =
                store.add(pdf);


            request.onsuccess =
                () => resolve();


            request.onerror =
                event =>
                    reject(
                        event.target.error
                    );

        }
    );

}


function getAllPDFs() {

    return new Promise(
        (resolve, reject) => {

            if (!db) {

                resolve([]);

                return;

            }


            const transaction =
                db.transaction(
                    [PDF_STORE],
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    PDF_STORE
                );


            const request =
                store.getAll();


            request.onsuccess =
                () =>
                    resolve(
                        request.result
                    );


            request.onerror =
                event =>
                    reject(
                        event.target.error
                    );

        }
    );

}


function getPDF(pdfId) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    [PDF_STORE],
                    "readonly"
                );


            const store =
                transaction.objectStore(
                    PDF_STORE
                );


            const request =
                store.get(pdfId);


            request.onsuccess =
                () =>
                    resolve(
                        request.result
                    );


            request.onerror =
                event =>
                    reject(
                        event.target.error
                    );

        }
    );

}


function deletePDFFromDatabase(pdfId) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    [PDF_STORE],
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    PDF_STORE
                );


            const request =
                store.delete(pdfId);


            request.onsuccess =
                () => resolve();


            request.onerror =
                event =>
                    reject(
                        event.target.error
                    );

        }
    );

}


function deleteSubjectPDFs(subjectId) {

    return new Promise(
        (resolve, reject) => {

            const transaction =
                db.transaction(
                    [PDF_STORE],
                    "readwrite"
                );


            const store =
                transaction.objectStore(
                    PDF_STORE
                );


            const request =
                store.openCursor();


            request.onsuccess =
                event => {

                    const cursor =
                        event.target.result;


                    if (!cursor) {

                        resolve();

                        return;

                    }


                    if (
                        cursor.value.subjectId ===
                        subjectId
                    ) {

                        cursor.delete();

                    }


                    cursor.continue();

                };


            request.onerror =
                event =>
                    reject(
                        event.target.error
                    );

        }
    );

}


/* =====================================================
   SUBJECT STORAGE
===================================================== */

function loadSubjects() {

    try {

        const saved =
            localStorage.getItem(
                SUBJECT_STORAGE_KEY
            );


        if (saved) {

            subjects =
                JSON.parse(saved);

        } else {

            subjects =
                JSON.parse(
                    JSON.stringify(
                        defaultSubjects
                    )
                );

            saveSubjects();

        }

    } catch (error) {

        console.error(error);

        subjects =
            JSON.parse(
                JSON.stringify(
                    defaultSubjects
                )
            );

    }

}


function saveSubjects() {

    localStorage.setItem(
        SUBJECT_STORAGE_KEY,
        JSON.stringify(subjects)
    );

}


/* =====================================================
   IDs
===================================================== */

function generateID(length = 10) {

    const chars =
        "abcdefghijklmnopqrstuvwxyz0123456789";

    let output = "";

    for (
        let i = 0;
        i < length;
        i++
    ) {

        output +=
            chars[
                Math.floor(
                    Math.random() *
                    chars.length
                )
            ];

    }

    return output;

}


/* =====================================================
   NAVIGATION
===================================================== */

function transitionTo(
    sectionId,
    callback
) {

    const transition =
        document.getElementById(
            "pageTransition"
        );


    transition.classList.add(
        "active"
    );


    playSound("page");


    setTimeout(() => {

        callback();

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });

    }, 390);


    setTimeout(() => {

        transition.classList.remove(
            "active"
        );

    }, 850);

}


function hideAllSections() {

    document
        .querySelectorAll(
            ".page-section"
        )
        .forEach(
            section =>
                section.classList.remove(
                    "active"
                )
        );

}


function showSectionDirect(id) {

    hideAllSections();

    const section =
        document.getElementById(id);


    if (section) {

        section.classList.add(
            "active"
        );

    }

}


function showSection(id) {

    transitionTo(
        id,
        () => {

            showSectionDirect(id);

        }
    );

}


function goHome() {

    currentSubject = null;

    currentClass = null;

    currentMedium = null;


    transitionTo(
        "homeSection",
        () => {

            showSectionDirect(
                "homeSection"
            );

            updateStats();

        }
    );

}


/* =====================================================
   SUBJECTS
===================================================== */

function showSubjects() {

    currentSubject = null;

    currentClass = null;

    currentMedium = null;


    renderSubjects();


    transitionTo(
        "subjectsSection",
        () => {

            showSectionDirect(
                "subjectsSection"
            );

        }
    );

}


function renderSubjects(
    searchTerm = ""
) {

    const grid =
        document.getElementById(
            "subjectsGrid"
        );


    if (!grid) return;


    const term =
        searchTerm
            .trim()
            .toLowerCase();


    const filtered =
        subjects.filter(
            subject =>
                subject.name
                    .toLowerCase()
                    .includes(term)
        );


    if (!filtered.length) {

        grid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    ⌕
                </div>

                <h3>
                    No subjects found
                </h3>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;

    }


    grid.innerHTML =
        filtered
            .map(
                subject => `

                    <article
                        class="subject-card"
                        onclick="openSubject('${subject.id}')"
                    >

                        <div class="subject-top">

                            <div class="subject-icon">
                                ${escapeHTML(subject.icon)}
                            </div>

                            <button
                                class="subject-delete"
                                title="Remove subject"
                                onclick="
                                    event.stopPropagation();
                                    openRemoveSubjectModal('${subject.id}');
                                "
                            >
                                🗑
                            </button>

                        </div>


                        <div>

                            <div class="subject-name">
                                ${escapeHTML(subject.name)}
                            </div>

                            <div
                                id="subject-count-${subject.id}"
                                class="subject-meta"
                            >
                                Loading...
                            </div>

                        </div>


                        <div class="subject-arrow">
                            →
                        </div>

                    </article>

                `
            )
            .join("");


    updateSubjectPDFCounts();

}


async function updateSubjectPDFCounts() {

    try {

        const allPDFs =
            await getAllPDFs();


        subjects.forEach(
            subject => {

                const count =
                    allPDFs.filter(
                        pdf =>
                            pdf.subjectId ===
                            subject.id
                    ).length;


                const element =
                    document.getElementById(
                        `subject-count-${subject.id}`
                    );


                if (element) {

                    element.textContent =
                        `${count} ${
                            count === 1
                                ? "PDF"
                                : "PDFs"
                        }`;

                }

            }
        );

    } catch (error) {

        console.error(error);

    }

}


function searchSubjects() {

    const input =
        document.getElementById(
            "subjectSearch"
        );


    renderSubjects(
        input?.value || ""
    );

}


/* =====================================================
   SUBJECT OPEN
===================================================== */

function openSubject(subjectId) {

    const subject =
        subjects.find(
            item =>
                item.id === subjectId
        );


    if (!subject) return;


    currentSubject =
        subject;


    currentClass = null;

    currentMedium = null;


    document.getElementById(
        "selectedSubjectLabel"
    ).textContent =
        subject.name.toUpperCase();


    renderClasses();


    transitionTo(
        "classesSection",
        () => {

            showSectionDirect(
                "classesSection"
            );

        }
    );

}


/* =====================================================
   CLASSES
===================================================== */

async function renderClasses() {

    const grid =
        document.getElementById(
            "classesGrid"
        );


    if (!grid) return;


    grid.innerHTML =
        CLASSES
            .map(
                item => `

                    <article
                        class="class-card"
                        onclick="openClass('${item.id}')"
                    >

                        <div class="class-number">
                            ${item.number}
                        </div>

                        <div class="class-name">
                            ${item.name}
                        </div>

                        <div class="class-arrow">
                            →
                        </div>

                    </article>

                `
            )
            .join("");

}


function openClass(classId) {

    const classItem =
        CLASSES.find(
            item =>
                item.id === classId
        );


    if (!classItem) return;


    currentClass =
        classItem;


    currentMedium = null;


    document.getElementById(
        "selectedClassLabel"
    ).textContent =
        `${currentSubject.name} • ${currentClass.name}`
            .toUpperCase();


    renderMediums();


    transitionTo(
        "mediumSection",
        () => {

            showSectionDirect(
                "mediumSection"
            );

        }
    );

}


function showClasses() {

    renderClasses();


    transitionTo(
        "classesSection",
        () => {

            showSectionDirect(
                "classesSection"
            );

        }
    );

}


/* =====================================================
   MEDIUM
===================================================== */

function renderMediums() {

    const grid =
        document.getElementById(
            "mediumGrid"
        );


    if (!grid) return;


    grid.innerHTML =
        MEDIUMS
            .map(
                medium => `

                    <article
                        class="medium-card"
                        onclick="openMedium('${medium.id}')"
                    >

                        <div class="medium-letter">
                            ${medium.letter}
                        </div>

                        <div class="medium-name">
                            ${medium.name}
                        </div>

                        <div class="medium-subtitle">
                            ${medium.subtitle}
                        </div>

                        <div class="medium-arrow">
                            →
                        </div>

                    </article>

                `
            )
            .join("");

}


function openMedium(mediumId) {

    const medium =
        MEDIUMS.find(
            item =>
                item.id === mediumId
        );


    if (!medium) return;


    currentMedium =
        medium.id;


    renderPDFs();


    transitionTo(
        "pdfSection",
        () => {

            showSectionDirect(
                "pdfSection"
            );

        }
    );


    playLanguageSound(
        medium.id
    );

}


function showLanguages() {

    renderMediums();


    transitionTo(
        "mediumSection",
        () => {

            showSectionDirect(
                "mediumSection"
            );

        }
    );

}


/* =====================================================
   PDF RENDERING
===================================================== */

async function renderPDFs() {

    const grid =
        document.getElementById(
            "pdfGrid"
        );


    if (!grid) return;


    if (
        !currentSubject ||
        !currentClass ||
        !currentMedium
    ) {

        return;

    }


    grid.innerHTML = `

        <div class="empty-state">

            <div class="empty-icon">
                ▣
            </div>

            <h3>
                Loading PDFs...
            </h3>

        </div>

    `;


    try {

        const allPDFs =
            await getAllPDFs();


        const currentPDFs =
            allPDFs.filter(
                pdf =>

                    pdf.subjectId ===
                        currentSubject.id &&

                    pdf.classId ===
                        currentClass.id &&

                    pdf.medium ===
                        currentMedium
            );


        document.getElementById(
            "pdfBreadcrumb"
        ).textContent =
            `${currentSubject.name} / ${currentClass.name} / ${currentMedium}`;


        document.getElementById(
            "pdfPageTitle"
        ).textContent =
            `${currentMedium} PDFs`;


        document.getElementById(
            "pdfPageSubtitle"
        ).textContent =
            `${currentSubject.name} • ${currentClass.name}`;


        if (!currentPDFs.length) {

            grid.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ▣
                    </div>

                    <h3>
                        No PDFs yet
                    </h3>

                    <p>
                        Add a PDF to this collection.
                    </p>

                </div>

            `;

            return;

        }


        grid.innerHTML =
            currentPDFs
                .map(
                    pdf => `

                        <article
                            class="pdf-card"
                        >

                            <div class="pdf-icon">
                                PDF
                            </div>


                            <div class="pdf-info">

                                <div class="pdf-title">
                                    ${escapeHTML(pdf.title)}
                                </div>


                                <div class="pdf-meta">

                                    ${escapeHTML(pdf.fileName)}

                                    •

                                    ${formatFileSize(pdf.size)}

                                    •

                                    ${formatDate(pdf.date)}

                                </div>

                            </div>


                            <div class="pdf-actions">


                                <button
                                    class="pdf-action"
                                    title="Download"
                                    onclick="downloadPDF('${pdf.id}')"
                                >
                                    ↓
                                </button>


                                <button
                                    class="pdf-action"
                                    title="QR Code"
                                    onclick="showQR('${pdf.id}')"
                                >
                                    ▦
                                </button>


                                <button
                                    class="pdf-action delete"
                                    title="Remove"
                                    onclick="removePDF('${pdf.id}')"
                                >
                                    ×
                                </button>


                            </div>

                        </article>

                    `
                )
                .join("");


    } catch (error) {

        console.error(error);


        grid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    !
                </div>

                <h3>
                    Could not load PDFs
                </h3>

                <p>
                    Please refresh the page.
                </p>

            </div>

        `;

    }

}


/* =====================================================
   ADD SUBJECT
===================================================== */

function openAddSubjectModal() {

    document.getElementById(
        "subjectNameInput"
    ).value = "";


    document.getElementById(
        "subjectIconInput"
    ).value = "";


    openModal(
        "addSubjectModal"
    );


    setTimeout(
        () =>
            document
                .getElementById(
                    "subjectNameInput"
                )
                ?.focus(),
        150
    );

}


function addSubject() {

    const name =
        document
            .getElementById(
                "subjectNameInput"
            )
            .value
            .trim();


    const icon =
        document
            .getElementById(
                "subjectIconInput"
            )
            .value
            .trim() ||
        "✦";


    if (!name) {

        showToast(
            "Subject required",
            "Enter a subject name.",
            "error"
        );

        return;

    }


    const exists =
        subjects.some(
            subject =>
                subject.name
                    .toLowerCase() ===
                name.toLowerCase()
        );


    if (exists) {

        showToast(
            "Already exists",
            "That subject already exists.",
            "error"
        );

        return;

    }


    const subject = {

        id:
            `${name
                .toLowerCase()
                .replace(
                    /[^a-z0-9]+/g,
                    "-"
                )
                .replace(
                    /^-|-$/g,
                    ""
                )}-${generateID(5)}`,

        name,

        icon

    };


    subjects.push(subject);

    saveSubjects();

    updateStats();

    closeModal(
        "addSubjectModal"
    );

    renderSubjects();


    showSectionDirect(
        "subjectsSection"
    );


    playSound("success");


    showToast(
        "Subject added",
        `${name} is now in your library.`
    );

}


/* =====================================================
   REMOVE SUBJECT
===================================================== */

function openRemoveSubjectModal(
    subjectId
) {

    const subject =
        subjects.find(
            item =>
                item.id === subjectId
        );


    if (!subject) return;


    subjectToRemove =
        subjectId;


    document.getElementById(
        "removeSubjectTitle"
    ).textContent =
        `Remove ${subject.name}?`;


    openModal(
        "removeSubjectModal"
    );

}


async function confirmRemoveSubject() {

    if (!subjectToRemove) {

        return;

    }


    const subject =
        subjects.find(
            item =>
                item.id ===
                subjectToRemove
        );


    if (!subject) {

        return;

    }


    try {

        await deleteSubjectPDFs(
            subjectToRemove
        );


        subjects =
            subjects.filter(
                item =>
                    item.id !==
                    subjectToRemove
            );


        saveSubjects();

        subjectToRemove = null;


        closeModal(
            "removeSubjectModal"
        );


        renderSubjects();

        updateStats();


        showSectionDirect(
            "subjectsSection"
        );


        playSound("delete");


        showToast(
            "Subject removed",
            `${subject.name} was removed.`,
            "error"
        );


    } catch (error) {

        console.error(error);


        showToast(
            "Remove failed",
            "Could not remove the subject.",
            "error"
        );

    }

}


/* =====================================================
   ADD PDF MODAL
===================================================== */

function openAddPdfModal() {

    if (
        !currentSubject ||
        !currentClass ||
        !currentMedium
    ) {

        showToast(
            "Choose a location",
            "Select a subject, class and medium first.",
            "error"
        );

        return;

    }


    document.getElementById(
        "pdfTitleInput"
    ).value = "";


    document.getElementById(
        "pdfFileInput"
    ).value = "";


    document.getElementById(
        "fileNameDisplay"
    ).textContent =
        "Choose PDF file";


    document
        .getElementById(
            "uploadProgressArea"
        )
        .classList.remove(
            "active"
        );


    document.getElementById(
        "uploadProgressBar"
    ).style.width =
        "0%";


    document.getElementById(
        "uploadProgressText"
    ).textContent =
        "0%";


    document.getElementById(
        "addPdfButton"
    ).disabled = false;


    document.getElementById(
        "addPdfButton"
    ).style.opacity = "1";


    openModal(
        "addPdfModal"
    );

}


function updateFileName() {

    const input =
        document.getElementById(
            "pdfFileInput"
        );


    const display =
        document.getElementById(
            "fileNameDisplay"
        );


    if (
        input.files &&
        input.files.length
    ) {

        display.textContent =
            input.files[0].name;

    } else {

        display.textContent =
            "Choose PDF file";

    }

}


/* =====================================================
   ADD PDF
===================================================== */

async function addPDF() {

    const titleInput =
        document.getElementById(
            "pdfTitleInput"
        );


    const fileInput =
        document.getElementById(
            "pdfFileInput"
        );


    const title =
        titleInput.value.trim();


    const file =
        fileInput.files?.[0];


    if (!title) {

        showToast(
            "Title required",
            "Enter a title for the PDF.",
            "error"
        );

        return;

    }


    if (!file) {

        showToast(
            "PDF required",
            "Choose a PDF file.",
            "error"
        );

        return;

    }


    const isPDF =
        file.type ===
            "application/pdf" ||
        file.name
            .toLowerCase()
            .endsWith(".pdf");


    if (!isPDF) {

        showToast(
            "Invalid file",
            "Only PDF files are allowed.",
            "error"
        );

        return;

    }


    /*
        No artificial 20 MB localStorage limit anymore.

        IndexedDB can handle substantially larger
        files, depending on the browser/device.
    */


    const button =
        document.getElementById(
            "addPdfButton"
        );


    const progressArea =
        document.getElementById(
            "uploadProgressArea"
        );


    const progressBar =
        document.getElementById(
            "uploadProgressBar"
        );


    const progressText =
        document.getElementById(
            "uploadProgressText"
        );


    button.disabled = true;

    button.style.opacity = ".55";


    progressArea.classList.add(
        "active"
    );


    progressBar.style.width =
        "15%";


    progressText.textContent =
        "15%";


    try {

        /*
            We store the actual File object
            directly in IndexedDB.

            No Base64 conversion.
            No localStorage quota problem.
        */


        const pdf = {

            id:
                generateID(12),

            subjectId:
                currentSubject.id,

            subjectName:
                currentSubject.name,

            classId:
                currentClass.id,

            className:
                currentClass.name,

            medium:
                currentMedium,

            title,

            fileName:
                file.name,

            size:
                file.size,

            date:
                new Date().toISOString(),

            file
        };


        progressBar.style.width =
            "40%";

        progressText.textContent =
            "40%";


        await addPDFToDatabase(
            pdf
        );


        progressBar.style.width =
            "75%";

        progressText.textContent =
            "75%";


        /*
            Small delay gives the user
            a visible polished transition.
        */

        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    250
                )
        );


        progressBar.style.width =
            "100%";

        progressText.textContent =
            "100%";


        await new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    300
                )
        );


        closeModal(
            "addPdfModal"
        );


        button.disabled = false;

        button.style.opacity =
            "1";


        progressArea.classList.remove(
            "active"
        );


        await renderPDFs();

        await updateStats();


        playSound("success");


        showToast(
            "PDF added",
            `${title} was added successfully.`
        );


    } catch (error) {

        console.error(
            "PDF save error:",
            error
        );


        button.disabled = false;

        button.style.opacity =
            "1";


        progressArea.classList.remove(
            "active"
        );


        showToast(
            "PDF could not be saved",
            "Your browser rejected the file storage.",
            "error"
        );

    }

}


/* =====================================================
   DOWNLOAD
===================================================== */

async function downloadPDF(
    pdfId
) {

    try {

        const pdf =
            await getPDF(
                pdfId
            );


        if (!pdf) {

            showToast(
                "PDF unavailable",
                "The PDF could not be found.",
                "error"
            );

            return;

        }


        const blob =
            pdf.file instanceof Blob
                ? pdf.file
                : new Blob(
                    [pdf.file],
                    {
                        type:
                            "application/pdf"
                    }
                );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href = url;

        link.download =
            pdf.fileName ||
            `${pdf.title}.pdf`;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        setTimeout(
            () =>
                URL.revokeObjectURL(
                    url
                ),
            2000
        );


        playSound("download");


        showToast(
            "Download started",
            pdf.fileName
        );


    } catch (error) {

        console.error(error);


        showToast(
            "Download failed",
            "The PDF could not be downloaded.",
            "error"
        );

    }

}


/* =====================================================
   REMOVE PDF
===================================================== */

async function removePDF(
    pdfId
) {

    try {

        const pdf =
            await getPDF(
                pdfId
            );


        if (!pdf) {

            return;

        }


        const confirmed =
            window.confirm(
                `Remove "${pdf.title}" from this library?`
            );


        if (!confirmed) {

            return;

        }


        await deletePDFFromDatabase(
            pdfId
        );


        await renderPDFs();

        await updateStats();


        playSound("delete");


        showToast(
            "PDF removed",
            `${pdf.title} was removed.`,
            "error"
        );


    } catch (error) {

        console.error(error);


        showToast(
            "Remove failed",
            "The PDF could not be removed.",
            "error"
        );

    }

}


/* =====================================================
   QR
===================================================== */

function createPDFLink(pdf) {

    let baseURL;


    if (
        PUBLIC_BASE_URL.trim()
    ) {

        baseURL =
            PUBLIC_BASE_URL.trim();

    } else {

        baseURL =
            window.location.href
                .split("?")[0]
                .split("#")[0];

    }


    const separator =
        baseURL.includes("?")
            ? "&"
            : "?";


    return (
        `${baseURL}${separator}pdf=${encodeURIComponent(pdf.id)}`
    );

}


async function showQR(pdfId) {

    try {

        const pdf =
            await getPDF(
                pdfId
            );


        if (!pdf) {

            showToast(
                "PDF unavailable",
                "Could not find this PDF.",
                "error"
            );

            return;

        }


        selectedPDFForQR =
            pdfId;


        const container =
            document.getElementById(
                "qrcode"
            );


        const url =
            createPDFLink(
                pdf
            );


        document.getElementById(
            "qrTitle"
        ).textContent =
            pdf.title;


        document.getElementById(
            "qrUrl"
        ).textContent =
            url;


        container.innerHTML = "";


        if (
            typeof QRCode ===
            "undefined"
        ) {

            container.innerHTML = `

                <p
                    style="
                        color:#111;
                        font-size:12px;
                    "
                >
                    QR library unavailable
                </p>

            `;

        } else {

            new QRCode(
                container,
                {

                    text: url,

                    width: 195,

                    height: 195,

                    colorDark:
                        "#071014",

                    colorLight:
                        "#ffffff",

                    correctLevel:
                        QRCode.CorrectLevel.M

                }
            );

        }


        openModal(
            "qrModal"
        );


        playSound("qr");


    } catch (error) {

        console.error(error);

    }

}


async function copyQRLink() {

    if (!selectedPDFForQR) {

        return;

    }


    try {

        const pdf =
            await getPDF(
                selectedPDFForQR
            );


        if (!pdf) return;


        const link =
            createPDFLink(
                pdf
            );


        await navigator.clipboard
            .writeText(link);


        showToast(
            "Link copied",
            "QR link copied to clipboard."
        );


    } catch {

        showToast(
            "Copy failed",
            "Could not copy the link.",
            "error"
        );

    }

}


/* =====================================================
   QR ROUTE
===================================================== */

async function handlePDFRoute() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const pdfId =
        params.get("pdf");


    if (!pdfId) {

        return;

    }


    try {

        const pdf =
            await getPDF(
                pdfId
            );


        if (!pdf) {

            return;

        }


        /*
            Same-browser QR route.

            The PDF is automatically downloaded
            when its ID is found in IndexedDB.
        */

        setTimeout(
            () =>
                downloadPDF(
                    pdfId
                ),
            3300
        );


    } catch (error) {

        console.error(error);

    }

}


/* =====================================================
   MODALS
===================================================== */

function openModal(id) {

    document
        .getElementById(id)
        ?.classList.add(
            "active"
        );

}


function closeModal(id) {

    document
        .getElementById(id)
        ?.classList.remove(
            "active"
        );

}


function closeModalOutside(
    event,
    id
) {

    if (
        event.target.id === id
    ) {

        closeModal(id);

    }

}


/* =====================================================
   STATS
===================================================== */

async function updateStats() {

    const subjectElement =
        document.getElementById(
            "homeSubjectCount"
        );


    const pdfElement =
        document.getElementById(
            "homePDFCount"
        );


    if (subjectElement) {

        subjectElement.textContent =
            subjects.length;

    }


    try {

        const allPDFs =
            await getAllPDFs();


        if (pdfElement) {

            pdfElement.textContent =
                allPDFs.length;

        }


        await updateSubjectPDFCounts();


    } catch {

        if (pdfElement) {

            pdfElement.textContent =
                "0";

        }

    }

}


/* =====================================================
   TOAST
===================================================== */

let toastTimer = null;


function showToast(
    title,
    message,
    type = "success"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    const icon =
        document.getElementById(
            "toastIcon"
        );


    document.getElementById(
        "toastTitle"
    ).textContent =
        title;


    document.getElementById(
        "toastMessage"
    ).textContent =
        message;


    if (
        type === "error"
    ) {

        icon.textContent =
            "!";

        icon.style.color =
            "var(--danger)";

        icon.style.background =
            "rgba(255,104,104,.10)";

    } else {

        icon.textContent =
            "✓";

        icon.style.color =
            "var(--blue)";

        icon.style.background =
            "rgba(88,185,255,.10)";

    }


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () =>
                toast.classList.remove(
                    "show"
                ),
            3200
        );

}


/* =====================================================
   AUDIO
===================================================== */

function initializeAudio() {

    try {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    } catch {

        audioContext =
            null;

    }

}


function playTone(
    frequency,
    duration = .08,
    volume = .02,
    type = "sine"
) {

    if (
        !soundEnabled ||
        !audioContext
    ) {

        return;

    }


    try {

        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();

        }


        const oscillator =
            audioContext
                .createOscillator();


        const gain =
            audioContext
                .createGain();


        oscillator.type =
            type;


        oscillator.frequency.value =
            frequency;


        gain.gain.setValueAtTime(
            volume,
            audioContext.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            .001,
            audioContext.currentTime +
            duration
        );


        oscillator.connect(gain);

        gain.connect(
            audioContext.destination
        );


        oscillator.start();

        oscillator.stop(
            audioContext.currentTime +
            duration
        );

    } catch {}

}


function playSound(type) {

    if (!soundEnabled) {

        return;

    }


    switch(type) {


        case "click":

            playTone(
                430,
                .05,
                .018
            );

            break;


        case "page":

            playTone(
                260,
                .05,
                .012
            );


            setTimeout(
                () =>
                    playTone(
                        430,
                        .08,
                        .014
                    ),
                70
            );

            break;


        case "success":

            playTone(
                540,
                .07,
                .025
            );


            setTimeout(
                () =>
                    playTone(
                        720,
                        .10,
                        .02
                    ),
                70
            );

            break;


        case "delete":

            playTone(
                230,
                .10,
                .025,
                "triangle"
            );

            break;


        case "download":

            playTone(
                650,
                .06,
                .02
            );


            setTimeout(
                () =>
                    playTone(
                        850,
                        .08,
                        .018
                    ),
                70
            );

            break;


        case "qr":

            playTone(
                500,
                .06,
                .018
            );


            setTimeout(
                () =>
                    playTone(
                        620,
                        .06,
                        .018
                    ),
                70
            );

            break;

    }

}


function playLanguageSound(
    medium
) {

    if (!soundEnabled) {

        return;

    }


    if (medium === "Bengali") {

        playTone(
            440,
            .08,
            .018
        );


        setTimeout(
            () =>
                playTone(
                    523,
                    .10,
                    .018
                ),
            70
        );

    }


    else if (
        medium === "English"
    ) {

        playTone(
            523,
            .08,
            .018
        );


        setTimeout(
            () =>
                playTone(
                    659,
                    .10,
                    .018
                ),
            70
        );

    }


    else if (
        medium === "Hindi"
    ) {

        playTone(
            392,
            .08,
            .018
        );


        setTimeout(
            () =>
                playTone(
                    494,
                    .10,
                    .018
                ),
            70
        );

    }

}


function toggleSound() {

    soundEnabled =
        !soundEnabled;


    document.getElementById(
        "soundButton"
    ).textContent =
        soundEnabled
            ? "🔊"
            : "🔇";


    if (soundEnabled) {

        playTone(
            600,
            .08,
            .02
        );

    }

}


/* =====================================================
   KEYBOARD
===================================================== */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() ===
                    "k"
            ) {

                event.preventDefault();


                showSubjects();


                setTimeout(
                    () =>
                        document
                            .getElementById(
                                "subjectSearch"
                            )
                            ?.focus(),
                    700
                );

            }


            if (
                event.key ===
                "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal-overlay.active"
                    )
                    .forEach(
                        modal =>
                            modal.classList.remove(
                                "active"
                            )
                    );

            }

        }
    );

}


/* =====================================================
   UTILITIES
===================================================== */

function formatFileSize(
    bytes
) {

    if (
        !bytes ||
        bytes <= 0
    ) {

        return "0 B";

    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.min(
            Math.floor(
                Math.log(bytes) /
                Math.log(1024)
            ),
            units.length - 1
        );


    return `${(
        bytes /
        Math.pow(
            1024,
            index
        )
    ).toFixed(
        index === 0 ? 0 : 1
    )} ${units[index]}`;

}


function formatDate(
    dateString
) {

    try {

        return new Date(
            dateString
        ).toLocaleDateString(
            undefined,
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    } catch {

        return "Unknown date";

    }

}


function escapeHTML(
    value
) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}