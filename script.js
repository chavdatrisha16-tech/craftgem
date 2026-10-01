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
// LOGIN
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("CraftGem website loaded successfully.");

    const loginForm =
        document.getElementById("loginForm");


    // -------------------------------------------------
    // LOGIN FORM EXISTS
    // -------------------------------------------------

    if (!loginForm) {
        return;
    }


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // -------------------------------------------------
            // GET LOGIN VALUES
            // -------------------------------------------------

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

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


                // -------------------------------------------------
                // LOGIN ERROR
                // -------------------------------------------------

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


                // -------------------------------------------------
                // USER CHECK
                // -------------------------------------------------

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
                            "user_type, full_name"
                        )
                        .eq("id", user.id)
                        .single();


                // -------------------------------------------------
                // PROFILE ERROR
                // -------------------------------------------------

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
                    "Profile:",
                    profile
                );


                // =================================================
                // SAVE LOGIN INFORMATION
                // =================================================

                localStorage.setItem(
                    "craftgem_user_type",
                    profile.user_type
                );

                localStorage.setItem(
                    "craftgem_user_name",
                    profile.full_name
                );

                localStorage.setItem(
                    "craftgem_user_id",
                    user.id
                );


                // =================================================
                // REDIRECT
                // =================================================

                if (
                    profile.user_type ===
                    "artisan"
                ) {

                    console.log(
                        "Redirecting to artisan dashboard..."
                    );

                    window.location.href =
                        "artisan-dashboard.html";

                } else {

                    console.log(
                        "Redirecting to home page..."
                    );

                    window.location.href =
                        "index.html";

                }


            } catch (error) {

                console.error(
                    "Unexpected Login Error:",
                    error
                );

                alert(
                    "Something went wrong. Please try again."
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
