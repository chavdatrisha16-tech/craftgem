// =====================================================
// CRAFTGEM - SCRIPT.JS
// =====================================================

const SUPABASE_URL =
    "https://tsgrrnivmaujjteavgkf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_1b5y0mhKKjobcvFzXHIHOQ_vco2_Ldl";


// Create Supabase client
const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(value) {

    if (!value) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// SAVE REDIRECT
// =====================================================

function saveRedirectPage(page) {

    sessionStorage.setItem(
        "craftgem_redirect_after_login",
        page
    );
}


// =====================================================
// GET REDIRECT
// =====================================================

function getRedirectPage() {

    const page =
        sessionStorage.getItem(
            "craftgem_redirect_after_login"
        );

    if (page) {

        sessionStorage.removeItem(
            "craftgem_redirect_after_login"
        );

        return page;
    }

    return "index.html";
}


// =====================================================
// REQUIRE LOGIN
// =====================================================

async function requireLogin(destination) {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    // Already logged in
    if (session) {

        window.location.href =
            destination;

        return;
    }


    // Not logged in
    saveRedirectPage(destination);

    alert("Login to continue");

    window.location.href =
        "login.html";
}


window.requireLogin =
    requireLogin;


// =====================================================
// CATEGORY CLICK
// =====================================================

function openCategory(category) {

    sessionStorage.setItem(
        "craftgem_selected_category",
        category
    );


    requireLogin(
        "artisans.html"
    );
}

window.openCategory =
    openCategory;


// =====================================================
// UPDATE NAVBAR
// =====================================================

async function updateNavbar() {

    const navButtons =
        document.querySelector(
            ".nav-buttons"
        );


    if (!navButtons) return;


    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    // =================================================
    // LOGGED OUT
    // =================================================

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


    // =================================================
    // LOGGED IN
    // =================================================

    const user =
        session.user;


    let profile = null;


    const {
        data
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


    profile = data;


    const name =
        profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email ||
        "User";


    const userType =
        profile?.user_type ||
        "user";


    // Save login information

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
        name
    );

    localStorage.setItem(
        "craftgem_user_type",
        userType
    );


    // =================================================
    // ARTISAN DASHBOARD
    // =================================================

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


    // =================================================
    // LOGGED-IN NAVBAR
    // =================================================

    navButtons.innerHTML = `

        ${dashboardButton}

        <span class="welcome-text">
            Hi, ${escapeHtml(name)}
        </span>

        <button
            type="button"
            class="logout-btn"
            id="craftgemLogoutBtn"
        >
            Logout
        </button>

    `;


    // =================================================
    // LOGOUT
    // =================================================

    const logoutButton =
        document.getElementById(
            "craftgemLogoutBtn"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            async function () {

                await supabaseClient.auth.signOut();


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


// =====================================================
// LOGIN
// =====================================================

function setupLoginForm() {

    const loginForm =
        document.getElementById(
            "loginForm"
        );


    if (!loginForm) return;


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("password")
                    .value;


            if (!email || !password) {

                alert(
                    "Please enter email and password."
                );

                return;
            }


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

                alert(
                    error.message
                );

                return;
            }


            const user =
                data.user;


            // Get profile

            const {
                data: profile
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


            const name =
                profile?.full_name ||
                user.email ||
                "User";


            const userType =
                profile?.user_type ||
                "user";


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
                name
            );

            localStorage.setItem(
                "craftgem_user_type",
                userType
            );


            // IMPORTANT:
            // Go back to the page the user originally wanted.

            const destination =
                getRedirectPage();


            window.location.href =
                destination;

        }
    );
}


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateNavbar();

        setupLoginForm();

    }
);
