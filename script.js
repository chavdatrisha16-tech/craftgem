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


    // =====================================================
    // IF LOGIN FORM DOES NOT EXIST
    // =====================================================

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
                // REDIRECT
                // =================================================
                //
                // IMPORTANT:
                // artisan-dashboard.html does NOT exist yet.
                //
                // So BOTH User and Artisan are temporarily
                // redirected to the existing Home page.
                //
                // We will create the Artisan Dashboard later.
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
