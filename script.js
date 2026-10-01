// =====================================================
// CRAFTGEM - SUPABASE CONFIGURATION
// =====================================================

const SUPABASE_URL =
    "https://tsgrrnivmaujjteavgkf.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_1b5y0mhKKjobcvFzXHIHOQ_vco2_Ldl";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// =====================================================
// CATEGORY FUNCTION
// =====================================================

function openCategory(category) {

    console.log("Selected category:", category);

}


// =====================================================
// PAGE LOAD
// =====================================================

document.addEventListener("DOMContentLoaded", async function () {

    console.log("CraftGem website loaded successfully.");


    // =====================================================
    // CHECK CURRENT LOGIN SESSION
    // =====================================================

    await updateNavbar();


    // =====================================================
    // LOGIN FORM
    // =====================================================

    const loginForm =
        document.getElementById("loginForm");


    // If this page does not contain login form,
    // simply continue because it may be Home page.

    if (!loginForm) {
        return;
    }


    // =====================================================
    // LOGIN FORM SUBMIT
    // =====================================================

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // -------------------------------------------------
            // GET EMAIL
            // -------------------------------------------------

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            // -------------------------------------------------
            // GET PASSWORD
            // -------------------------------------------------

            const password =
                document
                    .getElementById("password")
                    .value;


            // -------------------------------------------------
            // VALIDATION
            // -------------------------------------------------

            if (!email || !password) {

                alert(
                    "Please enter your email and password."
                );

                return;
            }


            // -------------------------------------------------
            // LOGIN BUTTON
            // -------------------------------------------------

            const loginButton =
                loginForm.querySelector(
                    "button[type='submit']"
                );


            if (loginButton) {

                loginButton.disabled = true;

                loginButton.textContent =
                    "Logging in...";

            }


            try {

                // =================================================
                // SUPABASE LOGIN
                // =================================================

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signInWithPassword({

                        email: email,

                        password: password

                    });


                // =================================================
                // LOGIN ERROR
                // =================================================

                if (error) {

                    console.error(
                        "Login Error:",
                        error
                    );

                    alert(
                        "Login failed:\n\n" +
                        error.message
                    );

                    return;
                }


                // =================================================
                // USER CHECK
                // =================================================

                const user = data.user;


                if (!user) {

                    alert(
                        "Login failed. Please try again."
                    );

                    return;
                }


                console.log(
                    "Login successful:",
                    user
                );


                // =================================================
                // GET PROFILE
                // =================================================

                const {
                    data: profile,
                    error: profileError
                } =
                    await supabaseClient
                        .from("profiles")
                        .select(
                            "id, full_name, email, phone, location, user_type"
                        )
                        .eq("id", user.id)
                        .single();


                // =================================================
                // PROFILE ERROR
                // =================================================

                if (profileError) {

                    console.error(
                        "Profile Error:",
                        profileError
                    );

                    alert(
                        "Login successful, but your profile could not be loaded."
                    );

                    return;
                }


                console.log(
                    "Profile loaded:",
                    profile
                );


                // =================================================
                // SAVE USER DATA
                // =================================================

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
                    profile.full_name || ""
                );

                localStorage.setItem(
                    "craftgem_user_type",
                    profile.user_type || "user"
                );


                // =================================================
                // LOGIN SUCCESS
                // =================================================

                alert(
                    "Login successful! Welcome " +
                    (profile.full_name || "")
                );


                // =================================================
                // REDIRECT TO HOME
                // =================================================
                //
                // Dashboard abhi create nahi hua hai.
                // Isliye फिलहाल Home par redirect karenge.
                //
                // Dashboard banne ke baad:
                // Artisan → artisan-dashboard.html
                // User → index.html
                //
                // =================================================

                window.location.href =
                    "index.html";


            } catch (error) {

                console.error(
                    "Unexpected Login Error:",
                    error
                );

                alert(
                    "Something went wrong while logging in.\n\n" +
                    (error.message || "")
                );


            } finally {

                if (loginButton) {

                    loginButton.disabled = false;

                    loginButton.textContent =
                        "Login";

                }

            }

        }
    );

});


// =====================================================
// UPDATE NAVBAR
// =====================================================

async function updateNavbar() {

    try {

        const {
            data: {
                session
            }
        } =
            await supabaseClient.auth.getSession();


        const navButtons =
            document.querySelector(".nav-buttons");


        // If navbar does not exist on this page
        if (!navButtons) {
            return;
        }


        // =================================================
        // USER IS NOT LOGGED IN
        // =================================================

        if (!session) {

            navButtons.innerHTML = `
                <a href="login.html" class="login-btn">
                    Login
                </a>

                <a href="register.html" class="register-btn">
                    Register
                </a>
            `;

            return;
        }


        // =================================================
        // USER IS LOGGED IN
        // =================================================

        const user = session.user;


        // Get profile
        const {
            data: profile
        } =
            await supabaseClient
                .from("profiles")
                .select(
                    "full_name, user_type"
                )
                .eq("id", user.id)
                .single();


        const userName =
            profile?.full_name ||
            user.email ||
            "User";


        const userType =
            profile?.user_type ||
            "user";


        // Save current user information
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


        // =================================================
        // LOGGED-IN NAVBAR
        // =================================================

        let dashboardButton = "";


        // Dashboard link sirf Artisan ke liye
        // abhi dashboard file create nahi hui hai,
        // isliye ise temporarily hide rakhenge.

        if (userType === "artisan") {

            dashboardButton = `
                <a href="artisan-dashboard.html"
                   class="login-btn">
                    Dashboard
                </a>
            `;
        }


        navButtons.innerHTML = `

            ${dashboardButton}

            <span class="welcome-user">
                Hi, ${escapeHtml(userName)}
            </span>

            <button
                type="button"
                class="register-btn"
                id="logoutBtn">
                Logout
            </button>

        `;


        // =================================================
        // LOGOUT BUTTON
        // =================================================

        const logoutBtn =
            document.getElementById("logoutBtn");


        if (logoutBtn) {

            logoutBtn.addEventListener(
                "click",
                async function () {

                    logoutBtn.disabled = true;

                    logoutBtn.textContent =
                        "Logging out...";


                    const {
                        error
                    } =
                        await supabaseClient.auth.signOut();


                    if (error) {

                        console.error(
                            "Logout Error:",
                            error
                        );

                        alert(
                            "Logout failed:\n\n" +
                            error.message
                        );

                        logoutBtn.disabled = false;

                        logoutBtn.textContent =
                            "Logout";

                        return;
                    }


                    // Clear local storage
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


                    // Go to home
                    window.location.href =
                        "index.html";

                }
            );

        }


    } catch (error) {

        console.error(
            "Navbar session error:",
            error
        );

    }

}


// =====================================================
// ESCAPE HTML
// =====================================================

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
