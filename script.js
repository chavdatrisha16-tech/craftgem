const SUPABASE_URL = "https://tsgrrnivmaujjteavgkf.supabase.co";
const SUPABASE_KEY = "sb_publishable_1b5y0mhKKjobcvFzXHIHOQ_vco2_Ldl";

window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ===============================
// CATEGORY FUNCTION
// ===============================
function openCategory(category) {
    alert("You selected: " + category);
}


// ===============================
// REGISTER
// ===============================
document.addEventListener("DOMContentLoaded", function () {

    console.log("Hidden Gems website loaded successfully!");

    const registerForm = document.getElementById("registerForm");

    if (registerForm) {

        registerForm.addEventListener("submit", async function (e) {

            e.preventDefault();

            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const phone = document.getElementById("phone").value.trim();
            const location = document.getElementById("location").value.trim();
            const role = document.getElementById("role").value;
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            // Password check
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }

            if (password.length < 6) {
                alert("Password must be at least 6 characters.");
                return;
            }

            try {

                // Create Supabase Auth account
                const { data, error } =
                    await window.supabaseClient.auth.signUp({
                        email: email,
                        password: password,
                        options: {
                            data: {
                                full_name: name,
                                phone: phone,
                                location: location,
                                role: role
                            }
                        }
                    });

                if (error) {
                    console.error("Signup error:", error);
                    alert("Registration failed: " + error.message);
                    return;
                }

                console.log("Auth user created:", data.user);

                // Save artisan profile
                if (role === "artisan" && data.user) {

                    const { error: artisanError } =
                        await window.supabaseClient
                            .from("artisans")
                            .insert([
                                {
                                    user_id: data.user.id,
                                    full_name: name,
                                    email: email,
                                    phone: phone,
                                    location: location,
                                    role: role
                                }
                            ]);

                    if (artisanError) {
                        console.error(
                            "Artisan profile error:",
                            artisanError
                        );

                        alert(
                            "Account created, but artisan profile could not be saved: " +
                            artisanError.message
                        );

                        return;
                    }
                }

                alert("Account created successfully!");

                window.location.href = "login.html";

            } catch (err) {

                console.error("Unexpected error:", err);
                alert("Something went wrong. Please try again.");

            }

        });
    }

});

console.log("Supabase connected:", window.supabaseClient);
