////////////////////////////////////////////////////////////
// CRAFTGEM - MAIN SCRIPT.JS
////////////////////////////////////////////////////////////


// ==========================================================
// SUPABASE CONFIGURATION
// ==========================================================

const SUPABASE_URL =
    "https://tsgrrnivmaujjteavgkf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_1b5y0mhKKjobcvFzXHIHOQ_vco2_Ldl";


// Create only one Supabase client
if (!window.supabaseClient) {
    window.supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );
}

const supabaseClient = window.supabaseClient;


// ==========================================================
// HELPER - ESCAPE HTML
// ==========================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================================
// SAVE PAGE USER WANTED TO VISIT
// ==========================================================

function saveRedirectPage(destination) {

    if (!destination) {
        destination = "index.html";
    }

    sessionStorage.setItem(
        "craftgem_redirect_after_login",
        destination
    );
}


// ==========================================================
// GET SAVED REDIRECT PAGE
// ==========================================================

function getRedirectPage() {

    const destination =
        sessionStorage.getItem(
            "craftgem_redirect_after_login"
        );

    if (destination) {

        sessionStorage.removeItem(
            "craftgem_redirect_after_login"
        );

        return destination;
    }

    return "index.html";
}


// ==========================================================
// REQUIRE LOGIN
// ==========================================================

async function requireLogin(destination) {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    // User is already logged in
    if (session) {

        if (destination) {
            window.location.href = destination;
        }

        return true;
    }


    // User is not logged in
    saveRedirectPage(destination);

    window.location.href = "login.html";

    return false;
}


// Make function available to HTML onclick
window.requireLogin = requireLogin;


// ==========================================================
// PROTECTED LINKS
// ==========================================================

function setupProtectedLinks() {

    const protectedPages = [

        "artisans.html",
        "artisan-profile.html",
        "contact.html",
        "knowledge.html",
        "categories.html",
        "products.html",
        "artisan-dashboard.html"

    ];


    const links =
        document.querySelectorAll("a[href]");


    links.forEach(link => {

        const href =
            link.getAttribute("href");


        if (!href) {
            return;
        }


        // Ignore external links
        if (
            href.startsWith("http://") ||
            href.startsWith("https://") ||
            href.startsWith("#") ||
            href.startsWith("mailto:")
        ) {
            return;
        }


        const cleanHref =
            href.split("#")[0];


        if (
            protectedPages.includes(
                cleanHref
            )
        ) {

            link.addEventListener(
                "click",
                async function(event) {

                    event.preventDefault();

                    await requireLogin(
                        href
                    );

                }
            );

        }

    });

}


// ==========================================================
// CATEGORY CLICK
// ==========================================================

function openCategory(category) {

    /*
     * Category cards from Home page.
     *
     * We save the selected category so that
     * artisans.html can use it later.
     */

    sessionStorage.setItem(
        "craftgem_selected_category",
        category
    );


    requireLogin(
        "artisans.html"
    );
}

window.openCategory = openCategory;


// ==========================================================
// UPDATE NAVBAR
// ==========================================================

async function updateNavbar() {

    const navButtons =
        document.querySelector(
            ".nav-buttons"
        );


    if (!navButtons) {
        return;
    }


    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    // ======================================================
    // LOGGED OUT
    // ======================================================

    if (!session) {

        navButtons.innerHTML = `

            <a
                href="login.html"
                class="login-btn"
            >
                Login
            </a>

            <a
                href="register.html"
                class="register-btn"
            >
                Register
            </a>

        `;

        return;
    }


    // ======================================================
    // LOGGED IN
    // ======================================================

    const user =
        session.user;


    let profile = null;


    try {

        const {
            data,
            error
        } = await supabaseClient
            .from("profiles")
            .select(
                "id, full_name, email, phone, location, user_type"
            )
            .eq(
                "id",
                user.id
            )
            .single();


        if (!error) {
            profile = data;
        }

    } catch (error) {

        console.error(
            "Profile fetch error:",
            error
        );

    }


    const userName =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email ||
        "User";


    const userType =
        profile?.user_type ||
        "user";


    // Save useful information locally

    localStorage.setItem(
        "craftgem_user_id",
        user.id
    );

    localStorage.setItem(
        "craftgem_user_email",
        user.email || ""
    );

    localStorage.setItem(
        "craftgem_user_name",
        userName
    );

    localStorage.setItem(
        "craftgem_user_type",
        userType
    );


    // ======================================================
    // ARTISAN DASHBOARD BUTTON
    // ======================================================

    let dashboardButton = "";


    if (userType === "artisan") {

        dashboardButton = `

            <a
                href="artisan-dashboard.html"
                class="dashboard-btn"
            >
                Dashboard
            </a>

        `;

    }


    // ======================================================
    // LOGGED-IN NAVBAR
    // ======================================================

    navButtons.innerHTML = `

        ${dashboardButton}

        <span class="welcome-text">
            Hi, ${escapeHtml(userName)}
        </span>

        <button
            type="button"
            class="logout-btn"
            id="craftgemLogoutBtn"
        >
            Logout
        </button>

    `;


    // ======================================================
    // LOGOUT
    // ======================================================

    const logoutButton =
        document.getElementById(
            "craftgemLogoutBtn"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async function() {

                logoutButton.disabled = true;

                logoutButton.textContent =
                    "Logging out...";


                const {
                    error
                } =
                    await supabaseClient.auth.signOut();


                if (error) {

                    console.error(
                        "Logout error:",
                        error
                    );

                    logoutButton.disabled =
                        false;

                    logoutButton.textContent =
                        "Logout";

                    return;
                }


                // Clear local information

                localStorage.removeItem(
                    "craftgem_user_id"
                );

                localStorage.removeItem(
                    "craftgem_user_email"
                );

                localStorage.removeItem(
                    "craftgem_user_name"
                );

                localStorage.removeItem(
                    "craftgem_user_type"
                );


                window.location.href =
                    "index.html";

            }
        );

    }

}


// ==========================================================
// LOGIN FORM
// ==========================================================

function setupLoginForm() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const emailInput =
                document.getElementById(
                    "email"
                );

            const passwordInput =
                document.getElementById(
                    "password"
                );


            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";


            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;
            }


            // Find common message element

            const messageElement =
                document.getElementById(
                    "loginMessage"
                );


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({

                            email: email,

                            password: password

                        });


                if (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    if (messageElement) {

                        messageElement.textContent =
                            error.message;

                    } else {

                        alert(
                            error.message
                        );

                    }

                    return;
                }


                const user =
                    data.user;


                // ==================================================
                // FETCH PROFILE
                // ==================================================

                let profile = null;


                const {
                    data: profileData
                } =
                    await supabaseClient
                        .from("profiles")
                        .select(
                            "id, full_name, email, phone, location, user_type"
                        )
                        .eq(
                            "id",
                            user.id
                        )
                        .single();


                profile =
                    profileData || null;


                const userName =
                    profile?.full_name ||
                    user.user_metadata?.full_name ||
                    user.email ||
                    "User";


                const userType =
                    profile?.user_type ||
                    "user";


                // ==================================================
                // SAVE LOGIN INFO
                // ==================================================

                localStorage.setItem(
                    "craftgem_user_id",
                    user.id
                );

                localStorage.setItem(
                    "craftgem_user_email",
                    user.email || ""
                );

                localStorage.setItem(
                    "craftgem_user_name",
                    userName
                );

                localStorage.setItem(
                    "craftgem_user_type",
                    userType
                );


                // ==================================================
                // REDIRECT TO ORIGINAL DESTINATION
                // ==================================================

                const destination =
                    getRedirectPage();


                window.location.href =
                    destination;

            } catch (error) {

                console.error(
                    "Unexpected login error:",
                    error
                );


                if (messageElement) {

                    messageElement.textContent =
                        "Something went wrong. Please try again.";

                } else {

                    alert(
                        "Something went wrong. Please try again."
                    );

                }

            }

        }
    );

}


// ==========================================================
// PAGE INITIALIZATION
// ==========================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        // Update navbar
        await updateNavbar();


        // Setup login
        setupLoginForm();


        // Setup protected links
        setupProtectedLinks();

    }
);
