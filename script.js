/* =========================================================
   BLUEVAULT
   SHARED CLASS NOTES LIBRARY
   SUPABASE CLOUD VERSION
========================================================= */


/* =========================================================
   SUPABASE CONFIGURATION
========================================================= */

const SUPABASE_URL =
    "https://fgyzulkqpotylkekjfju.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_U05bMGw7hyaGfgbtU31zrQ_4vbtUb5-";

const SUPABASE_BUCKET =
    "bluevault-pdfs";

let supabaseClient = null;

try {

    if (
        window.supabase &&
        typeof window.supabase.createClient === "function"
    ) {

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_PUBLISHABLE_KEY
            );

    }

} catch (error) {

    console.error(
        "Supabase initialization failed:",
        error
    );

}


/* =========================================================
   LIMITS
========================================================= */

const MAX_PDF_SIZE =
    500 * 1024 * 1024;


/* =========================================================
   DEFAULT SUBJECTS
========================================================= */

const defaultSubjects = [

    {
        id: "mathematics",
        english: "Mathematics",
        bengali: "গণিত",
        short: "Numbers, Logic & Problem Solving",
        icon: "∑",
        custom: false
    },

    {
        id: "physical-science",
        english: "Physical Science",
        bengali: "ভৌত বিজ্ঞান",
        short: "Matter, Energy & Physics",
        icon: "⚗",
        custom: false
    },

    {
        id: "life-science",
        english: "Life Science",
        bengali: "জীবন বিজ্ঞান",
        short: "Biology, Life & Nature",
        icon: "🧬",
        custom: false
    },

    {
        id: "history",
        english: "History",
        bengali: "ইতিহাস",
        short: "Civilization & The Past",
        icon: "⌛",
        custom: false
    },

    {
        id: "geography",
        english: "Geography",
        bengali: "ভূগোল",
        short: "Earth, Maps & Environment",
        icon: "🌍",
        custom: false
    },

    {
        id: "english",
        english: "English",
        bengali: "ইংরেজি",
        short: "Language & Literature",
        icon: "A",
        custom: false
    },

    {
        id: "bengali",
        english: "Bengali",
        bengali: "বাংলা",
        short: "বাংলা ভাষা ও সাহিত্য",
        icon: "অ",
        custom: false
    },

    {
        id: "computer-science",
        english: "Computer Science",
        bengali: "কম্পিউটার বিজ্ঞান",
        short: "Technology & Programming",
        icon: "💻",
        custom: false
    },

    {
        id: "environmental-science",
        english: "Environmental Science",
        bengali: "পরিবেশ বিজ্ঞান",
        short: "Environment & Ecology",
        icon: "🌱",
        custom: false
    },

    {
        id: "general-knowledge",
        english: "General Knowledge",
        bengali: "সাধারণ জ্ঞান",
        short: "Facts, Awareness & Current Topics",
        icon: "⭐",
        custom: false
    },

    {
        id: "economics",
        english: "Economics",
        bengali: "অর্থনীতি",
        short: "Money, Markets & Society",
        icon: "₹",
        custom: false
    },

    {
        id: "political-science",
        english: "Political Science",
        bengali: "রাষ্ট্রবিজ্ঞান",
        short: "Government & Society",
        icon: "⚖",
        custom: false
    }

];


/* =========================================================
   STATE
========================================================= */

let subjects = [];

let currentSubject = "";

let currentLanguage = "";

let selectedSubjectIcon = "📘";

let searchTerm = "";

let soundEnabled = true;

let toastTimer = null;

let audioContext = null;


/* =========================================================
   LOAD SUBJECTS
========================================================= */

try {

    const saved =
        JSON.parse(
            localStorage.getItem(
                "blueVaultSubjects"
            )
        );

    subjects =
        Array.isArray(saved) &&
        saved.length
            ? saved
            : [...defaultSubjects];

} catch (error) {

    subjects =
        [...defaultSubjects];

}


function saveSubjects() {

    try {

        localStorage.setItem(
            "blueVaultSubjects",
            JSON.stringify(subjects)
        );

    } catch (error) {

        console.warn(
            "Could not save subjects.",
            error
        );

    }

}


/* =========================================================
   STARTUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        createSubjectCards();

        updateSubjectCounters();

        startLoadingScreen();

        setupKeyboardShortcuts();

        if (!supabaseClient) {

            showToast(
                "Supabase connection unavailable."
            );

        }

    }
);


/* =========================================================
   LOADING SCREEN
========================================================= */

function startLoadingScreen() {

    const progress =
        document.getElementById(
            "loadingProgress"
        );

    const screen =
        document.getElementById(
            "loadingScreen"
        );

    if (!progress || !screen) {
        return;
    }

    let value = 0;

    const timer =
        setInterval(
            function () {

                value +=
                    Math.floor(
                        Math.random() * 10
                    ) + 5;

                if (value > 100) {
                    value = 100;
                }

                progress.style.width =
                    value + "%";

                if (value >= 100) {

                    clearInterval(timer);

                    setTimeout(
                        function () {

                            screen.classList.add(
                                "hide"
                            );

                            playSound(
                                "page"
                            );

                        },
                        500
                    );

                }

            },
            120
        );

}


/* =========================================================
   SUBJECT CARDS
========================================================= */

function createSubjectCards() {

    const homeGrid =
        document.getElementById(
            "homeSubjectGrid"
        );

    const subjectGrid =
        document.getElementById(
            "subjectGrid"
        );

    const term =
        searchTerm
            .toLowerCase()
            .trim();

    const filtered =
        subjects.filter(
            function (subject) {

                return (
                    subject.english
                        .toLowerCase()
                        .includes(term)
                    ||
                    subject.bengali
                        .toLowerCase()
                        .includes(term)
                );

            }
        );


    const cards =
        filtered
            .map(
                function (subject, index) {

                    return `

<div
    class="subject-card"
    onclick="openLanguagePage('${escapeAttribute(subject.id)}')"
>

    <span class="subject-number">
        ${String(index + 1).padStart(2, "0")}
    </span>

    <div class="subject-icon">
        ${escapeHTML(subject.icon)}
    </div>

    <h3>
        ${escapeHTML(subject.english)}
    </h3>

    <p>
        ${escapeHTML(subject.short)}
    </p>

    <span class="subject-language">
        ${escapeHTML(subject.bengali)}
    </span>

    ${
        subject.custom
            ? `
<button
    class="subject-delete"
    onclick="event.stopPropagation(); removeSubject('${escapeAttribute(subject.id)}')"
    title="Remove subject"
>
    ×
</button>
`
            : ""
    }

</div>

`;

                }
            )
            .join("");


    if (homeGrid) {

        homeGrid.innerHTML =
            subjects
                .slice(0, 5)
                .map(
                    function (subject, index) {

                        return `

<div
    class="subject-card"
    onclick="openLanguagePage('${escapeAttribute(subject.id)}')"
>

    <span class="subject-number">
        ${String(index + 1).padStart(2, "0")}
    </span>

    <div class="subject-icon">
        ${escapeHTML(subject.icon)}
    </div>

    <h3>
        ${escapeHTML(subject.english)}
    </h3>

    <p>
        ${escapeHTML(subject.short)}
    </p>

    <span class="subject-language">
        ${escapeHTML(subject.bengali)}
    </span>

</div>

`;

                    }
                )
                .join("");

    }


    if (subjectGrid) {

        subjectGrid.innerHTML =
            cards ||
            `

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

    }

}


/* =========================================================
   SUBJECT COUNTERS
========================================================= */

function updateSubjectCounters() {

    const count =
        subjects.length;

    const home =
        document.getElementById(
            "homeSubjectCount"
        );

    const number =
        document.getElementById(
            "subjectNumber"
        );

    if (home) {

        home.textContent =
            count;

    }

    if (number) {

        number.textContent =
            String(count).padStart(
                2,
                "0"
            );

    }

}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(pageId) {

    document
        .querySelectorAll(".page")
        .forEach(
            function (page) {

                page.classList.remove(
                    "active"
                );

            }
        );


    const page =
        document.getElementById(
            pageId
        );

    if (!page) {
        return;
    }


    page.classList.add(
        "active"
    );


    playSound(
        "page"
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function goHome() {

    showPage(
        "homePage"
    );

}


function showSubjects() {

    searchTerm = "";

    const input =
        document.getElementById(
            "subjectSearch"
        );

    if (input) {
        input.value = "";
    }

    createSubjectCards();

    showPage(
        "subjectsPage"
    );

}


function searchSubjects() {

    const input =
        document.getElementById(
            "subjectSearch"
        );

    searchTerm =
        input
            ? input.value.trim()
            : "";

    createSubjectCards();

}


/* =========================================================
   LANGUAGE PAGE
========================================================= */

function openLanguagePage(
    subjectId
) {

    const subject =
        subjects.find(
            function (item) {
                return item.id === subjectId;
            }
        );

    if (!subject) {
        return;
    }

    currentSubject =
        subjectId;

    const title =
        document.getElementById(
            "languagePageTitle"
        );

    if (title) {

        title.textContent =
            subject.english;

    }

    playSound(
        "language"
    );

    showPage(
        "languagePage"
    );

}


function backToLanguagePage() {

    const subject =
        subjects.find(
            function (item) {
                return item.id === currentSubject;
            }
        );

    if (!subject) {

        showSubjects();

        return;

    }

    const title =
        document.getElementById(
            "languagePageTitle"
        );

    if (title) {

        title.textContent =
            subject.english;

    }

    showPage(
        "languagePage"
    );

}


/* =========================================================
   OPEN PDF LIBRARY
========================================================= */

function openPDFLibrary(
    language
) {

    if (!currentSubject) {
        return;
    }

    currentLanguage =
        language;

    const subject =
        subjects.find(
            function (item) {
                return item.id === currentSubject;
            }
        );

    if (!subject) {
        return;
    }


    const languageName =
        language === "bengali"
            ? subject.bengali
            : subject.english;


    const title =
        document.getElementById(
            "pdfPageTitle"
        );

    const description =
        document.getElementById(
            "pdfPageDescription"
        );

    const search =
        document.getElementById(
            "pdfSearch"
        );


    if (title) {

        title.textContent =
            `${subject.english} — ${languageName}`;

    }


    if (description) {

        description.textContent =
            language === "bengali"
                ? `বাংলা ভাষায় ${subject.english}-এর shared class notes.`
                : `${subject.english} shared class notes and PDF resources.`;

    }


    if (search) {

        search.value = "";

    }


    searchTerm = "";

    showPage(
        "pdfPage"
    );

    renderPDFs();

    playSound(
        language === "bengali"
            ? "bengali"
            : "english"
    );

}


/* =========================================================
   SUPABASE CHECK
========================================================= */

function requireSupabase() {

    if (!supabaseClient) {

        alert(
            "BlueVault could not connect to Supabase.\n\n" +
            "Check your internet connection and Supabase configuration."
        );

        return false;

    }

    return true;

}


/* =========================================================
   SAFE PATH HELPERS
========================================================= */

function safePathPart(
    value
) {

    return String(
        value || "unknown"
    )
        .trim()
        .toLowerCase()
        .replace(
            /[^a-z0-9_-]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        )
        || "unknown";

}


function safeFileName(
    name
) {

    return String(
        name || "document.pdf"
    )
        .replace(
            /[\\/:*?"<>|#%{}~&]/g,
            "-"
        )
        .replace(
            /\s+/g,
            " "
        )
        .trim()
        .slice(
            0,
            180
        )
        || "document.pdf";

}


function getLibraryPrefix() {

    return (
        safePathPart(
            currentSubject
        )
        +
        "/"
        +
        safePathPart(
            currentLanguage
        )
        +
        "/"
    );

}


function makeStoragePath(
    fileName
) {

    const id =
        typeof crypto !== "undefined" &&
        crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}`;

    return (
        getLibraryPrefix()
        +
        id
        +
        "-"
        +
        safeFileName(fileName)
    );

}


/* =========================================================
   PDF UPLOAD
========================================================= */

async function handlePDFUpload(
    event
) {

    const file =
        event.target.files[0];

    if (!file) {
        return;
    }


    if (!requireSupabase()) {

        event.target.value = "";

        return;

    }


    if (
        file.type !==
        "application/pdf"
    ) {

        alert(
            "Please select a PDF file."
        );

        event.target.value = "";

        return;

    }


    if (
        file.size >
        MAX_PDF_SIZE
    ) {

        alert(
            "This PDF is larger than BlueVault's 500 MB per-file limit."
        );

        event.target.value = "";

        return;

    }


    if (
        !currentSubject ||
        !currentLanguage
    ) {

        alert(
            "Please choose a subject and language first."
        );

        event.target.value = "";

        return;

    }


    const uploadBox =
        document.querySelector(
            "label[for='pdfInput']"
        );

    if (uploadBox) {

        uploadBox.classList.add(
            "uploading"
        );

    }


    try {

        showToast(
            "Uploading PDF to BlueVault..."
        );


        const filePath =
            makeStoragePath(
                file.name
            );


        /* Upload actual PDF file */

        const storageResult =
            await supabaseClient
                .storage
                .from(
                    SUPABASE_BUCKET
                )
                .upload(
                    filePath,
                    file,
                    {
                        cacheControl: "3600",
                        contentType:
                            "application/pdf",
                        upsert: false
                    }
                );


        if (storageResult.error) {

            throw new Error(
                storageResult.error.message
            );

        }


        /* Save PDF information */

        const databaseResult =
            await supabaseClient
                .from("pdfs")
                .insert({
                    name: file.name,
                    subject: currentSubject,
                    chapter: null,
                    file_path: filePath,
                    file_size: file.size
                })
                .select()
                .single();


        if (databaseResult.error) {

            /* Remove uploaded file if DB insert fails */

            await supabaseClient
                .storage
                .from(
                    SUPABASE_BUCKET
                )
                .remove([
                    filePath
                ]);

            throw new Error(
                databaseResult.error.message
            );

        }


        event.target.value = "";

        await renderPDFs();

        playSound(
            "upload"
        );

        showToast(
            "PDF uploaded successfully."
        );


    } catch (error) {

        console.error(
            "PDF upload failed:",
            error
        );

        alert(
            "PDF upload failed.\n\n" +
            explainSupabaseError(
                error
            )
        );


    } finally {

        if (uploadBox) {

            uploadBox.classList.remove(
                "uploading"
            );

        }

        event.target.value = "";

    }

}


/* =========================================================
   GET SHARED PDFs
========================================================= */

async function getCurrentPDFs() {

    if (!requireSupabase()) {
        return [];
    }

    if (
        !currentSubject ||
        !currentLanguage
    ) {
        return [];
    }


    try {

        const result =
            await supabaseClient
                .from("pdfs")
                .select(
                    "id,name,subject,chapter,file_path,file_size,uploaded_at"
                )
                .eq(
                    "subject",
                    currentSubject
                )
                .order(
                    "uploaded_at",
                    {
                        ascending: false
                    }
                );


        if (result.error) {

            throw new Error(
                result.error.message
            );

        }


        const prefix =
            getLibraryPrefix();


        return (
            result.data || []
        ).filter(
            function (pdf) {

                return String(
                    pdf.file_path || ""
                ).startsWith(
                    prefix
                );

            }
        );


    } catch (error) {

        console.error(
            "Could not load PDFs:",
            error
        );

        showPDFError(
            explainSupabaseError(
                error
            )
        );

        return [];

    }

}


/* =========================================================
   RENDER PDFs
========================================================= */

async function renderPDFs() {

    const list =
        document.getElementById(
            "pdfList"
        );

    const count =
        document.getElementById(
            "pdfCount"
        );

    if (!list) {
        return;
    }


    list.innerHTML = `

<div class="empty-state">

    <div class="empty-icon">
        …
    </div>

    <h3>
        Loading shared notes
    </h3>

    <p>
        Connecting to the BlueVault cloud library.
    </p>

</div>

`;


    const all =
        await getCurrentPDFs();


    const filtered =
        all.filter(
            function (pdf) {

                return String(
                    pdf.name || ""
                )
                    .toLowerCase()
                    .includes(
                        searchTerm
                            .toLowerCase()
                    );

            }
        );


    if (count) {

        count.textContent =
            `${all.length} ${
                all.length === 1
                    ? "PDF"
                    : "PDFs"
            }`;

    }


    if (!filtered.length) {

        list.innerHTML =
            all.length === 0
                ? `

<div class="empty-state">

    <div class="empty-icon">
        +
    </div>

    <h3>
        No shared PDFs yet
    </h3>

    <p>
        Upload the first class note for this language.
    </p>

</div>

`
                : `

<div class="empty-state">

    <div class="empty-icon">
        ⌕
    </div>

    <h3>
        No matching PDFs
    </h3>

    <p>
        Try another search.
    </p>

</div>

`;

        return;

    }


    list.innerHTML =
        filtered
            .map(
                function (pdf) {

                    return `

<div class="pdf-item">

    <div class="pdf-icon">
        PDF
    </div>


    <div>

        <div
            class="pdf-name"
            title="${escapeHTML(pdf.name)}"
        >
            ${escapeHTML(pdf.name)}
        </div>


        <div class="pdf-meta">

            ${formatFileSize(
                Number(pdf.file_size) || 0
            )}

            •

            ${formatDate(
                pdf.uploaded_at
            )}

        </div>

    </div>


    <div class="pdf-actions">

        <button
            class="download-btn"
            onclick="openSharedPDF('${escapeAttribute(pdf.id)}')"
        >
            ↓ Open / Download
        </button>


        <button
            class="delete-btn"
            onclick="removePDF('${escapeAttribute(pdf.id)}')"
        >
            × Remove
        </button>

    </div>

</div>

`;

                }
            )
            .join("");

}


/* =========================================================
   SEARCH PDFs
========================================================= */

function searchPDFs() {

    const input =
        document.getElementById(
            "pdfSearch"
        );

    searchTerm =
        input
            ? input.value.trim()
            : "";

    renderPDFs();

}


/* =========================================================
   OPEN SHARED PDF
========================================================= */

async function openSharedPDF(
    pdfId
) {

    if (!requireSupabase()) {
        return;
    }


    try {

        const result =
            await supabaseClient
                .from("pdfs")
                .select(
                    "id,name,file_path"
                )
                .eq(
                    "id",
                    pdfId
                )
                .single();


        if (result.error) {

            throw new Error(
                result.error.message
            );

        }


        const signed =
            await supabaseClient
                .storage
                .from(
                    SUPABASE_BUCKET
                )
                .createSignedUrl(
                    result.data.file_path,
                    60 * 60
                );


        if (signed.error) {

            throw new Error(
                signed.error.message
            );

        }


        const link =
            document.createElement(
                "a"
            );

        link.href =
            signed.data.signedUrl;

        link.target =
            "_blank";

        link.rel =
            "noopener noreferrer";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        playSound(
            "download"
        );


    } catch (error) {

        console.error(
            "Could not open PDF:",
            error
        );

        alert(
            "Could not open this PDF.\n\n" +
            explainSupabaseError(
                error
            )
        );

    }

}


/* =========================================================
   REMOVE SHARED PDF
========================================================= */

async function removePDF(
    pdfId
) {

    if (!requireSupabase()) {
        return;
    }


    try {

        const result =
            await supabaseClient
                .from("pdfs")
                .select(
                    "id,name,file_path"
                )
                .eq(
                    "id",
                    pdfId
                )
                .single();


        if (result.error) {

            throw new Error(
                result.error.message
            );

        }


        const confirmed =
            confirm(
                `Remove "${result.data.name}" from the shared library?`
            );


        if (!confirmed) {
            return;
        }


        const storageResult =
            await supabaseClient
                .storage
                .from(
                    SUPABASE_BUCKET
                )
                .remove([
                    result.data.file_path
                ]);


        if (storageResult.error) {

            throw new Error(
                storageResult.error.message
            );

        }


        const deleteResult =
            await supabaseClient
                .from("pdfs")
                .delete()
                .eq(
                    "id",
                    pdfId
                );


        if (deleteResult.error) {

            throw new Error(
                deleteResult.error.message
            );

        }


        await renderPDFs();

        playSound(
            "delete"
        );

        showToast(
            "PDF removed from the shared library."
        );


    } catch (error) {

        console.error(
            "Could not remove PDF:",
            error
        );

        alert(
            "Could not remove this PDF.\n\n" +
            explainSupabaseError(
                error
            )
        );

    }

}


/* =========================================================
   ADD SUBJECT MODAL
========================================================= */

function openAddSubject() {

    const modal =
        document.getElementById(
            "subjectModal"
        );

    if (!modal) {
        return;
    }


    modal.classList.add(
        "show"
    );


    setTimeout(
        function () {

            const input =
                document.getElementById(
                    "subjectEnglish"
                );

            if (input) {
                input.focus();
            }

        },
        100
    );


    playSound(
        "modal"
    );

}


function closeSubjectModal(
    event
) {

    const modal =
        document.getElementById(
            "subjectModal"
        );

    if (!modal) {
        return;
    }


    if (
        event &&
        event.target !== modal
    ) {
        return;
    }


    modal.classList.remove(
        "show"
    );

}


function selectSubjectIcon(
    icon
) {

    selectedSubjectIcon =
        icon;

    playSound(
        "click"
    );

}


function addSubject() {

    const englishInput =
        document.getElementById(
            "subjectEnglish"
        );

    const bengaliInput =
        document.getElementById(
            "subjectBengali"
        );


    const english =
        englishInput
            ? englishInput.value.trim()
            : "";


    const bengali =
        bengaliInput
            ? bengaliInput.value.trim()
            : "";


    if (!english) {

        alert(
            "Enter the English subject name."
        );

        return;

    }


    if (!bengali) {

        alert(
            "Enter the Bengali subject name."
        );

        return;

    }


    const duplicate =
        subjects.some(
            function (subject) {

                return (
                    subject.english
                        .toLowerCase()
                    ===
                    english
                        .toLowerCase()
                );

            }
        );


    if (duplicate) {

        alert(
            "This subject already exists."
        );

        return;

    }


    const id =
        english
            .toLowerCase()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-|-$/g,
                ""
            )
            +
            "-"
            +
            Date.now();


    subjects.push({

        id: id,

        english: english,

        bengali: bengali,

        short:
            "Custom study subject",

        icon:
            selectedSubjectIcon,

        custom:
            true

    });


    saveSubjects();

    createSubjectCards();

    updateSubjectCounters();


    if (englishInput) {
        englishInput.value = "";
    }

    if (bengaliInput) {
        bengaliInput.value = "";
    }


    closeSubjectModal();

    showSubjects();

    playSound(
        "success"
    );

    showToast(
        `${english} added to your library.`
    );

}


/* =========================================================
   REMOVE SUBJECT
========================================================= */

function removeSubject(
    subjectId
) {

    const subject =
        subjects.find(
            function (item) {
                return item.id === subjectId;
            }
        );


    if (!subject) {
        return;
    }


    if (!subject.custom) {

        alert(
            "Default subjects cannot be removed."
        );

        return;

    }


    const confirmed =
        confirm(
            `Remove "${subject.english}" from this browser?\n\nCloud PDFs are not automatically deleted by this action.`
        );


    if (!confirmed) {
        return;
    }


    subjects =
        subjects.filter(
            function (item) {
                return item.id !== subjectId;
            }
        );


    saveSubjects();

    createSubjectCards();

    updateSubjectCounters();

    playSound(
        "delete"
    );

    showToast(
        "Subject removed from this browser."
    );

}


/* =========================================================
   MOBILE MENU
========================================================= */

function toggleMobileMenu() {

    const menu =
        document.getElementById(
            "mobileMenu"
        );

    if (menu) {

        menu.classList.toggle(
            "show"
        );

    }

}


/* =========================================================
   SOUND
========================================================= */

function toggleSound() {

    soundEnabled =
        !soundEnabled;


    const button =
        document.getElementById(
            "soundToggle"
        );


    if (button) {

        button.textContent =
            soundEnabled
                ? "🔊"
                : "🔇";

    }


    if (soundEnabled) {

        playSound(
            "success"
        );

    }

}


function getAudioContext() {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

    return audioContext;

}


function beep(
    frequency,
    duration,
    type = "sine",
    volume = 0.04
) {

    if (!soundEnabled) {
        return;
    }


    try {

        const ctx =
            getAudioContext();


        const oscillator =
            ctx.createOscillator();


        const gain =
            ctx.createGain();


        oscillator.type =
            type;


        oscillator.frequency.value =
            frequency;


        gain.gain.setValueAtTime(
            volume,
            ctx.currentTime
        );


        gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime +
            duration
        );


        oscillator.connect(
            gain
        );

        gain.connect(
            ctx.destination
        );


        oscillator.start();

        oscillator.stop(
            ctx.currentTime +
            duration
        );


    } catch (error) {

        console.log(
            "Audio unavailable."
        );

    }

}


function playSound(
    type
) {

    if (!soundEnabled) {
        return;
    }


    switch (type) {

        case "click":

            beep(
                620,
                0.05,
                "sine",
                0.025
            );

            break;


        case "page":

            beep(
                420,
                0.06,
                "sine",
                0.018
            );

            break;


        case "language":

            beep(
                520,
                0.07,
                "triangle",
                0.022
            );

            break;


        case "bengali":

            beep(
                480,
                0.07,
                "triangle",
                0.022
            );

            setTimeout(
                function () {

                    beep(
                        680,
                        0.09,
                        "triangle",
                        0.02
                    );

                },
                70
            );

            break;


        case "english":

            beep(
                560,
                0.07,
                "triangle",
                0.022
            );

            setTimeout(
                function () {

                    beep(
                        760,
                        0.09,
                        "triangle",
                        0.02
                    );

                },
                70
            );

            break;


        case "upload":

            beep(
                500,
                0.08,
                "sine",
                0.03
            );

            setTimeout(
                function () {

                    beep(
                        760,
                        0.12,
                        "sine",
                        0.03
                    );

                },
                80
            );

            break;


        case "download":

            beep(
                650,
                0.07,
                "sine",
                0.025
            );

            setTimeout(
                function () {

                    beep(
                        850,
                        0.1,
                        "sine",
                        0.02
                    );

                },
                70
            );

            break;


        case "delete":

            beep(
                260,
                0.13,
                "sawtooth",
                0.025
            );

            break;


        case "modal":

            beep(
                500,
                0.08,
                "triangle",
                0.025
            );

            break;


        case "success":

            beep(
                500,
                0.08,
                "sine",
                0.035
            );

            setTimeout(
                function () {

                    beep(
                        720,
                        0.12,
                        "sine",
                        0.035
                    );

                },
                80
            );

            break;


        default:

            beep(
                600,
                0.06
            );

    }

}


/* =========================================================
   TOAST
========================================================= */

function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );

    const messageElement =
        document.getElementById(
            "toastMessage"
        );


    if (
        !toast ||
        !messageElement
    ) {
        return;
    }


    messageElement.textContent =
        message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   ERROR HANDLING
========================================================= */

function showPDFError(
    message
) {

    const list =
        document.getElementById(
            "pdfList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `

<div class="empty-state">

    <div class="empty-icon">
        !
    </div>

    <h3>
        Cloud library unavailable
    </h3>

    <p>
        ${escapeHTML(message)}
    </p>

</div>

`;

}


function explainSupabaseError(
    error
) {

    const message =
        String(
            error &&
            error.message
                ? error.message
                : error ||
                  "Unknown error"
        );


    if (
        /row-level security|permission denied|not authorized/i
            .test(message)
    ) {

        return (
            "Supabase security policies are blocking this action. " +
            "We need to add the BlueVault database and Storage policies."
        );

    }


    if (
        /bucket|object/i.test(
            message
        )
    ) {

        return (
            "Check that the Storage bucket is named exactly bluevault-pdfs."
        );

    }


    if (
        /network|fetch|failed to fetch/i
            .test(message)
    ) {

        return (
            "Check your internet connection and make sure the Supabase project is online."
        );

    }


    return message;

}


/* =========================================================
   FILE HELPERS
========================================================= */

function formatFileSize(
    bytes
) {

    if (
        !bytes ||
        bytes <= 0
    ) {

        return "0 KB";

    }


    const units = [
        "Bytes",
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


    return (
        Math.round(
            (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ) * 100
        ) / 100
        +
        " "
        +
        units[index]
    );

}


function formatDate(
    dateString
) {

    if (!dateString) {
        return "Unknown date";
    }


    const date =
        new Date(
            dateString
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Unknown date";

    }


    return date.toLocaleDateString(
        undefined,
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


/* =========================================================
   ESCAPING
========================================================= */

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


function escapeAttribute(
    value
) {

    return String(value)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        );

}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

function setupKeyboardShortcuts() {

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeSubjectModal();

            }


            if (
                (
                    event.ctrlKey ||
                    event.metaKey
                )
                &&
                event.key.toLowerCase()
                ===
                "k"
            ) {

                event.preventDefault();


                const subjectSearch =
                    document.getElementById(
                        "subjectSearch"
                    );


                const pdfSearch =
                    document.getElementById(
                        "pdfSearch"
                    );


                const subjectsPage =
                    document.getElementById(
                        "subjectsPage"
                    );


                const pdfPage =
                    document.getElementById(
                        "pdfPage"
                    );


                if (
                    subjectsPage &&
                    subjectsPage.classList.contains(
                        "active"
                    )
                ) {

                    if (subjectSearch) {
                        subjectSearch.focus();
                    }

                }
                else if (
                    pdfPage &&
                    pdfPage.classList.contains(
                        "active"
                    )
                ) {

                    if (pdfSearch) {
                        pdfSearch.focus();
                    }

                }

            }

        }
    );

}


/* =========================================================
   SOFT 3D MOUSE INTERACTION
========================================================= */

(function setupSoft3D() {

    if (
        window.matchMedia &&
        window.matchMedia(
            "(pointer: coarse)"
        ).matches
    ) {

        return;

    }


    let mouseX = 0;

    let mouseY = 0;

    let raf = null;


    function updateHero() {

        raf = null;


        const hero =
            document.querySelector(
                ".hero"
            );


        if (!hero) {
            return;
        }


        const rotateX =
            mouseY * -2;


        const rotateY =
            mouseX * 2;


        hero.style.setProperty(
            "--mouse-x",
            `${mouseX * 18}px`
        );


        hero.style.setProperty(
            "--mouse-y",
            `${mouseY * 18}px`
        );


        hero.style.setProperty(
            "--hero-rx",
            `${rotateX}deg`
        );


        hero.style.setProperty(
            "--hero-ry",
            `${rotateY}deg`
        );

    }


    document.addEventListener(
        "mousemove",
        function (event) {

            mouseX =
                event.clientX /
                window.innerWidth -
                0.5;


            mouseY =
                event.clientY /
                window.innerHeight -
                0.5;


            if (!raf) {

                raf =
                    requestAnimationFrame(
                        updateHero
                    );

            }

        }
    );


    document.addEventListener(
        "mouseleave",
        function () {

            mouseX = 0;

            mouseY = 0;


            if (!raf) {

                raf =
                    requestAnimationFrame(
                        updateHero
                    );

            }

        }
    );

})();   
